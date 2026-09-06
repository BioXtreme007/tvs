import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Cpu, Database, AlertCircle, FileCheck } from 'lucide-react';

interface DeliberationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultData?: any;
}

export const DeliberationModal: React.FC<DeliberationModalProps> = ({
  isOpen,
  onClose,
  resultData,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const subagents = [
    {
      name: 'Agent 1: Spatial & Inpainting Validator',
      role: 'Sentinel-2 Multispectral & CloudGap-CG Inpainting',
      status: 'VERIFIED',
      details:
        'Analyzed 4.5 acres in Raipur (Khasra 142/1). ST-DIP U-Net successfully removed 45% Kharif monsoon cloud occlusion. Reconstructed NDVI is 0.68. ISRO Bhuvan cross-check confirms pure agricultural cropland. Uber H3 Res 11 shows zero duplicate collateral filings.',
      icon: Cpu,
      badge: 'ST-DIP Neural Active',
    },
    {
      name: 'Agent 2: Regulatory Compliance & Policy RAG',
      role: 'RBI Fair Lending & GeoKisaan Agri-Credit Guidelines',
      status: 'COMPLIANT',
      details:
        'Verified against RBI Master Directions on NBFC Lending 2024. Proposed 10.5% risk-adjusted APR complies with state usury caps. Farmer eligibility under PM KISAN and crop insurance requirements verified.',
      icon: Database,
      badge: 'RBI Aligned',
    },
    {
      name: 'Agent 3: Explainable Credit Risk Underwriter',
      role: 'CatBoost + TreeSHAP Transparent Scoring',
      status: 'SCORE: 735 (GOOD)',
      details:
        'CatBoost TreeSHAP attributed +42 pts to healthy annual banking turnover, +28 pts to ISRO Bhuvan cropland verification, and +22 pts to high satellite NDVI vigor. Downside risks (-18 pts) factored for historical district dry spells.',
      icon: ShieldCheck,
      badge: 'TreeSHAP Audited',
    },
    {
      name: 'Agent 4: Human-in-the-Loop Escalation Agent',
      role: 'Autonomous Discretion Threshold Check',
      status: 'FAST-TRACK AUTO',
      details:
        'Agri-credit score of 735 exceeds the autonomous approval threshold (650). No active litigation, no fraud flags, and LTV of 23.4% falls well below the 80% cap. Sanctioned without mandatory Senior Underwriter intervention.',
      icon: CheckCircle2,
      badge: 'Zero Escalation',
    },
    {
      name: 'Agent 5: Safety, Bias & Guardrails Agent',
      role: 'Fairness, Gender Neutrality & Hallucination Defense',
      status: 'BIAS AUDIT PASSED',
      details:
        'Demographic parity analysis confirmed zero statistical disparate impact based on community, gender, or religion. LLM decision memo verified grounded with zero factual hallucination against verified database tables.',
      icon: AlertCircle,
      badge: 'Fair Lending Certified',
    },
    {
      name: 'Agent 6: Immutable Audit Trail Ledger',
      role: 'SHA-256 Tamper-Proof Cryptographic Hash',
      status: 'SEALED & COMMITTED',
      details:
        'Block Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855. Timestamp: 2026-09-04 01:10:00 UTC. The entire multimodal decision package is cryptographically locked for statutory inspections.',
      icon: FileCheck,
      badge: 'SHA-256 Ledger Locked',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#192837]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-card rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                  Dual-Track Multi-Agent Orchestrator
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  6-Subagent Deliberation & Statutory Audit
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Subagent Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {subagents.map((ag, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === i
                      ? 'bg-[#192837] text-white shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200'
                  }`}
                >
                  Subagent {i + 1}
                </button>
              ))}
            </div>

            {/* Active Subagent Details Card */}
            {(() => {
              const current = subagents[activeTab];
              const Icon = current.icon;
              return (
                <div className="glass-card-dark text-white rounded-2xl p-6 flex flex-col gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white">{current.name}</h4>
                        <span className="text-xs text-purple-300">{current.role}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                      {current.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                    {current.details}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                    <span>Deliberation Status: <strong className="text-emerald-400">{current.status}</strong></span>
                    <span>Consensus Weight: <strong>1.00 (Unanimous)</strong></span>
                  </div>
                </div>
              );
            })()}

            {/* Final Underwriting Consensus Strip */}
            <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>All 6 subagents have achieved consensus. Sanction approved for ₹5,50,000.</span>
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0B2545] text-white text-xs font-bold shadow-md hover:bg-purple-800 transition-all cursor-pointer"
              >
                Done & Return to Cockpit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliberationModal;
