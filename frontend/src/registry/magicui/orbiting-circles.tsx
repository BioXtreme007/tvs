import React from 'react';

export function OrbitingCircles({
  children,
  radius = 145,
  iconSize = 46,
  reverse = false,
  speed = 1,
}: {
  children: React.ReactNode;
  radius?: number;
  iconSize?: number;
  reverse?: boolean;
  speed?: number;
}) {
  const nodes = React.Children.toArray(children);
  const duration = 40 / speed;
  const direction = reverse ? 'reverse' : 'normal';

  return (
    <div
      className="orbit-ring"
      style={{
        '--orbit-radius': `${radius}px`,
        '--orbit-duration': `${duration}s`,
        '--orbit-direction': direction,
      } as React.CSSProperties}
    >
      {nodes.map((node, index) => {
        const angle = (index * 360) / nodes.length;
        return (
          <div
            key={index}
            className="orbit-position"
            style={{
              '--orbit-angle': `${angle}deg`,
              width: iconSize,
              height: iconSize,
              margin: -iconSize / 2,
              animationName: 'orbit-move',
              animationDuration: `${duration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: direction,
              animationPlayState: 'running',
            } as React.CSSProperties}
          >
            <div
              className="orbit-counter"
              style={{
                animationName: 'orbit-counter',
                animationDuration: `${duration}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationDirection: direction,
                animationPlayState: 'running',
              } as React.CSSProperties}
            >
              {node}
            </div>
          </div>
        );
      })}
    </div>
  );
}

