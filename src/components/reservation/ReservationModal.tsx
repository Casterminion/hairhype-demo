import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ServicePicker from './ServicePicker';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import DetailsForm from './DetailsForm';
import ConfirmView from './ConfirmView';
import { createBooking } from '../../lib/api';
import { formatVilniusTime } from '../../lib/time';

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price_eur: number;
  description: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'service' | 'date' | 'time' | 'details' | 'confirm';

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeISO, setSelectedTimeISO] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      resetFlow();
    }
  }, [isOpen]);

  function resetFlow() {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTimeISO(null);
    setError(null);
    setBookingResult(null);
  }

  function handleClose() {
    if (!isLoading && step !== 'confirm') {
      onClose();
    }
  }

  function handleServiceSelect(service: Service) {
    setSelectedService(service);
    setStep('date');
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setStep('time');
  }

  function handleTimeSelect(timeISO: string) {
    setSelectedTimeISO(timeISO);
    setStep('details');
  }

  async function handleDetailsSubmit(data: { name: string; phone: string; note?: string }) {
    if (!selectedService || !selectedTimeISO) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await createBooking({
        serviceId: selectedService.id,
        startISO: selectedTimeISO,
        name: data.name,
        phone: data.phone,
        note: data.note,
        honeypot: ''
      });

      if (!result.bookingId) {
        throw new Error('Nepavyko sukurti rezervacijos');
      }

      setBookingResult(result);
      setStep('confirm');

      try {
        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-to-make`;
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            bookingId: result.bookingId,
            service: result.service,
            customerName: result.customerName,
            customerPhone: result.customerPhone,
            startTime: result.startTime,
            endTime: result.endTime
          })
        });

        if (!webhookResponse.ok) {
          const errorData = await webhookResponse.json();
          console.error('Webhook failed:', errorData);
        }
      } catch (webhookError) {
        console.error('Failed to send notification:', webhookError);
      }

    } catch (err: any) {
      setError(err.message || 'Įvyko klaida. Bandyk dar kartą.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleConfirmComplete() {
    onClose();
    resetFlow();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 overflow-hidden animate-fadeIn"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="relative bg-white w-full md:max-w-5xl md:my-8 flex flex-col h-[95vh] md:h-auto md:max-h-[calc(100vh-4rem)] overflow-hidden md:rounded-3xl rounded-t-3xl shadow-2xl animate-slideUp md:animate-zoomIn">
        {step !== 'confirm' && (
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 hover:shadow-lg transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Uždaryti"
          >
            <X size={24} className="text-gray-900" />
          </button>
        )}

        <div className="pt-4 px-6 pb-4 md:pt-5 md:px-8 md:pb-5 lg:pt-6 lg:px-10 lg:pb-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {step === 'service' && (
            <ServicePicker onSelect={handleServiceSelect} />
          )}

          {step === 'date' && selectedService && (
            <DatePicker
              onSelect={handleDateSelect}
              onBack={() => setStep('service')}
              serviceDurationMin={selectedService.duration_min}
            />
          )}

          {step === 'time' && selectedService && selectedDate && (
            <TimePicker
              serviceId={selectedService.id}
              serviceName={selectedService.name}
              date={selectedDate}
              onSelect={handleTimeSelect}
              onBack={() => setStep('date')}
            />
          )}

          {step === 'details' && selectedService && selectedDate && selectedTimeISO && (
            <DetailsForm
              serviceName={selectedService.name}
              date={selectedDate}
              time={formatVilniusTime(new Date(selectedTimeISO))}
              onSubmit={handleDetailsSubmit}
              onBack={() => setStep('time')}
              isLoading={isLoading}
            />
          )}

          {step === 'confirm' && bookingResult && (
            <ConfirmView
              serviceName={bookingResult.service}
              startTime={new Date(bookingResult.startTime)}
              customerName="Klientas"
              onComplete={handleConfirmComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
