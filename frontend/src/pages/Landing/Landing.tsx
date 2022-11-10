import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { logo, dti_logo, dti_desc } from '../../icons/other';
import { GoogleOAuthProvider } from '@react-oauth/google';
import useClientId from '../../hooks/useClientId';

const clientId = useClientId();
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
        </div>
        <div className={styles.right}>
          <div className={styles.spacing_container}>
            <h1 className={styles.heading}>Login</h1>
            <div className={styles.container}>
              <div className={styles.container_item_left}>
                <GoogleOAuthProvider
                  clientId={clientId}
                  onScriptLoadError={() => console.log('error')}
                >
                  {students}
                </GoogleOAuthProvider>
              </div>
              <div className={styles.container_item_right}>
                <GoogleOAuthProvider clientId={clientId}>
                  {admins}
                </GoogleOAuthProvider>
              </div>
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

export default Landing;
