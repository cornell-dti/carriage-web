import React, { ReactElement, useEffect } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { logo } from '../../icons/other';
import dti from './dti.png';

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
};

const Landing = ({ students, admins }: LandingPropType) => {
  useEffect(() => {
    document.title = 'Login - Carriage';
  }, []);
  return (
    <main id="main">
      <div className={styles.home}>
        <div className={styles.main}>
          <div className={styles.left}>
            <img src={logo} className={styles.badge} alt="Carriage logo" />
            <span className={styles.title}>Raissa Carriage</span>
          </div>
          <div className={styles.right}>
            <div className={styles.spacing_container}>
              <h1 className={styles.heading}>Login</h1>
              <div className={styles.container}>
                <div className={styles.container_item_left}>{students}</div>
                <div className={styles.container_item_right}>{admins}</div>
              </div>
            </div>
            <div className={styles.dti_container}>
              <img src={dti} className={styles.dti_logo} alt="DTI Logo" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;
