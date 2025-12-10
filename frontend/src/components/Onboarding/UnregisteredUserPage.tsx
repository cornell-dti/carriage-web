import React from 'react';
import styles from './unregistereduserpage.module.css';
import { logo } from '../../icons/other';
import { WAVE_PATH } from '../../util/constants';
import { UnregisteredUserType } from '@carriage-web/shared/types';

interface UnregisteredUserProps {
  user: UnregisteredUserType;
  onBack: () => void;
}

const UnregisteredUserPage: React.FC<UnregisteredUserProps> = ({
  user,
  onBack,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <img src={logo} className={styles.logo} alt="Carriage logo" />

        <h1 className={styles.greeting}>
          Hello {user.name}, you are not registered for Carriage
        </h1>

        <div className={styles.message}>
          <p>
            Sorry, you are not a registered Carriage user. To sign up, please
            come to Student Disability Services office in Level 5 of the Cornell
            Health Building.
          </p>
          <p className={styles.contact}>
            Call <a href="tel:607-254-4545">607-254-4545</a> or email{' '}
            <a href="mailto:culift@cornell.edu">culift@cornell.edu</a> if you
            have any questions.
          </p>
        </div>

        <button onClick={onBack} className={styles.backButton}>
          Back to Login
        </button>
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
  );
};

export default UnregisteredUserPage;
