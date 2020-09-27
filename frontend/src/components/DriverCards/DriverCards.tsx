import React, { useEffect, useState } from 'react';
import Card from './Card';
import styles from './drivercards.module.css';
import { Driver } from '../../types/index';

const DriverCards = () => {
  const [drivers, setDrivers] = useState<Driver[]>();

  useEffect(() => {
    fetch('/drivers')
      .then((res) => res.json())
      .then(({ data }) => setDrivers(data));
  }, []);

  return <div className={styles.cardsContainer}>
    {drivers && drivers.map((driver) => <Card key={driver.id} driver={driver} />)}
  </div>;
};

export default DriverCards;
