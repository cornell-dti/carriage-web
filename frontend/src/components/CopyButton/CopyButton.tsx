import { Button } from '../FormElements/FormElements';
import { useRiders } from '../../context/RidersContext';
import styles from './copyButton.module.css';
import { useToast, ToastStatus } from '../../context/toastContext';

const CopyButton = () => {
  const { showToast } = useToast();
  const { riders } = useRiders();
  const emails = riders
    .filter((r) => r.active)
    .map((r) => r.email)
    .join(',');

  const handleClick = () => {
    navigator.clipboard
      .writeText(emails)
      .then(() =>
        showToast('Student e-mails copied to clipboard.', ToastStatus.SUCCESS)
      );
  };

  return (
    <Button onClick={handleClick} outline className={styles.copyButton}>
      Copy Emails
    </Button>
  );
};

export default CopyButton;
