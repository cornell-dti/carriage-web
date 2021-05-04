import React, { ReactElement } from 'react';
import styles from './landing.module.css';

import { logo } from '../../icons/other';
type LandingPropType = {
  students: ReactElement,
  admins: ReactElement
}

const Landing = ({ students, admins }: LandingPropType) => (
  <>
    <div className={styles.home}>
      <div className={styles.main}>
        <div className={styles.left}>
          <img
            src={logo}
            className={styles.badge}
            alt="Carriage logo"
          />
          <div className={styles.title}>Carriage</div>

        </div>
        <div className={styles.right}>
          <h1 className={styles.heading}>Login</h1>
          <div className={styles.container}>
            {students}
            {admins}
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Landing;
