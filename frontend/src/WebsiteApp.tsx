import React, { useEffect, useRef, useState } from 'react';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowUp as ArrowUpIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Hero from './components/Hero';
import InnovationPillars from './components/InnovationPillars';
import LendingPipelineSection from './components/LendingPipelineSection';
import FieldScenariosCarousel, { FieldScenario } from './components/FieldScenariosCarousel';
import PortfolioSection from './components/PortfolioSection';
import WhatIfSection from './components/WhatIfSection';
import EWSSection from './components/EWSSection';
import Footer from './components/Footer';
import SignInPage from './components/SignInPage';
import DeliberationModal from './components/DeliberationModal';
import Assistant from './components/Assistant';
import FarmerPortal from './components/FarmerWorkspace';
import PrecisionSectionPreview from './components/PrecisionSectionPreview';
import AdminDashboard from './components/AdminCockpit';

const viewFromHash = () => {
  const hash = window.location.hash;
  if (hash === '#signin') return 'signin';
  if (hash.startsWith('#farmer')) return 'farmer';
  if (hash === '#precision-preview') return 'precision-preview';
  if (hash.startsWith('#dashboard')) return 'dashboard';
  return 'landing';
};
function Reveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={false} whileInView={reduced ? undefined : { y: [14, 0], opacity: [.88, 1] }} viewport={{ once: true, amount: .08 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}

export default function WebsiteApp() {
  const [view, setView] = useState(viewFromHash);
  const [menu, setMenu] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [context, setContext] = useState<Record<string, any> | null>(null);
  const [scenario, setScenario] = useState<FieldScenario | null>(null);
  const [deliberation, setDeliberation] = useState<any>(null);
  const [dashboardUser, setDashboardUser] = useState<{ name: string; role: string; email?: string } | null>(null);
  const [identity, setIdentity] = useState(() => { try { const user = JSON.parse(localStorage.getItem('tvs_credit_user') || 'null'); return user?.user_id || user?.email || 'guest'; } catch { return 'guest'; } });
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navigate = (hash: string) => {
    setMenu(false);
    setAssistantOpen(false);
    const cleanHash = hash.startsWith('#') ? hash : '#' + hash;
    window.location.hash = cleanHash;
    setView(
      cleanHash === '#signin' ? 'signin' :
      cleanHash.startsWith('#farmer') ? 'farmer' :
      cleanHash === '#precision-preview' ? 'precision-preview' :
      cleanHash.startsWith('#dashboard') ? 'dashboard' :
      'landing'
    );
  };
  const handleFarmerPortalClick = () => {
    try {
      const user = JSON.parse(localStorage.getItem('tvs_credit_user') || 'null');
      if (user && (user.name || user.email || user.user_id)) {
        navigate('farmer');
        return;
      }
    } catch {}
    navigate('signin');
  };
  const [initialVoice, setInitialVoice] = useState(false);
  const ask = (query = '', voiceMode = false) => {
    opener.current = document.activeElement as HTMLElement;
    setDraft(query);
    setInitialVoice(voiceMode);
    setAssistantOpen(true);
  };
  const closeAssistant = () => { setAssistantOpen(false); window.setTimeout(() => (opener.current?.isConnected ? opener.current : document.getElementById('saathi-launcher'))?.focus()); };

  useEffect(() => {
    const route = () => { setView(viewFromHash()); setMenu(false); setAssistantOpen(false); };
    const open = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      ask(detail.query || '', detail.voiceMode || false);
    };
    const auth = () => { try { const user = JSON.parse(localStorage.getItem('tvs_credit_user') || 'null'); setIdentity(user?.user_id || user?.email || 'guest'); } catch { setIdentity('guest'); } setContext(null); };
    const handleAssistantNav = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.target) return;
      const targetId = detail.target.replace('#', '');
      if (targetId === 'farmer-documents' || targetId === 'farmer-faq') {
        if (view !== 'farmer') setView('farmer');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-[#7342E2]', 'transition-all', 'duration-700');
            setTimeout(() => el.classList.remove('ring-4', 'ring-[#7342E2]'), 3500);
          }
        }, 150);
        return;
      }
      if (view !== 'home') {
        setView('home');
      }
      setTimeout(() => {
        const el = document.getElementById(targetId) ||
          (targetId === 'underwriting' ? document.getElementById('underwriting') || document.getElementById('pipeline') : null);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('ring-4', 'ring-[#0B2545]', 'transition-all', 'duration-700');
          setTimeout(() => el.classList.remove('ring-4', 'ring-[#0B2545]'), 3500);
        }
      }, 150);
    };
    window.addEventListener('hashchange', route);
    window.addEventListener('open-krishi-saathi', open);
    window.addEventListener('tvs-auth-change', auth);
    window.addEventListener('assistant-navigate', handleAssistantNav);
    return () => {
      window.removeEventListener('hashchange', route);
      window.removeEventListener('open-krishi-saathi', open);
      window.removeEventListener('tvs-auth-change', auth);
      window.removeEventListener('assistant-navigate', handleAssistantNav);
    };
  }, [view]);
  useEffect(() => {
    document.title = (view === 'signin' ? 'Sign in' : view === 'farmer' ? 'Farmer portal' : view === 'precision-preview' ? 'PrecisionSection Preview' : 'Smart Agri-Lending') + ' · TVS Credit';
    const frame = requestAnimationFrame(() => {
      const targetId = window.location.hash.replace('#', '');
      if (targetId && targetId !== 'farmer' && targetId !== 'home' && targetId !== 'dashboard') {
        const el = document.getElementById(targetId) ||
          (targetId === 'lending-pipeline' ? document.getElementById('pipeline') : null);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      if (!targetId || targetId === 'farmer' || targetId === 'home' || targetId === 'dashboard') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);
  useEffect(() => {
    video.current?.play().catch(() => {});
  }, [reduced, view]);
  useEffect(() => {
    if (!assistantOpen && !menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const container = assistantOpen ? panel.current : document.getElementById('mobile-menu');
    const timer = window.setTimeout(() => container?.querySelector<HTMLElement>('button')?.focus());
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { if (assistantOpen) closeAssistant(); else { setMenu(false); document.getElementById('website-menu-toggle')?.focus(); } }
      if (event.key !== 'Tab' || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, textarea')).filter(item => item.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (!container.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); first?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    };
    document.addEventListener('keydown', handle);
    return () => { clearTimeout(timer); document.body.style.overflow = previous; document.removeEventListener('keydown', handle); };
  }, [assistantOpen, menu]);

  return <MotionConfig reducedMotion="user"><div className="original-site">
    <a href="#website-main" className="skip-link">Skip to content</a>
    {view === 'signin' ? (
      <SignInPage
        onBack={() => navigate('home')}
        onSuccess={(user) => {
          window.dispatchEvent(new Event('tvs-auth-change'));
          const role = (user?.role || '').toLowerCase();
          const email = (user?.email || '').toLowerCase();
          const name = (user?.name || '').toLowerCase();
          const isCreditAdmin =
            role.includes('underwriter') ||
            role.includes('officer') ||
            role.includes('admin') ||
            role.includes('credit') ||
            role.includes('risk') ||
            email.includes('tvscredit') ||
            email.includes('credit') ||
            name.includes('credit') ||
            name.includes('underwriter') ||
            name.includes('rajeshwar') ||
            name.includes('sunil');
          if (isCreditAdmin) {
            setDashboardUser(user);
            navigate('dashboard');
          } else {
            // Agri Partner / Normal User -> Opens Farmer Portal
            navigate('farmer');
          }
        }}
      />
    ) : view === 'dashboard' ? (
      <AdminDashboard
        onContext={setContext}
        user={dashboardUser || (() => {
          try {
            const u = JSON.parse(localStorage.getItem('tvs_credit_user') || 'null');
            return u || { name: 'Rajeshwar Sharma', role: 'Agri Underwriter', branch: 'Raipur Central Hub' };
          } catch {
            return { name: 'Rajeshwar Sharma', role: 'Agri Underwriter', branch: 'Raipur Central Hub' };
          }
        })()}
        onSignOut={() => {
          localStorage.removeItem('tvs_credit_user');
          localStorage.removeItem('tvs_auth_token');
          setDashboardUser(null);
          window.dispatchEvent(new Event('tvs-auth-change'));
          navigate('home');
        }}
        onNavigateHome={() => navigate('home')}
      />
    ) : view === 'farmer' ? (
      <FarmerPortal onBackToCockpit={() => navigate('home')} onOpenSignIn={() => navigate('signin')} />
    ) : view === 'precision-preview' ? (
      <PrecisionSectionPreview onBack={() => navigate('home')} />
    ) : <>
        <Navbar isMobileMenuOpen={menu} setIsMobileMenuOpen={setMenu} onSignInClick={() => navigate('signin')} onFarmerPortalClick={handleFarmerPortalClick} />
        <MobileMenu isOpen={menu} onClose={() => setMenu(false)} onSignInClick={() => navigate('signin')} onFarmerPortalClick={handleFarmerPortalClick} />
      <header className="website-hero" id="home">
        <video ref={video} autoPlay muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={() => { video.current?.play().catch(() => {}); }} className="website-hero-video" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_131516_eca35265-ea66-4fbd-8d52-22aae6e1a503.mp4" />
        <div className="website-hero-fade" />
        <div className="website-hero-content"><Hero /></div>
        <a href="#innovations" className="website-scroll-cue"><span>Explore innovation pillars</span><ArrowDown size={16} /></a>
      </header>
      <main id="website-main" tabIndex={-1}>
        <Reveal><InnovationPillars /></Reveal>
        <Reveal><LendingPipelineSection /></Reveal>
        <Reveal><FieldScenariosCarousel onSelectScenario={setScenario} /></Reveal>
        <Reveal><PortfolioSection /></Reveal>
        <Reveal><WhatIfSection /></Reveal>
        <Reveal><EWSSection /></Reveal>
        <Reveal><section id="krishi-saathi" className="website-saathi-section"><div className="website-saathi-card"><div><span className="website-kicker"><Sparkles size={16} /> TVS KRISHI SAATHI</span><h2>Your language.<br />A little more clarity.</h2><p>Understand your assessment, explore harvest-linked repayments, and ask your next question in one of eight languages.</p><button className="website-saathi-button" onClick={() => ask('', true)}>Talk 1:1 with Krishi Saathi <Sparkles size={17} /></button></div><div className="website-saathi-prompts"><span>START A CONVERSATION</span>{['What documents do I need?', 'How do harvest repayments work?', 'Explain my credit assessment'].map(query => <button key={query} onClick={() => ask(query)}>{query}<span>↗</span></button>)}<p>English · हिन्दी · छत्तीसगढ़ी · தமிழ்<br />తెలుగు · मराठी · ಕನ್ನಡ · বাংলা</p></div></div></section></Reveal>
      </main>
      <Footer />
      <DeliberationModal isOpen={!!deliberation} onClose={() => setDeliberation(null)} resultData={deliberation} />
    </>}
    {view !== 'signin' && view !== 'dashboard' && (
      <>
        {showScrollTop && (
          <div className="fixed right-4 md:right-7 bottom-[82px] md:bottom-[98px] z-40">
            <Button
              variant="outline"
              size="icon"
              aria-label="Scroll back to top"
              title="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-slate-300/90 bg-white/95 text-[#0B2545] shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-slate-400 hover:bg-white hover:text-[#7342E2] hover:shadow-xl active:scale-95"
            >
              <ArrowUpIcon className="h-5 w-5" />
            </Button>
          </div>
        )}
        {!assistantOpen && (
          <button
            id="saathi-launcher"
            className="assistant-launcher"
            onClick={() => ask()}
            aria-label="Open Krishi Saathi AI Assistant"
            title="Talk to Krishi Saathi"
          >
            <img src="/saathi-icon.png" alt="Krishi Saathi" />
          </button>
        )}
      </>
    )}
    <div className={'assistant-layer ' + (assistantOpen ? 'visible' : '')} aria-hidden={!assistantOpen}>
      {assistantOpen && <button className="assistant-scrim" onClick={closeAssistant} aria-label="Dismiss assistant overlay" tabIndex={-1} />}
      <section ref={panel} className="assistant-drawer" role="dialog" aria-modal={assistantOpen || undefined} aria-label="Krishi Saathi assistant"><Assistant context={context} draft={draft} visible={assistantOpen} onClose={closeAssistant} identity={identity} initialVoiceMode={initialVoice} /></section>
    </div>
  </div></MotionConfig>;
}
