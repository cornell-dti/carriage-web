import React from 'react';
import { logo } from '../../icons/other';
import { WAVE_PATH } from '../../util/constants';
import { UnregisteredUserType } from '@carriage-web/shared/types';
import campusImg from '../../pages/Landing/campus.jpg';

interface UnregisteredUserProps {
  user: UnregisteredUserType;
  onBack: () => void;
}

const UnregisteredUserPage: React.FC<UnregisteredUserProps> = ({
  user,
  onBack,
}) => {
  return (
    <div
      className="relative h-screen flex flex-row justify-center items-start px-5 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${campusImg})`,
      }}
    >
      <div className="border border-black rounded-2xl bg-white max-w-175 w-full mt-30 p-12 text-center shadow-[0px_0px_10px_rgba(0,0,0,0.1),0px_10px_10px_rgba(0,0,0,0.16)] max-sm:mt-8 max-sm:px-6 max-sm:py-8">
        <img src={logo} className="w-20 h-20 mb-6" alt="Carriage logo" />

        <h1 className="text-[28px] font-semibold text-[#333] mb-8 leading-[1.4] max-sm:text-2xl">
          Hello {user.name}, you are not registered for CULift.
        </h1>

        <div className="text-base leading-[1.6] text-[#666] mb-8 [&>p]:mb-4">
          <p>
            To sign up, before you can use the CULift service, you need to
            submit a formal request to Student Disability Services and be
            approved.
          </p>
          <p className="mt-6">
            Call{' '}
            <a
              href="tel:607-254-4545"
              className="text-[#0075db] no-underline font-medium hover:underline"
            >
              607-254-4545
            </a>{' '}
            or email{' '}
            <a
              href="mailto:culift@cornell.edu"
              className="text-[#0075db] no-underline font-medium hover:underline"
            >
              culift@cornell.edu
            </a>{' '}
            if you have any questions.
          </p>
        </div>

        <button
          onClick={onBack}
          className="text-white bg-black border border-black rounded-lg min-w-26.25 px-4 py-2 text-center text-[0.9375rem] cursor-pointer focus:[box-shadow:0_0_0_3px_#0075db] hover:bg-[#333]"
        >
          Back to Login
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0 rotate-180 h-[15%] z-10">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute block w-[calc(142%+1.3px)]"
        >
          <path d={WAVE_PATH.trim()} className="fill-white"></path>
        </svg>
      </div>
    </div>
  );
};

export default UnregisteredUserPage;
