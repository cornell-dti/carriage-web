// Incredibly basic test of scheduling
var sample = require('./sampleInput');
schedule = makeSchedule(sample.rideRequests, sample.drivers);
console.log(schedule);

// Constructs and returns schedule if possible given requests and drivers. Returns NULL if impossible.
// * NOTE: Currently schedules all drivers to rides with no breaks and work all day, assuming instant transportation to start location, 
// *   and does not allow shared rides
// * PRECONDITION: rideRequests is list of valid ride JSONs (for now must have startTime, endTime fields), 
// *   driver is valid driver JSON (for now must have id field)
function makeSchedule(rideRequests, drivers) {
  stack = []; // stack of decision tree nodes, where each node is a growing schedule (schedule = list of scheduled ride JSONs)
  rootNode = [];
  stack.push(rootNode);
  while(stack.length > 0) {
    node = stack.pop();
    //console.log(node);
    if(node.length == rideRequests.length){
      return node;
    }
    // Schedule next ride (directly dependent on node length)
    request = rideRequests[node.length]; 
    for(d in drivers) {
      driver = drivers[d];
      // Given no conflict assigning request to driver, push corresponding child node to stack
      if(!conflict(request, node, driver)){
        // Copy current node to begin constructing child
        childNode = copyNode(node);
        // Schedule ride with driver and add to childNode
        childNode.push(assignRide(request, driver.ID));
        // Push childNode to stack
        // TODO: optimize order of pushing nodes to stack to make greedy choices (ie push probabilistically better options later)
        stack.push(childNode);
      }
    }
  }
  // Fail state reached
  return null;
}

// Returns true if there exists a conflict when assigning request (ride) to driver given the schedule in node (list of scheduled ride JSONs)
// * PRECONDITION: request is a JSON object with startTime and endTime valid string date fields, node is a list of JSON ride objects where
// *  each ride has startTime and endTime valid string date fields and a driverID field, and driver is a valid driver JSON object with startTime,
// *  endTime valid string date fields and a string ID field
// TODO: currently checks for conflicts with every ride, much more efficient models possible (track most recent ride for each driver)
// NOTE: assumes implicit guarantee that for all JSONs: startTime > endTime
function conflict(request, node, driver) {
  for(r in node) { // iterate through all indices in node (list of scheduled rides defining this node's state)
    ride = node[r];
    if(ride.driverID === driver.ID && 
        (new Date(request.startTime) < new Date(driver.startTime) || new Date(request.endTime) > new Date(driver.endTime)
        || (new Date(request.startTime) > new Date(ride.startTime) && new Date(request.startTime) < new Date(ride.endTime)) 
        || (new Date(request.endTime) > new Date(ride.startTime) && new Date(request.endTime) < new Date(ride.endTime)))){
      // if(driver.ID === "0"){
      //   console.log("CONFLICT 0");
      //   console.log(ride);
      //   console.log(request);
      //   console.log("CONFLICT 0");
      // }
      return true;
    }
  }
  return false;
}

// Creates copy of request JSON object with driverID field set as input driver
// * PRECONDITION: request is a JSON object and driver is a JSON object with ID field
function assignRide(request, driverID) {
  scheduled = JSON.parse(JSON.stringify(request));
  scheduled.driverID = driverID;
  return scheduled;
}

// Construct and returns a deep copy of the input node
// * PRECONDITION: node is an array list of JSON objects that all must be deep-copied
// * TODO: Inefficient, over-copying --> improve
function copyNode(node) {
  copy = [];
  for(r in node){
    copy.push(JSON.parse(JSON.stringify(node[r])));
  }
  return copy;
}
