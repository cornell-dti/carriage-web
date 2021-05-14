import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useReq } from '../../context/req';
import AnalyticsTable, { TableData } from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher from '../../components/TabSwitcher/TabSwitcher';
import { useEmployees } from '../../context/EmployeesContext';
import { Driver } from '../../types';
import ExportButton from '../../components/ExportButton/ExportButton';
import Notification from '../../components/Notification/Notification';

const Analytics = () => {
  const [analyticsData, setData] = useState<TableData[]>([]);
  const { withDefaults } = useReq();
  const { drivers } = useEmployees();
  const today = new Date();
  const to = moment(today).format('YYYY-MM-DD');
  const from = moment(today.setDate(today.getDate() - 30)).format('YYYY-MM-DD');

  const refreshTable = () => {
    fetch(`/api/stats/?from=${from}&to=${to}`, withDefaults())
      .then((res) => res.json())
      .then((data) => setData([...data]));
  };

  useEffect(() => {
    refreshTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateCols = () => {
    const cols = 'Date,Daily Total,Daily Ride Count,Day No Shows,Day Cancels,Night Ride Count, Night No Shows, Night Cancels';
    const finalCols = drivers.reduce((acc: string, curr: Driver) => (
      `${acc},${curr.firstName} ${curr.lastName.substring(0, 1)}.`
    ), cols);
    return finalCols;
  };

  const renderRight = () => (
    <>
      <ExportButton
        toastMsg={`${from} to ${to} data has been downloaded.`}
        endpoint={`/api/stats/download?from=${from}&to=${to}`}
        csvCols={generateCols()}
        filename={`${from}_${to}_analytics.csv`}
      />
      <Notification />
    </>
  );


  return (
    <TabSwitcher labels={['Ride Data', 'Driver Data']} renderRight={renderRight}>
      <AnalyticsTable type="ride" data={analyticsData} refreshTable={refreshTable} />
      <AnalyticsTable type="driver" data={analyticsData} refreshTable={refreshTable} />
    </TabSwitcher>
  );
};

export default Analytics;
