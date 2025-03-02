import React from 'react';
import styles from './StatsBox.module.css';

export type ColorVariant = 'green' | 'gray' | 'red' | 'default';

export interface StatsBoxProps {
  icon: string;
  alt: string;
  stats: string | number;
  description: string;
  className?: string;
  variant?: ColorVariant;
}

const StatsBox: React.FC<StatsBoxProps> = ({
  icon,
  alt,
  stats,
  description,
  className = '',
  variant = 'default',
}) => (
  <div className={`${styles.statsbox} ${styles[variant]} ${className}`}>
    <div className={styles.left}>
      {icon ? (
        <div className={`${styles.iconWrapper} ${styles[`icon-${variant}`]}`}>
          <img
            className={styles.icon}
            src={icon}
            alt={alt}
            width={40}
            height={40}
          />
        </div>
      ) : (
        <div
          className={`${styles.iconWrapper} ${styles[`icon-${variant}`]}`}
          aria-hidden="true"
        />
      )}
    </div>
    <div className={styles.right}>
      <p className={`${styles.stats} ${styles[`stats-${variant}`]}`}>{stats}</p>
      <p className={styles.description}>{description}</p>
    </div>
  </div>
);

export default StatsBox;
