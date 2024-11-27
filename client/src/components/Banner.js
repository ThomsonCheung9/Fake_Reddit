import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';

export default function Banner({ handleSearch, setCurrentView, currentView,
    onWelcomePage=false, userData, setUserData}) {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogout = async () => {
        try {
          const response = await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });
      
          if (response.data.success) {
            setUserData(null); // Clear user data
            navigate('/'); // Redirect to home page
          } else {
            console.error('Logout failed:', response.data.message);
            alert(response.data.message || 'Logout failed');
          }
        } catch (error) {
          console.error('Error during logout:', error);
          if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error status:', error.response.status);
          } else {
            console.error('Error message:', error.message);
          }
          alert('An error occurred during Logout.');
        }
      };
      

    if (onWelcomePage) {
        return(
            <div id="header" className="header">
            <div className="titleContainer" id="titleLink" onClick={() => navigate('/')}>
                Phreddit
            </div>
            <div className="searchBar">
                <input type="text" placeholder="Search Phreddit..." id="searchInput"/>
            </div>
            <div className="titleCreatePost">
            { userData ? 
                <button className="createPostButton" onClick={() => setCurrentView('createPost')} style={currentView === 'createPost' ? { backgroundColor: '#ff4500' } : {}}>
                Create Post
                </button>:
                <button className="createGreyButton" >
                Create Post
                </button>
            }
            </div>
            <div className="titleCreatePost">
            <button onClick={() => {
        handleLogout();
        }}>Logout</button>
            </div>
        </div>
        )
    }
    return (
        <div id="header" className="header">
            <div className="titleContainer" id="titleLink" onClick={() => navigate('/')}>
                Phreddit
            </div>
            <div className="searchBar">
                <input type="text" placeholder="Search Phreddit..." id="searchInput" onKeyDown={handleSearch}/>
            </div>
            <div className="titleCreatePost">
                { userData ? 
                <button className="createPostButton" onClick={() => setCurrentView('createPost')} style={currentView === 'createPost' ? { backgroundColor: '#ff4500' } : {}}>
                Create Post
                </button>:
                <button className="createGreyButton" >
                Create Post
                </button>
            }
            </div>
            <div className="titleCreatePost">
                { userData ? <button className="createPostButton"> {userData.displayName} </button > :
                 <button className="createGreyButton"> Guest </button>}
            </div>
            <div className="titleCreatePost">
                <button className="createPostButton" onClick={() => {
                    handleLogout();
                }}> Logout </button>
            </div>
        </div>
    );
}
