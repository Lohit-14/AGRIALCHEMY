# Error Handling — AgriAlchemy MVP

## Frontend

- showToast(msg, type) with Lucide icons: x-circle error, check-circle success, info
- Validation before create:
  - Farmer post: quantity, price required, photo mandatory, geo numbers, else toast error
  - Company: qty and max price required
  - Collector verify: verified qty required
  - Pickup OTP: compare with order.pickup_otp, else invalid
- Local fileDB read try/catch fallback empty array
- Photo FileReader error → toast
- Geolocation fallback to manual if denied
- Trust capped 0-200

## Backend

- All routes return {error} with HTTP codes:
  - 400 validation, invalid qty, invalid OTP
  - 401 no/invalid token
  - 403 role mismatch or suspended
  - 404 not found
  - 500 internal (logged, stack only in dev)
- Auth:
  - send-otp validates phone >=10, else 400, rate limited 20/10min per IP
  - verify-otp checks existence, expiry 5 min, equality, suspended, returns needRegistration if new phone without name
  - JWT middleware checks Bearer token, loads user, checks suspended
- Listings: waste_type, quantity, price required else 400, Multer 5MB limit, photo optional but should be required
- Orders: match validates listing_id, requirement_id, listing APPROVED else 400, qty>0, assign requires collector_id and status MATCHED, pickup-confirm checks OTP equality, status must be VERIFIED, collector ownership
- Verifications: order_id, verified_quantity required, status must be ASSIGNED, collector ownership
- File DB race: fs sync but concurrent writes last wins, for MVP okay, switch to DB later
- Multer file too large → 400

## Edge Cases

- Listing qty 0 after partial match → status MATCHED qty 0, remainder stays APPROVED if >0.01
- Requirement qty 0 → MATCHED, partial → PARTIALLY_MATCHED
- Collector availability toggle only self or admin
- OTP expiry 5 min, JWT 7d
- Geolocation denied fallback manual Bangalore 12.97,77.59

## Logging

- Backend logs OTPs, seed, start, errors via console + Morgan dev logs
- Frontend toast + console

## Future

- Joi validation, rate limiting more routes, centralized error handler, Sentry, idempotency keys for order creation, transactional outbox for payments
