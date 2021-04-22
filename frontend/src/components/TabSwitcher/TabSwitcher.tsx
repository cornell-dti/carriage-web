import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import styles from './tabSwitcher.module.css';
import Notification from '../Notification/Notification';
import pageStyles from '../../pages/Dashboard/page.module.css';

// Adapted from here: https://codepen.io/piotr-modes/pen/ErqdxE

type TabProps = {
  label: string;
  children: React.ReactNode;
}

export const Tab = ({ children }: TabProps) => <>{children}</>;

type TabSwitcherProps = {
  children: JSX.Element[];
}

const TabSwitcher = ({ children }: TabSwitcherProps) => {
  const [tabLabels, setTabLabels] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState(children[0].props.label);
  const [currentContent, setCurrentContent] = useState(children[0].props.children);

  useEffect(() => {
    const labels = children.map((child) => child.props.label);
    setTabLabels(labels);
  }, [children]);

  const switchTab = (tab: string): void => {
    setCurrentTab(tab);
    children.forEach((child) => {
      if (child.props.label === tab) {
        setCurrentContent(child.props.children);
      }
    });
  };

  return (
    <div>
      <div className={pageStyles.pageTitle}>
        <div>
          <div>
            {tabLabels.map((tabLabel) => (
              <button
                key={tabLabel}
                className={cn(styles.tab, { [styles.current]: tabLabel === currentTab })}
                onClick={() => switchTab(tabLabel)}
              >
                {tabLabel}
              </button>
            ))}
          </div>
          <span className={styles.underline} />
        </div>
        <div className={styles.rightSection}>
          <Notification />
        </div>
      </div>
      <div className={pageStyles.pageContainer}>{currentContent}</div>
    </div >
  );
};

export default TabSwitcher;
