import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type ThemeConfig = {
  bg: string;
  button: string;
  dot: string;
  progress: string;
};

export interface CarouselNavigatorProps {
  totalSlides?: number;
  autoDelay?: number;
  autoPlay?: boolean;
  themes?: ThemeConfig[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export const DEFAULT_THEMES: ThemeConfig[] = [
  {
    bg: 'bg-slate-100',
    button: 'bg-[#0B2545] hover:bg-[#133863]',
    dot: 'bg-slate-300 hover:bg-slate-400',
    progress: 'bg-[#0B2545]',
  },
  {
    bg: 'bg-emerald-50',
    button: 'bg-emerald-700 hover:bg-emerald-800',
    dot: 'bg-emerald-200 hover:bg-emerald-300',
    progress: 'bg-emerald-600',
  },
  {
    bg: 'bg-purple-50',
    button: 'bg-[#5B21B6] hover:bg-[#6D28D9]',
    dot: 'bg-purple-200 hover:bg-purple-300',
    progress: 'bg-[#7C3AED]',
  },
  {
    bg: 'bg-amber-50',
    button: 'bg-[#B45309] hover:bg-[#D97706]',
    dot: 'bg-amber-200 hover:bg-amber-300',
    progress: 'bg-[#D97706]',
  },
];

export const CarouselNavigator: React.FC<CarouselNavigatorProps> = ({
  totalSlides = 4,
  autoDelay = 5000,
  autoPlay = true,
  themes = DEFAULT_THEMES,
  currentIndex,
  onIndexChange,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = themes[currentIndex % themes.length];

  const goPrev = () => {
    onIndexChange((currentIndex - 1 + totalSlides) % totalSlides);
  };

  const goNext = () => {
    onIndexChange((currentIndex + 1) % totalSlides);
  };

  useEffect(() => {
    if (!autoPlay || isHovered) return;
    const timer = setTimeout(() => {
      onIndexChange((currentIndex + 1) % totalSlides);
    }, autoDelay);
    return () => clearTimeout(timer);
  }, [currentIndex, autoPlay, isHovered, autoDelay, totalSlides, onIndexChange]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Workflow step navigator"
      className={`inline-flex items-center justify-center gap-1.5 rounded-full p-1.5 border border-slate-200/80 shadow-xs transition-colors duration-300 ${theme.bg} ${className}`}
    >
      <ArrowButton
        onClick={goPrev}
        themeColor={theme.button}
        disabled={currentIndex === 0}
        ariaLabel="Previous pipeline step"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </ArrowButton>

      <div className="flex items-center gap-2 px-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <Indicator
            key={i}
            index={i}
            isActive={i === currentIndex}
            theme={theme}
            autoDelay={autoDelay}
            autoPlay={autoPlay}
            isPaused={isHovered}
            onClick={() => onIndexChange(i)}
          />
        ))}
      </div>

      <ArrowButton
        onClick={goNext}
        themeColor={theme.button}
        disabled={currentIndex === totalSlides - 1}
        ariaLabel="Next pipeline step"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </ArrowButton>
    </div>
  );
};

const ArrowButton = ({
  children,
  onClick,
  themeColor,
  disabled = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  themeColor: string;
  disabled?: boolean;
  ariaLabel: string;
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white shadow-xs transition-all cursor-pointer ${
        disabled
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
          : `${themeColor} active:scale-95`
      }`}
    >
      {children}
    </motion.button>
  );
};

const Indicator = ({
  isActive,
  theme,
  autoDelay,
  autoPlay,
  isPaused,
  index,
  onClick,
}: {
  isActive: boolean;
  theme: ThemeConfig;
  autoDelay: number;
  autoPlay: boolean;
  isPaused: boolean;
  index: number;
  onClick: () => void;
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Go to step ${index + 1}`}
      aria-current={isActive ? 'step' : undefined}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ borderRadius: 9999 }}
      className={`relative h-2.5 sm:h-3 cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545] transition-all duration-300 ${
        isActive ? `w-10 sm:w-12 ${theme.progress}` : `w-2.5 sm:w-3 ${theme.dot}`
      }`}
    >
      {isActive && autoPlay && (
        <motion.div
          key={`${index}-${isPaused}`}
          initial={{ width: '0%' }}
          animate={{ width: isPaused ? '0%' : '100%' }}
          transition={{ duration: autoDelay / 1000, ease: 'linear' }}
          className="absolute inset-0 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
      )}
    </motion.button>
  );
};

export default CarouselNavigator;
