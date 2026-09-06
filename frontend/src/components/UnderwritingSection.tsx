import React, { useState, useEffect, useRef } from 'react';
import { api, money } from '../api';
import type { FieldScenario } from './FieldScenariosCarousel';
import { motion } from 'framer-motion';
import { Zap, Cpu, Sparkles, TrendingUp, Calendar, CheckCircle2, Shield } from 'lucide-react';

interface UnderwritingSectionProps {
  onOpenDeliberation: (data: any) => void;
  onContext?: (data: any) => void;
  scenario?: FieldScenario | null;
}

export const UnderwritingSection: React.FC<UnderwritingSectionProps> = ({ onOpenDeliberation, onContext, scenario }) => {
  const [formData, setFormData] = useState({
    applicantName: 'Rajeshwar Sahu',
    district: 'Raipur',
    landAcres: 4.5,
    cropType: 'PADDY_KHARIF',
    cibilScore: 690,
    loanAmount: 550000,
    cloudCover: 45,
    khasraNo: '142/1',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    agri_credit_score: 735,
    tier: 'GOOD',
    underwriting_decision: 'FAST_TRACK_APPROVE',
    recommended_product: 'TVS New Tractor Loan (45HP)',
    sanctioned_amount_inr: 550000,
    risk_adjusted_roi_pct: 10.5,
    satellite_ndvi: 0.68,
    estimated_yield_tha: 4.1,
    land_collateral_value_inr: 2350000,
    p50_default_pct: 3.8,
    shap_features: [
      { name: 'Annual Banking Turnover (>₹5L)', impact: 42, sign: 'positive' },
      { name: 'ISRO Bhuvan Cropland Verified', impact: 28, sign: 'positive' },
      { name: 'Sentinel-2 Inpainted NDVI (0.68)', impact: 22, sign: 'positive' },
      { name: 'CIBIL Bureau Score 690', impact: 15, sign: 'positive' },
      { name: 'Historical Drought Vulnerability', impact: -18, sign: 'negative' },
      { name: 'Kharif Monsoon Cloud Blockage', impact: -12, sign: 'negative' },
    ],
    harvest_schedule: [
      { month: 'Month 1 (Jun - Sowing)', stage: 'Sowing/Inputs', emi_inr: 1500, type: 'Nominal Maintenance' },
      { month: 'Month 2 (Jul - Weeding)', stage: 'Vegetative', emi_inr: 1500, type: 'Nominal Maintenance' },
      { month: 'Month 3 (Aug - Flowering)', stage: 'Reproductive', emi_inr: 1500, type: 'Nominal Maintenance' },
      { month: 'Month 4 (Oct - Mandi Harvest)', stage: 'Harvest Sales', emi_inr: 68500, type: 'Bullet Harvest Installment' },
      { month: 'Month 5 (Nov - Post-Harvest)', stage: 'Stubble/Rabi Prep', emi_inr: 1500, type: 'Nominal Maintenance' },
      { month: 'Month 6 (Dec - Rabi Sowing)', stage: 'Rabi Sowing', emi_inr: 1500, type: 'Nominal Maintenance' },
    ],
  });

  const [error, setError] = useState('');
  const [isSample, setIsSample] = useState(true);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    if (!scenario) return;
    active.current?.abort(); active.current = null; setLoading(false);
    setFormData(prev => ({ ...prev, applicantName: scenario.name, district: scenario.district, landAcres: scenario.acreage, cropType: scenario.crop.toUpperCase().includes('PADDY') ? 'PADDY_KHARIF' : prev.cropType }));
    setIsSample(true); onContext?.(null);
  }, [scenario]);

  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const p = (e as CustomEvent).detail || {};
      active.current?.abort();
      active.current = null;
      setLoading(false);
      setFormData(prev => ({
        ...prev,
        applicantName: p.applicant_name || prev.applicantName,
        district: p.district || prev.district,
        landAcres: p.land_acres !== undefined ? Number(p.land_acres) : prev.landAcres,
        loanAmount: p.requested_amount_inr !== undefined ? Number(p.requested_amount_inr) : (p.land_acres ? Math.round(Number(p.land_acres) * 130000) : prev.loanAmount),
      }));
      setIsSample(true);
      onContext?.(null);
    };
    window.addEventListener('assistant-prefill-underwriting', handlePrefill);
    return () => window.removeEventListener('assistant-prefill-underwriting', handlePrefill);
  }, []);
  const handleUnderwrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (active.current) return;
    const controller = new AbortController(); active.current = controller;
    setLoading(true); setError(''); onContext?.(null);
    try {
      const data = await api('/underwrite', {
        method: 'POST', signal: controller.signal,
        body: JSON.stringify({
          applicant_name: formData.applicantName,
          phone: '+91-9827104421',
          district: formData.district,
          village: 'Kurud',
          khasra_no: formData.khasraNo,
          land_acres: formData.landAcres,
          crop_type: formData.cropType,
          requested_loan_amount_inr: formData.loanAmount,
          requested_tenure_months: 36,
          requested_product_type: 'TRACTOR',
          bureau_cibil_score: formData.cibilScore,
          annual_banking_turnover_inr: Math.round(formData.loanAmount * 1.4),
          cloud_cover_pct: formData.cloudCover,
          plot_coordinates: [
            { lat: 21.2514, lon: 81.6296 },
            { lat: 21.2530, lon: 81.6320 },
            { lat: 21.2495, lon: 81.6315 },
          ],
        }),
      });
      if (controller.signal.aborted) return;
      const verdict = data.underwriting_verdict || {};
      const sat = data.satellite_and_soil || {};
      setResult({
        agri_credit_score: verdict.agri_credit_score ?? '—',
        tier: verdict.tier ?? 'Not available',
        underwriting_decision: verdict.decision ?? 'NOT_AVAILABLE',
        recommended_product: verdict.recommended_product ?? 'Not available',
        sanctioned_amount_inr: verdict.sanctioned_amount_inr,
        risk_adjusted_roi_pct: verdict.risk_adjusted_roi_pct ?? '—',
        satellite_ndvi: sat.cloudgap_monsoon_inpainting?.reconstructed_indices?.ndvi ?? '—',
        shap_features: (data.xai_attributions?.top_features || []).map((f: any) => ({ name: String(f.feature_name).replace(/_/g, ' '), impact: Math.round(Math.abs(f.shap_attribution_score * 100)), sign: f.shap_attribution_score >= 0 ? 'positive' : 'negative' })),
        harvest_schedule: (data.repayment_structure?.installments || []).slice(0,6).map((inst: any) => ({ month: `Month ${inst.installment_number} (${inst.crop_growth_stage})`, stage: inst.crop_growth_stage, emi_inr: inst.installment_amount_inr, type: inst.is_harvest_bullet ? 'Bullet Harvest Installment' : 'Nominal Maintenance' })),
      });
      setIsSample(false);
      onContext?.({ applicant_name: formData.applicantName, district: formData.district, crop: formData.cropType, khasra_no: formData.khasraNo, loan_id: data.loan_id, agri_credit_score: verdict.agri_credit_score, max_sanction_amount_inr: verdict.sanctioned_amount_inr });
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Assessment unavailable. Please try again.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      if (active.current === controller) active.current = null;
    }
  };

  return (
    <section id="underwriting" className="relative w-full py-20 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-xs font-semibold mb-2">
              <Zap size={14} className="text-[#0B2545]" />
              <span>Real-Time Autonomous Scoring</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
            >
              Live Smart Sanction & Decision Cockpit
            </h2>
            <p className="mt-2 text-sm text-slate-700 max-w-xl">
              Fusing financial history with Sentinel-2 10m remote sensing, topsoil organic carbon, and NASA POWER climate data.
            </p>
          </div>

          <button
            onClick={() => onOpenDeliberation(result)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold bg-[#192837] text-white hover:bg-black transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Cpu size={16} />
            <span>Launch 6-Subagent Deliberation</span>
          </button>
        </div>

        <p className="website-demo-label">{isSample ? 'Illustrative sample assessment — submit borrower details to request a new result.' : 'Assessment returned by the demo service. Officer review is required.'}</p>
        {error && <p role="alert" className="website-error">{error} The displayed example or previous result is not a new assessment.</p>}
        {!isSample && !result.harvest_schedule.length && <p className="website-demo-label">The service did not return a repayment schedule.</p>}
        {/* Main 2-Column Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Form Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-card rounded-3xl p-7">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/80">
                <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                  Borrower Intake & Geotagging
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                  Sentinel-2 · Bhuvan
                </span>
              </div>

              <form onChange={() => { active.current?.abort(); active.current = null; setLoading(false); onContext?.(null); setIsSample(true); }} onSubmit={handleUnderwrite} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Farmer / Borrower Name
                  </label>
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 rounded-xl bg-white/90 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 focus:border-[#0B2545]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">District</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full text-sm px-3 py-2.5 rounded-xl bg-white/90 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 focus:border-[#0B2545]"
                    >
                      <option value="Raipur">Raipur (CG)</option>
                      <option value="Durg">Durg</option>
                      <option value="Rajnandgaon">Rajnandgaon</option>
                      <option value="Bilaspur">Bilaspur</option>
                      <option value="Bastar">Bastar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Acreage</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.landAcres}
                      onChange={(e) => setFormData({ ...formData, landAcres: parseFloat(e.target.value) || 0 })}
                      className="w-full text-sm px-3 py-2.5 rounded-xl bg-white/90 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 focus:border-[#0B2545]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Crop Sown</label>
                    <select
                      value={formData.cropType}
                      onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                      className="w-full text-sm px-3 py-2.5 rounded-xl bg-white/90 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 focus:border-[#0B2545]"
                    >
                      <option value="PADDY_KHARIF">Paddy (Kharif)</option>
                      <option value="WHEAT_RABI">Wheat (Rabi)</option>
                      <option value="SOYBEAN_KHARIF">Soybean</option>
                      <option value="COTTON_KHARIF">Cotton</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">CIBIL (0=Thin)</label>
                    <input
                      type="number"
                      value={formData.cibilScore}
                      onChange={(e) => setFormData({ ...formData, cibilScore: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm px-3 py-2.5 rounded-xl bg-white/90 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 focus:border-[#0B2545]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Loan Amount (₹)</label>
                    <input
                      type="number"
                      step="10000"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({ ...formData, loanAmount: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm px-3 py-2.5 rounded-xl bg-white/90 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 focus:border-[#0B2545]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Cloud Cover (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.cloudCover}
                      onChange={(e) => setFormData({ ...formData, cloudCover: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm px-3 py-2.5 rounded-xl bg-white/90 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 focus:border-[#0B2545]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full py-3.5 rounded-full text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#0B2545' }}
                >
                  {loading ? (
                    <span className="animate-spin">⟳ Computing Multimodal Score...</span>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>Calculate Sanction Verdict</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* CloudGap Inpainting Live Indicator Card */}
            <div className="glass-card-dark text-white rounded-3xl p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> CloudGap-CG Monsoon Inpainting
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ALL-WEATHER ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monsoon clouds ({formData.cloudCover}%) inpainted via Spatio-Temporal Deep Image Prior (ST-DIP) U-Net. Reconstructed NDVI: <strong className="text-emerald-400">{result.satellite_ndvi}</strong>.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-2 border-t border-white/10">
                <span>ISRO Bhuvan: <strong className="text-white">Cropland ✓</strong></span>
                <span>H3 Spatial Dedup: <strong className="text-white">Clean ✓</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Results Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Scorecard Verdict Banner */}
            <div className="glass-card rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-white border-4 border-[#0B2545]/30 shadow-inner">
                  <div className="text-center">
                    <span className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
                      {result.agri_credit_score}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">/ 900</span>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-block text-xs font-extrabold px-3 py-0.5 rounded-full border mb-1.5 ${
                      result.tier === 'PRIME'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-purple-100 text-purple-800 border-purple-300'
                    }`}
                  >
                    {result.tier} TIER
                  </span>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                    {result.underwriting_decision.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Recommended: <strong>{result.recommended_product}</strong>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Sanction Amount</span>
                  <div className="text-xl font-black text-emerald-700">
                    {money(result.sanctioned_amount_inr)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Pricing ROI</span>
                  <div className="text-base font-extrabold" style={{ color: 'var(--color-text)' }}>
                    {result.risk_adjusted_roi_pct}% p.a.
                  </div>
                </div>
              </div>
            </div>

            {/* TreeSHAP Feature Attributions Card */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-[#0B2545]" />
                  TreeSHAP Explainable AI Attributions (RBI Aligned)
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">Points Impact</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {result.shap_features?.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{f.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${f.sign === 'positive' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {f.sign === 'positive' ? '+' : '-'}{f.impact} pts
                      </span>
                      <div className="w-20 bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${f.sign === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, f.impact * 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Harvest EMI Repayment Table Card */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={15} className="text-[#0B2545]" />
                    Seasonally-Aligned Harvest Repayment Schedule
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Nominal ₹1,500 maintenance during sowing; bullet repayment upon Mandi crop sales.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  -34.5% Defaults
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="pb-2">Period</th>
                      <th className="pb-2">Stage</th>
                      <th className="pb-2">Structure</th>
                      <th className="pb-2 text-right">Installment (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.harvest_schedule?.map((row: any, idx: number) => (
                      <tr key={idx} className={row.type.includes('Bullet') ? 'bg-purple-100/60 font-bold' : ''}>
                        <td className="py-2.5 text-slate-700">{row.month}</td>
                        <td className="py-2.5 text-slate-600">{row.stage}</td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              row.type.includes('Bullet')
                                ? 'bg-purple-200 text-purple-900 font-extrabold'
                                : 'bg-slate-200/80 text-slate-700'
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-black" style={{ color: 'var(--color-text)' }}>
                          {money(row.emi_inr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnderwritingSection;
