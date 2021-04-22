import React, { useState, useRef } from "react";
import { CSVLink } from "react-csv";
import moment from "moment";
import RideModal from "../../components/RideModal/RideModal";
import UnscheduledTable from "../../components/UserTables/UnscheduledTable";
import Schedule from "../../components/Schedule/Schedule";
import MiniCal from "../../components/MiniCal/MiniCal";
import { Button } from "../../components/FormElements/FormElements";
import Toast from "../../components/ConfirmationToast/ConfirmationToast";
import Notification from "../../components/Notification/Notification";
import styles from "./page.module.css";
import { useEmployees } from "../../context/EmployeesContext";
import ExportButton from "../../components/ExportButton/ExportButton";
import { useReq } from "../../context/req";
import { useDate } from "../../context/date";
import Collapsible from "../../components/Collapsible/Collapsible";

const Home = () => {
  const { drivers } = useEmployees();
  const { withDefaults } = useReq();

  // states for the rides model
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const [downloadData, setDownloadData] = useState<string>("");
  const [showingToast, setToast] = useState(false);
  const csvLink = useRef<
    CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
  >(null);
  const { curDate } = useDate();
  const today = moment(curDate).format("YYYY-MM-DD");

  const openRidesModal = () => {
    setCurrentPage(0);
    setIsOpen(true);
  };

  const downloadCSV = () => {
    setToast(false);
    fetch(`/api/rides/download?date=${today}`, withDefaults())
      .then((res) => res.text())
      .then((data) => {
        if (data === "") {
          setDownloadData("Name,Pick Up,From,To,Drop Off,Needs,Driver");
        } else {
          setDownloadData(data);
        }
        if (csvLink.current) {
          csvLink.current.link.click();
        }
      })
      .then(() => setToast(true));
  };

  return (
    <div>
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Homepage</h1>
        <div className={styles.margin3}>
          {showingToast ? (
            <Toast message={`${today} data has been downloaded.`} />
          ) : null}
          <div className={styles.rightSection}>
            <ExportButton onClick={downloadCSV} />
            <CSVLink
              data={downloadData}
              filename={`scheduledRides_${today}.csv`}
              className="hidden"
              ref={csvLink}
              target="_blank"
            />
            <Button onClick={openRidesModal}>+ Add ride</Button>
            <RideModal
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
            <Notification />
          </div>
        </div>
      </div>
      <MiniCal />
      <Schedule />
      <Collapsible title={"Unscheduled Rides"}>
        <UnscheduledTable drivers={drivers} />
      </Collapsible>
    </div>
  );
};

export default Home;
