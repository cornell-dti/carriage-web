import { ReactElement, useEffect } from 'react';
import { logo } from '../../icons/other';
import dti from './dti.png';
import topLaptop from './landing-images/laptop1.svg';
import bottomLaptop from './landing-images/laptop2.svg';
import phone from './landing-images/iPhone.svg';
import { WAVE_PATH } from '../../util/constants';

const cuLiftTerms = `https://sds.cornell.edu/accommodations-services
/transportation/culift-guidelines`;

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
  drivers: ReactElement;
  ssoError?: string;
};

const Landing = ({ students, admins, drivers, ssoError }: LandingPropType) => {
  useEffect(() => {
    document.title = 'Login - Carriage';
  }, []);
  return (
    <main id="main" pageMain}>
      <div home}>
        <div tosButtonContainer}>
          <a href={cuLiftTerms} target="_blank" rel="noreferrer">
            <button tosButton}>Terms of Service</button>
          </a>
        </div>
        <div main}>
          <div left}>
            <img src={logo} badge} alt="Carriage logo" />
            <span title}>Carriage</span>
          </div>
          <div right}>
            <div spacing_container}>
              <h1 heading}>Login</h1>
              {ssoError && (
                <div
                  style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    border: '1px solid #ef5350',
                  }}
                >
                  {ssoError}
                </div>
              )}
              <div container}>
                <div container_item}>{students}</div>
                <div container_item}>{admins}</div>
                <div container_item}>{drivers}</div>
              </div>
            </div>
          </div>
        </div>

        <div customShape}>
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d={WAVE_PATH.trim()}
              shapeFill}
              transform="translate(0, 120) scale(1, -1)"
            />
          </svg>
        </div>
      </div>

      <div information}>
        <div adminInfo}>
          <p>
            Administrators add students and employees and assign rides on Admin
            Web.
          </p>
          <img src={topLaptop} alt="top laptop" topLaptop} />
        </div>
      </div>

      <div studentInfo}>
        <div studentImgContainer}>
          <img
            src={bottomLaptop}
            alt="bottom laptop"
            bottomLaptop}
          />
          <img src={phone} alt="phone" phone} />
        </div>

        <p>
          Students Schedule, Edit, and Cancel rides on Rider Web and Mobile.
        </p>
      </div>

      <div footer}>
        <div dti_container}>
          <a
            href="https://www.cornelldti.org/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={dti} dti_logo} alt="DTI Logo" />
          </a>
        </div>
      </div>
    </main>
  );
};

export default Landing;
