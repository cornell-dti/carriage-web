import React from 'react';
import styles from './loadingscreen.module.css';

const LoadingScreen = () => (
  <div className={styles.loadingSpinner}>
    <div className={styles.spinner}></div>
  </div>
);

export default LoadingScreen;
