/* server/init.JSON
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script as inspiration, 
** but you cannot just copy and paste it--you script has to do more to handle
** users.
*/

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/users');
const LinkFlairModel = require('./models/linkflairs');
const CommentModel = require('./models/comments');
const PostModel = require('./models/posts');
const CommunityModel = require('./models/communities');

const mongoDB = 'mongodb://127.0.0.1:27017/phreddit';

async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

async function createAdmin(email, displayName, password) {
  const adminData = {
    firstName: 'Admin',
    lastName: 'Bro',
    email,
    displayName,
    password,
    isAdmin: true,
    reputation: 100,
  };

  try {
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin profile already exists.');
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    const adminUser = new User({
      ...adminData,
      password: hashedPassword,
    });

    await adminUser.save();
    console.log('Admin profile created successfully.');
  } catch (error) {
    console.error('Error creating admin profile:', error);
  }
}

function createLinkFlair(linkFlairObj) {
  let newLinkFlairDoc = new LinkFlairModel({
    content: linkFlairObj.content,
  });
  return newLinkFlairDoc.save();
}

function createComment(commentObj) {
  let newCommentDoc = new CommentModel({
    content: commentObj.content,
    commentedBy: commentObj.commentedBy,
    commentedDate: commentObj.commentedDate,
    commentIDs: commentObj.commentIDs,
    votes: commentObj.votes,
  });
  return newCommentDoc.save();
}

function createPost(postObj) {
  let newPostDoc = new PostModel({
    title: postObj.title,
    content: postObj.content,
    postedBy: postObj.postedBy,
    postedDate: postObj.postedDate,
    views: postObj.views,
    linkFlairID: postObj.linkFlairID,
    commentIDs: postObj.commentIDs,
    votes: postObj.votes,
  });
  return newPostDoc.save();
}

function createCommunity(communityObj) {
  let newCommunityDoc = new CommunityModel({
    name: communityObj.name,
    description: communityObj.description,
    postIDs: communityObj.postIDs,
    startDate: communityObj.startDate,
    members: communityObj.members,
    memberCount: communityObj.memberCount,
    createdBy: communityObj.createdBy
  });
  return newCommunityDoc.save();
}

async function createUser(userObj) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userObj.password, saltRounds);

  const newUser = new User({
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    email: userObj.email,
    displayName: userObj.displayName,
    password: hashedPassword,
    isAdmin: false,
    reputation: 100,
  });

  return newUser.save();
}

async function initializeDB() {
  try {
    // Link flair objects
    const linkFlair1 = { content: 'The jerkstore called...' };
    const linkFlair2 = { content: 'Literal Saint' };
    const linkFlair3 = { content: 'They walk among us' };
    const linkFlair4 = { content: 'Worse than Hitler' };
    const linkFlairRef1 = await createLinkFlair(linkFlair1);
    const linkFlairRef2 = await createLinkFlair(linkFlair2);
    const linkFlairRef3 = await createLinkFlair(linkFlair3);
    const linkFlairRef4 = await createLinkFlair(linkFlair4);
    const comment7 = { // comment 7
      content: 'Generic poster slogan #42',
      commentIDs: [],
      commentedBy: 'bigfeet',
      commentedDate: new Date('September 10, 2024 09:43:00'),
      votes: 70,
    };
    let commentRef7 = await createComment(comment7);
    
    const comment6 = { // comment 6
        content: 'I want to believe.',
        commentIDs: [commentRef7],
        commentedBy: 'outtheretruth47',
        commentedDate: new Date('September 10, 2024 07:18:00'),
        votes: 10,
    };
    let commentRef6 = await createComment(comment6);
    
    const comment5 = { // comment 5
        content: 'The same thing happened to me. I guest this channel does still show real history.',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 09, 2024 017:03:00'),
        votes: 30,
    }
    let commentRef5 = await createComment(comment5);
    
    const comment4 = { // comment 4
        content: 'The truth is out there.',
        commentIDs: [commentRef6],
        commentedBy: "astyanax",
        commentedDate: new Date('September 10, 2024 6:41:00'),
        votes: 45,
    };
    let commentRef4 = await createComment(comment4);
    
    const comment3 = { // comment 3
        content: 'My brother in Christ, are you ok? Also, YTJ.',
        commentIDs: [],
        commentedBy: 'rollo',
        commentedDate: new Date('August 23, 2024 09:31:00'),
        votes: 32,
    };
    let commentRef3 = await createComment(comment3);
    
    const comment2 = { // comment 2
        content: 'Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace.  YTJ.',
        commentIDs: [],
        commentedBy: 'astyanax',
        commentedDate: new Date('August 23, 2024 10:57:00'),
        votes: 25,
    };
    let commentRef2 = await createComment(comment2);
    
    const comment1 = { // comment 1
        content: 'There is no higher calling than the protection of Tesla products.  God bless you sir and God bless Elon Musk. Oh, NTJ.',
        commentIDs: [commentRef3],
        commentedBy: 'shemp',
        commentedDate: new Date('August 23, 2024 08:22:00'),
        votes: 18,
    };
    let commentRef1 = await createComment(comment1);
    
    // post objects
    const post1 = { // post 1
        title: 'AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.',
        content: 'Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots.  When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me.  So tell me prhreddit, was I the jerk?',
        linkFlairID: linkFlairRef1,
        postedBy: 'trucknutz69',
        postedDate: new Date('August 23, 2024 01:19:00'),
        commentIDs: [commentRef1, commentRef2],
        views: 14,
        votes: 150,
    };
    const post2 = { // post 2
        title: "Remember when this was a HISTORY channel?",
        content: 'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
        linkFlairID: linkFlairRef3,
        postedBy: 'MarcoArelius',
        postedDate: new Date('September 9, 2024 14:24:00'),
        commentIDs: [commentRef4, commentRef5],
        views: 1023,
        votes: 34,
    };
    let postRef1 = await createPost(post1);
    let postRef2 = await createPost(post2);
    
    // community objects
    const community1 = {// community object 1
        name: 'Am I the Jerk?',
        description: 'A practical application of the principles of justice.',
        postIDs: [postRef1],
        startDate: new Date('August 10, 2014 04:18:00'),
        members: ['rollo', 'shemp', 'catlady13', 'astyanax', 'trucknutz69'],
        memberCount: 4,
        createdBy: 'rollo',
    };
    const community2 = { // community object 2
        name: 'The History Channel',
        description: 'A fantastical reimagining of our past and present.',
        postIDs: [postRef2],
        startDate: new Date('May 4, 2017 08:32:00'),
        members: ['MarcoArelius', 'astyanax', 'outtheretruth47', 'bigfeet'],
        memberCount: 4,
        createdBy: 'MarcoArelius',
    };
    let communityRef1 = await createCommunity(community1);
    let communityRef2 = await createCommunity(community2);

    const usernames = new Set();
    [post1, post2].forEach(post => usernames.add(post.postedBy));
    [community1, community2].forEach(community => community.members.forEach(member => usernames.add(member)));
    [comment1, comment2, comment3].forEach(comment => usernames.add(comment.commentedBy));

    console.log('Creating users...');
    for (const username of usernames) {
      const user = {
        firstName: username,
        lastName: 'User',
        email: `${username}@example.com`,
        displayName: username,
        password: 'password123',
        isAdmin: false,
      };

      await createUser(user);
    }

    
    console.log('Sample data initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function main() {
  const email = process.argv[2];
  const displayName = process.argv[3];
  const password = process.argv[4];

  if (!email || !displayName || !password) {
    console.error('Usage: node init.js <email> <displayName> <password>');
    process.exit(1);
  }

  try {
    await connectToDatabase();
    await createAdmin(email, displayName, password);
    await initializeDB();
  } catch (error) {
    console.error('Main script error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

main();