import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const Landing = () => {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  return (
    <>
      <div className={`min-h-screen ${styles.bgNoise} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
            Welcome to <span className='animate-pulse' style={{color:"aqua"}}>AwesomeApp</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-2xl mb-12">
            Discover the amazing features and join our community today!
          </p>
          <div className="flex justify-center space-x-4">
            <button className={styles.btnSignin} onClick={() => loginWithRedirect()}>Log In</button>
            <button className={styles.btnSignup} onClick={() => navigate('/login')}>Sign Up</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Landing;
