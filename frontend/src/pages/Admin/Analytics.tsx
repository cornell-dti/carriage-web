import React from 'react';
import AnalyticsTable from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher, { Tab } from '../../components/TabSwitcher/TabSwitcher';

const Analytics = () => (
   <main id = "main">
      <TabSwitcher>
         <Tab label="Rider Data">
            <AnalyticsTable type="ride" />
         </Tab>
         <Tab label="Driver Data">
            <AnalyticsTable type="driver" />
         </Tab>
      </TabSwitcher>
   </main>
);

export default Analytics;
