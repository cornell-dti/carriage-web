import { download } from '../../icons/other';
import { Button } from '../FormElements/FormElements';
import styles from './exportButton.module.css';
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
  const { showToast } = useToast();

  const downloadCSV = async () => {
    try {
      // fetch csv string from stats table in backend
      const res = await axios.get(endpoint, {
        responseType: 'text',
        transformResponse: [(data) => data],
      });
      const data = res.data || csvCols;

      // generate a download link and initiate the download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download.csv';
      document.body.appendChild(link);
      link.click();

      //cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(toastMsg, ToastStatus.SUCCESS);
    } catch (error) {
      showToast('Failed to download CSV', ToastStatus.ERROR);
    }
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
    </>
  );
};

export default ExportButton;
