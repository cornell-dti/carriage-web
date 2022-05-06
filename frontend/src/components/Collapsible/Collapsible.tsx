import React, { useState } from 'react';
import styles from './collapsible.module.css';
import { up, down } from '../../icons/other/index';

type CollapsibleSection = {
  title: string;
  alt: string;
  children: JSX.Element | JSX.Element[];
};

const Collapsible = ({ title, alt, children }: CollapsibleSection) => {
  const [expanded, setExpanded] = useState(false);
  const icon = expanded ? down : up;

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setExpanded(!expanded);
    }
  };
  return (
    <div className={styles.collapsible}>
      <div className={styles.banner} onClick={() => setExpanded(!expanded)}>
        <h2 className={styles.title}>{title}</h2>
        <img
          className={styles.icon}
          src={icon}
          role={'button'}
          alt={`${!expanded ? 'See more' : 'Hide'} ${alt}`}
          tabIndex={0}
          onKeyPress={handleKeywordKeyPress}
        />
      </div>
      {expanded && <div className={styles.contentContainer}>{children}</div>}
    </div>
  );
};

export default Collapsible;
