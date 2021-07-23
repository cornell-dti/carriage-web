// Incredibly basic test of scheduling
import {
  rideRequests as _rideRequests,
  drivers as _drivers,
  rideRequestsImpossible,
} from './sampleInput';
// Test on possible request set

/**
 * TODO: currently checks for conflicts with every ride, much more efficient models possible
 * (track most recent ride for each driver)
 * NOTE: assumes implicit guarantee that for all JSONs: startTime > endTime
 *
 * @param {{ startTime: string, endTime: string }} request
 * @param {*} node a list of JSON ride objects,
 * where each ride has startTime and endTime valid string date fields and a driverID field
 * @param {{ startTime: string, endTime: string; ID: string }} driver a valid driver JSON object.
 * @returns {boolean} if there exists a conflict when assigning request (ride) to driver
 * given the schedule in node (list of scheduled ride JSONs)
 */
function conflict(request, node, driver) {
  return Object.keys(node).some((key) => {
    const ride = node[key];
    return (
      ride.driverID === driver.ID &&
      (new Date(request.startTime) < new Date(driver.startTime) ||
        new Date(request.endTime) > new Date(driver.endTime) ||
        (new Date(request.startTime) > new Date(ride.startTime) &&
          new Date(request.startTime) < new Date(ride.endTime)) ||
        (new Date(request.endTime) > new Date(ride.startTime) &&
          new Date(request.endTime) < new Date(ride.endTime)))
    );
  });
}

/**
 * Creates copy of request JSON object with driverID field set as input driver
 *
 * @param {*} request a JSON object
 * @param {*} driverID
 */
function assignRide(request, driverID) {
  const scheduled = JSON.parse(JSON.stringify(request));
  scheduled.driverID = driverID;
  return scheduled;
}

/**
 * TODO: Inefficient, over-copying --> improve
 *
 * @template {T}
 * @param {T[]} node an array list of JSON objects that all must be deep-copied.
 * @returns {T[]} a deep copy of the input node.
 */
function copyNode(node) {
  return Object.keys(node).map((key) => JSON.parse(JSON.stringify(node[key])));
}

/**
 * NOTE:
 * Currently schedules all drivers to rides with no breaks and work all day,
 * assuming instant transportation to start location, and does not allow shared rides.
 *
 * @param {*} rideRequests list of valid ride JSONs (for now must have startTime, endTime fields),
 * @param {*} drivers valid driver JSON (for now must have id field)
 * @returns {*} schedule if possible given requests and drivers or NULL if impossible.
 */
function makeSchedule(rideRequests, drivers) {
  // stack of decision tree nodes
  // where each node is a growing schedule(schedule = list of scheduled ride JSONs)
  const stack = [];
  const rootNode = [];
  stack.push(rootNode);
  while (stack.length > 0) {
    const node = stack.pop();
    // console.log(node);
    if (node.length === rideRequests.length) {
      return node;
    }
    // Schedule next ride (directly dependent on node length)
    const request = rideRequests[node.length];
    Object.keys(drivers).forEach((d) => {
      const driver = drivers[d];
      // Given no conflict assigning request to driver, push corresponding child node to stack
      if (!conflict(request, node, driver)) {
        // Copy current node to begin constructing child
        const childNode = copyNode(node);
        // Schedule ride with driver and add to childNode
        childNode.push(assignRide(request, driver.ID));
        // Push childNode to stack
        // TODO: optimize order of pushing nodes to stack to make greedy choices
        // (ie push probabilistically better options later)
        stack.push(childNode);
      }
    });
  }
  // Fail state reached
  return null;
}

let schedule = makeSchedule(_rideRequests, _drivers);
console.log(schedule); // Should output valid schedule
// Test on impossible request set
schedule = makeSchedule(rideRequestsImpossible, _drivers);
console.log(schedule); // Should output NULL
