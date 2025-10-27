import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEmployees } from 'context/EmployeesContext';
import moment from 'moment';
import { Driver } from 'types';
import ExportButton from 'components/ExportButton/ExportButton';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import styles from '../Modal/modal.module.css';

const theme = createTheme();

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { drivers } = useEmployees();
  const today = moment();
  const [startDate, setStartDate] = React.useState(today.format('YYYY-MM-DD'));
  const [endDate, setEndDate] = React.useState(today.format('YYYY-MM-DD'));

  //Creates csv column string
  const generateCols = () => {
    const cols =
      'Date,Daily Total,Daily Ride Count,Day No Shows,Day Cancels,Night Ride Count, Night No Shows, Night Cancels';
    const finalCols = drivers.reduce(
      (acc: string, curr: Driver) =>
        `${acc},${curr.firstName} ${curr.lastName.substring(0, 1)}.`,
      cols
    );
    return finalCols;
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Button
          sx={{
            color: 'white',
            backgroundColor: 'black',
            border: '0.15rem solid #000000',
            width: '120px',
            padding: '.063 rem .5rem',
            borderRadius: '10px',
            textTransform: 'none',
            boxSizing: 'border-box',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
          onClick={handleOpen}
        >
          Export Data
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          slotProps={{
            backdrop: {
              className: styles.background,
            },
          }}
        >
          <Box className={styles.modal}>
            <h3 className={styles.title} id="modal-modal-title">
              Export Statistics
            </h3>

            <div className={styles.form}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>
                  <DatePicker
                    label="Start Date"
                    value={dayjs(startDate)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setStartDate(newValue.format('YYYY-MM-DD'));
                      }
                    }}
                  />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <DatePicker
                    label="End Date"
                    value={dayjs(endDate)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setEndDate(newValue.format('YYYY-MM-DD'));
                      }
                    }}
                    minDate={dayjs(startDate)} //data validation
                  />
                </div>
              </LocalizationProvider>
            </div>

            <div className={styles.buttonContainer}>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleClose}
              >
                Cancel
              </button>
              <div className={styles.submit}>
                <ExportButton
                  toastMsg={`${startDate} to ${endDate} data has been downloaded.`}
                  endpoint={`/api/stats/download?from=${startDate}&to=${endDate}`}
                  csvCols={generateCols()}
                  filename={`${startDate}_${endDate}_analytics.csv`}
                />
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </ThemeProvider>
  );
}
