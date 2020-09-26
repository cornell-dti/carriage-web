import { Driver } from '../../types';

const data: Driver[] = [
  {
    id: '1',
    firstName: 'First',
    lastName: 'Driver',
    email: 'fd123@cornell.edu',
    phoneNumber: '1234567890',
    startTime: '08:00',
    endTime: '15:00',
    breaks: {
      Mon: {
        breakStart: '09:00',
        breakEnd: '12:00',
      },
      Wed: {
        breakStart: '10:00',
        breakEnd: '13:00',
      },
    },
    vehicle: '1',
  },
  {
    id: '2',
    firstName: 'Second',
    lastName: 'Driver',
    email: 'sd123@cornell.edu',
    phoneNumber: '1234567890',
    startTime: '10:00',
    endTime: '17:00',
    breaks: {
      Tue: {
        breakStart: '11:00',
        breakEnd: '12:00',
      },
      Thu: {
        breakStart: '13:00',
        breakEnd: '15:00',
      },
    },
    vehicle: '1',
  },
  {
    id: '4',
    firstName: 'Second',
    lastName: 'Driver',
    email: 'sd123@cornell.edu',
    phoneNumber: '1234567890',
    startTime: '10:00',
    endTime: '17:00',
    breaks: {
      Tue: {
        breakStart: '11:00',
        breakEnd: '12:00',
      },
      Thu: {
        breakStart: '13:00',
        breakEnd: '15:00',
      },
    },
    vehicle: '1',
  },
  {
    id: '3',
    firstName: 'Second',
    lastName: 'Driver',
    email: 'sd123@cornell.edu',
    phoneNumber: '1234567890',
    startTime: '10:00',
    endTime: '17:00',
    breaks: {
      Tue: {
        breakStart: '11:00',
        breakEnd: '12:00',
      },
      Thu: {
        breakStart: '13:00',
        breakEnd: '15:00',
      },
    },
    vehicle: '1',
  },
];

export default data;
