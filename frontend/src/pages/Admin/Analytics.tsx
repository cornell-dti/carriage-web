import React, { useState } from 'react';
import moment from 'moment';
import AnalyticsTable from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher from '../../components/TabSwitcher/TabSwitcher';
import { TableData } from '../../types';
import Notification from '../../components/Notification/Notification';
import DateFilter from '../../components/AnalyticsTable/DateFilter';
import AnalyticsOverview from '../../components/AnalyticsOverview/AnalyticsOverview';
import axios from '../../util/axios';
import StatsModal from 'components/Modal/StatsModal';

const Analytics = () => {
  const [analyticsData, setData] = useState<TableData[]>([]);
  const today = moment();
  const [startDate, setStartDate] = useState(today.format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(today.format('YYYY-MM-DD'));

  React.useEffect(() => {
    document.title = 'Analytics - Carriage';
  }, []);

  const refreshTable = (start = startDate, end = endDate) => {
    axios
      .get(`/api/stats/?from=${start}&to=${end}`)
      .then((res) => res.data)
      .then((data) => setData([...data]));
  };

  const onSelectDates = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    refreshTable(start, end);
  };

  const renderRight = () => (
    <>
      <StatsModal initStartDate={startDate} initEndDate={endDate}></StatsModal>
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
    <TabSwitcher
      labels={['Ride Data', 'Driver Data']}
      renderRight={renderRight}
    >
      <>
        <DateFilter
          initStartDate={startDate}
          initEndDate={endDate}
          onSubmit={onSelectDates}
        />
        <AnalyticsOverview
          type="ride"
          data={analyticsData}
          label={getLabel()}
        />
        <AnalyticsTable
          type="ride"
          data={analyticsData}
          refreshTable={refreshTable}
        />
      </>
      <>
        <DateFilter
          initStartDate={startDate}
          initEndDate={endDate}
          onSubmit={onSelectDates}
        />
        <AnalyticsOverview
          type="driver"
          data={analyticsData}
          label={getLabel()}
        />
        <AnalyticsTable
          type="driver"
          data={analyticsData}
          refreshTable={refreshTable}
        />
      </>
    </TabSwitcher>
  );
};

export default Analytics;
