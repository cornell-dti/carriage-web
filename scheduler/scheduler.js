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
    },
    {
        ID: "003",
        startLocation: 1,
        endLocation: 2,
        startTime: "8:10",
        endTime: "8:25",
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

// test scheduling
schedule = scheduleRequests(rideRequests, drivers);
console.log(schedule);
let date = new Date("18:00");
console.log(date.getHours());

function scheduleRequests(rideRequests, drivers) {
    schedule = [];
    if(rec_addReq(rideRequests, 0, drivers, schedule))
        return schedule;
    return null;
}


// better iterative error checking and handling later
// Need to check driver last position and time to pick-up destination

function rec_addReq(rideRequests, rideIdx, drivers, scheduledRides){
    if(rideIdx >= rideRequests.length)
        return true;

    request = rideRequests[rideIdx];
    for(var driverIdx=0; driverIdx<drivers.length; driverIdx++) {
        driver = drivers[driverIdx];
        // Try and find conflicting ride in scheduledRides and if so continue on to next driver
        conflict = false;
        for(ride in scheduledRides) {
            // DOES NOT CORRECTLY COMPARE TIMES
            if(ride.driverID == driver.id && (request.startTime > ride.startTime && request.startTime < ride.endTime) 
                    || (request.endTime > ride.startTime && request.endTime < ride.endTime)){
                conflict = true;
                continue;
            }
        }
        if(conflict) { continue; }

        // Assign current driver (guaranteed no conflict) and call recursively on next request
        // If recursive call is successful, then return
        // Else undo assignment
        scheduledRides.push(assignRide(request, driver));
        if(rec_addReq(rideRequests, rideIdx+1, drivers, scheduledRides))
            return true;
        scheduledRides.pop();
    }

    return false;
}

// WARNING CHANGES UNDERLYING REQUEST OBJECT -- ok for now but bad form
function assignRide(request, driver) {
    request.driverID = driver.ID;
    return request;
}
  