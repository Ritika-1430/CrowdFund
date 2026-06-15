const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/signup',
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      console.warn('Validation failed on /api/auth/signup:', errors.array(), 'body:', req.body);
      return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    }
    next();
  },
  authCtrl.signup);

router.post('/login',
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').exists().withMessage('Password is required'),
  (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    next();
  },
  authCtrl.login);

router.get('/me', authCtrl.me);

// Dev-only route to list users (useful for debugging duplicate emails)
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/users', authCtrl.listUsers);
}

module.exports = router;
