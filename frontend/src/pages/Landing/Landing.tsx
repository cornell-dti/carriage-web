import React, { ReactElement, useEffect } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { logo } from '../../icons/other';
import dti from './dti.png';
import ctownGraphic from './landing-images/ctown.png';

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
      <header className={styles.header}>
        <div className={styles.headerLogoContainer}>
          <img src={logo} className={styles.headerLogo} alt="Carriage logo" />
          <span className={styles.headerTitle}>Carriage</span>
        </div>
        <button className={styles.tosButton}>Terms of Service</button>
      </header>

      <div className={styles.home}>
        {/* I am approaching the landing page HTML by creating divs based on the
        Figma's "pages." For example, the first page consists of the login and the
        car driving in Ctown. The second page consists of the clocktower, the
        text, and the students in wheelchairs. WIP: still need to implement
        payload for first time users and continue with implementing designs. The
        resizing is also a bit problematic. */}
        <div className={styles.firstPage}>
          <div className={styles.main}>
            {/* <div className={styles.left}>
              <img src={logo} className={styles.badge} alt="Carriage logo" />
              <span className={styles.title}>Carriage</span>
            </div> */}
            {/* <div className={styles.right}>
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
            </div> */}
            <h1 className={styles.mainTitle}>Carriage</h1>
            <p className={styles.mainSubtext}>Efficient transit for CULift</p>
            <div className={styles.loginContainer}>
              <div className={styles.container_item_left}>{students}</div>
              <div className={styles.container_item_right}>{admins}</div>
            </div>
          </div>

          <div className={styles.ctownGraphicContainer}>
            <img
              src={ctownGraphic}
              alt="ctownGraphic"
              className={styles.ctownGraphic}
            />
          </div>
        </div>
        <div className={styles.secondPage}>
          <h1>Second page!</h1>
        </div>
      </div>
    </main>
  );
};

export default Landing;
