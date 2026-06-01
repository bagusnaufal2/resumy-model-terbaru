# Development Guide

Panduan ini dipakai untuk menjalankan ResuMy di environment lokal, mulai dari
tools yang dibutuhkan, instalasi dependency, konfigurasi environment, HTTPS
certificate untuk development, sampai workflow development harian.

## Ringkasan Project

ResuMy terdiri dari tiga service:

| Folder | Service | Tech | Default URL |
| --- | --- | --- | --- |
| `front-end` | Web app | React + Vite | `http://localhost:5173` |
| `back-end` | API gateway | Node.js + Express | `http://127.0.0.1:5000` |
| `ai-service` | AI inference + roadmap | FastAPI + TensorFlow/Keras | `http://127.0.0.1:8000` |

Alur request utama:

```text
Browser -> front-end -> back-end -> ai-service
```

Frontend tidak memanggil `ai-service` secara langsung. Semua request analisis
resume dan roadmap masuk ke backend terlebih dahulu.

## Tools Yang Dibutuhkan

Install tools berikut sebelum mulai development:

- Git
- Node.js 20 atau lebih baru
- npm, sudah termasuk saat install Node.js
- Python 3.12 atau Python 3.13
- pip, sudah termasuk di instalasi Python modern
- PowerShell, Terminal Windows, atau terminal lain yang setara
- OpenRouter API key, hanya wajib untuk fitur roadmap generator
- mkcert, opsional untuk menjalankan development dengan HTTPS lokal

Tools opsional:

- Visual Studio Code
- Postman, Insomnia, atau REST Client extension untuk test API manual
- PM2 untuk simulasi process manager seperti production

## Struktur Folder

```text
.
|-- ai-service/
|   |-- main.py
|   |-- roadmap_generator.py
|   |-- requirements.txt
|   `-- models/
|-- back-end/
|   |-- app.js
|   |-- server.js
|   |-- controllers/
|   |-- routes/
|   |-- middlewares/
|   `-- services/
|-- front-end/
|   |-- src/
|   |-- package.json
|   `-- vite.config.js
|-- README.md
|-- DEPLOYMENT.md
`-- DEVELOPMENT.md
```

## File Model AI

Pastikan file model tersedia di `ai-service/models`:

```text
resumy_micro_mlp.keras
resumy_ner_skill_artifacts.json
resumy_ner_skill_model.keras
scaler.pkl
tfidf_vectorizer.pkl
```

Jika salah satu file tidak ada, endpoint `GET /health` di AI service akan
return `503` karena service tidak bisa memuat model.

## Environment Variables

Setiap service punya konfigurasi sendiri.

### Frontend

Buat file `front-end/.env` dari contoh:

```powershell
Copy-Item front-end\.env.example front-end\.env
```

Isi development default:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Jika file `.env` tidak dibuat, frontend otomatis memakai
`http://127.0.0.1:5000` saat development.

### Backend

Buat file `back-end/.env` dari contoh:

```powershell
Copy-Item back-end\.env.example back-end\.env
```

Isi development default:

```env
PORT=5000
AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_TIMEOUT_MS=120000
FRONTEND_ORIGIN=http://localhost:5173
```

Catatan penting: backend saat ini tidak memakai package `dotenv`, jadi
`npm start` dan `npm run dev` tidak otomatis membaca `back-end/.env`.

Gunakan salah satu cara berikut:

1. Set environment variable langsung di terminal sebelum menjalankan backend:

```powershell
cd back-end
$env:PORT="5000"
$env:AI_SERVICE_URL="http://127.0.0.1:8000"
$env:AI_SERVICE_TIMEOUT_MS="120000"
$env:FRONTEND_ORIGIN="http://localhost:5173"
npm run dev
```

2. Jika Node.js yang dipakai mendukung `--env-file`, jalankan:

```powershell
cd back-end
node --env-file=.env server.js
```

Untuk auto reload dengan `nodemon` dan `--env-file`:

```powershell
cd back-end
npx nodemon --exec "node --env-file=.env" server.js
```

### AI Service

Buat file `ai-service/.env` dari contoh:

```powershell
Copy-Item ai-service\.env.example ai-service\.env
```

Isi development default:

```env
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=your-model
AI_SERVICE_ALLOWED_ORIGINS=http://127.0.0.1:5000,http://localhost:5173,http://127.0.0.1:5173
```

`OPENROUTER_API_KEY` wajib untuk endpoint roadmap generator. Endpoint analisis
resume tetap bisa berjalan selama file model AI tersedia.

## Instalasi Dependency

Jalankan instalasi di masing-masing folder service.

### 1. Install AI Service

```powershell
cd ai-service
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Jika tidak punya Python launcher `py`, pakai:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 2. Install Backend

```powershell
cd back-end
npm ci
```

Jika `package-lock.json` berubah atau dependency baru ditambahkan, gunakan:

```powershell
npm install
```

### 3. Install Frontend

```powershell
cd front-end
npm ci
```

Jika `package-lock.json` berubah atau dependency baru ditambahkan, gunakan:

```powershell
npm install
```

## Menjalankan Development Lokal

Jalankan tiga service di tiga terminal berbeda. Urutan yang disarankan:

1. AI service
2. Backend
3. Frontend

### Terminal 1: AI Service

```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "success": true,
  "message": "AI service is ready."
}
```

### Terminal 2: Backend

Dengan environment variable manual:

```powershell
cd back-end
$env:PORT="5000"
$env:AI_SERVICE_URL="http://127.0.0.1:8000"
$env:AI_SERVICE_TIMEOUT_MS="120000"
$env:FRONTEND_ORIGIN="http://localhost:5173"
npm run dev
```

Atau dengan `--env-file`:

```powershell
cd back-end
npx nodemon --exec "node --env-file=.env" server.js
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running"
}
```

### Terminal 3: Frontend

```powershell
cd front-end
npm run dev
```

Buka:

```text
http://localhost:5173
```

## HTTPS Certificate Untuk Development Lokal

Secara default development lokal memakai HTTP. HTTPS lokal hanya diperlukan
kalau ingin mengetes behavior yang butuh secure context, misalnya integrasi
browser API tertentu, cookie dengan flag `Secure`, atau simulasi production.

Cara yang direkomendasikan adalah memakai `mkcert`, karena certificate-nya bisa
dipercaya oleh browser lokal.

### 1. Install mkcert

Windows dengan Chocolatey:

```powershell
choco install mkcert
```

Windows dengan Scoop:

```powershell
scoop install mkcert
```

macOS:

```bash
brew install mkcert
```

Linux, ikuti package manager distro masing-masing atau gunakan release binary
dari mkcert.

### 2. Install Local CA

Jalankan sekali saja di machine lokal:

```powershell
mkcert -install
```

### 3. Buat Folder Certificate

Dari root project:

```powershell
New-Item -ItemType Directory -Force certs
```

### 4. Generate Certificate Lokal

```powershell
mkcert -key-file certs\localhost-key.pem -cert-file certs\localhost.pem localhost 127.0.0.1 ::1
```

File `*.pem` sudah di-ignore oleh `.gitignore`, jadi certificate lokal tidak
akan ikut ter-commit.

### 5. Jalankan Frontend Dengan HTTPS

Vite bisa memakai certificate lewat CLI:

```powershell
cd front-end
npm run dev -- --host localhost --https --cert ..\certs\localhost.pem --key ..\certs\localhost-key.pem
```

Buka:

```text
https://localhost:5173
```

Update `front-end/.env` jika backend juga ingin dipanggil lewat HTTPS:

```env
VITE_API_BASE_URL=https://localhost:5000
```

### 6. Backend HTTPS Lokal

Backend Express saat ini hanya listen HTTP melalui `app.listen(...)`.
Untuk development normal, biarkan backend tetap HTTP:

```text
https://localhost:5173 -> http://127.0.0.1:5000 -> http://127.0.0.1:8000
```

Jika benar-benar perlu backend HTTPS lokal, opsi yang paling dekat dengan
arsitektur production adalah menjalankan reverse proxy lokal seperti Caddy,
Nginx, atau mkcert-compatible proxy di depan backend. Dengan begitu kode
backend tidak perlu diubah khusus untuk certificate lokal.

Contoh konsep:

```text
https://localhost:5000 -> reverse proxy -> http://127.0.0.1:5000
```

Saat frontend berjalan dari `https://localhost:5173` dan backend tetap HTTP,
browser bisa memblokir request karena mixed content. Jika itu terjadi, gunakan
salah satu pilihan:

- Jalankan frontend tetap HTTP untuk development harian.
- Jalankan backend di belakang reverse proxy HTTPS lokal.
- Test HTTPS penuh di environment staging.

### 7. Production HTTPS

Untuk production, jangan pakai certificate lokal dari mkcert. Gunakan domain
publik dan certificate resmi, misalnya Let's Encrypt.

Rekomendasi production:

```text
Frontend: https://your-app.vercel.app
Backend:  https://api.yourdomain.com
AI:       http://127.0.0.1:8000, private di server
```

Detail deployment dan Nginx ada di `DEPLOYMENT.md`.

## Workflow Development Harian

1. Pull update terbaru dari repository.
2. Jalankan instalasi dependency jika `package-lock.json` atau
   `requirements.txt` berubah.
3. Start `ai-service`.
4. Start `back-end`.
5. Start `front-end`.
6. Kerjakan perubahan di branch terpisah.
7. Jalankan lint, build, dan health check sebelum push.

Contoh branch:

```powershell
git checkout -b feat/resume-analysis-ui
```

## Menambah Dependency

Frontend:

```powershell
cd front-end
npm install nama-package
```

Backend:

```powershell
cd back-end
npm install nama-package
```

AI service:

```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
python -m pip install nama-package
python -m pip freeze > requirements.lock.txt
```

Untuk dependency Python utama project, update `requirements.txt` secara sadar
dan pastikan versi masih kompatibel dengan TensorFlow/Keras yang dipakai.

## Verifikasi Sebelum Commit

Frontend:

```powershell
cd front-end
npm run lint
npm run build
```

Backend:

```powershell
cd back-end
npm start
```

Lalu test:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

AI service:

```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
python -m py_compile main.py roadmap_generator.py
uvicorn main:app --host 127.0.0.1 --port 8000
```

Lalu test:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

## Endpoint Penting

Backend:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/api/health` | Cek status backend |
| `POST` | `/api/analyses` | Upload resume dan job description |
| `GET` | `/api/analyses` | Ambil history analisis |
| `GET` | `/api/analyses/:id` | Ambil detail satu analisis |
| `POST` | `/api/analyze` | Endpoint analisis legacy |
| `POST` | `/api/generate-roadmap` | Generate roadmap belajar |

AI service:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/health` | Cek status model dan service |
| `POST` | `/analyze` | Analisis teks resume dan job description |
| `POST` | `/api/generate-roadmap` | Generate roadmap lewat OpenRouter |

## Troubleshooting

### PowerShell Menolak Activate.ps1

Jika muncul error execution policy saat activate virtual environment:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Tutup dan buka terminal lagi, lalu jalankan ulang:

```powershell
.\.venv\Scripts\Activate.ps1
```

### Python Dependency Gagal Install

Pastikan Python yang dipakai adalah 3.12 atau 3.13:

```powershell
python --version
```

Jika ada beberapa versi Python:

```powershell
py -0p
py -3.12 -m venv .venv
```

### AI Service Return 503

Kemungkinan penyebab:

- File model belum ada di `ai-service/models`.
- Virtual environment belum aktif.
- Dependency Python belum terinstall lengkap.
- Versi Python tidak kompatibel dengan TensorFlow/Keras.

Test ulang:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

### Roadmap Generator Gagal

Kemungkinan penyebab:

- `OPENROUTER_API_KEY` belum diset.
- API key invalid.
- Model OpenRouter salah.
- Rate limit atau request ke OpenRouter gagal.

Pastikan `ai-service/.env` berisi:

```env
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=your-model
```

Restart AI service setelah mengubah `.env`.

### Frontend Tidak Bisa Akses Backend

Pastikan backend hidup:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

Pastikan `front-end/.env` mengarah ke backend:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Restart Vite setelah mengubah `.env`.

### Error CORS

Pastikan `FRONTEND_ORIGIN` di backend sama dengan origin frontend yang sedang
dibuka di browser.

HTTP lokal:

```env
FRONTEND_ORIGIN=http://localhost:5173
```

HTTPS lokal:

```env
FRONTEND_ORIGIN=https://localhost:5173
```

Jika perlu lebih dari satu origin, pisahkan dengan koma:

```env
FRONTEND_ORIGIN=http://localhost:5173,https://localhost:5173
```

Restart backend setelah mengubah environment variable.

### Mixed Content Saat Pakai HTTPS

Jika frontend dibuka lewat `https://localhost:5173` tetapi backend masih
`http://127.0.0.1:5000`, browser bisa menolak request.

Solusi:

- Gunakan HTTP untuk semua service saat development harian.
- Atur reverse proxy HTTPS lokal untuk backend.
- Test skenario HTTPS penuh di staging atau production.

### Port Sudah Dipakai

Cek proses yang memakai port:

```powershell
netstat -ano | findstr :5173
netstat -ano | findstr :5000
netstat -ano | findstr :8000
```

Matikan proses berdasarkan PID:

```powershell
Stop-Process -Id <PID>
```

Atau jalankan service di port lain dan update environment variable terkait.

## Catatan Git

File berikut tidak boleh di-commit:

- `.env`
- `.env.*` selain `.env.example`
- `.venv`
- `node_modules`
- `dist`
- file certificate lokal seperti `.pem`, `.key`, `.p12`, `.pfx`
- runtime data di `back-end/data`

Sebelum commit, cek perubahan:

```powershell
git status
```

Jika Git menolak karena `dubious ownership`, jalankan hanya jika folder ini
memang repository lokal yang dipercaya:

```powershell
git config --global --add safe.directory C:/Users/bagus/Documents/Dicoding/CAPSTONE/resumy-model-terbaru-resumy-model-baru-v3-roadmapgen
```

## Quick Start

Kalau semua dependency sudah pernah diinstall, jalankan ini di tiga terminal:

Terminal 1:

```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2:

```powershell
cd back-end
$env:PORT="5000"
$env:AI_SERVICE_URL="http://127.0.0.1:8000"
$env:FRONTEND_ORIGIN="http://localhost:5173"
npm run dev
```

Terminal 3:

```powershell
cd front-end
npm run dev
```

Buka:

```text
http://localhost:5173
```
