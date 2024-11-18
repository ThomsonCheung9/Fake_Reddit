import React, { useState, useContext } from 'react';
import { ModelContext } from '../modelContext';
import axios from 'axios';

const CreateCommentPage = ({ comment = null, isReply = false,
  onCommentAdded, post, fetchPosts }) => {
  const modelInstance = useContext(ModelContext);
  const [contentEntry, setContentEntry] = useState('');
  const [userEntry, setUserEntry] = useState('');
  const [error, setError] = useState('');

  const formatDateString = (givenDate) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const month = months[givenDate.getMonth()];
    const day = String(givenDate.getDate()).padStart(2, '0');
    const year = givenDate.getFullYear();
    const hours = String(givenDate.getHours()).padStart(2, '0');
    const minutes = String(givenDate.getMinutes()).padStart(2, '0');
    const seconds = String(givenDate.getSeconds()).padStart(2, '0');

    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async () => {
    if (!contentEntry) {
      setError('Content is required');
      return;
    }
    if (contentEntry.length > 500) {
      setError('Content cannot be more than 500 characters');
      return;
    }
    if (!userEntry) {
      setError('Username is required');
      return;
    }

    try {
      const newComment = {
        content: contentEntry,
        commentedBy: userEntry,
        commentedDate: new Date(),
        commentIDs: [],
      };

    const response = await axios.post('http://localhost:8000/api/comments', {
      ...newComment,
      parentCommentID: isReply ? comment._id : null,
      postID: post._id,
    });

    if (response.status === 201) {
      fetchPosts();
      if (!isReply) {
        post.commentIDs.push(response.data.id);
      }
      setContentEntry('');
      setUserEntry('');
      setError('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } else {
      setError('Failed to create the comment');
    }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('An error occurred while adding the comment');
    }
  };

  return (
    <div className="CreateCommentPage">
      <div className="main-heading-container">
        <h2 className="main-heading">Create new comment</h2>
      </div>

      <input
        type="text"
        placeholder="Enter your content*"
        value={contentEntry}
        onChange={(e) => setContentEntry(e.target.value)}
        className="comment-input"
      />
      <input
        type="text"
        placeholder="Enter your username*"
        value={userEntry}
        onChange={(e) => setUserEntry(e.target.value)}
        className="username-input"
      />

      {error && <div className="error-message">{error}</div>}
      <div>
        <button className="add-comment-button" onClick={handleSubmit}>
          Add Comment
        </button>
      </div>
      

      <p className="required-note">*required field</p>
    </div>
  );
};

export default CreateCommentPage;