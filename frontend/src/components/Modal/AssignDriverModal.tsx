import React, { useRef, useEffect } from 'react';
import { Ride, Driver } from '../../types/index';
import styles from './assigndrivermodal.module.css';
import { useRides } from '../../context/RidesContext';
import axios from '../../util/axios';

type AssignModalProps = {
  isOpen: boolean;
  close: () => void;
  ride: Ride;
  allDrivers: Driver[];
  reassign: boolean;
  buttonRef: any
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
  buttonRef,
}: AssignModalProps) => {
  const { refreshRides } = useRides();
  // source: https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
  function useOutsideAlerter(wrapperRef: any, buttonRef: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        console.log("Button ref:", buttonRef.current); // Debugging statement
        console.log("T1 WORK");
        if (buttonRef.current === null) {
          console.log("Button reference is null");
        }
        event.stopPropagation();
        const isClickOutsideButton = buttonRef.current && !buttonRef.current.contains(event.target);
        const isClickOutsideModal = wrapperRef.current && !wrapperRef.current.contains(event.target);
        if (isClickOutsideModal && isClickOutsideButton) {
          console.log("T2 (INTERRUPT) WORK");
          close();
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [wrapperRef, buttonRef]);
  }

  const wrapperRef = useRef(null);
  const addDriver = (driver: Driver) => {
    axios
      .put(`/api/rides/${ride.id}`, {
        driver,
        type: !reassign ? 'active' : undefined,
      })
      .then(() => refreshRides());
    close();
  };


  useOutsideAlerter(wrapperRef, buttonRef);
 
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
