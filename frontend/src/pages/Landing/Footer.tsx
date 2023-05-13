import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import { dti_logo } from '../../icons/other';

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.blackTop}>
        <p
          style={{
            color: 'white',
            fontSize: 25,
            textAlign: 'left',
            paddingLeft: 100,
            paddingTop: 30,
            paddingBottom: 30,
          }}
        >
          Students schedule, <br />
          edit, and cancel rides <br />
          on rider web <br />
          and mobile.
        </p>
        <img src="frontend/src/pages/Landing/Group525.png" />
      </div>

      <div className={styles.white}>
        <p
          style={{
            color: 'black',
            fontSize: 25,
            textAlign: 'right',
            paddingRight: 200,
            paddingTop: 30,
            paddingBottom: 30,
          }}
        >
          Administrators add <br />
          students and <br />
          employees and <br />
          dispatch rides.
        </p>
        <img src="frontend/src/pages/Landing/Group525.png" />
      </div>
      <div className={styles.blackBottom}>
        <div
          className={styles.dti_container}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={dti_logo}
            className={styles.dti_logo}
            alt="DTI logo"
            style={{ marginRight: '10px' }}
          />
          <p style={{ color: 'white', fontSize: 10 }}>
            Powered by <br />
            Cornell Design & Tech Initiative
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
