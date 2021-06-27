import React, { useEffect, useReducer, useState } from 'react';
import moment from 'moment';
import { useReq } from '../../context/req';
import AnalyticsTable from '../../components/AnalyticsTable/AnalyticsTable';
import TabSwitcher from '../../components/TabSwitcher/TabSwitcher';
import { useEmployees } from '../../context/EmployeesContext';
import { Driver, TableData } from '../../types';
import ExportButton from '../../components/ExportButton/ExportButton';
import Notification from '../../components/Notification/Notification';
import DateFilter from '../../components/AnalyticsTable/DateFilter';
import AnalyticsOverview from '../../components/AnalyticsOverview/AnalyticsOverview';

type DateState = {
  from: string;
  to: string;
}

export type Action = {
  type: 'startDate' | 'endDate';
  value: string;
}

const Analytics = () => {
  const [analyticsData, setData] = useState<TableData[]>([]);
  const { withDefaults } = useReq();
  const { drivers } = useEmployees();
  const today = moment();

  const initState: DateState = {
    from: today.format('YYYY-MM-DD'),
    to: today.format('YYYY-MM-DD'),
  };

  const reducer = (oldState: DateState, action: Action): DateState => {
    switch (action.type) {
      case 'startDate':
        return { ...oldState, from: action.value, };
      case 'endDate':
        return { ...oldState, to: action.value, };
      default:
        return oldState;
    }
  };

  const [state, dispatch] = useReducer(reducer, initState);

  const onChange = (unit: 'startDate' | 'endDate', value: any) => {
    dispatch({ type: unit, value });
  };

  const refreshTable = () => {
    fetch(`/api/stats/?from=${state.from}&to=${state.to}`, withDefaults())
      .then((res) => res.json())
      .then((data) => setData([...data]));
  };

  useEffect(() => {
    refreshTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.from, state.to]);

  const generateCols = () => {
    const cols = 'Date,Daily Total,Daily Ride Count,Day No Shows,Day Cancels,Night Ride Count, Night No Shows, Night Cancels';
    const finalCols = drivers.reduce((acc: string, curr: Driver) => (
      `${acc},${curr.firstName} ${curr.lastName.substring(0, 1)}.`
    ), cols);
    return finalCols;
  };

  const renderRight = () => (
    <>
      <ExportButton
        toastMsg={`${state.from} to ${state.to} data has been downloaded.`}
        endpoint={`/api/stats/download?from=${state.from}&to=${state.to}`}
        csvCols={generateCols()}
        filename={`${state.from}_${state.to}_analytics.csv`}
      />
      <Notification />
    </>
  );

  const getLabel = () => {
    const from = moment(state.from);
    const to = moment(state.to);
    if (from.year() !== to.year()) {
      return `${from.format('MMM D YYYY')} - ${to.format('MMM D YYYY')}`;
    }
    return `${from.format('MMM D')} - ${to.format('MMM D')}`;
  };

  return (
    <TabSwitcher labels={['Ride Data', 'Driver Data']} renderRight={renderRight}>
      <>
        <DateFilter
          startDate={state.from}
          endDate={state.to}
          onChange={onChange}
        />
        <AnalyticsOverview type="ride" data={analyticsData} label={getLabel()} />
        <AnalyticsTable type="ride" data={analyticsData} refreshTable={refreshTable} />
      </>
      <>
        <DateFilter
          startDate={state.from}
          endDate={state.to}
          onChange={onChange}
        />
        <AnalyticsOverview type="driver" data={analyticsData} label={getLabel()} />
        <AnalyticsTable type="driver" data={analyticsData} refreshTable={refreshTable} />
      </>
    </TabSwitcher>
  );
};

export default Analytics;
