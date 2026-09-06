import React from "react";
import { ExecutiveStressSlider } from "./adaptive-slider";

export default function WhatIfSection() {
  return (
    <section id="stress-sim" className="relative w-full py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 max-w-2xl">
          <span className="block font-mono text-xs tracking-widest text-slate-500 mb-4">
            CREDIT COMMITTEE / STRESS TESTING
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B2545]"
            style={{
              fontFamily: "'Mazzard H', var(--font-heading), sans-serif",
            }}
          >
            A changing season.
            <br />A clearer view of risk.
          </h2>
          <p className="mt-5 text-slate-600 text-base leading-relaxed">
            Explore how rainfall, rising temperatures and market prices affect
            the portfolio — and what timely restructuring could protect.
          </p>
        </header>
        <ExecutiveStressSlider />
      </div>
    </section>
  );
}
