import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { SRLabel } from '../FormElements/FormElements';
import { ObjectType, TableData } from '../../types';
import { useEmployees } from '../../context/EmployeesContext';
import editIcon from './edit.svg';
import checkIcon from './check.svg';
import axios from '../../util/axios';

type Cell = string | number;

type RowProps = {
  data: Cell[];
  index: number;
  isEditing: boolean;
  onEdit: (
    rowIndex: number,
    cellIndex: number,
    date: string,
    value: number
  ) => void;
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

  const handleEdit = (
    e: React.FormEvent<HTMLInputElement>,
    cellIndex: number
  ) => {
    const { value } = e.currentTarget;
    onEdit(index, cellIndex, data[0] as string, Number(value));
  };

  return (
    <tr style={{ backgroundColor: index % 2 ? undefined : '#EBEAEA' }}>
      {data.map((d, cellIndex) => (
        <td
          key={cellIndex}
          className="py-4.5 px-2 text-center"
          style={{ borderRadius: getBorderRadius(cellIndex, data.length) }}
        >
          {isEditing && cellIndex >= 2 ? ( // excluding first two columns
            <div>
              <SRLabel htmlFor={`${index}${cellIndex}`}>Total</SRLabel>
              <input
                type="number"
                min={0}
                id={`${index}${cellIndex}`}
                className="bg-[#f2f2f2] border border-black box-border rounded-[10px] text-center w-14 text-base"
                defaultValue={d}
                onInput={(e) => handleEdit(e, cellIndex)}
              />
            </div>
          ) : (
            d
          )}
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
  const [driverNames, setDriverNames] = useState<string[]>([]);
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

  useEffect(() => {
    if (drivers && !driverNames.length) {
      setDriverNames(drivers.map((d) => `${d.firstName} ${d.lastName}`));
    }
  }, [driverNames, drivers]);

  const driverTableHeader = sharedCols.concat(
    driverNames.map((name) => {
      const [first, last] = name.split(' ');
      return `${first} ${last.charAt(0)}.`;
    })
  );

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
    value: number
  ) => {
    const cols = type === 'ride' ? dbRideCols : dbDriverCols;
    setEditData((prev) => {
      const newVal = { ...prev };
      const dateEdit = newVal.dates[date];
      const offset = 2;
      const index = cellIndex - offset;
      if (type === 'driver') {
        if (dateEdit === undefined && driverTableData) {
          // need to populate all drivers
          const driverRow = driverTableData[rowIndex].slice(offset);
          const driversEdit: ObjectType = {};
          driverNames.forEach((name, i) => {
            driversEdit[name] = driverRow[i];
          });
          driversEdit[cols[index]] = value;
          newVal.dates[date] = { drivers: driversEdit };
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
    axios.put('/api/stats/', editData).then(() => refreshTable());
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
    <div className="relative p-7.5 shadow-[2px_4px_15px_rgba(0,0,0,0.1)]">
      <button
        className="absolute top-5 right-8.5 border-none bg-none p-0"
        aria-label={!isEditing ? 'Edit' : 'Submit'}
        onClick={!isEditing ? () => setIsEditing(true) : handleSubmit}
      >
        {!isEditing ? (
          <img src={editIcon} alt="edit" />
        ) : (
          <img src={checkIcon} alt="checkmark" />
        )}
      </button>
      <div className="overflow-auto whitespace-nowrap">
        <table className="w-full border-collapse">
          <thead>
            <tr>
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
                      <th
                        key={idx}
                        className={cn('py-4.5 px-2 text-center', {
                          'sticky left-0': idx < 2,
                        })}
                        style={{ color }}
                      >
                        {title}
                      </th>
                    );
                  })
                : driverTableHeader.map((title, idx) => (
                    <th
                      key={idx}
                      className={cn('py-4.5 px-2 text-center', {
                        'sticky left-0': idx < 2,
                      })}
                    >
                      {title}
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {type === 'ride'
              ? rideTableData?.map((row, i) => (
                  <Row
                    key={i}
                    data={row}
                    isEditing={isEditing}
                    index={i}
                    onEdit={handleEdit}
                  />
                ))
              : driverTableData?.map((row, i) => (
                  <Row
                    key={i}
                    data={row}
                    isEditing={isEditing}
                    index={i}
                    onEdit={handleEdit}
                  />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
