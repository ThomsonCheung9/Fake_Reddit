// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
app.use(cors());
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

app.get("/", function (req, res) {
    res.send("Hello Phreddit!");
});

// search
app.get('/api/search', async (req, res) => {
  const term = req.query.term;
  if (!term) {
      return res.status(400).send("Search term is required");
  }
  try {
      const searchTerms = term.toLowerCase().split(' ').filter(t => t.length > 0);
      const matchingComments = await Comment.find({
          content: { $regex: searchTerms.join('|'), $options: 'i' }
      });
      const postIDsFromComments = matchingComments.map(comment => comment._id);
      const posts = await Post.find({
          $or: [
              { title: { $regex: searchTerms.join('|'), $options: 'i' } },
              { content: { $regex: searchTerms.join('|'), $options: 'i' } },
              { commentIDs: { $in: postIDsFromComments } }
          ]
      })
      .populate('linkFlairID')

      res.json(posts);
  } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).send("Search Error.");
  }
});


app.listen(8000, () => {console.log("Server listening on port 8000...");});
