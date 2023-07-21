const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const validatePost = require('../middleware/validatePost');
const postController = require('../controller/postController');
const checkAdmin = require('../middleware/checkAdmin');

//checking for legit logged in user before providing any API endpoints.
router.use(checkAuth);
router.post('/createPost' ,validatePost.validatePost(),postController.createPost);
router.get('/getPost/:id',postController.fetchPost);
router.patch('/updatePostLike',postController.updatePostLike);
router.get('/suggestedpost',postController.getLatestFriendPosts)

router.use(checkAdmin);
router.delete('/deletePost',postController.deletePost)
router.patch('/update',postController.updatePost);

module.exports = router;
