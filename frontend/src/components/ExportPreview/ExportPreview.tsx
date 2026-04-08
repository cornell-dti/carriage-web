import React, { useState, useRef } from 'react';
import { CSVLink } from 'react-csv';
import ScheduledTable from '../UserTables/ScheduledTable';
import { useEmployees } from '../../context/EmployeesContext';
import ExportButton from '../ExportButton/ExportButton';
import { useDate } from '../../context/date';
import { format_date } from '../../util';
import axios from '../../util/axios';

const ExportPreview = () => {
  const { drivers } = useEmployees();
  const [downloadData, setDownloadData] = useState<string>('');
  const { curDate } = useDate();
  const csvLink = useRef<
    CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
  >(null);

  const today = format_date(curDate);

  const downloadCSV = () => {
    axios
      .get(`/api/rides/download?date=${today}`, {
        responseType: 'text',
        transformResponse: [(data) => data],
      })
      .then((res) => res.data)
      .then((data) => {
        setDownloadData(data);
        if (csvLink.current) {
          csvLink.current.link.click();
        }
      });
  };

  return (
    <>
      <p className="font-bold text-gray-400 ml-[2%] mt-[2%]">{format_date(curDate)}</p>
      <h1 className="ml-[2%]">Scheduled Rides</h1>
      <div id="exportTable">
        <ScheduledTable />
      </div>
      <div className="pb-[5%] mt-[2%] ml-1/2 -translate-x-1/4">
        {/* <ExportButton onClick={downloadCSV} /> */}
        <CSVLink
          data={downloadData}
          filename={`scheduledRides_${today}.csv`}
          className="hidden"
          ref={csvLink}
          target="_blank"
        />
      </div>
    </>
  );
};

export default ExportPreview;
