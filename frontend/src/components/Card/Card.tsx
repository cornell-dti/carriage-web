import React from 'react';

type CardInfoProps = {
  icon: string;
  alt: string;
  children: JSX.Element | JSX.Element[];
};

export const CardInfo = ({ icon, alt, children }: CardInfoProps) => (
  <div className="flex items-center">
    <img className="w-4 mr-4" src={icon} alt={alt} />
    {children}
  </div>
);

type CardProps = {
  firstName: string;
  lastName: string;
  netId: string;
  children: JSX.Element | JSX.Element[];
  photoLink?: string;
};

const Card = ({
  firstName,
  lastName,
  netId,
  children,
  photoLink,
}: CardProps) => {
  const fullName =
    firstName.length + lastName.length > 16
      ? `${firstName} ${lastName[0]}.`
      : `${firstName} ${lastName}`;

  return (
    <div className="inline-block w-68 h-80 bg-white rounded-lg border border-gray-300 overflow-hidden shadow-md">
      {photoLink && photoLink !== '' ? (
        <img
          className="bg-gray-300 object-cover w-full h-37.5"
          alt="uploaded profile"
          src={`${photoLink}`}
        />
      ) : (
        <div className="bg-gray-300 w-full h-37.5"> </div>
      )}
      <div className="p-5 pr-0 pb-7 pl-4">
        <div className="-ml-4 pt-1 pb-1 pl-3 border-l-3 border-black">
          <h2 className="inline-block text-xl font-bold m-0">{fullName}</h2>
          <p className="inline-block text-sm text-gray-700 ml-1">{netId}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Card;
