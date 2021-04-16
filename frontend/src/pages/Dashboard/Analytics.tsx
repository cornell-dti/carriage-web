import React from 'react';
import Tab from '../../components/TabSwitcher/Tab';
import TabSwitcher from '../../components/TabSwitcher/TabSwitcher';

const Analytics = () => (
  <div>
      <TabSwitcher>
         <Tab label="Rider Data">
            <p>rider data</p>
         </Tab>
         <Tab label="Driver Data">
            <p>driver data</p>
         </Tab>
      </TabSwitcher>
  </div>
);

export default Analytics;
