// Community Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommunitySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    postIDs: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    startDate: { type: Date, default: Date.now },
    members: [{ type: String, required: true }],
    memberCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true, default: "test"},
});

CommunitySchema.virtual('url').get(function() {
  return `/community/${this._id}`;
});

module.exports = mongoose.model('Community', CommunitySchema);
