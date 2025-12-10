import { supabase } from './supabase';
import {
  createVilniusDateTime,
  formatVilniusDate,
  getWeekdayIndex,
  minutesToTimeString,
  parseTimeToMinutes,
  startOfDayVilnius,
  endOfDayVilnius,
  VILNIUS_TZ
} from './time';
import { addMinutes, isWithinInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface EffectiveHours {
  start: string;
  end: string;
}

interface Booking {
  startUTC: Date;
  endUTC: Date;
}

export async function getEffectiveHours(date: Date): Promise<EffectiveHours | null> {
  const dateStr = formatVilniusDate(date);

  const { data: override } = await supabase
    .from('date_overrides')
    .select('kind, start_time, end_time')
    .eq('date', dateStr)
    .maybeSingle();

  if (override) {
    if (override.kind === 'closed') {
      return null;
    }
    return {
      start: override.start_time!,
      end: override.end_time!
    };
  }

  const weekday = getWeekdayIndex(date);

  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('start_time, end_time')
    .eq('weekday', weekday)
    .eq('is_active', true)
    .maybeSingle();

  if (!workingHours) {
    return null;
  }

  return {
    start: workingHours.start_time,
    end: workingHours.end_time
  };
}

export async function listExistingBookings(date: Date): Promise<Booking[]> {
  const dayStart = startOfDayVilnius(date);
  const dayEnd = endOfDayVilnius(date);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time_utc, end_time_utc')
    .eq('status', 'confirmed')
    .gte('start_time_utc', dayStart.toISOString())
    .lte('start_time_utc', dayEnd.toISOString());

  if (!bookings) {
    return [];
  }

  return bookings.map(b => ({
    startUTC: new Date(b.start_time_utc),
    endUTC: new Date(b.end_time_utc)
  }));
}

export async function generateServiceSlots(
  date: Date,
  serviceDurationMin: number
): Promise<string[]> {
  const dateStr = formatVilniusDate(date);
  const todayStr = formatVilniusDate(new Date());

  // Disable same-day bookings
  if (dateStr === todayStr) {
    console.log(`[Slots] ${dateStr}: Same-day bookings disabled`);
    return [];
  }

  const effectiveHours = await getEffectiveHours(date);

  if (!effectiveHours) {
    console.log(`[Slots] ${dateStr}: No working hours`);
    return [];
  }

  const startMin = parseTimeToMinutes(effectiveHours.start);
  const endMin = parseTimeToMinutes(effectiveHours.end);

  const SLOT_INTERVAL = 15;
  const candidateSlots: Date[] = [];
  let currentMin = startMin;

  while (currentMin + serviceDurationMin <= endMin) {
    const timeStr = minutesToTimeString(currentMin);
    const slotStartUTC = createVilniusDateTime(dateStr, timeStr);
    candidateSlots.push(slotStartUTC);
    currentMin += SLOT_INTERVAL;
  }

  const nowUTC = new Date();
  const oneHourFromNowUTC = addMinutes(nowUTC, 60);
  const selectedDateStr = formatVilniusDate(date);
  const isToday = selectedDateStr === todayStr;

  console.log(`[Slots] ${dateStr}: candidate=${candidateSlots.length}, isToday=${isToday}, today=${todayStr}, bufferTime=${oneHourFromNowUTC.toISOString()}`);

  const timeFilteredSlots = candidateSlots.filter(slotStart => {
    if (isToday) {
      return slotStart >= oneHourFromNowUTC;
    }
    return true;
  });

  console.log(`[Slots] ${dateStr}: After time filter=${timeFilteredSlots.length}`);

  const existingBookings = await listExistingBookings(date);
  console.log(`[Slots] ${dateStr}: Existing bookings=${existingBookings.length}`);

  const availableSlots = timeFilteredSlots.filter(slotStart => {
    const slotEnd = addMinutes(slotStart, serviceDurationMin);

    return !existingBookings.some(booking => {
      const overlaps = (
        (slotStart >= booking.startUTC && slotStart < booking.endUTC) ||
        (slotEnd > booking.startUTC && slotEnd <= booking.endUTC) ||
        (slotStart <= booking.startUTC && slotEnd >= booking.endUTC)
      );
      return overlaps;
    });
  });

  console.log(`[Slots] ${dateStr}: Available slots=${availableSlots.length}`);

  return availableSlots.map(slot => slot.toISOString());
}

export async function checkSlotAvailable(
  startUTC: Date,
  endUTC: Date
): Promise<boolean> {
  const { data: conflicting } = await supabase
    .from('bookings')
    .select('id')
    .eq('status', 'confirmed')
    .or(`and(start_time_utc.lt.${endUTC.toISOString()},end_time_utc.gt.${startUTC.toISOString()})`)
    .limit(1);

  return !conflicting || conflicting.length === 0;
}
