// Simple test script to verify ride request functionality
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3001/api'; // Adjust port as needed
const TEST_RIDER_ID = 'test-rider-id'; // You'll need to use a real rider ID

// Test data for a single ride request (mixed location formats like your real payload)
const testRideRequest = {
  startLocation: {
    name: '817 N Aurora St, Ithaca, NY 14850, USA',
    address: '817 N Aurora St, Ithaca, NY 14850, USA',
    shortName: '817 N Aurora St, Ithaca, NY 14850, USA',
    tag: 'custom',
    lat: 0,
    lng: 0,
  },
  endLocation: {
    id: '3934d992-8c80-4dfd-a95c-4cb5f6cd9b6b',
    name: 'Test Dropoff Location',
    address: '456 Oak Ave, Test City, NY 12345',
    shortName: 'Test Dropoff',
    tag: 'custom',
    lat: 40.7589,
    lng: -73.9851,
  },
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Tomorrow + 30 min
  rider: TEST_RIDER_ID,
  type: 'unscheduled',
  status: 'not_started',
  schedulingState: 'unscheduled',
  isRecurring: false,
  timezone: 'America/New_York'
};

async function testRideRequest() {
  console.log('Testing single ride request...');
  
  try {
    // Test 1: Valid single ride request
    console.log('\n1. Testing valid single ride request...');
    const response = await axios.post(`${BASE_URL}/rides`, testRideRequest);
    console.log('✅ Single ride created successfully:', response.data.id);
    
    // Test 2: Try to create recurring ride (should fail)
    console.log('\n2. Testing recurring ride rejection...');
    try {
      await axios.post(`${BASE_URL}/rides`, {
        ...testRideRequest,
        isRecurring: true
      });
      console.log('❌ Recurring ride was not rejected!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.err?.includes('Recurring rides are not yet supported')) {
        console.log('✅ Recurring ride correctly rejected');
      } else {
        console.log('❌ Unexpected error for recurring ride:', error.response?.data);
      }
    }
    
    // Test 3: Try to create ride with past start time (should fail)
    console.log('\n3. Testing past start time rejection...');
    try {
      await axios.post(`${BASE_URL}/rides`, {
        ...testRideRequest,
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
      });
      console.log('❌ Past start time was not rejected!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.err?.includes('Start time must be in the future')) {
        console.log('✅ Past start time correctly rejected');
      } else {
        console.log('❌ Unexpected error for past start time:', error.response?.data);
      }
    }
    
    // Test 4: Try to create ride with end time before start time (should fail)
    console.log('\n4. Testing invalid time range rejection...');
    try {
      await axios.post(`${BASE_URL}/rides`, {
        ...testRideRequest,
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString() // Before start time
      });
      console.log('❌ Invalid time range was not rejected!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.err?.includes('End time must be after start time')) {
        console.log('✅ Invalid time range correctly rejected');
      } else {
        console.log('❌ Unexpected error for invalid time range:', error.response?.data);
      }
    }
    
    // Test 5: Try to create ride with missing required fields (should fail)
    console.log('\n5. Testing missing required fields rejection...');
    try {
      await axios.post(`${BASE_URL}/rides`, {
        startLocation: testRideRequest.startLocation,
        endLocation: testRideRequest.endLocation,
        // Missing startTime, endTime, and rider
      });
      console.log('❌ Missing required fields was not rejected!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.err?.includes('Missing required fields')) {
        console.log('✅ Missing required fields correctly rejected');
      } else {
        console.log('❌ Unexpected error for missing fields:', error.response?.data);
      }
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRideRequest();
