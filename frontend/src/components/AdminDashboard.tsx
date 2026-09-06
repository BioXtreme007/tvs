import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Map, AlertTriangle,
  TrendingDown, MessageSquare, LogOut, ChevronRight,
  CheckCircle2, XCircle, Clock, Users, Bell, Search,
  Menu, X, TrendingUp, Activity, BarChart3, ShieldCheck,
  ArrowUpRight, Sparkles, ExternalLink, Filter, ArrowRight,
  RefreshCw, Globe, Check, Eye
} from 'lucide-react';
import UnderwritingSection from './UnderwritingSection';
import PortfolioSection from './PortfolioSection';
import EWSSection from './EWSSection';
import WhatIfSection from './WhatIfSection';
import DeliberationModal from './DeliberationModal';

interface AdminUser {
  name: string;
  role: string;
  email?: string;
  branch?: string;
}

interface AdminDashboardProps {
  user: AdminUser;
  onSignOut: () => void;
  onNavigateHome: () => void;
}

type DashTab = 'overview' | 'cockpit' | 'portfolio' | 'ews' | 'whatif' | 'saathi';

interface ApplicationRow {
  id: string;
  borrower: string;
  village: string;
  acres: number;
  crop: string;
  amount: string;
  score: number;
  ndvi: number;
  status: 'FAST_TRACK_APPROVE' | 'REFER_FIELD_VERIFY' | 'REFER_FRAUD_REVIEW' | 'REJECT';
  time: string;
}

const RECENT_APPLICATIONS: ApplicationRow[] = [
  {
    id: 'TVS-2026-0891',
    borrower: 'Rajeshwar Sahu',
    village: 'Abhanpur, Raipur',
    acres: 4.5,
    crop: 'Paddy (Kharif)',
    amount: '₹5.50 Lakh',
    score: 735,
    ndvi: 0.68,
    status: 'FAST_TRACK_APPROVE',
    time: '12 mins ago',
  },
  {
    id: 'TVS-2026-0890',
    borrower: 'Sukhram Markam',
    village: 'Tokapal, Bastar',
    acres: 3.2,
    crop: 'Kodo-Kutki Millets',
    amount: '₹2.80 Lakh',
    score: 642,
    ndvi: 0.54,
    status: 'FAST_TRACK_APPROVE',
    time: '38 mins ago',
  },
  {
    id: 'TVS-2026-0889',
    borrower: 'Kavita Patel',
    village: 'Kota, Bilaspur',
    acres: 6.0,
    crop: 'Soybean & Maize',
    amount: '₹6.20 Lakh',
    score: 595,
    ndvi: 0.41,
    status: 'REFER_FIELD_VERIFY',
    time: '1 hour ago',
  },
  {
    id: 'TVS-2026-0888',
    borrower: 'Durg Duplicate Claim',
    village: 'Patan, Durg',
    acres: 5.5,
    crop: 'Paddy',
    amount: '₹7.00 Lakh',
    score: 310,
    ndvi: 0.32,
    status: 'REFER_FRAUD_REVIEW',
    time: '2 hours ago',
  },
  {
    id: 'TVS-2026-0887',
    borrower: 'Manohar Lal Verma',
    village: 'Arang, Raipur',
    acres: 2.8,
    crop: 'Vegetables',
    amount: '₹1.90 Lakh',
    score: 718,
    ndvi: 0.65,
    status: 'FAST_TRACK_APPROVE',
    time: '3 hours ago',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onSignOut,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<DashTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deliberationData, setDeliberationData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: ApplicationRow['status']) => {
    switch (status) {
      case 'FAST_TRACK_APPROVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Fast-Track Sanction
          </span>
        );
      case 'REFER_FIELD_VERIFY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} className="text-amber-600" />
            Field Verification
          </span>
        );
      case 'REFER_FRAUD_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} className="text-rose-600" />
            Fraud Lockout
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Under Review
          </span>
        );
    }
  };

  const navItems = [
    {
      id: 'overview' as DashTab,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'cockpit' as DashTab,
      label: 'Decision Cockpit',
      icon: ShieldCheck,
      badge: 'AI Core',
      highlight: true,
    },
    {
      id: 'portfolio' as DashTab,
      label: 'Portfolio Risk Map',
      icon: Map,
      badge: '7 Districts',
    },
    {
      id: 'ews' as DashTab,
      label: 'Early Warning (EWS)',
      icon: AlertTriangle,
      badge: '3 Alerts',
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'whatif' as DashTab,
      label: 'What-If Stress Sim',
      icon: TrendingDown,
      badge: null,
    },
    {
      id: 'saathi' as DashTab,
      label: 'Krishi Saathi Copilot',
      icon: MessageSquare,
      badge: '8 Lang',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          {/* TVS Credit Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0B2545] flex items-center justify-center text-white font-black text-sm shadow-xs">
              TVS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0B2545] text-base sm:text-lg tracking-tight">
                  TVS Credit
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#7342E2] text-white">
                  Admin Cockpit
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 font-medium hidden sm:block">
                E.P.I.C 8 Smart Lending Hub · Credit Operations
              </div>
            </div>
          </div>
        </div>

        {/* Center Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Operations Command</span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-[#0B2545] font-bold capitalize">
            {navItems.find((n) => n.id === activeTab)?.label}
          </span>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Live Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sentinel-2 & ST-DIP Online</span>
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
            <Clock size={13} className="text-slate-400" />
            <span>{currentTime || 'IST'}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                <div className="font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Operational Notifications</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">
                    3 New
                  </span>
                </div>
                <div className="py-2 space-y-2">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-slate-700">Durg Cadastral Lockout</p>
                    <p className="text-slate-500 text-[11px]">Duplicate H3 polygon attempt blocked automatically.</p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <p className="font-semibold text-emerald-800">Fast-Track Sanction</p>
                    <p className="text-emerald-600 text-[11px]">Rajeshwar Sahu scored 735 (₹5.50L approved).</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Public Site Link */}
          <button
            onClick={onNavigateHome}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Switch back to public website"
          >
            <Globe size={13} className="text-slate-500" />
            <span>Public Site</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#0B2545] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold leading-tight">
                {user.role}
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* DashboardKit-Style Left Sidebar */}
        <aside
          className={`bg-[#0B2545] text-white transition-all duration-300 flex flex-col justify-between shrink-0 z-30 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
          style={{ minHeight: 'calc(100vh - 4rem)' }}
        >
          {/* Nav Links */}
          <div className="py-5 px-3 space-y-1">
            {!sidebarCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation & Modules
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#7342E2] text-white shadow-md shadow-purple-900/30 font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 ${
                      isActive ? 'text-white' : item.highlight ? 'text-purple-300' : 'text-slate-400'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Underwriter Location & System Info */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {!sidebarCollapsed ? (
              <>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Assigned Branch Hub
                  </div>
                  <div className="text-white font-bold mt-0.5">
                    {user.branch || 'Raipur Central Zonal Hub'}
                  </div>
                  <div className="text-emerald-400 text-[10.5px] font-medium flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Lending SLA: &lt; 3 mins</span>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-500/30"
                >
                  <LogOut size={14} />
                  <span>Exit to Public Portal</span>
                </button>
              </>
            ) : (
              <button
                onClick={onSignOut}
                className="w-full p-2.5 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center cursor-pointer hover:bg-rose-500/30"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-[#0B2545] via-[#133863] to-[#7342E2] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
                    <Sparkles size={14} className="text-yellow-300" />
                    <span>Autonomous Multimodal Decision Engine</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back, {user.name}
                  </h1>
                  <p className="text-slate-200 text-sm mt-1 max-w-2xl leading-relaxed">
                    Credit operations dashboard is active. 6-agent deliberation engine, Sentinel-2 10m
                    inpainting, and cadastral spatial fraud blockers are running with 100% telemetry uptime.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('cockpit')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-[#0B2545] font-extrabold text-sm shadow-md hover:bg-slate-100 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
                >
                  <ShieldCheck size={18} className="text-[#7342E2]" />
                  <span>Launch Underwriting Cockpit ➔</span>
                </button>
              </div>

              {/* DashboardKit 6-KPI Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Metric 1 */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Today's Inflow
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7342E2] flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-800">24 Apps</div>
                    <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                      +14% vs yesterday
                    </div>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Fast-Track
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-emerald-700">17 Sanc.</div>
                    <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                      70.8% auto approval
                    </div>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Fraud Blocks
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <XCircle size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-rose-700">2 Locked</div>
                    <div className="text-[11px] font-semibold text-rose-600 mt-0.5">
                      100% duplicate stop
                    </div>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Portfolio PAR-90
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B2545] flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-[#0B2545]">2.30%</div>
                    <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                      -0.12% vs last month
                    </div>
                  </div>
                </div>

                {/* Metric 5 */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      EWS Alerts
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-amber-700">3 Active</div>
                    <div className="text-[11px] font-semibold text-amber-600 mt-0.5">
                      NDVI drop watch
                    </div>
                  </div>
                </div>

                {/* Metric 6 */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Decision SLA
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-teal-700">2m 47s</div>
                    <div className="text-[11px] font-semibold text-teal-600 mt-0.5">
                      Target &lt; 3 mins ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* Table & Live Telemetry Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Underwriting Queue (8 Cols) */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">
                        Recent Applications & Sanctions
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Live stream from Raipur, Bastar, Bilaspur, and Durg operational clusters
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('cockpit')}
                      className="text-xs font-bold text-[#7342E2] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>New Evaluation</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10.5px]">
                        <tr>
                          <th className="py-3 px-4">Application</th>
                          <th className="py-3 px-4">Land & Crop</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Score</th>
                          <th className="py-3 px-4">Verdict</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {RECENT_APPLICATIONS.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{app.borrower}</div>
                              <div className="text-[10.5px] text-slate-400 font-mono">
                                {app.id} · {app.village}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">{app.crop}</div>
                              <div className="text-[10.5px] text-slate-400">
                                {app.acres} Acres · Inpainted NDVI {app.ndvi}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {app.amount}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`font-black text-xs px-2 py-0.5 rounded ${
                                  app.score >= 700
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : app.score >= 580
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {app.score}/900
                              </span>
                            </td>
                            <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setActiveTab('cockpit')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0B2545] hover:text-white text-slate-700 font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Engine Proof & Autonomous Verification (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Underwriting Engine Specs */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <Activity size={16} className="text-[#7342E2]" />
                      <span>Autonomous Pipeline Latency</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>Cadastral Ingestion (Uber H3 Res 11)</span>
                          <span className="text-emerald-600 font-bold">&lt; 15s</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[95%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>Sentinel-2 ST-DIP CloudGap Inpainting</span>
                          <span className="text-emerald-600 font-bold">&lt; 45s</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 w-[90%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>6-Subagent Deep Deliberation</span>
                          <span className="text-emerald-600 font-bold">&lt; 60s</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 w-[88%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>Harvest EMI Structure & Payout</span>
                          <span className="text-emerald-600 font-bold">&lt; 60s</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 w-[92%]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Total Turnaround Time:</span>
                      <span className="font-black text-[#0B2545]">&lt; 3 Minutes</span>
                    </div>
                  </div>

                  {/* Anti-Fraud Lockout Telemetry */}
                  <div className="bg-gradient-to-br from-slate-900 to-[#0B2545] rounded-xl p-5 text-white shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Cadastral Anti-Fraud
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        Shield Active
                      </span>
                    </div>
                    <div className="text-lg font-black tracking-tight">
                      Two-Tier H3 & Bhuvan Cropland
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Zero multi-lender duplicate pledges permitted. Any overlapping polygon coordinates
                      in Durg, Raipur or Bilaspur trigger an immediate lockdown and ₹0 sanction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DECISION COCKPIT (THE ACTUAL COCKPIT EMBEDDED) */}
          {activeTab === 'cockpit' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
                      Smart Sanction & Decision Cockpit
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-[#7342E2]">
                      Admin Restricted View
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Direct underwriter portal. Enter land parameters, run multimodal scoring, inspect SHAP
                    feature attributions, and calculate seasonally-aligned harvest EMIs.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>

              {/* The UnderwritingSection itself */}
              <div className="bg-white rounded-2xl p-2 sm:p-3 border border-slate-200 shadow-sm overflow-hidden">
                <UnderwritingSection onOpenDeliberation={setDeliberationData} compact />
              </div>
            </div>
          )}

          {/* TAB 3: PORTFOLIO RISK MAP */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
                  District Portfolio Analytics & PAR-90 Heatmap
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Zonal risk exposure across 7 Chhattisgarh operational districts.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-2 sm:p-3 border border-slate-200 shadow-sm overflow-hidden">
                <PortfolioSection compact />
              </div>
            </div>
          )}

          {/* TAB 4: EARLY WARNING SYSTEM (EWS) */}
          {activeTab === 'ews' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
                  Early Warning System (EWS) · Satellite Watcher
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Active Sentinel-2 NDVI drop watchers, monsoon anomaly tracking, and field recovery dossiers.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-2 sm:p-3 border border-slate-200 shadow-sm overflow-hidden">
                <EWSSection compact />
              </div>
            </div>
          )}

          {/* TAB 5: WHAT-IF STRESS SIMULATOR */}
          {activeTab === 'whatif' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
                  Macro-Climatic What-If Stress Testing Simulator
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Simulate Kharif rainfall deficit, severe heatwave shocks, and Mandi harvest price crashes.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-2 sm:p-4 border border-slate-200 shadow-sm overflow-hidden">
                <WhatIfSection />
              </div>
            </div>
          )}

          {/* TAB 6: KRISHI SAATHI COPILOT */}
          {activeTab === 'saathi' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
                  Krishi Saathi Underwriting Intelligence Copilot
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Ask policy RAG questions, verify crop phenology guidelines, or query vernacular transcripts.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[500px] flex items-center justify-center">
                <div className="max-w-md text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#7342E2] mx-auto flex items-center justify-center">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Krishi Saathi Copilot is Ready
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Access grounded conversational AI in Hindi, English, Chhattisgarhi, and Tamil. Use the
                    button below to launch the underwriter co-pilot terminal.
                  </p>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-krishi-saathi'))}
                    className="px-6 py-3 rounded-full bg-[#7342E2] hover:bg-[#5B32E5] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Launch Krishi Saathi Terminal ➔
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 6-Subagent Deliberation Modal */}
      <DeliberationModal
        isOpen={!!deliberationData}
        onClose={() => setDeliberationData(null)}
        resultData={deliberationData}
      />
    </div>
  );
};

export default AdminDashboard;
