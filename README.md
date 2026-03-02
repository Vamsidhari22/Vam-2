# Vam 2 — AI Marketing Dashboard

An AI-powered marketing dashboard that generates trend reports, analyses brand aesthetics from any website, and creates Instagram-ready posts with DALL-E 3 imagery.

---

## Features

- **Trend Report Generator** — searches the live web via OpenAI's `web_search_preview` tool to produce a structured marketing trend report for any topic
- **Business Analyzer** — scrapes a URL, analyses the brand's aesthetic profile with GPT-4o, and surfaces matching Unsplash photos
- **Instagram Post Generator** — generates a brand-aligned caption, hashtags, and a DALL-E 3 image based on the analysed aesthetics

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python · FastAPI · OpenAI SDK · BeautifulSoup4 · Unsplash API |
| Frontend | React · Vite · Tailwind CSS · Axios · react-markdown |
| Deployment | Vercel (separate projects for backend and frontend) |

---

## Project Structure

```
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── prompts.py            # All OpenAI prompts
│   ├── requirements.txt
│   ├── vercel.json
│   └── routers/
│       ├── trends.py         # POST /trends/analyze
│       ├── aesthetics.py     # POST /aesthetics/analyze, /aesthetics/images
│       └── posts.py          # POST /posts/generate
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api/client.js     # Axios API client
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── TrendReport.jsx
    │       ├── BusinessAnalyzer.jsx
    │       ├── ImageGallery.jsx
    │       └── PostGenerator.jsx
    ├── vercel.json
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key (requires access to `gpt-4o`, `dall-e-3`, and `web_search_preview`)
- Unsplash API access key

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then fill in your keys
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # set VITE_API_URL=http://localhost:8000
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o`) |
| `UNSPLASH_ACCESS_KEY` | Unsplash API access key |

### `frontend/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (default: `http://localhost:8000`) |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/trends/analyze` | Generate a live trend report for a topic |
| `POST` | `/aesthetics/analyze` | Scrape a URL and return brand aesthetics + images |
| `POST` | `/aesthetics/images` | Refresh image results for existing keywords |
| `POST` | `/posts/generate` | Generate an Instagram caption and DALL-E 3 image |
| `GET` | `/health` | Health check |

---

## Deployment (Vercel)

Both projects deploy independently on Vercel.

### Backend

1. Import the `backend/` folder as a new Vercel project
2. Set the environment variables (`OPENAI_API_KEY`, `OPENAI_MODEL`, `UNSPLASH_ACCESS_KEY`) in the Vercel dashboard
3. Vercel will use `backend/vercel.json` to route all requests to `main.py`

### Frontend

1. Import the `frontend/` folder as a new Vercel project
2. Set `VITE_API_URL` to your deployed backend URL
3. Vercel will use `frontend/vercel.json` to build with Vite

> **Note:** Update `allow_origins` in `backend/main.py` to your frontend's Vercel domain before deploying to production.
