import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
import {
  home,
  drivers,
  riders,
  locations,
  analytics,
  settings,
  blank,
  car,
} from '../../icons/sidebar/index';
import AuthContext from '../../context/auth';
import useClientId from '../../hooks/useClientId';
import Footer from '../Footer/Footer';
import axios from '../../util/axios';

type SidebarProps = {
  type: 'admin' | 'rider' | 'driver';
  children: React.ReactNode;
};

type MenuItem = {
  icon: string;
  caption: string;
  path: string;
};

const Sidebar = ({ type, children }: SidebarProps) => {
  const componentMounted = useRef(true);
  const { pathname } = useLocation();
  const [selected, setSelected] = useState(pathname);
  const [photoLink, setPhotoLink] = useState('');
  const authContext = useContext(AuthContext);
  const localUserType = localStorage.getItem('userType');
  const isAdmin = localUserType === 'Admin';
  const isDriver = localUserType === 'Driver';

  useEffect(() => {
    const { id } = authContext;
    if (isAdmin) {
      axios
        .get(`/api/admins/${id}`)
        .then((res: any) => res.data)
        .then((data: any) => {
          if (componentMounted) {
            setPhotoLink(data.data.photoLink);
          }
        });

      return () => {
        componentMounted.current = false;
      };
    } else if (isDriver) {
      axios
        .get(`/api/drivers/${id}`)
        .then((res) => res.data)
        .then(
          (data) =>
            componentMounted.current && setPhotoLink(data.data.photoLink)
        );

      return () => {
        componentMounted.current = false;
      };
    } else {
      // Rider
      axios
        //riders dont have photo upload, only admin and drivers but maybe the intention was for all three?
        .get(`/api/riders/${id}`)
        .then((res) => res.data)
        .then((data) => {
          if (componentMounted.current) {
            setPhotoLink(data.data.photoLink);
          }
        });

      return () => {
        componentMounted.current = false;
      };
    }
  }, [authContext, authContext.id, isAdmin, isDriver]);

  const adminMenu: MenuItem[] = [
    { icon: home, caption: 'Home', path: 'home' },
    { icon: drivers, caption: 'Employees', path: 'employees' },
    { icon: riders, caption: 'Students', path: 'riders' },
    { icon: locations, caption: 'Locations', path: 'locations' },
    { icon: analytics, caption: 'Analytics', path: 'analytics' },
  ];

  const riderMenu: MenuItem[] = [
    { icon: home, caption: 'Schedule', path: 'schedule' },
    { icon: settings, caption: 'Settings', path: 'settings' },
  ];

  const driverMenu: MenuItem[] = [
    { icon: car, caption: 'Rides', path: 'rides' },
    { icon: analytics, caption: 'Reports', path: 'reports' },
    { icon: settings, caption: 'Settings', path: 'settings' },
  ];

  let menuItems;
  if (type === 'admin') {
    menuItems = adminMenu;
  } else if (type === 'driver') {
    menuItems = driverMenu;
  } else {
    // rider
    menuItems = riderMenu;
  }

  return (
    <div className="flex w-full flex-row h-full min-h-screen items-stretch">
      <nav className="flex bg-white w-24 min-h-screen fixed border-r border-gray-300 justify-between flex-col z-100 py-7 shadow-[0px_5px_32px_-7px_rgba(0,0,0,0.05)] max-md:h-24 max-md:min-w-full max-md:w-full max-md:min-h-24 max-md:flex-row max-md:py-0 max-md:px-7 max-md:overflow-x-auto max-md:overflow-y-hidden">
        <div className="flex flex-col max-md:flex-row max-md:flex-nowrap max-md:items-center">
          {menuItems.map(({ path, icon, caption }) => (
            <div key={path} className="no-underline text-center mb-7 max-md:mb-0 max-md:mr-7 flex flex-col justify-center">
              <div className="text-black font-semibold text-sm" id={path}>
                <Link
                  key={path}
                  onClick={() => setSelected(path)}
                  className="cursor-pointer no-underline flex flex-col items-center"
                  to={path}
                  aria-labelledby={path}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex justify-center items-center',
                      path === selected
                        ? 'bg-black'
                        : 'bg-gray-200 hover:bg-gray-300'
                    )}
                  >
                    <img
                      alt={`Go to ${caption}`}
                      src={icon}
                      className={cn('w-1/2', path === selected && 'invert')}
                    />
                  </div>
                </Link>
                {caption}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center drop-shadow-[0px_4px_12px_rgba(0,0,0,0.12)] flex flex-col justify-center items-center max-md:w-auto max-md:margin-0 max-md:mr-7 max-md:shrink-0">
          {/* {(isAdmin || isDriver) && (
            <img
              alt="profile_picture"
              className="w-10 h-10 rounded-full"
              src={photoLink ? `${photoLink}?t=${new Date().getTime()}` : blank}
            />
          )} */}
          <button
            className="cursor-pointer font-semibold text-sm no-underline text-blue-700 text-center block mx-auto bg-transparent border-none focus:outline-blue-600 focus:outline-[3px] max-md:mt-1"
            onClick={authContext.logout}
          >
            Log out
          </button>
        </div>
      </nav>
      <div className="flex flex-col w-[calc(100%-6rem)] min-h-screen ml-24 p-0 max-md:w-full max-md:ml-0 max-md:mt-24">
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Sidebar;
