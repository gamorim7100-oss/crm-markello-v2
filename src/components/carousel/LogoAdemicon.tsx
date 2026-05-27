import React from 'react';

interface LogoAdemiconProps {
  className?: string;
  variant?: 'white' | 'red';
  unitName?: string;
}

export const LogoAdemicon: React.FC<LogoAdemiconProps> = ({ 
  className = '', 
  variant = 'white',
  unitName = 'Campeche'
}) => {
  const textColor = variant === 'white' ? '#ffffff' : '#ee3124';
  const unitColor = variant === 'white' ? '#ffffff' : '#414042';

  return (
    <div className={`flex flex-col items-start font-ubuntu ${className}`}>
      {/* Ademicon Logotype representation */}
      <svg 
        viewBox="0 0 400 100" 
        className="w-full h-auto"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <text 
          x="0" 
          y="60" 
          fontFamily="Ubuntu, sans-serif" 
          fontWeight="bold" 
          fontSize="64" 
          fill={textColor}
          letterSpacing="-1"
        >
          ADEMICON
        </text>
        <text 
          x="4" 
          y="95" 
          fontFamily="Ubuntu, sans-serif" 
          fontWeight="bold" 
          fontSize="24" 
          fill={unitColor}
          letterSpacing="4"
        >
          {unitName.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};
