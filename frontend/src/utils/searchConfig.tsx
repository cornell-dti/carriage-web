import React from 'react';
import { Rider, Location } from '../types';
import { DriverType } from '@carriage-web/shared/src/types/driver';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import { Avatar, Typography, Chip, Box } from '@mui/material';

export enum SearchableType {
  DRIVER = 'driver',
  RIDER = 'rider',
  LOCATION = 'location',
}

export interface SearchField<T> {
  key: keyof T;
  weight?: number; // For search relevance
}

export interface SearchConfig<T> {
  searchFields: SearchField<T>[];
  renderItem: (
    item: T,
    selected: boolean,
    showAccessibility?: boolean
  ) => {
    avatar: React.ReactNode;
    primary: React.ReactNode;
    secondary: React.ReactNode;
    chips?: React.ReactNode;
  };
  getItemLabel: (item: T) => string;
}

const driverSearchConfig: SearchConfig<DriverType> = {
  searchFields: [
    { key: 'firstName', weight: 1 },
    { key: 'lastName', weight: 1 },
    { key: 'email', weight: 0.8 },
    { key: 'phoneNumber', weight: 0.6 },
  ],
  renderItem: (driver, selected, showAccessibility) => ({
    avatar: (
      <Avatar src={driver.photoLink} sx={{ width: 40, height: 40 }}>
        {driver.firstName?.charAt(0)}
        {driver.lastName?.charAt(0)}
      </Avatar>
    ),
    primary: (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {driver.firstName} {driver.lastName}
        {selected && (
          <Chip
            label="Selected"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        )}
      </Typography>
    ),
    secondary: (
      <Typography variant="caption" color="textSecondary">
        {driver.email}
      </Typography>
    ),
  }),
  getItemLabel: (driver) => `${driver.firstName} ${driver.lastName}`,
};

const riderSearchConfig: SearchConfig<Rider> = {
  searchFields: [
    { key: 'firstName', weight: 1 },
    { key: 'lastName', weight: 1 },
    { key: 'email', weight: 0.8 },
    { key: 'phoneNumber', weight: 0.6 },
  ],
  renderItem: (rider, selected, showAccessibility) => {
    const accessibility =
      showAccessibility && rider.accessibility && rider.accessibility.length > 0
        ? rider.accessibility
        : null;

    return {
      avatar: (
        <Avatar src={rider.photoLink} sx={{ width: 40, height: 40 }}>
          {rider.firstName?.charAt(0)}
          {rider.lastName?.charAt(0)}
        </Avatar>
      ),
      primary: (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {rider.firstName} {rider.lastName}
          {selected && (
            <Chip
              label="Selected"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
      ),
      secondary: (
        <Typography variant="caption" color="textSecondary">
          {rider.email}
          {accessibility && (
            <div style={{ marginTop: 4 }}>
              Accessibility: {accessibility.join(', ')}
            </div>
          )}
        </Typography>
      ),
    };
  },
  getItemLabel: (rider) => `${rider.firstName} ${rider.lastName}`,
};

const locationSearchConfig: SearchConfig<Location> = {
  searchFields: [
    { key: 'name', weight: 1 },
    { key: 'shortName', weight: 0.9 },
    { key: 'address', weight: 0.7 },
    { key: 'tag', weight: 0.5 },
    { key: 'info', weight: 0.3 },
  ],
  renderItem: (location, selected) => ({
    avatar: (
      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
        <PlaceIcon fontSize="small" />
      </Avatar>
    ),
    primary: (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {location.name}
        {selected && (
          <Chip
            label="Selected"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        )}
      </Typography>
    ),
    secondary: (
      <Box>
        {location.address && (
          <Typography variant="body2" color="textSecondary">
            {location.address}
          </Typography>
        )}
        {location.info && (
          <Typography variant="caption" color="textSecondary">
            {location.info}
          </Typography>
        )}
      </Box>
    ),
    chips: location.tag ? (
      <Chip
        label={location.tag}
        size="small"
        variant="outlined"
        color="primary"
      />
    ) : undefined,
  }),
  getItemLabel: (location) => location.name,
};

export const searchConfigs = {
  [SearchableType.DRIVER]: driverSearchConfig,
  [SearchableType.RIDER]: riderSearchConfig,
  [SearchableType.LOCATION]: locationSearchConfig,
} as const;

export function getSearchConfig<T>(type: SearchableType): SearchConfig<T> {
  return searchConfigs[type] as SearchConfig<T>;
}

export function filterItems<T extends { id: string | number }>(
  items: T[],
  searchTerm: string,
  config: SearchConfig<T>
): T[] {
  if (!searchTerm.trim()) {
    return items;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  return items.filter((item) => {
    return config.searchFields.some((field) => {
      const value = item[field.key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearchTerm);
      }
      return false;
    });
  });
}
