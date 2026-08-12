# User Guide — AgriAlchemy MVP

## Roles

- Farmer: sells waste
- Company: buys waste raw material
- Collector: verifies and transports
- Admin: manages marketplace

## Getting Started MVP

1. Backend: cd backend && npm install && npm run seed && npm run dev → :5000
2. Frontend: cd frontend && npm install && npm run dev → :5173
3. Open <http://localhost:5173>
4. Login: Enter phone (10 digits) → Send OTP → OTP logged in backend console + returned as demo_otp → Verify → Auto redirect to /<role> based on account, role detected, no role selector
5. New phone? After OTP, complete profile: name, choose role once (farmer/company/collector), location

Seeded phones:

- Farmer 9876543210, 9876543211
- Company 9876543220
- Collector 9876543230, 9876543231 online
- Admin 9999999999

## Farmer

Dashboard: KPIs Total Listings, Active Qty, Orders, Earnings. Post listing form: type, qty, price, grade, lat/lng current location button, photo file with preview, description, submit → PENDING. My Listings table: type, qty, price, grade, status badge, created. Matched Orders: order id, qty, price, status, OTP, collector. Earnings ledger: order, gross, commission, net, status.

## Company

Dashboard: Active Req, Matched Orders, Waste Sourced kg, Total Paid. Post Requirement: type, qty needed, max price, grade min, lat/lng, notes. My Requirements table. Matched Waste: matched/verified only per trust rule (not raw listings). Orders timeline. Payments gross, commission, net.

## Collector

Dashboard: Assigned, In Progress, Completed counts, availability toggle. To Verify cards: order id, qty, OTP, price, verification form (qty, grade, photo) → Verify → VERIFIED. In Progress table: VERIFIED with OTP input → Confirm Pickup → PICKED_UP → auto PAID → auto COMPLETED after 0.8s, trust +10. Completed table.

## Admin

Dashboard: Users, Listings pending, Requirements open, Orders completed KPIs, Impact, Matching, Settings cards. User Management: name, role, phone, trust, status, location, suspend/activate. Listing Management: photo, type, farmer, qty, price, grade, geo + distance, status, approve/reject/match. Requirement Management: type, company, qty, max price, grade, location, status, find matches. Matching Console: left OPEN/PARTIALLY_MATCHED requirements list, right ranked candidates with score, distance, collectors nearby, match button → creates order splits remaining. Order Tracking: order id, waste, qty, farmer, company, collector, status + OTP + timeline, assign collector dropdown distance-sorted. Payment Tracking: total gross, commission, net, table with calculation breakdown. Impact: waste diverted, farmer income, company batches, commission, orders completed, CO2 avoided, pollution heuristic, avg per order. Settings: commission%, radius, emissionFactor, expiry days.

## Best Practices

Upload clear photos, use current location, realistic qty/price for better matching score, collectors stay online, admin checks trust, companies set max slightly higher.

## Support

See troubleshooting.md, error_handling.md
