import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Heart, Star, Plus, Check } from 'lucide-react'
import { posterUrl } from '../services/tmdb'
import { useFavoritesStore, useUIStore } from '../store'

export default function MovieCard({ item, size = 'md' }) {
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const { openModal } = useUIStore()

  if (!item) return null

  const isMovie = item.media_type === 'movie' || item.title
  const title = item.title || item.name || ''
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average?.toFixed(1)
  const poster = posterUrl(item.poster_path, size === 'lg' ? 'w500' : 'w342')
  const fav = isFavorite(item.id)

  const sizeClasses = {
    sm: 'w-32 md:w-36 shrink-0',
    md: 'w-40 md:w-44 shrink-0',
    lg: 'w-full', // fully responsive for grids
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    if (isMovie) navigate(`/watch/movie/${item.id}`)
    else navigate(`/watch/tv/${item.id}/1/1`)
  }

  const handleFav = (e) => {
    e.stopPropagation()
    if (fav) removeFavorite(item.id)
    else addFavorite({ ...item, media_type: isMovie ? 'movie' : 'tv' })
  }

  const handleClick = () => openModal({ ...item, media_type: isMovie ? 'movie' : 'tv' })

  return (
    <div
      className={`${sizeClasses[size]} ${size !== 'lg' ? 'shrink-0' : ''} group relative cursor-pointer`}
      onClick={handleClick}
    >
      {/* Poster */}
      <div className="relative rounded-xl overflow-hidden bg-[#111] aspect-[2/3] shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-1 group-hover:ring-white/20">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
            <div className="w-12 h-12 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
              <Play size={20} className="text-[#6366f1]" />
            </div>
            <p className="text-xs text-[#64748b] text-center px-2 line-clamp-2">{title}</p>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3">
          {/* Top: fav button */}
          <div className="flex justify-end">
            <button
              onClick={handleFav}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                fav
                  ? 'bg-[#e11d48] text-white'
                  : 'bg-black/50 text-white hover:bg-[#e11d48]/80 backdrop-blur-sm'
              }`}
            >
              <Heart size={14} className={fav ? 'fill-white' : ''} />
            </button>
          </div>

          {/* Bottom: info + play */}
          <div className="space-y-2">
            {rating && (
              <div className="flex items-center gap-1">
                <Star size={11} className="text-gold fill-[#fbbf24]" />
                <span className="text-white text-xs font-medium">{rating}</span>
              </div>
            )}
            <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight">
              {title}
            </h3>
            <button
              onClick={handlePlay}
              className="w-full py-2 rounded-lg bg-white text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/90 transition-colors"
            >
              <Play size={11} className="fill-black" />
              Play
            </button>
          </div>
        </div>

        {/* NEW badge for recently added */}
        {item.isNew && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#6366f1] text-white text-[10px] font-bold uppercase">
            New
          </div>
        )}
      </div>

      {/* Title below (visible when not hovered — for browse pages) */}
      {size === 'lg' && (
        <div className="mt-2 px-0.5">
          <p className="text-sm text-white font-medium line-clamp-1">{title}</p>
          <p className="text-xs text-[#64748b]">{year}</p>
        </div>
      )}
    </div>
  )
}
