import React, { useState, FunctionComponent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
import { home, drivers, riders, settings, locations } from './icons';
import styles from './sidebar.module.css';

type MenuItem = {
  icon: string,
  caption: string,
  path: string
}

const Sidebar: FunctionComponent = ({ children }) => {
  const { pathname } = useLocation();
  const [selected, setSelected] = useState(pathname);

  const menuItems: MenuItem[] = [
    { icon: home, caption: 'Home', path: '/home' },
    { icon: drivers, caption: 'Drivers', path: '/drivers' },
    { icon: riders, caption: 'Riders', path: '/riders' },
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
      </div>

      <div className={styles.content}>
        {children}
      </div>
    </div >
  );
};

export default Sidebar;
