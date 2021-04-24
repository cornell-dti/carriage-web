import React from 'react';
import styles from './tag.module.css';

type TagProps = {
  reduced?: boolean;
  location: React.ReactNode;
  tag: string;
}

const Tag = (props: TagProps) => {
  const { reduced, location, tag } = props;
  const tagStyle = tag.toLowerCase();
  const smallTag = (<span className={`${styles.reducedTag} ${styles[tagStyle]}`}></span>);
  const fullTag = (<span className={`${styles.tag} 
  ${tagStyle}`}>
    {tag}</span>);

  return (
    <>
      {reduced ? smallTag : null}
      {location}{' '}
      {reduced ? null : fullTag}
    </>);
};

export default Tag;
