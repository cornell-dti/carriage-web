import React, { useState, FunctionComponent, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
import { home, drivers, riders, settings, locations } from '../../icons/sidebar/index';
import AuthContext from '../../context/auth';
import ReqContext from '../../context/req';
import { GoogleLogout } from 'react-google-login';
import useClientId from '../../hooks/useClientId'
import styles from './sidebar.module.css';

type MenuItem = {
  icon: string,
  caption: string,
  path: string
}

const Sidebar: FunctionComponent = ({ children }) => {
  const { pathname } = useLocation();
  const [selected, setSelected] = useState(pathname);
  const [profile, setProfile] = useState('');
  const authContext = useContext(AuthContext);
  const reqContext = useContext(ReqContext);

  useEffect(() => {
    const id = authContext.id;
    fetch(`/api/admins/${id}`, reqContext.withDefaults())
      .then((res) => res.json())
      .then((data) => setProfile(data.photoLink));
  }, []);

  const menuItems: MenuItem[] = [
    { icon: home, caption: 'Home', path: '/home' },
    { icon: drivers, caption: 'Employees', path: '/drivers' },
    { icon: riders, caption: 'Students', path: '/riders' },
    { icon: locations, caption: 'Locations', path: '/locations' },
    { icon: settings, caption: 'Settings', path: '/settings' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        {menuItems.map(({ path, icon, caption }) => (
          <Link key={path} className={styles.sidebarLinks} to={path}>
            <div onClick={() => setSelected(path)} className={styles.icon}>
              <div className={
                path === selected
                  ? cn(styles.selected, styles.circle)
                  : styles.circle
              }>
                <img alt={caption} src={icon} />
              </div>
              <div className={styles.caption}>{caption}</div>
            </div>
          </Link>
        ))}
        <div className={styles.logout}>
          <img alt="profile_picture" src={`https://${profile}`} />
          <GoogleLogout
            onLogoutSuccess={authContext.logout}
            clientId={useClientId()}
            render={renderProps => (
              <div
                onClick={renderProps.onClick}
              >
                Logout
              </div>
            )} />
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div >
  );
};

export default Sidebar;
