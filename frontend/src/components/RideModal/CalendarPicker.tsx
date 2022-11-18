import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Moment } from 'moment';
import { Dayjs } from 'dayjs';

type CalanderPickerProps = {
  value: Dayjs | null;
  callback: React.Dispatch<React.SetStateAction<Dayjs | null>>;
};

const CalanderPicker = ({ value, callback }: CalanderPickerProps) => {
  // const [value, setValue] = React.useState<Moment | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        label="Basic example"
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
