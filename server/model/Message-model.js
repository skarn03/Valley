const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user-model');
const Conversation = require('./Conversation-model')
const MessageSchema = new Schema({
conversationID:{type:mongoose.Schema.Types.ObjectId,ref:'Conversation'},
sender:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
text:{ type:String}
},{timestamps:true});

module.exports = mongoose.model('Message', MessageSchema);
