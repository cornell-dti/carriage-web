import { useRiders } from '../../context/RidersContext';
import buttonStyles from '../../styles/button.module.css';
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
    <button
      style={{
        width: '10rem',
      }}
      onClick={handleClick}
      className={`${buttonStyles.button} ${buttonStyles.buttonSecondary} ${buttonStyles.buttonLarge}`}
    >
      Copy Emails
    </button>
  );
};

export default CopyButton;
