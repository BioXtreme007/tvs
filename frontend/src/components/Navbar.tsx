import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Activity,
  ShieldAlert,
  Sprout,
  Sparkles,
  FileText,
  Calendar,
  User,
} from 'lucide-react';
import Logo from './Logo';
import { UserProfileSidebar, NavItem, UserProfile } from './ui/menu';

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
    const targetId = link.href.replace('#', '');
    const el = document.getElementById(targetId) ||
      (targetId === 'lending-pipeline' ? document.getElementById('pipeline') : null);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      try {
        window.history.replaceState(null, '', link.href);
      } catch {}
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

  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const isCreditAdmin = Boolean(
    authUser && (
      /underwriter|officer|admin|credit|risk/i.test(authUser.role || '') ||
      /credit|tvs/i.test(authUser.email || '') ||
      /credit/i.test(authUser.name || '')
    )
  );

  const userProfile: UserProfile = {
    name: authUser?.name || 'GeoKisaan Partner',
    email: authUser?.email || (isCreditAdmin ? 'credit.ops@geokisaan.in' : 'kisan.portal@geokisaan.in'),
    role: authUser?.role || (isCreditAdmin ? 'Senior Credit Underwriter' : 'Verified Agri Partner'),
    branch: isCreditAdmin ? 'Bhopal Central Desk' : 'Madhya Pradesh Cluster',
  };

  const adminNavItems: NavItem[] = [
    {
      icon: <ShieldCheck className="w-4 h-4" />,
      label: 'Credit Decision Cockpit',
      href: '#dashboard',
      badge: 'Live',
      onClick: () => {
        window.location.hash = '#dashboard';
      },
    },
    {
      icon: <Activity className="w-4 h-4" />,
      label: 'District Risk Portfolio',
      href: '#portfolio',
      onClick: () => {
        const el = document.getElementById('portfolio');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.location.hash = '#portfolio';
      },
    },
    {
      icon: <ShieldAlert className="w-4 h-4" />,
      label: 'Early Warning Signals (EWS)',
      href: '#ews',
      badge: '3 Alerts',
      onClick: () => {
        const el = document.getElementById('ews');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.location.hash = '#ews';
      },
    },
    {
      icon: <Sprout className="w-4 h-4" />,
      label: 'Farmer Portal Inspector',
      href: '#farmer',
      isSeparator: true,
      onClick: () => {
        if (onFarmerPortalClick) onFarmerPortalClick();
        else window.location.hash = '#farmer';
      },
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: 'Krishi Saathi Underwriter AI',
      href: '#krishi-saathi',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('open-krishi-saathi'));
      },
    },
  ];

  const partnerNavItems: NavItem[] = [
    {
      icon: <Sprout className="w-4 h-4" />,
      label: 'Farmer Workspace',
      href: '#farmer',
      badge: 'Active',
      onClick: () => {
        if (window.location.hash.startsWith('#farmer')) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.location.hash = '#farmer';
        }
      },
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: 'Document Checklist & Khasra',
      href: '#farmer-documents',
      onClick: () => {
        if (window.location.hash.startsWith('#farmer')) {
          const el = document.getElementById('farmer-documents');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.location.hash = '#farmer-documents';
        } else {
          window.location.hash = '#farmer-documents';
        }
      },
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Harvest-Aligned Repayments',
      href: '#farmer-journey',
      badge: 'Flexible',
      onClick: () => {
        if (window.location.hash.startsWith('#farmer')) {
          const el = document.getElementById('farmer-journey');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.location.hash = '#farmer-journey';
        } else {
          window.location.hash = '#farmer-journey';
        }
      },
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: 'Ask Krishi Saathi (AI Voice)',
      href: '#krishi-saathi',
      isSeparator: true,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('open-krishi-saathi'));
      },
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('tvs_credit_user');
    localStorage.removeItem('tvs_auth_token');
    setAuthUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event('tvs-auth-change'));
    window.location.hash = '#home';
  };

  return (
    <nav
      className={`website-nav fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 h-[65px] flex items-center ${
        scrolled
          ? 'bg-[#EAE1DF]/85 backdrop-blur-md border-b border-black/5 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full flex items-center justify-between">
        {/* Left: GeoKisaan Logo + Brand badge */}
        <div
          className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
          onClick={() => {
            window.location.hash = '#home';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="GeoKisaan Home"
        >
          <Logo />
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#192837] text-white"
          >
            GeoKisaan
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
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-white/95 hover:bg-white border border-slate-200/90 rounded-full pl-2 pr-2.5 py-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-95"
                title="Account Menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center flex-shrink-0 text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCreditAdmin ? 'bg-purple-500' : 'bg-emerald-500'
                    } animate-pulse flex-shrink-0`}
                  />
                  <span className="text-xs font-bold text-[#0B2545] truncate max-w-[120px]">
                    {authUser.name}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 flex-shrink-0 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72">
                    <UserProfileSidebar
                      user={userProfile}
                      navItems={isCreditAdmin ? adminNavItems : partnerNavItems}
                      logoutItem={{
                        icon: <LogOut className="w-4 h-4" />,
                        label: 'Sign Out Account',
                        onClick: handleLogout,
                      }}
                      onClose={() => setProfileOpen(false)}
                    />
                  </div>
                )}
              </AnimatePresence>
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
