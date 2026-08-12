const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { read, write, genId } = require('../utils/fileDB');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const uploadDir = path.join(__dirname, '../../uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, {recursive:true});
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null, uploadDir),
  filename: (req,file,cb)=>cb(null, genId('ver')+path.extname(file.originalname))
});
const upload = multer({storage});

router.post('/', authMiddleware, requireRole('collector','admin'), upload.single('photo'), (req,res)=>{
  const { order_id, verified_quantity, verified_grade } = req.body;
  if(!order_id || !verified_quantity) return res.status(400).json({error:'order_id and verified_quantity required'});
  const orders = read('orders', []);
  const order = orders.find(o=>o.id===order_id);
  if(!order) return res.status(404).json({error:'Order not found'});
  if(req.user.role==='collector' && order.collector_id!==req.user.id) return res.status(403).json({error:'Not your order'});
  if(order.status!=='ASSIGNED') return res.status(400).json({error:'Order must be ASSIGNED for verification'});

  let photo_url = '';
  if(req.file) photo_url = `/uploads/${req.file.filename}`;
  else if(req.body.photo_base64) photo_url = req.body.photo_base64;

  const ver = {
    id: genId('v'),
    order_id,
    collector_id: req.user.id,
    verified_quantity: parseFloat(verified_quantity),
    verified_grade: verified_grade||'B1',
    photo_url,
    verified_at:new Date().toISOString()
  };
  const vers = read('verifications', []);
  vers.push(ver);
  write('verifications', vers);

  order.status='VERIFIED';
  order.updated_at=new Date().toISOString();
  write('orders', orders);

  res.status(201).json(ver);
});

router.get('/:orderId', authMiddleware, (req,res)=>{
  const vers = read('verifications', []).filter(v=>v.order_id===req.params.orderId);
  res.json(vers);
});

module.exports = router;
