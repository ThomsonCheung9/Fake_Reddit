import { useState } from 'react';
import axios from 'axios';

function CreatePostPage({ communities, linkflairs, addNewPost, navigateToHome }) {
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [linkFlair, setLinkFlair] = useState('');
  const [newLinkFlair, setNewLinkFlair] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const validationErrors = {};
    if (!selectedCommunity) validationErrors.community = 'Community selection is required';
    if (!title || title.length > 100) validationErrors.title = 'Title is required and must be under 100 characters';
    if (newLinkFlair && newLinkFlair.length > 30) validationErrors.newLinkFlair = 'Link flair must be under 30 characters';
    if (!content) validationErrors.content = 'Content is required';
    if (!username) validationErrors.username = 'Username is required';
    
    if (linkFlair && newLinkFlair) {
      validationErrors.linkFlair = 'You can only choose one: either select a link flair or create a new one';
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    let flairID = linkFlair;
    if (newLinkFlair) { 
      try {
        const response = await axios.post('http://localhost:8000/api/linkflairs', { content: newLinkFlair });

        flairID = response.data._id;
      } catch (error) {
        console.error('Error creating new link flair:', error);
        setErrors({ ...errors, newLinkFlair: 'Failed to create new link flair' });
        return;
      }
    }

    const newPostData = {
      communityID: selectedCommunity,
      title,
      content,
      postedBy: username,
      linkFlairID: flairID || null,
      postedDate: new Date().toISOString(),
      views: 0,
      commentIDs: [],
    };
    try {
      await addNewPost(newPostData);
      navigateToHome();
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      <div>
        <label>Community (required)</label>
        <select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)}>
          <option value="">Select a community</option>
          {communities.map((community) => (
            <option key={community._id} value={community._id}>{community.name}</option>
          ))}
        </select>
        {errors.community && <p style={{ color: 'red' }}>{errors.community}</p>}
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
        <select value={linkFlair} onChange={(e) => setLinkFlair(e.target.value)}> {/*use this*/}
          <option value="">Select a link flair</option>
          {linkflairs.map((flair) => (
            <option key={flair._id} value={flair._id}>{flair.content}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Or create new flair"
          value={newLinkFlair}
          onChange={(e) => setNewLinkFlair(e.target.value)}
          maxLength="30"
        />
        {errors.newLinkFlair && <p style={{ color: 'red' }}>{errors.newLinkFlair}</p>}
        {errors.linkFlair && <p style={{ color: 'red' }}>{errors.linkFlair}</p>}
      </div>
  
      <div>
        <label>Content (required)</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        {errors.content && <p style={{ color: 'red' }}>{errors.content}</p>}
      </div>
  
      <div>
        <label>Username (required)</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
      </div>
  
      <button onClick={handleSubmit}>Submit Post</button>
    </div>
  );  
}

export default CreatePostPage;
