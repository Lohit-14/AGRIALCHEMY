# AgriAlchemy — Architecture (MVP)

## Overview

AgriAlchemy MVP is a managed 4-role marketplace (broker model) connecting farmers with waste to companies needing it as raw material, via admin verification and collector logistics.

Tagline: Transforming Farm Waste into Wealth

Managed, not open peer-to-peer. Trust enforced: admin approves listings, matches, assigns collectors; collectors verify physically before payment.

## Components

```
Farmers -- post listing (photo, geo, grade) --> Admin Approval --\
Companies -- post requirement (type, qty, max price) -->           +--> Matching Engine --> Orders --> Collector Assignment -> Verification -> OTP Pickup -> Payment -> Impact
Collectors -- availability toggle, verification form, OTP confirm --/
Admin -- full control: users, listings, requirements, matching console, orders, payments, impact, settings
```

## Stack (MVP, localhost-ready)

- Backend: Node.js + Express 4, JWT, Multer uploads, file JSON DB (data/*.json) — ready to swap to MongoDB, Helmet, Morgan, Rate Limit, Joi validation
- Frontend: React 18 + Vite + React Router + Axios + GSAP ScrollTrigger + Lucide icons (no emojis), role-guarded routes
- Auth: Phone + OTP only (no role selector), OTP logged to console + returned as demo_otp for local dev, JWT 7d
- Storage: Local uploads/ folder served via /uploads, ready for cloud storage
- Payments: Simulated calculation (gross, commission%, net)
- Maps: Haversine distance
- Deployment: Backend :5000, Frontend :5173 (Vite proxy), run-localhost.sh

## Data Model

```
users { id, role[farmer|company|collector|admin], name, phone unique, email, otp_verified, trust_score 0-200, status active|suspended, lat,lng, location, availability (collector), created_at }

listings { id, farmer_id, waste_type, quantity, price_per_kg, quality_grade A1-C, photo_url, geo_lat/lng, status PENDING/APPROVED/MATCHED/REJECTED/COMPLETED, description, created_at }

requirements { id, company_id, waste_type, quantity_needed, max_price_per_kg, quality_grade min, status OPEN/PARTIALLY_MATCHED/MATCHED, geo_lat/lng, notes, created_at }

orders { id, listing_id, requirement_id, collector_id nullable, farmer_id, company_id, status MATCHED/ASSIGNED/VERIFIED/PICKED_UP/PAID/COMPLETED, matched_quantity, matched_price, pickup_otp 4-digit, created_at, updated_at }

verifications { id, order_id, collector_id, verified_quantity, verified_grade, photo_url, verified_at }

payments { id, order_id, gross_amount, commission_amount, net_farmer_payout, payment_status PAID, paid_at }

settings { commissionPercent default 10, geoRadiusKm 100, emissionFactor 1.5, listingExpiryDays 30 }

otps { phone -> {otp, expiresAt} }
```

## Matching Engine

File: `backend/src/utils/matching.js`

Filters (AND):

- Waste type exact
- Quantity listing ≥ requirement *0.3 (partial allowed)
- Price listing ≤ max
- Grade score listing ≥ requirement (A1=5...C=1)
- Distance haversine ≤ radius*1.5 (radius admin-configurable 100km default)
- Collector availability count within radius (penalize -20 if 0)

Scoring:

```
base 100
- distance*0.4
+ grade_diff*5
+ qty closeness +10 if 1≤ratio≤1.2 else +5 if ≥0.9
+ (trust-100)*0.2
- ageDays*1.5
-20 if no nearby collectors
```

Sorted descending, admin sees ranked.

Partial handling:

- 100kg listing + 80kg req → matched 80, remaining 20 stays APPROVED
- 50kg listing + 80kg req → matched 50, req remaining 30 stays PARTIALLY_MATCHED

## Order State Machine

```
POST /listings → PENDING
PATCH /approve → APPROVED
POST /orders/match → MATCHED (splits remaining)
PATCH /assign {collector_id} → ASSIGNED
POST /verifications → VERIFIED
PATCH /pickup-confirm {otp} → PICKED_UP → auto PAID → auto COMPLETED (0.8s)
Terminal: REJECTED (listing, trust -20) / CANCELLED
Side effects: COMPLETED → trust +10, payment record, impact updates
```

## Trust Score

Start 100, cap 0-200, +10 completed, -20 rejected, used in ranking.

## Impact

```
waste_diverted = SUM completed matched_quantity
farmer_income = SUM net payouts where completed
commission = SUM commission where completed
orders_completed = COUNT completed
co2_avoided = waste_diverted * emissionFactor (1.5)
```

## Auth & RBAC

- Phone + OTP only, no role selector on login. Role detected from account. OTP 4-digit, expiry 5 min, rate limited 20/10min per IP.
- JWT signed {id, role, phone}, 7d expiry, stored in localStorage, sent Bearer. Middleware checks suspended on each request.
- Role guards: farmer own listings/orders, company own requirements + matched via orders only, collector only assigned orders, admin full.

## File Storage

Multer disk `uploads/`, served `/uploads/:filename`, 5MB limit, random filename, ready for cloud storage signed URLs.

## Frontend MVP

- Context AuthContext: sendOtp, verifyOtp, token storage
- api.js: axios with baseURL and JWT header
- App.jsx: Navbar title only (logo removed), Protected route guard, Lucide init
- Pages: PublicLanding full-bleed hero (100vw negative margins, no outer paddings, background radial gradients), Login phone-only, Farmer/Company/Collector/Admin dashboards with Lucide icons

## Open Decisions Resolved (in settings)

- Partial matching ALLOWED
- Impact admin full + public teaser
- Commission admin-configurable day one, default 10%
- Geo radius fixed admin-configurable 100km
- Trust +10/-20 start 100 cap 0-200
