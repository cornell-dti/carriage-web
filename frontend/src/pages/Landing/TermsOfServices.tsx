import React from 'react';
import { Link } from 'react-router-dom';
import styles from './landing.module.css';

const Terms: React.FC = () => {
  return (
    <div>
      <Link to="/" className={styles.button}>
        Terms of Services
      </Link>
    </div>
  );
};

export default Terms;
