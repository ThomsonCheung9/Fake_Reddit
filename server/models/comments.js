// Comment Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: { type: String, required: true },
    commentIDs: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    commentedBy: { type: String, required: true },
    commentedDate: { type: Date, default: Date.now }
});

CommentSchema.virtual('url').get(function() {
    return `/comments/${this._id}`;
});

module.exports = mongoose.model('Comment', CommentSchema);
