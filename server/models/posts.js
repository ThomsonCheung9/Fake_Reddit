const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String },
    linkFlairID: { type: Schema.Types.ObjectId, ref: 'LinkFlair', required: false },
    postedBy: { type: String, required: true },
    postedDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    commentIDs: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    votes: { type: Number, default: 0 },
});

PostSchema.virtual('url').get(function() {
  return `/posts/${this._id}`;
});

module.exports = mongoose.model('Post', PostSchema);
