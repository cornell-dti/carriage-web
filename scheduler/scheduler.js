// Example input
var rideRequests = [
  {
    ID: "001",
    startLocation: 0,
    endLocation: 3,
    startTime: "2019-12-13T07:30",
    endTime: "2019-12-13T07:50",
    isScheduled: false,
    riderID: "0",
    dateRequested: 34,
  },
  {
    ID: "002",
    startLocation: 1,
    endLocation: 2,
    startTime: "2019-12-13T08:20",
    endTime: "2019-12-13T08:34",
    isScheduled: false,
    riderID: "1",
    dateRequested: 34,
  },
  {
      ID: "003",
      startLocation: 1,
      endLocation: 2,
      startTime: "2019-12-13T08:10",
      endTime: "2019-12-13T08:25",
      isScheduled: false,
      riderID: "1",
      dateRequested: 34,
    }
]

var drivers = [
    {
        ID: "0",
        name: "Brandon Brandoni",
        startTime: "2019-12-13T08:00",
        endTime: "2019-12-13T18:00",
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
        startTime: "2019-12-13T07:00",
        endTime: "2019-12-13T17:00",
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

// Incredibly basic test of scheduling
schedule = makeSchedule(rideRequests, drivers);
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


// // OLD CODE:
// function scheduleRequestsOld(rideRequests, drivers) {
//     schedule = [];
//     if(rec_addReqOld(rideRequests, 0, drivers, schedule))
//         return schedule;
//     return null;
// }


// // better iterative error checking and handling later
// // Need to check driver last position and time to pick-up destination

// function rec_addReqOld(rideRequests, rideIdx, drivers, scheduledRides){
//     if(rideIdx >= rideRequests.length)
//         return true;

//     request = rideRequests[rideIdx];
//     for(var driverIdx=0; driverIdx<drivers.length; driverIdx++) {
//         driver = drivers[driverIdx];
//         // Try and find conflicting ride in scheduledRides and if so continue on to next driver
//         conflict = false;
//         for(ride in scheduledRides) {
//             // DOES NOT CORRECTLY COMPARE TIMES
//             if(ride.driverID === driver.id && (request.startTime > ride.startTime && request.startTime < ride.endTime) 
//                     || (request.endTime > ride.startTime && request.endTime < ride.endTime)){
//                 conflict = true;
//                 continue;
//             }
//         }
//         if(conflict) { continue; }

//         // Assign current driver (guaranteed no conflict) and call recursively on next request
//         // If recursive call is successful, then return
//         // Else undo assignment
//         scheduledRides.push(assignRide(request, driver));
//         if(rec_addReqOld(rideRequests, rideIdx+1, drivers, scheduledRides))
//             return true;
//         scheduledRides.pop();
//     }

//     return false;
// }

  