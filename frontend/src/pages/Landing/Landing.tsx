import React, { ReactElement, useEffect } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { logo } from '../../icons/other';
import dti from './dti.png';
import ctownGraphic from './landing-images/ctown.png';
import clocktower from './landing-images/clocktower.png';
import car from './landing-images/car.png';
import human1 from './landing-images/human1.png';
import human2 from './landing-images/human2.png';
import human3 from './landing-images/human3.png';

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

      {/* <div className={styles.home}> */}
      {/* I am approaching the landing page HTML by creating divs based on the
        Figma's "pages." For example, the first page consists of the login and the
        car driving in Ctown. The second page consists of the clocktower, the
        text, and the students in wheelchairs. WIP: still need to implement
        payload for first time users and continue with implementing designs. The
        resizing is also a bit problematic. */}
      <div className={styles.firstPage}>
        <div className={styles.main}>
          <h1 className={styles.mainTitle}>Carriage</h1>
          <p className={styles.mainSubtext}>Efficient transit for CULift</p>
          <div className={styles.loginContainer}>
            <div className={styles.login_left}>{students}</div>
            <div className={styles.login_right}>{admins}</div>
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
        <div className={styles.secondPageGraphicsContainer}>
          <img
            src={clocktower}
            alt="clocktower"
            className={styles.clocktower}
          />
          <img src={car} alt="car" className={styles.car} />
          <img src={human1} alt="human1" className={styles.human1} />
          <img src={human2} alt="human2" className={styles.human2} />
          <img src={human3} alt="human3" className={styles.human3} />
        </div>
      </div>
    </main>
  );
};

export default Landing;
