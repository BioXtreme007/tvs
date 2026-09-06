import React, { useState } from 'react';
import {
  FileCheck,
  Satellite,
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PipelineStep {
  number: string;
  duration: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  metrics: { label: string; value: string }[];
  highlight: string;
}

const pipelineSteps: PipelineStep[] = [
  {
    number: '01',
    duration: '< 15 Seconds',
    title: 'Cadastral & Biometric Ingestion',
    subtitle: 'Zero Physical Patwari Verification',
    description:
      'Farmer provides Aadhaar number and land parcel Khasra 142/1. GeoKisaan API instantly queries Bhuvan CG Cadastral Registry and Land Records to verify geofenced boundaries and clear title in real time.',
    icon: FileCheck,
    badge: 'Instant Ingestion',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    metrics: [
      { label: 'Latency', value: '11.8s' },
      { label: 'Identity Verification', value: '100% UIDAI' },
      { label: 'Boundary Resolution', value: '10m Hex H3' },
    ],
    highlight: 'Eliminates 14-day manual revenue inspector field visits.',
  },
  {
    number: '02',
    duration: '< 45 Seconds',
    title: 'Sentinel-2 & CloudGap-CG Inpainting',
    subtitle: 'Monsoon Cloud Penetration AI',
    description:
      'ESA Sentinel-2A multispectral imagery is pulled. If Kharif monsoon clouds occlude optical bands, our proprietary Spatio-Temporal Deep Image Prior (ST-DIP) reconstructs dense NDVI & NDMI canopy vigor with 99.4% confidence.',
    icon: Satellite,
    badge: 'Space-Agri Telemetry',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    metrics: [
      { label: 'NDVI Resolution', value: '10m Surface' },
      { label: 'Cloud Penetration', value: '100% Kharif' },
      { label: 'Soil Organic Carbon', value: '0.58% Optimal' },
    ],
    highlight: 'Guarantees continuous crop monitoring even under 90% cloud cover.',
  },
  {
    number: '03',
    duration: '< 60 Seconds',
    title: '6-Subagent Consensus Deliberation',
    subtitle: 'Multi-Perspective Agentic Risk Engine',
    description:
      'Five specialized subagents—Cadastral Validator, Policy Guideline RAG, Explainability Specialist, Escalation Assessor, and Security Guardrail—deliberate the risk profile and formulate an explainable sanction dossier.',
    icon: Cpu,
    badge: 'Autonomous Agents',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    metrics: [
      { label: 'Subagents', value: '6 Specialized' },
      { label: 'Consensus Rate', value: '99.8%' },
      { label: 'Multi-Modal Score', value: '735 / 900' },
    ],
    highlight: 'Replaces opaque black-box scoring with auditable multi-agent consensus.',
  },
  {
    number: '04',
    duration: '< 60 Seconds',
    title: 'Seasonally-Aligned Sanction & Payout',
    subtitle: 'Harvest-Linked Repayment Architecture',
    description:
      'Sanction letter is generated instantly with GeoKisaan Seasonally-Aligned Harvest EMI schedule: ₹1,500/mo maintenance fee during sowing, and full bullet payment deferred until post-mandi crop liquidation.',
    icon: CheckCircle2,
    badge: 'Instant Sanction',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    metrics: [
      { label: 'Sowing EMI', value: '₹1,500/mo' },
      { label: 'Sanction Amount', value: '₹5,50,000' },
      { label: 'Total Turnaround', value: '< 3 Minutes' },
    ],
    highlight: 'Disburses credit directly to authorized tractor dealer with zero farmer cash strain.',
  },
];

export const LendingPipelineSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="lending-pipeline" className="relative w-full py-16 px-4 sm:px-6 scroll-mt-20">
      <div id="pipeline" className="absolute -top-24 pointer-events-none" aria-hidden="true" />
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-xs font-semibold mb-2.5">
            <Clock size={13} className="text-[#0B2545]" />
            <span>How It Works · Autonomous Precision Lending</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            How It Works: The 3-Minute Lending Pipeline
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
            From rural farmer applicant to dealer tractor disbursement in under 180 seconds—powered by orbital satellites, deep neural inpainting, and multi-agent consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-5 rounded-2xl transition-all border cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'bg-white border-[#0B2545] shadow-xl shadow-[#0B2545]/10 ring-2 ring-[#0B2545]/20'
                    : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      isActive ? 'bg-[#0B2545] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    STEP {step.number}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Clock size={11} />
                    {step.duration}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#0B2545] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {step.subtitle}
                </p>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B2545] via-[#7342E2] to-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {(() => {
          const current = pipelineSteps[activeStep];
          return (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${current.badgeColor}`}
                  >
                    {current.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Execution Window: <strong className="text-slate-900">{current.duration}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B2545]">
                    Step {current.number}: {current.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    {current.subtitle}
                  </p>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {current.description}
                </p>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
                  <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">FinTech Institutional Advantage: </strong>
                    <span>{current.highlight}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    ← Previous Step
                  </button>
                  <button
                    disabled={activeStep === pipelineSteps.length - 1}
                    onClick={() => setActiveStep((prev) => Math.min(pipelineSteps.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#0B2545] text-white hover:bg-[#133863] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    <span>Next Pipeline Step</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#F8F9FA] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                      Live Telemetry Benchmark
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Pipeline
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {current.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between"
                      >
                        <span className="text-xs text-slate-600 font-medium">{m.label}</span>
                        <span className="text-sm font-bold text-[#0B2545] font-mono">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Audited GeoKisaan E.P.I.C 8 Model
                  </span>
                  <span className="font-mono text-[11px]">SLA &lt; 180s</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

export default LendingPipelineSection;
