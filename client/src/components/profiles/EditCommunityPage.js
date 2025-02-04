import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export default function EditCommunityPage({ userData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { communityId } = useParams();
  
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      const communityState = location.state?.community;
      
      if (communityState) {
        setCommunityName(communityState.name);
        setDescription(communityState.description);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/communities`);
        const community = response.data.find(comm => comm._id === communityId);
        
        if (community) {
          setCommunityName(community.name);
          setDescription(community.description);
        } else {
          setErrors({ general: 'Community not found' });
        }
      } catch (error) {
        console.error('Error fetching community details:', error);
        setErrors({ general: 'Failed to fetch community details' });
      }
    };
    if (!userData) {
      navigate('/login');
      return;
    }

    fetchCommunityDetails();
  }, [communityId, userData, navigate, location.state]);

  const validateInputs = async () => {
    const errors = {};
    
    if (!communityName || communityName.length > 100) {
      errors.communityName = 'Community name is required and should not exceed 100 characters.';
    }

    if (!description || description.length > 500) {
      errors.description = 'Description is required and should not exceed 500 characters.';
    }

    return errors;
  };

  const handleUpdateCommunity = async () => {
    const validationErrors = await validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const response = await axios.put(`http://localhost:8000/api/communities/${communityId}`, {
        name: communityName,
        description,
      });
  
      if (response.status === 200) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Failed to update community:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Failed to update community. Please try again.' 
      });
    }
  };
  
  return (
    <div style={{ marginLeft: '100px' }}>
      <h2>Edit Community</h2>
      
      {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
      
      <div>
        <label>Community Name (required)</label>
        <input
          type="text"
          value={communityName}
          onChange={(e) => setCommunityName(e.target.value)}
          maxLength="100"
        />
        {errors.communityName && <p style={{ color: 'red' }}>{errors.communityName}</p>}
      </div>
      
      <div>
        <label>Description (required)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength="500"
        />
        {errors.description && <p style={{ color: 'red' }}>{errors.description}</p>}
      </div>
      
      <button onClick={handleUpdateCommunity}>Update Community</button>
      <button onClick={() => navigate('/profile')}>Cancel</button>
    </div>
  );
}