import React, { ReactNode } from 'react';
import cn from 'classnames';
import styles from './cell.module.css';
import Tag from '../Tag/Tag';
import { Button } from '../FormElements/FormElements';

type TableCellProps = {
  data: string | ReactNode | null;
  index: number;
  first: boolean;
  last: boolean;
  tag?: string;
  reduced?: boolean;
  buttonHandler?: () => void;
  ButtonModal?: () => JSX.Element;
}

const TableCell = (props: TableCellProps) => {
  const { data, index, first, last, tag, reduced, buttonHandler, ButtonModal } = props;
  if (first) {
    return (<td
      key={index}
      className={cn(styles.passInfo, styles.cell, styles.firstCell)}>
      {data}
    </td>);
  } if (last) {
    if (buttonHandler && ButtonModal) {
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
    return (<td key={index} className={`${styles.passInfo} ${styles.cell}`}>
      <Tag reduced={reduced} location={data} tag={tag} />
    </td>);
  }
  return (<td key={index} className={`${styles.passInfo} ${styles.cell}`}>
    {data}</td>);
};

export default TableCell;
