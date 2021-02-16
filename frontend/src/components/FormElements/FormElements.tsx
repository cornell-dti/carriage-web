import React from 'react';
import cn from 'classnames';
import styles from './formelements.module.css';

type LabelType = (
  React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
);

export const Label = ({ className, children, ...props }: LabelType) => (
  <label {...props} className={cn(styles.label, className)}>
    {children}
  </label>
);

type InputType = (
  React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
);

// eslint-disable-next-line react/display-name
export const Input = React.forwardRef<HTMLInputElement, InputType>(
  // eslint-disable-next-line react/prop-types
  ({ type, className, ...props }, ref) => (
    <input
      {...props}
      className={cn(styles.input, styles[`${type}Input`], className)}
      type={type}
      ref={ref}
    />
  ),
);

type ButtonProps = {
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  name?: string;
  small?: boolean;
  outline?: boolean;
  onClick?: (e: React.BaseSyntheticEvent) => void;
  children: React.ReactNode;
};

// eslint-disable-next-line react/display-name
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      // eslint-disable-next-line react/prop-types
      className, type, name, small = false, outline = false, onClick, children,
    } = props;
    const btnClass = !outline ? styles.primaryBtn : styles.secondaryBtn;
    const sizeClass = !small ? styles.lgBtn : styles.smBtn;
    return (
      <button
        type={type}
        className={cn(btnClass, sizeClass, className)}
        name={name}
        ref={ref}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
);
