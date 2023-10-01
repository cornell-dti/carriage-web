import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import Footer from './Footer';
import { logo, dti_logo, dti_desc } from '../../icons/other';

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
};

const Landing = ({ students, admins }: LandingPropType) => {
  document.title = 'Login - Carriage';
  return (
    <main id="main">
      <div className={styles.home}>
        <div>
          <h1 className={styles.heading}>Carriage</h1>
          <p className={styles.description}>Efficient Transit for CULifts</p>
          <div className={styles.button_container}>
            <div className={styles.container_item_left}>{students}</div>
            <div className={styles.container_item_right}>{admins}</div>
          </div>
        </div>
        <div>
          <a href="/" className={styles.terms}>
            Terms of Services
          </a>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </main>
  );
};

export default Landing;
