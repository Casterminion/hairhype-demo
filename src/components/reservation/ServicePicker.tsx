import { useEffect, useState } from 'react';
import { Clock, Euro } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price_eur: number;
  description: string;
}

interface ServicePickerProps {
  onSelect: (service: Service) => void;
}

export default function ServicePicker({ onSelect }: ServicePickerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const { data } = await supabase
      .from('services')
      .select('id, name, duration_min, price_eur, description')
      .eq('is_active', true)
      .order('sort_order');

    if (data) {
      setServices(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Pasirink paslaugą
        </h2>
        <p className="text-sm text-gray-600">Rinkis tai, kas tinka tavo stiliui</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className="group relative bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transform hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-lg font-serif text-gray-900 group-hover:text-gray-700 transition-colors flex-1">
                {service.name}
              </h3>
              <span className="flex items-center gap-1 text-base font-semibold text-gray-900 whitespace-nowrap">
                <Euro size={16} />
                {service.price_eur.toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {service.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 group-hover:border-gray-400 transition-colors">
              <span className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                <Clock size={14} />
                {service.duration_min} min
              </span>
              <span className="text-sm font-medium text-gray-900 group-hover:underline">
                Pasirinkti →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
