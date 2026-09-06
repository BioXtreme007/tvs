import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightCircle, Sprout, ShieldCheck } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export const Hero: React.FC = () => {
  const scrollToInnovations = () => {
    const el = document.getElementById('innovations') || document.getElementById('lending-pipeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="relative z-10 w-full"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: 'clamp(32px, 6vw, 64px)',
        paddingBottom: '36px',
      }}
    >
      {/* Inner content wrapper: centered with generous max-width */}
      <div
        className="w-full flex flex-col items-center px-4"
        style={{ maxWidth: '860px', margin: '0 auto' }}
      >
        {/* Project Tag Pill */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#192837]/10 text-xs font-semibold shadow-sm"
          style={{ color: 'var(--color-text)' }}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          GeoKisaan E.P.I.C 8 · Multimodal Agri-Credit Decision Engine
        </motion.div>

        {/* Heading (<h1>) */}
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.75rem, 4.4vw, 3.15rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: 'var(--color-text)',
            textAlign: 'center',
          }}
        >
          {/* Line 1 */}
          <span className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap">
            <span>Power Smart Agri-Lending</span>
            <Sprout
              size={32}
              className="inline text-emerald-600 shrink-0"
              style={{
                verticalAlign: 'middle',
                position: 'relative',
                top: '-2px',
              }}
              strokeWidth={2.4}
            />
          </span>
          <br />
          {/* Line 2 */}
          <span className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap">
            <span>with Multimodal AI Security</span>
            <ShieldCheck
              size={30}
              className="inline text-[#7342E2] shrink-0"
              style={{
                verticalAlign: 'middle',
                position: 'relative',
                top: '-2px',
              }}
              strokeWidth={2.4}
            />
          </span>
        </motion.h1>

        {/* Subtext (<p>) */}
        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            color: 'var(--color-text)',
            opacity: 0.85,
            maxWidth: '560px',
            lineHeight: 1.65,
            textAlign: 'center',
          }}
          className="mt-6 font-medium"
        >
          Zero friction, total precision. Sentinel-2 remote sensing,
          CloudGap-CG monsoon inpainting, and grounded vernacular voice AI for
          rural India's non-stop growth.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            whileHover={{
              scale: 1.04,
              filter: 'brightness(1.1)',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={scrollToInnovations}
            className="flex items-center justify-between text-white cursor-pointer select-none"
            style={{
              borderRadius: '50px',
              backgroundColor: '#7342E2',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              padding: '17px 26px',
              minWidth: '220px',
              boxShadow: '0 4px 24px rgba(115,66,226,0.28)',
              gap: '32px',
            }}
          >
            <span>Explore AI Innovations</span>
            <ArrowRightCircle size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
