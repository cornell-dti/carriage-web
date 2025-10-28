import * as React from 'react';
import Box from '@mui/material/Box';
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
import { useState } from 'react';
import { useEffect } from 'react';
import { Button } from 'components/FormElements/FormElements';

const theme = createTheme();

type StatsModalProps = {
  initStartDate: string;
  initEndDate: string;
};

const StatsModal = ({ initStartDate, initEndDate }: StatsModalProps) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { drivers } = useEmployees();
  const [startDate, setStartDate] = useState(initStartDate);
  const [endDate, setEndDate] = useState(initEndDate);
  const today = moment();

  useEffect(() => {
    if (open) {
      setStartDate(initStartDate);
      setEndDate(initEndDate);
    }
  }, [initStartDate, initEndDate, open]);

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

  //logic for handling when start and end dates are for shortcut buttons
  const handleShortcut = (shortcut: string) => {
    const today = dayjs();
    if (shortcut === 'this week') {
      const newStartDate = today.startOf('week').format('YYYY-MM-DD'); //beginning of week to today
      const newEndDate = today.format('YYYY-MM-DD');
      return { newStartDate, newEndDate };
    } else if (shortcut === 'last week') {
      const prevWeek = today.subtract(7, 'day'); //seven days ago to today
      const newStartDate = prevWeek.startOf('week').format('YYYY-MM-DD');
      const newEndDate = prevWeek.endOf('week').format('YYYY-MM-DD');
      return { newStartDate, newEndDate };
    } else if (shortcut === 'last 7') {
      const newStartDate = today.subtract(7, 'day').format('YYYY-MM-DD'); //beginning of last week to end of last week
      const newEndDate = today.format('YYYY-MM-DD');
      return { newStartDate, newEndDate };
    } else if (shortcut === 'curr month') {
      const newStartDate = today.startOf('month').format('YYYY-MM-DD'); //beginning of month to today
      const newEndDate = today.format('YYYY-MM-DD');
      return { newStartDate, newEndDate };
    } else if (shortcut === 'curr year') {
      const newStartDate = today.startOf('year').format('YYYY-MM-DD'); //beginning of year to today
      const newEndDate = today.format('YYYY-MM-DD');
      return { newStartDate, newEndDate };
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ alignContent: 'space-between' }}>
        <Button onClick={handleOpen}>Export Data</Button>
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
            <div className={styles.colBlock}>
              <div className={styles.rowBlock}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={dayjs(startDate)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setStartDate(newValue.format('YYYY-MM-DD'));
                      }
                    }}
                    maxDate={dayjs(today.format('YYYY-MM-DD'))} //data validation
                  />

                  <DatePicker
                    label="End Date"
                    value={dayjs(endDate)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setEndDate(newValue.format('YYYY-MM-DD'));
                      }
                    }}
                    minDate={dayjs(startDate)} //data validation
                    maxDate={dayjs(today.format('YYYY-MM-DD'))}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <div className={styles.btnList}>
              <button
                className={styles.btnListItem}
                onClick={(event) => {
                  const newStartDate =
                    handleShortcut('this week')?.newStartDate ??
                    today.format('YYYY-MM-DD');
                  const newEndDate =
                    handleShortcut('this week')?.newEndDate ??
                    today.format('YYYY-MM-DD');
                  setStartDate(newStartDate);
                  setEndDate(newEndDate);
                }}
              >
                This Week
              </button>

              <button
                className={styles.btnListItem}
                onClick={(event) => {
                  const newStartDate =
                    handleShortcut('last week')?.newStartDate ??
                    today.format('YYYY-MM-DD');
                  const newEndDate =
                    handleShortcut('last week')?.newEndDate ??
                    today.format('YYYY-MM-DD');
                  setStartDate(newStartDate);
                  setEndDate(newEndDate);
                }}
              >
                Last Week{' '}
              </button>

              <button
                className={styles.btnListItem}
                onClick={(event) => {
                  const newStartDate =
                    handleShortcut('last 7')?.newStartDate ??
                    today.format('YYYY-MM-DD');
                  const newEndDate =
                    handleShortcut('last 7')?.newEndDate ??
                    today.format('YYYY-MM-DD');
                  setStartDate(newStartDate);
                  setEndDate(newEndDate);
                }}
              >
                Last 7 Days
              </button>
              <button
                className={styles.btnListItem}
                onClick={(event) => {
                  const newStartDate =
                    handleShortcut('curr month')?.newStartDate ??
                    today.format('YYYY-MM-DD');
                  const newEndDate =
                    handleShortcut('curr month')?.newEndDate ??
                    today.format('YYYY-MM-DD');
                  setStartDate(newStartDate);
                  setEndDate(newEndDate);
                }}
              >
                Current Month
              </button>
              <button
                className={styles.btnListItem}
                onClick={(event) => {
                  const newStartDate =
                    handleShortcut('curr year')?.newStartDate ??
                    today.format('YYYY-MM-DD');
                  const newEndDate =
                    handleShortcut('curr year')?.newEndDate ??
                    today.format('YYYY-MM-DD');
                  setStartDate(newStartDate);
                  setEndDate(newEndDate);
                }}
              >
                Year to Date
              </button>
            </div>

            <div
              className={styles.buttonContainer}
              style={{ marginTop: '10px' }}
            >
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
};

export default StatsModal;
