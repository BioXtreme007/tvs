import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowLeft, ArrowUpRight, Bell, ChartNoAxesCombined, ChevronRight, CircleHelp, LayoutDashboard, Leaf, LogOut, Menu, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles, Sprout, X } from 'lucide-react';
import { api, useResource } from './api';
import { Overview, Portfolio, Underwriting, Alerts, StressTest, FarmerView, SignIn, PortfolioData } from './components/WorkspaceViews';
import Assistant from './components/Assistant';
import SidebarToggleIcon from './components/SidebarToggleIcon';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'underwriting', label: 'Underwriting', icon: ShieldCheck },
  { id: 'portfolio', label: 'Portfolio', icon: ChartNoAxesCombined },
  { id: 'ews', label: 'Early warnings', icon: Bell },
  { id: 'stress-sim', label: 'Stress testing', icon: SlidersHorizontal },
  { id: 'krishi-saathi', label: 'Krishi Saathi', icon: Sparkles },
];
const titles: Record<string, string> = { overview: 'Portfolio overview', underwriting: 'New assessment', portfolio: 'District portfolio', ews: 'Early warnings', 'stress-sim': 'Stress testing', 'krishi-saathi': 'Your lending assistant', farmer: 'Farmer services', signin: 'Welcome back' };
function getRoute() {
  const hash = window.location.hash.slice(1);
  return titles[hash] ? hash : 'overview';
}
function readUser() {
  try { return JSON.parse(localStorage.getItem('tvs_credit_user') || 'null'); } catch { return null; }
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [mobile, setMobile] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [user, setUser] = useState(readUser);
  const [health, setHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [context, setContext] = useState<Record<string, any> | null>(null);
  const [search, setSearch] = useState('');
  const [assistantDraft, setAssistantDraft] = useState('');
  const portfolio = useResource<PortfolioData>('/portfolio');
  const opener = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement>(null);
  const assistantRef = useRef<HTMLElement>(null);

  const navigate = (id: string) => {
    setMobile(false); setAssistantOpen(false);
    window.location.hash = id;
  };
  useEffect(() => {
    const changed = () => { setRoute(getRoute()); setMobile(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', changed);
    const controller = new AbortController();
    api('/health', { signal: controller.signal }).then(() => setHealth('online')).catch(() => { if (!controller.signal.aborted) setHealth('offline'); });
    return () => { window.removeEventListener('hashchange', changed); controller.abort(); };
  }, []);
  useEffect(() => { document.title = titles[route] + ' · TVS Credit'; contentRef.current?.focus(); }, [route]);
  const [assistantVoice, setAssistantVoice] = useState(false);
  const openAssistant = (query = '', voiceMode = false) => {
    opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    setAssistantDraft(query);
    setAssistantVoice(voiceMode);
    setAssistantOpen(true);
  };
  const closeAssistant = () => { setAssistantOpen(false); window.setTimeout(() => { const target = opener.current?.isConnected ? opener.current : document.getElementById('saathi-launcher'); (target || contentRef.current)?.focus(); }); };
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      openAssistant(detail.query || '', detail.voiceMode || false);
    };
    const navHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.target) return;
      const targetId = detail.target.replace('#', '');
      if (detail.prefill) {
        window.dispatchEvent(new CustomEvent('assistant-prefill-underwriting', { detail: detail.prefill }));
      }
      if (targetId === 'underwriting') {
        navigate('underwriting');
      } else if (targetId === 'farmer-documents' || targetId === 'farmer-faq' || targetId === 'farmer') {
        navigate('farmer');
      } else if (targetId === 'ews') {
        navigate('ews');
      } else if (targetId === 'stress-sim') {
        navigate('stress-sim');
      } else if (targetId === 'portfolio') {
        navigate('portfolio');
      }
    };
    window.addEventListener('open-krishi-saathi', handler);
    window.addEventListener('assistant-navigate', navHandler);
    return () => {
      window.removeEventListener('open-krishi-saathi', handler);
      window.removeEventListener('assistant-navigate', navHandler);
    };
  }, []);
  useEffect(() => {
    if (!assistantOpen) return;
    const panel = assistantRef.current;
    const focusFrame = window.setTimeout(() => panel?.querySelector<HTMLButtonElement>('button')?.focus());
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeAssistant(); }
      if (event.key === 'Tab' && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]')).filter(el => el.getClientRects().length);
        const first = items[0], last = items[items.length - 1];
        if (!panel.contains(document.activeElement)) { event.preventDefault(); first?.focus(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { clearTimeout(focusFrame); document.removeEventListener('keydown', handle); document.body.style.overflow = previous; };
  }, [assistantOpen]);
  useEffect(() => {
    if (!mobile) return;
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMobile(false); document.getElementById('menu-toggle')?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [mobile]);

  const signOut = () => {
    localStorage.removeItem('tvs_credit_user'); localStorage.removeItem('tvs_auth_token');
    setUser(null); setContext(null); window.dispatchEvent(new Event('tvs-auth-change')); navigate('overview');
  };

  return <div className="workspace">
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); contentRef.current?.focus(); }}>Skip to content</a>
    {mobile && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobile(false)} />}
    <aside className={'sidebar ' + (mobile ? 'is-open' : '')} aria-label="Main navigation">
      <a href="#overview" className="brand" onClick={() => setMobile(false)}><span className="brand-mark"><Sprout size={24} /></span><span><b>TVS <em>Credit</em></b><small>SMART LENDING HUB</small></span></a>
      <div className="workspace-switch"><span className="branch-icon"><Leaf size={17} /></span><span><b>Agricultural lending</b><small>Chhattisgarh workspace</small></span><ChevronRight size={15} /></div>
      <p className="nav-label">WORKSPACE</p>
      <nav>{navigation.map(item => <a key={item.id} href={'#' + item.id} onClick={() => { setMobile(false); setAssistantOpen(false); }} className={'nav-item ' + (route === item.id ? 'active' : '')} aria-current={route === item.id ? 'page' : undefined}><item.icon size={19} /><span>{item.label}</span>{item.id === 'krishi-saathi' && <span className="tiny-tag">AI</span>}</a>)}</nav>
      <div className="nav-divider" />
      <p className="nav-label">SERVICES</p>
      <a className={'nav-item ' + (route === 'farmer' ? 'active' : '')} href="#farmer" onClick={() => setMobile(false)}><Sprout size={19} />Farmer portal<ArrowUpRight size={15} /></a>
      <button className="nav-item" onClick={() => openAssistant('What can I do in the Smart Lending Hub?')}><CircleHelp size={19} />Help & guidance</button>
      <div className="sidebar-bottom">
        <div className="assistant-teaser"><span className="teaser-icon"><Sparkles size={18} /></span><b>A little clarity goes a long way.</b><p>Understand loan decisions in your own language.</p><button onClick={() => openAssistant()}>Ask Krishi Saathi <ArrowUpRight size={15} /></button></div>
        <button className="profile" onClick={() => user ? signOut() : navigate('signin')}><span className="avatar">{user?.name?.slice(0, 2).toUpperCase() || 'TV'}</span><span><b>{user?.name || 'Guest workspace'}</b><small>{user ? 'Sign out' : 'Sign in to your account'}</small></span>{user ? <LogOut size={16} /> : <ChevronRight size={16} />}</button>
      </div>
    </aside>
    <div className="workspace-body">
      <header className="topbar">
        <div className="breadcrumbs"><button id="menu-toggle" className="icon-button mobile-toggle" aria-label="Open navigation" aria-expanded={mobile} onClick={() => setMobile(!mobile)}><SidebarToggleIcon isOpen={mobile} className="w-5 h-5 text-slate-700" /></button><span>Workspace</span><ChevronRight size={14} /><b>{navigation.find(n => n.id === route)?.label || titles[route]}</b></div>
        <div className="topbar-actions"><span className={'connection ' + health}><i />{health === 'online' ? 'API connected' : health === 'checking' ? 'Checking service' : 'API unavailable'}</span><button className="icon-button" title="Early warnings" aria-label="View early warnings" onClick={() => navigate('ews')}><Bell size={19} /></button><button className="avatar small" aria-label={user ? 'Account: ' + user.name : 'Sign in'} onClick={() => navigate('signin')}>{user?.name?.slice(0, 2).toUpperCase() || 'TV'}</button></div>
      </header>
      <main id="main-content" ref={contentRef} tabIndex={-1} className="main-content">
        <div className="page-heading"><div><div className="eyebrow">AGRICULTURE / CREDIT INTELLIGENCE</div><h1>{titles[route]}</h1><p>{route === 'overview' ? 'A clearer picture of your portfolio. A better next decision.' : route === 'underwriting' ? 'Bring borrower, land and financial details into one assessment.' : route === 'krishi-saathi' ? 'Make sense of lending, repayment and crop health.' : 'Connected insights for thoughtful agricultural lending.'}</p></div>{route !== 'underwriting' && route !== 'signin' && <button className="button primary" onClick={() => navigate('underwriting')}><Plus size={17} />New assessment</button>}</div>
        <div className="demo-notice"><span className="demo-dot" /><strong>Demo workspace</strong><span>Portfolio and risk data are samples. Assessments are illustrative and require officer review.</span></div>
        {route === 'overview' && <Overview resource={portfolio} navigate={navigate} ask={openAssistant} />}
        {route === 'portfolio' && <Portfolio resource={portfolio} search={search} setSearch={setSearch} />}
        <div hidden={route !== 'underwriting'}><Underwriting key={user?.user_id || user?.email || "guest"} onContext={setContext} ask={openAssistant} /></div>
        {route === 'ews' && <Alerts />}
        {route === 'stress-sim' && <StressTest />}
        {route === 'farmer' && <FarmerView context={context} ask={openAssistant} navigate={navigate} />}
        {route === 'signin' && <SignIn onSuccess={u => { setContext(null); setUser(u); window.dispatchEvent(new Event('tvs-auth-change')); navigate('overview'); }} />}
        <div hidden={route !== 'krishi-saathi'} className="assistant-page-placeholder"><div className="panel assistant-intro"><Sparkles size={30} /><h2>One conversation. More clarity.</h2><p>Your conversation stays available as you move through the workspace. Open your assistant to continue.</p><button className="button primary" onClick={() => openAssistant()}>Open Krishi Saathi <ArrowUpRight size={17} /></button><div className="feature-chips"><span>8 languages</span><span>Voice input</span><span>Assessment context</span></div></div></div>
        <footer className="workspace-footer"><span><Sprout size={14} /> TVS Credit · Smart Lending Hub</span><span>Built around the people behind every loan.</span></footer>
      </main>
    </div>
    {!assistantOpen && <button id="saathi-launcher" className="assistant-launcher" onClick={() => openAssistant()} aria-label="Open Krishi Saathi assistant"><Sparkles size={19} /><span>Ask Saathi</span></button>}
    <div className={'assistant-layer ' + (assistantOpen ? 'visible' : '')} aria-hidden={!assistantOpen}>
      {assistantOpen && <button className="assistant-scrim" onClick={closeAssistant} aria-label="Dismiss assistant overlay" tabIndex={-1} />}
      <section ref={assistantRef} className="assistant-drawer" role="dialog" aria-modal={assistantOpen ? true : undefined} aria-label="Krishi Saathi assistant">
        <Assistant context={context} draft={assistantDraft} visible={assistantOpen} onClose={closeAssistant} identity={user?.user_id || user?.email || 'guest'} initialVoiceMode={assistantVoice} />
      </section>
    </div>
  </div>;
}





