import React, { useState, useEffect } from 'react';
import { useId } from '@react-aria/utils';
import moment from 'moment';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { notificationBadge, notificationBell } from '../../icons/other';
import { RideType } from '@carriage-web/shared/types/ride';

type Message = {
  time: Date;
  title: string;
  body: string;
};

type NotificationData = {
  title: string;
  body: string;
  ride: RideType;
  sentTime: string;
};

const truncate = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return `${str.slice(0, num)}...`;
};

const Notification = () => {
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notify, setNotify] = useState(false);
  const popupId = useId();
  const [isNotifOpen, setIsNotifOpen] = useState(true);

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { body, ride, sentTime, title }: NotificationData = event.data;
      const newMsg = {
        time: new Date(sentTime),
        title,
        body,
        day: ride.startTime,
      };
      setNewMessages([newMsg, ...newMessages]);
      setNotify(true);
    });
  }, []);

  const mapMessages = (msgs: Message[]) =>
    msgs.map(({ time, title, body }, i) => (
      <div key={i} className="p-2.5 text-xs flex">
        <div className="pr-2">
          <div className="w-8 h-8 bg-pink-300 text-center rounded-full">
            <span className="relative top-1.5 text-xs leading-3 text-white font-bold">
              C
            </span>
          </div>
        </div>
        <div className="grow">
          <p className="text-[10px] text-gray-400">
            {moment(time).format('MMMM Do')}
          </p>
          <p>{body}</p>
        </div>
        <div className="text-[10px] text-[#0084f4]">View</div>
      </div>
    ));

  useEffect(() => {
    const element = document.getElementById(popupId);
    element?.removeAttribute('aria-describedby');
  }, []);

  return (
    <Popup
      trigger={
        <button
          id={popupId}
          aria-expanded={isNotifOpen}
          className="bg-transparent border-0 cursor-pointer relative focus:[outline:3px_solid_black]"
        >
          <img src={notificationBell} alt="Notifications" />
          {notify && (
            <img
              src={notificationBadge}
              className="w-11 h-11"
              alt="notification badge"
            />
          )}
        </button>
      }
      onOpen={() => {
        setIsNotifOpen(true);
      }}
      onClose={() => {
        setMessages([...newMessages, ...messages]);
        setNewMessages([]);
        setNotify(false);
        setIsNotifOpen(false);
      }}
      position={['bottom right']}
      contentStyle={{
        margin: '10px',
        width: '333px',
      }}
    >
      <div>
        {newMessages.length === 0 || (
          <h6 className="m-0 px-2.5 py-1.25 text-sm text-[#666666] font-normal border-b border-[#d6d6d6]">
            You have {newMessages.length} new message
            {newMessages.length === 1 || 's'}
          </h6>
        )}
        {newMessages.length === 0 || mapMessages(newMessages)}
        <h6 className="m-0 px-2.5 pt-2.5 pb-0 text-sm">Message History</h6>
        {mapMessages(messages)}
      </div>
    </Popup>
  );
};

export default Notification;
