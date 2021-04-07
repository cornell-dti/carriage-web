import React, { useEffect, useState } from 'react';
import { useEmployees } from '../../context/EmployeesContext';
import table from './data';
import editIcon from './edit.svg';
import checkIcon from './check.svg';
import styles from './analyticstable.module.css';

type RowProps = {
  data: Array<string | number>;
  index: number;
  isEditing: boolean;
  onEdit: (date: string, cellIndex: number, value: number) => void;
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
    onEdit(data[0] as string, cellIndex, Number(value));
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
          {isEditing && cellIndex // excluding date column
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
  const [rideTableData, setRideTableData] = useState<string[][]>();
  const [driverTableData, setDriverTableData] = useState<string[][]>();
  const [editData, setEditData] = useState<{[key: string]: any}>({ dates: {} });
  const { drivers } = useEmployees();

  const rideTableHeader = [
    'Date',
    'Day Ride Count',
    'Day No Shows',
    'Day Cancels',
    'Night Ride Count',
    'Night No Shows',
    'Night Cancels',
    'Daily Total',
  ];

  const driverNames = drivers
    .sort((a, b) => (`${a.firstName} ${a.lastName}` < `${b.firstName} ${b.lastName}` ? -1 : 1))
    .map((d) => `${d.firstName} ${d.lastName}`);

  const driverShortNames = drivers
    .sort((a, b) => (`${a.firstName} ${a.lastName}` < `${b.firstName} ${b.lastName}` ? -1 : 1))
    .map((d) => `${d.firstName} ${d.lastName.substring(0, 1)}.`);

  const driverTableHeader = ['Date', ...driverShortNames, 'Daily Total'];

  const rideTableCols = ['dayCount', 'dayNoShow', 'dayCancel', 'nightCount', 'nightNoShow', 'nightCancel', 'dailyTotal'];
  const driverTableCols = [...driverNames, 'dailyTotal'];

  const handleEdit = (date: string, cellIndex: number, value: number) => {
    const cols = type === 'ride' ? rideTableCols : driverTableCols;
    setEditData((prev) => {
      const newVal = { ...prev };
      newVal.dates[date] = {
        ...newVal.dates[date],
        [cols[cellIndex - 1]]: value,
      };
      return newVal;
    });
  };

  useEffect(() => console.log(editData), [editData]);

  useEffect(() => {
    const rideData: any = [];
    const driverData: any = [];
    table.data
      .sort((a, b) => (a.year + a.monthday < b.year + b.monthday ? 1 : -1))
      .forEach((d) => {
        const month = d.monthday.substring(0, 2);
        const day = d.monthday.substring(2);
        const date = `${month}/${day}/${d.year}`;
        const total = String(d.dayCount + d.nightCount);
        const rideRow = [
          date,
          d.dayCount,
          d.dayNoShows,
          d.dayCancels,
          d.nightCount,
          d.nightNoShows,
          d.nightCancels,
          total,
        ];
        const driverRow: any[] = [date];
        driverNames.forEach((driver) => {
          driverRow.push(d.drivers[driver] || 0);
        });
        driverRow.push(total);
        rideData.push(rideRow);
        driverData.push(driverRow);
      });
    setRideTableData(rideData);
    setDriverTableData(driverData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverNames.length]);

  return (
    <div className={styles.tableContainer}>
      {!isEditing ? (
        <img
          className={styles.icon}
          onClick={() => setIsEditing(true)}
          src={editIcon}
          alt="edit icon"
        />
      ) : (
        <img
          className={styles.icon}
          onClick={() => setIsEditing(false)}
          src={checkIcon}
          alt="done icon"
        />
      )}
      <table className={styles.table}>
        <thead>
          <tr className={styles.row}>
            {type === 'ride'
              ? rideTableHeader.map((title, i) => {
                let color;
                if (i >= 1 && i <= 3) {
                  color = '#F2911D';
                }
                if (i >= 4 && i <= 6) {
                  color = '#1594F2';
                }
                return (
                  <th className={styles.cell} style={{ color }}>
                    {title}
                  </th>
                );
              })
              : driverTableHeader.map((title, i) => (
                  <th className={styles.cell}>{title}</th>
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
  );
};

export default Table;
