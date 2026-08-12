# Security and Privacy — AgriAlchemy MVP

## Auth

- Phone + OTP only, no password, no role selector on login. OTP 4-digit random, expiry 5 min, rate limited 20/10min per IP via express-rate-limit. JWT signed {id, role, phone} HS256 secret from JWT_SECRET env, 7d expiry, stored in localStorage, sent Bearer. Middleware checks suspended on each request.

## Data Minimization

- Phone unique identifier required, plain in file DB. Email optional. Location lat/lng captured via current location button with user action (consent). Photos listing + verification, stored in uploads/ served static /uploads/:filename without auth (vuln: anyone with URL can see, future signed URLs).

## Anti-Fraud

- Mandatory photo, geo-tag, timestamp, old listings >30 days FLAG, collector physical verification before payment, OTP dual confirm, trust score +10 completed -20 rejected cap 0-200, admin approval gate PENDING→APPROVED.

## Payment Simulated

- No real money, payment record created after OTP confirm, gross qty*price, commission % from settings, net = gross-commission, status PAID.

## File Upload

- Multer 5MB limit, random filename via genId, no mime validation beyond accept image/* client side, should add server mime check. Path traversal prevented via random filename. Static serving public without auth, should serve via auth or signed URLs.

## Storage

- File JSON plain on disk, no encryption at rest, for MVP localhost okay, switch to MongoDB Atlas with encryption at rest for real.

## JWT

- Secret must be long random, not default, env. Expiry 7d, no refresh token yet. Stored in localStorage vulnerable to XSS, mitigated via escapeHtml and no dangerouslySetInnerHTML. Suspended check on each request loads user from DB, so suspended takes effect immediately.

## RBAC

- requireRole middleware + ownership checks: farmer own listings/orders, company own requirements + matched via orders only, collector only assigned, admin full. No privilege escalation, role from JWT signed.

## CORS

- CORS_ORIGIN env, split comma, credentials true, should be exact frontend URL not * in real deploy.

## XSS

- Vanilla JS uses escapeHtml for user strings, React auto-escapes, no dangerouslySetInnerHTML.

## Privacy Compliance

- DPDP Act: need consent for phone, location, photos, explicit current location button is consent, need privacy policy page explaining data collected, purpose matching/verification, retention, sharing only matched company/collector/admin not public.

## Secrets

- .env contains JWT secret, not committed? .env in repo for dev convenience, .env.example provided, in real set via hosting env.

## Future Hardening

- Rate limit more routes, Joi validation, mime validation + virus scan, uploads via auth or signed URLs, MongoDB encryption, httpOnly cookies + CSRF or Bearer short expiry+refresh, audit log, retention cron, Sentry, Helmet, HTTPS only, 2FA for admin.
