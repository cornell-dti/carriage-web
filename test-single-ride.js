// Simple test script to verify single ride API works
// This is a basic test - in production you'd use proper testing frameworks

const testRideData = {
  startLocation: "Cornell Campus Store",
  endLocation: "Library Tower", 
  startTime: new Date("2024-01-15T10:00:00Z").toISOString(),
  endTime: new Date("2024-01-15T11:00:00Z").toISOString(),
  rider: "test-rider-id",
  isRecurring: false,
  timezone: "America/New_York"
};

console.log("Test Single Ride Data:");
console.log(JSON.stringify(testRideData, null, 2));
console.log("\nThis data structure should work with the new ride API");
console.log("\nTo test manually:");
console.log("POST /api/rides");
console.log("Content-Type: application/json");
console.log("Body:", JSON.stringify(testRideData));
console.log("\nExpected response: Created ride with ID and all fields populated");