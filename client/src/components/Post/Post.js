import { postIDToCommunity, matchLinkFlair, calculateTimeDifference, getCommentsInPost } from '../../utility';


const Post = ({ postID, title, content, linkFlairID, postedBy, postedDate,
  commentIDs, views, isCommunity = false, posts, communities, comments,
   linkflairs, clickPost, votes}) => {

  const communityName = !isCommunity ? postIDToCommunity(postID, communities) : '';
  const amountOfComment = getCommentsInPost(postID, posts, comments).length;
  return (
    <div className="HomePost" onClick={clickPost}>
      <div className="community-user-timestamp">
        {!isCommunity && (
          <span className="HomePostCommunity">
            {communityName} | 
          </span>
        )}
        <span className="HomePostUser">
          {postedBy} |
        </span>
        <span className="HomePostTime">
          {calculateTimeDifference(postedDate)}
        </span>
      </div>

      <div className="post-title-container">
        <span>
          <h2 className="post-title">{title}</h2>
        </span>
      </div>

      {linkFlairID && (
        <span className="link-flair">
          {matchLinkFlair(linkFlairID, linkflairs)}
        </span>
      )}

      <div className="HomePostContent">
        <span>{content.length > 80 ? `${content.slice(0, 80)}...` : content}</span>
      </div>

      <div className="HomePostCount">
        <span className="view-count">Views: {views}</span>
        <span className="comment-count">Comments: {amountOfComment}</span>
        <span className="comment-count">Votes: {votes}</span>
      </div>
    </div>
  );
};

export default Post;
