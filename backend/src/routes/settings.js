const express = require('express');
const router = express.Router();
const { read, write } = require('../utils/fileDB');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', (req,res)=>{
  res.json(read('settings', {}));
});

router.put('/', authMiddleware, requireRole('admin'), (req,res)=>{
  const { commissionPercent, geoRadiusKm, emissionFactor, listingExpiryDays } = req.body;
  const settings = read('settings', {});
  if(commissionPercent!=null) settings.commissionPercent = commissionPercent;
  if(geoRadiusKm!=null) settings.geoRadiusKm = geoRadiusKm;
  if(emissionFactor!=null) settings.emissionFactor = emissionFactor;
  if(listingExpiryDays!=null) settings.listingExpiryDays = listingExpiryDays;
  write('settings', settings);
  res.json(settings);
});

module.exports = router;
