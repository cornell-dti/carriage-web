import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { ObjectType } from '../../types';
import { useEmployees } from '../../context/EmployeesContext';
import table, { TableData } from './data';
import editIcon from './edit.svg';
import checkIcon from './check.svg';
import styles from './analyticstable.module.css';


type Cell = string | number;

type RowProps = {
  data: Cell[];
  index: number;
  isEditing: boolean;
  onEdit: (rowIndex: number, cellIndex: number, date: string, value: number) => void;
};

const Row = ({ data, index, isEditing, onEdit }: RowProps) => {
  const getBorderRadius = (cellIndex: number, length: number) => {
    let borderRadius;
    if (!index) {
      if (!cellIndex) {
        borderRadius = '10px 0 0 0';
      } else if (cellIndex + 1 === length) {
        borderRadius = '0 10px 0 0';
      }
    }
    return borderRadius;
  };

  const handleEdit = (e: React.FormEvent<HTMLInputElement>, cellIndex: number) => {
    const { value } = e.currentTarget;
    onEdit(index, cellIndex, data[0] as string, Number(value));
  };

  return (
    <tr
      className={styles.row}
      style={{ backgroundColor: index % 2 ? undefined : '#EBEAEA' }}
    >
      {data.map((d, cellIndex) => (
        <td
          className={styles.cell}
          style={{ borderRadius: getBorderRadius(cellIndex, data.length) }}
        >
          {isEditing && cellIndex >= 2 // excluding first two columns
            ? (
              <input
                type='number'
                min={0}
                className={styles.input}
                defaultValue={d}
                onInput={(e) => handleEdit(e, cellIndex)}
              />
            ) : d
          }
        </td>
      ))}
    </tr>
  );
};

type TableProps = {
  type: 'ride' | 'driver';
};

const Table = ({ type }: TableProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rideTableData, setRideTableData] = useState<Cell[][]>();
  const [driverTableData, setDriverTableData] = useState<Cell[][]>();
  const [editData, setEditData] = useState<ObjectType>({ dates: {} });
  const { drivers } = useEmployees();

  const sharedCols = ['Date', 'Daily Total'];

  const rideTableHeader = sharedCols.concat([
    'Daily Ride Count',
    'Day No Shows',
    'Day Cancels',
    'Night Ride Count',
    'Night No Shows',
    'Night Cancels',
  ]);

  const driverNames: string[] = [];
  const driverShortNames: string[] = [];

  drivers
    .sort((a, b) => (
      `${a.firstName} ${a.lastName}` < `${b.firstName} ${b.lastName}` ? -1 : 1
    ))
    .forEach((d) => {
      driverNames.push(`${d.firstName} ${d.lastName}`);
      driverShortNames.push(`${d.firstName} ${d.lastName.substring(0, 1)}.`);
    });

  const driverTableHeader = sharedCols.concat(driverShortNames);

  const dbRideCols = [
    'dayCount',
    'dayNoShow',
    'dayCancel',
    'nightCount',
    'nightNoShow',
    'nightCancel',
    'dailyTotal',
  ];
  const dbDriverCols = [...driverNames, 'dailyTotal'];

  const initRideData = (data: TableData[]) => {
    const rideData: Cell[][] = [];
    data
      .sort((a, b) => (a.year + a.monthday < b.year + b.monthday ? 1 : -1))
      .forEach((d) => {
        const month = d.monthday.substring(0, 2);
        const day = d.monthday.substring(2);
        const date = `${month}/${day}/${d.year}`;
        const dailyTotal = d.dayCount + d.nightCount;
        const rideRow = [
          date,
          dailyTotal,
          d.dayCount,
          d.dayNoShows,
          d.dayCancels,
          d.nightCount,
          d.nightNoShows,
          d.nightCancels,
        ];
        rideData.push(rideRow);
      });
    setRideTableData(rideData);
  };

  const initDriverData = (data: TableData[]) => {
    const driverData: Cell[][] = [];
    data
      .sort((a, b) => (a.year + a.monthday < b.year + b.monthday ? 1 : -1))
      .forEach((d) => {
        const month = d.monthday.substring(0, 2);
        const day = d.monthday.substring(2);
        const date = `${month}/${day}/${d.year}`;
        const dailyTotal = Object.values(d.drivers).reduce((a, b) => a + b, 0);
        const driverRow = [date, dailyTotal];
        driverNames.forEach((driver) => {
          driverRow.push(d.drivers[driver] || 0);
        });
        driverData.push(driverRow);
      });
    setDriverTableData(driverData);
  };

  const handleEdit = (
    rowIndex: number,
    cellIndex: number,
    date: string,
    value: number,
  ) => {
    const cols = type === 'ride' ? dbRideCols : dbDriverCols;
    setEditData((prev) => {
      const newVal = { ...prev };
      const dateEdit = newVal.dates[date];
      const offset = 2;
      const index = cellIndex - offset;
      if (type === 'driver') {
        if (dateEdit === undefined) {
          // need to populate all drivers
          const driverRow = driverTableData![rowIndex].slice(offset);
          const driversEdit: ObjectType = {};
          driverNames.forEach((name, i) => {
            driversEdit[name] = driverRow[i];
          });
          driversEdit[cols[index]] = value;
          newVal.dates[date] = {
            drivers: driversEdit,
          };
        } else {
          newVal.dates[date].drivers = {
            ...dateEdit.drivers,
            [cols[index]]: value,
          };
        }
      } else {
        newVal.dates[date] = {
          ...dateEdit,
          [cols[index]]: value,
        };
      }
      return newVal;
    });
  };

  const handleSubmit = () => {
    setEditData({ dates: {} });
    setIsEditing(false);
  };

  useEffect(() => console.log(editData), [editData]);

  useEffect(() => {
    if (type === 'ride') {
      initRideData(table.data);
    } else {
      initDriverData(table.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, drivers.length]);

  return (
    <div className={styles.analyticsTable}>
      <button
        className={styles.editBtn}
        aria-label={!isEditing ? 'Edit' : 'Submit'}
        onClick={!isEditing ? () => setIsEditing(true) : handleSubmit}
      >
        {!isEditing ? (
          <img src={editIcon} alt="edit" />
        ) : (
          <img src={checkIcon} alt="checkmark" />
        )}
      </button>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.row}>
              {type === 'ride'
                ? rideTableHeader.map((title, i) => {
                  let color;
                  if (i >= 2 && i <= 4) {
                    color = '#F2911D';
                  }
                  if (i >= 5 && i <= 7) {
                    color = '#1594F2';
                  }
                  return (
                    <th
                      className={cn(styles.cell, { [styles.sticky]: i < 2 })}
                      style={{ color }}
                    >
                      {title}
                    </th>
                  );
                })
                : driverTableHeader.map((title, i) => (
                  <th className={cn(styles.cell, { [styles.sticky]: i < 2 })}>
                    {title}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {type === 'ride'
              ? rideTableData?.map((row, i) => (
                <Row
                  data={row}
                  isEditing={isEditing}
                  index={i}
                  onEdit={handleEdit}
                />
              ))
              : driverTableData?.map((row, i) => (
                <Row
                  data={row}
                  isEditing={isEditing}
                  index={i}
                  onEdit={handleEdit}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div >
  );
};

export default Table;
