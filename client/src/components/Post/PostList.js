import { useEffect } from 'react';
import Post from './Post';
import { getCommentsInPost, orderComment } from '../../utility.js';
import PostPageView from './PostPageView.js';
import CreateCommentPage from '../CreateCommentPage.js';
const PostList = ({ postsOnScreen, posts, communities, comments, linkflairs, 
  order, selectedPost, setSelectedPost, onCommentPage, setOnCommentPage, fetchPosts,
  userData, setUserData
 }) => {

  //#region buttons sorting
  const sortByNewest = () => {
    postsOnScreen.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  };

  const sortByOldest = () => {
    postsOnScreen.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
  };

  const sortByActive = () => {
    postsOnScreen.sort((a, b) => {
      const commentsA = getCommentsInPost(a._id, posts, comments);
      const commentsB = getCommentsInPost(b._id, posts, comments);

      const latestCommentA = orderComment("Newest", commentsA)[0];
      const latestCommentB = orderComment("Newest", commentsB)[0];

      const dateA = latestCommentA ? new Date(latestCommentA.commentedDate) : new Date(a.postedDate);
      const dateB = latestCommentB ? new Date(latestCommentB.commentedDate) : new Date(b.postedDate);

      return dateB - dateA;
    });
  };

  if (order === "Newest") {
    sortByNewest();
  } else if (order === "Oldest") {
    sortByOldest();
  } else if (order === "Active") {
    sortByActive();
  }

  const handleBackToList = () => {
    setSelectedPost(null);
  };
  //#endregion

  if (onCommentPage) {
    return(
      <CreateCommentPage 
        post={onCommentPage[0]} 
        comment={onCommentPage[1]} 
        isReply={onCommentPage[2]} 
        onCommentAdded={onCommentPage[3]} 
        posts={posts}
        comments={comments}
        fetchPosts={fetchPosts}
        userData={userData}
      />
    );
  }

  if (selectedPost) {
    return (
      <PostPageView
        post={selectedPost}
        handleBackToList={handleBackToList}
        onCommentPage={onCommentPage}
        setOnCommentPage={setOnCommentPage}
        posts={posts}
        communities={communities}
        comments={comments}
        linkflairs={linkflairs}
        fetchPosts={fetchPosts}
        userData={userData} setUserData={setUserData}
      />
    );
  }

  return (
    <div id="HomepageParent">
      {postsOnScreen.map(post => (
        <Post
          key={post._id}
          postID={post._id}
          title={post.title}
          content={post.content}
          linkFlairID={post.linkFlairID}
          postedBy={post.postedBy}
          postedDate={post.postedDate}
          commentIDs={post.commentIDs}
          views={post.views}
          votes={post.votes}
          posts={posts} communities={communities} comments={comments} linkflairs={linkflairs}
          clickPost={() => {setSelectedPost(post)}}
          userData={userData} setUserData={setUserData}
        />
      ))}
    </div>
  );
};

export default PostList;
