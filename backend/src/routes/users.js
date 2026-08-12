const express = require('express');
const router = express.Router();
const { read, write } = require('../utils/fileDB');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/me', authMiddleware, (req,res)=>{
  res.json({user: req.user});
});

router.get('/', authMiddleware, requireRole('admin'), (req,res)=>{
  const users = read('users', []);
  res.json(users);
});

router.patch('/:id/status', authMiddleware, requireRole('admin'), (req,res)=>{
  const { status } = req.body;
  if(!['active','suspended'].includes(status)) return res.status(400).json({error:'Invalid status'});
  const users = read('users', []);
  const u = users.find(x=>x.id===req.params.id);
  if(!u) return res.status(404).json({error:'User not found'});
  u.status = status;
  write('users', users);
  res.json({message:`User ${status}`, user:u});
});

router.patch('/:id/availability', authMiddleware, (req,res)=>{
  const users = read('users', []);
  const u = users.find(x=>x.id===req.params.id);
  if(!u) return res.status(404).json({error:'User not found'});
  // only self or admin
  if(req.user.id!==u.id && req.user.role!=='admin') return res.status(403).json({error:'Forbidden'});
  if(u.role!=='collector') return res.status(400).json({error:'Only collectors have availability'});
  u.availability = !u.availability;
  write('users', users);
  res.json({user:u});
});

module.exports = router;
