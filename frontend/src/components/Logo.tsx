import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  fill?: string;
  dark?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  width = 32,
  height = 32,
  fill = '#192837',
  dark = false,
}) => {
  const finalFill = dark ? '#ffffff' : fill;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 256 256"
      fill={finalFill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z" />
    </svg>
  );
};

export default Logo;
