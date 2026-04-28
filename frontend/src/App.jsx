import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import MovieModal from './components/MovieModal'
import HomePage from './pages/HomePage'
import MoviesPage from './pages/MoviesPage'
import SeriesPage from './pages/SeriesPage'
import SearchPage from './pages/SearchPage'
import FavoritesPage from './pages/FavoritesPage'
import WatchPage from './pages/WatchPage'

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar is hidden on watch pages */}
      <Routes>
        <Route path="/watch/*" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/series" element={<SeriesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/watch/:type/:id" element={<WatchPage />} />
        <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />
      </Routes>

      {/* Global modal */}
      <MovieModal />
    </BrowserRouter>
  )
}
