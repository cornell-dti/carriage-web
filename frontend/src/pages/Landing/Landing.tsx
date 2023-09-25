import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { logo } from '../../icons/other';
import dti from './dti.png';

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
              <h1 className={styles.heading}>Carriage</h1>
              <p className={styles.description}>
                Efficient Transit for CULifts
              </p>
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
      <div>
        <Footer />
      </div>
    </main>
  );
};

export default Landing;
