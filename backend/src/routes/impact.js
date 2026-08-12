const express = require('express');
const router = express.Router();
const { read } = require('../utils/fileDB');
const { authMiddleware } = require('../middleware/auth');

function computeImpact(){
  const orders = read('orders', []).filter(o=>o.status==='COMPLETED');
  const payments = read('payments', []);
  let wasteDiverted=0, farmerIncome=0, commission=0;
  orders.forEach(o=>{ wasteDiverted += (o.matched_quantity||0); });
  payments.forEach(p=>{
    const order = orders.find(o=>o.id===p.order_id);
    if(order){
      farmerIncome += (p.net_farmer_payout||0);
      commission += (p.commission_amount||0);
    }
  });
  const settings = read('settings', {emissionFactor:1.5});
  const co2 = wasteDiverted * (settings.emissionFactor||1.5);
  return {
    waste_diverted_kg: wasteDiverted,
    total_farmer_income: farmerIncome,
    total_commission: commission,
    orders_completed: orders.length,
    co2_avoided_kg: co2
  };
}

router.get('/', (req,res)=>{
  // public teaser allowed without auth
  res.json(computeImpact());
});

router.get('/admin', authMiddleware, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({error:'Admin only'});
  res.json(computeImpact());
});

module.exports = router;
