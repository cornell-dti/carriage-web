/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useReq } from '../../context/req';
import AnalyticsTable, { TableData } from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher, { Tab } from '../../components/TabSwitcher/TabSwitcher';

const Analytics = () => {
   const [analyticsData, setData] = useState<TableData[]>([]);
   const { withDefaults } = useReq();
   const today = new Date();
   const to = moment(today).format('YYYY-MM-DD');
   const from = moment(today.setDate(today.getDate() - 10)).format('YYYY-MM-DD');
   const fetchURL = `/api/stats/?from=${from}&to=${to}`;

   fetch(fetchURL, withDefaults())
      .then((res) => res.json())
      .then((data) => setData(data));

   return (
      <div>
         <TabSwitcher>
            <Tab label="Rider Data">
               <AnalyticsTable type="ride" data={analyticsData} fetchURL={fetchURL} />
            </Tab>
            <Tab label="Driver Data">
               <AnalyticsTable type="driver" data={analyticsData} fetchURL={fetchURL} />
            </Tab>
         </TabSwitcher>
      </div>
   );
};

export default Analytics;
