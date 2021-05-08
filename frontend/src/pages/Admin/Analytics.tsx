import React, { useState } from 'react';
import { useReq } from '../../context/req';
import AnalyticsTable, { TableData } from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher, { Tab } from '../../components/TabSwitcher/TabSwitcher';


const Analytics = () => {
   const [analyticsData, setData] = useState<TableData[]>([]);
   const { withDefaults } = useReq();
   fetch('/api/stats/', withDefaults())
      .then((res) => res.json())
      .then((data) => setData(data));
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
