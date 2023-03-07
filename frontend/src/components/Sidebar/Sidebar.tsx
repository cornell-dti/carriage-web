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
} from '../../icons/sidebar/index';
import AuthContext from '../../context/auth';
import ReqContext from '../../context/req';
import useClientId from '../../hooks/useClientId';
import styles from './sidebar.module.css';
import Footer from '../Footer/Footer';

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
  const reqContext = useContext(ReqContext);
  const localUserType = localStorage.getItem('userType');
  const isAdmin = localUserType === 'Admin';

  useEffect(() => {
    const { id } = authContext;
    if (isAdmin) {
      fetch(`/api/admins/${id}`, reqContext.withDefaults())
        .then((res) => res.json())
        .then(
          (data) => componentMounted.current && setProfile(data.data.photoLink)
        );

      return () => {
        componentMounted.current = false;
      };
    } else {
      fetch(`/api/riders/${id}`, reqContext.withDefaults())
        .then((res) => res.json())
        .then(
          (data) => componentMounted.current && setProfile(data.data.photoLink)
        );

      return () => {
        componentMounted.current = false;
      };
    }
  }, [authContext, authContext.id, reqContext]);

  const adminMenu: MenuItem[] = [
    { icon: home, caption: 'Home', path: '/home' },
    { icon: drivers, caption: 'Employees', path: '/employees' },
    { icon: riders, caption: 'Students', path: '/riders' },
    { icon: locations, caption: 'Locations', path: '/locations' },
    { icon: analytics, caption: 'Analytics', path: '/analytics' },
  ];

  const riderMenu: MenuItem[] = [
    { icon: home, caption: 'Schedule', path: '/schedule' },
    { icon: settings, caption: 'Settings', path: '/settings' },
  ];

  const menuItems = type === 'admin' ? adminMenu : riderMenu;

  const clientId = useClientId();

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <div className={styles.menuItems}>
          {menuItems.map(({ path, icon, caption }) => (
            <div key={path} className={styles.sidebarLinks}>
              <p className={styles.caption}>
                <Link
                  key={path}
                  onClick={() => setSelected(path)}
                  className={styles.icon}
                  to={path}
                >
                  <div
                    className={
                      path === selected
                        ? cn(styles.selected, styles.circle)
                        : styles.circle
                    }
                  >
                    <a
                      href={path}
                      aria-current={path === selected ? 'page' : undefined}
                    ></a>
                    <img alt={''} src={icon} />
                  </div>
                </Link>
                {caption}
              </p>
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
          {profile !== '' && (
            <button className={styles.logoutLink} onClick={authContext.logout}>
              Log out
            </button>
          )}
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
