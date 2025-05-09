import React, { ReactElement, useEffect } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { logo } from '../../icons/other';
import dti from './dti.png';
import topLaptop from './landing-images/laptop1.svg';
import bottomLaptop from './landing-images/laptop2.svg';
import phone from './landing-images/iPhone.svg';

const cuLiftTerms = `https://sds.cornell.edu/accommodations-services
/transportation/culift-guidelines`;

const wavePath = `M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,
168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,
26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z`;

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
  drivers: ReactElement;
};

const Landing = ({ students, admins, drivers }: LandingPropType) => {
  useEffect(() => {
    document.title = 'Login - Carriage';
  }, []);
  return (
    <main id="main">
      <div className={styles.home}>
        <div className={styles.tosButtonContainer}>
          <a href={cuLiftTerms} target="_blank">
            <button className={styles.tosButton}>Terms of Service</button>
          </a>
        </div>
        <div className={styles.main}>
          <div className={styles.left}>
            <img src={logo} className={styles.badge} alt="Carriage logo" />
            <span className={styles.title}>Carriage</span>
          </div>
          <div className={styles.right}>
            <div className={styles.spacing_container}>
              <h1 className={styles.heading}>Login</h1>
              <div className={styles.container}>
                <div className={styles.container_item}>{students}</div>
                <div className={styles.container_item}>{admins}</div>
                <div className={styles.container_item}>{drivers}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.customShape}>
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d={wavePath.trim()} className={styles.shapeFill}></path>
          </svg>
        </div>
      </div>

      <div className={styles.information}>
        <div className={styles.adminInfo}>
          <p>
            Administrators add students and employees and assign rides on Admin
            Web.
          </p>
          <img src={topLaptop} alt="top laptop" className={styles.topLaptop} />
        </div>
      </div>

      <div className={styles.studentInfo}>
        <div className={styles.studentImgContainer}>
          <img
            src={bottomLaptop}
            alt="bottom laptop"
            className={styles.bottomLaptop}
          />
          <img src={phone} alt="phone" className={styles.phone} />
        </div>

        <p>
          Students Schedule, Edit, and Cancel rides on Rider Web and Mobile.
        </p>
      </div>

      <div className={styles.footer}>
        <div className={styles.dti_container}>
          <a href="https://www.cornelldti.org/" target="_blank">
            <img src={dti} className={styles.dti_logo} alt="DTI Logo" />
          </a>
        </div>
      </div>
    </main>
  );
};

export default Landing;
