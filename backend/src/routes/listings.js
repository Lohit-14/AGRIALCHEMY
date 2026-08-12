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
  filename: (req,file,cb)=>cb(null, genId('img')+path.extname(file.originalname))
});
const upload = multer({storage, limits:{fileSize:5*1024*1024}});

// Create listing - farmer only
router.post('/', authMiddleware, requireRole('farmer','admin'), upload.single('photo'), (req,res)=>{
  const { waste_type, quantity, price_per_kg, quality_grade, geo_lat, geo_lng, description } = req.body;
  if(!waste_type || !quantity || !price_per_kg) return res.status(400).json({error:'Missing required fields'});
  let photo_url = '';
  if(req.file){
    photo_url = `/uploads/${req.file.filename}`;
  } else if(req.body.photo_base64){
    // allow base64 for demo
    photo_url = req.body.photo_base64.slice(0,100) ? req.body.photo_base64 : '';
    // if base64, we keep as is (frontend can handle)
    if(req.body.photo_base64 && req.body.photo_base64.startsWith('data:')){
      photo_url = req.body.photo_base64;
    }
  }
  const listing = {
    id: genId('l'),
    farmer_id: req.user.role==='admin' ? (req.body.farmer_id||req.user.id) : req.user.id,
    waste_type,
    quantity: parseFloat(quantity),
    price_per_kg: parseFloat(price_per_kg),
    quality_grade: quality_grade||'B1',
    photo_url,
    geo_lat: parseFloat(geo_lat)||12.9716,
    geo_lng: parseFloat(geo_lng)||77.5946,
    status: req.user.role==='admin' ? 'APPROVED' : 'PENDING',
    created_at: new Date().toISOString(),
    description: description||''
  };
  const listings = read('listings', []);
  listings.push(listing);
  write('listings', listings);
  res.status(201).json(listing);
});

router.get('/', authMiddleware, (req,res)=>{
  const listings = read('listings', []);
  const { role, id } = req.user;
  if(role==='farmer'){
    return res.json(listings.filter(l=>l.farmer_id===id));
  }
  if(role==='admin'){
    return res.json(listings);
  }
  // company and collector shouldn't see raw listings per PRD, but allow for matching console admin view
  if(role==='collector'){
    return res.json([]); // collectors don't see listings
  }
  // company: return empty (they see only matched via orders)
  return res.json([]);
});

router.get('/all', authMiddleware, requireRole('admin'), (req,res)=>{
  res.json(read('listings', []));
});

router.patch('/:id/approve', authMiddleware, requireRole('admin'), (req,res)=>{
  const listings = read('listings', []);
  const l = listings.find(x=>x.id===req.params.id);
  if(!l) return res.status(404).json({error:'Not found'});
  l.status='APPROVED';
  write('listings', listings);
  res.json(l);
});

router.patch('/:id/reject', authMiddleware, requireRole('admin'), (req,res)=>{
  const listings = read('listings', []);
  const l = listings.find(x=>x.id===req.params.id);
  if(!l) return res.status(404).json({error:'Not found'});
  l.status='REJECTED';
  write('listings', listings);
  // trust score decrement
  const users = read('users', []);
  const farmer = users.find(u=>u.id===l.farmer_id);
  if(farmer){ farmer.trust_score = Math.max(0, farmer.trust_score-20); write('users', users); }
  res.json(l);
});

router.get('/:id', authMiddleware, (req,res)=>{
  const l = read('listings', []).find(x=>x.id===req.params.id);
  if(!l) return res.status(404).json({error:'Not found'});
  // access control
  if(req.user.role==='farmer' && l.farmer_id!==req.user.id) return res.status(403).json({error:'Forbidden'});
  res.json(l);
});

module.exports = router;
