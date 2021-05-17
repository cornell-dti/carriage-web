import React from 'react';
import cn from 'classnames';
import styles from './tag.module.css';

type TagProps = {
  reduced?: boolean;
  location: React.ReactNode;
  tag: string;
}

const Tag = ({ reduced, location, tag }: TagProps) => {
  const tagStyle = tag.toLowerCase();
  return (
    <p>
      {reduced && <span className={cn(styles.reducedTag, styles[tagStyle])} />}
      {location}{' '}
      {!reduced && <span className={cn(styles.tag, styles[tagStyle])}>{tag}</span>}
    </p>
  );
};

export default Tag;
