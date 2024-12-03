import React from 'react';

export default function SideBar({ currentView, handleNavigation, communities,
  setSelectedPost, setOnCommentPage, fetchPosts, userData }) {
    
  const sortedCommunities = userData 
    ? [
        ...communities.filter(community => 
          community.members.includes(userData.displayName)
        ),
        ...communities.filter(community => 
          !community.members.includes(userData.displayName)
        )
      ]
    : communities;

  return (
    <div className="Sidebar">
      <a 
        href="/" 
        onClick={(e) => {
          e.preventDefault();
          handleNavigation('home');
          setSelectedPost(null);
          setOnCommentPage(null);
        }}
        className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
      >
        Home
      </a>
      <hr className="delimiter" />

      <div className="nav-section">
        <h3>Communities</h3>
        <button 
          onClick={() => {
            if (userData) {
              handleNavigation('createCommunity');
              setSelectedPost(null);
              setOnCommentPage(null);
            }
          }}
          className={`create-community-btn 
            ${currentView === 'createCommunity' ? 'active' : ''} 
            ${!userData ? 'disabled' : ''}`}
          disabled={!userData}
        >
          Create Community
        </button>
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {sortedCommunities.map((community) => (
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
                {/* visuals lol */}
                {userData && community.members.includes(userData.displayName) && (
                  <span style={{ marginLeft: '5px', color: 'green', fontSize: '0.8em' }}>
                    ✓
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};