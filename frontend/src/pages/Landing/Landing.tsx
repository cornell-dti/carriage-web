import React, { ReactElement } from 'react';
import styles from './landing.module.css';

type LandingPropType = {
  loginButton: ReactElement
}

const Landing = ({ loginButton }: LandingPropType) => (
  <>
    <div className={styles.home}>
      <div className={styles.main}>
        <div className={styles.left}><div className={styles.logo} /></div>
        <div className={styles.right}>
          <h1 className={styles.heading}>Login</h1>
          <input className={styles.input} disabled type="text" name="email" placeholder="email" />
          <input className={styles.input} disabled type="password" name="password" placeholder="password" />
          <div>
            {loginButton}
          </div>
        </div>
        {/* hi
        {btn} */}
      </div>
    </div>
  </>
);

export default Landing;
