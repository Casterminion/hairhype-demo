import { ReactNode, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, BookOpen, MessageSquare, Star, Briefcase, LogOut, Menu, X, Sun, Moon, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth, logout } from '../../hooks/useAuth';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_theme')
        .maybeSingle();

      if (data?.value) {
        setDarkMode(data.value === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    await supabase
      .from('settings')
      .upsert({
        key: 'admin_theme',
        value: newMode ? 'dark' : 'light',
      });
  };

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { to: '/admin/calendar', icon: Calendar, label: 'Kalendorius' },
    { to: '/admin/bookings', icon: BookOpen, label: 'Rezervacijos' },
    { to: '/admin/blogs', icon: MessageSquare, label: 'Tinklaraščiai' },
    { to: '/admin/reviews', icon: Star, label: 'Atsiliepimai' },
    { to: '/admin/services', icon: Briefcase, label: 'Paslaugos' },
    { to: '/admin/gallery', icon: Image, label: 'Galerija' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-[#1A1A2E] via-[#252538] to-[#1A1A2E]' : 'bg-gradient-to-br from-[#F7F5F2] via-[#F3EFE9] to-[#ECE7E2]'}`}>
      {/* Mobile Header */}
      <header className={`md:hidden ${darkMode ? 'bg-[#1A1A2E]/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-white/10' : 'border-[#B58E4C]/10'} sticky top-0 z-50`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className={`font-serif text-xl font-bold ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
              Admin
            </h1>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="py-4 border-t border-white/10">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-[#B58E4C] text-white'
                        : darkMode
                        ? 'text-white/70 hover:bg-white/5'
                        : 'text-[#1A1A2E]/70 hover:bg-[#B58E4C]/5'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-[#B58E4C]/10'} space-y-2`}>
                <button
                  onClick={toggleDarkMode}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium w-full transition-colors ${
                    darkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-[#B58E4C]/10 hover:bg-[#B58E4C]/20 text-[#B58E4C]'
                  }`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{darkMode ? 'Šviesus' : 'Tamsus'} režimas</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium w-full ${
                    darkMode
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  <LogOut size={20} />
                  <span>Atsijungti</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Desktop Layout with Sidebar */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <aside className={`w-64 ${darkMode ? 'bg-[#1A1A2E]/80' : 'bg-white/80'} backdrop-blur-md border-r ${darkMode ? 'border-white/10' : 'border-[#B58E4C]/10'} flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className={`font-serif text-xl font-bold ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
              Administravimo Skydelis
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#B58E4C] text-white shadow-lg'
                      : darkMode
                      ? 'text-white/70 hover:text-white hover:bg-white/5'
                      : 'text-[#1A1A2E]/70 hover:text-[#1A1A2E] hover:bg-[#B58E4C]/5'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className={`p-4 space-y-2 border-t ${darkMode ? 'border-white/10' : 'border-[#B58E4C]/10'}`}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm w-full transition-colors ${
                darkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-[#B58E4C]/10 hover:bg-[#B58E4C]/20 text-[#B58E4C]'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{darkMode ? 'Šviesus' : 'Tamsus'} režimas</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm w-full transition-all ${
                darkMode
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
              }`}
            >
              <LogOut size={20} />
              <span>Atsijungti</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <main className="md:hidden container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
