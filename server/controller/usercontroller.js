const User = require("../model/user-model");
//encryptlibrary;
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: 'dcrcc9b4h',
    api_key: '638351652727691',
    api_secret: 'pjMWR4xBh2svNScZ_vFg5pyidH0',
});
class UserController {


    static signup = async (req, res) => {
        try {
            //checking validation results from express-validator middleware
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg);
                return res.status(400).json({ errors: errorMessages });
            }
            // Get userData from the request body
            const { name, DOB, email, password } = req.body;

            // Check if user with the same email already exists
            const existingUser = await User.findOne({ email: email });

            if (existingUser) {
                // User with the same email already exists
                throw new Error("User Already Exists , Log In instead");
            }

            //hashing password;
            const hashedPassword = await bcrypt.hash(password, 12);
            // Create a new user instance
            const newUser = new User({
                name,
                DOB,
                email,
                password: hashedPassword,
                verified: false
            });


            //token for local storage
            const token = jwt.sign({
                userID: newUser.id,
                email: newUser.email
            }, process.env.JWT_KEY,
                {
                    expiresIn: '24h'
                });
            if (!token) {
                throw new Error("Signing Up Failed ,Please Try again Later")
            }


            // Save the new user to the database
            const recent = await newUser.save();
            if (!recent) {
                throw new Error("Signing Up Failed ,Please Try again Later");
            }

            res.status(200).json
                ({
                    user: {
                        id: newUser.id
                    }, token: token, message: "Sign up Successful"
                });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static login = async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {

                throw new Error("Missing Details");
            }

            const { email, password } = req.body;

            //check if the user does have account
            const existingUser = await User.findOne({ email: email });
            if (!existingUser) {
                throw new Error("Invalid Credentials");
            }
            //check if the password is correct;
            const isValidPassword = await bcrypt.compare(password, existingUser.password);
            if (!isValidPassword) {
                throw new Error("Invalid Credentials");
            }
            //checking if the user is verified or not
            // if(!existingUser.verified){
            //     throw new Error("Please verify your email");
            // }
            //creating a localstorage jwt token
            const token = jwt.sign({
                userID: existingUser.id,
                email: existingUser.email
            },  process.env.JWT_KEY,
                {
                    expiresIn: '24h'
                });
            if (!token) {
                throw new Error("Can't Login , Please Try again later")
            }
            //sending a success response
            res.status(200).json({
                user: {
                    id: existingUser.id
                },
                message: "logged in",
                token: token
            })

        } catch (error) {
            console.error('Error in login:', error.message);
            res.status(500).json({ message: error.message });
        }
    }
    static setuser = async (req, res) => {
        try {
            const { userID, looking } = req.body;

            const user = await User.findById(userID)
                .populate({
                    path: looking,
                    select: '-password -email -posts -friends -pendingRequests',
                });

            if (!user) {
                throw new Error('User not found');
            }

            const populatedData = user[looking];

            res.status(200).json(populatedData);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    static getUserProfile = async (req, res) => {
        try {
            const id = req.params.id;
            const user = await User.findById(id).select('-password -email');
            if (!user) {
                throw new Error("Can't find user")
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static getUserByName = async (req, res) => {
        try {
            const name = req.params.name;
            const currentUserID = req.userData.userID;
            const you = await User.findById(currentUserID);

            if (name.startsWith('@')) {
                const id = name.substring(1);

                const user = await User.findById(id).select('name DOB email profilePic bio pendingRequests friends');


                if (user && user._id.toString() !== currentUserID) {
                    const modifiedUser = {
                        ...user._doc,
                        isPending: user.pendingRequests.includes(currentUserID),
                        isFriend: user.friends.includes(currentUserID),
                        isAdding: you.pendingRequests.includes(id)
                    };

                    res.status(200).json([modifiedUser]);
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            } else if (name.includes('@')) {
                // Email search
                const users = await User.find({ email: name, _id: { $ne: currentUserID } }).select(
                    'name DOB email profilePic bio pendingRequests friends'
                );

                const modifiedUsers = users.map((user) => ({
                    ...user._doc,
                    isPending: user.pendingRequests.includes(currentUserID),
                    isFriend: user.friends.includes(currentUserID),
                    isAdding: you.pendingRequests.includes(user.id || user._id)
                }));

                res.status(200).json(modifiedUsers);
            } else {
                // Name search
                const regex = new RegExp(name, 'i'); // Case-insensitive regex matching
                const users = await User.find({ name: { $regex: regex }, _id: { $ne: currentUserID } }).select(
                    'name DOB email profilePic bio pendingRequests friends'
                );
                const modifiedUsers = users.map((user) => ({
                    ...user._doc,
                    isPending: user.pendingRequests.includes(currentUserID),
                    isFriend: user.friends.includes(currentUserID),
                    isAdding: you.pendingRequests.includes(user.id || user._id)
                }));
                res.status(200).json(modifiedUsers);
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    static updateUserInfo = async (req, res) => {
        try {
            const { name, profilePic, bio, facebook, instagram, linkedin, discord, picID } = req.body;
            const currentUserID = req.userData.userID;
            const user = await User.findById(currentUserID);
            if (!user) {
                throw new Error("User doesn't exist");
            }
            if (user.profilePic != profilePic && user.picID && user.picID != "") {
                await cloudinary.uploader.destroy(user.picID);
            }
            const newImg = profilePic || "";
            user.name = name;
            user.profilePic = profilePic;
            user.bio = bio;
            user.facebook = facebook;
            user.instagram = instagram;
            user.linkedin = linkedin;
            user.discord = discord;
            user.picID = picID;
            await user.save();
            res.status(200).json({ message: "User details updated successfully" });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static sendFriendRequest = async (req, res) => {
        try {
            const { id } = req.body;
            const user = await User.findById(id);
            if (!user) {
                throw new Error("User doesn't exist");
            }

            if (user.pendingRequests.includes(req.userData.userID)) {
                // Remove user from pendingRequests array
                user.pendingRequests = user.pendingRequests.filter((userId) => userId != req.userData.userID);
                await user.save();

                res.status(200).json({ message: "Friend request cancelled" });
            } else {
                user.pendingRequests.push(req.userData.userID);
                await user.save();

                res.status(200).json({ message: "Friend request sent successfully" });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };
    static acceptFriendRequest = async (req, res) => {
        try {
            const { id } = req.body;
            const currentUserID = req.userData.userID;

            const you = await User.findByIdAndUpdate(currentUserID, {
                $pull: { pendingRequests: id },
                $push: { friends: id },
            });

            const user = await User.findByIdAndUpdate(id, {
                $pull: { pendingRequests: currentUserID },
                $push: { friends: currentUserID },
            });

            res.status(200).json({ message: 'Friend request accepted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    static unFriend = async (req, res) => {
        try {
            const { id } = req.body;
            const currentUserID = req.userData.userID;

            const you = await User.findByIdAndUpdate(currentUserID, {
                $pull: { friends: id },
            });

            const user = await User.findByIdAndUpdate(id, {
                $pull: { friends: currentUserID },
            });

            res.status(200).json({ message: 'Friend request accepted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static getUserSetting = async (req, res) => {
        try {
            const currentUserID = req.userData.userID;
            const user = await User.findById(currentUserID).select('name DOB email');
            if (!user) {
                throw new Error("No user exists");
            }
            res.status(200).json(user);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }

    }
    static updateUserSettings = async (req, res) => {
        try {
            const userId = req.userData.userID;
            const { name, dob, email, password } = req.body;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (name) {
                user.name = name;
            }

            if (dob) {
                user.DOB = dob;
            }

            if (email) {
                user.email = email;
            }

            if (password && password.oldPassword && password.newPassword) {
                const isPasswordValid = await bcrypt.compare(
                    password.oldPassword,
                    user.password
                );

                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Invalid old password' });
                }

                const isUpdatedPasswordValid = /^(?=.*[A-Z])(?=.*[!@#$%^&*.-])(?=.{8,32})/.test(password.newPassword);
                if (!isUpdatedPasswordValid) {
                    return res.status(400).json({ message: 'Invalid new password format' });
                }

                const hashedNewPassword = await bcrypt.hash(password.newPassword, 12);
                user.password = hashedNewPassword;
            }

            await user.save();

            res.status(200).json({ message: 'User settings updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    static getUserFriends = async (req, res) => {
        try {
            const userId = req.userData.userID;
            const user = await User.findById(userId).populate('friends', '-password -email -posts -friends -pendingRequests');

            if (!user) {
                throw new Error("User not found");
            }

            res.status(200).json(user.friends);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}

module.exports = UserController;
