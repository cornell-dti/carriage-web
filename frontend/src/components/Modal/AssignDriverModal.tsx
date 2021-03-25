import React, { useRef, useEffect } from 'react';
import { Ride, Driver } from '../../types/index';
import { useReq } from '../../context/req';
import styles from './assigndrivermodal.module.css';

type AssignModalProps = {
  isOpen: boolean;
  close: () => void;
  ride: Ride;
  allDrivers: Driver[];
};

type DriverRowProps = {
  onclick: () => void;
  firstName: string;
  imageURL: string;
};

const DriverRow = ({ onclick, firstName, imageURL }: DriverRowProps) => {
  return(
  <div className={styles.driverRow} onClick={onclick}>
    <img className={styles.driverImage} src={imageURL} alt="Avatar"></img>
    <p className={styles.driverName}>{firstName}</p>
  </div>
)};

const AssignDriverModal = ({
  isOpen,
  close,
  ride,
  allDrivers,
}: AssignModalProps) => {
  const { withDefaults } = useReq();
  // source: https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

const addDriver = (driver: Driver) => {
  fetch(
    `/api/rides/${ride.id}`,
    withDefaults({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver: driver, 
                              type: "scheduled"}),
    }),
  );
}

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  return (
    <>
      {isOpen && (
        <div className={styles.modal} ref={wrapperRef}>
          <h1 className={styles.titleText}>Available Drivers</h1>
          {allDrivers.map((driver, id) => (
            <DriverRow
              onclick = {() => {addDriver(driver)}}
              key={id}
              firstName={driver.firstName}
              imageURL="https://www.biography.com/.image/t_share/MTE5NDg0MDYwNjkzMjY3OTgz/terry-crews-headshot-600x600jpg.jpg"
            />
          ))}
        </div>
      )}
    </>
  );
};

export default AssignDriverModal;
