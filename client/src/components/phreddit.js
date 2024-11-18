import { useState, useEffect } from 'react';
import PostList from './Post/PostList.js';
import Banner from './Banner.js';
import PostHeader from './Post/PostHeader.js';
import SideBar from './Sidebar';
import CommunityHeader from './Communities/CommunityHeader';
import CreateCommunity from './CreateCommunityPage.js';
import CreatePostPage from './CreatePostPage.js';
import axios from 'axios';

export default function Phreddit() {

  const [orderPost, setOrderPost] = useState("Newest");
  const [postsOnScreen, setPostsOnScreen] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [isCommunity, setIsCommunity] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [onCommentPage, setOnCommentPage] = useState(null);
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [comments, setComments] = useState([]);
  const [linkflairs, setLinkflairs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = async (event) => {
    if (event.key === "Enter") {
      const term = event.target.value;
      setSearchTerm(term);
      setCreatingCommunity(false);
  
      if (term === '') {
        setSearchResults([]);
        setPostsOnScreen([]);
        setCurrentView('searchResults');
      } else {
        try {
          const response = await axios.get(`http://localhost:8000/api/search?term=${term}`);
          const results = response.data;
          setSearchResults(results);
          setPostsOnScreen(results);
          setCurrentView('searchResults');
        } catch (error) {
          console.error("Error search results:", error);
        }
      }
      setSelectedPost(null);
    }
  };

  const handleNavigation = (view, communityID = null) => {
    if (view === 'createCommunity') {
        setCreatingCommunity(true);
        setCurrentView('createCommunity');
        setPostsOnScreen([]);
    } else if (view === 'home') {
        setIsCommunity(false);
        setCreatingCommunity(false);
        setCurrentCommunity(null);
        setCurrentView('home');
        setPostsOnScreen(posts);
    } else {
        setCreatingCommunity(false);
        setCurrentView(view);
        setCurrentCommunity(communityID);
    }
    
    if (view.startsWith('community/')) {
        const community = communities.find(comm => comm._id.toString() === communityID.toString());
        if (community && community.postIDs && community.postIDs.length > 0) {
            const communityPostIDs = community.postIDs.map(post => post._id.toString());
            const communityPosts = posts.filter(post => communityPostIDs.includes(post._id.toString()));
            setPostsOnScreen(communityPosts);
            setIsCommunity(true);
        } else {
            setPostsOnScreen([]);
        }
    }
  };

  const navigateToCommunityView = async (communityID) => {
    setCreatingCommunity(false);
    setCurrentView(`community/${communityID}`);
    setCurrentCommunity(communityID);
    await fetchPosts(communityID);
  };

  const addNewPost = async (postData) => {
    try {
        if (postData.linkFlairID) {
            const response = await fetch(`http://localhost:8000/api/linkflairs/${postData.linkFlairID}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch link flair. Status: ${response.status}`);
            }
            const flairData = await response.json();
        }
        const postResponse = await fetch('http://localhost:8000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        });

        if (!postResponse.ok) {
            throw new Error(`Failed to create post. Status: ${postResponse.status}`);
        }

        const createdPost = await postResponse.json();
        
        const updatedPosts = [createdPost, ...posts];
        setPosts(updatedPosts);
        setPostsOnScreen(updatedPosts);
        handleNavigation('home');
        setSelectedPost(null);
        setOnCommentPage(null);
        fetchPosts();
        return createdPost;
    } catch (error) {
        console.error('Error adding post:', error);
        throw error;
    }
  };

  const fetchPosts = async (communityID = null) => {
    try {
      const responsePost = await axios.get('http://localhost:8000/api/posts');
      const allPosts = responsePost.data;
      
      const filteredPosts = communityID
        ? allPosts.filter(post => post.communityID === communityID)
        : allPosts;

      setPosts(allPosts);
      setPostsOnScreen(filteredPosts);

      const responseCommunities = await axios.get('http://localhost:8000/api/communities');
      setCommunities(responseCommunities.data);
      const responseComments = await axios.get('http://localhost:8000/api/comments');
      setComments(responseComments.data);
      const responseLinkflairs = await axios.get('http://localhost:8000/api/linkflairs');
      setLinkflairs(responseLinkflairs.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const communityName = currentView === 'home'
    ? 'All Posts'
    : currentView === 'searchResults'
    ? 'Results for: ' + searchTerm
    : '';

  return (
    <div style={{marginLeft: '180px', marginTop: '50px'}}>
      <Banner handleSearch={handleSearch} setCurrentView={setCurrentView} currentView={currentView}/>
      <div className="content-container">
        <SideBar
          currentView={currentView}
          handleNavigation={handleNavigation}
          communities={communities}
          setSelectedPost={setSelectedPost}
          setOnCommentPage={setOnCommentPage}
          fetchPosts={fetchPosts}
        />
        <div className="HomePost">
          {!onCommentPage && !creatingCommunity && currentView !== 'createPost' && 
            currentView !== 'createCommunity' && !selectedPost && (
            <PostHeader
              communityName={communityName}
              sortByNewest={() => setOrderPost("Newest")}
              sortByOldest={() => setOrderPost("Oldest")}
              sortByActive={() => setOrderPost("Active")}
              postsOnScreen={postsOnScreen}
            />
          )}
          
          {!loading ? (
            currentView === 'createPost' ? (
              <CreatePostPage
                communities={communities}
                linkflairs={linkflairs}
                addNewPost={async (postData) => {
                  await addNewPost(postData);
                  setCurrentView('home');
                }}
                navigateToHome={() => setCurrentView('home')}
              />
            ) : currentView === 'createCommunity' ? (
              <CreateCommunity
                navigateToCommunityView={navigateToCommunityView}
                fetchCommunities={fetchPosts}
              />
            ) : currentView.startsWith('community/') && currentCommunity && !selectedPost ? (
              <>
                <CommunityHeader community={communities.find(comm => comm._id.toString() === currentCommunity.toString())} />
                <PostList postsOnScreen={postsOnScreen} posts={posts} communities={communities}
                          comments={comments} linkflairs={linkflairs} order={orderPost}
                          isCommunity={isCommunity} selectedPost={selectedPost} 
                          setSelectedPost={setSelectedPost} setOnCommentPage={setOnCommentPage}
                          onCommentPage={onCommentPage} fetchPosts={fetchPosts}/>
              </>
            ) : (
              <PostList postsOnScreen={postsOnScreen} posts={posts} communities={communities}
                        comments={comments} linkflairs={linkflairs} order={orderPost}
                        isCommunity={isCommunity} selectedPost={selectedPost} 
                        setSelectedPost={setSelectedPost} setOnCommentPage={setOnCommentPage}
                        onCommentPage={onCommentPage} fetchPosts={fetchPosts}/>
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );    
}
