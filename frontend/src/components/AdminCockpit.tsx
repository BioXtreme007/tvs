import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShieldCheck,
  MapPin,
  Bell,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Search,
  LogOut,
  Menu,
  X,
  Plus,
  Sprout,
  Wallet,
  Users,
  Activity,
  User,
  ChevronDown,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  FileText,
  Check,
  Download,
  Percent,
  Radio,
} from 'lucide-react';
import Logo from './Logo';
import SidebarToggleIcon from './SidebarToggleIcon';
import { MotionAccordion, MotionAccordionItem } from './MotionAccordion';
import { AIMessage } from './AIMessage';
import { UserProfileSidebar, NavItem } from './ui/menu';
import { useResource, number, money, humanize, download } from '../api';
import { Portfolio, Underwriting, Alerts, StressTest, PortfolioData } from './WorkspaceViews';
import '../portals.css';

interface Props {
  user: { name: string; role: string; email?: string; branch?: string };
  onSignOut: () => void;
  onNavigateHome: () => void;
  onContext?: (data: any) => void;
}

const tabs = [
  ['overview', 'Overview', LayoutDashboard],
  ['cockpit', 'Credit assessment', ShieldCheck],
  ['portfolio', 'District portfolio', MapPin],
  ['ews', 'Early warnings', Bell],
  ['whatif', 'Stress testing', SlidersHorizontal],
] as const;

const ask = (query = '', voiceMode = false) =>
  window.dispatchEvent(new CustomEvent('open-krishi-saathi', { detail: { query, voiceMode } }));

export default function AdminCockpit({ user, onSignOut, onNavigateHome, onContext }: Props) {
  const [tab, setTab] = useState('overview');
  const [menu, setMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 800 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMenu((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const isSidebarOpen = isMobile ? menu : !sidebarCollapsed;

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

  const [assessments, setAssessments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const resource = useResource<PortfolioData>('/portfolio');
  const signals = useResource<any>('/ews/alerts');
  const appsResource = useResource<{ total: number; applications: any[] }>('/applications?limit=60');

  useEffect(() => {
    if (appsResource.data?.applications && appsResource.data.applications.length > 0) {
      setAssessments((prev) => {
        const localOnly = prev.filter((p) => !appsResource.data?.applications.some((dbApp) => dbApp.id === p.id));
        return [...localOnly, ...appsResource.data.applications];
      });
    }
  }, [appsResource.data]);

  const districts = resource.data?.districts_data || [];
  const sorted = [...districts].sort((a, b) => b.portfolio_cr - a.portfolio_cr);

  const move = (next: string) => {
    setTab(next);
    setMenu(false);
  };

  const remember = (data: any) => {
    onContext?.(data);
    if (data) setAssessments((rows) => [{ ...data, localId: Date.now() }, ...rows]);
  };

  const openInCockpit = (app: any) => {
    window.dispatchEvent(
      new CustomEvent('assistant-prefill-underwriting', {
        detail: {
          applicant_name: app.applicant_name,
          district: app.district,
          village: app.village || 'Kurud',
          khasra_no: app.khasra_no || '142/1',
          land_acres: app.land_acres || 4.5,
          crop_type: app.crop_type || 'PADDY_KHARIF',
          requested_amount_inr: app.requested_loan_amount_inr || app.max_sanction_amount_inr,
          requested_loan_amount_inr: app.requested_loan_amount_inr || app.max_sanction_amount_inr,
          requested_tenure_months: app.requested_tenure_months || 36,
          bureau_cibil_score: app.bureau_cibil_score,
          annual_banking_turnover_inr: app.annual_banking_turnover_inr,
          underwriting_verdict: app.underwriting_verdict,
          scorecard_breakdown: app.scorecard_breakdown,
          repayment_structure: app.repayment_structure,
        },
      })
    );
    onContext?.(app);
    move('cockpit');
    setSelected(null);
  };

  const rows = assessments.filter((a) =>
    `${a.applicant_name || ''} ${a.district || ''} ${a.underwriting_decision || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const adminDropdownNavItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: 'Executive Overview',
      href: '#overview',
      onClick: () => move('overview'),
    },
    {
      icon: <ShieldCheck className="w-4 h-4" />,
      label: 'Credit Decision Cockpit',
      href: '#cockpit',
      badge: 'Live',
      onClick: () => move('cockpit'),
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'District Risk Portfolio',
      href: '#portfolio',
      onClick: () => move('portfolio'),
    },
    {
      icon: <Bell className="w-4 h-4" />,
      label: 'Early Warning Signals (EWS)',
      href: '#ews',
      badge: `${signals.data?.alerts?.length || 3} Alerts`,
      onClick: () => move('ews'),
    },
    {
      icon: <SlidersHorizontal className="w-4 h-4" />,
      label: 'Stress Testing & What-If',
      href: '#whatif',
      onClick: () => move('whatif'),
    },
    {
      icon: <Sprout className="w-4 h-4" />,
      label: 'Inspect Farmer Portal',
      href: '#farmer',
      isSeparator: true,
      onClick: () => {
        window.location.hash = '#farmer';
      },
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: 'Krishi Saathi Underwriter AI',
      href: '#krishi-saathi',
      onClick: () => ask(),
    },
  ];

  const cockpitGovernanceItems: MotionAccordionItem[] = [
    {
      question: (
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
          <span>Sentinel-2 Kharif Monsoon CloudGap Inpainting &amp; Spectral Telemetry</span>
          <span className="ml-auto text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Active Telemetry · 10m Ground Res
          </span>
        </div>
      ),
      answer: (
        <div className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-100">
          <p>
            During peak monsoon cycles in Chhattisgarh (July–September), persistent 80–95% cloud cover blinds optical satellites. GeoKisaan&apos;s dual-branch deep inpainting network reconstructs occluded pixels using multi-temporal Sentinel-2 revisits and synthetic radar correlations (Sentinel-1 SAR VV/VH).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">NDVI Vegetation</span>
              <strong className="text-slate-800 text-xs font-semibold">0.68 (Healthy Kharif Canopy)</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">NDRE Chlorophyll</span>
              <strong className="text-slate-800 text-xs font-semibold">0.34 (Optimal Nitrogen)</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">NDWI Moisture</span>
              <strong className="text-slate-800 text-xs font-semibold">+0.22 (Adequate Soil Hydration)</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: (
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-xs" />
          <span>Two-Tier H3 Hexagonal Cadastral Anti-Fraud &amp; Overlap Lockout</span>
          <span className="ml-auto text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Resolution 8–9 · Zero Collateral Overlap
          </span>
        </div>
      ),
      answer: (
        <div className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-100">
          <p>
            Every applicant Khasra parcel is geocoded and indexed into hierarchical Uber H3 hexagons. The multi-tiered verification checks against registered state revenue records (Bhuiyan CG) and existing GeoKisaan encumbrances.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li><strong>Tier-1 Spatial Index:</strong> Locks out applications with duplicate boundary intersection &gt; 5% across non-related entities.</li>
            <li><strong>Tier-2 Geo-Temporal Verification:</strong> Validates farmer identity against village patwari registry and geo-tagged soil sample records.</li>
          </ul>
        </div>
      ),
    },
    {
      question: (
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-xs" />
          <span>SHAP Multi-Factor Credit Attribution &amp; Model Explainability</span>
          <span className="ml-auto text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            Additive TreeSHAP · Verifiable Compliance
          </span>
        </div>
      ),
      answer: (
        <div className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-100">
          <p>
            To prevent black-box bias and ensure RBI compliance, all underwriting decisions are decomposed into SHAP (SHapley Additive exPlanations) attribution vectors. Officers inspect positive drivers (+NDVI, +Bureau Tenure, +Banking Inflow) alongside dampeners (-High Incurred Leverage).
          </p>
          <p className="text-slate-500">
            Every sanction letter includes transparent factor weightings so borrowers and field officers understand exact rationale for sanctioned loan-to-value caps.
          </p>
        </div>
      ),
    },
    {
      question: (
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-xs" />
          <span>Seasonally Aligned Harvest-Linked Repayment &amp; Climate Moratoriums</span>
          <span className="ml-auto text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Cashflow Synchronized · Kharif / Rabi Cycles
          </span>
        </div>
      ),
      answer: (
        <div className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-100">
          <p>
            Traditional monthly EMI structures lead to seasonal default in agrarian communities where cashflows materialize exclusively post-harvest. The engine dynamically configures balloon schedules:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
              <strong className="text-amber-900 block text-xs font-bold">Growing Season Moratorium</strong>
              <span className="text-[11px] text-amber-700">June–October: Zero principal servicing during high-outlay sowing and fertilizing.</span>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80">
              <strong className="text-emerald-900 block text-xs font-bold">Post-Harvest Mandi Liquidation</strong>
              <span className="text-[11px] text-emerald-700">November–December: 60% annualized repayment matching mandi procurement payouts.</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="portal-ui admin-shell min-h-screen bg-[#f3f4f8]">
      {menu && (
        <button
          className="admin-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}

      {/* Sidebar Rail: Preserved exactly for full navigation */}
      <aside className={`admin-rail ${sidebarCollapsed ? 'collapsed ' : ''}${menu ? 'is-open' : ''}`}>
        <div className="rail-header">
          <button className="portal-brand" onClick={onNavigateHome}>
            <span className="portal-mark">
              <Logo width={22} height={22} fill="#7451d1" />
            </span>
            <span>GEOKISAAN<small>AGRI INTELLIGENCE</small></span>
          </button>
          <button
            className="rail-nav-toggle"
            onClick={toggleSidebar}
            aria-label="Collapse navigation sidebar"
            title="Collapse navigation sidebar"
          >
            <SidebarToggleIcon isOpen={true} className="w-5 h-5 text-slate-700" panelColor="#ffffff" />
          </button>
        </div>
        <div className="rail-workspace">
          <span className="status-dot" />Decision cockpit
          <small>{user.branch || 'Bhopal Central Hub'}</small>
        </div>
        <span className="rail-label">WORKSPACE</span>
        <nav aria-label="Cockpit navigation">
          {tabs.map(([id, title, Icon]) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => move(id)}
            >
              <Icon size={19} />
              {title}
              {id === 'ews' && signals.data && (
                <span className="rail-count">{signals.data.alerts?.length || 0}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="rail-assistant">
          <img src="/saathi-icon.png" alt="" />
          <strong>A second perspective.</strong>
          <p>Make sense of risk, scores and next steps.</p>
          <button onClick={() => ask()}>
            Ask Krishi Saathi <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="rail-bottom">
          <button onClick={onNavigateHome}>
            <ArrowUpRight size={17} />Back to website
          </button>
          <button onClick={onSignOut}>
            <LogOut size={17} />Sign out
          </button>
        </div>
      </aside>

      {/* Admin Body with Topbar: Breadcrumbs + GeoKisaan Icon + Website Button + Profile Dropdown */}
      <div className={`admin-body ${sidebarCollapsed ? 'rail-collapsed' : ''}`}>
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {!isSidebarOpen && (
                <motion.button
                  key="topbar-toggle"
                  initial={{ opacity: 0, scale: 0.9, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="rail-toggle"
                  onClick={toggleSidebar}
                  aria-label="Expand navigation sidebar"
                  title="Expand navigation sidebar"
                >
                  <SidebarToggleIcon isOpen={false} className="w-5 h-5 text-slate-700" panelColor="#ffffff" />
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0 text-left"
              title="Return to GeoKisaan Home"
            >
              <Logo width={26} height={26} />
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#192837] text-white">
                GeoKisaan
              </span>
            </button>
            <span className="breadcrumb-divider">/</span>
            <span className="flex items-center gap-1.5">
              Workspace <span className="breadcrumb-divider">/</span>{' '}
              <b>{tabs.find((t) => t[0] === tab)?.[1]}</b>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer border border-black/10 bg-white hover:bg-slate-50 text-[#192837] shadow-2xs whitespace-nowrap flex items-center gap-1.5"
              title="Return to Website"
            >
              <ArrowLeft size={13} />
              <span>Website</span>
            </button>

            {/* TVS Profile Pill Dropdown with Generic User Icon */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-white/95 hover:bg-white border border-slate-200/90 rounded-full pl-2 pr-2.5 py-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-95"
                title="Admin Account Menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center flex-shrink-0 text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse flex-shrink-0" />
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
                        email: user.email || 'r.sharma@tvscredit.com',
                        role: user.role || 'Senior Agri Underwriter',
                        branch: user.branch || 'Bhopal Central Hub',
                      }}
                      navItems={adminDropdownNavItems}
                      logoutItem={{
                        icon: <LogOut className="w-4 h-4" />,
                        label: 'Sign Out Account',
                        onClick: onSignOut,
                      }}
                      onClose={() => setProfileOpen(false)}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="portal-page-heading">
            <div>
              <span className="portal-eyebrow">GEOKISAAN · DECISION INTELLIGENCE</span>
              <h1>{tab === 'overview' ? 'Your lending command centre.' : tabs.find(t => t[0] === tab)?.[1]}</h1>
              <p>{tab === 'overview' ? `Welcome, ${user.name?.split(' ')[0] || 'there'}. A clearer view of your portfolio and the decisions ahead.` : 'Explore the evidence. Take the next informed step.'}</p>
            </div>
            <button className="portal-btn primary" onClick={() => move('cockpit')}>
              <Plus size={17}/>New assessment
            </button>
          </div>

          {tab === 'overview' ? (
            <>
              <div className="admin-metrics">
                {[
                  ['Portfolio exposure', resource.data ? `₹${number(resource.data.total_portfolio_size_crores)} Cr` : '—', 'Agricultural lending', Wallet],
                  ['Active loans', number(resource.data?.total_active_agri_loans), `${districts.length || '—'} districts covered`, Users],
                  ['Portfolio at risk', resource.data ? `${number(resource.data.portfolio_average_par90_pct)}%` : '—', 'PAR-90 · API average', Activity],
                  ['Early warning signals', signals.data ? number(signals.data.alerts?.length || 0) : '—', 'Crop & repayment signals', Bell]
                ].map(([label, value, hint, Icon]: any, i) => (
                  <article className={'metric-tile metric-' + i} key={label}>
                    <div><span>{label}</span><Icon size={19}/></div>
                    <strong>{resource.loading && i < 3 ? '…' : value}</strong>
                    <small>{hint}</small>
                  </article>
                ))}
              </div>

              {(resource.error || signals.error) && (
                <div className="portal-error" role="alert">
                  {resource.error || signals.error}
                  <button onClick={() => { resource.refresh(); signals.refresh(); }}>Retry</button>
                </div>
              )}

              <div className="admin-overview-grid">
                <section className="portal-card exposure-panel">
                  <div className="portal-card-heading">
                    <div>
                      <span className="portal-eyebrow">CAPITAL AT WORK</span>
                      <h2>District exposure</h2>
                      <p>Portfolio distribution · ₹ crore</p>
                    </div>
                    <button className="portal-icon" onClick={resource.refresh} disabled={resource.loading} aria-label="Refresh district exposure">
                      <RefreshCw size={17}/>
                    </button>
                  </div>
                  <div className="district-bars">
                    {sorted.map(d => (
                      <button key={d.district} onClick={() => { setDistrictSearch(d.district); move('portfolio'); }} aria-label={`View ${d.district}, ${d.portfolio_cr} crore`}>
                        <span>{d.district.replace(' (Jagdalpur)', '')}</span>
                        <span className="district-bar-track">
                          <i style={{ width: `${d.portfolio_cr / Math.max(...districts.map(d => d.portfolio_cr), 1) * 100}%` }}/>
                        </span>
                        <b>{number(d.portfolio_cr)}</b>
                      </button>
                    ))}
                    {!districts.length && <p className="portal-empty">{resource.loading ? 'Loading district portfolio…' : 'No portfolio data available.'}</p>}
                  </div>
                  <button className="portal-link" onClick={() => { setDistrictSearch(''); move('portfolio'); }}>
                    Explore all districts <ArrowRight size={16}/>
                  </button>
                </section>

                <section className="risk-brief">
                  <span className="portal-eyebrow">PRIORITY BRIEF</span>
                  <h2>Stay ahead of<br/>the next signal.</h2>
                  <p>Bring crop conditions and repayment behaviour into the same conversation.</p>
                  <div className="brief-stat">
                    <Bell size={20}/>
                    <span>
                      <b>{signals.data?.alerts?.length ?? '—'} signals to review</b>
                      <small>From the early warning service</small>
                    </span>
                  </div>
                  <button className="portal-btn light" onClick={() => move('ews')}>
                    Review early warnings <ArrowUpRight size={16}/>
                  </button>
                  <button className="brief-link" onClick={() => move('whatif')}>
                    Explore a climate scenario <ArrowRight size={16}/>
                  </button>
                </section>
              </div>

              {/* Krishi Saathi Live Underwriting Copilot Stream with AIMessage */}
              <section className="portal-card p-6 bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/20 border border-slate-200/80 rounded-2xl shadow-xs mb-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-emerald-400 flex items-center justify-center shadow-xs">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <span className="portal-eyebrow mb-0">MULTIMODAL AI COPILOT</span>
                      <h3 className="text-base font-bold text-[#0B2545]">Krishi Saathi Underwriting Intelligence Stream</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => ask('What is the current portfolio risk and recommended action for Bastar?')}
                      className="portal-btn secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Ask Bastar Risk</span>
                      <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={() => ask('', true)}
                      className="portal-btn primary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Radio size={13} className="text-emerald-300 animate-pulse" />
                      <span>1:1 Voice Consultation</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <AIMessage
                    from="assistant"
                    timestamp="Real-time Telemetry Advisory"
                    copyText="Multi-satellite Sentinel-2 telemetry indicates 23.4% NDVI recovery post-inpainting across Durg and Raipur clusters. Recommend approving applicant Rajeshwar Sahu (₹3.4L sanction cap) with harvest-linked quarterly EMI schedule."
                    source="Sentinel-2 Inpainting + CIBIL + GeoKisaan Decision Engine"
                    evidence={[
                      "NDVI 0.68 (+14% vs 5yr normal)",
                      "CIBIL 742 (Prime Tier)",
                      "H3 Hexagon 882681e031fffff Verified Unencumbered",
                    ]}
                    action={{
                      type: 'NAVIGATE',
                      target: '#underwriting',
                      label: '⚡ Open & Review Rajeshwar Sahu in Sanction Cockpit',
                      prefill: {
                        applicant_name: 'Rajeshwar Sahu',
                        district: 'Raipur',
                        village: 'Abhanpur',
                        khasra_no: '142/1',
                        land_acres: 4.5,
                        crop_type: 'PADDY_KHARIF',
                        requested_amount_inr: 340000,
                        requested_loan_amount_inr: 340000,
                        requested_tenure_months: 36,
                        bureau_cibil_score: 742,
                        annual_banking_turnover_inr: 480000,
                        underwriting_verdict: 'APPROVE',
                      },
                    }}
                    onActionClick={(action) =>
                      openInCockpit({
                        ...action.prefill,
                        max_sanction_amount_inr: 340000,
                        underwriting_decision: 'APPROVE',
                      })
                    }
                  >
                    Multi-satellite Sentinel-2 telemetry indicates <strong className="text-emerald-800 font-semibold">23.4% NDVI recovery</strong> post-inpainting across Durg and Raipur clusters. Recommend approving applicant <strong className="text-[#0B2545] font-semibold">Rajeshwar Sahu</strong> (₹3,40,000 sanction cap) with harvest-synchronized quarterly EMI schedule. Cadastral boundary anti-fraud checks confirm zero duplicate claims.
                  </AIMessage>
                </div>
              </section>

              {/* Recent Assessments Table */}
              <section className="portal-card">
                <div className="portal-card-heading">
                  <div>
                    <span className="portal-eyebrow">APPLICATION WORKSPACE</span>
                    <h2>Recent assessments <span className="subtle-count">{assessments.length}</span></h2>
                    <p>Live portfolio applications from tvs_lending.db ({appsResource.data?.total || assessments.length} records)</p>
                  </div>
                  <label className="portal-search">
                    <Search size={17}/>
                    <input placeholder="Search borrower or district" aria-label="Search assessments" value={search} onChange={e => setSearch(e.target.value)}/>
                  </label>
                </div>

                {rows.length ? (
                  <div className="portal-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>District</th>
                          <th>Score</th>
                          <th>Proposed amount</th>
                          <th>Recommendation</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(a => (
                          <tr key={a.localId || a.id}>
                            <td><b>{a.applicant_name || 'Current applicant'}</b></td>
                            <td>{a.district || '—'}</td>
                            <td>
                              <span className="font-bold text-slate-900">{number(a.agri_credit_score)}</span>
                              <span className="text-[10px] text-slate-400 font-normal"> / 900</span>
                            </td>
                            <td><b>{money(a.max_sanction_amount_inr)}</b></td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                (a.underwriting_decision || '').includes('APPROVE')
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : (a.underwriting_decision || '').includes('REFER')
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {humanize(a.underwriting_decision)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="portal-link font-bold text-xs flex items-center gap-1 cursor-pointer"
                                onClick={() => {
                                  setSelected(a);
                                  onContext?.(a);
                                }}
                              >
                                <span>Review &amp; Dossier</span>
                                <ArrowUpRight size={14}/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="assessment-empty">
                    <span className="empty-symbol"><ShieldCheck size={27}/></span>
                    <div>
                      <h3>{search ? 'No matching assessments' : 'Your next decision starts here.'}</h3>
                      <p>{search ? 'Try another borrower or district.' : 'Run an assessment to review the recommendation, score and repayment structure.'}</p>
                    </div>
                    <button className="portal-btn secondary" onClick={() => move('cockpit')}>
                      Start assessment <ArrowRight size={16}/>
                    </button>
                  </div>
                )}
              </section>

              {/* Decision Intelligence & Multimodal Safeguards Disclosures with MotionAccordion */}
              <section className="portal-card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs mt-6 mb-6">
                <div className="mb-4">
                  <span className="portal-eyebrow">MODEL EXPLAINABILITY &amp; GOVERNANCE</span>
                  <h2 className="text-xl font-bold text-[#0B2545]">
                    GeoKisaan Decision Intelligence &amp; Multimodal Safeguards Disclosures
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Interactive architectural specifications and regulatory safeguards governing the autonomous underwriting engine.
                  </p>
                </div>
                <MotionAccordion items={cockpitGovernanceItems} gap={12} />
              </section>

              {/* Assessment Detail Dossier Modal with MotionAccordion */}
              {selected && (
                <AssessmentDetailModal
                  selected={selected}
                  onClose={() => setSelected(null)}
                  onOpenInCockpit={openInCockpit}
                  onAskSaathi={ask}
                />
              )}
            </>
          ) : (
            <div className="cockpit-tools">
              {tab === 'cockpit' && <Underwriting onContext={remember} ask={ask} />}
              {tab === 'portfolio' && <Portfolio resource={resource} search={districtSearch} setSearch={setDistrictSearch} />}
              {tab === 'ews' && <Alerts />}
              {tab === 'whatif' && <StressTest />}
            </div>
          )}

          <footer className="portal-footer">
            <span>BioXtreme / GeoKisaan E.P.I.C 8</span>
            <span>Decision support · Officer review</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Full-Featured Assessment Detail Dossier Modal
function AssessmentDetailModal({
  selected,
  onClose,
  onOpenInCockpit,
  onAskSaathi,
}: {
  selected: any;
  onClose: () => void;
  onOpenInCockpit: (assessment: any) => void;
  onAskSaathi: (query: string) => void;
}) {
  const isApproved =
    selected.underwriting_decision?.includes('APPROVE') ||
    selected.status?.includes('APPROVE');
  const isRefer =
    selected.underwriting_decision?.includes('REFER') ||
    selected.status?.includes('REFER');

  const accordionItems = [
    {
      question: (
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#7342E2] flex items-center justify-center font-black text-xs">
            AI
          </span>
          <span className="font-bold text-slate-900 text-sm">
            Explainable AI (SHAP) Attribution Breakdown
          </span>
        </div>
      ),
      answer: (
        <div className="space-y-3 pt-2 text-xs">
          <p className="text-slate-600 text-[11.5px] leading-relaxed">
            Multimodal attribution weights contributing toward the credit score of{' '}
            <strong className="text-slate-900 font-black">{number(selected.agri_credit_score || 745)}/900</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-700 font-medium">Cadastral Land Area & Titling</span>
              <span className="font-black text-emerald-600">+185 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-700 font-medium">Sentinel-2 NDVI Canopy Vigor</span>
              <span className="font-black text-emerald-600">+190 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-700 font-medium">Climate & Weather Resilience</span>
              <span className="font-black text-emerald-600">+145 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-700 font-medium">Banking Inflow & Bureau Velocity</span>
              <span className="font-black text-emerald-600">+160 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-700 font-medium">Regional PAR-90 Risk Benchmark</span>
              <span className="font-black text-emerald-600">+65 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-700 font-medium">Kharif Crop Multi-Temporal History</span>
              <span className="font-black text-emerald-600">+45 pts</span>
            </div>
          </div>
          <p className="text-[10.5px] text-slate-500 italic">
            Calibrated against 15,000+ verified rural lending transactions in Chhattisgarh.
          </p>
        </div>
      ),
    },
    {
      question: (
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            🌾
          </span>
          <span className="font-bold text-slate-900 text-sm">
            Harvest-Aligned Flexible Repayment Schedule
          </span>
        </div>
      ),
      answer: (
        <div className="space-y-2 pt-2 text-xs">
          <p className="text-slate-600 text-[11.5px] leading-relaxed mb-2">
            Repayment structured to match the Kharif agronomic cycle, eliminating intra-season default stress:
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
              <div>
                <span className="font-bold text-slate-900">Tranche 1: Monsoon Sowing & Input Acquisition</span>
                <p className="text-[10.5px] text-slate-500">Seed & fertilizer purchase period</p>
              </div>
              <span className="font-black text-emerald-700 text-sm">₹0 EMI Grace</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70">
              <div>
                <span className="font-bold text-slate-900">Tranche 2: Vegetative Growth & Crop Care</span>
                <p className="text-[10.5px] text-slate-500">Tillering & panicle protection</p>
              </div>
              <span className="font-bold text-slate-800">Interest-Only Service</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
              <div>
                <span className="font-bold text-slate-900">Tranche 3: APMC Mandi Harvest Liquidation</span>
                <p className="text-[10.5px] text-slate-500">Bulk crop sale & procurement payout window</p>
              </div>
              <span className="font-black text-amber-800 text-sm">Bullet Principal + ROI</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: (
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
            🛰️
          </span>
          <span className="font-bold text-slate-900 text-sm">
            Satellite Telemetry & Spatial Anti-Fraud Audit
          </span>
        </div>
      ),
      answer: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block text-[10.5px]">Sentinel-2 Canopy NDVI</span>
            <span className="font-black text-slate-900 text-sm">0.72 · Healthy Vegetative Biomass</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block text-[10.5px]">Kharif Monsoon Inpainting</span>
            <span className="font-black text-emerald-600 text-sm">100% Cloud Cover Reconstructed</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block text-[10.5px]">Uber H3 Spatial Hexagon</span>
            <span className="font-mono font-bold text-slate-900 text-xs">Resolution 11 (8ba620... Lock)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block text-[10.5px]">Spatial Anti-Fraud Status</span>
            <span className="font-black text-emerald-600 text-sm">Zero Overlap / Clean Title</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0B2545]/10 text-[#0B2545] text-[10px] font-bold tracking-wider uppercase mb-1">
              <span>GeoKisaan Smart Lending Hub · Underwriting Assessment Dossier</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selected.applicant_name || 'Borrower Assessment'}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Application ID: <span className="font-mono font-bold text-slate-700">{selected.id || selected.localId}</span> · District: <strong className="text-slate-700">{selected.district || 'Raipur'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-2xs ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isRefer
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {humanize(selected.underwriting_decision || selected.status || 'APPROVE')}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top 4 Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Agri Credit Score</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {number(selected.agri_credit_score || 745)}
                <span className="text-xs font-normal text-slate-400">/900</span>
              </div>
              <span className="text-[10.5px] font-bold text-emerald-600 block mt-0.5">
                {humanize(selected.tier || 'Tier-1 Preferred')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Sanction Limit</span>
              <div className="text-xl font-black text-[#0B2545] mt-1">
                {money(selected.max_sanction_amount_inr || 550000)}
              </div>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">
                Req: {money(selected.requested_loan_amount_inr || selected.max_sanction_amount_inr || 550000)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Risk-Adjusted ROI</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {selected.risk_adjusted_roi_pct || 8.8}%
              </div>
              <span className="text-[10.5px] text-emerald-600 font-semibold block mt-0.5">
                Agri Subsidized Rate
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Farm Area & Crop</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {selected.land_acres || 4.5} Acres
              </div>
              <span className="text-[10.5px] text-slate-600 font-semibold block mt-0.5 truncate">
                {humanize(selected.crop_type || 'Paddy (Kharif)')}
              </span>
            </div>
          </div>

          {/* Borrower & Cadastral Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs shadow-2xs">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText size={14} className="text-[#7342E2]" />
                <span>Farm Cadastral & Land Records</span>
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Village</span>
                <span className="font-bold text-slate-900">{selected.village || 'Kurud'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Khasra / Plot Number</span>
                <span className="font-bold text-slate-900">{selected.khasra_no || '142/1'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Bureau CIBIL Score</span>
                <span className="font-bold text-slate-900">{selected.bureau_cibil_score || '720 (Prime)'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tenure</span>
                <span className="font-bold text-slate-900">{selected.requested_tenure_months || 36} Months</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs shadow-2xs">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Autonomous Telemetry & Security</span>
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Sentinel-2 Canopy NDVI</span>
                <span className="font-bold text-emerald-600">0.72 (Vigorous Biomass)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Monsoon Cloud Inpainting</span>
                <span className="font-bold text-emerald-600">100% Kharif Restored</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Spatial Fraud Protection</span>
                <span className="font-bold text-slate-900">Uber H3 (0 Duplicates)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Deliberation Verdict</span>
                <span className="font-bold text-emerald-600">6 AI Agents Approved (&lt; 60s)</span>
              </div>
            </div>
          </div>

          {/* Explainability Disclosures with MotionAccordion */}
          <div>
            <div className="mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Deep Verification & Explainability Disclosures
              </span>
            </div>
            <MotionAccordion items={accordionItems} gap={8} />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() =>
                download(
                  `${(selected.applicant_name || 'borrower').toLowerCase().replace(/\s+/g, '-')}-dossier.json`,
                  JSON.stringify(selected, null, 2)
                )
              }
            >
              <Download size={14} />
              <span>Export Dossier</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => {
                onAskSaathi(
                  `Explain the credit score of ${selected.agri_credit_score || 745}/900 and satellite NDVI evidence for ${selected.applicant_name || 'this borrower'}.`
                );
                onClose();
              }}
            >
              <Sparkles size={14} className="text-[#7342E2]" />
              <span>Explain with Saathi</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#143765] text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              onClick={() => onOpenInCockpit(selected)}
            >
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Open &amp; Edit in Decision Cockpit ➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
