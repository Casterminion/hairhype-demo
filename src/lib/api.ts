import { supabase } from './supabase';
import { generateServiceSlots, checkSlotAvailable } from './slots';
import { z } from 'zod';
import { parsePhoneNumber } from 'libphonenumber-js';
import { addMinutes } from 'date-fns';

const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  startISO: z.string().datetime(),
  name: z.string().min(2, 'Įvesk vardą').max(100),
  phone: z.string().min(8, 'Įvesk galiojantį telefono numerį'),
  note: z.string().max(500).optional(),
  honeypot: z.string().max(0).optional()
});

export type BookingInput = z.infer<typeof bookingSchema>;

export async function getAvailableSlots(serviceId: string, date: Date): Promise<string[]> {
  const { data: service } = await supabase
    .from('services')
    .select('duration_min, is_active')
    .eq('id', serviceId)
    .eq('is_active', true)
    .maybeSingle();

  if (!service) {
    throw new Error('Service not found');
  }

  return generateServiceSlots(date, service.duration_min);
}

export async function createBooking(input: BookingInput) {
  const validated = bookingSchema.parse(input);

  if (validated.honeypot) {
    throw new Error('Invalid request');
  }

  let phoneE164: string;
  try {
    const phoneNumber = parsePhoneNumber(validated.phone, 'LT');
    if (!phoneNumber.isValid()) {
      throw new Error('Įvesk galiojantį telefono numerį');
    }
    phoneE164 = phoneNumber.number;
  } catch {
    throw new Error('Įvesk galiojantį telefono numerį');
  }

  const { data: service } = await supabase
    .from('services')
    .select('duration_min, name, price_eur')
    .eq('id', validated.serviceId)
    .eq('is_active', true)
    .maybeSingle();

  if (!service) {
    throw new Error('Paslauga nerasta');
  }

  const startUTC = new Date(validated.startISO);
  const endUTC = addMinutes(startUTC, service.duration_min);

  const isAvailable = await checkSlotAvailable(startUTC, endUTC);
  if (!isAvailable) {
    throw new Error('Deja, šis laikas ką tik rezervuotas. Pasirinkite kitą.');
  }

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone_e164', phoneE164)
    .maybeSingle();

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: validated.name,
        phone_e164: phoneE164
      })
      .select('id')
      .single();

    if (customerError || !newCustomer) {
      console.error('Customer creation error:', customerError);
      throw new Error('Nepavyko sukurti kliento');
    }

    customerId = newCustomer.id;
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      service_id: validated.serviceId,
      customer_id: customerId,
      start_time_utc: startUTC.toISOString(),
      end_time_utc: endUTC.toISOString(),
      status: 'confirmed',
      created_via: 'web',
      notes: validated.note || null
    })
    .select('id, manage_token')
    .single();

  if (bookingError || !booking) {
    console.error('Booking creation error:', bookingError);
    if (bookingError?.code === '23505') {
      throw new Error('Deja, šis laikas ką tik rezervuotas. Pasirinkite kitą.');
    }
    throw new Error('Nepavyko sukurti rezervacijos');
  }

  const { data: verifyBooking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', booking.id)
    .eq('status', 'confirmed')
    .maybeSingle();

  if (!verifyBooking) {
    console.error('Booking verification failed for ID:', booking.id);
    throw new Error('Rezervacija nepatvirtinta. Bandykite dar kartą.');
  }

  await supabase
    .from('booking_logs')
    .insert({
      booking_id: booking.id,
      action: 'booking_created',
      details: {
        service: service.name,
        customer_phone: phoneE164,
        start_time: startUTC.toISOString(),
        source: 'web'
      }
    });

  return {
    bookingId: booking.id,
    manageToken: booking.manage_token,
    service: service.name,
    customerName: validated.name,
    customerPhone: validated.phone,
    startTime: startUTC,
    endTime: endUTC
  };
}
