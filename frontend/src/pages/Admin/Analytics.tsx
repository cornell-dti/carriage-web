import React, { useCallback, useEffect, useReducer, useState } from 'react';
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
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  from: string;
  to: string;
  range: 'month' | 'date'
}

export type Action = {
  type: 'year' | 'month';
  value: number;
} | {
  type: 'startDate' | 'endDate';
  value: string;
}

const Analytics = () => {
  const [analyticsData, setData] = useState<TableData[]>([]);
  const { withDefaults } = useReq();
  const { drivers } = useEmployees();
  const today = moment();

  const initState: DateState = {
    year: today.year(),
    month: today.month(),
    startDate: today.format('YYYY-MM-DD'),
    endDate: today.format('YYYY-MM-DD'),
    from: today.format('YYYY-MM-DD'),
    to: today.format('YYYY-MM-DD'),
    range: 'date',
  };

  const getDateRange = (year: number, month: number) => {
    const date = moment().year(year).month(month);
    const from = date.startOf('month').format('YYYY-MM-DD');
    const to = date.endOf('month').format('YYYY-MM-DD');
    return [from, to];
  };

  const reducer = (oldState: DateState, action: Action): DateState => {
    switch (action.type) {
      case 'year': {
        const [from, to] = getDateRange(action.value, oldState.month);
        return { ...oldState, year: action.value, from, to, range: 'month' };
      }
      case 'month': {
        const [from, to] = getDateRange(oldState.year, action.value);
        return { ...oldState, month: action.value, from, to, range: 'month' };
      }
      case 'startDate':
        return { ...oldState, startDate: action.value, from: action.value, range: 'date' };
      case 'endDate':
        return { ...oldState, endDate: action.value, to: action.value, range: 'date' };
      default:
        return oldState;
    }
  };

  const [state, dispatch] = useReducer(reducer, initState);

  const onChange = (unit: 'year' | 'month' | 'startDate' | 'endDate', value: any) => {
    dispatch({ type: unit, value });
  };

  const refreshTable = useCallback(() => {
    fetch(`/api/stats/?from=${state.from}&to=${state.to}`, withDefaults())
      .then((res) => res.json())
      .then((data) => setData([...data]));
  }, [state.from, state.to, withDefaults]);

  useEffect(() => {
    refreshTable();
  }, [refreshTable, state.from, state.to]);

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
    if (state.range === 'date') {
      if (from.year() !== to.year()) {
        return `${from.format('MMM D YYYY')} - ${to.format('MMM D YYYY')}`;
      }
      return `${from.format('MMM D')} - ${to.format('MMM D')}`;
    }
    return moment(state.from).format('MMMM');
  };

  return (
    <TabSwitcher labels={['Ride Data', 'Driver Data']} renderRight={renderRight}>
      <>
        <DateFilter
          year={state.year}
          month={state.month}
          startDate={state.startDate}
          endDate={state.endDate}
          onChange={onChange}
        />
        <AnalyticsOverview type="ride" data={analyticsData} label={getLabel()} />
        <AnalyticsTable type="ride" data={analyticsData} refreshTable={refreshTable} />
      </>
      <>
        <DateFilter
          year={state.year}
          month={state.month}
          startDate={state.startDate}
          endDate={state.endDate}
          onChange={onChange}
        />
        <AnalyticsOverview type="driver" data={analyticsData} label={getLabel()} />
        <AnalyticsTable type="driver" data={analyticsData} refreshTable={refreshTable} />
      </>
    </TabSwitcher>
  );
};

export default Analytics;
