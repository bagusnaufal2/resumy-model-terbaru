# ResuMy Frontend

The ResuMy frontend is built with React and Vite. It provides the resume
analysis page, roadmap generator, result dashboard, and CV builder.

## Run Locally

```powershell
npm ci
npm run dev
```

The default local URL is:

```text
http://localhost:5173
```

## Environment

Create a `.env` file if the frontend needs to use a custom backend URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

If `.env` is not created, the frontend uses `http://127.0.0.1:5000` as the
default backend URL during development.

## Check

```powershell
npm run lint
npm run build
```
