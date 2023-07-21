const express = require('express');
const router = express.Router();
const userController = require('../controller/usercontroller');
const Validate = require('../middleware/validate');
const checkAuth = require('../middleware/checkAuth');

router.post('/signup', Validate.validateSignup(), userController.signup);
router.post('/login', Validate.validateLogin(), userController.login);

//checking for legit logged in user before providing any API endpoints.
router.use(checkAuth);

router.post('/setuser' ,userController.setuser);
router.get('/getuser/:name',userController.getUserByName);
router.get('/getProfile/:id',userController.getUserProfile);
router.patch('/sendFriendRequest',userController.sendFriendRequest);
router.patch('/acceptFriendRequest',userController.acceptFriendRequest);
router.patch('/unfriend',userController.unFriend);
router.patch('/update',userController.updateUserInfo);
router.get('/getUserSetting',userController.getUserSetting);
router.patch('/updateUserSettings',userController.updateUserSettings)
router.get('/friends',userController.getUserFriends);
module.exports = router;
