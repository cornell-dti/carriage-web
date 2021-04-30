import React from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';

const Header = () => (
  <header className={styles.header}>
    <h1 className={styles.title}>Welcome to Carriage</h1>
    <h2 className={styles.subtitle}>Helping People Do Something</h2>
  </header>
);

const ReadMore = () => (
  <a href="https://www.cornelldti.org" className={styles.readBtn}>
    Read More
  </a>
);

const Landing = () => (
  <>
    <div>
      <div className={styles.home}>
        <Header />
        <ReadMore />
      </div>
      <Footer />
    </div>
  </>
);

export default Landing;
