import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Mail,
  CheckCircle2,
  Cpu,
  Satellite,
  ShieldCheck,
  Sparkles,
  Bot,
  Layers,
} from 'lucide-react';
import Logo from './Logo';
import TeamOrbit from './TeamOrbit';

export const Footer: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmailInput('');
    }
  };

  return (
    <footer
      className="relative w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-[#192837]/10 overflow-hidden"
      style={{ backgroundColor: '#EAE1DF' }}
    >
      <div className="max-w-[1240px] mx-auto flex flex-col gap-14 sm:gap-16">
        {/* ===================================================================
            UPPER FLOATING CARD: TEAM BIOXTREME & RADAR ORBITAL SYSTEM
            Matches reference design with classic cool font, orbital rings & Contact Us
            =================================================================== */}
        <div className="relative w-full bg-white/95 backdrop-blur-md rounded-[32px] p-8 sm:p-12 lg:p-14 border border-black/[0.06] shadow-[0_24px_50px_-12px_rgba(11,37,69,0.09)] overflow-hidden">
          {/* Subtle ambient gradient in the background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-100/40 via-purple-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Team Info, Classic Cool Typography, and Contact Us */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6 sm:gap-7">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold tracking-wider uppercase text-slate-600 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>GeoKisaan E.P.I.C 8 · Hackathon Innovation</span>
              </div>

              {/* Main Heading with Classic Cool Standout Professional Font */}
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <h2 className="font-bioxtreme text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-[#0B2545] leading-[1.12]">
                  Team BioXtreme
                </h2>
                <div className="text-xs sm:text-[13px] font-bold tracking-wider text-emerald-700 uppercase leading-snug">
                  Autonomous Multimodal Agri-Credit Decision Engine & Space-Agri AI
                </div>
              </div>

              {/* Project description aligned to hackathon with relaxed, breathable line height */}
              <p className="text-slate-600/90 text-sm sm:text-base leading-[1.85] max-w-xl font-normal tracking-normal">
                Engineered for GeoKisaan E.P.I.C 8. Uniting Sentinel-2 10m multispectral satellite remote sensing,
                CloudGap-CG monsoon inpainting, Two-Tier cadastral anti-fraud defense, and grounded vernacular
                voice AI for rural India&apos;s next-generation agricultural lending.
              </p>

              {/* Contact Us button routing to sudheesh.singh02@gmail.com */}
              <div className="flex flex-wrap items-center gap-4 pt-3 sm:pt-4">
                <a
                  href="mailto:sudheesh.singh02@gmail.com?subject=GeoKisaan%20EPIC%208%20-%20Team%20BioXtreme%20Inquiry"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0B2545] text-white hover:bg-[#133863] text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  aria-label="Contact Team BioXtreme"
                >
                  <Mail size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Contact Us</span>
                  <ArrowUpRight size={16} className="text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400">Direct:</span>
                  <a
                    href="mailto:sudheesh.singh02@gmail.com"
                    className="hover:text-[#0B2545] hover:underline font-medium text-slate-700"
                  >
                    sudheesh.singh02@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5"><TeamOrbit /></div>
          </div>
        </div>

        {/* ===================================================================
            LOWER 4-COLUMN FOOTER NAVIGATION & NEWSLETTER
            Structured exactly like the reference design, aligned to GeoKisaan & BioXtreme
            =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pt-4">
          {/* Column 1: Brand & BioXtreme Attestation (Cols 1-4) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="font-extrabold text-base tracking-tight text-[#0B2545]">
                GeoKisaan
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B2545] text-white">
                E.P.I.C 8
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              The Next-Generation Multimodal Agri-Credit Decision Engine & Space-Agri Hub.
              Pioneering orbital remote sensing and vernacular intelligence for rural prosperity.
            </p>
            <div className="text-[11px] font-medium text-slate-500 pt-1">
              Engineered by <span className="font-semibold text-slate-800 font-bioxtreme">Team BioXtreme</span>
            </div>
          </div>

          {/* Column 2: Platform Modules (Cols 5-6) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </div>
            <ul className="flex flex-col gap-2 text-xs text-slate-600 font-medium">
              <li>
                <a href="#innovations" className="hover:text-slate-900 transition-colors">
                  4 Innovation Pillars
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-slate-900 transition-colors">
                  Portfolio Risk Map
                </a>
              </li>
              <li>
                <a href="#stress-sim" className="hover:text-slate-900 transition-colors">
                  Stress Simulator
                </a>
              </li>
              <li>
                <a href="#ews" className="hover:text-slate-900 transition-colors">
                  Early Warning System
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Innovations & APIs (Cols 7-8) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Innovations
            </div>
            <ul className="flex flex-col gap-2 text-xs text-slate-600 font-medium">
              <li>
                <a href="#innovations" className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                  <span>Sentinel-2 NDVI</span>
                  <ArrowUpRight size={11} className="text-slate-400" />
                </a>
              </li>
              <li>
                <a href="#innovations" className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                  <span>CloudGap-CG</span>
                  <ArrowUpRight size={11} className="text-slate-400" />
                </a>
              </li>
              <li>
                <a href="#innovations" className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                  <span>H3 Cadastral Grid</span>
                  <ArrowUpRight size={11} className="text-slate-400" />
                </a>
              </li>
              <li>
                <a href="#innovations" className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                  <span>Vernacular Voice AI</span>
                  <ArrowUpRight size={11} className="text-slate-400" />
                </a>
              </li>
              <li>
                <a href="/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                  <span>FastAPI Docs</span>
                  <ArrowUpRight size={11} className="text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Smart Decision Alerts (Cols 9-12) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Newsletter
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive precision credit decisioning updates, model benchmark releases, and Kharif monsoon radar bulletins.
            </p>

            {/* Email form with @ and arrow circle button */}
            <form onSubmit={handleSubscribe} className="relative flex items-center mt-1">
              <span className="absolute left-3.5 text-slate-400 font-mono text-xs select-none">
                @
              </span>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email..."
                className="w-full pl-8 pr-12 py-2.5 rounded-full bg-white border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545] transition-all shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-7 h-7 rounded-full bg-[#0B2545] text-white flex items-center justify-center hover:bg-[#133863] transition-colors cursor-pointer shadow-sm"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight size={13} />
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full w-fit">
                <CheckCircle2 size={13} className="text-emerald-700" />
                <span>Newsletter delivery is not connected in this demo. Please contact the team for updates.</span>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            BOTTOM COPYRIGHT BAR
            Excluded 'Built in Framer' and the 3 social icons as instructed
            =================================================================== */}
        <div className="pt-8 border-t border-[#192837]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © 2026 GeoKisaan Services Ltd · Built by Team BioXtreme. All rights reserved.
          </div>
          <div className="flex items-center gap-5 text-slate-500 font-medium">
            <span className="hover:text-slate-900 cursor-pointer">RBI Fair Lending Compliance</span>
            <span className="text-slate-300">·</span>
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="text-slate-300">·</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
