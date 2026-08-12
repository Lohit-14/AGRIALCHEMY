const express = require('express');
const router = express.Router();
const { read, write, genId } = require('../utils/fileDB');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { getCandidatesForRequirement } = require('../utils/matching');

// List orders with role scoping
router.get('/', authMiddleware, (req,res)=>{
  // Auto-promote stale PENDING payments to PAID and PICKED_UP to COMPLETED (fixes stuck PROCESSING / In Transit)
  try{
    const payments = read('payments', []);
    const ordersAll = read('orders', []);
    const requirements = read('requirements', []);
    let changed=false;
    const now=Date.now();
    // Promote PENDING payments >3 sec to PAID
    payments.forEach(p=>{
      if(p.payment_status==='PENDING'){
        const age=(now - new Date(p.created_at).getTime())/1000;
        if(age>3){
          p.payment_status='PAID';
          p.paid_at=new Date().toISOString();
          p.gateway_response = p.gateway_response || {status:'SUCCESS', gateway:'AgriAlchemy Fake Gateway', message:'Auto-promoted stale PENDING->PAID'};
          changed=true;
          const ord = ordersAll.find(o=>o.id===p.order_id);
          if(ord && ord.status==='VERIFIED'){
            ord.status='PAID';
            ord.updated_at=new Date().toISOString();
          }
        }
      }
    });
    // Promote PICKED_UP >5 sec to COMPLETED (fixes in transit stuck)
    ordersAll.forEach(o=>{
      if(o.status==='PICKED_UP'){
        const age=(now - new Date(o.updated_at).getTime())/1000;
        if(age>5){
          o.status='COMPLETED';
          o.updated_at=new Date().toISOString();
          changed=true;
          // trust increment for farmer
          const users = read('users', []);
          const farmer = users.find(u=>u.id===o.farmer_id);
          if(farmer){
            farmer.trust_score = Math.min(200, farmer.trust_score+10);
            write('users', users);
          }
          // requirement should be completed when delivery done
          const req = requirements.find(r=>r.id===o.requirement_id);
          if(req){
            req.status='COMPLETED';
            req.updated_at=new Date().toISOString();
          }
        }
      }
      // If order is COMPLETED, also ensure requirement is COMPLETED (company requirement should come off after delivery)
      if(o.status==='COMPLETED'){
        const req = requirements.find(r=>r.id===o.requirement_id);
        if(req && req.status!=='COMPLETED'){
          req.status='COMPLETED';
          req.updated_at=new Date().toISOString();
          changed=true;
        }
      }
    });
    if(changed){
      write('payments', payments);
      write('orders', ordersAll);
      write('requirements', requirements);
      console.log('[Orders] Auto-promoted stale PENDING->PAID and PICKED_UP->COMPLETED and requirements to COMPLETED');
    }
  }catch(e){ console.error('promote in orders GET error', e); }

  const orders = read('orders', []);
  const { role, id } = req.user;
  if(role==='farmer') return res.json(orders.filter(o=>o.farmer_id===id));
  if(role==='company') return res.json(orders.filter(o=>o.company_id===id));
  if(role==='collector') return res.json(orders.filter(o=>o.collector_id===id));
  if(role==='admin') return res.json(orders);
  res.json([]);
});

// Matching preview for requirement
router.get('/match-preview/:requirementId', authMiddleware, requireRole('admin'), (req,res)=>{
  const candidates = getCandidatesForRequirement(req.params.requirementId);
  res.json(candidates);
});

// Create order (match) - admin only
router.post('/match', authMiddleware, requireRole('admin'), (req,res)=>{
  const { listing_id, requirement_id, matched_quantity } = req.body;
  if(!listing_id || !requirement_id) return res.status(400).json({error:'listing_id and requirement_id required'});
  const listings = read('listings', []);
  const requirements = read('requirements', []);
  const orders = read('orders', []);

  const listing = listings.find(l=>l.id===listing_id);
  const reqDoc = requirements.find(r=>r.id===requirement_id);
  if(!listing || !reqDoc) return res.status(404).json({error:'Listing or requirement not found'});
  if(listing.status!=='APPROVED') return res.status(400).json({error:'Listing not approved'});

  const qty = matched_quantity ? parseFloat(matched_quantity) : Math.min(listing.quantity, reqDoc.quantity_needed);
  if(qty<=0) return res.status(400).json({error:'Invalid qty'});

  const order = {
    id: genId('o'),
    listing_id: listing.id,
    requirement_id: reqDoc.id,
    collector_id: null,
    farmer_id: listing.farmer_id,
    company_id: reqDoc.company_id,
    status:'MATCHED',
    matched_quantity: qty,
    matched_price: listing.price_per_kg,
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString(),
    pickup_otp: Math.floor(1000+Math.random()*9000).toString()
  };
  orders.push(order);
  write('orders', orders);

  // update listing remaining
  const remainingListing = listing.quantity - qty;
  if(remainingListing<=0.01){
    listing.status='MATCHED';
    listing.quantity=0;
  } else {
    listing.quantity=remainingListing;
    listing.status='APPROVED';
  }
  write('listings', listings);

  // update requirement remaining
  const remainingReq = reqDoc.quantity_needed - qty;
  if(remainingReq<=0.01){
    reqDoc.status='MATCHED';
    reqDoc.quantity_needed=0;
  } else {
    reqDoc.status='PARTIALLY_MATCHED';
    reqDoc.quantity_needed=remainingReq;
  }
  write('requirements', requirements);

  res.status(201).json(order);
});

// Assign collector - admin only
router.patch('/:id/assign', authMiddleware, requireRole('admin'), (req,res)=>{
  const { collector_id } = req.body;
  if(!collector_id) return res.status(400).json({error:'collector_id required'});
  const orders = read('orders', []);
  const users = read('users', []);
  const order = orders.find(o=>o.id===req.params.id);
  if(!order) return res.status(404).json({error:'Order not found'});
  const collector = users.find(u=>u.id===collector_id && u.role==='collector');
  if(!collector) return res.status(404).json({error:'Collector not found'});
  if(order.status!=='MATCHED') return res.status(400).json({error:'Order must be MATCHED to assign'});
  order.collector_id = collector_id;
  order.status='ASSIGNED';
  order.updated_at=new Date().toISOString();
  write('orders', orders);
  res.json(order);
});

// Collector verification is separate route, but pickup confirmation here - AFTER payment
// New flow: MATCHED -> ASSIGNED -> VERIFIED -> PAID (company pays, gets receipt) -> PICKED_UP (collector after PAID) -> COMPLETED (farmer gets paid status)
router.patch('/:id/pickup-confirm', authMiddleware, (req,res)=>{
  const { otp } = req.body;
  const orders = read('orders', []);
  const order = orders.find(o=>o.id===req.params.id);
  if(!order) return res.status(404).json({error:'Order not found'});
  // only collector assigned or admin can confirm pickup
  if(req.user.role==='collector' && order.collector_id!==req.user.id) return res.status(403).json({error:'Not your pickup'});
  if(req.user.role==='company') return res.status(403).json({error:'Only collector can confirm pickup after payment'});
  if(otp!==order.pickup_otp) return res.status(400).json({error:'Invalid OTP'});

  // Must be PAID before pickup per new flow (company pays first, collector works after PAID)
  if(order.status!=='PAID'){
    return res.status(400).json({error:`Order must be PAID before pickup (company must pay first). Current: ${order.status}`});
  }

  order.status='PICKED_UP';
  order.updated_at=new Date().toISOString();
  write('orders', orders);

  // Auto move to COMPLETED after pickup (farmer gets final paid status and trust increment)
  setTimeout(()=>{
    const ords = read('orders', []);
    const o = ords.find(x=>x.id===order.id);
    if(o && o.status==='PICKED_UP'){
      o.status='COMPLETED';
      o.updated_at=new Date().toISOString();
      write('orders', ords);
      // trust increment for farmer
      const users = read('users', []);
      const farmer = users.find(u=>u.id===order.farmer_id);
      if(farmer){ farmer.trust_score = Math.min(200, farmer.trust_score+10); write('users', users); }
      // requirement should come off as soon as delivery is done (company side)
      const reqs = read('requirements', []);
      const req = reqs.find(r=>r.id===o.requirement_id);
      if(req){
        req.status='COMPLETED';
        req.updated_at=new Date().toISOString();
        write('requirements', reqs);
      }
    }
  }, 1000);

  res.json({message:'Pickup confirmed, order PICKED_UP -> will auto COMPLETED', order});
});

module.exports = router;
