import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Driver, Location, Ride, Rider } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { AdminType } from '../src/models/admin';
import { Accessibility, Organization } from '../src/models/rider';
import { Status, Type, SchedulingState } from '../src/models/ride';
import { LocationType, Tag } from '../src/models/location';
import moment from 'moment';

// Fixed IDs so assertions can reference rides by known ID without dynamic lookups
const RIDER0_ID = 'scope-rider-0';
const RIDER1_ID = 'scope-rider-1';
const DRIVER0_ID = 'scope-driver-0';
const DRIVER1_ID = 'scope-driver-1';
const RIDE_R0_D0_ID = 'scope-ride-r0d0'; // rider0's ride, driven by driver0
const RIDE_R1_D1_ID = 'scope-ride-r1d1'; // rider1's ride, driven by driver1

const testAdmin: Omit<AdminType, 'id'> = {
  firstName: 'Scope-Admin',
  lastName: 'Test',
  phoneNumber: '1111111111',
  email: 'scope-admin@cornell.edu',
  type: ['sds-admin'],
  isDriver: false,
};

const testRiders = [
  {
    id: RIDER0_ID,
    email: 'scope-rider0@test.com',
    phoneNumber: '1234567890',
    firstName: 'ScopeRider',
    lastName: 'Zero',
    joinDate: '2023-03-09',
    endDate: '2025-03-09',
    favoriteLocations: [],
    active: true,
    accessibility: [Accessibility.CRUTCHES],
    organization: Organization.CULIFT,
    description: '',
    address: '36 Colonial Ln, Ithaca, NY 14850',
    photoLink: '',
  },
  {
    id: RIDER1_ID,
    email: 'scope-rider1@test.com',
    phoneNumber: '1234567891',
    firstName: 'ScopeRider',
    lastName: 'One',
    joinDate: '2023-03-09',
    endDate: '2025-03-09',
    favoriteLocations: [],
    active: true,
    accessibility: [],
    organization: Organization.CULIFT,
    description: '',
    address: '37 Colonial Ln, Ithaca, NY 14850',
    photoLink: '',
  },
];

const testDrivers = [
  {
    id: DRIVER0_ID,
    email: 'scope-driver0@test.com',
    phoneNumber: '1234567890',
    firstName: 'ScopeDriver',
    lastName: 'Zero',
    availability: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    photoLink: '',
  },
  {
    id: DRIVER1_ID,
    email: 'scope-driver1@test.com',
    phoneNumber: '1234567891',
    firstName: 'ScopeDriver',
    lastName: 'One',
    availability: ['MON', 'TUE'],
    photoLink: '',
  },
];

const testLocations: LocationType[] = [
  {
    id: 'scope-loc-1',
    name: 'Scope-Location 1',
    address: '100 Scope Test Rd',
    tag: Tag.WEST,
    info: 'Scope Info 1',
    shortName: 'Scope-1',
    lat: 44.0,
    lng: -76.0,
  },
  {
    id: 'scope-loc-2',
    name: 'Scope-Location 2',
    address: '200 Scope Test Rd',
    tag: Tag.NORTH,
    info: 'Scope Info 2',
    shortName: 'Scope-2',
    lat: 45.0,
    lng: -77.0,
  },
];

// Two rides with no date overlap — allDates=true used in tests to skip date filtering
// ride-r0-d0: visible to rider0, driver0, and any admin
// ride-r1-d1: must NOT appear for rider0 or driver0 (isolation check)
const testRides = [
  {
    id: RIDE_R0_D0_ID,
    type: Type.PAST,
    status: Status.COMPLETED,
    schedulingState: SchedulingState.SCHEDULED,
    startLocation: testLocations[0].id,
    endLocation: testLocations[1].id,
    startTime: moment().subtract(2, 'hours').toISOString(),
    endTime: moment().subtract(1, 'hour').toISOString(),
    riders: [RIDER0_ID],
    driver: DRIVER0_ID,
    isRecurring: false,
  },
  {
    id: RIDE_R1_D1_ID,
    type: Type.PAST,
    status: Status.COMPLETED,
    schedulingState: SchedulingState.SCHEDULED,
    startLocation: testLocations[0].id,
    endLocation: testLocations[1].id,
    startTime: moment().subtract(4, 'hours').toISOString(),
    endTime: moment().subtract(3, 'hours').toISOString(),
    riders: [RIDER1_ID],
    driver: DRIVER1_ID,
    isRecurring: false,
  },
];

describe('Testing role-scoped access for GET /api/rides', () => {
  let adminToken: string;
  let rider0Token: string;
  let driver0Token: string;

  before(async () => {
    await Promise.all(
      testLocations.map((location) => populateDB(Location, location))
    );
    // authorize() calls populateDB internally for the authenticated user
    adminToken = await authorize('Admin', testAdmin);
    rider0Token = await authorize('Rider', testRiders[0]);
    driver0Token = await authorize('Driver', testDrivers[0]);
    // rider1 and driver1 are data-only (no tokens needed — they exist to be targeted by spoofing tests)
    await populateDB(Rider, testRiders[1]);
    await populateDB(Driver, testDrivers[1]);
    await Promise.all(testRides.map((ride) => populateDB(Ride, ride)));
  });

  after(clearDB);

  // ─────────────────────────────────────────────────────────
  // Rider scoping — 4 scenarios
  // ─────────────────────────────────────────────────────────
  describe('Rider role scoping', () => {
    // Scenario 1: Rider supplies own ?rider= — normal case
    it('should return only own rides when Rider supplies own ?rider= param', async () => {
      const res = await request(app)
        .get(`/api/rides?rider=${RIDER0_ID}&allDates=true`)
        .auth(rider0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.body).to.have.property('data');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });

    // Scenario 2: Rider tries to spoof another rider's ID via ?rider=
    it('should ignore spoofed ?rider= param and return only own rides', async () => {
      const res = await request(app)
        .get(`/api/rides?rider=${RIDER1_ID}&allDates=true`)
        .auth(rider0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });

    // Scenario 3: Rider omits ?rider= entirely — must not leak all rides
    it('should return only own rides when Rider omits ?rider= param entirely', async () => {
      const res = await request(app)
        .get('/api/rides?allDates=true')
        .auth(rider0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });

    // Scenario 4: Rider passes a ?driver= cross-type param — must be discarded
    it('should discard ?driver= cross-type param from Rider and return only own rides', async () => {
      const res = await request(app)
        .get(`/api/rides?driver=${DRIVER0_ID}&allDates=true`)
        .auth(rider0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Driver scoping — 4 scenarios
  // ─────────────────────────────────────────────────────────
  describe('Driver role scoping', () => {
    // Scenario 5: Driver supplies own ?driver= — normal case
    it('should return only own rides when Driver supplies own ?driver= param', async () => {
      const res = await request(app)
        .get(`/api/rides?driver=${DRIVER0_ID}&allDates=true`)
        .auth(driver0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.body).to.have.property('data');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });

    // Scenario 6: Driver tries to spoof another driver's ID via ?driver=
    it('should ignore spoofed ?driver= param and return only own rides', async () => {
      const res = await request(app)
        .get(`/api/rides?driver=${DRIVER1_ID}&allDates=true`)
        .auth(driver0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });

    // Scenario 7: Driver omits ?driver= entirely — must not leak all rides
    it('should return only own rides when Driver omits ?driver= param entirely', async () => {
      const res = await request(app)
        .get('/api/rides?allDates=true')
        .auth(driver0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });

    // Scenario 8: Driver passes a ?rider= cross-type param — must be discarded
    it('should discard ?rider= cross-type param from Driver and return only own rides', async () => {
      const res = await request(app)
        .get(`/api/rides?rider=${RIDER0_ID}&allDates=true`)
        .auth(driver0Token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Admin scoping — 2 scenarios (behaviour must be unchanged)
  // ─────────────────────────────────────────────────────────
  describe('Admin role — unrestricted access', () => {
    // Scenario 9: Admin scopes by a specific driver — returns only that driver's rides
    it("should return only the specified driver's rides when Admin passes ?driver= param", async () => {
      const res = await request(app)
        .get(`/api/rides?driver=${DRIVER0_ID}&allDates=true`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.not.include(RIDE_R1_D1_ID);
    });

    // Scenario 10: Admin with no filters — returns all rides
    it('should return all rides when Admin makes an unfiltered request', async () => {
      const res = await request(app)
        .get('/api/rides?allDates=true')
        .auth(adminToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ids = res.body.data.map((r: any) => r.id);
      expect(ids).to.include(RIDE_R0_D0_ID);
      expect(ids).to.include(RIDE_R1_D1_ID);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Unauthenticated request — must be rejected
  // ─────────────────────────────────────────────────────────
  describe('Unauthenticated requests', () => {
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/rides').expect(400);
      expect(res.body).to.have.property('err');
    });
  });
});
