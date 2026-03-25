import React from 'react';
import { format, parse } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

type CustomTimePickerProps = {
  value: string; // HH:mm (24-hour)
  onChange: (timeStr: string) => void;
  label?: string;
};

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  label,
}) => {
  const dateValue = value ? parse(value, 'HH:mm', new Date(2000, 0, 1)) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        label={label || 'Time'}
        value={dateValue}
        onChange={(newValue: Date | null) => {
          if (newValue) onChange(format(newValue, 'HH:mm'));
        }}
        minutesStep={1}
        enableAccessibleFieldDOMStructure={false}
        slotProps={{
          popper: { disablePortal: true },
          mobilePaper: { onClick: (e: React.MouseEvent) => e.stopPropagation() },
          textField: { fullWidth: true },
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomTimePicker;
