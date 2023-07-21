const Post = require('../model/post-model');
const { validationResult } = require('express-validator');
const User = require('../model/user-model');
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: 'dcrcc9b4h',
    api_key: '638351652727691',
    api_secret: 'pjMWR4xBh2svNScZ_vFg5pyidH0',
});
class postController {

    static createPost = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg);
                return res.status(400).json({ errors: errorMessages });
            }
            const { title, image, imageID } = req.body;
            const newImg = image || "";
            const newTitle = title || "";

            const user = await User.findById(req.userData.userID);
            const newPost = new Post({
                creator: req.userData.userID,
                name: user.name,
                title: newTitle,
                image: newImg,
                imageID
            });

            const recent = await newPost.save();
            user.posts.push(recent._id);
            await user.save();

            res.status(200).json(recent);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static fetchPost = async (req, res) => {
        try {
            const id = req.params.id;
            const user = await User.findById(id)
                .populate('posts');
            res.status(200).json(user.posts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static updatePostLike = async (req, res) => {
        try {
            const { id } = req.body;

            const post = await Post.findById(id);

            if (post.likes.includes(req.userData.userID)) {
                // Remove user ID from the likes array
                post.likes = post.likes.filter(userId => userId != req.userData.userID);
            } else {
                // Add user ID to the likes array
                post.likes.push(req.userData.userID);
            }

            // Save the updated post
            const updatedPost = await post.save();
            res.json(updatedPost);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static deletePost = async (req, res) => {
        try {
            const { id } = req.body;
            const post = await Post.findById(id);

            if (!post) {
                throw new Error("Post not found");
            }
            if (post.creator != req.userData.userID) {
                throw new Error("Not authenticated to delete");
            }

            // Delete the Cloudinary image using the public_id
            if (post.image && post.imageID) {

                await cloudinary.uploader.destroy(post.imageID);
            }
            // Delete the post from the database
            await Post.findByIdAndDelete(id);
            await post.remove();

            res.json({ message: "Post deleted successfully" });
        } catch (error) {
            res.json({ message: error.message });
        }
    }
    static updatePost = async (req, res) => {
        try {
            const { id, title } = req.body;
            const post = await Post.findByIdAndUpdate(id, { title }, { new: true });

            if (!post) {
                throw new Error("Post not found");
            }

            res.json(post);
        } catch (error) {
            res.json({ message: error.message });
        }
    }
    static async getLatestFriendPosts(req, res) {
        try {
            const userId = req.userData.userID;
            const user = await User.findById(userId).populate('friends');
            // Get the list of friends' user IDs
            const friendIds = user.friends.map(friend => friend._id);

            // Get the page number and limit from the query parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Calculate the skip value based on the page and limit
            const skip = (page - 1) * limit;

            // Find the posts created by the user's friends with pagination
            const friendPosts = await Post.find({ creator: { $in: friendIds } })
                .populate({
                    path: 'creator',
                    select: '_id' // Include only the _id field of the creator object
                })
                .sort({ createdAt: -1 }) // Sort by descending order of creation date
                .skip(skip) // Skip the specified number of posts
                .limit(limit); // Limit the number of posts to retrieve

            res.status(200).json(friendPosts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }



}
module.exports = postController;