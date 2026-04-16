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
import { RideType } from '@carriage-web/shared/types/ride';
import AuthContext from '../../context/auth';
import RideOverview from './RideOverview';
import RidePeople from './RidePeople';
import RideLocations from './RideLocations';
import RideActions from './RideActions';
import { RideEditProvider } from './RideEditContext';

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
          className: isMobile
            ? 'h-screen max-h-screen'
            : 'h-auto max-h-[85vh] min-h-100',
        }}
      >
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <div className="flex min-h-full relative p-4">
            {/* Main content area - tabs */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tabs */}
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                className="border-b border-[#e0e0e0] px-2 pt-2 mb-2"
                variant="fullWidth"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    className="flex-1 max-w-none"
                  />
                ))}
              </Tabs>

              {/* Tab Content */}
              <div
                className={`flex-1 overflow-visible p-0 flex flex-col min-h-0 ${
                  isMobile ? 'px-6 py-6 pb-25' : 'p-0'
                }`}
              >
                <TabPanel value={tabValue} index={0}>
                  <div className="flex flex-col min-h-0 flex-1 max-h-full">
                    <div className="flex-1 overflow-hidden px-5 py-4 min-h-0 flex flex-col">
                      <RideOverview userRole={userRole} />
                    </div>
                    {!isMobile && (
                      <div className="shrink-0 border-t border-[#e0e0e0] px-6 py-4 bg-[#f9f9f9] flex justify-between items-center gap-3 mt-2">
                        <RideActions userRole={userRole} onClose={onClose} />
                      </div>
                    )}
                  </div>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <div className="flex flex-col min-h-0 flex-1 max-h-full">
                    <div className="flex-1 overflow-hidden px-5 py-4 min-h-0 flex flex-col">
                      {userRole === 'admin' ? (
                        <RidePeople userRole={userRole} />
                      ) : (
                        <RideLocations />
                      )}
                    </div>
                    {!isMobile && (
                      <div className="shrink-0 border-t border-[#e0e0e0] px-6 py-4 bg-[#f9f9f9] flex justify-between items-center gap-3 mt-2">
                        <RideActions userRole={userRole} onClose={onClose} />
                      </div>
                    )}
                  </div>
                </TabPanel>
                {userRole === 'admin' && (
                  <TabPanel value={tabValue} index={2}>
                    <div className="flex flex-col min-h-0 flex-1 max-h-full">
                      <div className="flex-1 overflow-hidden px-5 py-4 min-h-0 flex flex-col">
                        <RideLocations />
                      </div>
                      {!isMobile && (
                        <div className="shrink-0 border-t border-[#e0e0e0] px-6 py-4 bg-[#f9f9f9] flex justify-between items-center gap-3 mt-2">
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
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e0e0] p-4 z-1300">
              <RideActions userRole={userRole} isMobile onClose={onClose} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </RideEditProvider>
  );
};

export default RideDetailsComponent;
