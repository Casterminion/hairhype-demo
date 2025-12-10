import { useState, useEffect, FormEvent } from 'react';
import { Building2, MapPin, Phone, Mail, Instagram, Facebook, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppShell } from '../../admin/ui/AppShell';
import { Card } from '../../admin/ui/primitives/Card';
import { Button } from '../../admin/ui/primitives/Button';
import { Input } from '../../admin/ui/primitives/Input';
import { showToast } from '../../admin/ui/primitives/Toast';
import { Skeleton } from '../../admin/ui/primitives/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface BusinessSettings {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  social_instagram: string;
  social_facebook: string;
}

export function SettingsPage() {
  useDocumentTitle('Admin');
  const [settings, setSettings] = useState<BusinessSettings>({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    social_instagram: '',
    social_facebook: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', [
        'business_name',
        'business_address',
        'business_phone',
        'business_email',
        'social_instagram',
        'social_facebook',
      ]);

    if (data) {
      const settingsObj = data.reduce((acc, { key, value }) => {
        acc[key as keyof BusinessSettings] = typeof value === 'string' ? value : JSON.parse(value);
        return acc;
      }, {} as BusinessSettings);
      setSettings(settingsObj);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
    }));

    const { error } = await supabase
      .from('settings')
      .upsert(updates);

    if (!error) {
      showToast('success', 'Nustatymai sėkmingai išsaugoti');
    } else {
      showToast('error', 'Nepavyko išsaugoti nustatymų');
    }
    setSaving(false);
  };

  return (
    <AppShell>
      <AppShell.Page
        title="Nustatymai"
        subtitle="Tvarkykite verslo informaciją ir nustatymus"
      >
        <div className="max-w-4xl">
          {loading ? (
            <Card className="bg-[var(--navy)] border-white/[0.06]">
              <Card.Body>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                      <Skeleton width="30%" className="mb-2" />
                      <Skeleton width="100%" height="48px" />
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <Card className="bg-[var(--navy)] border-white/[0.06]">
                <Card.Header>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20">
                      <Building2 size={20} className="text-[var(--gold)]" />
                    </div>
                    <div>
                      <h2 className="serif text-xl font-semibold text-white">
                        Verslo informacija
                      </h2>
                      <p className="text-xs text-white/50 mt-0.5">
                        Pagrindiniai įmonės duomenys
                      </p>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        <Building2 size={14} className="inline mr-1.5 mb-0.5" />
                        Pavadinimas
                      </label>
                      <input
                        type="text"
                        value={settings.business_name}
                        onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        <MapPin size={14} className="inline mr-1.5 mb-0.5" />
                        Adresas
                      </label>
                      <input
                        type="text"
                        value={settings.business_address}
                        onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        <Phone size={14} className="inline mr-1.5 mb-0.5" />
                        Telefonas
                      </label>
                      <input
                        type="tel"
                        value={settings.business_phone}
                        onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        <Mail size={14} className="inline mr-1.5 mb-0.5" />
                        El. paštas
                      </label>
                      <input
                        type="email"
                        value={settings.business_email}
                        onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all"
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Social Media */}
              <Card className="bg-[var(--navy)] border-white/[0.06]">
                <Card.Header>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20">
                      <Instagram size={20} className="text-[var(--gold)]" />
                    </div>
                    <div>
                      <h2 className="serif text-xl font-semibold text-white">
                        Socialiniai tinklai
                      </h2>
                      <p className="text-xs text-white/50 mt-0.5">
                        Nuorodos į socialinius profilius
                      </p>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Instagram */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        <Instagram size={14} className="inline mr-1.5 mb-0.5" />
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={settings.social_instagram}
                        onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all"
                      />
                    </div>

                    {/* Facebook */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        <Facebook size={14} className="inline mr-1.5 mb-0.5" />
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={settings.social_facebook}
                        onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all"
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={saving}
                >
                  <Save size={20} />
                  {saving ? 'Išsaugoma...' : 'Išsaugoti pakeitimus'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </AppShell.Page>
    </AppShell>
  );
}
