import React from 'react';
import styles from './card.module.css';

type CardInfoProps = {
  icon: string;
  alt: string;
  children: JSX.Element | JSX.Element[];
};

export const CardInfo = ({ icon, alt, children }: CardInfoProps) => (
  <div className={styles.infoContainer}>
    <img className={styles.icon} src={icon} alt={alt} />
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
  photoLink
}: CardProps) => {
  const fullName = firstName.length + lastName.length > 16
    ? `${firstName} ${lastName[0]}.`
    : `${firstName} ${lastName}`;

  return (
    <div className={styles.card}>
        {photoLink && photoLink !== '' ?
        <img className={styles.image} alt="uploaded picture" src={photoLink} />
        : <div className={styles.image}> </div>}
      <div className={styles.contentContainer}>
        <div className={styles.titleContainer}>
          <p className={styles.name}>{fullName}</p>
          <p className={styles.netId}>{netId}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Card;
