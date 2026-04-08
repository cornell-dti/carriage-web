import React, { useState, useEffect } from 'react';
import { useId } from '@react-aria/utils';
import moment from 'moment';
import Popup from 'reactjs-popup';
import cn from 'classnames';
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
      <div key={i} className="py-3 px-4 border-b border-gray-200 flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">C</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium">{moment(time).format('MMMM Do')}</p>
          <p className="text-sm">{body}</p>
        </div>
        <div className="text-blue-600 text-sm cursor-pointer hover:underline">View</div>
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
          className="relative p-2 hover:bg-gray-100 rounded-lg"
        >
          <img src={notificationBell} alt="Notifications" />
          {notify && (
            <img
              src={notificationBadge}
              className="absolute top-0 right-0 w-5 h-5"
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
      <div className="bg-white rounded-lg shadow-lg">
        {newMessages.length === 0 || (
          <h6 className={cn('py-2 px-4 font-semibold text-sm border-b border-gray-200')}>
            You have {newMessages.length} new message
            {newMessages.length === 1 || 's'}
          </h6>
        )}
        {newMessages.length === 0 || mapMessages(newMessages)}
        <h6 className="py-2 px-4 font-semibold text-sm border-t border-gray-200">Message History</h6>
        {mapMessages(messages)}
      </div>
    </Popup>
  );
};

export default Notification;
