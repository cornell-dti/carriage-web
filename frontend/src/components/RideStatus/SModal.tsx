import React, { useRef, useEffect, useState } from 'react';
import moment from 'moment';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import Tag from '../Tag/Tag';
import { RideType } from '@carriage-web/shared/types/ride';
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
        <div className="fixed left-1/2 top-1/2 w-92.5 min-h-85 -ml-22.25 -translate-y-1/2 z-1000" ref={wrapperRef}>
          <div className="relative p-6.25 bg-white rounded-[5px] shadow-[0_0.5rem_1.5rem_0_rgba(0,0,0,0.2)] text-xs">
            <div className="absolute top-3.75 right-3.75 inline">
              <button
                className="cursor-pointer bg-none border-none h-4 w-4 pb-[0.1rem] mr-[0.7rem] focus:outline-none"
                onClick={() => setDeleteOpen(true)}
              >
                <img src={trash} alt="trash" />
              </button>
              <button className="cursor-pointer bg-none border-none h-4 w-4 focus:outline-none" onClick={close}>
                <img src={x} alt="close" />
              </button>
            </div>
            <h3 className="m-0 mb-4 font-normal text-base">
              {ride.riders && ride.riders.length > 0
                ? ride.riders.length === 1
                  ? `${ride.riders[0].firstName} ${ride.riders[0].lastName}`
                  : `${ride.riders[0].firstName} ${ride.riders[0].lastName} +${
                      ride.riders.length - 1
                    } more`
                : 'No rider assigned'}
            </h3>
            <p>Status Updates</p>
            <div className="mt-4">
              <ProgressBar status={ride.status} late={false} />
            </div>
            <div className="flex">
              <div className="leading-8 w-38.75 p-1.25">
                <p>{moment(new Date(ride.startTime)).format('h:mm a')}</p>
                <div className="p-1.25 bg-[#f9f9f9] rounded-[5px]">
                  <Tag location="" tag={ride.startLocation.tag} />
                  <p className="leading-[1.6]">
                    {ride.startLocation.name}
                  </p>
                </div>
              </div>
              <div className="flex-[40px] flex justify-center items-center">
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
              <div className="leading-8 w-38.75 p-1.25">
                <p>{moment(new Date(ride.endTime)).format('h:mm a')}</p>
                <div className="p-1.25 bg-[#f9f9f9] rounded-[5px]">
                  <Tag location="" tag={ride.endLocation.tag} />
                  <p className="leading-[1.6]">{ride.endLocation.name}</p>
                </div>
              </div>
            </div>

            <div className="w-80">
              <hr className="border-t border-[#a5a5a5] rounded-[1px] my-4" />
              <div className="flex">
                <div className="w-7.5">
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
