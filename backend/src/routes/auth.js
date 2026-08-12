const express = require('express');
const router = express.Router();
const { read, write, genId } = require('../utils/fileDB');
const { signToken } = require('../middleware/auth');

router.post('/send-otp', (req,res)=>{
  const { phone, role } = req.body;
  if(!phone || phone.length<10) return res.status(400).json({error:'Valid phone required'});
  const otp = Math.floor(1000+Math.random()*9000).toString();
  const otps = read('otps', {});
  otps[phone] = {otp, role: role||'farmer', expiresAt: Date.now()+5*60*1000, attempts:0};
  write('otps', otps);
  console.log(`[OTP] ${phone} (${role}) => ${otp}`);
  // In production, send via Twilio / Firebase
  return res.json({message:'OTP sent (check server console)', demo_otp: otp, expiresIn: 300});
});

router.post('/verify-otp', (req,res)=>{
  const { phone, otp, role } = req.body;
  const otps = read('otps', {});
  const rec = otps[phone];
  if(!rec) return res.status(400).json({error:'No OTP found, request new'});
  if(Date.now() > rec.expiresAt) return res.status(400).json({error:'OTP expired'});
  if(rec.otp !== otp) return res.status(400).json({error:'Invalid OTP'});
  // OTP valid
  const users = read('users', []);
  let user = users.find(u=>u.phone===phone);
  if(!user){
    // auto-create if name provided, else ask register
    const { name, email, location } = req.body;
    if(!name){
      // tell client to register
      return res.json({needRegistration:true, phone, role: role||rec.role});
    }
    user = {
      id: genId('u'),
      role: role||rec.role||'farmer',
      name,
      phone,
      email: email||'',
      otp_verified:true,
      trust_score:100,
      status:'active',
      created_at:new Date().toISOString(),
      lat: 12.9716 + (Math.random()-0.5)*0.3,
      lng: 77.5946 + (Math.random()-0.5)*0.5,
      location: location||'Bengaluru',
      availability: (role||rec.role)==='collector' ? true : undefined
    };
    users.push(user);
    write('users', users);
  }
  if(user.status==='suspended') return res.status(403).json({error:'Account suspended'});
  // optionally check role mismatch
  if(role && role!=='admin' && user.role!==role){
    console.log(`Role mismatch: registered ${user.role}, trying ${role}`);
  }
  // issue token
  const token = signToken(user);
  delete otps[phone];
  write('otps', otps);
  return res.json({message:'Verified', token, user});
});

router.post('/register', (req,res)=>{
  const { phone, name, email, role, location } = req.body;
  if(!phone || !name || !role) return res.status(400).json({error:'phone, name, role required'});
  const users = read('users', []);
  if(users.find(u=>u.phone===phone)) return res.status(409).json({error:'Phone already registered'});
  const user = {
    id: genId('u'),
    role,
    name,
    phone,
    email: email||'',
    otp_verified:true,
    trust_score:100,
    status:'active',
    created_at:new Date().toISOString(),
    lat: 12.9716 + (Math.random()-0.5)*0.3,
    lng: 77.5946 + (Math.random()-0.5)*0.5,
    location: location||'Bengaluru',
    availability: role==='collector' ? true : undefined
  };
  users.push(user);
  write('users', users);
  const token = signToken(user);
  return res.json({message:'Registered', token, user});
});

module.exports = router;
