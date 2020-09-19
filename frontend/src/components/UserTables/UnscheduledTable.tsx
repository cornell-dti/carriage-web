import React from 'react';


function renderTableHeader() {
  return (
    <tr>
      <th></th>
      <th className="tableHeader">Time</th>
      <th className="tableHeader">Passenger</th>
      <th className="tableHeader">Pickup Location</th>
      <th className="tableHeader">Dropoff Location</th>
      <th className="tableHeader">Needs</th>
    </tr>
  );
}

type passenger = {
  startTime: string;
  endTime: string;
  name: string;
  pickupLocation: string;
  pickupTag: string;
  dropoffLocation: string;
  dropoffTag: string;
  needs: string;

}

const Table = () => {
  const passengers = [
    { startTime: '8:20am', endTime: '8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '8:30am', endTime: '8:50am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '9:10am', endTime: '9:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '9:30am', endTime: '9:50am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '10:10am', endTime: '10:30am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },

  ];

  function renderTableData(allPassengers: passenger[]) {
    let currentTime = '';
    return allPassengers.map((rider, index) => {
      const { startTime, endTime, name, pickupLocation, pickupTag,
        dropoffLocation, dropoffTag, needs } = rider;
      const colon = startTime.indexOf(':');
      const timeOfDay = startTime.substring(startTime.indexOf('m') - 1).toUpperCase();
      const startHour = startTime.substring(0, colon) + timeOfDay;
      if (startHour !== currentTime) {
        currentTime = startHour;
      } else {
        currentTime = '';
      }

      const timeframe = currentTime;
      return (
        <tr key={index}>
          <td>{timeframe}</td>
          <td><span>{startTime}</span> <br></br> <span>-- {endTime}</span></td>
          <td className="tableCell">{name}</td>
          <td><span>{pickupLocation}</span> <span style={{ background: '#D5F2EA' }}>{pickupTag}</span></td>
          <td><span>{dropoffLocation}</span> <span style={{ background: '#FFD8DE' }}>{dropoffTag}</span></td>
          <td>{needs}</td>
        </tr>
      );
    });
  }

  return (
    <>
      <div>
        <h1 className="formHeader">Unscheduled Rides</h1>
        <table className="table">
          <tbody>
            {renderTableHeader()}
            {renderTableData(passengers)}
          </tbody>
        </table>
      </div >
    </>
  );
};

export default Table;
