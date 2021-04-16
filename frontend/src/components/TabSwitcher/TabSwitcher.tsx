import React, { useState, useEffect } from 'react';
import styles from './tabSwitcher.module.css';
import Notification from '../Notification/Notification';
import pageStyles from '../../pages/Dashboard/page.module.css';

// Adapted from here: https://codepen.io/piotr-modes/pen/ErqdxE

type TabSwitcherProps = {
  children: JSX.Element[];
}

const TabSwitcher = ({
  children
}: TabSwitcherProps) => {
  const [tabLabels, setTabLabels] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState(children[0].props.label);
  const [currentContent, setCurrentContent] = useState(children[0].props.children);

  const getLabels = () => {
    let labels = children.map(child => child.props.label);
    setTabLabels(labels);
  };

  useEffect(() => {
    getLabels();
  }, []);

  const switchTab = (tab: string): void => {
    setCurrentTab(tab);
    children.forEach(child => {
      if (child.props.label === tab) {
        setCurrentContent(child.props.children);
      }
    });
  }

  return (
    <div>
      <div className={pageStyles.pageTitle}>
        <div>
          {tabLabels.map(tabLabel =>{
            return (
              <h1 
                key={tabLabel}
                className={tabLabel === currentTab 
                  ? `${styles.tab} ${styles.current}`: styles.tab} 
                onClick={()=>switchTab(tabLabel)}>
                {tabLabel}
              </h1>
            )
          })}
        </div>

        <div className={styles.rightSection}>
          <Notification />
        </div>
      </div>

      <div className={pageStyles.pageContainer}>{currentContent}</div>

    </div>
  );
};

export default TabSwitcher;
