import React from 'react';
import noRides from '../../icons/other/no-rides.svg';
import styles from './noridesview.module.css';

type Props = {
  compact?: boolean;
  message?: string;
};

const NoRidesView: React.FC<Props> = ({ compact = false, message }) => (
  <div className={compact ? styles.containerCompact : styles.container}>
    <img src={noRides} className={styles.image} alt="No rides" />
    <p className={styles.text}>
      {message || 'You have no upcoming rides! Request a ride to get started.'}
    </p>
  </div>
);

export default NoRidesView;
