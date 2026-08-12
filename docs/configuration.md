# Configuration — AgriAlchemy MVP

## Backend ENV (`backend/.env`)

```
PORT=5000
JWT_SECRET=change_me_long_random_string_at_least_32chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

- PORT: Express port, default 5000
- JWT_SECRET: HS256 secret, change in real deploy
- JWT_EXPIRES_IN: 7d, token expiry
- CORS_ORIGIN: Allowed frontend origin, comma separated list supported

## File DB Settings (`backend/data/settings.json`)

```json
{
  "commissionPercent": 10,
  "geoRadiusKm": 100,
  "emissionFactor": 1.5,
  "listingExpiryDays": 30
}
```

- commissionPercent: Platform fee %, admin-configurable via PUT /settings, not hardcoded
- geoRadiusKm: Matching radius threshold, 10-500, default 100, 1.5x overflow allowed but penalized in scoring
- emissionFactor: CO2 avoided per kg, default 1.5, used in impact co2_avoided = waste * factor
- listingExpiryDays: Flag old listings > N days with FLAG badge, admin can set 1-90

API:

- GET /settings public
- PUT /settings admin only, body subset e.g. {commissionPercent:12}

## Frontend ENV (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

Vite proxy also forwards /api and /uploads to backend for local dev.

## Trust Score Config (currently hardcoded but ready to make configurable)

- Start 100, +10 COMPLETED, -20 REJECTED, cap 0-200
- Used in matching ranking
- Could move to settings: trustIncrement, trustDecrement

## Upload Config

- Multer disk storage backend/uploads/, 5MB limit, random filename via genId, served static /uploads/:filename
- Future: cloud storage signed URLs

## CORS

Backend cors origin split by comma, credentials true. Set to exact frontend URL, not *.

## How to Switch to MongoDB

1. Set MONGODB_URI in .env
2. Create src/config/db.js with Mongoose connection
3. Replace fileDB read/write with models (keep same interface)
4. Seed uses Mongoose

## Validation

Backend has Joi ready, rate limit on OTP (20/10min), Helmet, Morgan. Add Joi schemas for listings/requirements for stricter checks.
