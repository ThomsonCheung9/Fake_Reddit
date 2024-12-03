import React, { useState } from 'react';
import axios from 'axios';
import { calculateTimeDifference } from '../../utility';

export default function CommunityHeader({ community = {}, userData, fetchPosts }) {
  const {
    name = 'Unnamed Community',
    description = 'No description available.',
    startDate,
    postIDs = [],
    memberCount = 0,
    members = [],
    createdBy
  } = community;

  const [localMemberCount, setLocalMemberCount] = useState(memberCount);
  const [isMember, setIsMember] = useState(
    userData ? members.includes(userData.displayName) : false
  );
  const [error, setError] = useState(null);

  const handleJoinLeave = async (action) => {
    if (!userData) return;

    try {
      const response = await axios.put(`http://localhost:8000/api/communities/${community._id}/${action}`, {
        displayName: userData.displayName
      });

      if (response.data.success) {
        if (action === 'join') {
          setLocalMemberCount(prev => prev + 1);
          setIsMember(true);
        } else {
          setLocalMemberCount(prev => prev - 1);
          setIsMember(false);
        }
        console.log("asd");
      }
    } catch (err) {
      console.error(`Error ${action}ing community:`, err);
      setError(`Failed to ${action} community. Please try again.`);
    }
  };

  return (
    <div className="community-header">
      <h1>{name}</h1>
      <p>{description}</p>
      <p>
        Created: {startDate ? calculateTimeDifference(startDate) : 'Unknown'}
        {createdBy && ` by ${createdBy}`}
      </p>
      <p>Posts: {postIDs.length} | Members: {localMemberCount}</p>
      
      {error && (
        <div className="community-error-message">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="dismiss-button"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {userData && !isMember && (
        <button 
          onClick={() => handleJoinLeave('join')}
          className="join-button"
        >
          Join Community
        </button>
      )}
      
      {userData && isMember && (
        <button 
          onClick={() => handleJoinLeave('leave')}
          className="leave-button"
        >
          Leave Community
        </button>
      )}
    </div>
  );
}