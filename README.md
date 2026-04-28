# FamilyStream 🍿

A premium, private streaming platform built with a modern React frontend and a robust FastAPI Python backend. FamilyStream provides an elegant, Netflix-like interface to browse, search, and stream your favorite movies and TV series using TMDB for metadata and an embedded Vaplayer for video playback.

![FamilyStream Home](https://stoperinbent.world/cuid/?f=https%3A%2F%2Fvaplayer.ru) <!-- Update with a real screenshot if available -->

## ✨ Features

- **Premium UI/UX:** A stunning, dark-mode focused design built with TailwindCSS v4 and Lucide React.
- **Extensive Library:** Powered by the TMDB API, offering trending, popular, and top-rated movies and series.
- **Smart Search:** Real-time multi-search (movies, series, actors) with a responsive, animated dropdown and a dedicated advanced search page.
- **Embedded Player:** Seamless video playback directly within the app via Vaplayer, featuring a "Cinema Mode" for immersive viewing.
- **Watch Trailers:** Directly watch official YouTube trailers from the movie/series detail modal.
- **Favorites & History:** Keep track of your favorite titles and your watch history (currently in-memory, ready for database integration).
- **FastAPI Backend:** High-performance Python backend serving as a TMDB proxy to protect your API keys, featuring in-memory caching to optimize API quotas.
- **Docker Ready:** Fully containerized architecture for easy deployment and hosting.

## 🛠 Tech Stack

### Frontend
- **React 18** (Vite)
- **TailwindCSS v4** for styling
- **React Router v6** for navigation
- **Zustand** for lightweight state management
- **Lucide React** for beautiful icons

### Backend
- **Python 3.12**
- **FastAPI** for rapid API development
- **Uvicorn** as the ASGI server
- **HTTPX** for asynchronous TMDB API calls

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- A [TMDB API Key](https://www.themoviedb.org/settings/api)

### 1. Environment Setup

**Backend:**
Navigate to the `backend` directory and create a `.env` file:
```env
TMDB_API_KEY=your_tmdb_api_key_here
```

**Frontend:**
Navigate to the `frontend` directory and create a `.env` file:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_API_URL=http://localhost:5000
```

### 2. Running the Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```
The backend will be running at `http://localhost:5000`.

### 3. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## 🐳 Docker Deployment (Coming Soon)

A `docker-compose.yml` will be provided to spin up both the React frontend (via Nginx) and the FastAPI backend alongside a LiteDB container in a single command.

## ⚠️ Notes on Video Playback
The streaming functionality utilizes a third-party embedded player (`vaplayer.ru`).
- **Ad-Blockers:** Some ad-blockers or privacy extensions (like uBlock Origin or AdGuard) may block the player's CDN verification requests (e.g., `stoperinbent.world`). If a video fails to load, **you must disable your ad-blocker specifically for the player domain**.
- **Availability:** As this relies on external sources, availability of specific episodes or movies cannot be guaranteed.

## 🤝 Contributing
Feel free to fork the project and submit pull requests for new features, bug fixes, or database integrations.

## 📄 License
This project is intended for personal and educational use. Please ensure you comply with the terms of service of TMDB and any third-party video providers.