import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Banner from '../Banner.js';
import SideBar from '../Sidebar.js';

export default function UserProfilePage({ userData, setUserData }) {
  const [activeView, setActiveView] = useState('posts');
  const [userDetails, setUserDetails] = useState(null);
  const [userCommunities, setUserCommunities] = useState([]); 
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  const handleNavigation = (view, communityId = null) => {
    switch(view) {
      case 'home':
        navigate('/home');
        break;
      case 'createCommunity':
        navigate('/home', { state: { showCreateCommunity: true } });
        break;
      case 'community':
        if (communityId) {
          navigate(`/home?communityId=${communityId}`);
        }
        break;
      default:
        console.log('Unhandled navigation:', view);
    }
  };

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const [userResponse, communitiesResponse, postsResponse, commentsResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/users/${userData.id}`),
          axios.get(`http://localhost:8000/api/users/${userData.id}/communities`), 
          axios.get(`http://localhost:8000/api/users/${userData.id}/posts`),
          axios.get(`http://localhost:8000/api/users/${userData.id}/comments`, {
            params: { includePostTitle: true }
          })
        ]);

        setUserDetails(userResponse.data);
        setUserCommunities(communitiesResponse.data); 
        setPosts(postsResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userData, navigate]);

  const handleEditCommunity = (community) => {
    navigate(`/edit-community/${community._id}`, { state: { community } });
  };

  const handleDeleteCommunity = async (communityId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this community? All posts and comments will also be deleted.');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8000/api/communities/${communityId}`);
        setUserCommunities(userCommunities.filter(comm => comm._id !== communityId));
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
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8000/api/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
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
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8000/api/comments/${commentId}`);
        setComments(comments.filter(comment => comment._id !== commentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    }
  };

  if (!userDetails) return <div>Loading...</div>;

  return (
    <div>
      <Banner 
        handleSearch={() => {}}
        setCurrentView={setActiveView} 
        currentView="profile" 
        userData={userData} 
        setUserData={setUserData}
        onWelcomePage={false}
      />
      <div style={{display: 'flex'}}>
        <SideBar 
          currentView="profile"
          handleNavigation={handleNavigation}
          communities={userCommunities}
          userData={userData}
          setSelectedPost={() => {}}
          setOnCommentPage={() => {}}
          fetchPosts={() => {}}
        />
        <div className="user-profile-container" style={{marginLeft: '180px', marginTop: '50px', flex: 1}}>
          <div className="user-info">
            <h2>{userDetails.displayName}'s Profile</h2>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Member Since:</strong> {new Date(userDetails.createdAt).toLocaleDateString()}</p>
            <p><strong>Reputation:</strong> {userDetails.reputation}</p>
          </div>

          <div className="profile-navigation">
            <button 
              onClick={() => setActiveView('posts')}
              style={activeView === 'posts' ? { backgroundColor: 'grey', color: 'white' } : {}}
            >
              Posts
            </button>
            <button 
              onClick={() => setActiveView('communities')}
              style={activeView === 'communities' ? { backgroundColor: 'grey', color: 'white' } : {}}
            >
              Communities
            </button>
            <button 
              onClick={() => setActiveView('comments')}
              style={activeView === 'comments' ? { backgroundColor: 'grey', color: 'white' } : {}}
            >
              Comments
            </button>
          </div>

          <div className="profile-content">
            {activeView === 'communities' && (
              <div className="communities-list">
                <h3>My Communities</h3>
                {userCommunities.length === 0 ? (
                  <p>You haven't created any communities yet.</p>
                ) : (
                  userCommunities.map(community => (
                    <div key={community._id} className="community-item">
                      <span>{community.name}</span>
                      <div>
                        <button onClick={() => handleEditCommunity(community)} style={{marginRight: '4px'}}>Edit</button>
                        <button onClick={() => handleDeleteCommunity(community._id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeView === 'posts' && (
              <div className="posts-list">
                <h3>My Posts</h3>
                {posts.length === 0 ? (
                  <p>You haven't created any posts yet.</p>
                ) : (
                  posts.map(post => (
                    <div key={post._id} className="post-item">
                      <span>{post.title}</span>
                      <div>
                        <button onClick={() => handleEditPost(post)} style={{marginRight: '4px'}}>Edit</button>
                        <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeView === 'comments' && (
                <div className="comments-list">
                  <h3>My Comments</h3>
                  {comments.length === 0 ? (
                    <p>You haven't made any comments yet.</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment._id} className="comment-item">
                        <div 
                          className="comment-link"
                          onClick={() => handleEditComment(comment)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span style={{marginRight: '10px'}}>Post: {comment.postTitle}</span>
                          <span>Comment: {comment.content.substring(0, 20)}...</span>
                        </div>
                        <div>
                          <button onClick={() => handleEditComment(comment)} style={{marginRight: '4px'}}>Edit</button>
                          <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}