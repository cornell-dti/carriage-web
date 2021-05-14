import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import styles from './tabSwitcher.module.css';
import Notification from '../Notification/Notification';
import pageStyles from '../../pages/Admin/page.module.css';

// Adapted from here: https://codepen.io/piotr-modes/pen/ErqdxE

type TabProps = {
  label: string;
  children: React.ReactNode;
}

export const Tab = ({ children }: TabProps) => <>{children}</>;

type TabSwitcherProps = {
  labels: string[];
  children: JSX.Element[];
}

const TabSwitcher = ({ labels, children }: TabSwitcherProps) => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <>
      <div className={pageStyles.pageTitle}>
        <div>
          <div>
            {labels.map((label, i) => (
              <h1
                key={label}
                className={cn(styles.tab, { [styles.current]: currentTab === i })}
                onClick={() => setCurrentTab(i)}
              >
                {label}
              </h1>
            ))}
          </div>
          <span className={styles.underline} />
        </div>
        <div className={styles.rightSection}>
          <Notification />
        </div>
      </div>
      <div className={pageStyles.pageContainer}>{children[currentTab]}</div>
    </>
  );
};

export default TabSwitcher;
