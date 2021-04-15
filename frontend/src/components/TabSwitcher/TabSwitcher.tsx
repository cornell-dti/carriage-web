import React, { useState, useEffect } from 'react';
import styles from './tabSwitcher.module.css';

type TabSwitcherProps = {
  children: JSX.Element[];
}

const TabSwitcher = ({
  children
}: TabSwitcherProps) => {
  const [tabLabels, setTabLabels] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('Driver Data');
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
      <div>
        {tabLabels.map(tabLabel =>{
          return (
            <div 
              key={tabLabel}
              className={tabLabel === currentTab 
                ? `${styles.tab} ${styles.current}`: styles.tab} 
              onClick={()=>switchTab(tabLabel)}>
              {tabLabel}
            </div>
          )
        })}
      </div>

      <div className="tab-content">{currentContent}</div>

    </div>
  );
};

export default TabSwitcher;
