import React, { useContext } from 'react';
import { calculateTimeDifference, orderComment } from '../../utility.js';
import axios from 'axios';

const Comment = ({ commentsIDsOfPost, depth = 0, handleBackToList,
  setOnCommentPage, setCommentsIDsOfPost, posts, communities,
  comments, fetchPosts, post, userData }) => {

  const getCommentByID = (id) => comments.find(comment => comment._id === id);

  const handleVote = async (commentId, voteType) => {
    if (userData.reputation < 50) {
      alert(`Your reputation is ${userData.reputation}, which is less than the required 50 to vote.`);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8000/api/comments/${commentId}/vote`, { voteType });
      alert(`Votes updated to: ${response.data.votes}, Commenter Reputation: ${response.data.userReputation}`);
      fetchPosts();
    } catch (error) {
      console.error('Error updating comment votes:', error);
    }
  };

  const handleAddComment = (comment) => {
    setOnCommentPage([post, comment, true, refreshComments]);
  };
  
  const refreshComments = () => {
    const updateComments = post.commentIDs;
    setCommentsIDsOfPost(updateComments);
    setOnCommentPage(null);
  }

  const recursiveComments = (idsArray, depth) => {
    
    const commentObjects = idsArray.map(id => getCommentByID(id)).filter(Boolean);

    let sortedArray = orderComment("Newest", commentObjects);
    return sortedArray.map((comment) => (
      <div key={comment._id} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="commentUser">
          {comment.commentedBy} | {calculateTimeDifference(comment.commentedDate)} 
          | <span className="comment-votes">Votes: {comment.votes}</span>
        </div>
        <p className="commentContent">{comment.content}</p>
        {userData && ( // Only show if userData exists
          <div className="commentButtonContainer">
            <button onClick={() => handleAddComment(comment)}>Reply</button>
            <button onClick={() => handleVote(comment._id, 'up')}>Up Vote</button>
            <button onClick={() => handleVote(comment._id, 'down')}>Down Vote</button>
          </div>
        )}
        {comment.commentIDs.length > 0 && (
          <div>
            {recursiveComments(comment.commentIDs, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return <div>{recursiveComments(commentsIDsOfPost, depth)}</div>;
};

export default Comment;
