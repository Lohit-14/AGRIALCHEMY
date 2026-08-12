# AgriAlchemy — Briefing (MVP Detailed)

## Product

- Name: AgriAlchemy, Title only (logo removed), tagline Transforming Farm Waste into Wealth
- Type: Managed marketplace broker model, MVP for localhost
- Core: Match farmers waste to companies raw material via admin verification and collector logistics

## Problem

Farmers burn/dump/undersell residue due to no buyer access. Companies needing waste as input lack verified supply. No trust layer.

## Solution

4 roles:

- Farmer: Register via phone OTP (no role selector on login, role detected), create listing: type, quantity, price, grade, photo mandatory, geo lat/lng via current location + manual, timestamp. View own listings status PENDING/APPROVED/MATCHED/COMPLETED, matched orders with OTP, earnings ledger.

- Company: Register, post requirement: type, qty needed, max price, min grade, delivery geo. Cannot see raw listings, only matched/verified via orders (trust rule). Tracks orders, payments.

- Collector: Register, availability toggle online/offline, views only assigned pickups, verification form (verified qty, grade, photo mandatory), pickup OTP dual confirm.

- Admin: User mgmt approve/suspend, listing approve/reject, requirement view, matching console ranked, assign collector (distance-sorted), order tracking, payment tracking, impact, settings (commission%, radius, emissionFactor, expiry).

Flow: PENDING → APPROVED → MATCHED → ASSIGNED → VERIFIED → PICKED_UP → PAID → COMPLETED, with REJECTED/CANCELLED exits.

Payment example: 80kg × ₹6 = ₹480 gross, 10% commission = ₹48, farmer net ₹432. Commission admin-configurable, not hardcoded.

Impact: waste diverted kg, farmer income, company batches, commission, completed orders, CO2 avoided = kg × emissionFactor 1.5, pollution heuristic kg*0.8.

## Personas

- Farmer: Ramanagara banana farmer, 100kg stem, needs income, fears cheating.
- Company: Bengaluru BioPack, needs 80kg Grade A2 max ₹7.
- Collector: Arjun with mini-truck, wants nearby gigs, availability toggle.
- Admin: Verifies photos, trust, matching, logistics.

## Waste Mapping

Banana Stem → Plates, Textiles
Rice Straw → Paper Pulp, Packaging, Biochar
Wheat Straw → Particle Boards, Biofuel
Sugarcane Bagasse → Bio-Packaging, Paper
Coconut Husk → Coir Mats, Potting Mix
Corn Stover → Bioplastic, Feed
Groundnut Shell → Briquettes, Carbon
Coffee Husk → Mushroom, Fuel
Areca Leaf → Plates & Bowls
Bamboo Waste → Charcoal, Boards
Mango Peel → Pectin, Bio-fertilizer
Cotton Stalk → Particle Board, Pulp

## Anti-Fraud

- OTP login all roles, phone only
- Mandatory photo, geo capture, timestamp
- Old listings > N days flagged (default 30)
- Collector physical verification before payment
- Pickup OTP dual confirm
- Trust score +10 completed, -20 rejected, start 100 cap 0-200, used in ranking

## Matching

Filters: type exact, quantity ≥0.3*req (partial allowed), location radius 100km default with 1.5x overflow penalized, price ≤ max, grade ≥ min, collector availability count nearby.

Scoring: 100 - dist*0.4 + grade_diff*5 + qty bonus + (trust-100)*0.2 - age*1.5 -20 if no collector.

Admin-triggered ranked, confirm creates order, remaining qty stays.

Example: 100kg listing + 80kg req → 20kg remains APPROVED.

## Data Model

See architecture.md

## Screens

Public: Landing hero full-bleed background (100vw negative margins, no outer paddings), waste examples, how it works timeline, roles, impact, final CTA, login modal phone-only

Farmer: Dashboard KPIs, Post Waste, My Listings, Matched Orders, Earnings

Company: Dashboard, Post Requirement, My Requirements, Matched Waste verified only, Orders, Payments

Collector: Dashboard, Availability, Assigned Pickups cards + table, Verification modal, Pickup OTP modal, Completed

Admin: Dashboard, User Mgmt, Listing Mgmt, Requirement Mgmt, Matching Console, Order Tracking, Payment Tracking, Impact, Settings

## Tech Stack MVP

Backend: Node 18, Express 4, JWT, Multer uploads file DB JSON, Helmet, Morgan, Rate Limit, Joi ready, seed script, uploads static, full-bleed landing fix

Frontend: React 18 Vite, Router, Axios, GSAP ScrollTrigger (no Lenis, no progress bar), Lucide icons (no emojis), title only no logo, phone-only OTP, proxy /api to :5000

Run: backend :5000, frontend :5173, run-localhost.sh

## Out of Scope MVP

AI grading, IoT, real payment gateway (simulated), mobile app, demand forecasting, multi-language, blockchain, third-party logistics integration

## Checklist Done

- [x] Role auth phone+OTP
- [x] Farmer post with photo, qty, price, grade, geo
- [x] Company post requirement
- [x] Admin matching console ranked
- [x] Admin collector assignment distance-sorted
- [x] Collector verification + OTP pickup
- [x] State machine wired
- [x] Payment simulated with commission breakdown
- [x] Impact auto-computed
- [x] RBAC enforced

## Decisions Resolved

Partial allowed, impact admin+public teaser, commission admin-configurable day one default 10%, geo radius fixed admin-configurable, trust +10/-20 start 100 cap 0-200
