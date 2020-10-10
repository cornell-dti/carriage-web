import React, { useState } from 'react';
import styles from './collapsible.module.css';
import { up, down } from "./icons";

type CollapsibleSection = {
  title: string;
  children: JSX.Element | JSX.Element[];
}

const Collapsible = ({ title, children }: CollapsibleSection) => {
  const [expanded, setExpanded] = useState(false);
  const icon = expanded ? down : up;

  const changeExpanded = () => {
    setExpanded(!expanded);
  }

  return (
    <div className={styles.collapsible}>
      <div className={styles.banner} onClick={changeExpanded}>
        <p className={styles.title}>{title}</p>
        <img className={styles.icon} src={icon} />
      </div>
      {expanded && <div className={styles.contentContainer}>{children}</div>}
    </div>
  )
}

export default Collapsible;