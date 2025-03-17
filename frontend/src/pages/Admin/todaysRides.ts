import { AvailabilityType, RideType, Type, Status, Tag } from "types";


const TODAY = new Date().toISOString().split('T')[0];

export const LOGGED_IN_DRIVER_ID = "317c73c1-0eeb-4dac-9896-2f30db9505ec";
// export const LOGGED_IN_DRIVER_ID = "123"

// Sample driver availability to test todays Rides table
const defaultAvailability: AvailabilityType = {
  Mon: { startTime: "09:00", endTime: "17:00" },
  Tue: { startTime: "09:00", endTime: "17:00" },
  Wed: { startTime: "09:00", endTime: "17:00" },
  Thu: { startTime: "09:00", endTime: "17:00" },
  Fri: { startTime: "09:00", endTime: "17:00" }
};

export const todaysRides: RideType[] = [
  {
    id: "r1",
    type: Type.ACTIVE,
    status: Status.NOT_STARTED,
    late: false,
    startLocation: {
      id: "loc1",
      name: "Risley Hall",
      address: "Risley Hall, Cornell University",
      tag: Tag.NORTH
    },
    endLocation: {
      id: "loc2",
      name: "Collegetown Plaza",
      address: "119 Dryden Rd",
      tag: Tag.CTOWN
    },
    startTime: `${TODAY}T09:00:00.000Z`,
    endTime: `${TODAY}T09:30:00.000Z`,
    rider: {
        id: "rid1",
        firstName: "John",
        lastName: "Smith",
        phoneNumber: "5550123456",
        email: "js123@cornell.edu",
        active: true,
        joinDate: "",
        endDate: "",
        address: "",
        favoriteLocations: []
    },
    driver: {
      id: LOGGED_IN_DRIVER_ID,
      firstName: "Dave",
      lastName: "Driver",
      phoneNumber: "5550124567",
      email: "dd123@cornell.edu",
      startDate: "2024-01-01",
      availability: defaultAvailability
    },
    recurring: true,
    recurringDays: [1, 3, 5]
  },
  {
    id: "r2",
    type: Type.ACTIVE,
    status: Status.ON_THE_WAY,
    late: true,
    startLocation: {
      id: "loc3",
      name: "Mann Library",
      address: "Mann Library, Cornell University",
      tag: Tag.CENTRAL
    },
    endLocation: {
      id: "loc4",
      name: "Target",
      address: "40 Catherwood Rd",
      tag: Tag.EAST
    },
    startTime: `${TODAY}T14:00:00.000Z`,
    endTime: `${TODAY}T14:45:00.000Z`,
    rider: {
        id: "rid2",
        firstName: "Sarah",
        lastName: "Jones",
        phoneNumber: "5550125678",
        email: "sj456@cornell.edu",
        active: true,
        joinDate: "",
        endDate: "",
        address: "",
        favoriteLocations: []
    },
    driver: {
      id: "d456",
      firstName: "Alice",
      lastName: "Anderson",
      phoneNumber: "5550127890",
      email: "aa456@cornell.edu",
      startDate: "2024-01-01",
      availability: {
        ...defaultAvailability,
        Fri: { startTime: "10:00", endTime: "18:00" }
      }
    },
    recurring: false
  },
  {
    id: "r3",
    type: Type.ACTIVE,
    status: Status.COMPLETED,
    late: false,
    startLocation: {
      id: "loc5",
      name: "Wegmans",
      address: "500 S Meadow St",
      tag: Tag.WEST
    },
    endLocation: {
      id: "loc6",
      name: "Hasbrouck Apartments",
      address: "Hasbrouck Apartments, Cornell University",
      tag: Tag.NORTH
    },
    startTime: `${TODAY}T16:30:00.000Z`,
    endTime: `${TODAY}T17:15:00.000Z`,
    rider: {
        id: "rid3",
        firstName: "Mike",
        lastName: "Brown",
        phoneNumber: "5550126789",
        email: "mb789@cornell.edu",
        active: true,
        joinDate: "",
        endDate: "",
        address: "",
        favoriteLocations: []
    },
    driver: {
      id: "d789",
      firstName: "Bob",
      lastName: "Wilson",
      phoneNumber: "5550128901",
      email: "bw789@cornell.edu",
      startDate: "2024-01-01",
      availability: {
        Mon: { startTime: "08:00", endTime: "16:00" },
        Wed: { startTime: "08:00", endTime: "16:00" },
        Fri: { startTime: "08:00", endTime: "16:00" }
      }
    },
    recurring: false
  },
  {
    id: "r4",
    type: Type.ACTIVE,
    status: Status.PICKED_UP,
    late: false,
    startLocation: {
      id: "loc7",
      name: "Statler Hotel",
      address: "Statler Hotel, Cornell University",
      tag: Tag.CENTRAL
    },
    endLocation: {
      id: "loc8",
      name: "Ithaca Mall",
      address: "40 Catherwood Rd",
      tag: Tag.EAST
    },
    startTime: `${TODAY}T15:00:00.000Z`,
    endTime: `${TODAY}T15:45:00.000Z`,
    rider: {
        id: "rid4",
        firstName: "Matthias",
        lastName: "Choi",
        phoneNumber: "5550129012",
        email: "mt123@cornell.edu",
        active: true,
        joinDate: "",
        endDate: "",
        address: "",
        favoriteLocations: []
    },
    driver: {
      id: LOGGED_IN_DRIVER_ID,
      firstName: "Dave",
      lastName: "Driver",
      phoneNumber: "5550124567",
      email: "dd123@cornell.edu",
      startDate: "2024-01-01",
      availability: defaultAvailability
    },
    recurring: true,
    recurringDays: [2, 4]
  }
];