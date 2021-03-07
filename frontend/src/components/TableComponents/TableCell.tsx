import React, { ReactNode } from 'react';
import styles from './cell.module.css';

type TableCellProps = {
  data: string | ReactNode | null;
  index: number;
  tag?: string;
}

const TableCell = (props: TableCellProps) => {
  const { data, index, tag } = props;
  if (tag) {
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
