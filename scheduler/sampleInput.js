// Example input
const rideRequests = [
  {
    ID: '001',
    startLocation: 0,
    endLocation: 3,
    startTime: '2019-12-13T07:30',
    endTime: '2019-12-13T07:50',
    isScheduled: false,
    riderID: '0',
    dateRequested: 34,
  },
  {
    ID: '002',
    startLocation: 1,
    endLocation: 2,
    startTime: '2019-12-13T08:20',
    endTime: '2019-12-13T08:34',
    isScheduled: false,
    riderID: '1',
    dateRequested: 34,
  },
  {
    ID: '003',
    startLocation: 1,
    endLocation: 2,
    startTime: '2019-12-13T08:10',
    endTime: '2019-12-13T08:25',
    isScheduled: false,
    riderID: '1',
    dateRequested: 34,
  },
  {
    ID: '004',
    startLocation: 1,
    endLocation: 2,
    startTime: '2019-12-13T08:30',
    endTime: '2019-12-13T08:35',
    isScheduled: false,
    riderID: '1',
    dateRequested: 34,
  },
];

const rideRequestsImpossible = [
  {
    ID: '001',
    startLocation: 0,
    endLocation: 3,
    startTime: '2019-12-13T07:30',
    endTime: '2019-12-13T07:50',
    isScheduled: false,
    riderID: '0',
    dateRequested: 34,
  },
  {
    ID: '002',
    startLocation: 1,
    endLocation: 2,
    startTime: '2019-12-13T08:20',
    endTime: '2019-12-13T08:34',
    isScheduled: false,
    riderID: '1',
    dateRequested: 34,
  },
  {
    ID: '003',
    startLocation: 1,
    endLocation: 2,
    startTime: '2019-12-13T08:10',
    endTime: '2019-12-13T08:25',
    isScheduled: false,
    riderID: '1',
    dateRequested: 34,
  },
  {
    ID: '004',
    startLocation: 1,
    endLocation: 2,
    startTime: '2019-12-13T08:22',
    endTime: '2019-12-13T08:35',
    isScheduled: false,
    riderID: '1',
    dateRequested: 34,
  },
];

const drivers = [
  {
    ID: '0',
    name: 'Brandon Brandoni',
    startTime: '2019-12-13T08:00',
    endTime: '2019-12-13T18:00',
    breaks: {
      Mon: {
        breakStart: '12:00',
        breakEnd: '12:30',
      },
      Tues: {
        breakStart: '12:00',
        breakEnd: '12:30',
      },
      Wed: {
        breakStart: '12:00',
        breakEnd: '13:30',
      },
      Thurs: {
        breakStart: '12:00',
        breakEnd: '12:30',
      },
      Fri: {
        breakStart: '13:00',
        breakEnd: '13:30',
      },
    },
    vehicle: 1,
    workPhoneNumer: 1231231234,
    email: 'email@email.com',
  },
  {
    ID: '1',
    name: 'Bobby Bobbers',
    startTime: '2019-12-13T07:00',
    endTime: '2019-12-13T17:00',
    breaks: {
      Mon: {
        breakStart: '10:00',
        breakEnd: '10:30',
      },
      Tues: {
        breakStart: '10:00',
        breakEnd: '10:30',
      },
      Wed: {
        breakStart: '10:00',
        breakEnd: '10:30',
      },
      Thurs: {
        breakStart: '10:00',
        breakEnd: '10:30',
      },
      Fri: {
        breakStart: '11:00',
        breakEnd: '11:30',
      },
    },
    vehicle: 2,
    workPhoneNumer: 1231231234,
    email: 'email@email.com',
  },
];

const vehicles = [
  {
    ID: '1',
    wheelchairAccessible: true,
  },
  {
    ID: '2',
    wheelchairAccessible: false,
  },
];

module.exports = {
  rideRequests,
  rideRequestsImpossible,
  drivers,
  vehicles,
};
