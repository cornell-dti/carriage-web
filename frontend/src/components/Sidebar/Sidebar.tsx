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
import styles from './sidebar.module.css';
import Footer from '../Footer/Footer';
import axios from '../../util/axios';

type SidebarProps = {
  type: 'admin' | 'rider';
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
  const [profile, setProfile] = useState('');
  const authContext = useContext(AuthContext);
  const localUserType = localStorage.getItem('userType');
  const isAdmin = localUserType === 'Admin';

  useEffect(() => {
    const { id } = authContext;
    if (isAdmin) {
      axios
        .get(`/api/admins/${id}`)
        .then((res) => res.data)
        .then(
          (data) => componentMounted.current && setProfile(data.data.photoLink)
        );

      return () => {
        componentMounted.current = false;
      };
    } else {
      axios
        .get(`/api/riders/${id}`)
        .then((res) => res.data)
        .then(
          (data) => componentMounted.current && setProfile(data.data.photoLink)
        );

      return () => {
        componentMounted.current = false;
      };
    }
  }, [authContext, authContext.id]);

  const adminMenu: MenuItem[] = [
    { icon: home, caption: 'Home', path: 'home' },
    { icon: home, caption: 'Scheduled', path: 'scheduled' },
    { icon: drivers, caption: 'Employees', path: 'employees' },
    { icon: riders, caption: 'Students', path: 'riders' },
    { icon: locations, caption: 'Locations', path: 'locations' },
    // { icon: analytics, caption: 'Analytics', path: 'analytics' },
    { icon: car, caption: 'Rides', path: 'rides' },
  ];

  const riderMenu: MenuItem[] = [
    { icon: home, caption: 'Schedule', path: 'schedule' },
    { icon: settings, caption: 'Settings', path: 'settings' },
  ];

  const menuItems = type === 'admin' ? adminMenu : riderMenu;

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <div className={styles.menuItems}>
          {menuItems.map(({ path, icon, caption }) => (
            <div key={path} className={styles.sidebarLinks}>
              <div className={styles.caption} id={path}>
                <Link
                  key={path}
                  onClick={() => setSelected(path)}
                  className={styles.icon}
                  to={path}
                  aria-labelledby={path}
                >
                  <div
                    className={
                      path === selected
                        ? cn(styles.selected, styles.circle)
                        : styles.circle
                    }
                  >
                    <img alt={`Go to ${caption}`} src={icon} />
                  </div>
                </Link>
                {caption}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.logout}>
          {isAdmin && (
            <img
              alt="profile_picture"
              className={styles.profile}
              src={profile === '' || !profile ? blank : `${profile}`}
            />
          )}
          {/* Remove the profile condition */}
          <button className={styles.logoutLink} onClick={authContext.logout}>
            Log out
          </button>
        </div>
      </nav>
      <div className={styles.content}>
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Sidebar;
