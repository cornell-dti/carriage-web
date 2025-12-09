import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { RideType } from '../../types';
import AuthContext from '../../context/auth';
import RideOverview from './RideOverview';
import RidePeople from './RidePeople';
import RideLocations from './RideLocations';
import RideActions from './RideActions';
import { RideEditProvider } from './RideEditContext';
import styles from './RideDetails.module.css';

interface RideDetailsProps {
  open: boolean;
  onClose: () => void;
  ride: RideType;
  onRideUpdated?: (updatedRide: RideType) => void;
  initialEditingState?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ride-tabpanel-${index}`}
      aria-labelledby={`ride-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 0 }}>{children}</Box>}
    </div>
  );
}

const RideDetailsComponent: React.FC<RideDetailsProps> = ({
  open,
  onClose,
  ride,
  onRideUpdated,
  initialEditingState = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const authContext = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Determine user role and appropriate tabs
  const getUserRole = (): 'rider' | 'driver' | 'admin' => {
    const userType = localStorage.getItem('userType');

    // Use the user type from localStorage - this is the source of truth
    if (userType === 'Admin') return 'admin';
    if (userType === 'Driver') return 'driver';
    if (userType === 'Rider') return 'rider';

    // Fallback - shouldn't normally reach here
    return 'rider';
  };

  const userRole = getUserRole();

  // Define tabs based on role
  const getTabsForRole = () => {
    switch (userRole) {
      case 'rider':
        return [
          { label: 'Overview', value: 0 },
          { label: 'Locations', value: 1 },
        ];
      case 'driver':
        return [
          { label: 'Overview', value: 0 },
          { label: 'Locations', value: 1 },
        ];
      case 'admin':
        return [
          { label: 'Overview', value: 0 },
          { label: 'People', value: 1 },
          { label: 'Locations', value: 2 },
        ];
      default:
        return [{ label: 'Overview', value: 0 }];
    }
  };

  const tabs = getTabsForRole();

  return (
    <RideEditProvider
      ride={ride}
      userRole={userRole}
      onRideUpdated={onRideUpdated}
      initialEditingState={initialEditingState}
    >
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{
          className: isMobile ? styles.modalMobile : styles.modal,
        }}
      >
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <div className={styles.mainContainer}>
            {/* Main content area - tabs */}
            <div className={styles.contentContainer}>
              {/* Tabs */}
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                className={styles.tabs}
                variant="fullWidth"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    className={styles.tab}
                  />
                ))}
              </Tabs>

              {/* Tab Content */}
              <div
                className={`${styles.tabContent} ${
                  isMobile
                    ? styles.tabContentMobile
                    : styles.tabContentWithActions
                }`}
              >
                <TabPanel value={tabValue} index={0}>
                  <div className={styles.tabPanelContainer}>
                    <div className={styles.tabPanelContent}>
                      <RideOverview userRole={userRole} />
                    </div>
                    {!isMobile && (
                      <div className={styles.tabActions}>
                        <RideActions userRole={userRole} onClose={onClose} />
                      </div>
                    )}
                  </div>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <div className={styles.tabPanelContainer}>
                    <div className={styles.tabPanelContent}>
                      {userRole === 'admin' ? (
                        <RidePeople userRole={userRole} />
                      ) : (
                        <RideLocations />
                      )}
                    </div>
                    {!isMobile && (
                      <div className={styles.tabActions}>
                        <RideActions userRole={userRole} onClose={onClose} />
                      </div>
                    )}
                  </div>
                </TabPanel>
                {userRole === 'admin' && (
                  <TabPanel value={tabValue} index={2}>
                    <div className={styles.tabPanelContainer}>
                      <div className={styles.tabPanelContent}>
                        <RideLocations />
                      </div>
                      {!isMobile && (
                        <div className={styles.tabActions}>
                          <RideActions userRole={userRole} onClose={onClose} />
                        </div>
                      )}
                    </div>
                  </TabPanel>
                )}
              </div>
            </div>
          </div>

          {/* Mobile actions - sticky bottom sheet */}
          {isMobile && (
            <div className={styles.mobileActions}>
              <RideActions userRole={userRole} isMobile />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </RideEditProvider>
  );
};

export default RideDetailsComponent;
