import React from 'react';
import { createPortal } from 'react-dom';
import { Passenger } from '../../types/index';
import styles from './assigndrivermodal.module.css';

type AssignModalProps = {
  isOpen: boolean;
  ride: Passenger;
}

type DriverRowProps = {
  firstName: string;
  imageURL: string;
}
const DriverRow = ({ firstName, imageURL }: DriverRowProps) => (
  <div className={styles.driverRow}>
    <img className={styles.driverImage} src={imageURL} alt="Avatar"></img>
    <p className={styles.driverName}>{firstName}</p>
  </div>
);

const AssignDriverModal = ({ isOpen, ride }: AssignModalProps) => (
  <>
    {isOpen
      && createPortal(
        <div className={styles.modal}>
          <h1 className={styles.titleText}>Suggested Drivers</h1>
          <DriverRow firstName='Terry' imageURL='https://www.biography.com/.image/t_share/MTE5NDg0MDYwNjkzMjY3OTgz/terry-crews-headshot-600x600jpg.jpg' />
          <h1 className={styles.titleText}>Available Drivers</h1>
        </div>,
        document.body,
      )
    }
  </>
);

export default AssignDriverModal;
