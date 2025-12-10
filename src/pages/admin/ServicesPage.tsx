import { useState, useEffect } from 'react';
import { Scissors, Euro } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppShell } from '../../admin/ui/AppShell';
import { Card } from '../../admin/ui/primitives/Card';
import { Input } from '../../admin/ui/primitives/Input';
import { showToast } from '../../admin/ui/primitives/Toast';
import { SkeletonCard } from '../../admin/ui/primitives/Skeleton';
import { EmptyState } from '../../admin/ui/primitives/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price_eur: number;
  is_active: boolean;
}

export function ServicesPage() {
  useDocumentTitle('Admin');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('sort_order');

    if (data) {
      setServices(data);
      const prices: Record<string, number> = {};
      data.forEach(service => {
        prices[service.id] = service.price_eur;
      });
      setEditedPrices(prices);
    }
    setLoading(false);
  };

  const handlePriceChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedPrices(prev => ({ ...prev, [id]: numValue }));
    }
  };

  const savePrice = async (id: string) => {
    const newPrice = editedPrices[id];
    const service = services.find(s => s.id === id);

    if (!service || newPrice === service.price_eur) {
      return;
    }

    setSaving(id);

    try {
      const token = localStorage.getItem('admin_session_token');
      if (!token) {
        showToast('error', 'Sesija negaliojanti');
        setSaving(null);
        return;
      }

      const { data, error } = await supabase.rpc('admin_update_service', {
        p_token: token,
        p_service_id: id,
        p_duration_min: null,
        p_price_eur: newPrice
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Nepavyko atnaujinti kainos');
      }

      setServices(prev =>
        prev.map(s => (s.id === id ? { ...s, price_eur: newPrice } : s))
      );

      showToast('success', 'Kaina sėkmingai atnaujinta');
    } catch (err: any) {
      showToast('error', err.message || 'Nepavyko atnaujinti kainos');
      setEditedPrices(prev => ({ ...prev, [id]: service.price_eur }));
    } finally {
      setSaving(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <AppShell>
      <AppShell.Page
        title="Paslaugos"
        subtitle="Redaguokite paslaugų kainas"
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[var(--navy)] rounded-[var(--radius-xl)] overflow-hidden border border-white/[0.06]">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="Paslaugų nerasta"
            description="Dar nėra sukurtų paslaugų"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`bg-[var(--navy)] border-white/[0.06] transition-all duration-[var(--duration-normal)] ${
                  saving === service.id ? 'opacity-60' : ''
                }`}
              >
                <Card.Body className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20">
                        <Scissors size={24} className="text-[var(--gold)]" />
                      </div>
                      <div>
                        <h3 className="serif text-xl font-semibold text-white">
                          {service.name}
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          Paslaugos kaina
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Field */}
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                      <Euro size={14} className="inline mr-1.5 mb-0.5" />
                      Kaina (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editedPrices[service.id] ?? service.price_eur}
                      onChange={(e) => handlePriceChange(service.id, e.target.value)}
                      onBlur={() => savePrice(service.id)}
                      onKeyDown={(e) => handleKeyDown(e, service.id)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all"
                      disabled={saving === service.id}
                      min="0"
                    />
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {/* Info Footer */}
        {!loading && services.length > 0 && (
          <div className="mt-6 p-4 bg-white/[0.02] rounded-[var(--radius-lg)] border border-white/[0.06]">
            <p className="text-sm text-white/50 text-center">
              Pakeitimai išsaugomi automatiškai • Redaguojamos tik paslaugų kainos
            </p>
          </div>
        )}
      </AppShell.Page>
    </AppShell>
  );
}
