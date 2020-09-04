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

  const menuItems: MenuItem[] = [{ icon: home, caption: "Home", path: "/home" },
  { icon: drivers, caption: "Drivers", path: "/drivers" },
  { icon: riders, caption: "Riders", path: "/riders" },
  { icon: settings, caption: "Settings", path: "/settings" }];

  const [selected, setSelected] = useState(menuItems.findIndex((item) => item.path === pathname));

  return (
    <div className="container">
      <div>
        <div className="sidebar">
          {menuItems.map((item, index) => (
            <Link key={item.path} className="sidebar-links" to={item.path}>
              <div onClick={() => setSelected(index)} className="icon">
                <div className={index === selected ? "selected circle" : "circle"}>
                  <img src={item.icon} />
                </div>
                <div className="caption">{item.caption}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  )
}

export default Sidebar;