import express from 'express';

// Basic Data: Non-recurring ride
export const testRideRequest1 = {
  startLocation: '321 Test Drive',
  endLocation: '321 Test Drive',
  recurring: false,
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
};

// Recurring Ride Post Request Data
export const testRideRequest2 = {
  startLocation: '321 Test Drive',
  endLocation: '321 Test Drive',
  recurring: true,
  recurringDays: [1, 2, 3, 4, 5],
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
  endDate: '2023-05-25',
};

// GET Request data from testRideRequest2
export const testRideResponse2 = {
  startLocation: {
    name: '321 Test Drive',
    address: '321 Test Drive',
    tag: 'custom',
  },
  endLocation: {
    name: '321 Test Drive',
    address: '321 Test Drive',
    tag: 'custom',
  },
  recurring: true,
  recurringDays: [1, 2, 3, 4, 5],
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
  endDate: '2023-05-25',
  id: '',
  edits: [],
  deleted: [],
  type: 'unscheduled',
  status: 'not_started',
  late: false,
};

// Updated data for put request
export const putReq1 = {
  startLocation: '678 Test Lane',
  endLocation: '12 NewTest Road',
  recurringDays: [2, 3, 4],
  startTime: '2023-03-30T13:55:00.000Z',
  endTime: '2023-04-22T23:55:00.000Z',
};

// GET Request response after PUT Request for testRideRequest2 and putReq1
export const testRideResponse3 = {
  startLocation: {
    name: '678 Test Lane',
    address: '678 Test Lane',
    tag: 'custom',
  },
  endLocation: {
    name: '12 NewTest Road',
    address: '12 NewTest Road',
    tag: 'custom',
  },
  recurring: true,
  recurringDays: [2, 3, 4],
  startTime: '2023-03-30T13:55:00.000Z',
  endTime: '2023-04-22T23:55:00.000Z',
  endDate: '2023-05-25',
  id: '',
  edits: [],
  deleted: [],
  type: 'unscheduled',
  status: 'not_started',
  late: false,
};

// Invalid POST Request data
export const testRideReq4 = {
  startLocation: '321 Test Drive',
  endLocation: '321 Test Drive',
  recurring: true,
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
};

// Start Location POST Requst Data
export const startLoc = {
  name: 'Toni Morrison Hall',
  address: '18 Sisson Pl',
  tag: 'north',
  info: 'In front of dining hall',
};

// End Location POST Request Data
export const endLoc = {
  name: '7/11',
  address: '409 College Ave',
  tag: 'ctown',
  info: 'In front of building',
};

// POST reqeust data with existing locations
export const testRideRequest5 = {
  startLocation: '',
  endLocation: '',
  startTime: '2022-02-31T23:50:00.000Z',
  endTime: '2022-02-31T23:55:00.000Z',
};

// GET response for testRideRequest5 after adding locations
export const testRideResponse5 = {
  startLocation: {
    name: 'Toni Morrison Hall',
    address: '18 Sisson Pl',
    tag: 'north',
    info: 'In front of dining hall',
    id: '',
  },
  endLocation: {
    name: '7/11',
    address: '409 College Ave',
    tag: 'ctown',
    info: 'In front of building',
    id: '',
  },
  recurring: false,
  startTime: '2022-02-31T23:50:00.000Z',
  endTime: '2022-02-31T23:55:00.000Z',
  id: '',
  type: 'unscheduled',
  status: 'not_started',
  late: false,
};
