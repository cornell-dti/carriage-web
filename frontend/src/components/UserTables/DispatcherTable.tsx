import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import DispatcherForm from '../UserForms/DispatcherForm';
import { Dispatcher } from '../../types/index';
import styles from './table.module.css';

const DispatcherManager = () => {

  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);

  const getCurrentDispatchers = async () => {
    const dispatchersData = await fetch('/dispatchers')
      .then((res) => res.json())
      .then((data) => data.data);
    setDispatchers(
      dispatchersData.map((dispatcher: Dispatcher) => ({
        id: dispatcher.id,
        firstName: dispatcher.firstName,
        phoneNumber: dispatcher.phoneNumber,
        email: dispatcher.email,
        accessLevel: dispatcher.accessLevel
      })),
    );
  };

  useEffect(() => {
    getCurrentDispatchers();
  }, []);

  const addDispatcher = (newDispatcher: Dispatcher) => {
    const { id, ...body } = { ...newDispatcher };
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
    fetch('/dispatchers', requestOptions)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('adding dispatcher failed');
        } else {
          console.log("get error")
        }
        return res.json();
      })
      .then((dispatcher) => {
        const validDispatcher = {
          id: dispatcher.id,
          firstName: dispatcher.firstName,
          lastName: dispatcher.lastName,
          phoneNumber: dispatcher.phoneNumber,
          email: dispatcher.email,
          accessLevel: dispatcher.accessLevel
        };
        setDispatchers([...dispatchers, validDispatcher]);
      })
      .catch((e) => console.error(e.message));
  };

  const deleteDispatcher = (dispatcherId: string) => {
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch(`/dispatchers/${dispatcherId}`, requestOptions)
      .then((res) => {
        if (res.status === 200) {
          setDispatchers(dispatchers.filter((d) => d.id !== dispatcherId));
        } else {
          throw new Error('deleting failed');
        }
      })
      .catch((e) => console.error('removing dispatcher failed'));
  };

  const renderTableHeader = () => (
    <tr>
      <th className={styles.tableHeader}>First Name</th>
      <th className={styles.tableHeader}>Last Name</th>
      <th className={styles.tableHeader}>Phone Number</th>
      <th className={styles.tableHeader}>Email</th>
      <th className={styles.tableHeader}>Access Level</th>
    </tr>
  );

  return (
    <>
      <div>
        <h1 className={styles.formHeader}>Dispatcher Table</h1>
        <table className={styles.table}>
          <tbody>
            {renderTableHeader()}
            {dispatchers.map(({ id, firstName, lastName, phoneNumber, email, accessLevel }, index) => (
              <tr key={index}>
                <td>{firstName}</td>
                <td>{lastName}</td>
                <td>{phoneNumber}</td>
                <td>{email}</td>
                <td> {accessLevel}</td>
                <td>
                  <button onClick={() => deleteDispatcher(id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DispatcherForm onClick={addDispatcher} />
    </>
  )
}

export default DispatcherManager
