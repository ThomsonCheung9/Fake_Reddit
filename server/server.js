// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

//change 127.0.0.1 to localhost
mongoose.connect('mongodb://127.0.0.1:27017/phreddit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Post = require('./models/posts');
const Community = require('./models/communities');
const Comment = require('./models/comments');
const LinkFlair = require('./models/linkflairs');
const User = require('./models/users');
const bcrypt = require('bcrypt');
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false, 
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

//#region WelcomePages



app.get('/api/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'No active session found.' });
  }
});

app.post('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: 'Logout failed.' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ success: true, message: 'Logged out successfully.' });
      console.log("Succeeded so what now")
    });
  } else {
    res.status(400).json({ success: false, message: 'No active session to log out.' });
  }
});


app.post('/api/login', async (req, res) => {
  if (req.session && req.session.user) {
    return res.status(400).json({
      success: false,
      message: 'You are already logged in.',
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email is incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'password is incorrect' });
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      reputation: user.reputation,
    };

    res.json({ success: true, message: 'Login successful', user: req.session.user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Login failed due to server error' });
  }
});


app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, displayName, password} = req.body;

  if (!firstName || !lastName || !email || !displayName || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const displayNameExists = await User.findOne({ displayName });
    if (displayNameExists) {
      return res.status(400).json({ success: false, message: 'Display name is already taken.' });
    }

    const lowerPassword = password.toLowerCase();
    if (
      lowerPassword.includes(firstName.toLowerCase()) ||
      lowerPassword.includes(lastName.toLowerCase()) ||
      lowerPassword.includes(displayName.toLowerCase()) ||
      lowerPassword.includes(email.toLowerCase().split('@')[0])
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password must not contain your first name, last name, display name, or email ID.',
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstName,
      lastName,
      email,
      displayName,
      password: hashedPassword,
      isAdmin: false,
      reputation: 100,
    });

    await newUser.save();
    res.json({ success: true, message: 'Registration successful.'});
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
  }
});

//#endregion

//#region post and comment vote management

// Update votes on a post
app.put('/api/posts/:id/vote', async (req, res) => {
  try {
    const { voteType } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const user = await User.findOne({ displayName: post.postedBy });

    if (!user) {
      return res.status(404).send("User not found");
    }


    // Update post votes and user reputation
    if (voteType === 'up') {
      post.votes += 1;
      user.reputation += 5; // Increase reputation by 5
    } else if (voteType === 'down') {
      post.votes -= 1;
      user.reputation -= 10; // Decrease reputation by 10
    } else {
      return res.status(400).send("Invalid vote type");
    }

    // Save updates to post and user
    await post.save();
    await user.save();

    res.status(200).json({ votes: post.votes, userReputation: user.reputation});
  } catch (error) {
    console.error('Error in vote route:', error);
    res.status(500).send(error.message);
  }
});

app.put('/api/comments/:id/vote', async (req, res) => {
  try {
    const { voteType } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    const user = await User.findOne({ displayName: comment.commentedBy });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update comment votes and user reputation
    if (voteType === 'up') {
      comment.votes += 1;
      user.reputation += 5;
    } else if (voteType === 'down') {
      comment.votes -= 1;
      user.reputation -= 10;
    } else {
      return res.status(400).send("Invalid vote type");
    }

    await comment.save();
    await user.save();

    res.status(200).json({ votes: comment.votes, userReputation: user.reputation });
  } catch (error) {
    console.error('Error in comment vote route:', error);
    res.status(500).send(error.message);
  }
});


//#endregion

app.put('/api/posts/:id/views', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        post.views += 1;
        await post.save();

        res.status(200).json({ views: post.views });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/api/posts/:id/votes', async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      if (!post) {
          return res.status(404).send("Post not found");
      }

      post.views += 1;
      await post.save();

      res.status(200).json({ views: post.views });
  } catch (error) {
      res.status(500).send(error.message);
  }
});

app.post('/api/comments', async (req, res) => {
    try {
      const { content, commentedBy, commentedDate, commentIDs, parentCommentID, postID } = req.body;
  
      const newComment = new Comment({
        content,
        commentedBy,
        commentedDate,
        commentIDs,
      });
  
      const savedComment = await newComment.save();
  
      if (parentCommentID) {
        await Comment.findByIdAndUpdate(parentCommentID, { $push: { commentIDs: savedComment._id } });
      } else {
        await Post.findByIdAndUpdate(postID, { $push: { commentIDs: savedComment._id } });
      }
  
      res.status(201).json( {id: savedComment._id } );
    } catch (error) {
      res.status(500).send('Failed to add the comment');
    }
});
  
app.get('/api/posts', async (req, res) => {
  try {
      const posts = await Post.find().populate('linkFlairID');
      res.json(posts);
  } catch (error) {
      res.status(500).json({ message: 'Error getting posts', error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, postedBy, linkFlairID, communityID } = req.body;
    if (!title || !content || !postedBy) {
      return res.status(400).json({ message: 'Title, content, and username are required' });
    }
    const newPost = new Post({
      title,
      content,
      postedBy,
      linkFlairID: linkFlairID || null,
      postedDate: new Date(),
    });
    await newPost.save();
    if (communityID) {
      const community = await Community.findById(communityID);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      community.postIDs.push(newPost._id);
      await community.save();
    }
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
});

app.post('/api/community/:communityID/addPost', async (req, res) => {
  try {
    const { postID } = req.body;
    const { communityID } = req.params;
    const community = await Community.findById(communityID);
    if (!community) {
      return res.status(404).send('Community not found');
    }
    community.postIDs.push(postID);
    await community.save();
    res.status(200).json(community);
  } catch (err) {
    console.error('Error adding post to community:', err);
    res.status(500).send('Error adding post to community');
  }
});

//#region Data fectching

app.get('/api/communities', async (req, res) => {
    try {
        const communities = await Community.find().populate('postIDs');
        res.json(communities);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/linkflairs/:id', async (req, res) => {
  const linkFlairID = req.params.id;
  if (!linkFlairID || linkFlairID === 'null') {
      return res.status(400).send("Invalid Link Flair ID");
  }
  
  try {
      const linkFlair = await LinkFlair.findById(linkFlairID);
      if (!linkFlair) {
          return res.status(404).send("Link flair not found");
      }
      res.json(linkFlair);
  } catch (error) {
      console.error("Error get link flair:", error);
      res.status(500).send("Error getting link flair");
  }
});

app.post('/api/communities', async (req, res) => {
    try {
      const { name, description, members } = req.body;
      if (!name || !description || !members.length) {
        return res.status(400).send('All fields are required.');
      }
      const newCommunity = new Community({
        name,
        description,
        members,
        memberCount: 1,
      });
      const savedCommunity = await newCommunity.save();
      res.status(201).json(savedCommunity);
    } catch (error) {
      res.status(500).send('Failed to create community');
    }
  });  

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/linkflairs', async (req, res) => {
    try {
        const linkFlairs = await LinkFlair.find();
        res.json(linkFlairs);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/linkflairs', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).send('Link flair content is required.');
    }
    const newLinkFlair = new LinkFlair({ content });
    const savedLinkFlair = await newLinkFlair.save();
    res.status(201).json(savedLinkFlair);
  } catch (error) {
    console.error("Failed to create link flair:", error);
    res.status(500).send("Failed to create link flair");
  }
});

//#endregion

app.get("/", function (req, res) {
    res.send("Hello Phreddit!");
});

async function getUserCommunityPosts(userIdentifier) {
  try {
      const userCommunities = await Community.find({ 
          members: { $elemMatch: { $eq: userIdentifier } } 
      }).populate('postIDs');

      const postIDs = userCommunities.flatMap(community => 
          community.postIDs.map(post => post._id)
      );

      return await Post.find({ _id: { $in: postIDs } });
  } catch (error) {
      console.error('Error fetching user community posts:', error);
      throw error;
  }
}

// search
app.get('/api/search', async (req, res) => {
  const term = req.query.term;
  const userIdentifier = req.query.userIdentifier;
  const order = req.query.order || 'Newest';

  if (!term) {
      return res.status(400).send("Search term is required");
  }

  try {
      const searchTerms = term.toLowerCase().split(' ').filter(t => t.length > 0);
      const matchingComments = await Comment.find({
          content: { $regex: searchTerms.join('|'), $options: 'i' },
      });

      const postIDsFromComments = [...new Set(matchingComments.map(comment => comment.postID))];

      const baseQuery = {
          $or: [
              { title: { $regex: searchTerms.join('|'), $options: 'i' } },
              { content: { $regex: searchTerms.join('|'), $options: 'i' } },
              { _id: { $in: postIDsFromComments } },
          ],
      };

      const sortOptions = {
          'Newest': { postedDate: -1 },
          'Oldest': { postedDate: 1 },
          'Active': { votes: -1 },
      };

      const allMatchingPosts = await Post.find(baseQuery)
          .populate('linkFlairID')
          .sort(sortOptions[order]);

      const userCommunityPosts = userIdentifier
          ? await getUserCommunityPosts(userIdentifier)
          : [];

      const userCommunityPostIDs = new Set(userCommunityPosts.map(post => post._id.toString()));
      const postsInUserCommunities = [];
      const otherPosts = [];

      allMatchingPosts.forEach(post => {
          if (userCommunityPostIDs.has(post._id.toString())) {
              postsInUserCommunities.push(post);
          } else {
              otherPosts.push(post);
          }
      });

      const uniquePostsWithComments = postsInUserCommunities
          .concat(otherPosts)
          .map(post => ({
              ...post.toObject(),
              matchingComments: matchingComments.filter(
                  comment => comment.postID && comment.postID.toString() === post._id.toString()
              ),
          }));

      res.json({
          userCommunityPosts: postsInUserCommunities,
          otherPosts,
          postsWithComments: uniquePostsWithComments,
      });
  } catch (error) {
      console.error('Error searching posts:', error);
      res.status(500).send('Search Error.');
  }
});

app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

app.put('/api/communities/:communityId/join', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ success: false, message: 'Display name is required' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    if (community.members.includes(displayName)) {
      return res.status(400).json({ success: false, message: 'Already a member of this community' });
    }

    community.members.push(displayName);
    community.memberCount += 1;
    await community.save();

    res.json({ 
      success: true, 
      message: 'Joined community successfully', 
      memberCount: community.memberCount 
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ success: false, message: 'Failed to join community' });
  }
});

app.put('/api/communities/:communityId/leave', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ success: false, message: 'Display name is required' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const memberIndex = community.members.indexOf(displayName);
    if (memberIndex === -1) {
      return res.status(400).json({ success: false, message: 'Not a member of this community' });
    }

    community.members.splice(memberIndex, 1);
    community.memberCount -= 1;
    await community.save();

    res.json({ 
      success: true, 
      message: 'Left community successfully', 
      memberCount: community.memberCount 
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ success: false, message: 'Failed to leave community' });
  }
});

app.put('/api/communities/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      _id: { $ne: communityId } 
    });

    if (existingCommunity) {
      return res.status(400).json({ message: 'A community with this name already exists' });
    }

    community.name = name;
    community.description = description;

    await community.save();

    res.json(community);
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ message: 'Error updating community', error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }

  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

app.get('/api/users/:userId/communities', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const communities = await Community.find({ members: user.displayName });
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user communities', error: error.message });
  }
});

app.get('/api/users/:userId/posts', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const posts = await Post.find({ postedBy: user.displayName });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
});

app.get('/api/users/:userId/comments', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const comments = await Comment.find({ commentedBy: user.displayName });
    
    const commentsWithPostTitle = await Promise.all(comments.map(async (comment) => {
      const post = await Post.findOne({ commentIDs: comment._id });
      return {
        ...comment.toObject(),
        postTitle: post ? post.title : 'Unknown Post'
      };
    }));

    res.json(commentsWithPostTitle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user comments', error: error.message });
  }
});

app.delete('/api/communities/:communityId', async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const posts = await Post.find({ _id: { $in: community.postIDs } });
    const postIds = posts.map(post => post._id);

    await Comment.deleteMany({ _id: { $in: posts.flatMap(post => post.commentIDs) } });
    await Post.deleteMany({ _id: { $in: postIds } });
    await Community.findByIdAndDelete(req.params.communityId);
    
    res.json({ message: 'Community, posts, and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting community', error: error.message });
  }
});

app.delete('/api/posts/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Comment.deleteMany({ _id: { $in: post.commentIDs } });
    await Post.findByIdAndDelete(req.params.postId);
    
    res.json({ message: 'Post and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const deleteNestedComments = async (commentId) => {
      const nestedComments = await Comment.find({ commentIDs: commentId });
      
      for (let nestedComment of nestedComments) {
        await deleteNestedComments(nestedComment._id);
      }
      await Comment.findByIdAndDelete(commentId);
    };

    await deleteNestedComments(req.params.commentId);
    
    res.json({ message: 'Comment and associated replies deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

app.put('/api/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

app.put('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, communityID, linkFlairID } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.title = title;
    post.content = content;
    post.communityID = communityID;
    post.linkFlairID = linkFlairID || null;

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

app.delete('/api/users/:userId', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }

  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userCommunities = await Community.find({ members: user.displayName });
    for (let community of userCommunities) {
      const communityPosts = await Post.find({ _id: { $in: community.postIDs } });
      for (let post of communityPosts) {
        await Comment.deleteMany({ _id: { $in: post.commentIDs } });
      }
      await Post.deleteMany({ _id: { $in: community.postIDs } });
      await Community.findByIdAndDelete(community._id);
    }

    const userPosts = await Post.find({ postedBy: user.displayName });
    for (let post of userPosts) {
      await Comment.deleteMany({ _id: { $in: post.commentIDs } });
    }
    await Post.deleteMany({ postedBy: user.displayName });
    await Comment.deleteMany({ commentedBy: user.displayName });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated content deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

app.listen(8000, () => {console.log("Server listening on port 8000...");});

module.exports = app;