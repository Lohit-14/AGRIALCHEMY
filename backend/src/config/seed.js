const { read, write, genId } = require('../utils/fileDB');
const fs = require('fs');
const path = require('path');

function seed(){
  const now = new Date().toISOString();
  const users = [
    {id:'u_admin', role:'admin', name:'Admin Team', phone:'9999999999', email:'admin@agrialchemy.in', otp_verified:true, trust_score:100, status:'active', created_at:now, lat:12.9716, lng:77.5946, location:'Bengaluru', availability:false},
    {id:'u_farmer1', role:'farmer', name:'Ramesha Gowda', phone:'9876543210', email:'ramesh@example.com', otp_verified:true, trust_score:120, status:'active', created_at:now, lat:12.834, lng:77.401, location:'Ramanagara, KA'},
    {id:'u_farmer2', role:'farmer', name:'Lakshmi Devi', phone:'9876543211', email:'lakshmi@example.com', otp_verified:true, trust_score:90, status:'active', created_at:now, lat:13.0827, lng:77.609, location:'Chikkaballapur, KA'},
    {id:'u_company1', role:'company', name:'BioPack Solutions Pvt Ltd', phone:'9876543220', email:'purchase@biopack.in', otp_verified:true, trust_score:100, status:'active', created_at:now, lat:12.9716, lng:77.5946, location:'Bengaluru Industrial'},
    {id:'u_collector1', role:'collector', name:'Arjun Collector', phone:'9876543230', email:'arjun.collector@example.com', otp_verified:true, trust_score:100, status:'active', created_at:now, lat:12.9716, lng:77.5946, location:'Bengaluru South', availability:true},
    {id:'u_collector2', role:'collector', name:'Meena Logistics', phone:'9876543231', email:'meena@example.com', otp_verified:true, trust_score:110, status:'active', created_at:now, lat:12.78, lng:77.45, location:'Kanakapura', availability:true},
  ];

  const listings = [
    {id:'l1', farmer_id:'u_farmer1', waste_type:'Banana Stem', quantity:100, price_per_kg:6, quality_grade:'A2', photo_url:'', geo_lat:12.834, geo_lng:77.401, status:'APPROVED', created_at:now, description:'Fresh banana stems, harvested yesterday'},
    {id:'l2', farmer_id:'u_farmer2', waste_type:'Rice Straw', quantity:500, price_per_kg:3.5, quality_grade:'B1', photo_url:'', geo_lat:13.0827, geo_lng:77.609, status:'PENDING', created_at:now, description:'Dry rice straw, suitable for packaging'},
    {id:'l3', farmer_id:'u_farmer1', waste_type:'Sugarcane Bagasse', quantity:300, price_per_kg:4, quality_grade:'A2', photo_url:'', geo_lat:12.834, geo_lng:77.401, status:'APPROVED', created_at:now, description:'Bagasse after jaggery extraction'},
  ];

  const requirements = [
    {id:'r1', company_id:'u_company1', waste_type:'Banana Stem', quantity_needed:80, max_price_per_kg:7, quality_grade:'A2', status:'OPEN', created_at:now, geo_lat:12.9716, geo_lng:77.5946, notes:'Need for biodegradable plates'},
    {id:'r2', company_id:'u_company1', waste_type:'Rice Straw', quantity_needed:400, max_price_per_kg:5, quality_grade:'B1', status:'OPEN', created_at:now, geo_lat:12.9716, geo_lng:77.5946, notes:'For paper pulp'},
  ];

  write('users', users);
  write('listings', listings);
  write('requirements', requirements);
  write('orders', []);
  write('verifications', []);
  write('payments', []);
  write('otps', {});
  write('settings', {commissionPercent:10, geoRadiusKm:100, emissionFactor:1.5, listingExpiryDays:30});

  console.log('Seeded data/');
}

if(require.main===module) seed();
module.exports = seed;
