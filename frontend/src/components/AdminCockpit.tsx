import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import Logo from './Logo';
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

const ask = (query = '') => window.dispatchEvent(new CustomEvent('open-krishi-saathi', { detail: { query } }));

export default function AdminCockpit({ user, onSignOut, onNavigateHome, onContext }: Props) {
  const [tab, setTab] = useState('overview');
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
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

  const [assessments, setAssessments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const resource = useResource<PortfolioData>('/portfolio');
  const signals = useResource<any>('/ews/alerts');
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
      <aside className={'admin-rail ' + (menu ? 'is-open' : '')}>
        <button className="portal-brand" onClick={onNavigateHome}>
          <span className="portal-mark">
            <Logo width={22} height={22} fill="#7451d1" />
          </span>
          <span>TVS CREDIT<small>AGRI INTELLIGENCE</small></span>
        </button>
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

      {/* Admin Body with Topbar: Breadcrumbs + TVS Credit Icon + Website Button + Profile Dropdown */}
      <div className="admin-body">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <button
              className="rail-toggle"
              onClick={() => setMenu(!menu)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0 text-left"
              title="Return to TVS Credit Home"
            >
              <Logo width={26} height={26} />
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#192837] text-white">
                TVS Credit
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

        <main className="admin-content"><div className="portal-page-heading"><div><span className="portal-eyebrow">TVS CREDIT · DECISION INTELLIGENCE</span><h1>{tab === 'overview' ? 'Your lending command centre.' : tabs.find(t => t[0] === tab)?.[1]}</h1><p>{tab === 'overview' ? `Welcome, ${user.name?.split(' ')[0] || 'there'}. A clearer view of your portfolio and the decisions ahead.` : 'Explore the evidence. Take the next informed step.'}</p></div><button className="portal-btn primary" onClick={() => move('cockpit')}><Plus size={17}/>New assessment</button></div>
    {tab === 'overview' ? <>
      <div className="admin-metrics">{[
        ['Portfolio exposure', resource.data ? `₹${number(resource.data.total_portfolio_size_crores)} Cr` : '—', 'Agricultural lending', Wallet], ['Active loans', number(resource.data?.total_active_agri_loans), `${districts.length || '—'} districts covered`, Users], ['Portfolio at risk', resource.data ? `${number(resource.data.portfolio_average_par90_pct)}%` : '—', 'PAR-90 · API average', Activity], ['Early warning signals', signals.data ? number(signals.data.alerts?.length || 0) : '—', 'Crop & repayment signals', Bell]
      ].map(([label, value, hint, Icon]: any, i) => <article className={'metric-tile metric-' + i} key={label}><div><span>{label}</span><Icon size={19}/></div><strong>{resource.loading && i < 3 ? '…' : value}</strong><small>{hint}</small></article>)}</div>
      {(resource.error || signals.error) && <div className="portal-error" role="alert">{resource.error || signals.error}<button onClick={() => { resource.refresh(); signals.refresh(); }}>Retry</button></div>}
      <div className="admin-overview-grid"><section className="portal-card exposure-panel"><div className="portal-card-heading"><div><span className="portal-eyebrow">CAPITAL AT WORK</span><h2>District exposure</h2><p>Portfolio distribution · ₹ crore</p></div><button className="portal-icon" onClick={resource.refresh} disabled={resource.loading} aria-label="Refresh district exposure"><RefreshCw size={17}/></button></div><div className="district-bars">{sorted.map(d => <button key={d.district} onClick={() => { setDistrictSearch(d.district); move('portfolio'); }} aria-label={`View ${d.district}, ${d.portfolio_cr} crore`}><span>{d.district.replace(' (Jagdalpur)', '')}</span><span className="district-bar-track"><i style={{ width: `${d.portfolio_cr / Math.max(...districts.map(d => d.portfolio_cr), 1) * 100}%` }}/></span><b>{number(d.portfolio_cr)}</b></button>)}{!districts.length && <p className="portal-empty">{resource.loading ? 'Loading district portfolio…' : 'No portfolio data available.'}</p>}</div><button className="portal-link" onClick={() => { setDistrictSearch(''); move('portfolio'); }}>Explore all districts <ArrowRight size={16}/></button></section>
      <section className="risk-brief"><span className="portal-eyebrow">PRIORITY BRIEF</span><h2>Stay ahead of<br/>the next signal.</h2><p>Bring crop conditions and repayment behaviour into the same conversation.</p><div className="brief-stat"><Bell size={20}/><span><b>{signals.data?.alerts?.length ?? '—'} signals to review</b><small>From the early warning service</small></span></div><button className="portal-btn light" onClick={() => move('ews')}>Review early warnings <ArrowUpRight size={16}/></button><button className="brief-link" onClick={() => move('whatif')}>Explore a climate scenario <ArrowRight size={16}/></button></section></div>
      <section className="portal-card"><div className="portal-card-heading"><div><span className="portal-eyebrow">APPLICATION WORKSPACE</span><h2>Recent assessments <span className="subtle-count">{assessments.length}</span></h2><p>Assessments completed in this session</p></div><label className="portal-search"><Search size={17}/><input placeholder="Search borrower or district" aria-label="Search assessments" value={search} onChange={e => setSearch(e.target.value)}/></label></div>{rows.length ? <div className="portal-table-scroll"><table><thead><tr><th>Applicant</th><th>District</th><th>Score</th><th>Proposed amount</th><th>Recommendation</th><th>Details</th></tr></thead><tbody>{rows.map(a => <tr key={a.localId}><td><b>{a.applicant_name || 'Current applicant'}</b></td><td>{a.district || '—'}</td><td>{number(a.agri_credit_score)}</td><td>{money(a.max_sanction_amount_inr)}</td><td>{humanize(a.underwriting_decision)}</td><td><button className="portal-link" onClick={() => { setSelected(a); onContext?.(a); }}>Review <ArrowUpRight size={14}/></button></td></tr>)}</tbody></table></div> : <div className="assessment-empty"><span className="empty-symbol"><ShieldCheck size={27}/></span><div><h3>{search ? 'No matching assessments' : 'Your next decision starts here.'}</h3><p>{search ? 'Try another borrower or district.' : 'Run an assessment to review the recommendation, score and repayment structure.'}</p></div><button className="portal-btn secondary" onClick={() => move('cockpit')}>Start assessment <ArrowRight size={16}/></button></div>}</section>
      {selected && <section className="portal-card selected-assessment"><button className="portal-icon" aria-label="Close assessment detail" onClick={() => setSelected(null)}><X size={18}/></button><span className="portal-eyebrow">ASSESSMENT DETAIL</span><h2>{selected.applicant_name || 'Current applicant'}</h2><p>{humanize(selected.underwriting_decision)} · {money(selected.max_sanction_amount_inr)} proposed · Score {number(selected.agri_credit_score)}</p><div className="portal-actions"><button className="portal-btn primary" onClick={() => ask('Explain this assessment and its main risk factors.')}>Explain with Saathi</button><button className="portal-btn secondary" onClick={() => download('assessment-summary.json', JSON.stringify(selected, null, 2))}>Export summary</button></div></section>}
    </> : (
      <div className="cockpit-tools">
        {tab === 'cockpit' && <Underwriting onContext={remember} ask={ask} />}
        {tab === 'portfolio' && <Portfolio resource={resource} search={districtSearch} setSearch={setDistrictSearch} />}
        {tab === 'ews' && <Alerts />}
        {tab === 'whatif' && <StressTest />}
      </div>
    )}
        <footer className="portal-footer">
          <span>BioXtreme / TVS Credit E.P.I.C 8</span>
          <span>Decision support · Officer review</span>
        </footer>
      </main>
    </div>
  </div>
  );
}
