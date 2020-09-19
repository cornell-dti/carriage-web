import React, { useState } from 'react';


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
  timeFrame: string;
  time: string;
  name: string;
  pickupLocation: string;
  pickupTag: string;
  dropoffLocation: string;
  dropoffTag: string;
  needs: string;

}

const Table = () => {
  const [passenger] = useState([
    { timeFrame: '8AM', time: '8:20am - 8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { timeFrame: '8AM', time: '8:20am - 8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { timeFrame: '8AM', time: '8:20am - 8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { timeFrame: '8AM', time: '8:20am - 8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { timeFrame: '8AM', time: '8:20am - 8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },

  ]);

  function renderTableData(passengers: passenger[]) {
    return passengers.map((rider, index) => {
      const { timeFrame, time, name, pickupLocation, pickupTag, dropoffLocation, dropoffTag, needs } = rider;
      return (
        <tr key={index}>
          <td>{timeFrame}</td>
          <td>{time}</td>
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
            {renderTableData(passenger)}
          </tbody>
        </table>
      </div >
    </>
  );
};

export default Table;
