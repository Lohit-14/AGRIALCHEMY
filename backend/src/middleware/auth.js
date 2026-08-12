const jwt = require('jsonwebtoken');
const { read } = require('../utils/fileDB');

const JWT_SECRET = process.env.JWT_SECRET || 'agrialchemy_super_secret_jwt_2026_change_in_prod';

function authMiddleware(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({error:'No token'});
  const token = header.split(' ')[1] || header;
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = read('users', []);
    const user = users.find(u=>u.id===decoded.id);
    if(!user) return res.status(401).json({error:'User not found'});
    if(user.status==='suspended') return res.status(403).json({error:'Account suspended'});
    req.user = user;
    next();
  }catch(e){
    return res.status(401).json({error:'Invalid token', details:e.message});
  }
}

function signToken(user){
  return jwt.sign({id:user.id, role:user.role, phone:user.phone}, JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN || '7d'});
}

module.exports = { authMiddleware, signToken };
