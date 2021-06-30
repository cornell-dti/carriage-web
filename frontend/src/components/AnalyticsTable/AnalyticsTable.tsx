import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { SRLabel } from '../FormElements/FormElements';
import { ObjectType, TableData } from '../../types';
import { useEmployees } from '../../context/EmployeesContext';
import editIcon from './edit.svg';
import checkIcon from './check.svg';
import styles from './analyticstable.module.css';
import { useReq } from '../../context/req';

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
              <div>
                <SRLabel htmlFor={`${index}${cellIndex}`}>Total</SRLabel>
                <input
                  type='number'
                  min={0}
                  id={`${index}${cellIndex}`}
                  className={styles.input}
                  defaultValue={d}
                  onInput={(e) => handleEdit(e, cellIndex)}
                />
              </div>
            ) : d
          }
        </td>
      ))}
    </tr>
  );
};

type TableProps = {
  type: 'ride' | 'driver';
  data: TableData[];
  refreshTable: () => void;
};

const Table = ({ type, data, refreshTable }: TableProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rideTableData, setRideTableData] = useState<Cell[][]>();
  const [driverTableData, setDriverTableData] = useState<Cell[][]>();
  const [editData, setEditData] = useState<ObjectType>({ dates: {} });
  const { withDefaults } = useReq();
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

  drivers.forEach((d) => {
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
    fetch('/api/stats/', withDefaults({
      method: 'PUT',
      body: JSON.stringify(editData),
    }))
      .then(() => refreshTable());
    setEditData({ dates: {} });
    setIsEditing(false);
  };

  useEffect(() => {
    if (drivers && data) {
      const rideData: Cell[][] = [];
      const driverData: Cell[][] = [];
      data
        .sort((a, b) => (a.year + a.monthDay < b.year + b.monthDay ? 1 : -1))
        .forEach((d) => {
          const month = d.monthDay.substring(0, 2);
          const day = d.monthDay.substring(2);
          const date = `${month}/${day}/${d.year}`;
          const dailyTotal = d.dayCount + d.nightCount;
          if (type === 'ride') {
            rideData.push([
              date,
              dailyTotal,
              d.dayCount,
              d.dayNoShow,
              d.dayCancel,
              d.nightCount,
              d.nightNoShow,
              d.nightCancel,
            ]);
          } else {
            const driverRow = [date, dailyTotal];
            driverNames.forEach((driver) => {
              driverRow.push(d.drivers[driver] || 0);
            });
            driverData.push(driverRow);
          }
        });
      setRideTableData(rideData);
      setDriverTableData(driverData);
    }
  }, [data, driverNames, drivers, type]);

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
                ? rideTableHeader.map((title, idx) => {
                  let color;
                  if (idx >= 2 && idx <= 4) {
                    color = '#F2911D';
                  }
                  if (idx >= 5 && idx <= 7) {
                    color = '#1594F2';
                  }
                  return (
                    <th key={idx}
                      className={cn(styles.cell, { [styles.sticky]: idx < 2 })}
                      style={{ color }}
                    >
                      {title}
                    </th>
                  );
                })
                : driverTableHeader.map((title, idx) => (
                  <th key={idx} className={cn(styles.cell, { [styles.sticky]: idx < 2 })}>
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
