import React from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from '../Banner';

export default function WelcomePage( {userData, setUserData} ) {
  const navigate = useNavigate();

  return (
    <div>
      <Banner onWelcomePage={true} userData={userData} setUserData={ setUserData }/>
      <div style={ {marginTop: 60} }>
      {userData ? <h1>Welcome to Phreddit {userData.displayName} </h1> : <h1>Welcome to Phreddit Guest</h1>}
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/register')}>Register</button>
      <button onClick={() => navigate('/home')}>Continue as Guest</button>
      </div>
    </div>
  );
}