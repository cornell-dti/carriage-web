import React from 'react';

export type ColorVariant = 'green' | 'gray' | 'red' | 'default';

export interface StatsBoxProps {
  icon: string;
  alt: string;
  stats: string | number;
  description: string;
  className?: string;
  variant?: ColorVariant;
}

const getVariantStyles = (variant: ColorVariant) => {
  const iconBgMap: Record<ColorVariant, string> = {
    green: 'bg-[rgba(34,197,94,0.1)]',
    gray: 'bg-[rgba(107,114,128,0.1)]',
    red: 'bg-[rgba(246,59,59,0.1)]',
    default: 'bg-[rgba(0,0,0,0.04)]',
  };
  const statColorMap: Record<ColorVariant, string> = {
    green: 'text-[#16a34a]',
    gray: 'text-[#4b5563]',
    red: 'text-[#eb2525]',
    default: 'text-[#111827]',
  };
  return {
    iconBg: iconBgMap[variant],
    statColor: statColorMap[variant],
  };
};

const StatsBox: React.FC<StatsBoxProps> = ({
  icon,
  alt,
  stats,
  description,
  className = '',
  variant = 'default',
}) => {
  const { iconBg, statColor } = getVariantStyles(variant);
  return (
    <div className={`flex items-center p-5 px-6 min-w-45 bg-white rounded-lg transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-center mr-4 shrink-0">
        {icon ? (
          <div className={`rounded-full w-10 h-10 flex items-center justify-center ${iconBg} transition-all duration-200`}>
            <img
              className="w-6 h-6 object-contain"
              src={icon}
              alt={alt}
              width={40}
              height={40}
            />
          </div>
        ) : (
          <div
            className={`rounded-full w-10 h-10 flex items-center justify-center ${iconBg} transition-all duration-200`}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex flex-col items-center text-center w-full">
        <p className={`text-2xl font-semibold m-0 leading-tight ${statColor}`}>{stats}</p>
        <p className="text-sm text-[#6b7280] m-0 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default StatsBox;
