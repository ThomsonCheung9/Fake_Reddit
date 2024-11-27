import React from 'react';

const PostHeader = ({ communityName, sortByNewest, sortByOldest, sortByActive, postsOnScreen }) => {
  return (
    <div id="HomepageParentParent" className="HomepageParent">
      <div className="HomepageTop">
        <div className="title-btns">
          <div className="main-heading-container">
            <h2 className="main-heading">{communityName}</h2>
          </div>
          <div className="sort-post-buttons">
            <button id="newestButton" className="sort-button" onClick={sortByNewest}>Newest</button>
            <button id="oldestButton" className="sort-button" onClick={sortByOldest}>Oldest</button>
            <button id="activeButton" className="sort-button" onClick={sortByActive}>Active</button>
          </div>
        </div>
      </div>
      <div id="post-count-container"></div>
      {postsOnScreen && (communityName === 'All Posts' || communityName.startsWith('Results for:')) && (
        <div style={{ marginBottom: 40, marginLeft: 10 }}>{`Number of Post Displayed: ${postsOnScreen.length}`}</div>
      )}
    </div>
  );
};

export default PostHeader;
