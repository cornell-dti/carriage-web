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
        <div className={styles.main}>
          <div className={styles.left}>
            <img src={logo} className={styles.badge} alt="Carriage logo" />
            <span className={styles.title}>Carriage</span>
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
              <img src={dti_logo} className={styles.dti_logo} alt="DTI logo" />
              <img src={dti_desc} className={styles.dti_desc} alt="DTI desc" />
            </div>
          </div>
        </div>
      </div>
      <div><Footer/></div>
    </main>
  );
};

export default Landing;
