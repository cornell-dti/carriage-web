import React, { useState } from 'react';
import cn from 'classnames';
import styles from './tabSwitcher.module.css';
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
  renderRight: () => React.ReactNode;
}

const TabSwitcher = ({ labels, children, renderRight }: TabSwitcherProps) => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <main id = "main">
      <div className={pageStyles.pageTitle}>
        <div>
          <div>
            {labels.map((label, idx) => (
              <h1 key={label} className={styles.tabHeading}>
              <button
                className={cn(styles.tab, { [styles.current]: currentTab === idx })}
                onClick={() => setCurrentTab(idx)}
              >
                {label}
              </button>
              </h1>
            ))}
          </div>
          <span className={styles.underline} />
        </div>
        <div className={styles.rightSection}>
          {renderRight()}
        </div>
      </div>
      <div className={pageStyles.pageContainer}>{children[currentTab]}</div>
    </main>
  );
};

export default TabSwitcher;
