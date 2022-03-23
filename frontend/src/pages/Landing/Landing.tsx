import React, { ReactElement, useEffect } from 'react';
import styles from './landing.module.css';
import { logo, dti_logo, dti_desc } from '../../icons/other';
import { Helmet } from 'react-helmet';

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
};

const Landing = ({ students, admins }: LandingPropType) => {
  useEffect(() => {
    if (document) {
      document.getElementById('google-login')?.remove();
    }
  });

  return (
    <main id="main">
      <Helmet>
        <title>Carriage</title>
      </Helmet>
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
                {students}
                {admins}
              </div>
            </div>
            <div className={styles.dti_container}>
              <img src={dti_logo} className={styles.dti_logo} alt="DTI logo" />
              <img src={dti_desc} className={styles.dti_desc} alt="DTI desc" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;
