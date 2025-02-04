import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const EditCommentPage = ({ userData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [comment, setComment] = useState(null);
  const [contentEntry, setContentEntry] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const commentFromState = location.state?.comment;
    if (commentFromState) {
      setComment(commentFromState);
      setContentEntry(commentFromState.content);
    } else {
      navigate('/profile');
    }
  }, [location, navigate]);

  const handleSubmit = async () => {
    if (!contentEntry) {
      setError('Content is required');
      return;
    }
    if (contentEntry.length > 500) {
      setError('Content cannot be more than 500 characters');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8000/api/comments/${comment._id}`, {
        content: contentEntry
      });

      if (response.status === 200) {
        navigate('/profile');
      } else {
        setError('Failed to update the comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('An error occurred while updating the comment');
    }
  };

  if (!comment) return <div>Loading...</div>;

  return (
    <div className="EditCommentPage" style={{marginLeft: '100px'}}>
      <div className="main-heading-container">
        <h2 className="main-heading">Edit Comment</h2>
        <p>Original Post: {comment.postTitle}</p>
      </div>

      <input
        type="text"
        placeholder="Enter your updated content*"
        value={contentEntry}
        onChange={(e) => setContentEntry(e.target.value)}
        className="comment-input"
      />

      {error && <div className="error-message">{error}</div>}
      <div>
        <button className="update-comment-button" onClick={handleSubmit}>
          Update Comment
        </button>
        <button 
          className="cancel-button" 
          onClick={() => navigate('/profile')}
        >
          Cancel
        </button>
      </div>

      <p className="required-note">*required field</p>
    </div>
  );
};

export default EditCommentPage;