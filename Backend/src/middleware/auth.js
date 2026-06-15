const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req,res,next) => {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: payload.id };
    // optionally load user
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({ error: 'Invalid token' });
    req.user.role = user.role;
    next();
  }catch(err){
    return res.status(401).json({ error: 'Invalid token' });
  }
};

exports.requireAdmin = (req,res,next) => {
  if(req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin required' });
};
