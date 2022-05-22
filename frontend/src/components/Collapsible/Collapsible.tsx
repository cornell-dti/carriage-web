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
  const buttonId = `${alt}accordion`.replace(' ', '');
  const sectionId = `${alt}section`.replace(' ', '');

  return (
    <div>
      <h3>
        <button
          id={buttonId}
          className={styles.banner}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={`${expanded}`}
          aria-controls={sectionId}
        >
          <span className={styles.title}>{title}</span>
          <img
            className={styles.icon}
            src={icon}
            alt={`${!expanded ? 'See more' : 'Hide'} ${alt}`}
          />
        </button>
      </h3>
      <div
        className={styles.contentContainer}
        id={sectionId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!expanded}
      >
        {children}
      </div>
    </div>
  );
};

export default Collapsible;
