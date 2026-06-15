const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isVerified: user.isVerified || false,
  aadhaarNumber: user.aadhaarNumber,
  aadhaarName: user.aadhaarName,
});

const signToken = (user) => jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
);

exports.signup = async (req,res) => {
  const { name, email, password } = req.body;

  // Log incoming payload in non-production for debugging, but never print raw password
  if (process.env.NODE_ENV !== 'production') {
    const { password: pwd, ...safe } = req.body || {};
    console.log('Signup payload:', { ...safe, passwordLength: pwd ? pwd.length : 0 });
  }

  // Basic guard for direct API calls (frontend also validates)
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  try{
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ error: 'Email already registered' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      isEmailVerified: true,
    });
    const token = signToken(user);
    console.log('User created:', user._id);
    res.status(201).json({ user: publicUser(user), token });
  }catch(err){
    // Duplicate key error (e.g., email unique constraint)
    if (err && (err.code === 11000 || (err.keyPattern && err.keyPattern.email))) {
      console.error('Signup error - duplicate email:', err);
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Mongoose validation errors
    if (err && err.name === 'ValidationError') {
      console.error('Signup validation error:', err);
      return res.status(400).json({ error: 'Invalid user data' });
    }
    console.error('Signup error:', err.stack || err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Dev-only: list users for debugging duplicate emails and data issues
exports.listUsers = async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
  try {
    const users = await User.find().select('-passwordHash -__v');
    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req,res) => {
  const { email, password } = req.body;
  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    const token = signToken(user);
    res.json({ user: publicUser(user), token });
  }catch(err){
    console.error(err);res.status(500).json({ error: 'Server error' });
  }
};

exports.me = async (req,res) => {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(payload.id).select('-passwordHash');
    if(!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  }catch(err){
    res.status(401).json({ error: 'Invalid token' });
  }
};
