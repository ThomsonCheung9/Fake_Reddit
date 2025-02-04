import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function DynamicUserProfilePage({ currentUserData, setUserData }) {
  const [currentView, setCurrentView] = useState('profile');
  const [userDetails, setUserDetails] = useState(null);
  const [userCommunities, setUserCommunities] = useState([]); 
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  const { userId } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    setIsCurrentUserAdmin(currentUserData && currentUserData.isAdmin === true);
  }, [currentUserData]);

  useEffect(() => {
    if (!currentUserData) {
      navigate('/login');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const [userResponse, communitiesResponse, postsResponse, commentsResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/users/${userId}`, { withCredentials: true }),
          axios.get(`http://localhost:8000/api/users/${userId}/communities`, { withCredentials: true }), 
          axios.get(`http://localhost:8000/api/users/${userId}/posts`, { withCredentials: true }),
          axios.get(`http://localhost:8000/api/users/${userId}/comments`, { 
            withCredentials: true,
            params: { includePostTitle: true } 
          })
        ]);

        setUserDetails(userResponse.data);
        setUserCommunities(communitiesResponse.data); 
        setPosts(postsResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
        navigate('/home');
      }
    };

    fetchUserDetails();
  }, [userId, currentUserData, navigate]);

  const handleEditCommunity = (community) => {
    navigate(`/edit-community/${community._id}`, { state: { community } });
  };

  const handleDeleteCommunity = async (communityId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this community? All posts and comments will also be deleted.');
    if (confirmDelete && isCurrentUserAdmin) {
      try {
        await axios.delete(`http://localhost:8000/api/communities/${communityId}`);
        setUserCommunities(userCommunities.filter(comm => comm._id !== communityId));
        navigate('/home');
      } catch (error) {
        console.error('Error deleting community:', error);
        alert('Failed to delete community');
      }
    }
  };

  const handleEditPost = (post) => {
    navigate(`/edit-post/${post._id}`, { state: { post } });
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post? All comments will also be deleted.');
    if (confirmDelete && isCurrentUserAdmin) {
      try {
        await axios.delete(`http://localhost:8000/api/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
        navigate('/home');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleEditComment = (comment) => {
    navigate('/edit-comment', { state: { comment } });
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this comment? All replies will also be deleted.');
    if (confirmDelete && isCurrentUserAdmin) {
      try {
        await axios.delete(`http://localhost:8000/api/comments/${commentId}`);
        setComments(comments.filter(comment => comment._id !== commentId));
        navigate('/home');
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    }
  };

  if (!userDetails) return <div>Loading...</div>;

  return (
    <div className="container" style={{padding: '20px'}}>
      <button 
        onClick={() => navigate('/profile')} 
        style={{marginBottom: '20px', padding: '10px'}}
      >
        Back to My Profile
      </button>

      <div className="user-profile-container">
        <div className="user-info">
          <h2>{userDetails.displayName}'s Profile</h2>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Member Since:</strong> {new Date(userDetails.createdAt).toLocaleDateString()}</p>
          <p><strong>Reputation:</strong> {userDetails.reputation}</p>
        </div>

        <div className="profile-navigation">
          <button 
            onClick={() => setCurrentView('posts')}
            style={currentView === 'posts' ? { backgroundColor: 'grey', color: 'white' } : {}}
          >
            Posts
          </button>
          <button 
            onClick={() => setCurrentView('communities')}
            style={currentView === 'communities' ? { backgroundColor: 'grey', color: 'white' } : {}}
          >
            Communities
          </button>
          <button 
            onClick={() => setCurrentView('comments')}
            style={currentView === 'comments' ? { backgroundColor: 'grey', color: 'white' } : {}}
          >
            Comments
          </button>
        </div>

        <div className="profile-content">
          {currentView === 'communities' && (
            <div className="communities-list">
              <h3>Communities</h3>
              {userCommunities.length === 0 ? (
                <p>No communities found.</p>
              ) : (
                userCommunities.map(community => (
                  <div key={community._id} className="community-item">
                    <span>{community.name}</span>
                    {isCurrentUserAdmin && (
                      <div>
                        <button onClick={() => handleEditCommunity(community)} style={{marginRight: '4px'}}>Edit</button>
                        <button onClick={() => handleDeleteCommunity(community._id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {currentView === 'posts' && (
            <div className="posts-list">
              <h3>Posts</h3>
              {posts.length === 0 ? (
                <p>No posts found.</p>
              ) : (
                posts.map(post => (
                  <div key={post._id} className="post-item">
                    <span>{post.title}</span>
                    {isCurrentUserAdmin && (
                      <div>
                        <button onClick={() => handleEditPost(post)} style={{marginRight: '4px'}}>Edit</button>
                        <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {currentView === 'comments' && (
            <div className="comments-list">
              <h3>Comments</h3>
              {comments.length === 0 ? (
                <p>No comments found.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="comment-item">
                    <div>
                      <span style={{marginRight: '10px'}}>Post: {comment.postTitle}</span>
                      <span>Comment: {comment.content.substring(0, 20)}...</span>
                    </div>
                    {isCurrentUserAdmin && (
                      <div>
                        <button onClick={() => handleEditComment(comment)} style={{marginRight: '4px'}}>Edit</button>
                        <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}