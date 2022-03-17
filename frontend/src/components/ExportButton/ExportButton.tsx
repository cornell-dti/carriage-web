import React, { useState, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { download } from '../../icons/other';
import { Button } from '../FormElements/FormElements';
import { useReq } from '../../context/req';
import styles from './exportButton.module.css';
import { ToastStatus, useToast } from '../../context/toastContext';

type clickHandler = {
  toastMsg: string;
  endpoint: string;
  csvCols: string;
  filename: string;
};

const ExportButton = ({
  toastMsg,
  endpoint,
  csvCols,
  filename
}: clickHandler) => {
  const { withDefaults } = useReq();
  const [downloadData, setDownloadData] = useState<string>('');
  const { showToast } = useToast();
  const csvLink = useRef<
    CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
  >(null);

  const downloadCSV = () => {
    fetch(endpoint, withDefaults())
      .then((res) => res.text())
      .then((data) => {
        if (data === '') {
          setDownloadData(csvCols);
        } else {
          setDownloadData(data);
        }
        if (csvLink.current) {
          csvLink.current.link.click();
        }
      })
      .then(() => showToast(toastMsg, ToastStatus.SUCCESS));
  };

  return (
    <>
      <Button
        onClick={() => downloadCSV()}
        outline={true}
        className={styles.exportButton}
      >
        <img src={download} alt="capacity icon" /> Export
      </Button>
      <CSVLink
        data={downloadData}
        filename={filename}
        className={styles.hidden}
        ref={csvLink}
        target="_blank"
      />
    </>
  );
};

export default ExportButton;
