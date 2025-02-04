import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Banner from '../Banner'; 
import SideBar from '../Sidebar';

export default function UserProfilePage({ userData, setUserData }) {
  const [currentView, setCurrentView] = useState('profile');
  const [userDetails, setUserDetails] = useState(null);
  const [userCommunities, setUserCommunities] = useState([]); 
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [onCommentPage, setOnCommentPage] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const searchTerm = e.target.value;
      console.log('Searching for:', searchTerm);
    }
  };

  const handleNavigation = (view, communityID = null) => {
    if (view === 'createCommunity') {
      navigate('/home', { state: { showCreateCommunity: true } });
      setCurrentView('createCommunity');
    } else if (view === 'home') {
      navigate('/home');
      setCurrentView('home');
    } else if (view.startsWith('community/') && communityID) {
      setCurrentView(view);
    }
    
    setSelectedPost(null);
    setOnCommentPage(null);
  };

  useEffect(() => {
    setIsAdmin(userData && userData.isAdmin === true);
  
    if (userData && userData.isAdmin) {
      const fetchAllUsers = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/users', {
            withCredentials: true
          });
          setAllUsers(response.data);
        } catch (error) {
          console.error('Error fetching users:', error);
          if (error.response && error.response.status === 403) {
            alert('You do not have admin privileges');
          }
        }
      };
      fetchAllUsers();
    }
  }, [userData]);

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

  const handleDeleteUser = async (userToDelete) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete user ${userToDelete.displayName}? All their communities, posts, and comments will be permanently deleted.`);
    
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8000/api/users/${userToDelete._id}`);
        setAllUsers(allUsers.filter(user => user._id !== userToDelete._id));
        alert(`User ${userToDelete.displayName} has been deleted.`);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const renderUsersList = () => {
    if (!isAdmin) return null;

    return (
      <div className="users-list">
        <h3>All Phreddit Users</h3>
        {allUsers.map(user => (
          <div key={user._id} className="user-item">
            <div 
              onClick={() => navigate(`/profile/${user._id}`)} 
              style={{ cursor: 'pointer' }}
            >
              <span>{user.displayName}</span>
              <span>{user.email}</span>
              <span>Reputation: {user.reputation}</span>
            </div>
            <button onClick={() => handleDeleteUser(user)}>Delete</button>
          </div>
        ))}
      </div>
    );
  };

  const handleEditCommunity = (community) => {
    navigate(`/edit-community/${community._id}`, { state: { community } });
  };

  const handleDeleteCommunity = async (communityId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this community? All posts and comments will also be deleted.');
    if (confirmDelete) {
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
    if (confirmDelete) {
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
    if (confirmDelete) {
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
    <div style={{marginLeft: '180px', marginTop: '50px'}}>
      <Banner 
        handleSearch={handleSearch}
        setCurrentView={setCurrentView}
        currentView={currentView}
        userData={userData}
        setUserData={setUserData}
      />
      <div className="content-container">
        <SideBar
          currentView={currentView}
          handleNavigation={handleNavigation}
          communities={userCommunities}
          setSelectedPost={setSelectedPost}
          setOnCommentPage={setOnCommentPage}
          userData={userData}
        />
        <div className="user-profile-container" style={{marginLeft: '180px', marginTop: '50px', flex: 1}}>
          <div className="user-info">
            <h2>{userDetails.displayName}'s Profile</h2>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Member Since:</strong> {new Date(userDetails.createdAt).toLocaleDateString()}</p>
            <p><strong>Reputation:</strong> {userDetails.reputation}</p>
          </div>

          <div className="profile-navigation">
            {isAdmin && (
              <button 
                onClick={() => setCurrentView('users')}
                style={currentView === 'users' ? { backgroundColor: 'grey', color: 'white' } : {}}
              >
                Users
              </button>
            )}
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
            {currentView === 'users' && renderUsersList()}

            {currentView === 'communities' && (
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

            {currentView === 'posts' && (
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

            {currentView === 'comments' && (
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