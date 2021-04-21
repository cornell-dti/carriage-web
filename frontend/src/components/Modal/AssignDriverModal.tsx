import React, { useRef, useEffect, useState } from 'react';
import { Ride, Driver } from '../../types/index';
import { useReq } from '../../context/req';
import styles from './assigndrivermodal.module.css';

type AssignModalProps = {
  isOpen: boolean;
  close: () => void;
  setDriver: (driverName: string) => void; 
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
  setDriver, 
  ride,
  allDrivers,
}: AssignModalProps) => {
  const [open, setIsOpen] = useState(isOpen);
  const { withDefaults } = useReq();
  // source: https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
          setIsOpen(false);
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
      body: JSON.stringify({ "driver": driver, 
                              "type": "active"}),
    }),
  );
  setDriver(driver.firstName); 
  close(); 
  setIsOpen(false);
}
  useOutsideAlerter(wrapperRef);

  return (
    <>
      {isOpen && open && (
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
