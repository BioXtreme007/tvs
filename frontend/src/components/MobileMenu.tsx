import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Logo from './Logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInClick?: () => void;
  onFarmerPortalClick?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
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
    onClose();
    if (link.name.includes('Krishi Saathi')) {
      window.dispatchEvent(new CustomEvent('open-krishi-saathi'));
      return;
    }
    const el = document.getElementById(link.href.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [authUser, setAuthUser] = React.useState<{ name: string; role?: string } | null>(null);

  React.useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem('tvs_credit_user');
        setAuthUser(stored ? JSON.parse(stored) : null);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop: Fixed overlay, fades in/out over 0.3s */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#192837]/35 backdrop-blur-sm"
          />

          {/* Sheet: Fixed, right-aligned, height: 100dvh, background #CFC8C5 */}
          <motion.div
            initial={{ x: '100%' }}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Website navigation"
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed top-0 right-0 z-50 flex flex-col justify-between p-6 bg-[#CFC8C5] shadow-2xl"
            style={{
              width: 'min(88vw, 360px)',
              height: '100dvh',
              overflowY: 'auto',
              boxShadow: '-12px 0 48px rgba(25, 40, 55, 0.18)',
            }}
          >
            <div>
              {/* Header: Logo + Circular Close Button */}
              <div className="flex items-center justify-between pb-6">
                <div className="flex items-center gap-2">
                  <Logo />
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#192837] text-white">
                    TVS Credit
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#192837]/10 text-[#192837] cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Divider line */}
              <div className="h-px bg-[#192837]/12 mb-6" />

              {/* Nav links: Staggered from right */}
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.18 + i * 0.07,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="px-4 py-3 rounded-xl text-[1.1rem] font-medium text-[#192837] hover:bg-black/10 transition-colors cursor-pointer"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* CTA Buttons at bottom */}
            <div className="flex flex-col gap-3 pt-6 border-t border-[#192837]/12">
              {authUser && (authUser.role === 'Agri Underwriter' || authUser.role === 'Risk Operations Officer' || /underwriter|officer|admin/i.test(authUser.role || '')) && (
                <button
                  onClick={() => {
                    window.location.hash = '#dashboard';
                    onClose();
                  }}
                  className="w-full py-3.5 rounded-full text-white font-bold text-[0.95rem] shadow-sm active:scale-95 transition-all cursor-pointer bg-[#0B2545] hover:bg-[#133863] flex items-center justify-center gap-2"
                >
                  <span>⚡ Admin Dashboard</span>
                </button>
              )}
              {onFarmerPortalClick && (
                <button
                  onClick={() => {
                    onClose();
                    onFarmerPortalClick();
                  }}
                  className="w-full py-3 rounded-full text-emerald-950 font-bold text-[0.95rem] shadow-sm active:scale-95 transition-all cursor-pointer bg-emerald-400 hover:bg-emerald-300 flex items-center justify-center gap-2"
                >
                  <span>🌾</span>
                  <span>Farmer Portal</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (onSignInClick) {
                    onSignInClick();
                  } else {
                    window.location.href = '/signin.html';
                  }
                  onClose();
                }}
                className="w-full py-3.5 rounded-full font-semibold text-[0.95rem] border border-black/10 active:scale-95 transition-all cursor-pointer"
                style={{
                  backgroundColor: '#F2F2EE',
                  color: 'var(--color-text)',
                }}
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
