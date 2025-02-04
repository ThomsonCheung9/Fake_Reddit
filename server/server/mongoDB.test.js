const mongoose = require('mongoose');
const Post = require('../models/posts');
const Comment = require('../models/comments');

describe('Post Deletion', () => {
  let connection;
  let postId;
  let commentIds = [];

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/phreddit', {
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const post = new Post({
      title: 'Test Post',
      content: 'Test Content',
      postedBy: 'TestUser',
      postedDate: new Date()
    });
    await post.save();
    postId = post._id;

    const topComment = new Comment({
      content: 'Top Level Comment',
      commentedBy: 'TestUser',
      commentedDate: new Date(),
      postID: postId
    });
    await topComment.save();

    const nestedComment = new Comment({
      content: 'Nested Comment',
      commentedBy: 'TestUser',
      commentedDate: new Date(),
      postID: postId,
      commentIDs: []
    });
    await nestedComment.save();

    const deepNestedComment = new Comment({
      content: 'Deep Nested Comment',
      commentedBy: 'TestUser',
      commentedDate: new Date(),
      postID: postId,
      commentIDs: []
    });
    await deepNestedComment.save();

    await Comment.findByIdAndUpdate(nestedComment._id, { 
      $push: { commentIDs: deepNestedComment._id } 
    });

    await Post.findByIdAndUpdate(postId, { 
      $push: { commentIDs: [topComment._id, nestedComment._id] } 
    });

    commentIds = [topComment._id, nestedComment._id, deepNestedComment._id];
  });

  afterEach(async () => {
    await Post.deleteMany({});
    await Comment.deleteMany({});
  });

  it('should delete a post and all its associated comments', async () => {
    const deleteNestedComments = async (commentId) => {
      const comment = await Comment.findById(commentId);
      if (!comment) return;

      for (let childCommentId of comment.commentIDs) {
        await deleteNestedComments(childCommentId);
      }

      await Comment.findByIdAndDelete(commentId);
    };

    const post = await Post.findById(postId);
    
    for (let commentId of post.commentIDs) {
      await deleteNestedComments(commentId);
    }
    await Post.findByIdAndDelete(postId);

    const postCheck = await Post.findById(postId);
    expect(postCheck).toBeNull();

    for (let commentId of commentIds) {
      const commentCheck = await Comment.findById(commentId);
      expect(commentCheck).toBeNull();
    }
  });
});