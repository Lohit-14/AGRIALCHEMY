require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const seed = require('./src/config/seed');

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

if(!fs.existsSync(path.join(__dirname, 'data', 'users.json'))){
  console.log('Seeding initial data...');
  seed();
}

app.use(helmet({crossOriginResourcePolicy:false}));
app.use(morgan('dev'));
app.use(cors({origin: CORS_ORIGIN.split(',').map(o=>o.trim()), credentials:true}));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true, limit:'10mb'}));

const otpLimiter = rateLimit({
  windowMs: 10*60*1000,
  max: 20,
  message: {error:'Too many OTP requests, try after 10 minutes'},
  standardHeaders:true,
  legacyHeaders:false
});
app.use('/api/auth/send-otp', otpLimiter);

app.use('/uploads', cors({origin: CORS_ORIGIN.split(',').map(o=>o.trim())}), express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/listings', require('./src/routes/listings'));
app.use('/api/requirements', require('./src/routes/requirements'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/verifications', require('./src/routes/verifications'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/impact', require('./src/routes/impact'));
app.use('/api/settings', require('./src/routes/settings'));

app.get('/api/health', (req,res)=>{
  const dataDir = path.join(__dirname,'data');
  const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : [];
  res.json({
    status:'ok',
    service:'AgriAlchemy Backend',
    version:'1.0.0',
    timestamp:new Date().toISOString(),
    uptime: process.uptime(),
    dataFiles: files,
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/docs', (req,res)=>{
  res.json({
    message: 'AgriAlchemy API Docs',
    base: '/api',
    auth: [
      'POST /auth/send-otp {phone}',
      'POST /auth/verify-otp {phone, otp, name?, role?, location?} -> token or needRegistration',
      'POST /auth/register {phone, name, role, email?, location?} -> token'
    ],
    users: [
      'GET /users/me (auth)',
      'GET /users (admin)',
      'PATCH /users/:id/status {status} (admin)',
      'PATCH /users/:id/availability (self/collector or admin)'
    ],
    listings: [
      'POST /listings multipart (farmer,admin) waste_type, quantity, price_per_kg, quality_grade, geo_lat, geo_lng, description, photo file',
      'GET /listings (farmer own, admin all)',
      'GET /listings/all (admin)',
      'GET /listings/:id',
      'PATCH /listings/:id/approve (admin)',
      'PATCH /listings/:id/reject (admin, trust -20)'
    ],
    requirements: [
      'POST /requirements (company,admin)',
      'GET /requirements (company own, admin all)',
      'GET /requirements/all (admin)'
    ],
    orders: [
      'GET /orders (role-scoped)',
      'GET /orders/match-preview/:requirementId (admin) ranked candidates',
      'POST /orders/match {listing_id, requirement_id, matched_quantity?} (admin)',
      'PATCH /orders/:id/assign {collector_id} (admin)',
      'PATCH /orders/:id/pickup-confirm {otp} (collector own/farmer/admin) -> auto PAID->COMPLETED'
    ],
    verifications: [
      'POST /verifications multipart order_id, verified_quantity, verified_grade, photo (collector)',
      'GET /verifications/:orderId'
    ],
    payments: ['GET /payments (role-scoped)'],
    impact: ['GET /impact public', 'GET /impact/admin (admin)'],
    settings: ['GET /settings public', 'PUT /settings admin'],
    uploads: 'GET /uploads/:filename static',
    flow: 'PENDING->APPROVED->MATCHED->ASSIGNED->VERIFIED->PICKED_UP->PAID->COMPLETED'
  });
});

app.get('/', (req,res)=>{
  res.json({
    message: 'AgriAlchemy API',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
    frontend: CORS_ORIGIN,
    roles: ['farmer','company','collector','admin'],
    flow: 'PENDING->APPROVED->MATCHED->ASSIGNED->VERIFIED->PICKED_UP->PAID->COMPLETED',
    run: 'cd backend && npm run dev + cd frontend && npm run dev'
  });
});

app.use((req,res)=>{
  res.status(404).json({error:'Not Found', path:req.path, method:req.method, docs:'/api/docs'});
});

app.use((err, req, res, next)=>{
  console.error('[ERROR]', err);
  if(err.code==='LIMIT_FILE_SIZE'){
    return res.status(400).json({error:'File too large, max 5MB'});
  }
  if(err instanceof SyntaxError && err.status===400 && 'body' in err){
    return res.status(400).json({error:'Invalid JSON'});
  }
  res.status(err.status||500).json({error:err.message||'Internal Server Error', details: process.env.NODE_ENV==='development' ? err.stack : undefined});
});

app.listen(PORT, ()=>{
  console.log(`
  AgriAlchemy Backend Running
  --------------------------------
  Version: 1.0.0
  Port: ${PORT}
  URL: http://localhost:${PORT}
  Docs: http://localhost:${PORT}/api/docs
  Health: http://localhost:${PORT}/api/health
  Frontend Origin: ${CORS_ORIGIN}
  Data Dir: ${path.join(__dirname,'data')}
  Uploads: ${path.join(__dirname,'uploads')}
  
  Login: Phone only + OTP
  OTP: Logged to console + returned as demo_otp for localhost
  Seeded: Farmer 9876543210, Company 9876543220, Collector 9876543230, Admin 9999999999

  Run frontend: cd frontend && npm run dev -> http://localhost:5173
  `);
});
