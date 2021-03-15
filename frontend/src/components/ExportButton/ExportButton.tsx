import React from 'react';
import { useHistory } from 'react-router-dom';
import { download } from '../../icons/other';
import { Button } from '../FormElements/FormElements';
import styles from './exportButton.module.css';

type clickHandler = {
   onClick: () => void
}

const ExportButton = (props: clickHandler) => (
   <Button onClick={() => props.onClick()} outline={true} className={styles.exportButton}>
      <img src={download} alt="capacity icon" /> Export
   </Button>
);

export default ExportButton;
