import React, { ReactElement } from 'react';
import styles from './footer.module.css';
import { dti_logo} from '../../icons/other';

const Footer = () => {
  return <div className={styles.footer}>
    <div className={styles.black1}></div>
    <div className={styles.white}></div>
    <div className={styles.black2}> 
      <div className={styles.dti_container} style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
                <img src={dti_logo} className={styles.dti_logo} alt="DTI logo" style={{ marginRight: "10px" }}/>
                <p style={{ color: "white" }}>Powered by <br/>Cornell Design & Tech Initiative</p>   
      </div>
    </div>
   
</div>;
};

export default Footer;