import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ScheduledTable from '../UserTables/ScheduledTable';
import UnscheduledTable from '../UserTables/UnscheduledTable';
import PastRides from './PastRides';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

type RidesTableProps = {
  riderId?: string;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

function RidesTable({ riderId }: RidesTableProps) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', width: 500 }}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Scheduled Rides" {...a11yProps(0)} />
          <Tab label="Unscheduled Rides" {...a11yProps(1)} />
          <Tab label="Past Rides" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} dir={theme.direction}>
        <ScheduledTable riderId={riderId} />
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <UnscheduledTable />
      </TabPanel>
      <TabPanel value={value} index={2} dir={theme.direction}>
        {/* <PastRides isStudent={true} rides={rides} /> */}
        Past Rides Here
      </TabPanel>
    </Box>
  );
}

export default RidesTable;
