import React, { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./adaptive-slider.css";

type Color = { text: string; gradient: string; thumbBorder?: string };
export interface SliderColorConfig {
  low: Color;
  mid: Color;
  high: Color;
}
export const weatherColors: SliderColorConfig = {
  low: {
    text: "#DC2626",
    gradient: "linear-gradient(to right, #EF4444, #F97316)",
  },
  mid: {
    text: "#059669",
    gradient: "linear-gradient(to right, #10B981, #059669)",
  },
  high: {
    text: "#2563EB",
    gradient: "linear-gradient(to right, #3B82F6, #1D4ED8)",
  },
};
export interface AdaptiveSliderBaseProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  colorConfig?: SliderColorConfig;
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
  valueText?: string;
  endpointLabels?: [string, string];
}
export function AnimatedText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <span className="adaptive-odometer" aria-hidden="true">
      {Array.from(text).map((digit, index) => (
        <span className="adaptive-digit" key={text.length - index}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={digit}
              initial={reduced ? false : { opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 350, damping: 25 }
              }
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
export function AdaptiveSliderBase({
  value,
  min,
  max,
  step = 1,
  unit = "",
  prefix = "",
  label,
  sublabel,
  icon: Icon,
  colorConfig = weatherColors,
  onChange,
  disabled,
  className = "",
  valueText,
  endpointLabels,
}: AdaptiveSliderBaseProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const safeValue = Math.max(min, Math.min(max, value));
  const percentage = max > min ? ((safeValue - min) / (max - min)) * 100 : 0;
  const color =
    percentage < 35
      ? colorConfig.low
      : percentage <= 70
        ? colorConfig.mid
        : colorConfig.high;
  const decimals = String(step).split(".")[1]?.length || 0;
  const display = valueText ?? `${prefix}${safeValue.toFixed(decimals)}${unit}`;
  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 28, mass: 0.8 };
  return (
    <div
      className={`adaptive-control ${className}`}
      data-disabled={disabled || undefined}
    >
      <div className="adaptive-control-heading">
        <div>
          <label htmlFor={id}>
            {Icon && <Icon size={18} />}
            {label}
          </label>
          {sublabel && <p id={`${id}-help`}>{sublabel}</p>}
        </div>
        <output htmlFor={id} style={{ color: color.text }}>
          <span className="sr-only">{display}</span>
          {valueText ? (
            <span aria-hidden="true">{display}</span>
          ) : (
            <AnimatedText text={display} />
          )}
        </output>
      </div>
      <div className="adaptive-track">
        <div className="adaptive-track-bed" aria-hidden="true">
          <motion.div
            className="adaptive-fill"
            animate={{
              width: `calc(${percentage}% + ${48 * (1 - percentage / 100)}px)`,
              background: color.gradient,
            }}
            transition={spring}
          />
          <div className="adaptive-dots">
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>
        <motion.div
          aria-hidden="true"
          className="adaptive-thumb"
          animate={{
            left: `calc(${percentage}% - ${percentage * 0.48}px)`,
            borderColor: color.thumbBorder || color.text,
          }}
          transition={spring}
        >
          <span />
          <span />
        </motion.div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          disabled={disabled}
          aria-valuetext={display}
          aria-describedby={sublabel ? `${id}-help` : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="adaptive-endpoints" aria-hidden="true">
        <span>{endpointLabels?.[0] ?? `${min}${unit}`}</span>
        <span>{endpointLabels?.[1] ?? `${max}${unit}`}</span>
      </div>
    </div>
  );
}
