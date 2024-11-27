import { useState } from 'react';
import axios from 'axios';

export default function CreateCommunity({ navigateToCommunityView, fetchCommunities }) {
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const errors = {};
    if (!communityName || communityName.length > 100) {
      errors.communityName = 'Community name is required and should not exceed 100 characters.';
    }
    if (!description || description.length > 500) {
      errors.description = 'Description is required and should not exceed 500 characters.';
    }
    if (!username) {
      errors.username = 'Username is required.';
    }
    return errors;
  };

  const handleCreateCommunity = async () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/api/communities', {
        name: communityName,
        description,
        members: [username],
      });
  
      if (response.status === 201) {
        fetchCommunities();
        navigateToCommunityView(response.data._id);
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    }
  };
  
  return (
    <div>
      <h2>Create a New Community</h2>
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
      <div>
        <label>Creator Username (required)</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
      </div>
      <button onClick={handleCreateCommunity}>Engender Community</button>
    </div>
  );
}
