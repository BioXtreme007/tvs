import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Shield, BarChart3, ChevronRight } from 'lucide-react';

interface DistrictData {
  district: string;
  active_loans: number;
  portfolio_cr: number;
  par_90_pct: number;
  mean_credit_score: number;
  top_crop: string;
}

interface PortfolioSectionProps {
  compact?: boolean;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ compact = false }) => {
  const [districts, setDistricts] = useState<DistrictData[]>([
    { district: 'Raipur', active_loans: 4200, portfolio_cr: 185.0, par_90_pct: 2.1, mean_credit_score: 710, top_crop: 'Paddy' },
    { district: 'Durg', active_loans: 3800, portfolio_cr: 162.0, par_90_pct: 1.9, mean_credit_score: 725, top_crop: 'Paddy & Vegetables' },
    { district: 'Rajnandgaon', active_loans: 3100, portfolio_cr: 130.0, par_90_pct: 2.8, mean_credit_score: 685, top_crop: 'Soybean & Paddy' },
    { district: 'Bilaspur', active_loans: 3500, portfolio_cr: 145.0, par_90_pct: 2.4, mean_credit_score: 695, top_crop: 'Paddy & Wheat' },
    { district: 'Janjgir-Champa', active_loans: 4600, portfolio_cr: 198.0, par_90_pct: 1.8, mean_credit_score: 730, top_crop: 'Paddy (Canal Irrigated)' },
    { district: 'Korba', active_loans: 2200, portfolio_cr: 92.0, par_90_pct: 3.4, mean_credit_score: 665, top_crop: 'Paddy & Maize' },
    { district: 'Bastar (Jagdalpur)', active_loans: 1800, portfolio_cr: 76.0, par_90_pct: 2.6, mean_credit_score: 680, top_crop: 'Millets & Maize' },
  ]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>('Raipur');

  useEffect(() => {
    fetch('/api/v1/portfolio')
      .then((res) => res.json())
      .then((json) => {
        if (json.districts_data) setDistricts(json.districts_data);
      })
      .catch(() => {});
  }, []);

  const totalLoans = districts.reduce((sum, d) => sum + d.active_loans, 0);
  const totalCr = districts.reduce((sum, d) => sum + d.portfolio_cr, 0).toFixed(1);
  const currentDist = districts.find((d) => d.district === selectedDistrict) || districts[0];

  return (
    <section id="portfolio" className={`relative w-full ${compact ? 'py-2 sm:py-4 px-1 sm:px-3' : 'py-10 sm:py-16 px-4 sm:px-6'} scroll-mt-20`}>
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className={`flex flex-col items-center text-center ${compact ? 'mb-6' : 'mb-12'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-xs font-semibold mb-2">
            <MapPin size={13} className="text-blue-600" />
            <span>Geographic Risk Heatmap</span>
          </div>
          <h2
            className={`${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-extrabold tracking-tight`}
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            Portfolio Geographic Analytics
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-700 max-w-2xl">
            Real-time PAR-90 default heatmaps and loan volume distribution across Chhattisgarh agricultural districts.
          </p>
        </div>

        {/* 3 Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="glass-card rounded-3xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#0B2545]/10 text-[#0B2545] flex items-center justify-center shrink-0">
              <Shield size={28} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Agri Loans</span>
              <div className="text-3xl font-black mt-0.5" style={{ color: 'var(--color-text)' }}>
                {totalLoans.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">97.6% In Good Standing</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
              <BarChart3 size={28} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Portfolio Size</span>
              <div className="text-3xl font-black text-blue-800 mt-0.5">
                ₹{totalCr} Cr
              </div>
              <span className="text-[11px] text-slate-600 font-medium">Across 7 Core Districts</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={28} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average PAR-90 Rate</span>
              <div className="text-3xl font-black text-emerald-700 mt-0.5">
                2.35%
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">-120 bps vs NBFC benchmark</span>
            </div>
          </div>
        </div>

        {/* 2-Column District Table & Focus View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* District Table (7 cols) */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-7">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-5">
              District Stress Level (Click to inspect)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="pb-3">District</th>
                    <th className="pb-3">Loans</th>
                    <th className="pb-3">Volume (₹ Cr)</th>
                    <th className="pb-3">PAR-90</th>
                    <th className="pb-3">Mean Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {districts.map((d) => {
                    const isSelected = d.district === selectedDistrict;
                    return (
                      <tr
                        key={d.district}
                        onClick={() => setSelectedDistrict(d.district)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-100/70 font-bold' : 'hover:bg-white/60'
                        }`}
                      >
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              d.par_90_pct >= 3.0 ? 'bg-rose-500' : d.par_90_pct < 2.0 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {d.district}
                        </td>
                        <td className="py-3.5 text-slate-700">{d.active_loans.toLocaleString()}</td>
                        <td className="py-3.5 font-extrabold" style={{ color: 'var(--color-text)' }}>
                          ₹{d.portfolio_cr}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                              d.par_90_pct >= 3.0
                                ? 'bg-rose-100 text-rose-800'
                                : d.par_90_pct < 2.0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.par_90_pct}%
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-700 font-semibold">{d.mean_credit_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Focused District Inspector (5 cols) */}
          <div className="lg:col-span-5 glass-card-dark text-white rounded-3xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-xs uppercase font-bold text-purple-300">Selected District</span>
                  <h4 className="text-2xl font-black tracking-tight">{currentDist.district}</h4>
                </div>
                <span className="text-xs px-3.5 py-1 rounded-full bg-white/10 font-bold border border-white/20">
                  {currentDist.top_crop}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-5 py-5 border-y border-white/10">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">District Portfolio</span>
                  <div className="text-xl font-bold text-white mt-0.5">₹{currentDist.portfolio_cr} Crores</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">PAR-90 Stress</span>
                  <div className={`text-xl font-bold mt-0.5 ${currentDist.par_90_pct >= 3.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {currentDist.par_90_pct}%
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Active Farmers</span>
                  <div className="text-base font-semibold text-slate-200 mt-0.5">{currentDist.active_loans.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Mean Score</span>
                  <div className="text-base font-semibold text-purple-300 mt-0.5">{currentDist.mean_credit_score} / 900</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Credit Sanction Strategy:</strong>{' '}
                {currentDist.par_90_pct < 2.0
                  ? 'Prime credit resilience backed by canal irrigation. Eligible for Fast-Track auto-approvals up to 85% LTV.'
                  : currentDist.par_90_pct < 3.0
                  ? 'Standard sanction rules apply. Mandate Seasonally-Aligned Harvest EMI repayment schedules.'
                  : 'Elevated rainfed default vulnerability. Maximum 75% LTV with mandatory satellite soil organic verification.'}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Updated: Fortnightly Sentinel-2 Pass</span>
              <span className="text-emerald-400 font-bold">● Active Watcher</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
