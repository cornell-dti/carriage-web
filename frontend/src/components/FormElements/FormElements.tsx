import React, { SelectHTMLAttributes } from 'react';
import cn from 'classnames';
import Select, { ActionMeta, Props as SelectProps } from 'react-select';
import {
  Control,
  RegisterOptions,
  useController,
  Path,
  FieldValues,
} from 'react-hook-form';

type LabelType = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>;

export const Label = ({ className, children, ...props }: LabelType) => (
  <label {...props} className={cn('mr-2', className)}>
    {children}
  </label>
);

// This should only be used when you don't want a label to visually appear on screen
// Source: https://webaim.org/techniques/css/invisiblecontent/#techniques
export const SRLabel = ({ className, children, ...props }: LabelType) => (
  <label {...props} className={cn('sr-only', className)}>
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
      className={cn('border border-black rounded-sm text-base p-1', className)}
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
  disabled?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      type,
      name,
      small = false,
      outline = false,
      disabled,
      onClick,
      children,
    } = props;
    const btnClass = !outline
      ? 'text-white bg-black border border-black'
      : 'bg-white border border-black';
    const sizeClass = !small
      ? 'rounded-lg min-w-[6.563rem] p-2 px-4 text-center text-sm'
      : 'rounded-xl min-w-[5.375rem] p-1.5 px-3 text-center text-xs';
    return (
      <button
        type={type}
        className={cn(btnClass, sizeClass, 'cursor-pointer focus:shadow-lg focus:shadow-blue-600', className)}
        name={name}
        ref={ref}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
);

type Option = {
  id: string;
  name: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type SelectComponentProps<TFieldValues extends FieldValues> = SelectProps & {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  datalist: Option[];
  className?: string;
  rules?: RegisterOptions<TFieldValues>;
};

export const SelectComponent = <TFieldValues extends FieldValues>({
  control,
  name,
  datalist,
  className,
  rules,
  ...rest
}: SelectComponentProps<TFieldValues>) => {
  const {
    field: { onChange, value, ref, ...inputProps },
  } = useController<TFieldValues>({
    name,
    control,
    rules,
  });

  const transformedOptions = datalist.map((data) => ({
    value: data.id,
    label: data.name,
  }));

  const selectedOption = transformedOptions.find(
    (option) => option.value === value
  );

  return (
    <Select
      {...inputProps}
      options={transformedOptions}
      className={cn(className)}
      onChange={(newValue: unknown) => {
        const option = newValue as SelectOption | null;
        onChange(option?.value);
      }}
      value={selectedOption}
      {...rest}
    />
  );
};
