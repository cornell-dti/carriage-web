import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { logo, dti_logo } from '../../icons/other';

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
};

const Landing = ({ students, admins }: LandingPropType) => (
  <main id="main">
    <div className={styles.home}>
      <div className={styles.main}>
        <div className={styles.left}>
          <img src={logo} className={styles.badge} alt="Carriage logo" />
          <span className={styles.title}>Carriage</span>
          <img src={dti_logo} className={styles.dti_logo} alt="DTI logo" />
        </div>
        <div className={styles.right}>
          <h1 className={styles.heading}>Login</h1>
          <div className={styles.container}>
            {students}
            {admins}
          </div>
          <div className={styles.footer}>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default Landing;
