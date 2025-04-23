import React, { FC, HTMLAttributes } from 'react';

// Define an enum for button accent types
export enum ButtonAccent {
  DEFAULT = 'default',
  POSITIVE = 'positive',
  PRIMARY = 'primary',
  NEGATIVE = 'negative',
}

// Extended props interface including accent
interface PillButtonProps extends HTMLAttributes<HTMLButtonElement> {
  accent?: ButtonAccent;
}

const PillButton: FC<PillButtonProps> = ({
  children,
  onClick,
  accent = ButtonAccent.DEFAULT, // Default accent if not specified
  ...rest
}) => {
  // Define styles for each accent type
  const accentStyles = {
    [ButtonAccent.DEFAULT]: {
      border: 'border-neutral-300',
      background: 'bg-neutral-50',
      hover: 'hover:bg-neutral-100',
    },
    [ButtonAccent.POSITIVE]: {
      border: 'border-[#8ec695]',
      background: 'bg-[#e4ffea]',
      hover: 'hover:bg-[#c5f3cf]',
    },
    [ButtonAccent.PRIMARY]: {
      border: 'border-[#6b9bd3]',
      background: 'bg-[#e0ecff]',
      hover: 'hover:bg-[#c5d8f7]',
    },
    [ButtonAccent.NEGATIVE]: {
      border: 'border-[#d97979]',
      background: 'bg-[#ffe0e0]',
      hover: 'hover:bg-[#f7c5c5]',
    },
  };

  // Get the styles for the selected accent
  const { border, background, hover } = accentStyles[accent];

  return (
    <button
      className={`w-min h-min text-nowrap flex gap-2 px-4 py-2 ${border} ${background} ${hover} rounded-full hover:cursor-pointer transition-colors duration-200`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default PillButton;
