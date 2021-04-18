import React from 'react';
import TabSwitcher, { Tab } from '../../components/TabSwitcher/TabSwitcher';

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
