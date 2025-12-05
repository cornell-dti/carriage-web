import { Menu, MenuItem } from '@mui/material';
import { useDate } from 'context/date';
import { useRides } from 'context/RidesContext';
import { FC, useState } from 'react';
import { format_date } from '../../util/index';
import buttonStyles from '../../styles/button.module.css';

export const CSVFromRidesButton: FC = () => {
  const { curDate } = useDate();
  const today = format_date(curDate);

  const [menuAnchorElement, setMenuAnchorElement] =
    useState<null | HTMLElement>(null);

  const { unscheduledRides, scheduledRides } = useRides();

  const handleExportMenuClose = () => {
    setMenuAnchorElement(null);
  };
  const handleExportOption = (
    type: 'scheduled' | 'unscheduled' | 'combined'
  ) => {
    setMenuAnchorElement(null);
    const rows: string[] = [];

    // columns for the export csv
    const header =
      'Rider First Name,Rider Last Name,Rider Phone,Rider Email,Rider Accessibility,Start Location Address,Start Time,End Location Address,End Time,Driver First Name,Driver Last Name,Type,Status,Scheduling State';
    rows.push(header);

    const rideToCSV = (ride: any) => {
      const rider = ride.riders && ride.riders[0];
      const driver = ride.driver;

      return [
        rider?.firstName || '',
        rider?.lastName || '',
        rider?.phoneNumber || '',
        rider?.email || '',
        rider?.accessibility?.join('; ') || '',
        ride.startLocation?.address || '',
        format_date(ride.startTime, 'h:mm a') || '',
        ride.endLocation?.address || '',
        format_date(ride.endTime, 'h:mm a') || '',
        driver?.firstName || '',
        driver?.lastName || '',
        ride.type || '',
        ride.status || '',
        ride.schedulingState || '',
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',');
    };

    if (type === 'scheduled' || type === 'combined') {
      scheduledRides.forEach((ride) => {
        rows.push(rideToCSV(ride));
      });
    }

    if (type === 'unscheduled' || type === 'combined') {
      unscheduledRides.forEach((ride) => {
        rows.push(rideToCSV(ride));
      });
    }

    // Create and download CSV file
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_rides_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        onClick={(e) => setMenuAnchorElement(e.currentTarget)}
        className={`${buttonStyles.buttonLarge} ${buttonStyles.buttonSecondary} ${buttonStyles.button}`}
      >
        Export Rides to CSV
      </button>
      <Menu
        id="basic-menu"
        anchorEl={menuAnchorElement}
        open={menuAnchorElement !== null}
        onClose={handleExportMenuClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
          paper: {
            style: {
              borderRadius: '0.25rem',
              boxShadow: 'none',
              border: '1px solid #e0e0e0',
            },
          },
        }}
      >
        <MenuItem onClick={() => handleExportOption('scheduled')}>
          Scheduled
        </MenuItem>
        <MenuItem onClick={() => handleExportOption('unscheduled')}>
          Unscheduled
        </MenuItem>
        <MenuItem onClick={() => handleExportOption('combined')}>
          Combined
        </MenuItem>
      </Menu>
    </>
  );
};
