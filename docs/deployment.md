# Deployment — AgriAlchemy MVP (Localhost Primary)

## Localhost MVP

Backend :5000 + Frontend :5173, file DB

**Backend:**

```bash
cd backend
npm install
npm run seed   # creates data/*.json if missing
npm run dev    # http://localhost:5000, /api/health, /api/docs
```

Env `backend/.env`:

```
PORT=5000
JWT_SECRET=change_me_long_random
CORS_ORIGIN=http://localhost:5173
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173, proxy /api → :5000
```

Env `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

One-command:

```bash
chmod +x run-localhost.sh
./run-localhost.sh
```

Build frontend for static:

```bash
cd frontend
npm run build   # dist/
```

## Cloud Deployment (Next Step for MVP)

**Backend Render/Railway/EC2:**

- Root Directory `backend`, Build `npm install`, Start `npm start`
- Env: PORT, JWT_SECRET, CORS_ORIGIN=<https://your-frontend.vercel.app>, MONGODB_URI (Atlas), etc
- Note file DB ephemeral on Render, switch to MongoDB Atlas before cloud prod

**Frontend Vercel:**

- Framework Vite, Root `frontend`, Build `npm run build`, Output `dist`, Env `VITE_API_URL=https://api.agrialchemy.in/api`

**DB MongoDB Atlas:**

- Create cluster, DB agrialchemy, get uri `mongodb+srv://...`, set MONGODB_URI, replace fileDB with Mongoose

**Storage Firebase:**

- Create project, enable Storage, service account private key, set FIREBASE_*, upload via firebase-admin, signed URLs

**Env Separation:**

- Dev/staging/prod via hosting dashboards, NODE_ENV=production enables stricter CORS, Helmet, rate limiting

**CI/CD GitHub Actions:**

- On push main, backend test + deploy to Render via deploy hook, frontend build + Vercel deploy

**Domain + SSL:**

- Vercel custom domain, Render custom domain, Cloudflare A record + Certbot Nginx `certbot --nginx -d api.agrialchemy.in`

**Health & Monitoring:**

- /api/health, UptimeRobot ping, Sentry, Winston logging

**Scaling:**

- File DB single instance only, switch to MongoDB, Redis for OTP, PM2 cluster, CDN for uploads
