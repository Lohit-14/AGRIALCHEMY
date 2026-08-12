# Development — AgriAlchemy MVP

## Prereqs

Node 18+, npm 9+, Git, VS Code, Chrome

## Structure

```
backend/
  server.js            # Express, Helmet, Morgan, RateLimit, CORS, routes, /api/docs
  .env                 # PORT, JWT_SECRET, CORS_ORIGIN
  data/                # JSON: users, listings, requirements, orders, verifications, payments, otps, settings
  uploads/             # Multer photos
  src/
    config/seed.js
    middleware/auth.js, role.js
    utils/fileDB.js, geo.js, matching.js
    routes/auth, users, listings, requirements, orders, verifications, payments, impact, settings

frontend/
  vite.config.js       # proxy /api & /uploads → :5000
  index.html           # Lucide CDN, root
  src/
    main.jsx, App.jsx (title only, no logo, MVP badge), styles.css (full-bleed hero fix)
    context/AuthContext.jsx (phone-only OTP)
    utils/api.js (axios JWT)
    pages/ PublicLanding (full-bleed hero 100vw negative margins, blobs, GSAP fromTo), Login phone-only, Farmer/Company/Collector/Admin dashboards with Lucide

docs/                  # All MVP docs (this folder)
run-localhost.sh       # Starts both
README.md              # MVP overview
```

## Setup

```bash
cd backend && npm install && npm run seed && npm run dev
# new terminal
cd frontend && npm install && npm run dev
```

Landing hero background full-bleed fix:

- .hero width:100vw, margin-left:calc(50% - 50vw), padding 0 outer, inner .hero-inner max-width 1320px centered padding 128px 32px 84px
- Blobs opacity 0.68, no multiply wash, radial gradients more visible
- GSAP fromTo autoAlpha 0→1 (fixed disappearing bug where .from + CSS opacity 0 stayed 0)
- No Lenis, no progress bar, native smooth scroll, safety net forces visible after 1.8s

## Adding Waste Type

1. Add to WASTE_TYPES array in frontend pages (FarmerDashboard select) + backend seed if needed
2. Add to WASTE_TO_PRODUCT mapping with Lucide icon name (tree-palm, wheat, leaf etc)
3. Backend waste type is free string, no enum validation, works without code change (add validation via Joi if want)

## Matching Tuning

File `backend/src/utils/matching.js` scoring:

- Adjust distance weight *0.4, grade diff*5, trust *0.2, age *1.5, collector penalty -20, qty threshold 0.3, radius*1.5

## Trust Score

In routes listings.js reject and orders.js pickup-confirm: +10 completed, -20 rejected, cap 0-200. Could move to settings.

## Testing

Manual:

- Farmer post → Admin approve → Company requirement → Admin matching console ranked → Match → Assign collector → Collector verify + OTP → Completed → Impact

Automated (future):

- Jest + Supertest for backend routes
- Vitest + React Testing Library for frontend

## Debugging

- Icons not showing: lucide.createIcons() called after DOM load + refreshLucide() after dynamic innerHTML
- Hero disappearing fixed: fromTo autoAlpha, safety net
- CORS: check backend CORS_ORIGIN matches frontend URL
- File DB race: fs sync, last write wins, for MVP okay, switch to MongoDB later
- OTP: logged to console + returned demo_otp for local dev

## Git Workflow

feat: add waste type, fix: hero background full-bleed, docs: update architecture

## Useful Commands

```bash
cd backend && rm -rf data/*.json && npm run seed
cd frontend && npm run build && ls dist/
grep -R "production grade\|v1" docs/ || echo "clean MVP"
```
