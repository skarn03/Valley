const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require('./post-model');



const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    DOB: { type: String, required: true },
    bio: { type: String, default: '' },
    profilePic: { type: String, default: 'https://static.thenounproject.com/png/5034901-200.png' },
    verified: { type: Boolean, default: false },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    discord: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    picID: { type: String }
});

module.exports = mongoose.model('User', userSchema);
