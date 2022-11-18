import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

type CalanderPickerProps = {
  value: Dayjs | null;
  callback: React.Dispatch<React.SetStateAction<Dayjs | null>>;
};

const CalanderPicker = ({ value, callback }: CalanderPickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        minDate={dayjs()}
        value={value}
        onChange={(newValue) => {
          callback(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
};

export default CalanderPicker;
