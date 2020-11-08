import React from 'react';
import cn from 'classnames';
import styles from './formelements.module.css';

type LabelType = (
  React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
);

export const Label = ({ className, htmlFor, children }: LabelType) => (
  <label className={cn(styles.label, className)} htmlFor={htmlFor}>
    {children}
  </label>
);

type InputType = (
  React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
);

export const Input = React.forwardRef<HTMLInputElement, InputType>(
  ({ className, type, name, placeholder, value, list }, ref) => (
    <input
      type={type}
      className={cn(styles.input, styles[`${type}Input`], className)}
      name={name}
      placeholder={placeholder}
      value={value}
      list={list}
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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      type,
      name,
      small = false,
      outline = false,
      onClick,
      children,
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
