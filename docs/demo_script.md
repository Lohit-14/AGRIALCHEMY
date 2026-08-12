# Demo Script — AgriAlchemy MVP (5-7 min)

Setup:

```bash
cd backend && npm install && npm run seed && npm run dev # :5000 /api/health
# new terminal
cd frontend && npm install && npm run dev # :5173
```

Clear: rm backend/data/*.json && npm run seed + clear localStorage for localhost:5173

Problem (30 sec): Farmers burn 500M tons residue, pollution, lost income. Companies need verified graded traceable supply for sustainable products. No trust layer. MVP is managed 4-role marketplace broker model with admin approval, matching engine, collector verification, impact tracking.

Act 1 Farmer Post (45 sec): Login /login phone 9876543210 Send OTP copy from backend console Verify → /farmer Dashboard KPIs. Post Waste: Banana Stem 150kg ₹6 A2 current location photo → Submit PENDING

Act 2 Admin Approve & Matching (90 sec): Login Admin 9999999999 → /admin Dashboard KPIs. Listing Management pending 150kg approve → APPROVED. Requirement Management r1 Banana Stem 80kg max ₹7. Matching Console click r1 → ranked candidates explanation scoring 100 - dist*0.4 + grade_diff*5 + trust*0.2 - age*1.5 -20 if no collector. Top l1 100kg @6 distance 15km 2 collectors score 92. Confirm Match → Order MATCHED 80kg remaining 20 APPROVED. Order Tracking shows MATCHED OTP 4821. Assign Collector dropdown distance-sorted Arjun 15km Online → ASSIGNED

Act 3 Collector Verify & Pickup (60 sec): Login Collector 9876543230 → /collector Dashboard Assigned 1. Assigned Pickups To Verify card Banana Stem 80kg OTP 4821 Verify button → Verification Form qty 80 grade A2 photo → Submit VERIFIED. In Progress VERIFIED Confirm Pickup modal expected OTP 4821 enter → PICKED_UP → auto PAID gross 480 commission 48 net 432 → auto COMPLETED 0.8s

Act 4 Company Matched + Impact (45 sec): Login Company 9876543220 → /company Matched Waste shows matched & verified only not raw listings per trust rule, table with verification photo. Payment Tracking gross commission breakdown. Public Landing / impact shows waste diverted 80kg farmer income 432 orders 1 co2 120kg formula kg*1.5

Close 30 sec: Flow PENDING→APPROVED→MATCHED→ASSIGNED→VERIFIED→PICKED_UP→PAID→COMPLETED trust +10/-20. MVP is Express+React file DB localhost :5000/:5173 ready to swap to MongoDB, cloud storage, real OTP, payments. Out of scope AI grading, IoT, mobile app, forecasting, blockchain. Roadmap full cloud + AI + multi-language + carbon credits.

Q&A: Why managed not open? Quality fraud, no logistics. Why file DB? Localhost without external services, one-line swap to Mongoose. Photo fraud prevention? Mandatory photo+geo+timestamp+collector verification+trust. Commission? Admin-configurable default 10%. Partial? Allowed remainder stays.

Timing: Problem 0:30, Farmer 0:45 (1:15), Admin 1:30 (2:45), Collector 1:00 (3:45), Company 0:45 (4:30), Close 0:30 (5:00) + 2 min Q&A

Backup: video recording, screenshots, backend data backup JSON.

Landing has no demo per request, all demo here.
