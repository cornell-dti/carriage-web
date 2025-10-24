import React, { useRef, useEffect, useState } from 'react';
import moment from 'moment';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import Tag from '../Tag/Tag';
import { RideType } from '@shared/types/ride';
import styles from './smodal.module.css';
import ProgressBar from './ProgressBar';
import { trash, x } from '../../icons/other/index';

type SModalProps = {
  isOpen: boolean;
  close: () => void;
  ride: RideType;
  cancel: (ride: RideType) => void;
};

const SModal = ({ isOpen, close, ride, cancel }: SModalProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    <>
      <DeleteOrEditTypeModal
        open={deleteOpen}
        ride={ride}
        deleting={true}
        onClose={() => setDeleteOpen(false)}
      />
      {isOpen && (
        <div className={styles.modal} ref={wrapperRef}>
          <div className={styles.body}>
            <div className={styles.modalOptions}>
              <button
                className={styles.cancel}
                onClick={() => setDeleteOpen(true)}
              >
                <img src={trash} alt="trash" />
              </button>
              <button className={styles.close} onClick={close}>
                <img src={x} alt="close" />
              </button>
            </div>
            <h3 className={styles.title}>
              {ride.riders && ride.riders.length > 0
                ? ride.riders.length === 1
                  ? `${ride.riders[0].firstName} ${ride.riders[0].lastName}`
                  : `${ride.riders[0].firstName} ${ride.riders[0].lastName} +${
                      ride.riders.length - 1
                    } more`
                : 'No rider assigned'}
            </h3>
            <p>Status Updates</p>
            <div className={styles.bar}>
              <ProgressBar status={ride.status} late={false} />
            </div>
            <div className={styles.row}>
              <div className={styles.column}>
                <p>{moment(new Date(ride.startTime)).format('h:mm a')}</p>
                <div className={styles.location}>
                  <Tag location="" tag={ride.startLocation.tag} />
                  <p className={styles.locationName}>
                    {ride.startLocation.name}
                  </p>
                </div>
              </div>
              <div className={styles.center}>
                <svg
                  width="28"
                  height="8"
                  viewBox="0 0 28 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    opacity="0.6"
                    y="1"
                    width="6"
                    height="6"
                    rx="3"
                    fill="#333333"
                  />
                  <rect
                    x="21"
                    y="1"
                    width="6"
                    height="6"
                    rx="3"
                    stroke="black"
                    strokeOpacity="0.4"
                  />
                  <line
                    x1="5.75"
                    y1="4"
                    x2="20.75"
                    y2="4"
                    stroke="black"
                    strokeOpacity="0.4"
                  />
                </svg>
              </div>
              <div className={styles.column}>
                <p>{moment(new Date(ride.endTime)).format('h:mm a')}</p>
                <div className={styles.location}>
                  <Tag location="" tag={ride.endLocation.tag} />
                  <p className={styles.locationName}>{ride.endLocation.name}</p>
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <hr className={styles.divider} />
              <div className={styles.row}>
                <div className={styles.column2}>
                  <svg
                    width="24"
                    height="1em"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="12"
                      height="12"
                      rx="6"
                      fill="black"
                      fillOpacity="0.12"
                    />
                  </svg>
                </div>
                <div>
                  {(() => {
                    if (!ride.riders || ride.riders.length === 0)
                      return 'No accessibility needs';
                    const allNeeds = ride.riders
                      .filter(
                        (rider) =>
                          rider.accessibility && rider.accessibility.length > 0
                      )
                      .flatMap((rider) => rider.accessibility)
                      .filter(
                        (need, index, arr) => arr.indexOf(need) === index
                      );
                    return allNeeds.length > 0
                      ? allNeeds.join(', ')
                      : 'No accessibility needs';
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SModal;
