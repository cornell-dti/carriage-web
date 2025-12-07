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


/**
 * ExportButton
 * 
 * A reusable button that fetches CSV data from a backend endpoint and triggers
 * a download in the browser. Displays a toast on success or failure.
 *
 * @param toastMsg - The message to display in the toast on successful download.
 * @param endpoint - The backend API endpoint to fetch CSV data from.
 * @param csvCols -  CSV string to use if the backend response is empty.
 * @param filename - the filename for the downloaded CSV file.
 *
 * - Fetches CSV data from the specified `endpoint`.
 * - Uses `csvCols` as fallback if the server returns empty.
 * - Initiates download of CSV with the given `filename`.
 * - Shows toast notifications for success or error with `useToast` context.
 */

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
