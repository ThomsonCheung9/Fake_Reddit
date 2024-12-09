import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export default function EditPostPage({ userData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [linkFlair, setLinkFlair] = useState('');
  const [communities, setCommunities] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!userData) {
        navigate('/login');
        return;
      }
  
      const postState = location.state?.post;
  
      if (postState) {
        setTitle(postState.title);
        setContent(postState.content);
        setSelectedCommunity(postState.communityID || '');
        setLinkFlair(postState.linkFlairID || '');
        return;
      }
  
      try {
        const response = await axios.get(`http://localhost:8000/api/posts/${postId}`);
        const post = response.data;
        setTitle(post.title);
        setContent(post.content);
        setSelectedCommunity(post.communityID || '');
        setLinkFlair(post.linkFlairID || '');
      } catch (error) {
        console.error('Error fetching post details:', error);
        setErrors({ general: 'Failed to fetch post details' });
      }
    };
  
    fetchPostDetails();
  }, [postId, userData, navigate, location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [communitiesResponse, linkFlairsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/communities'),
          axios.get('http://localhost:8000/api/linkflairs'),
        ]);
        setCommunities(communitiesResponse.data);
        setLinkFlairs(linkFlairsResponse.data);
      } catch (error) {
        console.error('Error fetching communities or link flairs:', error);
        setErrors({ general: 'Failed to load required data' });
      }
    };

    fetchData();
  }, []);

  const validateInputs = () => {
    const validationErrors = {};
    if (!title || title.length > 100) {
      validationErrors.title = 'Title is required and should not exceed 100 characters.';
    }
    if (!content) {
      validationErrors.content = 'Content is required.';
    }
    if (!selectedCommunity) {
      validationErrors.selectedCommunity = 'Community selection is required.';
    }
    return validationErrors;
  };

  const handleUpdatePost = async () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const response = await axios.put(`http://localhost:8000/api/posts/${postId}`, {
        title,
        content,
        communityID: selectedCommunity,
        linkFlairID: linkFlair || null,
      });
  
      if (response.status === 200) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Failed to update post. Please try again.' 
      });
    }
  };

  return (
    <div style={{ marginLeft: '100px' }}>
      <h2>Edit Post</h2>

      {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}

      <div>
        <label>Community (required)</label>
        <select 
          value={selectedCommunity} 
          onChange={(e) => setSelectedCommunity(e.target.value)}
        >
          <option value="">Select a community</option>
          {communities.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
        </select>
        {errors.selectedCommunity && <p style={{ color: 'red' }}>{errors.selectedCommunity}</p>}
      </div>

      <div>
        <label>Title (required)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength="100"
        />
        {errors.title && <p style={{ color: 'red' }}>{errors.title}</p>}
      </div>

      <div>
        <label>Link Flair (optional)</label>
        <select value={linkFlair} onChange={(e) => setLinkFlair(e.target.value)}>
          <option value="">Select a link flair</option>
          {linkFlairs.map((flair) => (
            <option key={flair._id} value={flair._id}>
              {flair.content}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Content (required)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {errors.content && <p style={{ color: 'red' }}>{errors.content}</p>}
      </div>

      <button onClick={handleUpdatePost}>Update Post</button>
      <button onClick={() => navigate('/profile')} style={{ marginLeft: '10px' }}>
        Cancel
      </button>
    </div>
  );
}