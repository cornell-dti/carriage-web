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
      <div data-cy="home" className={styles.home}>
        <div data-cy="main" className={styles.main}>
          <div data-cy="left" className={styles.left}>
            <img
              src={logo}
              data-cy="badge"
              className={styles.badge}
              alt="Carriage logo"
            />
            <span data-cy="title" className={styles.title}>
              Carriage
            </span>
          </div>
          <div data-cy="right" className={styles.right}>
            <div
              data-cy="spacing_container"
              className={styles.spacing_container}
            >
              <h1 data-cy="heading" className={styles.heading}>
                Login
              </h1>
              <div data-cy="container" className={styles.container}>
                <div
                  data-cy="container_item_left"
                  className={styles.container_item_left}
                >
                  {students}
                </div>
                <div
                  data-cy="container_item_right"
                  className={styles.container_item_right}
                >
                  {admins}
                </div>
              </div>
            </div>
            <div data-cy="dti_container" className={styles.dti_container}>
              <img
                src={dti}
                data-cy="dti_logo"
                className={styles.dti_logo}
                alt="DTI Logo"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;
