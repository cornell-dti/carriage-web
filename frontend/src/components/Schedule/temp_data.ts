export type CalEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId: number;
};

export type CalResource = { resourceId: number; resourceTitle: string };

export const tempEvents: CalEvent[] = [
  {
    id: 0,
    title: 'Baker Flagpole to Warren Hall',
    start: new Date(2018, 0, 29, 9, 0, 0),
    end: new Date(2018, 0, 29, 9, 30, 0),
    resourceId: 1,
  },
  {
    id: 1,
    title: 'Eddygate to Hollister Hall',
    start: new Date(2018, 0, 29, 8, 50, 0),
    end: new Date(2018, 0, 29, 9, 50, 0),
    resourceId: 1,
  },
  {
    id: 2,
    title: 'RPCC to Gates Hall',
    start: new Date(2018, 0, 29, 9, 30, 0),
    end: new Date(2018, 0, 29, 12, 30, 0),
    resourceId: 3,
  },
  {
    id: 3,
    title: 'Becker to Mallot',
    start: new Date(2018, 0, 29, 12, 0, 0),
    end: new Date(2018, 0, 29, 12, 30, 0),
    resourceId: 4,
  },
  {
    id: 11,
    title: 'Uris Hall to Uris Library',
    start: new Date(2018, 0, 29, 7, 0, 0),
    end: new Date(2018, 0, 29, 10, 30, 0),
    resourceId: 4,
  },
];

export const resourceMap1: CalResource[] = [
  { resourceId: 1, resourceTitle: "DRIVER'S NAME" },
  { resourceId: 2, resourceTitle: 'MARTHA STUART' },
  { resourceId: 3, resourceTitle: 'FOO BAR' },
  { resourceId: 4, resourceTitle: 'JOHN SMITH' },
  { resourceId: 5, resourceTitle: 'SAM PIKE' },
  { resourceId: 6, resourceTitle: 'MYLES HALLS' },
  { resourceId: 7, resourceTitle: 'BENSON HOLMES' },
];

export const colorMap = {
  red: ['FFA26B', 'FFC7A6'],
  blue: ['0084F4', '66B5F8'],
  yellow: ['FFCF5C', 'FFE29D'],
  green: ['00C48C', '7DDFC3'],
  black: ['1A051D', 'FBE4E8'],
};
