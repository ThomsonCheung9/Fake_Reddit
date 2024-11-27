import React from 'react';
import { calculateTimeDifference } from '../../utility';

export default function CommunityHeader({ community = {} }) {
  const {
    name = 'Unnamed Community',
    description = 'No description available.',
    startDate,
    postIDs = [],
    memberCount = 0,
  } = community;

  return (
    <div className="community-header">
      <h1>{name}</h1>
      <p>{description}</p>
      <p>Created: {startDate ? calculateTimeDifference(startDate) : 'Unknown'}</p>
      <p>Posts: {postIDs.length} | Members: {memberCount}</p>
    </div>
  );
}
