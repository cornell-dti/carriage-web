import './card.css';
import React from 'react';

type RiderCardProps = {
  values: Array<string>;
  tags: Array<number> | undefined;
};

const RiderCard = (props: RiderCardProps) => {
  const vals = props.values;
  const tags = props.tags;

  const resultList = vals.map((val, index) => {
    if (index === 0) {
      return (<td key={index} className='passInfo cell firstCell'>{val}</td>);
    } if (index === vals.length - 1) {
      return (<td key={index} className='passInfo cell lastCell'>{val}</td>);
    } if (tags && tags.includes(index)) {
      const valList = val.split(',');
      const tag = valList[1];
      const newVal = valList[0];
      const tagString = 'tag ';
      const tagStyle = tagString + tag.toLowerCase();
      return (<td key={index} className='passInfo cell'>{newVal} <span className={tagStyle}>{tag}</span></td>);
    }
    return (<td key={index} className='passInfo cell'>{val}</td>);
  });
  return (<>{resultList}</>);
};

export default RiderCard;
