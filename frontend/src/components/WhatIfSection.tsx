import React, { useState } from 'react';
import { CloudRain, Thermometer, TrendingDown, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const WhatIfSection: React.FC = () => {
  const [rainfallChange, setRainfallChange] = useState<number>(-30);
  const [tempIncrease, setTempIncrease] = useState<number>(2.5);
  const [priceChange, setPriceChange] = useState<number>(-10);

  const baseGnpa = 2.45;
  const portfolioCr = 1250.0;
  const baseFarmers = 28400;

  const droughtPen = Math.max(0, -rainfallChange) * 0.08;
  const heatPen = tempIncrease * 0.45;
  const pricePen = Math.max(0, -priceChange) * 0.05;

  const stressedGnpaPct = parseFloat((baseGnpa + droughtPen + heatPen + pricePen).toFixed(2));
  const stressedCr = parseFloat(((portfolioCr * stressedGnpaPct) / 100).toFixed(1));
  const baseCr = parseFloat(((portfolioCr * baseGnpa) / 100).toFixed(1));
  const incrementalNpaCr = parseFloat((stressedCr - baseCr).toFixed(1));
  const atRiskFarmers = Math.round(baseFarmers * (stressedGnpaPct / 100));

  const mitigatedGnpaPct = parseFloat((stressedGnpaPct * 0.68).toFixed(2));
  const savedCr = parseFloat((incrementalNpaCr * 0.65).toFixed(1));

  return (
    <section id="stress-sim" className="relative w-full py-20 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-xs font-semibold mb-3">
            <CloudRain size={14} className="text-[#0B2545]" />
            <span>Credit Committee Stress Testing</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            Macro-Climatic What-If Stress Simulator
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-2xl">
            Simulate portfolio defaults under drought, heatwave, and price crash conditions, testing GeoKisaan's restructuring shield.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Interactive Sliders (6 cols) */}
          <div className="lg:col-span-6 glass-card rounded-3xl p-8 flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Macro-Economic & Climatic Shock Inputs
            </h3>

            {/* Slider 1: Rainfall Deficit */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <CloudRain size={16} className="text-blue-600" /> Rainfall Deficit / Surplus
                </span>
                <span className="text-sm text-blue-700 font-extrabold">
                  {rainfallChange > 0 ? `+${rainfallChange}` : rainfallChange}%
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="20"
                step="5"
                value={rainfallChange}
                onChange={(e) => setRainfallChange(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>Severe Drought (-50%)</span>
                <span>Normal (0%)</span>
                <span>Excess (+20%)</span>
              </div>
            </div>

            {/* Slider 2: Temperature Rise */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <Thermometer size={16} className="text-rose-600" /> Heatwave Temperature Rise
                </span>
                <span className="text-sm text-rose-700 font-extrabold">+{tempIncrease}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={tempIncrease}
                onChange={(e) => setTempIncrease(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>Normal (+0°C)</span>
                <span>Heat Spike (+2.5°C)</span>
                <span>Extreme (+5.0°C)</span>
              </div>
            </div>

            {/* Slider 3: Mandi Crop Price Shock */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <TrendingDown size={16} className="text-amber-600" /> Mandi Crop Market Price Shock
                </span>
                <span className="text-sm text-amber-700 font-extrabold">
                  {priceChange > 0 ? `+${priceChange}` : priceChange}%
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="10"
                step="5"
                value={priceChange}
                onChange={(e) => setPriceChange(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>Severe Crash (-40%)</span>
                <span>Baseline MSP (0%)</span>
                <span>Favorable (+10%)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-bold mr-1">Historical Presets:</span>
              <button
                onClick={() => { setRainfallChange(-35); setTempIncrease(3.0); setPriceChange(-15); }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 transition-colors border border-slate-300 cursor-pointer"
              >
                2017 Mega-Drought
              </button>
              <button
                onClick={() => { setRainfallChange(-20); setTempIncrease(1.5); setPriceChange(-25); }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 transition-colors border border-slate-300 cursor-pointer"
              >
                Mandi Price Crash
              </button>
              <button
                onClick={() => { setRainfallChange(0); setTempIncrease(0); setPriceChange(0); }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right: Stress Output & TVS Savings (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Impact Metrics Card */}
            <div className="glass-card rounded-3xl p-7">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Stress Testing Output
                </h4>
                <span className="text-xs px-3 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                  Portfolio: ₹1,250 Cr
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Stressed GNPA</span>
                  <div className="text-3xl font-black text-rose-600 mt-1">{stressedGnpaPct}%</div>
                  <span className="text-[10px] text-slate-400 font-semibold">Baseline: 2.45%</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Stressed NPA Amount</span>
                  <div className="text-3xl font-black text-slate-800 mt-1">₹{stressedCr} Cr</div>
                  <span className="text-[10px] text-rose-600 font-bold">+{incrementalNpaCr} Cr spike</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2.5">
                <ShieldAlert size={18} className="shrink-0 text-amber-700" />
                <span>
                  <strong>{atRiskFarmers.toLocaleString()} rural borrowers</strong> face severe climatic distress under this shock scenario.
                </span>
              </div>
            </div>

            {/* GeoKisaan Proactive Restructuring Benefit Card */}
            <div className="glass-card-dark text-white rounded-3xl p-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles size={16} /> GeoKisaan Restructuring Shield
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
                  PROACTIVE MITIGATION
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-slate-300 font-medium">Capital Loss Prevented</span>
                  <div className="text-4xl font-black text-emerald-400 mt-1">
                    ₹{savedCr} Crores
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-300 font-medium">Mitigated GNPA</span>
                  <div className="text-2xl font-bold text-white mt-1">
                    {mitigatedGnpaPct}%
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                By automatically converting monthly EMIs into nominal maintenance and deferred bullet installments aligned with Mandi sales, GeoKisaan saves <strong>65% of potential defaults</strong> before the 90-day SMA-2 mark.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIfSection;
