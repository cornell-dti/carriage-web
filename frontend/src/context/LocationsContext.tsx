import React, { useRef, useState, useCallback } from 'react';
import { Admin, Location } from '../types';
import axios from '../util/axios';
import { MOCK_LOCATIONS } from '../util/mocking';

type locationsState = {
  locations: Array<Location>;
  refreshLocations: () => Promise<void>;
};

const initialState: locationsState = {
  locations: [],
  refreshLocations: async () => undefined,
};

const LocationsContext = React.createContext(initialState);
export const useLocations = () => React.useContext(LocationsContext);

type locationsProviderProps = {
  children: React.ReactNode;
};

export const LocationsProvider = ({ children }: locationsProviderProps) => {
  const componentMounted = useRef(true);
  const [locations, setLocations] = useState<Array<Location>>([]);
  const refreshLocations = useCallback(async () => {
    // const locationsData: Array<Location> = await axios
    //   .get('/api/locations')
    //   .then((res) => res.data)
    //   .then((data) => data.data);

    const locationsData = MOCK_LOCATIONS;
    if (locationsData) {
      locationsData.sort((a: Location, b: Location) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      });
    }

    locationsData && componentMounted.current && setLocations(locationsData);
  }, []);

  React.useEffect(() => {
    refreshLocations();
    return () => {
      componentMounted.current = false;
    };
  }, [refreshLocations]);

  return (
    <LocationsContext.Provider value={{ locations, refreshLocations }}>
      {children}
    </LocationsContext.Provider>
  );
};
