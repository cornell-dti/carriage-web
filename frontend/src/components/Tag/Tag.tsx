import React from 'react';
import styles from './tag.module.css';

type TagProps = {
  reduced?: boolean;
  location: React.ReactNode;
  tag: string;
}

const Tag = (props: TagProps) => {
  const { reduced, location, tag } = props;
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

  return (
    <>
      {reduced ? smallTag : null}
      {location}{' '}
      {reduced ? null : fullTag}
    </>);
};

export default Tag;
