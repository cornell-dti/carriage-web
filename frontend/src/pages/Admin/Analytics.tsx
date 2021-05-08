import React, { useState } from 'react';
import { useReq } from '../../context/req';
import AnalyticsTable from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher, { Tab } from '../../components/TabSwitcher/TabSwitcher';

type TableData = {
   year: string;
   monthday: string;
   dayCount: number;
   dayNoShows: number;
   dayCancels: number;
   nightCount: number;
   nightNoShows: number;
   nightCancels: number;
   drivers: {
      [name: string]: number;
   };
};

const Analytics = () => {
   const [analyticsData, setAnalyticsData] = useState<TableData[]>([]);
   const { withDefaults } = useReq();
   fetch(`/api/stats/?to=${new Date()}`, withDefaults())
      .then((res) => console.log(res));
   // .then((data) => setAnalyticsData(data));
   return (
      <div>
         <TabSwitcher>
            <Tab label="Rider Data">
               <AnalyticsTable type="ride" data={analyticsData} />
            </Tab>
            <Tab label="Driver Data">
               <AnalyticsTable type="driver" data={analyticsData} />
            </Tab>
         </TabSwitcher>
      </div>
   );
};

export default Analytics;
