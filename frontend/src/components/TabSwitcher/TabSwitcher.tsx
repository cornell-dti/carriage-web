import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { useDate } from '../../context/date';
import { useEmployees } from '../../context/EmployeesContext';
import { Driver } from '../../types/index';
import styles from './tabSwitcher.module.css';
import Notification from '../Notification/Notification';
import pageStyles from '../../pages/Admin/page.module.css';
import ExportButton from '../../components/ExportButton/ExportButton';

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

  const { curDate } = useDate();
  const today = moment(curDate).format('YYYY-MM-DD');
  const { drivers } = useEmployees();

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

  const generateCols = () => {
    const cols = 'Date,Daily Total,Daily Ride Count,Day No Shows,Day Cancels, \
    Night Ride Count, Night No Shows, Night Cancels';

    const driverNamesReducer = (acc: string, curr: Driver) => 
    `${acc},${curr.firstName} ${curr.lastName.substring(0, 1)}.`

    const finalCols = drivers
    .sort((a, b) => (
      `${a.firstName} ${a.lastName}` < `${b.firstName} ${b.lastName}` ? -1 : 1
    ))
    .reduce(driverNamesReducer, cols);

     return finalCols;
  }

  return (
    <div>
      <div className={pageStyles.pageTitle}>
        <div>
          <div>
            {tabLabels.map((tabLabel) => (
              <h1
                key={tabLabel}
                className={cn(styles.tab, { [styles.current]: tabLabel === currentTab })}
                onClick={() => switchTab(tabLabel)}
              >
                {tabLabel}
              </h1>
            ))}
          </div>
          <span className={styles.underline} />
        </div>
        <div className={styles.rightSection}>
          {/* TODO: implement the backend and change the endpoint */}
          <ExportButton 
            toastMsg={`${today} data has been downloaded.`}
            endpoint={`/api/rides/download?date=${today}`} 
            csvCols={generateCols()}
            filename={`${currentTab} ${today}.csv`} 
          />
          <Notification />
        </div>
      </div>
      <div className={pageStyles.pageContainer}>{currentContent}</div>
    </div >
  );
};

export default TabSwitcher;
