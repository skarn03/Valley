const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const conversationController = require('../controller/ConversationController');

router.use(checkAuth);

router.post('/create',conversationController.createConversation);
router.get('/get/:userID',conversationController.getConversation);

module.exports = router;