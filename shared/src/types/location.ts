export enum Tag {
  EAST = 'east',
  CENTRAL = 'central',
  NORTH = 'north',
  WEST = 'west',
  CTOWN = 'ctown',
  DTOWN = 'dtown',
  INACTIVE = 'inactive',
  CUSTOM = 'custom',
}

export type LocationType = {
  id: string;
  name: string;
  address: string;
  shortName: string;
  info?: string;
  tag: Tag;
  lat: number;
  lng: number;
  photoLink?: string;
  images?: string[];
};
