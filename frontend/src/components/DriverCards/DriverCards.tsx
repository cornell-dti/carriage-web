import React from 'react';
import Card from './Card';
import data from './data';
import styles from './drivercards.module.css';

const DriverCards = () => (
  <div className={styles.cardsContainer}>
    {data.map((driver) => <Card key={driver.id} driver={driver} />)}
  </div>
);

export default DriverCards;
