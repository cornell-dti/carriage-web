import React from 'react';
import { download } from '../../icons/other';
import { useHistory } from 'react-router-dom';
import { Button } from '../FormElements/FormElements';
import styles from './exportButton.module.css';

type clickHandler = {
    onClick: () => void
 } 

const ExportButton = (props: clickHandler) => {

    return (
        <Button onClick={() => props.onClick()} outline={true} className={styles.exportButton}>
           <img src={download} alt="capacity icon" /> Export
        </Button>
    )
}

export default ExportButton
