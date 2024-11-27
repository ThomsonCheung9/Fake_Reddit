import React, { useContext } from 'react';
import { calculateTimeDifference, orderComment } from '../../utility.js';

const Comment = ({ commentsIDsOfPost, depth = 0, handleBackToList,
  setOnCommentPage, setCommentsIDsOfPost, posts, communities,
  comments, fetchPosts, post }) => {
  
  const getCommentByID = (id) => comments.find(comment => comment._id === id);

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
        </div>
        <p className="commentContent">{comment.content}</p>
        <div className="commentButtonContainer">
          <button onClick={() => {
            handleAddComment(comment);
          }}>Reply</button>
        </div>
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
