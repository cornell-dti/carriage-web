import React from 'react';
import { useGoogleLogin } from 'react-google-login';
import styles from './landing.module.css';
import { logo, dti_logo, dti_desc, googleLogin } from '../../icons/other';
import useClientId from '../../hooks/useClientId';
import { useAuth } from '../../context/auth';

type SignInButtonProps = {
  user: string;
  onClick: () => void;
};

const SignInButton = ({ user, onClick }: SignInButtonProps) => {
  return (
    <button onClick={onClick} className={styles.btn}>
      <img src={googleLogin} className={styles.icon} alt="google logo" />
      <div className={styles.heading}>{user}</div>
      Sign in with Google
    </button>
  );
};

const Landing = () => {
  const { onLoginSuccess, setIsAdmin } = useAuth();
  const clientId = useClientId();
  const { signIn } = useGoogleLogin({
    clientId,
    cookiePolicy: 'single_host_origin',
    isSignedIn: true,
    onSuccess: onLoginSuccess,
  });

  const onClick = (isAdmin: boolean) => {
    return () => {
      setIsAdmin(isAdmin);
      signIn();
    };
  };

  return (
    <main id="main">
      <div className={styles.home}>
        <div className={styles.main}>
          <div className={styles.left}>
            <img src={logo} className={styles.badge} alt="Carriage logo" />
            <span className={styles.title}>Carriage</span>
          </div>
          <div className={styles.right}>
            <div className={styles.spacing_container}>
              <h1 className={styles.heading}>Login</h1>
              <div className={styles.container}>
                <SignInButton user="Students" onClick={onClick(false)} />
                <SignInButton user="Admins" onClick={onClick(true)} />
              </div>
            </div>
            <div className={styles.dti_container}>
              <img src={dti_logo} className={styles.dti_logo} alt="DTI logo" />
              <img src={dti_desc} className={styles.dti_desc} alt="DTI desc" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;
