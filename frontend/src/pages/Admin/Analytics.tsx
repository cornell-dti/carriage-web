import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useReq } from '../../context/req';
import AnalyticsTable, { TableData } from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher from '../../components/TabSwitcher/TabSwitcher';

const Analytics = () => {
  const [analyticsData, setData] = useState<TableData[]>([]);
  const { withDefaults } = useReq();
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


  return (
    <TabSwitcher labels={['Ride Data', 'Driver Data']}>
      <AnalyticsTable type="ride" data={analyticsData} refreshTable={refreshTable} />
      <AnalyticsTable type="driver" data={analyticsData} refreshTable={refreshTable} />
    </TabSwitcher>
  );
};

export default Analytics;
