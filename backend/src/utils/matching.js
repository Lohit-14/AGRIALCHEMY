const { read } = require('./fileDB');
const { haversine, GRADE_SCORE } = require('./geo');

function getCandidatesForRequirement(reqId){
  const req = read('requirements', []).find(r=>r.id===reqId);
  if(!req) return [];
  const listings = read('listings', []).filter(l=>l.status==='APPROVED');
  const settings = read('settings', {geoRadiusKm:100, commissionPercent:10});
  const radius = settings.geoRadiusKm || 100;
  const users = read('users', []);
  const collectors = users.filter(u=>u.role==='collector' && u.availability && u.status==='active');
  const candidates = [];

  listings.forEach(listing=>{
    if(listing.waste_type !== req.waste_type) return;
    if(listing.price_per_kg > req.max_price_per_kg) return;
    if((GRADE_SCORE[listing.quality_grade]||0) < (GRADE_SCORE[req.quality_grade]||0)) return;
    if(listing.quantity < req.quantity_needed * 0.3) return;
    const dist = haversine(listing.geo_lat, listing.geo_lng, req.geo_lat, req.geo_lng);
    if(dist > radius*1.5) return;
    const nearbyCollectors = collectors.filter(c=> haversine(listing.geo_lat, listing.geo_lng, c.lat, c.lng) <= radius );
    let score = 100;
    score -= dist * 0.4;
    score += (GRADE_SCORE[listing.quality_grade]-GRADE_SCORE[req.quality_grade])*5;
    const qtyRatio = listing.quantity / req.quantity_needed;
    if(qtyRatio>=1 && qtyRatio<=1.2) score+=10;
    else if(qtyRatio>=0.9) score+=5;
    const farmer = users.find(u=>u.id===listing.farmer_id);
    if(farmer) score += (farmer.trust_score-100)*0.2;
    const ageDays = Math.floor((Date.now() - new Date(listing.created_at).getTime())/(86400000));
    score -= ageDays*1.5;
    if(nearbyCollectors.length===0) score -= 20;
    candidates.push({
      listing,
      distance: dist,
      nearbyCollectorsCount: nearbyCollectors.length,
      nearbyCollectors: nearbyCollectors.map(c=>({id:c.id, name:c.name})),
      score: Math.max(0, Math.round(score)),
      matched_quantity: Math.min(listing.quantity, req.quantity_needed)
    });
  });

  candidates.sort((a,b)=>b.score-a.score);
  return candidates;
}

function getRequirementsForListing(listingId){
  const listing = read('listings', []).find(l=>l.id===listingId);
  if(!listing) return [];
  const reqs = read('requirements', []).filter(r=>r.status==='OPEN' || r.status==='PARTIALLY_MATCHED');
  const settings = read('settings', {geoRadiusKm:100});
  const radius = settings.geoRadiusKm || 100;
  const candidates=[];
  reqs.forEach(req=>{
    if(req.waste_type!==listing.waste_type) return;
    if(listing.price_per_kg>req.max_price_per_kg) return;
    if((GRADE_SCORE[listing.quality_grade]||0) < (GRADE_SCORE[req.quality_grade]||0)) return;
    const dist = haversine(listing.geo_lat, listing.geo_lng, req.geo_lat, req.geo_lng);
    if(dist>radius*1.5) return;
    let score=100 - dist*0.4;
    const qty = Math.min(listing.quantity, req.quantity_needed);
    score += qty>0?5:0;
    candidates.push({req, distance:dist, score:Math.round(score), matched_quantity:qty});
  });
  candidates.sort((a,b)=>b.score-a.score);
  return candidates;
}

module.exports = { getCandidatesForRequirement, getRequirementsForListing };
