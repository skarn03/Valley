
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    if (req.method == 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error("Authentication failure ")
        }
        const decodedToken = jwt.verify(token, "34c49ab4ca8b54cf10cf81c4e6de07fe");
        req.userData = { userID: decodedToken.userID };
        next();
    } catch (err) {
        res.status(401).json({message:err.message});
    }
};
