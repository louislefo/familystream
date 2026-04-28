import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Play, Heart, Star, Clock, Film, Tv } from 'lucide-react'
import { getMovieDetails, getSeriesDetails, backdropUrl, posterUrl } from '../services/tmdb'
import { useFavoritesStore, useUIStore } from '../store'

export default function MovieModal() {
  const { selectedMedia, isModalOpen, closeModal } = useUIStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const navigate = useNavigate()

  const isMovie = selectedMedia?.media_type === 'movie' || selectedMedia?.title

  useEffect(() => {
    if (!isModalOpen || !selectedMedia) return
    setLoading(true)
    setDetails(null)
    setShowTrailer(false) // Reset trailer state when opening a new modal
    const fn = isMovie ? getMovieDetails : getSeriesDetails
    fn(selectedMedia.id)
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setLoading(false))
  }, [isModalOpen, selectedMedia?.id])

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isModalOpen])

  if (!isModalOpen || !selectedMedia) return null

  const item = details || selectedMedia
  const title = item.title || item.name || ''
  const overview = item.overview || ''
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average?.toFixed(1)
  const runtime = item.runtime ? `${item.runtime} min` : null
  const genres = item.genres || []
  const backdrop = backdropUrl(item.backdrop_path)
  const poster = posterUrl(item.poster_path, 'w342')
  const imdbId = item.external_ids?.imdb_id || item.imdb_id
  const fav = isFavorite(item.id)

  const handleWatch = () => {
    closeModal()
    if (isMovie) navigate(`/watch/movie/${item.id}`)
    else navigate(`/watch/tv/${item.id}/1/1`)
  }

  const handleFav = () => {
    if (fav) removeFavorite(item.id)
    else addFavorite({ ...selectedMedia, media_type: isMovie ? 'movie' : 'tv' })
  }

  const cast = item.credits?.cast?.slice(0, 8) || []
  const similar = item.similar?.results?.slice(0, 6) || []
  const trailer = item.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full md:max-w-3xl md:max-h-[90vh] bg-[#0e0e0e] md:rounded-2xl overflow-hidden shadow-2xl border border-white/5 animate-scale-in flex flex-col max-h-screen">
        {/* Hero image / Trailer */}
        <div className="relative h-64 md:h-80 shrink-0 bg-black">
          {showTrailer && trailer ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Trailer"
            />
          ) : backdrop ? (
            <img src={backdrop} alt="" className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/50 to-transparent" />

          {/* Close */}
          <button
            id="modal-close-btn"
            onClick={closeModal}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 cursor-pointer transition-all backdrop-blur-sm"
          >
            <X size={18} />
          </button>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
            {poster && (
              <img
                src={poster}
                alt=""
                className="w-20 h-30 rounded-xl object-cover shadow-2xl shrink-0 hidden md:block border border-white/10"
                style={{ height: '120px' }}
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white leading-tight mb-2">{title}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                {rating && (
                  <span className="flex items-center gap-1 text-sm">
                    <Star size={13} className="text-gold fill-[#fbbf24]" />
                    <span className="text-white font-semibold">{rating}</span>
                  </span>
                )}
                {year && <span className="text-[#94a3b8] text-sm">{year}</span>}
                {runtime && (
                  <span className="flex items-center gap-1 text-[#94a3b8] text-sm">
                    <Clock size={12} />
                    {runtime}
                  </span>
                )}
                {genres.slice(0, 3).map(g => (
                  <span key={g.id} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-[#94a3b8]">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* CTA */}
          <div className="px-6 py-4 flex flex-col md:flex-row gap-3 border-b border-white/5">
            <button
              id="modal-play-btn"
              onClick={handleWatch}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 cursor-pointer transition-all text-sm"
            >
              <Play size={16} className="fill-black" />
              Watch Now
            </button>
            {trailer && !showTrailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#e52d27] text-white font-bold rounded-xl hover:bg-[#e52d27]/90 cursor-pointer transition-all text-sm"
              >
                <Play size={16} className="fill-white" />
                Watch Trailer
              </button>
            )}
            <button
              onClick={handleFav}
              className={`w-full md:w-12 py-3 md:py-0 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${
                fav
                  ? 'bg-[#e11d48] border-[#e11d48] text-white'
                  : 'bg-white/5 border-white/10 text-white hover:border-[#e11d48]/50'
              }`}
            >
              <Heart size={18} className={fav ? 'fill-white' : ''} />
            </button>
          </div>

          {/* Overview */}
          {overview && (
            <div className="px-6 py-4">
              <p className="text-[#94a3b8] text-sm leading-relaxed">{overview}</p>
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-3">Cast</h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {cast.map(actor => (
                  <div key={actor.id} className="shrink-0 text-center w-16">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="w-14 h-14 rounded-full object-cover mx-auto mb-1 border border-white/10"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#1a1a1a] mx-auto mb-1 flex items-center justify-center text-[#333]">
                        <Film size={16} />
                      </div>
                    )}
                    <p className="text-[10px] text-[#94a3b8] line-clamp-2 leading-tight">{actor.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMDB ID info */}
          {imdbId && (
            <div className="px-6 pb-4">
              <p className="text-xs text-[#475569]">IMDB: {imdbId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
