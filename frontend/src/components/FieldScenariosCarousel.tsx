import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CloudRain, Sprout,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Layers,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export interface FieldScenario {
  id: string;
  name: string;
  district: string;
  village: string;
  category: string;
  categoryBadge: string;
  acreage: number;
  crop: string;
  ndvi: number;
  ndmi: number;
  score: number;
  tier: string;
  decision: 'AUTO_APPROVE' | 'FAST_TRACK_APPROVE' | 'PRE_APPROVED_MAX' | 'FRAUD_REJECT';
  decisionLabel: string;
  sanctionAmount: string;
  interestRate: string;
  sowingEmi: string;
  harvestEmi: string;
  cloudCoverage: string;
  keyFeature: string;
  summary: string;
}

const scenarios: FieldScenario[] = [
  {
    id: 'rajeshwar-raipur',
    name: 'Rajeshwar Sahu',
    district: 'Raipur',
    village: 'Abhanpur Block, Khasra 142/1',
    category: 'Prime Smallholder Paddy Farmer',
    categoryBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    acreage: 4.5,
    crop: 'Kharif Paddy (Grade A)',
    ndvi: 0.68,
    ndmi: 0.19,
    score: 735,
    tier: 'PRIME',
    decision: 'AUTO_APPROVE',
    decisionLabel: 'Instant Auto-Approve',
    sanctionAmount: '₹5,50,000',
    interestRate: '8.4% Subsidized PSL',
    sowingEmi: '₹1,500 / mo',
    harvestEmi: '₹55,000 Mandi Bullet',
    cloudCoverage: '42% (CloudGap Inpainted 99.4%)',
    keyFeature: 'Zero physical patwari inspection required. Verified via Sentinel-2 orbital pass.',
    summary:
      'Healthy vegetative vigor and verified Bhuvan land boundaries qualify for TVS Harvest EMI with 118-second autonomous sanction.',
  },
  {
    id: 'sukhram-bastar',
    name: 'Sukhram Markam',
    district: 'Bastar',
    village: 'Tokapal, Khasra 88/2',
    category: 'Monsoon-Impacted Marginal Farmer',
    categoryBadge: 'bg-blue-50 text-blue-800 border-blue-200',
    acreage: 2.1,
    crop: 'Rainfed Maize & Millets',
    ndvi: 0.61,
    ndmi: 0.14,
    score: 672,
    tier: 'GOOD',
    decision: 'FAST_TRACK_APPROVE',
    decisionLabel: 'Fast-Track Sanction',
    sanctionAmount: '₹2,80,000',
    interestRate: '9.2% Floating',
    sowingEmi: '₹950 / mo',
    harvestEmi: '₹28,000 Mandi Bullet',
    cloudCoverage: '88% Severe Cloud Cover (Rescued)',
    keyFeature: 'CloudGap ST-DIP penetrated 88% monsoon overcast to prevent false loan rejection.',
    summary:
      'Without AI cloud inpainting, heavy Bastar monsoon clouds would have blocked satellite imagery and stalled the sanction for 3 weeks.',
  },
  {
    id: 'kavita-bilaspur',
    name: 'Kavita Patel',
    district: 'Bilaspur',
    village: 'Kota Block, Plot 310/4',
    category: 'Progressive High-Tech Agripreneur',
    categoryBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    acreage: 6.0,
    crop: 'Double-Crop Paddy & Solar Drip Veg',
    ndvi: 0.76,
    ndmi: 0.28,
    score: 785,
    tier: 'SUPER PRIME',
    decision: 'PRE_APPROVED_MAX',
    decisionLabel: 'Pre-Approved Max Ceiling',
    sanctionAmount: '₹7,50,000 + ₹1.4L',
    interestRate: '7.9% Prime PSL',
    sowingEmi: '₹2,100 / mo',
    harvestEmi: 'Dual Harvest Bullet (Nov + Apr)',
    cloudCoverage: '15% Clear Sky',
    keyFeature: 'Eligible for TVS Farm Implement Harvester add-on with 0% extra processing fee.',
    summary:
      'Topsoil organic carbon (0.72%) and canal perennial irrigation back highest credit tier with dual Kharif/Rabi harvest alignments.',
  },
  {
    id: 'synthetic-fraud-durg',
    name: 'Suspicious Duplicate Claim',
    district: 'Durg',
    village: 'Patan Sector, Khasra 999/X',
    category: 'Two-Tier Cadastral Anti-Fraud Defense',
    categoryBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    acreage: 5.0,
    crop: 'Claimed Paddy (Barren Fallow Detected)',
    ndvi: 0.14,
    ndmi: -0.05,
    score: 410,
    tier: 'HIGH RISK',
    decision: 'FRAUD_REJECT',
    decisionLabel: 'Autonomous Fraud Lockout',
    sanctionAmount: '₹0 (Sanction Blocked)',
    interestRate: 'N/A',
    sowingEmi: 'N/A',
    harvestEmi: 'N/A',
    cloudCoverage: '0% Clear Optical',
    keyFeature: 'Two-Tier H3 Hexagonal Grid detected duplicate polygon overlap with active TVS borrower.',
    summary:
      'Synthetic fraud attempt caught immediately by Bhuvan H3 cadastral overlap verification and NDVI barren index (0.14 vs required 0.40).',
  },
];

export default function FieldScenariosCarousel({ onSelectScenario }: { onSelectScenario?: (scenario: FieldScenario) => void }) {
  return <section id="scenarios" className="field-stories section-shell">
    <div className="section-heading"><span className="section-kicker">PEOPLE BEHIND THE NUMBERS</span><h2>Lending in the field.</h2><p>Different farms. Different seasons. A credit journey built around each one.</p></div>
    <div className="field-story-grid">{scenarios.map((scenario, index) => <article className={'field-story story-' + index} key={scenario.id}>
      <div className="story-top"><span>0{index + 1} / {scenario.district}</span><span className="story-symbol">{index === 3 ? <ShieldCheck size={27} /> : index === 1 ? <CloudRain size={27} /> : <Sprout size={27} />}</span></div>
      <div className="story-body"><span className="story-category">{['SMALLHOLDER FINANCE','MONSOON RESILIENCE','FARM GROWTH','LAND VERIFICATION'][index]}</span><h3>{['A stronger start for every season.','See the farm beyond the clouds.','Room for the next chapter.','Confidence starts with clear land.'][index]}</h3><p>{['Explore a paddy farmer’s application with harvest-aligned repayments.','Consider a rainfed farm where cloud cover complicates crop assessment.','Explore the needs of an established farm planning its next investment.','Check an example with overlapping land claims before making a decision.'][index]}</p></div>
      <div className="story-details"><span>{scenario.name}</span><span>{scenario.acreage} acres · {scenario.district}</span></div>
      <button onClick={() => { onSelectScenario?.(scenario); document.getElementById('underwriting')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore this example <ArrowRight size={17} /></button>
    </article>)}</div>
  </section>;
}
