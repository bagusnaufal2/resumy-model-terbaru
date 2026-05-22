# Deployment Guide

## Recommended architecture

- `front-end` -> Vercel
- `back-end` -> Node.js service on VPS
- `ai-service` -> FastAPI service on the same VPS
- `nginx` -> reverse proxy in front of the backend and AI service

Suggested public URLs:

- Frontend: `https://your-app.vercel.app`
- Backend API: `https://api.yourdomain.com`
- AI service: keep it private on the VPS, for example `http://127.0.0.1:8000`

## Frontend on Vercel

Project root:

```text
front-end
```

Build settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Environment variables:

```text
VITE_API_BASE_URL=https://api.yourdomain.com
```

`vercel.json` is included so React Router routes such as `/result` and
`/cv-builder` still work on refresh.

## Backend on VPS

Install Node.js 20+ on the VPS, then deploy the `back-end` folder.

Required environment variables:

```text
PORT=5000
AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_TIMEOUT_MS=30000
FRONTEND_ORIGIN=https://your-app.vercel.app
```

If you use a custom frontend domain, replace `FRONTEND_ORIGIN` with that domain.
Multiple origins can be separated with commas.

Start command:

```bash
npm install
npm start
```

Recommended process manager:

```bash
pm2 start server.js --name resumy-backend
```

## AI service on VPS

Install Python 3.12 or 3.13 and deploy the `ai-service` folder plus model files
inside `ai-service/models`.

Start command:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Recommended process manager:

```bash
pm2 start "uvicorn main:app --host 127.0.0.1 --port 8000" --interpreter bash --name resumy-ai
```

If you prefer, use `systemd` for the Python service instead of PM2.

## Nginx reverse proxy

Expose only the backend publicly. The backend will call the AI service through
`127.0.0.1:8000`.

Example Nginx site:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 5M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then add HTTPS with Let's Encrypt.

## Health checks

- Backend: `GET https://api.yourdomain.com/api/health`
- AI service from VPS only: `GET http://127.0.0.1:8000/health`

## Deployment flow summary

1. Deploy `front-end` to Vercel.
2. Set `VITE_API_BASE_URL` to the backend public URL.
3. Deploy `ai-service` to the VPS and confirm `/health` is healthy.
4. Deploy `back-end` to the VPS with `AI_SERVICE_URL=http://127.0.0.1:8000`.
5. Point Nginx to the backend and enable HTTPS.
