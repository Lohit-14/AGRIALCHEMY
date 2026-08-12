const express = require('express');
const router = express.Router();
const { read, write, genId } = require('../utils/fileDB');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Helper to auto-promote stale PENDING payments (>3 sec) to PAID - fixes stuck PROCESSING
function promoteStalePending(){
  try{
    const payments = read('payments', []);
    const orders = read('orders', []);
    let changed = false;
    const now = Date.now();
    payments.forEach(p=>{
      if(p.payment_status==='PENDING'){
        const created = new Date(p.created_at).getTime();
        const ageSec = (now - created)/1000;
        if(ageSec > 3){ // 3 sec per request: 2-3 sec enough
          p.payment_status = 'PAID';
          p.paid_at = new Date().toISOString();
          if(!p.gateway_response){
            p.gateway_response = {
              status: 'SUCCESS',
              gateway: 'AgriAlchemy Fake Gateway',
              message: 'Payment auto-promoted from PENDING to PAID (stale >3s, fixes stuck processing)',
              method: p.method,
              amount: p.gross_amount,
              fee: p.commission_amount
            };
          }
          changed = true;
          // Update order to PAID
          const order = orders.find(o=>o.id===p.order_id);
          if(order && order.status!=='PAID' && order.status!=='PICKED_UP' && order.status!=='COMPLETED'){
            order.status = 'PAID';
            order.updated_at = new Date().toISOString();
          }
        }
      }
    });
    if(changed){
      write('payments', payments);
      write('orders', orders);
      console.log(`[AutoPromote] Promoted ${payments.filter(p=>p.payment_status==='PAID').length} stale PENDING payments to PAID`);
    }
  }catch(e){
    console.error('promoteStalePending error', e);
  }
}

// Get payments role-scoped
router.get('/', authMiddleware, (req,res)=>{
  promoteStalePending(); // Auto-fix stuck PROCESSING
  const payments = read('payments', []);
  const orders = read('orders', []);
  const role = req.user.role;
  const id = req.user.id;
  if(role==='admin') return res.json(payments);
  if(role==='farmer'){
    const farmerOrders = orders.filter(o=>o.farmer_id===id).map(o=>o.id);
    return res.json(payments.filter(p=>farmerOrders.includes(p.order_id)));
  }
  if(role==='company'){
    const compOrders = orders.filter(o=>o.company_id===id).map(o=>o.id);
    return res.json(payments.filter(p=>compOrders.includes(p.order_id)));
  }
  if(role==='collector'){
    const collOrders = orders.filter(o=>o.collector_id===id).map(o=>o.id);
    return res.json(payments.filter(p=>collOrders.includes(p.order_id)));
  }
  res.json([]);
});

// Initiate fake payment - company pays for order
router.post('/initiate', authMiddleware, requireRole('company','admin'), (req,res)=>{
  const { order_id, method, upi_id, card_last4 } = req.body;
  if(!order_id || !method) return res.status(400).json({error:'order_id and method required (UPI, CARD, NETBANKING)'});
  
  const orders = read('orders', []);
  const order = orders.find(o=>o.id===order_id);
  if(!order) return res.status(404).json({error:'Order not found'});
  
  // Only company who owns order or admin can pay
  if(req.user.role==='company' && order.company_id!==req.user.id){
    return res.status(403).json({error:'Not your order'});
  }
  
  // Order must be VERIFIED to pay (new flow: company pays after collector verified, before collector pickup)
  const allowedStatuses = ['VERIFIED'];
  if(!allowedStatuses.includes(order.status)){
    return res.status(400).json({error:`Order must be VERIFIED to pay (collector must verify first). Current: ${order.status}`});
  }

  // Check if payment already exists PENDING or PAID for this order - prevent double pay
  const existingPayments = read('payments', []);
  const existing = existingPayments.find(p=>p.order_id===order_id && ['PENDING','PAID'].includes(p.payment_status));
  if(existing){
    return res.status(409).json({error:`Order already has payment ${existing.payment_status}`, payment: existing});
  }

  const settings = read('settings', {commissionPercent:10});
  const gross = order.matched_quantity * order.matched_price;
  const commission = gross * (settings.commissionPercent/100);
  const net = gross - commission;

  // Create payment with PENDING then simulate gateway processing
  const paymentId = genId('p');
  const payment = {
    id: paymentId,
    order_id: order.id,
    gross_amount: gross,
    commission_amount: commission,
    net_farmer_payout: net,
    payment_status: 'PENDING',
    method: method, // UPI, CARD, NETBANKING
    method_details: method==='UPI' ? {upi_id: upi_id||'demo@upi'} : method==='CARD' ? {card_last4: card_last4||'4242'} : {bank:'Demo Bank'},
    transaction_id: `TXN${Date.now()}${Math.floor(Math.random()*1000)}`,
    gateway_response: null,
    created_at: new Date().toISOString(),
    paid_at: null
  };

  existingPayments.push(payment);
  write('payments', existingPayments);

  // Simulate gateway processing delay 2s -> PAID (per request: 2-3 sec enough)
  setTimeout(()=>{
    const pays = read('payments', []);
    const p = pays.find(x=>x.id===paymentId);
    if(p){
      p.payment_status = 'PAID';
      p.paid_at = new Date().toISOString();
      p.gateway_response = {
        status: 'SUCCESS',
        gateway: 'AgriAlchemy Fake Gateway',
        message: 'Payment captured successfully (simulated - 2 sec)',
        method: method,
        amount: gross,
        fee: commission
      };
      write('payments', pays);

      // Update order to PAID - company gets receipt, farmer will get paid status, collector knows to pickup after PAID
      const ords = read('orders', []);
      const o = ords.find(x=>x.id===order_id);
      if(o){
        o.status = 'PAID';
        o.updated_at = new Date().toISOString();
        write('orders', ords);
      }
    }
  }, 2000);

  res.status(201).json({
    message: 'Payment initiated (fake gateway)',
    payment,
    next: 'Payment will auto-confirm to PAID in 2.5s, order will become PAID, collector will see Ready for Pickup, then collector confirms pickup OTP -> PICKED_UP -> COMPLETED -> farmer gets final paid status',
    fake_gateway: {
      note: 'This is a simulated payment for local testing. No real money moves.',
      supported_methods: ['UPI', 'CARD', 'NETBANKING'],
      test_cards: {number:'4242 4242 4242 4242', expiry:'12/30', cvv:'123'},
      test_upi: 'demo@upi'
    }
  });
});

// Get payments for specific order
router.get('/order/:orderId', authMiddleware, (req,res)=>{
  promoteStalePending(); // Ensure stuck PENDING becomes PAID on poll
  const payments = read('payments', []).filter(p=>p.order_id===req.params.orderId);
  // Check access: only participants or admin
  const orders = read('orders', []);
  const order = orders.find(o=>o.id===req.params.orderId);
  if(!order) return res.status(404).json({error:'Order not found'});
  const role = req.user.role;
  const id = req.user.id;
  const isParticipant = order.farmer_id===id || order.company_id===id || order.collector_id===id || role==='admin';
  if(!isParticipant) return res.status(403).json({error:'Not authorized for this order'});
  res.json(payments);
});

// Refund simulation (admin only)
router.post('/:id/refund', authMiddleware, requireRole('admin'), (req,res)=>{
  const payments = read('payments', []);
  const p = payments.find(x=>x.id===req.params.id);
  if(!p) return res.status(404).json({error:'Payment not found'});
  if(p.payment_status!=='PAID') return res.status(400).json({error:'Only PAID payments can be refunded'});
  p.payment_status = 'REFUNDED';
  p.refunded_at = new Date().toISOString();
  write('payments', payments);
  res.json({message:'Payment refunded (simulated)', payment:p});
});

module.exports = router;
