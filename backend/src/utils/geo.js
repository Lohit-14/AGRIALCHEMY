function toRad(x){ return x*Math.PI/180; }
function haversine(lat1, lon1, lat2, lon2){
  if(lat1==null||lon1==null||lat2==null||lon2==null) return 0;
  const R=6371;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
const GRADE_SCORE = {'A1':5,'A2':4,'B1':3,'B2':2,'C':1};
module.exports = { haversine, GRADE_SCORE };
