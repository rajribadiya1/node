const { body, validationResult } = require('express-validator');

// Book validation rules
const validateBook = [
    body('title')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),
    
    body('author')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Author is required')
        .isLength({ max: 100 })
        .withMessage('Author must be less than 100 characters'),
    
    body('isbn')
        .trim()
        .isLength({ min: 10 })
        .withMessage('ISBN must be at least 10 characters')
        .isLength({ max: 13 })
        .withMessage('ISBN must be less than 13 characters'),
    
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('category')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Category is required'),
    
    body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    
    body('imageUrl')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL'),
    
    body('publishedDate')
        .optional()
        .isISO8601()
        .withMessage('Published date must be a valid date')
];

// User registration validation rules
const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters')
        .isLength({ max: 30 })
        .withMessage('Username must be less than 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// User login validation rules
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Order validation rules
const validateOrder = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must have at least one item'),
    
    body('items.*.book')
        .isMongoId()
        .withMessage('Invalid book ID'),
    
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    
    body('paymentMethod')
        .isIn(['credit_card', 'paypal', 'stripe'])
        .withMessage('Invalid payment method'),
    
    body('shippingAddress.street')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Street is required'),
    
    body('shippingAddress.city')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('City is required'),
    
    body('shippingAddress.zipCode')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Zip code is required')
];

// Profile update validation rules
const validateProfileUpdate = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters')
        .isLength({ max: 30 })
        .withMessage('Username must be less than 30 characters'),
    
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('phone')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
];

// Check validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateBook,
    validateRegistration,
    validateLogin,
    validateOrder,
    validateProfileUpdate,
    handleValidationErrors
};