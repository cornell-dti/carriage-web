import React from 'react';
import { download } from '../../icons/other';
import { useHistory } from 'react-router-dom';
import { Button } from '../FormElements/FormElements';
import styles from './exportButton.module.css';

const ExportButton = () => {
    const exportPreview = () => {
        history.push('/home/export');
      }
      const history = useHistory();

    return (
        <Button onClick={exportPreview} outline={true} className={styles.exportButton}>
            <img src={download} alt="capacity icon" /> Export
        </Button>
    )
}

export default ExportButton
