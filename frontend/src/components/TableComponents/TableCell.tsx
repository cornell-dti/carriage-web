import React, { ReactNode } from 'react';
import cn from 'classnames';
import styles from './cell.module.css';
import { Button } from '../FormElements/FormElements';

type TableCellProps = {
  data: string | ReactNode | null;
  index: number;
  first: boolean;
  last: boolean;
  tag?: string;
  buttonHandler?: () => void;
  ButtonModal?: () => JSX.Element;
}

const TableCell = (props: TableCellProps) => {
  const { data, index, first, last, tag, buttonHandler, ButtonModal } = props;
  if (first) {
    // const lastSpaceIndex = data?.lastIndexOf(' ');
    // const name = data?.substring(0, lastSpaceIndex); //student's name
    // const splitString = data?.split(' ');
    // const netId = splitString ? ' ' + splitString[splitString?.length-1] : '';

    return (<td
      key={index}
      className={cn(styles.passInfo, styles.cell, styles.firstCell)}>
        {JSON.stringify(data)}
      {/* <span style={{ fontWeight: 'bold' }}>{name}</span> */}
      {/* {netId} */}
    </td>);
  } if (last) {
    if (buttonHandler && ButtonModal) {
      return (
        <td key={index} className={`${styles.passInfo} ${styles.cell} 
        ${styles.lastCell}`}>
          <Button className={styles.editButton} onClick={buttonHandler}>
            {data} {<ButtonModal />}
          </Button>
        </td>
      );
    }
    if (buttonHandler) {
      return (<>
        <td key={index} className={`${styles.passInfo} ${styles.cell} 
        ${styles.lastCell}`}>
          <Button className={styles.editButton} onClick={buttonHandler}>
            {data}
          </Button>
        </td></>
      );
    }
    return (<td key={index} className={`${styles.passInfo} ${styles.cell} 
    ${styles.lastCell}`}>{data}</td>);
  } if (tag) {
    const tagStyle = tag.toLowerCase();
    return (<td key={index} className={`${styles.passInfo} ${styles.cell}`}>
      {data}{' '}
      <span className={`${styles.tag} 
        ${tagStyle === 'ctown' ? styles.ctown : styles.west}`}>
        {tag}</span></td>);
  }
  return (<td key={index} className={`${styles.passInfo} ${styles.cell}`}>
    {data}</td>);
};

export default TableCell;
