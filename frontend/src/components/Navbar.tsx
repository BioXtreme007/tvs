import React from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onSignInClick?: () => void;
  onFarmerPortalClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onSignInClick,
  onFarmerPortalClick,
}) => {
  const navLinks = [
    { name: '4 Pillars', href: '#innovations' },
    { name: 'How it Works', href: '#lending-pipeline' },
    { name: 'Portfolio Risk', href: '#portfolio' },
    { name: 'Krishi Saathi AI', href: '#krishi-saathi' },
  ];

  const handleNavClick = (link: { name: string; href: string }) => {
    if (link.name.includes('Krishi Saathi')) {
      window.dispatchEvent(new CustomEvent('open-krishi-saathi'));
      return;
    }
    const el = document.getElementById(link.href.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [authUser, setAuthUser] = React.useState<{ name: string; role?: string; email?: string } | null>(null);

  React.useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem('tvs_credit_user');
        if (stored) {
          setAuthUser(JSON.parse(stored));
        } else {
          setAuthUser(null);
        }
      } catch (e) {
        setAuthUser(null);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('tvs-auth-change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('tvs-auth-change', checkAuth);
    };
  }, []);

  const isCreditAdmin = Boolean(
    authUser && (
      /underwriter|officer|admin|credit|risk/i.test(authUser.role || '') ||
      /credit|tvs/i.test(authUser.email || '') ||
      /credit/i.test(authUser.name || '')
    )
  );

  return (
    <nav
      className={`website-nav fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 h-[65px] flex items-center ${
        scrolled
          ? 'bg-[#EAE1DF]/85 backdrop-blur-md border-b border-black/5 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full flex items-center justify-between">
        {/* Left: Logo component + Brand badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo />
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#192837] text-white"
          >
            TVS Credit
          </span>
        </div>

        {/* Center (desktop lg:flex): 4 core nav links without clutter */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-shrink-0">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link);
              }}
              className="text-sm font-medium transition-opacity hover:opacity-70 cursor-pointer text-[#192837]"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right (desktop lg:flex): Action Buttons */}
        <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
          {isCreditAdmin && (
            <button
              onClick={() => { window.location.hash = '#dashboard'; }}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-white bg-[#0B2545] hover:bg-[#133863] shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              title="Open Credit Operations Dashboard"
            >
              <span>⚡ Admin Dashboard</span>
            </button>
          )}
          {onFarmerPortalClick && (
            <button
              onClick={onFarmerPortalClick}
              className="text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border border-emerald-600/30 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 shadow-2xs whitespace-nowrap"
              title="Open Farmer Portal"
            >
              <span>🌾</span>
              <span>Farmer Portal</span>
            </button>
          )}
          {authUser ? (
            <div className="flex items-center gap-2 bg-white/90 border border-slate-200/90 rounded-full pl-3 pr-2 py-1 shadow-2xs flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${isCreditAdmin ? 'bg-purple-500' : 'bg-emerald-500'} animate-pulse flex-shrink-0`} />
              <button
                onClick={() => { window.location.hash = isCreditAdmin ? '#dashboard' : '#farmer'; }}
                className="text-xs font-bold text-[#0B2545] hover:underline cursor-pointer truncate max-w-[120px]"
                title={isCreditAdmin ? 'Open Admin Dashboard' : 'Open Farmer Portal'}
              >
                {authUser.name}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('tvs_credit_user');
                  localStorage.removeItem('tvs_auth_token');
                  setAuthUser(null);
                  window.dispatchEvent(new Event('tvs-auth-change'));
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 px-1.5 py-0.5 rounded cursor-pointer ml-0.5"
                title="Sign out of account"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onSignInClick) {
                  onSignInClick();
                } else {
                  window.location.href = '/signin.html';
                }
              }}
              className="text-sm font-semibold px-4 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer border border-black/5 hover:bg-white whitespace-nowrap"
              style={{
                backgroundColor: '#F2F2EE',
                color: 'var(--color-text)',
              }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile (lg:hidden): Hamburger button */}
        <div className="lg:hidden flex items-center">
          <button
            id="website-menu-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-[#192837] focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
