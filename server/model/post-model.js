const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user-model');
const postSchema = new Schema({
    creator:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    image:{type:String , default:''},
    name:{type:String , default:''},
    imageID:{type:String,default:''},
    title:{type:String , default:''},
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:'User',default:[]}],
    createdAt: { type: Date, default: Date.now } // Add createdAt field with default value
});

module.exports = mongoose.model('Post', postSchema);
