import React from 'react';
import { motion } from 'framer-motion';
import { Satellite, CloudRain, ShieldCheck, CalendarCheck, ArrowUpRight } from 'lucide-react';

const pillars = [
  {
    id: 'satellite', icon: Satellite, title: 'See the farm behind the credit file.',
    problem: 'WHEN CREDIT HISTORY IS THIN',
    description: 'Bring crop vigour and soil-moisture signals into the assessment, alongside financial history. Give the officer more evidence to work with.',
    mechanism: 'Sentinel-2 · NDVI & moisture signals',
    benefit: 'A fuller picture of the borrower', target: '#underwriting', action: 'Explore an assessment',
  },
  {
    id: 'cloudgap', icon: CloudRain, title: 'Keep monsoon gaps in view.',
    problem: 'WHEN CLOUDS HIDE THE CROP',
    description: 'CloudGap-CG reconstructs obscured imagery to support crop monitoring during the season that matters most. Review recovered signals with their confidence.',
    mechanism: 'CloudGap-CG · Image reconstruction',
    benefit: 'Continuity through the growing season', target: '#precision-preview', action: 'Explore crop intelligence',
  },
  {
    id: 'fraud', icon: ShieldCheck, title: 'Check the land before the loan.',
    problem: 'WHEN LAND CLAIMS OVERLAP',
    description: 'Compare parcel boundaries and flag overlapping claims with H3 spatial checks. Surface potential duplicate collateral for review before sanction.',
    mechanism: 'H3 indexing · Parcel overlap checks',
    benefit: 'Earlier visibility into collateral risk', target: '#underwriting', action: 'Review land details',
  },
  {
    id: 'harvest-emi', icon: CalendarCheck, title: 'Let repayments follow the harvest.',
    problem: 'WHEN INCOME ARRIVES SEASONALLY',
    description: 'Model repayments around crop-sale income and explore climate-triggered relief, so the proposed schedule reflects how the farm earns.',
    mechanism: 'Harvest-linked EMI · Climate scenarios',
    benefit: 'Repayment planning for seasonal income', target: '#stress-sim', action: 'Test a changing season',
  },
];

export default function InnovationPillars() {
  return <section id="innovations" className="relative w-full pt-10 pb-16 px-4 sm:px-6 scroll-mt-20">
    <div className="max-w-[1280px] mx-auto">
      <div className="max-w-3xl mb-9">
        <span className="font-mono text-xs tracking-widest text-slate-500">THE GEOKISAAN DIFFERENCE</span>
        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#192837]" style={{ fontFamily: 'var(--font-heading)' }}>Built for the realities of agricultural lending.</h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">A farm is more than a credit score. Connect crop conditions, land evidence and seasonal cash flow in one lending workflow.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((p, index) => <motion.article key={p.id} initial={false} whileInView={{ opacity: [0.85, 1] }} viewport={{ once: true }} className="rounded-2xl border border-slate-200 bg-white/90 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-7"><p.icon size={25} strokeWidth={1.5} className="text-[#0B2545]" /><span className="font-mono text-xs text-slate-400">0{index + 1}</span></div>
          <span className="text-[10px] tracking-wider font-mono text-slate-500 mb-3">{p.problem}</span>
          <h3 className="text-xl font-bold tracking-tight text-[#192837] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>{p.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed mt-4 mb-6">{p.description}</p>
          <div className="mt-auto border-t border-slate-200 pt-5"><p className="text-sm font-semibold text-[#0B2545]">{p.benefit}</p><p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{p.mechanism}</p><a href={p.target} className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B2545] min-h-12 mt-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{p.action}<ArrowUpRight size={15} /></a></div>
        </motion.article>)}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 px-6 py-5 bg-[#0B2545] text-white flex flex-col sm:flex-row justify-between gap-5 sm:items-center">
        <div><h3 className="font-semibold text-lg tracking-tight">And a conversation in your own language.</h3><p className="text-sm text-slate-300 mt-1">Ask Krishi Saathi about documents, crop conditions and the next step in your assessment.</p></div>
        <a href="#krishi-saathi" className="inline-flex items-center gap-2 text-sm font-semibold min-h-12 shrink-0">Meet Krishi Saathi<ArrowUpRight size={17} /></a>
      </div>
    </div>
  </section>;
}
