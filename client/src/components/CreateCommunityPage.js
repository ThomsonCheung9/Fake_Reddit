import { useState } from 'react';
import axios from 'axios';

export default function CreateCommunity({ navigateToCommunityView, fetchCommunities, userData }) {
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validateInputs = async () => {
    const errors = {};
    
    if (!communityName || communityName.length > 100) {
      errors.communityName = 'Community name is required and should not exceed 100 characters.';
    } else {
      try {
        const existingCommunity = await axios.get('http://localhost:8000/api/communities');
        const isDuplicate = existingCommunity.data.some(
          comm => comm.name.toLowerCase() === communityName.toLowerCase()
        );
        
        if (isDuplicate) {
          errors.communityName = 'A community with this name already exists.';
        }
      } catch (error) {
        console.error('Error checking community name:', error);
        errors.communityName = 'Error verifying community name.';
      }
    }

    if (!description || description.length > 500) {
      errors.description = 'Description is required and should not exceed 500 characters.';
    }

    return errors;
  };

  const handleCreateCommunity = async () => {
    if (!userData) {
      setErrors({ general: 'You must be logged in to create a community.' });
      return;
    }

    const validationErrors = await validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/api/communities', {
        name: communityName,
        description,
        members: [userData.displayName],
      });
  
      if (response.status === 201) {
        fetchCommunities();
        navigateToCommunityView(response.data._id);
      }
    } catch (error) {
      console.error('Failed to create community:', error);
      setErrors({ general: 'Failed to create community. Please try again.' });
    }
  };
  
  return (
    <div>
      <h2>Create a New Community</h2>
      
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
      
      <button onClick={handleCreateCommunity}>Create Community</button>
    </div>
  );
}