import React from 'react';
import { motion } from 'framer-motion';
import { Satellite, CloudRain, ShieldCheck, CalendarCheck, Sparkles } from 'lucide-react';

export const InnovationPillars: React.FC = () => {
  const pillars = [
    {
      id: 'satellite',
      title: 'Orbital Telemetry',
      tagline: '10m Fortnightly Cadence',
      description:
        'Autonomous Sentinel-2 satellite sensing computing NDVI vigor, soil moisture, and NDWI stress to underwrite thin-file farmers without physical inspections.',
      icon: Satellite,
      stat: '10m',
      statLabel: 'Multispectral Precision',
      highlight: 'Zero Field Visits',
      badgeColor: 'bg-emerald-100/80 text-emerald-800 border-emerald-300/80',
    },
    {
      id: 'cloudgap',
      title: 'CloudGap-CG Inpainting',
      tagline: 'Spatio-Temporal Deep Prior',
      description:
        'Overcomes India’s 70–80% Kharif monsoon cloud blindspot using self-supervised U-Net neural reconstruction for non-stop year-round automated lending.',
      icon: CloudRain,
      stat: '100%',
      statLabel: 'All-Weather Coverage',
      highlight: 'Monsoon Penetration',
      badgeColor: 'bg-purple-100/80 text-purple-800 border-purple-300/80',
    },
    {
      id: 'fraud',
      title: 'Cadastral Fraud Shield',
      tagline: 'Uber H3 + ISRO Bhuvan',
      description:
        'Eliminates ghost land and multi-lender double-pledging via micro-hexagonal H3 spatial indexing verified live against ISRO Bhuvan agricultural boundaries.',
      icon: ShieldCheck,
      stat: '0.0%',
      statLabel: 'Duplicate Tolerance',
      highlight: 'ISRO Verified',
      badgeColor: 'bg-blue-100/80 text-blue-800 border-blue-300/80',
    },
    {
      id: 'harvest-emi',
      title: 'Harvest-Linked EMIs',
      tagline: 'Mandi Cashflow Aligned',
      description:
        'Replaces rigid monthly payments with nominal ₹1,500 maintenance during sowing and bullet installments upon Mandi crop sales, slashing borrower defaults.',
      icon: CalendarCheck,
      stat: '-34.5%',
      statLabel: 'Default Reduction',
      highlight: 'Farmer-Cycle Linked',
      badgeColor: 'bg-amber-100/80 text-amber-900 border-amber-300/80',
    },
  ];

  return (
    <section id="innovations" className="relative w-full pt-8 pb-14 px-4 sm:px-6 scroll-mt-20">
      <div className="max-w-[1280px] mx-auto">
        {/* Compact Section Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-xs font-semibold mb-2.5">
            <Sparkles size={13} className="text-[#0B2545]" />
            <span>Architectural Innovations for TVS Credit</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            The 4 Pillars of Multimodal Agri-Credit
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
            Transforming agricultural credit decisioning through orbital telemetry, deep neural cloud inpainting, geospatial anti-fraud verification, and harvest-synchronized repayments.
          </p>
        </div>

        {/* 4 Pillars Single-View Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between transition-all hover:translate-y-[-3px] hover:shadow-lg group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#192837] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border truncate ${p.badgeColor}`}>
                      {p.tagline}
                    </span>
                  </div>

                  <h3
                    className="text-base font-bold mb-1.5 tracking-tight"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-4 border-t border-slate-200/70 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-[#0B2545] tracking-tight">{p.stat}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{p.statLabel}</div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-black/5 px-2.5 py-1 rounded-lg">
                    {p.highlight}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InnovationPillars;
