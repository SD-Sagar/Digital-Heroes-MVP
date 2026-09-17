import { body, param, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

export const validateSignup = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  validate
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate
];

export const validateScore = [
  body('score').isInt({ min: 1, max: 45 }).withMessage('Score must be between 1 and 45'),
  body('date').isISO8601().withMessage('Valid date required'),
  validate
];

export const validateCharitySelection = [
  body('charityId').isUUID().withMessage('Valid charity ID required'),
  body('contributionPercentage')
    .isInt({ min: 10, max: 100 })
    .withMessage('Contribution percentage must be between 10 and 100'),
  validate
];

export const validateCharity = [
  body('name').trim().notEmpty().withMessage('Charity name required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  validate
];

export const validateDraw = [
  body('drawDate').isISO8601().withMessage('Valid draw date required'),
  body('drawType').isIn(['random', 'algorithmic']).withMessage('Draw type must be random or algorithmic'),
  validate
];

export const validateMongoId = [
  param('id').isUUID().withMessage('Valid ID required'),
  validate
];
