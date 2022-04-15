import React, { useRef, useEffect } from 'react';
import { Ride, Driver } from '../../types/index';
import { useReq } from '../../context/req';
import styles from './assigndrivermodal.module.css';
import { useRides } from '../../context/RidesContext';

type AssignModalProps = {
  isOpen: boolean;
  close: () => void;
  ride: Ride;
  allDrivers: Driver[];
  reassign: boolean;
};

type DriverRowProps = {
  onclick: () => void;
  firstName: string;
  imageURL?: string;
};

const DriverRow = ({ onclick, firstName, imageURL }: DriverRowProps) => (
  <div className={styles.driverRow} onClick={onclick}>
    <p className={styles.driverName}>{firstName}</p>
    {imageURL ? (
      <img className={styles.driverImage} src={imageURL} alt="Avatar" />
    ) : (
      <span className={styles.driverImage} />
    )}
  </div>
);

const AssignDriverModal = ({
  isOpen,
  close,
  ride,
  allDrivers,
  reassign = false,
}: AssignModalProps) => {
  const { withDefaults } = useReq();
  const { refreshRides } = useRides();
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
  const wrapperRef = useRef(null);
  const addDriver = (driver: Driver) => {
    fetch(
      `/api/rides/${ride.id}`,
      withDefaults({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver,
          type: !reassign ? 'active' : undefined,
        }),
      })
    ).then(() => refreshRides());
    close();
  };
  useOutsideAlerter(wrapperRef);

  return (
    <>
      {isOpen && (
        <div className={styles.modal} ref={wrapperRef}>
          {allDrivers.map((driver, id) => (
            <DriverRow
              onclick={() => {
                addDriver(driver);
              }}
              key={id}
              firstName={driver.firstName}
              imageURL={driver.photoLink ? `${driver.photoLink}` : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default AssignDriverModal;
