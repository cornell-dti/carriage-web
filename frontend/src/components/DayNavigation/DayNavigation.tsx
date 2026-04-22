import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDate } from 'context/date';

export const DayNavigation = () => {
  const { curDate, setCurDate } = useDate();

  const previousBusinessDay = () => {
    const newDate = new Date(curDate);
    newDate.setDate(newDate.getDate() - 1);

    setCurDate(newDate);
  };

  const nextBusinessDay = () => {
    const newDate = new Date(curDate);
    newDate.setDate(newDate.getDate() + 1);

    setCurDate(newDate);
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setCurDate(newDate);
    }
  };

  return (
    <div className="w-72 flex gap-1">
      <button
        onClick={previousBusinessDay}
        className="w-12 h-10 flex items-center justify-center cursor-pointer rounded text-base whitespace-nowrap px-4 border border-[#ddd] bg-white transition-colors duration-100 hover:bg-[#fafafa] active:bg-[#eaeaea]"
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
        className="w-12 h-10 flex items-center justify-center cursor-pointer rounded text-base whitespace-nowrap px-4 border border-[#ddd] bg-white transition-colors duration-100 hover:bg-[#fafafa] active:bg-[#eaeaea]"
        aria-label="Next Week"
        aria-hidden="true"
      >
        <NavigateNext></NavigateNext>
      </button>
    </div>
  );
};
