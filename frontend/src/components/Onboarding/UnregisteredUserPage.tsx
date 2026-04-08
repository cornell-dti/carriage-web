import React from 'react';
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
    <div container}>
      <div card}>
        <img src={logo} logo} alt="Carriage logo" />

        <h1 greeting}>
          Hello {user.name}, you are not registered for CULift.
        </h1>

        <div message}>
          <p>
            To sign up, before you can use the CULift service, you need to
            submit a formal request to Student Disability Services and be
            approved.
          </p>
          <p contact}>
            Call <a href="tel:607-254-4545">607-254-4545</a> or email{' '}
            <a href="mailto:culift@cornell.edu">culift@cornell.edu</a> if you
            have any questions.
          </p>
        </div>

        <button onClick={onBack} backButton}>
          Back to Login
        </button>
      </div>

      <div customShape}>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d={WAVE_PATH.trim()} shapeFill}></path>
        </svg>
      </div>
    </div>
  );
};

export default UnregisteredUserPage;
