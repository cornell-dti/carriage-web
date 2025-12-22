import { ReactElement, useEffect } from 'react';
import styles from './landing.module.css';
import { logo } from '../../icons/other';
import dti from './dti.png';
import topLaptop from './landing-images/laptop1.svg';
import bottomLaptop from './landing-images/laptop2.svg';
import phone from './landing-images/iPhone.svg';
import { WAVE_PATH } from '../../util/constants';

const cuLiftTerms = `https://sds.cornell.edu/accommodations-services
/transportation/culift-guidelines`;

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
  drivers: ReactElement;
  ssoError?: string;
};

const Landing = ({ students, admins, drivers, ssoError }: LandingPropType) => {
  useEffect(() => {
    document.title = 'Login - Carriage';
  }, []);
  return (
    <main id="main">
      <div className={styles.home}>
        <div className={styles.tosButtonContainer}>
          <a href={cuLiftTerms} target="_blank" rel="noreferrer">
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
              {ssoError && (
                <div
                  style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    border: '1px solid #ef5350',
                  }}
                >
                  {ssoError}
                </div>
              )}
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
            <path d={WAVE_PATH.trim()} className={styles.shapeFill}></path>
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
          <a
            href="https://www.cornelldti.org/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={dti} className={styles.dti_logo} alt="DTI Logo" />
          </a>
        </div>
      </div>
    </main>
  );
};

export default Landing;
