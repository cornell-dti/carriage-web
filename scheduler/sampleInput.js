// Example input
var rideRequests = [
  {
    ID: "001",
    startLocation: 0,
    endLocation: 3,
    startTime: "7:30",
    endTime: "7:50",
    isScheduled: false,
    riderID: "0",
    dateRequested: 34,
  },
  {
    ID: "002",
    startLocation: 1,
    endLocation: 2,
    startTime: "8:20",
    endTime: "8:34",
    isScheduled: false,
    riderID: "1",
    dateRequested: 34,
  }
]

var drivers = [
    {
        ID: "0",
        name: "Brandon Brandoni",
        startTime: "8:00",
        endTime: "18:00",
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
        email: "email@email.com",
    },
    {
        ID: "1",
        name: "Bobby Bobbers",
        startTime: "7:00",
        endTime: "17:00",
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
        email: "email@email.com",
    },
]

var vehicles = [
    {
      ID: "1",
      wheelchairAccessible: true,
    },
    {
      ID: "2",
      wheelchairAccessible: false,
  }
]
