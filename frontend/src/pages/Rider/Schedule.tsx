import React from 'react';
import RequestRideModal from '../../components/RequestRideModal/RequestRideModal';
import Notification from '../../components/Notification/Notification';
import styles from './page.module.css';

const Schedule = () => (
    <main id = "main">
    <div className={styles.pageTitle}>
        <div className={styles.rightSection}>
        <RequestRideModal />
        </div>
    </div>
    </main>
);
export default Schedule;
