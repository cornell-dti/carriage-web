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
  outline?: boolean;
}

const TableCell = (props: TableCellProps) => {
  const { data, index, first, last, tag, buttonHandler, ButtonModal, outline } = props;
  if (first) {
    return (<td
      key={index}
      className={cn(styles.passInfo, styles.cell, styles.firstCell)}>
        {data}
    </td>);
  } if (last) {
      if (buttonHandler && ButtonModal) {
        if (outline !== undefined) {
          return (<td key={index} className={`${styles.passInfo} ${styles.cell} 
          ${styles.lastCell}`}>
            <Button onClick={buttonHandler} outline={outline}>{data} {<ButtonModal />}</Button></td>);
        }
        return (<td key={index} className={`${styles.passInfo} ${styles.cell} 
        ${styles.lastCell}`}>
          <Button onClick={buttonHandler}>{data} {<ButtonModal />}</Button></td>);
      }
      if (buttonHandler) {
        return (<><td key={index} className={`${styles.passInfo} ${styles.cell} 
        ${styles.lastCell}`}>
          <Button onClick={buttonHandler}>{data}</Button></td></>);
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
