import React, { useRef, useEffect } from 'react';
import moment from 'moment';
import cn from 'classnames';
import { Ride } from '../../types';
import styles from './smodal.module.css';
import ProgressBar from './ProgressBar';

type SModalProps = {
  isOpen: boolean;
  close: () => void;
  ride: Ride | undefined
};

const SModal = ({
  isOpen,
  close,
  ride,
}: SModalProps) => {
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
  useOutsideAlerter(wrapperRef);

  return (
    <div>
      {isOpen && ride && (
        <div className={styles.modal} ref={wrapperRef}>
          <div className={styles.body}>
            <button className={styles.close} onClick={close}>✕</button>
            <h3 className={styles.title}>
              {`${ride.rider.firstName} ${ride.rider.lastName}`}
            </h3>
            <p>Status Updates</p>
            <div className={styles.bar}>
              <ProgressBar status={ride.status} late={ride.late} />
            </div>
            <div className={styles.row}>
              <div className={styles.column}>
                <p>{moment(new Date(ride.startTime)).format('h:mm a')}</p>
                <div className={styles.location}>
                  <span className={cn(styles.tag, styles[ride.startLocation.tag || ''])}>{ride.startLocation.tag}</span>
                  <p>{ride.startLocation.name}</p>
                </div></div>
              <div className={styles.center}><svg width="28" height="8" viewBox="0 0 28 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect opacity="0.6" y="1" width="6" height="6" rx="3" fill="#333333" />
                <rect x="21" y="1" width="6" height="6" rx="3" stroke="black" strokeOpacity="0.4" />
                <line x1="5.75" y1="4" x2="20.75" y2="4" stroke="black" strokeOpacity="0.4" />
              </svg>
              </div>
              <div className={styles.column}>
                <p>{moment(new Date(ride.endTime)).format('h:mm a')}</p>
                <div className={styles.location}>
                  <span className={cn(styles.tag, styles[ride.endLocation.tag || ''])}>{ride.endLocation.tag}</span>
                  <p>{ride.endLocation.name}</p></div>
              </div>
            </div>

            <div className={styles.footer}>
              <hr className={styles.divider} />
              <p><svg width="24" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="12" height="12" rx="6" fill="black" fillOpacity="0.12" />
              </svg>
                {ride.rider.accessibilityNeeds ? ride.rider.accessibilityNeeds.join(', ')
                  : 'No accessibility needs'}</p>
            </div>
          </div></div>
      )}
    </div>
  );
};

export default SModal;
