// LinkFlair Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LinkFlairSchema = new Schema({
    content: { type: String, required: true },
});

LinkFlairSchema.virtual('url').get(function() {
  return `/linkflair/${this._id}`;
});

module.exports = mongoose.model('LinkFlair', LinkFlairSchema);
