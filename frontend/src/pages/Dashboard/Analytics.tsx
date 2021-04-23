import React from 'react';
import AnalyticsTable from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher, { Tab } from '../../components/TabSwitcher/TabSwitcher';

const Analytics = () => (
   <div>
      <TabSwitcher>
         <Tab label="Rider Data">
            <AnalyticsTable type="ride" />
         </Tab>
         <Tab label="Driver Data">
            <AnalyticsTable type="driver" />
         </Tab>
      </TabSwitcher>
   </div>
);

export default Analytics;
