const express = require('express');
const router = express.Router();
const { read, write, genId } = require('../utils/fileDB');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.post('/', authMiddleware, requireRole('company','admin'), (req,res)=>{
  const { waste_type, quantity_needed, max_price_per_kg, quality_grade, geo_lat, geo_lng, notes } = req.body;
  if(!waste_type || !quantity_needed || !max_price_per_kg) return res.status(400).json({error:'Missing fields'});
  const reqDoc = {
    id: genId('r'),
    company_id: req.user.role==='admin' ? (req.body.company_id||req.user.id) : req.user.id,
    waste_type,
    quantity_needed: parseFloat(quantity_needed),
    max_price_per_kg: parseFloat(max_price_per_kg),
    quality_grade: quality_grade||'B1',
    status:'OPEN',
    created_at:new Date().toISOString(),
    geo_lat: parseFloat(geo_lat)||12.9716,
    geo_lng: parseFloat(geo_lng)||77.5946,
    notes: notes||''
  };
  const reqs = read('requirements', []);
  reqs.push(reqDoc);
  write('requirements', reqs);
  res.status(201).json(reqDoc);
});

router.get('/', authMiddleware, (req,res)=>{
  const all = read('requirements', []);
  if(req.user.role==='company'){
    return res.json(all.filter(r=>r.company_id===req.user.id));
  }
  if(req.user.role==='admin'){
    return res.json(all);
  }
  return res.json([]);
});

router.get('/all', authMiddleware, requireRole('admin'), (req,res)=>{
  res.json(read('requirements', []));
});

module.exports = router;
