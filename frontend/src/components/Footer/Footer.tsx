import React from 'react';
import styles from './footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <p>
      If you have a disability and are having trouble accessing information on
      this website or need materials in an alternate format,
      contact{' '}
      <a href="mailto:web-accessibility@cornell.edu">web-accessibility@cornell.edu</a>
      {' '}for assistance.
    </p>
  </footer>
);

export default Footer;
