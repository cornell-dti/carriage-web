import React from 'react';

type CardInfoProps = {
  icon: string;
  alt: string;
  children: JSX.Element | JSX.Element[];
};

export const CardInfo = ({ icon, alt, children }: CardInfoProps) => (
  <div className="flex items-center">
    <img className="w-[1rem] mr-[1rem]" src={icon} alt={alt} />
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
    <div className="inline-block w-68 h-80 bg-white rounded-lg border border-[#ddd] overflow-hidden shadow-[0px_5px_16px_-7px_rgba(0,0,0,0.15)]">
      {photoLink && photoLink !== '' ? (
        <img
          className="bg-[#dddddd] object-cover w-full h-[9.38rem]"
          alt="uploaded profile"
          src={`${photoLink}`}
        />
      ) : (
        <div className="bg-[#dddddd] object-cover w-full h-[9.38rem]"> </div>
      )}
      <div className="p-4">
        <div className="-ml-4 px-3 border-l-[0.19rem] border-black gap-4 flex items-center">
          <h2 className="inline-block text-[1.25rem] font-bold m-0">
            {fullName}
          </h2>
          <p className="inline-block text-[0.938rem] text-[#595959] ml-[0.313rem] m-0">
            {netId}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Card;
