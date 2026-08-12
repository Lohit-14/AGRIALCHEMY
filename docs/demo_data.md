# Demo Data — AgriAlchemy MVP (Not on landing per request)

Seeded via backend/src/config/seed.js and frontend via API.

## Users

| ID | Role | Name | Phone | Location | Trust | Availability |
| ---- | ------ | ------ | ------- | ---------- | ------- | -------------- |
| u_admin | admin | Admin Team | 9999999999 | Bengaluru | 100 | - |
| u_farmer1 | farmer | Ramesha Gowda | 9876543210 | Ramanagara | 120 | - |
| u_farmer2 | farmer | Lakshmi Devi | 9876543211 | Chikkaballapur | 90 | - |
| u_company1 | company | BioPack Solutions Pvt Ltd | 9876543220 | Bengaluru Industrial | 100 | - |
| u_collector1 | collector | Arjun Collector | 9876543230 | Bengaluru South | 100 | true |
| u_collector2 | collector | Meena Logistics | 9876543231 | Kanakapura | 110 | true |

OTP: Random 1000-9999, logged to backend console [OTP] + returned demo_otp JSON.

## Listings

| ID | Farmer | Type | Qty | Price | Grade | Status | Lat/Lng | Desc |
| ---- | -------- | ------ | ----- | ------- | ------- | -------- | --------- | ------ |
| l1 | u_farmer1 | Banana Stem | 100kg | ₹6 | A2 | APPROVED | 12.834,77.401 | Fresh |
| l2 | u_farmer2 | Rice Straw | 500kg | ₹3.5 | B1 | PENDING | 13.0827,77.609 | Dry |
| l3 | u_farmer1 | Sugarcane Bagasse | 300kg | ₹4 | A2 | APPROVED | 12.834,77.401 | Bagasse |

## Requirements

| ID | Company | Type | Qty Needed | Max Price | Grade | Status | Notes |
|----|---------|------|------------|-----------|-------|--------|-------|
| r1 | u_company1 | Banana Stem | 80kg | ₹7 | A2 | OPEN | Plates |
| r2 | u_company1 | Rice Straw | 400kg | ₹5 | B1 | OPEN | Pulp |

## Orders, Verifications, Payments

Initially empty, created via admin matching flow:

- Match r1 80kg with l1 100kg → Order with matched_quantity 80, price 6, status MATCHED, OTP 4-digit, l1 remaining 20 APPROVED
- Assign collector → ASSIGNED
- Verify → VERIFIED + verification record
- OTP confirm → PICKED_UP → PAID (gross 480, commission 48, net 432) → COMPLETED after 0.8s

Impact after 1 completed 80kg:

- waste 80kg, income 432, commission 48, orders 1, co2 120kg

## Additional Test Data

- Banana Stem 50kg ₹5 A1 Ramanagara → rank high
- Rice Straw 1000kg ₹6 B2 (price > max 5 for r2 → no match)
- Coconut Husk 200kg ₹8 B1 (no requirement)

- Banana Stem 20kg max ₹6 → matches l1 remaining 20 exactly
- Banana Stem 150kg max ₹7 → partial 100 matched, remaining 50 PARTIALLY_MATCHED

- Collector offline → score -20 if no nearby
- Far away collector lat 11.0 lng 76.0 → distance > radius not counted nearby

## Reset

```bash
cd backend && rm -rf data/*.json uploads/* && npm run seed
# clear browser localStorage for localhost:5173
```

## Privacy

Fake names/phones, not real persons. Don't upload sensitive photos, uploads/ served public at /uploads/:filename.
