import React, { useEffect, useState } from 'react';
import ScheduledTable from '../UserTables/ScheduledTable';
import { Driver } from '../../types/index';

const ExportPreview = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetch('/drivers')
      .then((res) => res.json())
      .then(({ data }) => setDrivers(data));
  }, []);

  return (
    <>
      <div id="exportTable">
        {drivers.map(
          (driver: Driver, index: number) =>
            <ScheduledTable key={index} driverId={driver.id}
              driverName={driver.firstName + " " + driver.lastName} />
        )}
      </div>
    </>
  )
}

export default ExportPreview
