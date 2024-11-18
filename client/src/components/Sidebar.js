import React from 'react';

export default function SideBar({ currentView, handleNavigation, communities,
  setSelectedPost, setOnCommentPage, fetchPosts}) {
  return (
    <div className="Sidebar">
      <a href="/" onClick={(e) => {
        e.preventDefault();
        handleNavigation('home');
        setSelectedPost(null);
        setOnCommentPage(null);
      }}
      className={`nav-link ${currentView === 'home' ? 'active' : ''}`}>
        Home
      </a>
      <hr className="delimiter" />

      <div className="nav-section">
        <h3>Communities</h3>
        <button onClick={() => {
          handleNavigation('createCommunity');
          setSelectedPost(null);
          setOnCommentPage(null);
        }}
        className={`create-community-btn ${currentView === 'createCommunity' ? 'active' : ''}`}>
          Create Community
        </button>
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {communities.map((community) => (
            <li key={community._id}>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(`community/${community._id}`, community._id);
                    setSelectedPost(null);
                    setOnCommentPage(null);
                }}
                className={`nav-link ${currentView === `community/${community._id}` ? 'active' : ''}`}
            >
                {community.name}
            </a>
          </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
