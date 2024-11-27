import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Banner from '../Banner';

export default function LoginPage( {setUserData, userData} ) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/login', { email, password }, 
        { withCredentials: true }
      );
      if (response.data.success) {
        setUserData(response.data.user)
        console.log(response.data.user)
        navigate('/home');
      } else {
        setErrorMessage(response.data.message || 'Login failed.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred during Login.');
      }
    }
  };
  

  return (
    <div>
      <Banner onWelcomePage={true} userData={userData} setUserData={ setUserData }/>
      <div style={ {marginTop: 60} }>
        <h1>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button onClick={handleLogin}>Login</button>
      </div>
      
    </div>
  );
}
