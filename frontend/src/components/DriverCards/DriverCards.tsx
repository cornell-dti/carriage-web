import React from 'react';
import Card from './Card';
import data from './data';

const DriverCards = () => (
  <div>
    {data.map((driver) => <Card key={driver.id} driver={driver} />)}
  </div>
);

export default DriverCards;
