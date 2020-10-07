import React from 'react';
import { RiderTableValue } from '../../types/index';
import styles from './card.module.css';


type RiderCardProps = {
  values: Array<RiderTableValue>;
};

const RiderCard = (props: RiderCardProps) => {
  const { values } = props;

  const resultList = values.map((val, index) => {
    const { data, tag, buttonHandler } = val;
    if (index === 0) {
      return (<td key={index} className={`${styles.passInfo} ${styles.cell} 
      ${styles.firstCell}`}>{data}</td>);
    } if (index === values.length - 1) {
      if (buttonHandler) {
        return (<td key={index} className={`${styles.passInfo} ${styles.cell} 
        ${styles.lastCell}`}>
          <button onClick={buttonHandler}>{data}</button></td>);
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
  });
  return (<>{resultList}</>);
};

export default RiderCard;
