import React, { useRef, useState, useCallback } from 'react';
import { AdminType } from '@shared/types/admin';
import { LocationType } from '@shared/types/location';
import axios from '../util/axios';

type locationsState = {
  locations: Array<LocationType>;
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
  const [locations, setLocations] = useState<Array<LocationType>>([]);
  const refreshLocations = useCallback(async () => {
    const locationsData: Array<LocationType> = await axios
      .get('/api/locations')
      .then((res) => res.data)
      .then((data) => data.data);
    if (locationsData) {
      locationsData.sort((a: LocationType, b: LocationType) => {
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
