import React, { useState, useEffect } from 'react';
import DispatcherForm from '../UserForms/DispatcherForm';
import { Dispatcher } from '../../types/index';
import styles from './table.module.css';
import TableRow from '../TableComponents/TableRow';
import { useReq } from '../../context/req';

const DispatcherManager = () => {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const { withDefaults } = useReq();

  useEffect(() => {
    fetch('/api/dispatchers', withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        setDispatchers(data);
      });
  }, [withDefaults]);


  const addDispatcher = (newDispatcher: Dispatcher) => {
    const { id, ...body } = { ...newDispatcher };
    fetch('/api/dispatchers', withDefaults({
      method: 'POST',
      body: JSON.stringify(body),
    }))
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('adding dispatcher failed');
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
          accessLevel: dispatcher.accessLevel,
        };
        setDispatchers([...dispatchers, validDispatcher]);
      })
      .catch((e) => console.error(e.message));
  };

  const deleteDispatcher = (dispatcherId: string) => {
    fetch(`/dispatchers/${dispatcherId}`, withDefaults({ method: 'DELETE' }))
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
            {dispatchers.map((
              { id, firstName, lastName, phoneNumber, email, accessLevel }, index,
            ) => (
              <tr key={index}>
                <TableRow values={[
                  { data: firstName },
                  { data: lastName },
                  { data: phoneNumber },
                  { data: email },
                  { data: accessLevel },
                  {
                    data: 'Delete',
                    buttonHandler: () => deleteDispatcher(id),
                  },
                ]} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DispatcherForm onClick={addDispatcher} />
    </>
  );
};

export default DispatcherManager;
