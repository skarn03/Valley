
const Conversation = require('../model/Conversation-model');

class conversationController {

    static createConversation = async (req, res) => {
        try {
            const newConversation = new Conversation({
                //need to update senderID to req.userData.userID
                members: [req.body.senderID, req.body.recieverID]
            })
            const savedConversation = await newConversation.save();
            res.status(200).json(savedConversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static getConversation = async (req, res) => {
        try {
            // Extract the user ID and other member's ID from request parameters
            const userId = req.userData.userID;
            const otherUserId = req.params.userID;

            // Find the conversation that includes both users
            const conversation = await Conversation.findOne({
                members: { $all: [userId, otherUserId] },
            });

            if (!conversation) {
                // If no conversation exists, create a new one with both users
                const newConversation = new Conversation({
                    members: [userId, otherUserId],
                });
                await newConversation.save();
                res.status(201).json(newConversation);
            } else {
                res.status(200).json(conversation);
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

}
module.exports = conversationController;
