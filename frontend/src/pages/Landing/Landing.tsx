import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import Footer from './Footer';
import { logo } from '../../icons/other';
import dti from './dti.png';
import slope from './images/Slope.png';

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
};
// This page loads the landing page for Carriage; it is the first page that users see when opening Carriage.
// The styling is located in landing.module.css.
// The footer is imported from Footer.tsx
// The header is constructed in this file using the 'students' and 'admins' elements,
// as well as text and buttons.

const Landing = ({ students, admins }: LandingPropType) => {
  document.title = 'Login - Carriage';
  return (
    <main id="main">
      <div className={styles.home}>
        <div>
          <h1 className={styles.heading}>Carriage</h1>
          <p className={styles.description}>Efficient Transit for CULifts</p>
          <div className={styles.button_container}>
            <div className={styles.container_item_left}>{students}</div>
            <div className={styles.container_item_right}>{admins}</div>
          </div>
        </div>
        <div>
          <a href="/" className={styles.terms}>
            Terms of Services
          </a>
        </div>
        <div className={styles.image_container}>
          <img src={slope} />
        </div>
      </div>

      <div>
        <Footer />
      </div>
    </main>
  );
};

export default Landing;
