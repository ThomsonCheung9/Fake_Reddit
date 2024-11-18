import React from 'react';

export default function Banner({ handleSearch, setCurrentView, currentView }) {
    return (
        <div id="header" className="header">
            <div className="titleContainer" id="titleLink" onClick={() => window.location.reload()}>
                Phreddit
            </div>
            <div className="searchBar">
                <input type="text" placeholder="Search Phreddit..." id="searchInput" onKeyDown={handleSearch}/>
            </div>
            <div className="titleCreatePost">
                <button className="createPostButton" onClick={() => setCurrentView('createPost')} style={currentView === 'createPost' ? { backgroundColor: '#ff4500' } : {}}>
                    Create Post
                </button>
            </div>
        </div>
    );
}
