# Routing — AgriAlchemy MVP

## Backend API (Express) Base http://localhost:5000/api

- GET /health {status ok, service MVP, version, uptime, dataFiles}
- GET /docs {endpoint list}
- POST /auth/send-otp {phone} -> {demo_otp}
- POST /auth/verify-otp {phone, otp, name?, role?, location?} -> {token,user} or {needRegistration}
- POST /auth/register {phone, name, role, email?, location?}
- GET /users/me (auth)
- GET /users (admin)
- PATCH /users/:id/status {status} (admin)
- PATCH /users/:id/availability (self/collector or admin)
- POST /listings multipart (farmer,admin) waste_type, quantity, price_per_kg, quality_grade, geo_lat, geo_lng, description, photo
- GET /listings (farmer own, admin all, company/collector [] per trust rule)
- GET /listings/all (admin)
- GET /listings/:id
- PATCH /listings/:id/approve (admin)
- PATCH /listings/:id/reject (admin, trust -20)
- POST /requirements (company,admin)
- GET /requirements (company own, admin all)
- GET /requirements/all (admin)
- GET /orders (role-scoped)
- GET /orders/match-preview/:requirementId (admin) ranked candidates
- POST /orders/match {listing_id, requirement_id, matched_quantity?} (admin)
- PATCH /orders/:id/assign {collector_id} (admin)
- PATCH /orders/:id/pickup-confirm {otp} (collector own/farmer/admin) -> PICKED_UP -> auto PAID->COMPLETED
- POST /verifications multipart order_id, verified_quantity, verified_grade, photo (collector)
- GET /verifications/:orderId
- GET /payments (role-scoped)
- GET /impact public teaser
- GET /settings public
- PUT /settings admin
- GET /uploads/:filename static

Root / -> message, docs, health, roles, flow.

## Frontend React Routing Base http://localhost:5173

- / PublicLanding full-bleed hero (100vw negative margins, no outer paddings, blobs, GSAP fromTo), waste examples, how it works timeline, roles, impact, final CTA
- /login Phone only + OTP, no role selector, role detected, new phone → profile creation with role choice once
- /farmer/* FarmerDashboard (post, listings, orders, earnings)
- /company/* CompanyDashboard (post requirement, requirements, matched verified, orders, payments)
- /collector/* CollectorDashboard (assigned, verify, OTP confirm, completed)
- /admin/* AdminDashboard (users, listings approve/reject, matching console ranked, assign collector, orders, payments, impact, settings)
- * -> Navigate to /

Protected guard:

```
function Protected({children, roles}){
  if(!user) return <Navigate to="/login"/>
  if(roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`}/>
  return children
}
```

AuthContext: sendOtp, verifyOtp, token localStorage agrialchemy_token + user, axios header Bearer, GET /users/me restore.

Vite proxy /api and /uploads → backend :5000, VITE_API_URL env for prod.

Future nested: /admin/users, /admin/listings, /admin/matching/:reqId, /admin/orders/:orderId, public /about /privacy /terms.

404: * → /.
