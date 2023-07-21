const Message = require('../model/Message-model');

class messageController {
    static createMessage = async (req, res) => {
        try {
            const { conversationID, sender, text } = req.body;
            const newMessage = new Message({
                conversationID, sender:req.userData.userID, text
            })
            const savedMessage = await newMessage.save();
            res.status(200).json(savedMessage);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static getMessage = async (req, res) => {
        try {
            const { conversationID } = req.params;
            const messages = await Message.find({
                conversationID: conversationID
            });

            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}
module.exports = messageController;