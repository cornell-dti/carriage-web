import React, { useState, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { download } from '../../icons/other';
import { Button } from '../FormElements/FormElements';
import { ToastStatus, useToast } from '../../context/toastContext';
import axios from '../../util/axios';

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
      .then(() => showToast(toastMsg, ToastStatus.SUCCESS));
  };

  return (
    <>
      <Button
        onClick={() => downloadCSV()}
        outline={true}
        className="flex items-center gap-2"
      >
        <img src={download} alt="capacity icon" /> Export
      </Button>
      <CSVLink
        data={downloadData}
        filename={filename}
        className="hidden"
        ref={csvLink}
        target="_blank"
      />
    </>
  );
};

export default ExportButton;
