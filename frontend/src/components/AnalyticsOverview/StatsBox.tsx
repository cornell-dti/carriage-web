import React from 'react';
import classNames from 'classnames';

export type ColorVariant = 'green' | 'gray' | 'red' | 'default';

export interface StatsBoxProps {
  icon: string;
  alt: string;
  stats: string | number;
  description: string;
  className?: string;
  variant?: ColorVariant;
}

const StatsBox: React.FC<StatsBoxProps> = ({
  icon,
  alt,
  stats,
  description,
  className = '',
  variant = 'default',
}) => {
  const variantColors = {
    green: { icon: 'bg-green-100', text: 'text-green-600' },
    gray: { icon: 'bg-gray-100', text: 'text-gray-700' },
    red: { icon: 'bg-red-100', text: 'text-red-600' },
    default: { icon: 'bg-gray-50', text: 'text-gray-900' },
  };

  const colors = variantColors[variant];

  return (
    <div className={classNames('flex items-center p-5 min-w-[180px] bg-white rounded-lg transition-all duration-200 ease-in-out', className)}>
      <div className="flex items-center justify-center mr-4 shrink-0">
        <div className={classNames('rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out', colors.icon)}>
          {icon ? (
            <img src={icon} alt={alt} width={24} height={24} className="w-6 h-6 object-contain" />
          ) : (
            <div aria-hidden="true" />
          )}
        </div>
      </div>
      <div className="flex flex-col items-center text-center w-full">
        <p className={classNames('text-2xl font-semibold m-0 leading-tight', colors.text)}>{stats}</p>
        <p className="text-sm text-gray-500 m-0 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default StatsBox;
