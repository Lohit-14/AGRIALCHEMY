# AgriAlchemy — Transforming Farm Waste into Wealth

**Tagline:** Transforming Farm Waste into Wealth  
**Type:** Managed 4-role marketplace (broker model)

## What Has Been Built (Current State for Presentation)

This repository currently shows the project in build phase with backend and frontend disconnected to demonstrate modular development. You can access all role pages directly via quick access.

**Built so far:**

**Backend (`/backend`):**
- Express server with JWT auth, role middleware, Helmet, Morgan, Rate Limit
- File JSON DB (`data/*.json`) with seed data (users, listings, requirements, orders, payments, settings)
- Auth: Phone + OTP only (no role selector), OTP simulated, JWT 7d, suspended check
- Listings: Farmer post with photo upload via Multer (5MB), geo-tag, grade, pending→approved flow, trust score
- Requirements: Company post, open/partially matched handling
- Orders: State machine MATCHED→ASSIGNED→VERIFIED→PAID→PICKED_UP→COMPLETED with auto-promotion for stuck PENDING→PAID (>3s) and PICKED_UP→COMPLETED (>5s) to fix processing stuck
- Matching Engine: Filters type exact, qty ≥30% req partial allowed, price ≤ max, grade ≥ min, distance haversine ≤ radius*1.5, collector availability, scoring 100 - dist*0.4 + gradeDiff*5 + qtyBonus + trust*0.2 - age*1.5 -20 if no collector
- Verifications: Collector verification form with photo, status VERIFIED
- Payments: Fake gateway POST /payments/initiate {order_id, method UPI/CARD/NETBANKING} → PENDING → auto PAID in 2 sec (per request 2-3 sec), transaction_id, receipt, order → PAID, collector picks after PAID, farmer gets paid status after COMPLETED, refund simulation
- Impact: Waste diverted, farmer income, commission, orders completed, CO₂ = kg*1.5
- Settings: commissionPercent, geoRadiusKm, emissionFactor, listingExpiryDays admin-configurable

**Frontend (`/frontend`):**
- React 18 + Vite + Router + Axios + GSAP ScrollTrigger + Anime.js + Lucide icons (no emojis)
- Title only (logo removed per request), translation switcher top right of logo with globe icon, dropdown English/Kannada/Hindi (Kannada: ಕನ್ನಡ, Hindi: हिन्दी)
- Landing: Full-bleed hero (100vw negative margins removed, now maxWidth 1200 centered, radial gradients, blobs, no outer paddings), GSAP fromTo autoAlpha (fixed disappearing), marquee xPercent -50 seamless, waste cards with AI images (hero-agri, waste-banana, rice, bagasse, coconut, corn, areca, impact-farm), 3D tilt, reveal on scroll, parallax, impact counters via anime.js, no demo mentions, no progress bar, no Lenis (native smooth)
- Auth: Phone + OTP only, no role selector on login, role detected, quick access buttons for Farmer/Company/Collector/Admin for presentation (direct access without OTP, uses mock data)
- Farmer Dashboard: Tabs Dashboard/Post Waste/My Listings/Orders/Earnings, KPIs with gradient, post form with photo preview + current geo, listings table with photo full URL, orders with OTP, earnings ledger, auto-refresh 5s, GSAP stagger
- Company Dashboard: Tabs Dashboard/Post Requirement/My Requirements/Matched Waste/Orders/Payments, payable orders filtered VERIFIED only (new flow: collector verifies first, then company pays), fake payment modal with method cards (UPI/CARD/Netbanking), processing messages 4 steps 500ms each = 2s total, polling for PAID, auto-close 2.2s after success, no pay again (excludes PENDING and PAID)
- Collector Dashboard: Tabs Dashboard/Assigned/Verified-Wait Pay/Ready Pickup PAID (alert badge)/In Transit/Completed/Availability, KPIs, assigned cards with verify form, verified waiting for company payment, paid tab shows payment details (amount, method, TXN) and OTP confirm → PICKED_UP → COMPLETED, auto-refresh 4s
- Admin Dashboard: Tabs Dashboard/Users/Listings/Requirements/Matching/Orders/Payments/Impact/Settings, graphical representations (BarChart, DonutChart, LineChart) for listings by type, orders by status, earnings breakdown, waste trend, users by role, payments by method, KPIs, quick actions, pending alert badges
- Payment Flow Fixed: VERIFIED → PAID (company pays, gets receipt) → PICKED_UP (collector after PAID) → COMPLETED (farmer paid status). Requirement comes off after delivery (COMPLETED) via backend setting requirement status COMPLETED when order COMPLETED
- Mobile & Frames Compatible: Sidebar 240px desktop → 100% horizontal scroll tabs ≤768px, tables min-width 500px overflow auto, grids 4→2→1, modals calc(100vw-20px), payment-methods 3→1 columns, navbar sticky, hero grid 1.15fr 0.85fr → 1fr ≤900px


**Run:**

```bash
# Backend (can run separately)
cd backend && npm install && npm run seed && npm run dev # :5000

# Frontend (works even if backend not running, uses mock)
cd frontend && npm install && npm run dev # :5173
```

**Documentation:**

All docs in `/docs` 
- architecture, briefing, configuration, deployment, development, error_handling, troubleshooting, security_and_privacy, use_guide, routing, demo_data, demo_script
