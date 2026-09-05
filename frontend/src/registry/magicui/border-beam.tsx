import React from 'react';

export interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = '',
  size = 240,
  duration = 8,
  anchor = 90,
  borderWidth = 3,
  colorFrom = '#FF5722',
  colorTo = '#7342E2',
  delay = 0,
}) => {
  return (
    <div
      style={
        {
          '--size': `${size}px`,
          '--duration': `${duration}s`,
          '--anchor': `${anchor}%`,
          '--border-width': `${borderWidth}px`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay}s`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-[-1.5px] rounded-[inherit] border-beam-wrapper ${className}`}
    >
      <div className="border-beam-core" />
    </div>
  );
};

export default BorderBeam;
