import React, { useState } from 'react';
import { Button } from '../FormElements/FormElements';
import { useRiders } from '../../context/RidersContext';
import Toast from '../ConfirmationToast/ConfirmationToast';
import styles from './copyButton.module.css';

const CopyButton = () => {
  const [showingToast, setToast] = useState(false);
  const { riders } = useRiders();
  const emails = riders
    .filter((r) => r.active)
    .map((r) => r.email)
    .join(',');

  const handleClick = () => {
    navigator.clipboard.writeText(emails).then(() => setToast(true));
  };

  return (
    <>
      {showingToast ? (
        <Toast message={'Student e-mails copied to clipboard.'} />
      ) : null}
      <Button onClick={handleClick} outline className={styles.copyButton}>
        Copy Emails
      </Button>
    </>
  );
};

export default CopyButton;
