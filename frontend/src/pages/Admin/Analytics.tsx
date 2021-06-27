import React, { useEffect, useReducer, useState } from 'react';
import moment from 'moment';
import { useReq } from '../../context/req';
import AnalyticsTable from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher from '../../components/TabSwitcher/TabSwitcher';
import { useEmployees } from '../../context/EmployeesContext';
import { Driver, TableData } from '../../types';
import ExportButton from '../../components/ExportButton/ExportButton';
import Notification from '../../components/Notification/Notification';
import DateFilter from '../../components/AnalyticsTable/DateFilter';
import AnalyticsOverview from '../../components/AnalyticsOverview/AnalyticsOverview';

const Analytics = () => {
  const [analyticsData, setData] = useState<TableData[]>([]);
  const { withDefaults } = useReq();
  const { drivers } = useEmployees();
  const today = moment();
  const [startDate, setStartDate] = useState(today.format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(today.format('YYYY-MM-DD'));

  const onSelectDates = (startDate: string, endDate: string) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const refreshTable = () => {
    console.log('refresh');
    fetch(`/api/stats/?from=${startDate}&to=${endDate}`, withDefaults())
      .then((res) => res.json())
      .then((data) => setData([...data]));
  };

  useEffect(() => {
    refreshTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

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
        toastMsg={`${startDate} to ${endDate} data has been downloaded.`}
        endpoint={`/api/stats/download?from=${startDate}&to=${endDate}`}
        csvCols={generateCols()}
        filename={`${startDate}_${endDate}_analytics.csv`}
      />
      <Notification />
    </>
  );

  const getLabel = () => {
    const from = moment(startDate);
    const to = moment(endDate);
    if (from.year() !== to.year()) {
      return `${from.format('MMM D YYYY')} - ${to.format('MMM D YYYY')}`;
    }
    return `${from.format('MMM D')} - ${to.format('MMM D')}`;
  };

  return (
    <TabSwitcher labels={['Ride Data', 'Driver Data']} renderRight={renderRight}>
      <>
        <DateFilter
          initStartDate={startDate}
          initEndDate={endDate}
          onSubmit={onSelectDates}
        />
        <AnalyticsOverview type="ride" data={analyticsData} label={getLabel()} />
        <AnalyticsTable type="ride" data={analyticsData} refreshTable={refreshTable} />
      </>
      <>
        <DateFilter
          initStartDate={startDate}
          initEndDate={endDate}
          onSubmit={onSelectDates}
        />
        <AnalyticsOverview type="driver" data={analyticsData} label={getLabel()} />
        <AnalyticsTable type="driver" data={analyticsData} refreshTable={refreshTable} />
      </>
    </TabSwitcher>
  );
};

export default Analytics;
