const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const messageController = require('../controller/messageController');


router.use(checkAuth);
 router.post("/create",messageController.createMessage);
 router.get('/get/:conversationID',messageController.getMessage);

module.exports = router;
