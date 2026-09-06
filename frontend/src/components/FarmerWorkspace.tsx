import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Sprout,
  MessageCircle,
  FileText,
  CalendarDays,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import Logo from './Logo';
import { UserProfileSidebar, NavItem } from './ui/menu';
import { useResource, money, number } from '../api';
import FarmerPortal from './FarmerPortal';
import '../portals.css';

interface Props {
  onBackToCockpit: () => void;
  onOpenSignIn?: () => void;
}

const ask = (query = '') =>
  window.dispatchEvent(new CustomEvent('open-krishi-saathi', { detail: { query } }));

const documents = [
  'Identity & address proof',
  'Land record / Khasra details',
  'Recent bank statements',
  'Crop & income information',
];

export default function FarmerWorkspace({ onBackToCockpit, onOpenSignIn }: Props) {
  const [showDetailedPortal, setShowDetailedPortal] = useState(false);
  const loanResource = useResource<any>('/farmer/my-loan');
  const loan = loanResource.data;
  const [checked, setChecked] = useState<string[]>([]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tvs_credit_user') || 'null');
    } catch {
      return null;
    }
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleFarmerLogout = () => {
    localStorage.removeItem('tvs_credit_user');
    localStorage.removeItem('tvs_auth_token');
    setUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event('tvs-auth-change'));
    onBackToCockpit();
  };

  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });

  const farmerNavItems: NavItem[] = [
    {
      icon: <Sprout className="w-4 h-4" />,
      label: 'Farmer Workspace',
      href: '#farmer',
      badge: 'Active',
      onClick: () => {
        setShowDetailedPortal(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      icon: <CalendarDays className="w-4 h-4" />,
      label: 'Live Sanction & Telemetry',
      href: '#farmer-sanction',
      badge: loan ? 'Sanctioned' : 'Live Data',
      onClick: () => {
        setShowDetailedPortal(true);
      },
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: 'Document Checklist & Khasra',
      href: '#farmer-documents',
      onClick: () => {
        scroll('farmer-documents');
      },
    },
    {
      icon: <CalendarDays className="w-4 h-4" />,
      label: 'Harvest-Aligned Repayments',
      href: '#farmer-journey',
      badge: 'Flexible',
      onClick: () => {
        scroll('farmer-journey');
      },
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'Ask Krishi Saathi (AI Voice)',
      href: '#krishi-saathi',
      isSeparator: true,
      onClick: () => {
        ask();
      },
    },
  ];

  if (showDetailedPortal) {
    return (
      <FarmerPortal
        onBackToCockpit={() => setShowDetailedPortal(false)}
        onOpenSignIn={onOpenSignIn}
      />
    );
  }

  return (
    <div className="portal-ui farmer-shell min-h-screen bg-[#EAE1DF] text-[#192837]">
      {/* Top Navigation Bar: Identical structure, Logo, and Anchor Styling to Landing Page Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 h-[65px] flex items-center bg-[#EAE1DF]/90 backdrop-blur-md border-b border-black/5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full flex items-center justify-between">
          {/* Left: TVS Credit Logo */}
          <button
            onClick={onBackToCockpit}
            className="flex items-center gap-3 flex-shrink-0 cursor-pointer bg-transparent border-0 p-0 text-left"
            title="Return to TVS Credit Home"
          >
            <Logo />
          </button>

          {/* Center: Anchor Links matching landing page nav font, weight, and hover */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0" aria-label="Farmer navigation">
            <button
              onClick={() => scroll('farmer-assistant')}
              className="text-sm font-medium transition-opacity hover:opacity-70 cursor-pointer text-[#192837] bg-transparent border-0 p-0"
            >
              Your Saathi
            </button>
            <button
              onClick={() => scroll('farmer-journey')}
              className="text-sm font-medium transition-opacity hover:opacity-70 cursor-pointer text-[#192837] bg-transparent border-0 p-0"
            >
              Your next steps
            </button>
            <button
              onClick={() => scroll('farmer-documents')}
              className="text-sm font-medium transition-opacity hover:opacity-70 cursor-pointer text-[#192837] bg-transparent border-0 p-0"
            >
              Documents
            </button>
            <button
              onClick={() => setShowDetailedPortal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#0B2545] hover:bg-[#133863] text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Sanction & Telemetry</span>
              <ArrowUpRight size={13} />
            </button>
          </nav>

          {/* Right: Actions matching landing page pill styling */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={onBackToCockpit}
              className="text-sm font-semibold px-4 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer border border-black/10 bg-white/80 hover:bg-white text-[#192837] shadow-2xs whitespace-nowrap flex items-center gap-1.5"
            >
              <ArrowLeft size={15} />
              <span>Back to website</span>
            </button>
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-white/95 hover:bg-white border border-slate-200/90 rounded-full pl-2 pr-2.5 py-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-95"
                  title="Farmer Account Menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center flex-shrink-0 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span className="text-xs font-bold text-[#0B2545] truncate max-w-[110px]">
                      {user.name}
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
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80">
                      <UserProfileSidebar
                        user={{
                          name: user.name,
                          email: user.email || 'kisan.portal@tvscredit.com',
                          role: user.role || 'Verified Agri Partner',
                          branch: user.branch || 'Madhya Pradesh Cluster',
                        }}
                        navItems={farmerNavItems}
                        logoutItem={{
                          icon: <LogOut className="w-4 h-4" />,
                          label: 'Sign Out Account',
                          onClick: handleFarmerLogout,
                        }}
                        onClose={() => setProfileOpen(false)}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="text-sm font-semibold px-4 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer bg-[#0B2545] hover:bg-[#133863] text-white shadow-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-[85px] pb-16">
        {/* Farmer Greeting & Redesigned Farmer Services Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#7342E2] block mb-2">
              YOUR FARM. YOUR FUTURE.
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#192837] leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {user?.name ? `Welcome, ${user.name.split(' ')[0]}.` : 'A little clarity. A big step forward.'}
            </h1>
            <p className="text-sm text-slate-700 mt-1.5 max-w-xl leading-relaxed">
              Your loan journey, documents and questions. All in one unified workspace.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-black/10 text-xs font-semibold text-[#192837] shadow-2xs shrink-0 self-start sm:self-center">
            <Sprout size={15} className="text-emerald-700" />
            <span>Farmer services</span>
          </div>
        </div>

        {/* Live Active Sanction Banner from SQLite database */}
        {loan && (
          <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-[#0B2545] via-[#133863] to-[#0E4B5B] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/15">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-400 text-slate-950">
                  {loan.status === 'APPROVED' ? 'Loan Sanctioned (Pre-Approved)' : loan.status}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Ref: {loan.application_id} · {loan.village}, {loan.district}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight">
                {money(loan.sanctioned_amount_inr)}{' '}
                <span className="text-xs sm:text-sm font-semibold text-emerald-300">
                  at {loan.interest_rate_pct}% Subsidized PSL ROI
                </span>
              </div>
              <p className="text-xs text-slate-200">
                {loan.tractor_model} · Plot {loan.khasra_no} ({loan.land_acres} Acres, {loan.crop_type}) · Sentinel-2 NDVI {loan.scorecard_breakdown?.satellite_ndvi_mean ?? 0.68} Healthy Canopy
              </p>
            </div>
            <button
              onClick={() => setShowDetailedPortal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer shrink-0"
            >
              <span>Launch Sanction & Telemetry Cockpit</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Krishi Saathi Voice & Guidance Feature Card */}
        <section
          className="farmer-voice-feature relative w-full rounded-3xl overflow-hidden shadow-xl mb-12 scroll-mt-24"
          id="farmer-assistant"
        >
          <div className="saathi-copy">
            <span className="saathi-pill">
              <span className="status-dot" />
              MEET YOUR KRISHI SAATHI
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)' }}>
              Big questions?
              <br />
              Let’s talk it through.
            </h2>
            <p>
              Understand farm loans, prepare your documents, or make sense of repayments — in a
              language you’re comfortable with.
            </p>
            <div className="portal-actions flex flex-wrap items-center gap-3">
              <button
                className="portal-btn light cursor-pointer bg-[#0B2545] text-white hover:bg-[#133863] border-0 shadow-md flex items-center gap-2"
                onClick={() => ask()}
              >
                <MessageCircle size={18} />
                <span>Ask Krishi Saathi</span>
                <ArrowUpRight size={18} />
              </button>
              <span className="saathi-mode">
                Voice &amp; Vernacular AI
                <br />
                Hindi, English &amp; regional dialects
              </span>
            </div>
          </div>
          <div className="saathi-visual">
            <div className="saathi-halo">
              <img src="/saathi-icon.png" alt="Krishi Saathi" />
            </div>
            <div className="saathi-sample">
              <span>TRY ASKING</span>
              <button
                className="cursor-pointer"
                onClick={() => ask('What documents should I prepare for a farm loan?')}
              >
                “What do I need for a farm loan?” <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
          <div className="saathi-quick">
            {[
              'Explain harvest-based repayments in simple terms.',
              'How can crop health affect a credit assessment?',
              'Help me prepare for a loan application.',
            ].map((query, i) => (
              <button className="cursor-pointer" key={query} onClick={() => ask(query)}>
                <span>{['Understand repayments', 'Explore crop health', 'Prepare an application'][i]}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </section>

        {/* Section Heading for Step-by-Step Journey */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 scroll-mt-24"
          id="farmer-journey"
        >
          <div>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#7342E2] block mb-1">
              ONE STEP AT A TIME
            </span>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#192837]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Make your next move with confidence.
            </h2>
          </div>
          <span className="text-xs text-slate-600 font-medium">Simple steps. Useful information.</span>
        </div>

        {/* 3 Redesigned Farmer Service Cards */}
        <div className="farmer-service-grid grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <article className="farmer-service lavender">
            <span className="service-icon">
              <FileText size={22} />
            </span>
            <span className="service-number font-black">01</span>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Your application</h3>
            <p>
              {loan
                ? `${loan.tractor_model} · Khasra ${loan.khasra_no} (${loan.land_acres} Acres, ${loan.crop_type})`
                : 'Start with your details and understand what a lending officer will need.'}
            </p>
            <span className="service-status font-medium">
              {loan ? `${money(loan.sanctioned_amount_inr)} Sanctioned (${loan.status})` : user ? 'Account signed in' : 'Get started'}
            </span>
            <button
              className="portal-link cursor-pointer"
              onClick={
                loan
                  ? () => setShowDetailedPortal(true)
                  : user
                  ? () => ask('What are the next steps to prepare my agricultural loan application?')
                  : onOpenSignIn
              }
            >
              <span>{loan ? 'View Sanction Letter' : user ? 'Plan my next steps' : 'Sign in to begin'}</span>
              <ArrowRight size={17} />
            </button>
          </article>

          <article className="farmer-service mint">
            <span className="service-icon">
              <CalendarDays size={22} />
            </span>
            <span className="service-number font-black">02</span>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Your repayments</h3>
            <p>
              {loan
                ? `Harvest EMI: Sowing ₹${number(loan.repayment_structure?.sowing_lean_inr ?? 1500)}/mo | Harvest ₹${number(loan.repayment_structure?.harvest_bullet_inr ?? 55000)}.`
                : 'Learn how a repayment schedule can align with your harvest and seasonal income.'}
            </p>
            <span className="service-status font-medium">
              {loan ? `Next Due: ${loan.repayment_structure?.next_due_date || '10 Oct 2024'}` : 'No repayment account linked'}
            </span>
            <button
              className="portal-link cursor-pointer"
              onClick={
                loan
                  ? () => setShowDetailedPortal(true)
                  : () =>
                      ask(
                        'Explain how harvest-based repayments work, and what I should check before agreeing to a loan.'
                      )
              }
            >
              <span>{loan ? 'View Harvest Schedule' : 'Understand my options'}</span>
              <ArrowRight size={17} />
            </button>
          </article>

          <article className="farmer-service sand">
            <span className="service-icon">
              <Sprout size={22} />
            </span>
            <span className="service-number font-black">03</span>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Your farm insights</h3>
            <p>
              {loan
                ? `Sentinel-2 NDVI ${loan.scorecard_breakdown?.satellite_ndvi_mean ?? 0.68} · 99.4% CloudGap monsoon penetration in ${loan.district}.`
                : 'Find out how satellite records, rainfall and crop health inform an assessment.'}
            </p>
            <span className="service-status font-medium">
              {loan ? `Cadastral Plot Verified (${loan.khasra_no})` : 'Farm report not linked'}
            </span>
            <button
              className="portal-link cursor-pointer"
              onClick={
                loan
                  ? () => setShowDetailedPortal(true)
                  : () =>
                      ask(
                        'Explain the land, rainfall and crop health information used in an agricultural credit assessment.'
                      )
              }
            >
              <span>{loan ? 'View Satellite Telemetry' : 'Explore farm insights'}</span>
              <ArrowRight size={17} />
            </button>
          </article>
        </div>

        {/* Details Grid: Checklist & Help */}
        <div className="farmer-details-grid">
          {/* Document Checklist */}
          <section className="portal-card farmer-documents" id="farmer-documents">
            <div className="portal-card-heading">
              <div>
                <span className="portal-eyebrow text-[#7342E2]">BE READY BEFORE YOU APPLY</span>
                <h2 style={{ fontFamily: 'var(--font-heading)' }}>Your document checklist</h2>
                <p>A personal preparation list. Requirements depend on your product.</p>
              </div>
              <span className="checklist-count font-bold">
                {checked.length}/{documents.length}
              </span>
            </div>
            <div
              className="checklist-progress"
              role="progressbar"
              aria-label="Document preparation"
              aria-valuemin={0}
              aria-valuemax={documents.length}
              aria-valuenow={checked.length}
            >
              <i style={{ width: `${(checked.length / documents.length) * 100}%` }} />
            </div>
            {documents.map((doc, i) => (
              <label className="farmer-check" key={doc}>
                <input
                  type="checkbox"
                  checked={checked.includes(doc)}
                  onChange={(e) =>
                    setChecked((prev) =>
                      e.target.checked ? [...prev, doc] : prev.filter((d) => d !== doc)
                    )
                  }
                />
                <span>
                  <b>{doc}</b>
                  <small>
                    {[
                      'Keep valid identification ready.',
                      'Have your plot reference and ownership details.',
                      'Gather statements showing your banking activity.',
                      'Note your primary crop and seasonal income.',
                    ][i]}
                  </small>
                </span>
                <FileText size={19} />
              </label>
            ))}
            <div className="checklist-note">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Ticking an item marks it ready here; it does not upload or verify a document.</span>
            </div>
          </section>

          {/* FAQ Accordion */}
          <section className="farmer-help">
            <span className="portal-eyebrow text-[#7342E2]">GOOD TO KNOW</span>
            <h2 style={{ fontFamily: 'var(--font-heading)' }}>
              Clear answers.
              <br />
              Less back and forth.
            </h2>
            {[
              [
                'Where can I see my loan balance?',
                'A verified loan account must be connected before a balance or due date can be shown. Ask your lending officer for your current statement.',
              ],
              [
                'Can I speak instead of typing?',
                'Yes. Open Saathi, choose your language, and use the microphone to record a question. You can review the words before sending.',
              ],
              [
                'Does an assessment approve my loan?',
                'An assessment helps an officer review the application. Your lender confirms approval, final terms and the repayment schedule.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  <span>{q}</span>
                  <ChevronDown size={17} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
            <button
              className="portal-btn secondary cursor-pointer"
              onClick={() => ask('I need help understanding the next step in my loan journey.')}
            >
              <MessageCircle size={17} />
              Ask a different question
            </button>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-12 border-t border-black/10 text-xs text-slate-600 font-medium">
          <button
            className="inline-flex items-center gap-1.5 hover:text-[#0B2545] cursor-pointer bg-transparent border-0 p-0"
            onClick={onBackToCockpit}
          >
            <ArrowLeft size={14} />
            <span>Back to website</span>
          </button>
          <span>BioXtreme · Built for rural progress · TVS Credit</span>
        </footer>
      </main>
    </div>
  );
}
