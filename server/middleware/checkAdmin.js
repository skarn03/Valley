
const Post = require('../model/post-model')
module.exports = async (req, res, next) => {


    try {
        const {id} = req.body;
        const post = await Post.findById(id);
        if(post.creator != req.userData.userID){
            throw new Error("Access Denied");
        }
        console.log("verified admin");
        next();
    } catch (err) {
        res.status(401).json({message:err.message});
    }
};
