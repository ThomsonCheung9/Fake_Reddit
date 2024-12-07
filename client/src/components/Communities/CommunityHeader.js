import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateTimeDifference } from '../../utility';

export default function CommunityHeader({ community = {}, userData, navigateToHome, fetchPosts }) {
  const {
    _id,
    name = 'Unnamed Community',
    description = 'No description available.',
    startDate,
    postIDs = [],
    memberCount = 0,
    members = [],
    createdBy
  } = community;
  const [localMembers, setLocalMembers] = useState(members);
  const [localMemberCount, setLocalMemberCount] = useState(memberCount);
  const [isMember, setIsMember] = useState(
    userData ? localMembers.includes(userData.displayName) : false
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalMembers(members);
    setLocalMemberCount(memberCount);
    setIsMember(userData ? members.includes(userData.displayName) : false);
  }, [members, memberCount, userData]);

  const handleJoinLeave = async (action) => {
    if (!userData) return;
  
    try {
      const response = await axios.put(`http://localhost:8000/api/communities/${_id}/${action}`, {
        displayName: userData.displayName
      });
  
      if (response.data.success) {
        if (action === 'join') {
          setLocalMembers((prev) => [...prev, userData.displayName]);
          setLocalMemberCount((prev) => prev + 1);
          setIsMember(true);
        } else {
          setLocalMembers((prev) => prev.filter((member) => member !== userData.displayName));
          setLocalMemberCount((prev) => prev - 1);
          setIsMember(false);
        }
        if (action === 'join' || action === 'leave') {
          navigateToHome();
          fetchPosts();
        }
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