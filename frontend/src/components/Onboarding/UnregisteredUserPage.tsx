import React from 'react';
import styles from './unregistereduserpage.module.css';
import { logo } from '../../icons/other';
import { WAVE_PATH } from '../../util/constants';
import { UnregisteredUser } from '../../types/index';

interface UnregisteredUserProps {
  user: UnregisteredUser;
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
          Hello {user.name}, you are not registered for CULift.
        </h1>

        <div className={styles.message}>
          <p>
            To sign up, before you can use the CULift service, you need to
            submit a formal request to Student Disability Services and be
            approved.
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
