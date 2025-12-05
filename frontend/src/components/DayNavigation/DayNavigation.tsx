import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDate } from 'context/date';
import buttonStyles from '../../styles/button.module.css';

export const DayNavigation = () => {
  const { curDate, setCurDate } = useDate();

  const previousBusinessDay = () => {
    const newDate = new Date(curDate);
    newDate.setDate(newDate.getDate() - 1);

    while (newDate.getDay() === 0 || newDate.getDay() === 6) {
      newDate.setDate(newDate.getDate() - 1);
    }

    setCurDate(newDate);
  };

  const nextBusinessDay = () => {
    const newDate = new Date(curDate);
    newDate.setDate(newDate.getDate() + 1);

    while (newDate.getDay() === 0 || newDate.getDay() === 6) {
      newDate.setDate(newDate.getDate() + 1);
    }

    setCurDate(newDate);
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setCurDate(newDate);
    }
  };

  return (
    <div
      style={{
        width: '18rem',
        display: 'flex',
        gap: '0.25rem',
      }}
    >
      <button
        onClick={previousBusinessDay}
        className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
        style={{ width: '3rem', height: '2.5rem' }}
        aria-label="Previous Week"
        aria-hidden="true"
      >
        <NavigateBefore></NavigateBefore>
      </button>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Viewing Rides for"
          value={curDate}
          onAccept={handleDateChange}
          slotProps={{
            textField: {
              sx: {
                width: '14rem',
                '& .MuiInputBase-root': {
                  height: '2.5rem',
                },
                '& .MuiInputBase-input': {
                  padding: '0.5rem',
                  paddingX: '1rem',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ddd',
                    transition: 'border 0.1s',
                  },
                },
              },
            },
            popper: {
              sx: {
                '& .MuiPaper-root': {
                  border: '1px solid #ddd',
                  boxShadow: 'none',
                },
                '& .MuiPickersDay-root': {
                  '&.Mui-selected': {
                    backgroundColor: '#333',
                    '&:hover': {
                      backgroundColor: '#444',
                    },
                  },
                },
              },
            },
          }}
          format="MM/dd/yyyy"
        />
      </LocalizationProvider>
      <button
        onClick={nextBusinessDay}
        className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
        style={{ width: '3rem', height: '2.5rem' }}
        aria-label="Next Week"
        aria-hidden="true"
      >
        <NavigateNext></NavigateNext>
      </button>
    </div>
  );
};
