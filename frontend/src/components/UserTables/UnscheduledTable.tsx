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
    { startTime: '8:20am', endTime: '8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '8:20am', endTime: '8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '8:20am', endTime: '8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '8:20am', endTime: '8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },

  ];

  function renderTableData(allPassengers: passenger[]) {
    return allPassengers.map((rider, index) => {
      const { startTime, endTime, name, pickupLocation, pickupTag,
        dropoffLocation, dropoffTag, needs } = rider;
      const timeframe = startTime[0] + startTime.substring(startTime.indexOf('m') - 1).toUpperCase();
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
