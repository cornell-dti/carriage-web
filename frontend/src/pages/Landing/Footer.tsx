import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import { dti_logo } from '../../icons/other';
import bottomLaptop from './images/bottomLaptop.png';
import topLaptop from './images/topLaptop.png';
import iPhone from './images/iPhone.png';

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.blackTop}>
        <p
          style={{
            color: 'white',
            fontSize: '40px',
            textAlign: 'left',
            paddingRight: 50,
            paddingLeft: 50,
            paddingTop: 100,
            paddingBottom: 100,
          }}
        >
          Students schedule, <br />
          edit, and cancel rides <br />
          on rider web <br />
          and mobile.
        </p>
        <img src={iPhone} className="topImage" />
        <img src={topLaptop} className="topImage" />
      </div>

      <div className={styles.white}>
        <img src={bottomLaptop} className="bottomImage" />
        <p
          style={{
            color: 'black',
            fontSize: '40px',
            textAlign: 'right',
            paddingRight: 50,
            paddingLeft: 100,
            paddingTop: 100,
            paddingBottom: 100,
            fontWeight: 600,
          }}
        >
          Administrators add <br />
          students and <br />
          employees and <br />
          dispatch rides.
        </p>
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
