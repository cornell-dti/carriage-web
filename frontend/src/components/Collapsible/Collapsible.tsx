import React, { useState } from 'react';
import styles from './collapsible.module.css';
import { up, down } from '../../icons/other/index';

type CollapsibleSection = {
  title: string;
  children: JSX.Element | JSX.Element[];
};

const Collapsible = ({ title, children }: CollapsibleSection) => {
  const [expanded, setExpanded] = useState(false);
  const icon = expanded ? down : up;

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setExpanded(!expanded);
    }
  };
  return (
    <div className={styles.collapsible}>
      <div
        className={styles.banner}
        role={'button'}
        aria-expanded={expanded}
        aria-controls={`region-${title}`}
        onClick={() => setExpanded(!expanded)}
        tabIndex={0}
      >
        <h2 className={styles.title}>{title}</h2>
        <img
          className={styles.icon}
          src={icon}
          aria-hidden={true}
          tabIndex={-1}
          onKeyPress={handleKeywordKeyPress}
        />
      </div>
      {expanded && (
        <div
          className={styles.contentContainer}
          role="region"
          id={`region-${title}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Collapsible;
