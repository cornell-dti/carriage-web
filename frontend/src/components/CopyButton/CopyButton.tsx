import React, { useState } from 'react';
import { Button } from '../FormElements/FormElements'
import { useRiders } from '../../context/RidersContext';
import Toast from '../ConfirmationToast/ConfirmationToast';
import styles from './copyButton.module.css';

const CopyButton = () => {
  const [showingToast, setToast] = useState(false);
  const { riders } = useRiders();
  const getRidersEmail = () => {
    let concat = '';
    riders.forEach((rider) => { concat = `${concat + rider.email}, `; });
    return concat;
  };

  const handleClick = () => {
    navigator.clipboard.writeText(getRidersEmail())
      .then(() => { setToast(true); });
    console.log(getRidersEmail());
  };

  return (
    <>
      {showingToast ? <Toast message={'Rider e-mails copied to clipboard.'} /> : null}
      <Button onClick={() => { handleClick(); }} outline={true}
        className={styles.copyButton}>Copy Emails</Button>
    </>
  );
};

export default CopyButton;
