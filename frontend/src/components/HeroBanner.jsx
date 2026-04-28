import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Info, Star, Volume2, VolumeX } from 'lucide-react'
import { backdropUrl } from '../services/tmdb'
import { useUIStore } from '../store'

export default function HeroBanner({ items = [] }) {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const navigate = useNavigate()
  const { openModal } = useUIStore()

  const item = items[current]

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % items.length)
        setTransitioning(false)
      }, 400)
    }, 8000)
    return () => clearInterval(timer)
  }, [items.length])

  if (!item) {
    return (
      <div className="w-full h-[75vh] bg-[#111] animate-pulse" />
    )
  }

  const isMovie = item.media_type === 'movie' || item.title
  const title = item.title || item.name || ''
  const overview = item.overview || ''
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average?.toFixed(1)
  const backdrop = backdropUrl(item.backdrop_path)
  const genres = item.genre_ids || []

  const handleWatch = () => {
    if (isMovie) navigate(`/watch/movie/${item.id}`)
    else navigate(`/watch/tv/${item.id}/1/1`)
  }

  return (
    <div className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: backdrop ? `url(${backdrop})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 hero-gradient-left" />
      <div className="absolute inset-0 bg-[#050505]/30" />

      {/* Content */}
      <div
        className={`absolute bottom-0 left-0 right-0 pb-16 px-8 md:px-16 max-w-3xl transition-all duration-500 ${
          transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md bg-[#6366f1]/20 border border-[#6366f1]/40 text-[#a5b4fc] text-xs font-medium uppercase tracking-wide">
            {isMovie ? 'Movie' : 'Series'}
          </span>
          {year && (
            <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#94a3b8] text-xs">
              {year}
            </span>
          )}
          {rating && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">
              <Star size={10} className="text-gold fill-[#fbbf24]" />
              <span className="text-white font-medium">{rating}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tight">
          {title}
        </h1>

        {/* Overview */}
        {overview && (
          <p className="text-[#94a3b8] text-base md:text-lg leading-relaxed mb-8 line-clamp-2 max-w-xl">
            {overview}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="hero-play-btn"
            onClick={handleWatch}
            className="flex items-center gap-2.5 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 cursor-pointer shadow-lg text-sm"
          >
            <Play size={18} className="fill-black" />
            Play
          </button>
          <button
            id="hero-info-btn"
            onClick={() => openModal(item)}
            className="flex items-center gap-2.5 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 border border-white/10 transition-all duration-200 cursor-pointer text-sm backdrop-blur-sm"
          >
            <Info size={18} />
            More Info
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-8 md:right-16 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { setTransitioning(true); setTimeout(() => { setCurrent(i); setTransitioning(false) }, 400) }}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === current ? 'bg-white w-6' : 'bg-white/30 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
