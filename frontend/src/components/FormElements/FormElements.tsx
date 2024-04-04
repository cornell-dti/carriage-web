import React, { SelectHTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './formelements.module.css';
import Select, { Props as SelectProps } from 'react-select';
import { Control, useController } from 'react-hook-form';

type LabelType = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>;

export const Label = ({ className, children, ...props }: LabelType) => (
  <label {...props} className={cn(styles.label, className)}>
    {children}
  </label>
);

// This should only be used when you don't want a label to visually appear on screen
// Source: https://webaim.org/techniques/css/invisiblecontent/#techniques
export const SRLabel = ({ className, children, ...props }: LabelType) => (
  <label {...props} className={cn(styles.srlabel, className)}>
    {children}
  </label>
);

type InputType = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Input = React.forwardRef<HTMLInputElement, InputType>(
  ({ type, className, ...props }, ref) => (
    <input
      {...props}
      className={cn(styles.input, styles[`${type}Input`], className)}
      type={type}
      ref={ref}
    />
  )
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
  }
);

type DataList = {
  id: string;
  name: string;
};

type SelectComponentProps = SelectProps & {
  control: Control;
  name: string;
  datalist: DataList[];
  className?: string;
};

export const SelectComponent: React.FC<SelectComponentProps> = ({
  control,
  name,
  datalist,
  className,
  ...rest
}) => {
  const transformedOptions = datalist.map((data) => ({
    value: data.id,
    label: data.name,
  }));

  const {
    field: { ref, onChange, value, ...inputProps },
  } = useController({
    name,
    control,
  });

  const selectedOption = transformedOptions.find(
    (option) => option.value === value
  );

  return (
    <Select
      {...inputProps}
      options={transformedOptions}
      className={cn(styles.customSelect, className)}
      onChange={(option) => onChange(option)}
      value={selectedOption}
      ref={ref}
      {...rest}
    />
  );
};