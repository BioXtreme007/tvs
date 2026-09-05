import React, { useState } from 'react';
import PrecisionSection, { PrecisionPillar } from './PrecisionSection';
import InnovationPillars from './InnovationPillars';
import { ArrowLeft, CheckCircle2, Sparkles, Layers, Eye } from 'lucide-react';

const TVS_AGRI_PILLARS: PrecisionPillar[] = [
  {
    label: 'Inpaints',
    items: ['Sentinel-2 radar', 'CloudGap-CG', '10m optical', 'Kharif canopy'],
    leftVw: 2.8,
    bottomVw: 7,
  },
  {
    label: 'Validates',
    items: ['Bhuvan cadastral', 'Uber H3 hexes', 'UIDAI biometric', 'anti-double pledge'],
    leftVw: 22.4,
    bottomVw: 9.08,
  },
  {
    label: 'Deliberates',
    items: ['agronomy agent', 'mandi market agent', 'fraud sentinel', 'underwriter audit'],
    leftVw: 41.2,
    bottomVw: 11.16,
  },
  {
    label: 'Sanctions',
    items: ['harvest cashflows', 'bullet EMIs', 'season tranches', 'e-NACH payout'],
    leftVw: 61.1,
    bottomVw: 13.24,
  },
];

interface PrecisionSectionPreviewProps {
  onBack: () => void;
}

export const PrecisionSectionPreview: React.FC<PrecisionSectionPreviewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'tvs' | 'original' | 'compare'>('tvs');

  return (
    <div className="min-h-screen bg-[#BAB2B0] text-[#192837] pb-24">
      {/* Top Banner Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#192837]/10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0B2545] text-white hover:bg-[#192837] text-sm font-medium transition-colors shadow-sm"
            >
              <ArrowLeft size={16} /> Back to Live Hub
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <Sparkles size={12} /> Interactive Preview
                </span>
                <h1 className="text-base font-bold text-[#0B2545]">
                  PrecisionSection Architecture Preview
                </h1>
              </div>
              <p className="text-xs text-[#5A6772]">
                Recommended candidate to replace: <strong className="text-[#0B2545]">#innovations (Innovation Pillars)</strong>
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('tvs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'tvs'
                  ? 'bg-white text-[#0B2545] shadow font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 size={14} className="text-emerald-600" /> TVS Credit Wired (Consistent Bg)
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'compare'
                  ? 'bg-white text-[#0B2545] shadow font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={14} className="text-indigo-600" /> Direct Comparison vs. Current #innovations
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'original'
                  ? 'bg-white text-[#0B2545] shadow font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={14} className="text-purple-600" /> Original NexaCore Spec
            </button>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="bg-[#F9F9F7] border border-[#192837]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-purple-700">
                Architectural Evaluation & Recommendation
              </span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">
                Which section to replace: <span className="underline decoration-purple-500">Section 1: The 4 Innovation Pillars (#innovations)</span>
              </h2>
              <p className="text-sm text-[#5A6772] mt-1 max-w-3xl leading-relaxed">
                Currently, <strong>#innovations</strong> renders 4 flat static cards (<em>Orbital Telemetry</em>, <em>CloudGap-CG</em>, <em>Cadastral Fraud Shield</em>, <em>Harvest-Linked EMIs</em>). 
                Replacing it with the <strong>PrecisionSection rising staircase</strong> transforms those 4 pillars into a progressive, institutional underwriting workflow (<strong>Inpaints ➔ Validates ➔ Deliberates ➔ Sanctions</strong>) while keeping your exact <code>#BAB2B0</code> canvas background color and 0 external icon dependencies.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span className="text-xs text-slate-500">Status</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                Awaiting User Finalization
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on Active Tab */}
      <div className="mt-4 space-y-12">
        {(activeTab === 'tvs' || activeTab === 'compare') && (
          <section className="max-w-7xl mx-auto px-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Option A · TVS Credit Smart Lending (Consistent with #BAB2B0 Canvas)
                </span>
                <h3 className="text-xl font-bold text-[#0B2545] mt-1">
                  Precision Staircase Wired to Autonomous Agri-Underwriting
                </h3>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-[#192837]/15 shadow-xl bg-[#BAB2B0]">
              <PrecisionSection
                badgeText="TVS Credit E.P.I.C 8 · Multimodal Precision Architecture"
                headingLine1="One integrated underwriting engine."
                headingLine2="Compounding agri-credit precision."
                subtitle="Satellite radar, land registry cadastrals, and 6 autonomous deliberation agents aligned to harvest liquidity."
                pillars={TVS_AGRI_PILLARS}
                backgroundImage=""
                backgroundColor="#BAB2B0"
                headingColor="#0B2545"
                subtextColor="#334155"
                itemTextColor="#0B2545"
              />
            </div>
          </section>
        )}

        {activeTab === 'compare' && (
          <section className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-300">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200 px-2.5 py-1 rounded-md border border-slate-300">
                Current Live Section · #innovations (4 Flat Cards)
              </span>
              <h3 className="text-xl font-bold text-[#0B2545] mt-1">
                Existing Innovation Pillars Component for Direct Contrast
              </h3>
              <p className="text-sm text-[#5A6772]">
                Notice how the staircase version above provides greater visual hierarchy, upward progression, and modern elegance compared to the standard grid cards below.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden border border-[#192837]/15 shadow-lg bg-[#BAB2B0] p-6">
              <InnovationPillars />
            </div>
          </section>
        )}

        {activeTab === 'original' && (
          <section className="max-w-7xl mx-auto px-4">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                Option B · Exact NexaCore Raw Spec
              </span>
              <h3 className="text-xl font-bold text-[#0B2545] mt-1">
                PrecisionSection with Higgs AI Background & Default NexaCore Copy
              </h3>
            </div>
            <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <PrecisionSection />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PrecisionSectionPreview;
