const { body, validationResult } = require('express-validator');

class validatePost {
    static validatePost() {
        return [
            body('author')
                .optional()
                .isLength({ max: 60 })
                .withMessage('Author cannot exceed 60 characters')
        ];
    }

    static validateFields(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(400).json({ message: 'Missing or Invalid Details', errors: errorMessages });
        }

        next();
    }
}

module.exports = validatePost;
