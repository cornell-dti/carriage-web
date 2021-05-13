import React from 'react';
import noRides from '../../icons/other/no-rides.svg';
import styles from './noridesview.module.css';

const NoRidesView = () => (
  <div className={styles.container}>
    <img src={noRides} alt='No rides image' />
    <p className={styles.text}>You have no upcoming rides! Request a ride to get started</p>
  </div>
);

export default NoRidesView;
