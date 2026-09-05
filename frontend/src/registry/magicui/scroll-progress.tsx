import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export interface ScrollProgressProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  ({ className = '', style, ...props }, ref) => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
      stiffness: 200,
      damping: 50,
      restDelta: 0.001,
    });

    return (
      <motion.div
        ref={ref}
        className={`fixed inset-x-0 top-0 z-[100] h-[3.5px] origin-left bg-gradient-to-r from-[#A97CF8] via-[#7342E2] to-[#10B981] shadow-[0_0_10px_rgba(115,66,226,0.6)] pointer-events-none ${className}`}
        style={{
          scaleX,
          ...style,
        }}
        {...props}
      />
    );
  }
);

ScrollProgress.displayName = "ScrollProgress";
export default ScrollProgress;
