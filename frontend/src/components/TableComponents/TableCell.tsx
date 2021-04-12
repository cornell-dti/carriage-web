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
    let tagStyle = tag.toLowerCase();

    switch (tagStyle) {
      case ('west'): {
        tagStyle = styles.west;
        break;
      }
      case ('central'): {
        tagStyle = styles.central;
        break;
      }
      case ('north'): {
        tagStyle = styles.north;
        break;
      }
      case ('ctown'): {
        tagStyle = styles.ctown;
        break;
      }
      case ('dtown'): {
        tagStyle = styles.dtown;
        break;
      }
      case ('custom'): {
        tagStyle = styles.custom;
        break;
      }
      default: {
        tagStyle = styles.inactive;
        break;
      }
    }

    const smallTag = (<span className={`${styles.reducedTag} ${tagStyle}`}></span>);
    const fullTag = (<span className={`${styles.tag} 
    ${tagStyle}`}>
      {tag}</span>);
    return (<td key={index} className={`${styles.passInfo} ${styles.cell}`}>
      {reduced ? smallTag : null}
      {data}{' '}
      {reduced ? null : fullTag}
    </td>);
  }
  return (<td key={index} className={`${styles.passInfo} ${styles.cell}`}>
    {data}</td>);
};

export default TableCell;
