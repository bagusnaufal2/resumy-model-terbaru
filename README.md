# ResuMy

ResuMy adalah aplikasi analisis CV yang terdiri dari tiga service:

- `front-end`: aplikasi React + Vite
- `back-end`: API Node.js + Express
- `ai-service`: API FastAPI untuk inference model ATS dan ekstraksi skill

## Persyaratan

Pastikan aplikasi berikut sudah terpasang:

- Node.js 20 atau versi lebih baru
- npm
- Python 3.12 atau Python 3.13

Model AI harus tersedia di folder `ai-service/models`:

```text
resumy_micro_mlp.keras
resumy_ner_skill_artifacts.json
resumy_ner_skill_model.keras
scaler.pkl
tfidf_vectorizer.pkl
```

## Menjalankan Project Secara Lokal

Jalankan ketiga service pada terminal PowerShell yang berbeda, dengan urutan:

1. AI service
2. Backend
3. Frontend

### 1. AI Service

Buka terminal pertama:

```powershell
cd c:\Users\bagus\Downloads\resumy-model-terbaru-local\ai-service

python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Instalasi dependency Python, khususnya TensorFlow, dapat membutuhkan waktu beberapa menit.

Cek apakah AI service sudah hidup:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

### 2. Backend

Buka terminal kedua:

```powershell
cd c:\Users\bagus\Downloads\resumy-model-terbaru-local\back-end

npm ci
npm start
```

Untuk development dengan auto-reload, gunakan:

```powershell
npm run dev
```

Cek apakah backend sudah hidup:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

Secara default, backend berjalan pada port `5000` dan memanggil AI service di
`http://127.0.0.1:8000`.

### 3. Frontend

Buka terminal ketiga:

```powershell
cd c:\Users\bagus\Downloads\resumy-model-terbaru-local\front-end

npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite di browser, biasanya:

```text
http://localhost:5173
```

Dalam mode development, frontend secara default mengakses backend lokal di
`http://127.0.0.1:5000`.

## Konfigurasi Environment

Untuk setup lokal default, file `.env` tidak wajib dibuat.

Frontend dapat diarahkan ke backend lain dengan membuat file `front-end/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Backend mendukung environment variable berikut:

```env
PORT=5000
AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_TIMEOUT_MS=30000
FRONTEND_ORIGIN=http://localhost:5173
```

Catatan: backend saat ini membaca environment variable dari proses Node, tetapi
belum memuat file `.env` secara otomatis. Di PowerShell, variabel tersebut dapat
diatur sebelum menjalankan backend:

```powershell
$env:PORT="5000"
$env:AI_SERVICE_URL="http://127.0.0.1:8000"
$env:AI_SERVICE_TIMEOUT_MS="30000"
$env:FRONTEND_ORIGIN="http://localhost:5173"
npm start
```

## Port Lokal

| Service | URL Lokal | Health Check |
| --- | --- | --- |
| AI service | `http://127.0.0.1:8000` | `GET /health` |
| Backend | `http://127.0.0.1:5000` | `GET /api/health` |
| Frontend | `http://localhost:5173` | - |

## Troubleshooting

### Backend gagal menganalisis CV

Pastikan AI service sudah berjalan pada `http://127.0.0.1:8000` sebelum
melakukan analisis dari frontend.

### Install AI service gagal

Pastikan versi Python adalah 3.12 atau 3.13:

```powershell
python --version
```

Python 3.10 tidak cocok untuk versi Keras yang digunakan model ini, sedangkan
Python 3.14 belum termasuk versi TensorFlow yang didukung untuk project ini.

### Frontend tidak dapat mengakses backend

Pastikan backend aktif pada port `5000`. Bila menggunakan port atau host lain,
isi `VITE_API_BASE_URL` pada `front-end/.env`, kemudian restart `npm run dev`.

## Deployment

Panduan deployment tersedia di [DEPLOYMENT.md](./DEPLOYMENT.md).
