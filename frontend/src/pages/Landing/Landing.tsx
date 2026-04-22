import { ReactElement, useEffect } from 'react';
import { logo } from '../../icons/other';
import dti from './dti.png';
import topLaptop from './landing-images/laptop1.svg';
import bottomLaptop from './landing-images/laptop2.svg';
import phone from './landing-images/iPhone.svg';
import { WAVE_PATH } from '../../util/constants';
import campus from './campus.jpg';

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
    <main id="main" className="w-full max-w-full overflow-x-hidden">
      <div className="relative bg-cover min-h-fit w-full flex flex-col justify-center items-center">
        <img
          src={campus}
          alt="A aerial photo of Cornell"
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute top-5 right-5">
          <a href={cuLiftTerms} target="_blank" rel="noreferrer">
            <button className="w-44 h-10 border-0 bg-white text-black rounded hover:bg-gray-200 cursor-pointer text-base">
              Terms of Service
            </button>
          </a>
        </div>
        <div className="rounded-2xl flex overflow-clip my-32 flex-col lg:flex-row">
          <div className="bg-black flex flex-col justify-center items-center p-4 relative">
            <img src={logo} alt="Carriage logo" />
            <span className="text-5xl font-semibold text-white mt-4">
              Carriage
            </span>
          </div>
          <div className="bg-white grow flex flex-col justify-between items-center text-center p-16 relative">
            <div className="flex flex-col justify-center items-center flex-1 gap-6">
              <h1 className="text-3xl font-black">Login</h1>
              {ssoError && (
                <div className="bg-red-100 text-red-900 p-3 rounded border border-red-400 mb-4 w-full">
                  {ssoError}
                </div>
              )}
              <div className="flex justify-between items-center flex-col lg:flex-row gap-2">
                <div className="mx-2.5">{students}</div>
                <div className="mx-2.5">{admins}</div>
                <div className="mx-2.5">{drivers}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full p-0 leading-none"
          style={{ transform: 'translateY(2px)' }}
        >
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d={WAVE_PATH.trim()}
              className="fill-white"
              transform="translate(0, 120) scale(1, -1)"
            />
          </svg>
        </div>
      </div>

      <div className="relative flex justify-center items-start mt-15">
        <div className="py-36 flex lg:flex-row  flex-col-reverse items-center gap-24 px-8 lg:px-24">
          <p className=" text-xl lg:text-3xl w-full">
            Administrators add students and employees and assign rides on Admin
            Web.
          </p>
          <img src={topLaptop} alt="top laptop" className="max-w-full h-auto" />
        </div>
      </div>

      <div className="bg-zinc-900 py-20 px-8 lg:px-24 flex flex-col lg:flex-row items-center justify-center gap-24">
        <div className="flex items-center justify-center flex-row gap-4 w-full h-56">
          <img src={bottomLaptop} alt="bottom laptop" className="w-full" />
          <img src={phone} alt="phone" className="w-1/2 h-full" />
        </div>

        <p className="text-white  text-xl lg:text-3xl w-full">
          Students Schedule, Edit, and Cancel rides on Rider Web and Mobile.
        </p>
      </div>

      <div className="bg-white flex items-center justify-center gap-px py-3">
        <div className="flex flex-row justify-center items-center p-4">
          <a
            href="https://www.cornelldti.org/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={dti} className="w-56 h-auto" alt="DTI Logo" />
          </a>
        </div>
      </div>
    </main>
  );
};

export default Landing;
