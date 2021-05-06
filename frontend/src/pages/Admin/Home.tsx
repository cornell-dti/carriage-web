import React, { useState, useRef } from "react";
import moment from "moment";
import RideModal from "../../components/RideModal/RideModal";
import ScheduledTable from "../../components/UserTables/ScheduledTable";
import UnscheduledTable from "../../components/UserTables/UnscheduledTable";
import Schedule from "../../components/Schedule/Schedule";
import MiniCal from "../../components/MiniCal/MiniCal";
import Notification from "../../components/Notification/Notification";
import styles from "./page.module.css";
import { useEmployees } from "../../context/EmployeesContext";
import ExportButton from "../../components/ExportButton/ExportButton";
import { useDate } from "../../context/date";
import Collapsible from "../../components/Collapsible/Collapsible";
import { Driver } from "../../types/index";

const Home = () => {
  const { drivers } = useEmployees();
  const { curDate } = useDate();
  const today = moment(curDate).format("YYYY-MM-DD");

  const renderScheduledRides = (): JSX.Element[] => {
    return drivers.map((driver: Driver, index: number) => (
      <ScheduledTable
        key={index}
        query="driver"
        id={driver.id}
        name={`${driver.firstName} ${driver.lastName}`}
      />
    ));
  };

  return (
    <div>
      <div className={styles.pageTitle}>
        <MiniCal />
        <div className={styles.rightSection}>
          <ExportButton
            toastMsg={`${today} data has been downloaded.`}
            endpoint={`/api/rides/download?date=${today}`}
            csvCols={"Name,Pick Up,From,To,Drop Off,Needs,Driver"}
            filename={`scheduledRides_${today}.csv`}
          />
          <RideModal />
          <Notification />
        </div>
      </div>

      <Schedule />

      <Collapsible title={"Unscheduled Rides"}>
        <UnscheduledTable drivers={drivers} />
      </Collapsible>

      <Collapsible title={"Scheduled Rides"}>
        {renderScheduledRides()}
      </Collapsible>
    </div>
  );
};

export default Home;
