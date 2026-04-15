import React from 'react';
import noRides from '../../icons/other/no-rides.svg';

type Props = {
  compact?: boolean;
  message?: string;
};

const NoRidesView: React.FC<Props> = ({ compact = false, message }) => (
  <div
    className={
      compact
        ? 'h-55 w-full flex flex-col items-center justify-center'
        : 'h-screen w-full flex flex-col items-center justify-center'
    }
  >
    <img src={noRides} className="w-50 h-auto" alt="No rides" />
    <p className="mt-6 text-lg leading-5.25 opacity-70 text-black">
      {message || 'You have no upcoming rides! Request a ride to get started.'}
    </p>
  </div>
);

export default NoRidesView;
