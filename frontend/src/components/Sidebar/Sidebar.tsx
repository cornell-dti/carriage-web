import React, { useState, FunctionComponent, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
import { GoogleLogout } from 'react-google-login';
import { home, drivers, riders, settings, locations, analytics, blank } from '../../icons/sidebar/index';
import AuthContext from '../../context/auth';
import ReqContext from '../../context/req';
import useClientId from '../../hooks/useClientId';
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
    const { id } = authContext;
    fetch(`/api/admins/${id}`, reqContext.withDefaults())
      .then((res) => res.json())
      .then((data) => setProfile(data.photoLink));
  }, [authContext, authContext.id, reqContext]);

  const menuItems: MenuItem[] = [
    { icon: home, caption: 'Home', path: '/home' },
    { icon: drivers, caption: 'Employees', path: '/employees' },
    { icon: riders, caption: 'Students', path: '/riders' },
    { icon: locations, caption: 'Locations', path: '/locations' },
    { icon: analytics, caption: 'Analytics', path: '/analytics' },
    { icon: settings, caption: 'Settings', path: '/settings' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        {menuItems.map(({ path, icon, caption }) => (
          <div key={path} className={styles.sidebarLinks}>
            <Link key={path} onClick={() => setSelected(path)}
              className={styles.icon} to={path}>
              <div className={
                path === selected
                  ? cn(styles.selected, styles.circle)
                  : styles.circle
              }>
                <img alt={caption} src={icon} />
              </div>
              <div className={styles.caption}>{caption}</div>
            </Link>
          </div>
        ))}
        <div className={styles.logout}>
          <img alt="profile_picture" className={styles.profile}
            src={profile === '' || !profile ? blank : `https://${profile}`} />
          <GoogleLogout
            onLogoutSuccess={authContext.logout}
            clientId={useClientId()}
            render={(renderProps) => (
              <div
                onClick={renderProps.onClick}
              >
                Log out
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
