import React from 'react';
import cn from 'classnames';
import styles from './cell.module.css';


type TableCellProps = {
  data: string | null;
  index: number;
  first: boolean;
  last: boolean;
  tag?: string;
  buttonHandler?: () => void;
}

const TableCell = (props: TableCellProps) => {
  const { data, index, first, last, tag, buttonHandler } = props;
  if (first) {
    return (<><td
      key={index}
      className={cn(styles.passInfo, styles.cell, styles.firstCell)}>
      {data}
    </td></>);
  } if (last) {
    if (buttonHandler) {
      return (<><td key={index} className={`${styles.passInfo} ${styles.cell} 
      ${styles.lastCell}`}>
        <button onClick={buttonHandler}>{data}</button></td></>);
    }
    return (<><td key={index} className={`${styles.passInfo} ${styles.cell} 
    ${styles.lastCell}`}>{data}</td></>);
  } if (tag) {
    const tagStyle = tag.toLowerCase();
    return (<><td key={index} className={`${styles.passInfo} ${styles.cell}`}>
      {data}{' '}
      <span className={`${styles.tag} 
        ${tagStyle === 'ctown' ? styles.ctown : styles.west}`}>
        {tag}</span></td></>);
  }
  return (<><td key={index} className={`${styles.passInfo} ${styles.cell}`}>
    {data}</td></>);
};

export default TableCell;
