import React, { useContext, useEffect, useState } from 'react';
import Comment from './Comment.js';
import { postIDToCommunity, calculateTimeDifference, getCommentsInPost, matchLinkFlair} from '../../utility.js';
import axios from 'axios';

const PostPageView = ({ handleBackToList, onCommentPage, setOnCommentPage, post, 
  posts, communities, linkflairs, comments, fetchPosts, userData, setUserData
}) => {
  const amountOfComment = getCommentsInPost(post._id, posts, comments).length;
  
  const [views, setViews] = useState(post.views);
  const [votes, setVotes] = useState(post.votes);
  const [commentsIDsOfPost, setCommentsIDsOfPost] = useState([]);

  const refreshComments = () => {
    const updateComments = post.commentIDs;
    setCommentsIDsOfPost(updateComments);
    setOnCommentPage(null);
  }

  useEffect(() => {

    const updateViews = async () => {
        try {
            await axios.put(`http://localhost:8000/api/posts/${post._id}/views`);
            fetchPosts()
            setViews(views + 1);
        } catch (error) {
            console.error('Error updating post views:', error);
        }
    };

    updateViews();
}, []);

  useEffect(() => {
    const postComments = post.commentIDs;
    setCommentsIDsOfPost(postComments);
  }, [post._id]);

  const handleVote = async (voteType) => {
    if (userData.reputation < 50) {
      alert(`Your reputation is ${userData.reputation}, which is less than the required 50 to vote.`);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8000/api/posts/${post._id}/vote`, { voteType });
      setVotes(response.data.votes);
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };



  const handleAddComment = () => {
    setOnCommentPage([post, null, false, refreshComments]);
  };

  return (
    <div className="HomePost">
      <div className="community-user-timestamp">
        <span className="HomePostCommunity">
          {postIDToCommunity(post._id, communities)} | 
        </span>
        <span className="HomePostTime">
          {calculateTimeDifference(post.postedDate)} | 
        </span>
        <span className="HomePostUser">
          {post.postedBy}
        </span>
      </div>

      <div className="post-title-container">
        <h2 className="post-title">{post.title}</h2>
      </div>

      {post.linkFlairID && (
        <div className="link-flair">
          {matchLinkFlair(post.linkFlairID, linkflairs)}
        </div>
      )}

      <div className="HomePostContent">{post.content}</div>

      <div className="HomePostCount1">
        <span className="view-count">Views: {views}</span>
        <span className="comment-count">Comments: {amountOfComment}</span>
        <span className="comment-count">Votes: {votes}</span>
      </div>

      <div className="HomePostCount">
        {userData && ( // Only show buttons if userData exists
          <>
            <button className="comment-count" onClick={handleAddComment}>
              Add a comment
            </button>
            <button className="comment-count" onClick={() => handleVote('up')}>
              Up Vote Post
            </button>
            <button className="comment-count" onClick={() => handleVote('down')}>
              Down Vote Post
            </button>
          </>
        )}
      </div>

      <div className="postBody">
      {commentsIDsOfPost.length > 0 && <Comment commentsIDsOfPost={commentsIDsOfPost}
         handleBackToList={handleBackToList} onCommentPage={onCommentPage}
         setOnCommentPage={setOnCommentPage} setCommentsIDsOfPost={setCommentsIDsOfPost}
         communities={communities} comments={comments}
         fetchPosts={fetchPosts} post={post} userData={userData}/>}
      </div>
    </div>
  );
};

export default PostPageView;