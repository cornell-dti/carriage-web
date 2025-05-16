import React, { FC, HTMLAttributes } from 'react';
import styles from './Button.module.css';

// Define an enum for button accent types
export enum ButtonAccent {
  DEFAULT = 'default',
  POSITIVE = 'positive',
  PRIMARY = 'primary',
  NEGATIVE = 'negative',
}

// Extended props interface including accent
interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  accent?: ButtonAccent;
}

// Map accent types to CSS class names
const accentClassMap = {
  [ButtonAccent.DEFAULT]: styles.defaultAccent,
  [ButtonAccent.POSITIVE]: styles.positiveAccent,
  [ButtonAccent.PRIMARY]: styles.primaryAccent,
  [ButtonAccent.NEGATIVE]: styles.negativeAccent,
};

export const PillButton: FC<ButtonProps> = ({
  children,
  onClick,
  className,
  accent = ButtonAccent.DEFAULT, // Default accent if not specified
  ...rest
}) => {
  // Get the CSS class for the selected accent
  const accentClass = accentClassMap[accent];

  return (
    <button
      className={`${styles.pillButton} ${accentClass} ${className || ''}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export const BoxButton: FC<ButtonProps> = ({
  children,
  onClick,
  accent = ButtonAccent.DEFAULT, // Default accent if not specified
  className,
  ...rest
}) => {
  // Get the CSS class for the selected accent
  const accentClass = accentClassMap[accent];

  return (
    <button
      className={`${styles.boxButton} ${accentClass} ${className || ''}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};
