const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user-model');
const ConversationSchema = new Schema({
members:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
},{timestamps:true});

module.exports = mongoose.model('Conversation', ConversationSchema);
