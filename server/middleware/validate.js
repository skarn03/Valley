const { body, validationResult } = require('express-validator');

class Validate {
    static validateSignup() {
        return [
            body('name').notEmpty().withMessage('Name is required'),
            body('DOB').notEmpty().withMessage('Date of Birth is required'),
            body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email is invalid'),
            body('password').notEmpty().withMessage('Password is required').matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*.-])(?=.{8,32})/).withMessage('Password must be at least 8 characters with 1 uppercase letter, 1 number, and a special character'),
            Validate.validateFields
        ];
    }

    static validateFields(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(400).json({ message: "Missing Or Invalid Details" });
        }

        next();
    }
    static validateLogin() {
        return [
            body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email is invalid'),
            body('password').notEmpty().withMessage('Password is required'),
            Validate.validateFields
        ];
    }
}

module.exports = Validate;
