import React, { useState, FunctionComponent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
import { home, drivers, riders, settings, locations } from '../../icons/sidebar/index';
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
    { icon: drivers, caption: 'Employees', path: '/drivers' },
    { icon: riders, caption: 'Students', path: '/riders' },
    { icon: locations, caption: 'Locations', path: '/locations' },
    { icon: settings, caption: 'Settings', path: '/settings' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        {menuItems.map(({ path, icon, caption }) => (
          <div className={styles.sidebarLinks}>
            <Link key={path} onClick={() => setSelected(path)} className={styles.icon} to={path}>
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
      </div>

      <div className={styles.content}>
        {children}
      </div>
    </div >
  );
};

export default Sidebar;
