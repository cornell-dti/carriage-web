import React from 'react';
import cn from 'classnames';
import styles from './tag.module.css';

type TagProps = {
  reduced?: boolean;
  location: React.ReactNode;
  tag: string;
}

const Tag = (props: TagProps) => {
  const { reduced, location, tag } = props;
  const tagStyle = tag.toLowerCase();
  const smallTag = <span className={cn(styles.reducedTag, styles[tagStyle])}></span>;
  const fullTag = <span className={cn(styles.tag, styles[tagStyle])}>{tag}</span>;

  return (
    <>
      {reduced ? smallTag : null}
      {location}{' '}
      {reduced ? null : fullTag}
    </>);
};

export default Tag;
