import React, { useState, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { download } from '../../icons/other';
import { Button } from '../FormElements/FormElements';
import styles from './exportButton.module.css';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from '../../util/axios';
import { formatErrorMessage } from '../../context/errorModal';
import { useErrorModal } from '../../context/errorModal';

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
  filename,
}: clickHandler) => {
  const [downloadData, setDownloadData] = useState<string>('');
  const { showToast } = useToast();
  const { showError } = useErrorModal();
  const csvLink = useRef<
    CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
  >(null);

  const downloadCSV = () => {
    axios
      .get(endpoint, {
        responseType: 'text',
        transformResponse: [(data) => data],
      })
      .then((res) => res.data)
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
      .then(() => showToast(toastMsg, ToastStatus.SUCCESS))
      .catch((error) => {
        showError(`Failed to download data: ${formatErrorMessage(error)}`, 'Export Error');
      });
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
