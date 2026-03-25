import React, { useState } from 'react';
import { format, parse } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import styles from './requestridemodal.module.css';

type CustomDatePickerProps = {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  className?: string;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const displayValue = value
    ? format(parse(value, 'yyyy-MM-dd', new Date()), 'MM/dd/yyyy')
    : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <button
        type="button"
        className={className || styles.optionButton}
        onClick={() => setOpen(true)}
      >
        <span className={!displayValue ? styles.dateButtonPlaceholder : ''}>
          {displayValue || 'Date'}
        </span>
        <span aria-hidden="true" className={styles.optionIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M19 19H5V8H19M16 1V3H8V1H6V3H5C3.89 3 3 3.89 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V5C21 3.89 20.1 3 19 3H18V1"
              fill="black"
            />
          </svg>
        </span>
      </button>
      <MobileDatePicker
        open={open}
        onClose={() => setOpen(false)}
        value={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
        onChange={(date) => {
          if (date) onChange(format(date, 'yyyy-MM-dd'));
        }}
        slotProps={{
          textField: { sx: { display: 'none' } },
          dialog: {
            disablePortal: true,
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
