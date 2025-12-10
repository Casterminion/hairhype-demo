import { useState, FormEvent } from 'react';
import { User, Phone, MessageSquare, Check } from 'lucide-react';

interface DetailsFormProps {
  serviceName: string;
  date: Date;
  time: string;
  onSubmit: (data: { name: string; phone: string; note?: string; consent: boolean }) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function DetailsForm({ serviceName, date, time, onSubmit, onBack, isLoading }: DetailsFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Įvesk vardą';
    }

    if (!phone.trim() || phone.trim().length < 8) {
      newErrors.phone = 'Įvesk galiojantį telefono numerį';
    }

    if (!consent) {
      newErrors.consent = 'Privalai sutikti su privatumo politika';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim() || undefined,
      consent
    });
  }

  function formatPhoneInput(value: string): string {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.startsWith('370')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('8') && cleaned.length > 1) {
      return '+370' + cleaned.substring(1);
    } else if (!cleaned.startsWith('3')) {
      return '+370' + cleaned;
    }

    return cleaned ? '+' + cleaned : '';
  }

  return (
    <div className="space-y-5 pb-4">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium disabled:opacity-50"
      >
        ← Grįžti
      </button>

      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Tavo duomenys
        </h2>
        <p className="text-sm text-gray-600">Vienas žingsnis iki patvirtinimo</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Rezervuoji:</p>
        <p className="font-semibold text-sm text-gray-900">{serviceName}</p>
        <p className="text-xs text-gray-600 mt-1.5 capitalize">
          {date.toLocaleDateString('lt-LT', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })} • {time}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-xs font-medium text-gray-900 mb-1.5">
            Vardas *
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className={`
                w-full pl-10 pr-3 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm
                bg-white text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                disabled:bg-gray-50 disabled:cursor-not-allowed
                ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}
              `}
              placeholder="Kuo Jūs vardu?"
              required
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="block text-xs font-medium text-gray-900 mb-1.5">
            Telefono numeris *
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              disabled={isLoading}
              className={`
                w-full pl-10 pr-3 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm
                bg-white text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                disabled:bg-gray-50 disabled:cursor-not-allowed
                ${errors.phone ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}
              `}
              placeholder="+370 6XX XXXXX"
              required
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="note" className="block text-xs font-medium text-gray-900 mb-1.5">
            Pastabos (neprivaloma)
          </label>
          <div className="relative">
            <MessageSquare size={16} className="absolute left-3 top-3 text-gray-500" />
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
              rows={2}
              maxLength={500}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-gray-900 transition-all duration-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
              placeholder="Ar yra ką nors, ką turėtume žinoti?"
            />
          </div>
        </div>

        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={isLoading}
                className="w-5 h-5 rounded border-2 border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
              />
              {consent && (
                <Check size={14} className="absolute text-white pointer-events-none" />
              )}
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              Sutinku su{' '}
              <a
                href="/privatumas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 underline hover:text-gray-700"
              >
                privatumo politika
              </a>
            </span>
          </label>
          {errors.consent && <p className="text-sm text-red-500 mt-1">{errors.consent}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:scale-[1.02] transform"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2 text-sm">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Rezervuojama...
            </span>
          ) : (
            'Rezervuoti'
          )}
        </button>
      </form>
    </div>
  );
}
