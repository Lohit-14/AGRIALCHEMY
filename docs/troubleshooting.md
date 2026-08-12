# Troubleshooting — AgriAlchemy MVP

## Landing Hero Text Disappears (Fixed)

- Cause: GSAP .from with CSS opacity 0 animates 0→0 stays hidden
- Fix: fromTo autoAlpha 0→1, safety net forces visible after 1.8s, removed Lenis, removed progress bar

## Scroll Not Smooth (Fixed)

- Cause: Lenis with long duration + double RAF
- Fix: Removed Lenis, native scroll-behavior smooth + GSAP only

## Background Not Proper (Fixed)

- Cause: hero and section max-width 1320px boxed background not full-bleed, outer side paddings
- Fix: hero width 100vw negative margins, outer padding 0, inner hero-inner max-width 1320px centered padding 32px sides, background radial gradients more visible opacity 0.68 no multiply, sections full-bleed 100vw with inner max-width

## Login Role Selector Removed

- Now phone only + OTP, role detected from account, new phones prompt for profile with role choice once

## OTP Not Received

- OTP simulated, logged to backend console [OTP] + returned demo_otp JSON, not SMS

## 401 No Token

- Frontend stores token agrialchemy_token in localStorage, sends Authorization Bearer, if expired login again

## 403 Forbidden Approving Listing

- Only admin can approve, login as admin 9999999999

## File Upload 413/500

- Multer 5MB limit, ensure uploads/ writable, <5MB image

## Orders Stuck PICKED_UP

- Server restarted during setTimeout auto PAID→COMPLETED, manually update data/orders.json to COMPLETED and ensure payment exists, future use job queue

## Impact 0 Despite Completed

- Payments missing or orders not COMPLETED, ensure COMPLETED + payment with matching order_id

## PORT Already in Use

- lsof -i :5000 kill -9 PID or change PORT in backend/.env and VITE_API_URL in frontend/.env, update CORS_ORIGIN

## Cannot Find Module Express

- cd backend && npm install, cd frontend && npm install

## Data Corrupted

- Stop backend, rm data/*.json, npm run seed, clear browser localStorage for localhost:5173

## Icons Not Showing

- Lucide CDN <https://unpkg.com/lucide>, call lucide.createIcons() after DOM load + refreshLucide after dynamic

## Reset Nuclear

```bash
cd backend && rm -rf data/*.json uploads/* && npm run seed
# clear browser localStorage
```
