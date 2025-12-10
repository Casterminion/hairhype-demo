import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Calendar,
  List,
  ScrollText,
  Star,
  Scissors,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Command,
  Image,
  User
} from 'lucide-react';
import { logout } from '../../hooks/useAuth';
import { CommandPalette } from './components/CommandPalette';

interface AppShellProps {
  children: ReactNode;
}

interface PageProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

interface ActionsProps {
  children: ReactNode;
}

type Theme = 'light' | 'dark';

const ThemeContext = createContext<Theme>('dark');

export const useTheme = () => useContext(ThemeContext);

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Apžvalga', shortLabel: 'Apžvalga' },
  { to: '/admin/calendar', icon: Calendar, label: 'Kalendorius', shortLabel: 'Kalendorius' },
  { to: '/admin/bookings', icon: List, label: 'Rezervacijos', shortLabel: 'Rezervacijos' },
  { to: '/admin/reviews', icon: Star, label: 'Atsiliepimai', shortLabel: 'Atsiliepimai' },
  { to: '/admin/services', icon: Scissors, label: 'Paslaugos', shortLabel: 'Paslaugos' },
  { to: '/admin/blogs', icon: ScrollText, label: 'Tinklaraščiai', shortLabel: 'Tinklaraščiai' },
  { to: '/admin/gallery', icon: Image, label: 'Galerija', shortLabel: 'Galerija' },
];

export function AppShell({ children }: AppShellProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const cached = localStorage.getItem('admin_theme');
    return (cached === 'light' || cached === 'dark') ? cached : 'dark';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <ThemeContext.Provider value={theme}>
    <div
      data-admin-theme={theme}
      className={`min-h-screen ${theme === 'dark' ? 'bg-[var(--ink)]' : 'bg-[var(--surface)]'}`}
    >

      {/* MOBILE HEADER */}
      <header
        className={`
          lg:hidden fixed top-0 left-0 right-0 z-50
          safe-area-inset-top
          backdrop-blur-lg
          ${theme === 'dark'
            ? 'bg-[var(--ink-2)]/95 border-b border-white/[0.06]'
            : 'bg-white/95 border-b border-[var(--line)]'
          }
        `}
      >
        <div className="h-14 sm:h-16 max-w-[1920px] mx-auto px-3 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className={`
                p-2.5 -ml-2 rounded-xl transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center
                ${theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 active:bg-white/[0.15] text-[var(--gold)]'
                  : 'bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 active:bg-[var(--gold)]/30 text-[var(--gold)]'
                }
              `}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <h1 className={`serif text-base sm:text-xl font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-[var(--ink)]'}`}>
              <span className="hidden sm:inline">Administravimo Skydelis</span>
              <span className="sm:hidden">Admin</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleLogout}
              className={`
                p-2.5 rounded-xl transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center
                ${theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 active:bg-white/[0.15] text-red-400'
                  : 'bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600'
                }
              `}
              aria-label="Atsijungti"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* DESKTOP LAYOUT WITH SIDEBAR */}
      <div className="hidden lg:flex min-h-screen overflow-hidden">
        {/* SIDEBAR - Fixed, non-scrollable, icon-only by default, expands on hover */}
        <aside
          className={`
            group
            w-20 hover:w-64
            fixed left-0 top-0 bottom-0
            flex flex-col
            ${theme === 'dark'
              ? 'bg-[var(--ink-2)]/95 border-r border-white/[0.06]'
              : 'bg-white/95 border-r border-[var(--line)]'
            }
            backdrop-blur-lg
            transition-[width] duration-300 ease-in-out
            z-50
            overflow-hidden
            will-change-[width]
          `}
        >
          {/* Sidebar Header - User profile with greeting */}
          <div className="p-4 border-b border-white/[0.06] flex flex-col items-center group-hover:items-start min-h-[100px] transition-all duration-300">
            <div className="flex items-center w-full">
              {/* User Avatar - centers when collapsed, aligns left when expanded */}
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border-2 border-[var(--gold)]/30 mx-auto group-hover:mx-0 transition-all duration-300">
                <User size={24} className="text-[var(--gold)]" />
              </div>
              {/* Greeting text - only visible on hover */}
              <div className={`
                ml-3 overflow-hidden whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                ${theme === 'dark' ? 'text-white' : 'text-[var(--ink)]'}
              `}>
                <h1 className="serif text-base font-semibold">
                  Sveiki, Mariau
                </h1>
                <p className="text-xs text-white/50">Administratorius</p>
              </div>
            </div>
          </div>

          {/* Navigation Items - Icons only, text appears on hover */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm
                  transition-all duration-200 whitespace-nowrap overflow-hidden
                  ${isActive
                    ? 'bg-[var(--gold)]/10 text-[var(--gold)] shadow-lg'
                    : theme === 'dark'
                      ? 'text-white/70 hover:text-white hover:bg-white/5'
                      : 'text-[var(--ink)]/70 hover:text-[var(--ink)] hover:bg-[var(--ink)]/5'
                  }
                `}
                title={item.label}
              >
                <item.icon size={22} className="flex-shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions - Icons only, text appears on hover */}
          <div className={`p-3 space-y-2 border-t ${theme === 'dark' ? 'border-white/[0.06]' : 'border-[var(--line)]'}`}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm w-full
                transition-all whitespace-nowrap overflow-hidden
                ${theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-[var(--gold)]'
                  : 'bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 text-[var(--gold)]'
                }
              `}
              title={theme === 'dark' ? 'Šviesus režimas' : 'Tamsus režimas'}
            >
              {theme === 'dark' ? <Sun size={22} className="flex-shrink-0" /> : <Moon size={22} className="flex-shrink-0" />}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {theme === 'dark' ? 'Šviesus' : 'Tamsus'}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm w-full
                transition-all whitespace-nowrap overflow-hidden
                ${theme === 'dark'
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
                }
              `}
              title="Atsijungti"
            >
              <LogOut size={22} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Atsijungti
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT - Scrollable, offset by sidebar width */}
        <main className="flex-1 ml-20 overflow-auto h-screen">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 z-50
          backdrop-blur-xl
          ${theme === 'dark'
            ? 'bg-[var(--ink-2)]/95 border-t border-white/[0.08]'
            : 'bg-white/95 border-t border-[var(--line)]'
          }
          safe-area-inset-bottom shadow-[0_-2px_20px_rgba(0,0,0,0.1)]
        `}
      >
        <div className="flex items-stretch justify-around px-1 py-1.5 pb-safe">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-0.5 px-1 py-1.5
                rounded-lg flex-1 min-h-[52px] max-w-[80px]
                transition-all touch-manipulation active:scale-95
                ${isActive
                  ? theme === 'dark'
                    ? 'text-[var(--gold)] bg-[var(--gold)]/10'
                    : 'text-[var(--gold)] bg-[var(--gold)]/10'
                  : theme === 'dark'
                    ? 'text-white/60 active:bg-white/5'
                    : 'text-[var(--ink)]/60 active:bg-[var(--ink)]/5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[9px] font-medium leading-tight text-center ${isActive ? 'font-semibold' : ''}`}>
                    {item.shortLabel || item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* MOBILE CONTENT */}
      <main className="lg:hidden mt-14 sm:mt-16 pb-[88px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
    </ThemeContext.Provider>
  );
}

function Page({ children, title, subtitle, action }: PageProps) {
  const theme = useTheme();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className={`serif text-3xl lg:text-4xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[var(--ink)]'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-sm lg:text-base ${theme === 'dark' ? 'text-[var(--muted)]' : 'text-[var(--ink)]/60'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Actions({ children }: ActionsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {children}
    </div>
  );
}

AppShell.Page = Page;
AppShell.Actions = Actions;
