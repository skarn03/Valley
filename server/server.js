const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const userRoute = require('./routes/user-routes');
const conversationRoute = require("./routes/conversation-routes");
const message = require("./routes/message-routes");
const Conversation = require("./model/Conversation-model");
const cors = require('cors');
const postRoute = require('./routes/post-routes');
const http = require('http').createServer(app);
const { Server } = require('socket.io'); // Import the Server class from Socket.IO

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversation', conversationRoute);
app.use('/api/message', message);

// Promise
mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yhyxttz.mongodb.net/${process.env.DB_NAME}`, 
        { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        http.listen(process.env.port ||port, () => {
            console.log('Connected to MongoDB & Backend');
        });

        // Socket.io event handlers
        const io = new Server(http, {
            cors: {
                origin: '*',
                methods: ["GET", "POST", "DELETE", "PATCH"],
            },
        });

        io.on('connection', (socket) => {
            console.log('A user connected');
            socket.on('joinRoom', (roomID) => {
                console.log("inside room", roomID);
                socket.join(roomID);
            });
            socket.on('sendMessage', async (data) => {
                try {
                    // Save the message to the database (if necessary)
                    // ...

                    // Emit the received message to the specific room
                    io.to(data.roomID).emit('receiveMessage', data.message);

                    // Check if the recipient user is connected (in the same socket room)
                    const recipientSocketIds = await io.in(data.roomID).allSockets();
                    const recipientConnected = recipientSocketIds.size > 1;

                    // If the recipient user is not connected, emit the newMessageNotification event to them
                    if (!recipientConnected) {
                        console.log("ok ok");
                        console.log(data.recipientID);
                        io.to(data.recipientID).emit('newMessageNotification');
                    }
                } catch (error) {
                    console.log(error);
                    // Handle error (e.g., display an error message)
                }
            });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
