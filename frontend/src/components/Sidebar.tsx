import React, { useState, FunctionComponent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

import home from '../menu/home.png'
import drivers from '../menu/drivers.png'
import riders from '../menu/riders.png'
import settings from '../menu/settings.png'

interface MenuItem {
  icon: string,
  caption: string,
  path: string
}

const Sidebar: FunctionComponent = ({ children }) => {
  const { pathname } = useLocation();
  const [selected, setSelected] = useState(pathname);

  const menuItems: MenuItem[] = [{ icon: home, caption: "Home", path: "/home" },
  { icon: drivers, caption: "Drivers", path: "/drivers" },
  { icon: riders, caption: "Riders", path: "/riders" },
  { icon: settings, caption: "Settings", path: "/settings" }];

  return (
    <div className="container">
      <div className="sidebar">
        {menuItems.map(item => (
          <Link key={item.path} className="sidebar-links" to={item.path}>
            <div onClick={() => setSelected(item.path)} className="icon">
              <div className={item.path === selected ? "selected circle" : "circle"}>
                <img alt={item.caption} src={item.icon} />
              </div>
              <div className="caption">{item.caption}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  )
}

export default Sidebar;