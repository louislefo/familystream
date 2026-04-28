import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Maximize2, Minimize2, RefreshCw, Server } from 'lucide-react'
import { getMovieDetails, getSeriesDetails } from '../services/tmdb'
import { useHistoryStore } from '../store'

const SERVERS = [
  { id: 'vaplayer', name: 'VaPlayer' },
  { id: 'vidsrc.me', name: 'VidSrc.me' },
  { id: 'vidsrc.to', name: 'VidSrc.to' },
  { id: '2embed', name: '2Embed' },
  { id: 'embed.su', name: 'Embed.su' },
  { id: 'vidlink', name: 'VidLink' },
]

export default function WatchPage() {
  const { type, id, season = '1', episode = '1' } = useParams()
  const navigate = useNavigate()
  const iframeRef = useRef(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cinemaMode, setCinemaMode] = useState(false)
  const [currentSeason, setCurrentSeason] = useState(parseInt(season))
  const [currentEpisode, setCurrentEpisode] = useState(parseInt(episode))
  const [iframeKey, setIframeKey] = useState(0)
  const [selectedServer, setSelectedServer] = useState(SERVERS[0].id)
  const { addToHistory, updateProgress, getProgress } = useHistoryStore()
  // ✅ Capture de la progression UNE SEULE FOIS au chargement
  // On utilise un ref pour ne pas déclencher de re-render quand la progression change
  const initialProgress = useRef(null)
  const isMovie = type === 'movie'

  useEffect(() => {
    setLoading(true)
    const fn = isMovie ? getMovieDetails : getSeriesDetails
    fn(id)
      .then(data => {
        setDetails(data)
        setLoading(false)
        // ✅ Capture la progression seulement maintenant (une seule fois)
        if (initialProgress.current === null) {
          initialProgress.current = getProgress(parseInt(id))
        }
        addToHistory({
          id: parseInt(id),
          tmdbId: parseInt(id),
          imdbId: data.external_ids?.imdb_id,
          title: data.title || data.name,
          poster: data.poster_path,
          media_type: type,
        })
      })
      .catch(() => {
        setLoading(false)
        setError(true)
      })
  }, [id, type])

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type !== 'PLAYER_EVENT') return
      const { player_status, player_progress, player_duration } = e.data.data || {}
      if (player_status === 'playing' && player_progress) {
        updateProgress(parseInt(id), player_progress, player_duration)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [id])

  // ✅ useMemo : ne change QUE quand details/saison/épisode/iframeKey changent
  // PAS quand le store de progression se met à jour → l'iframe ne recharge plus
  const embedUrl = useMemo(() => {
    if (!details) return ''
    const imdbId = details.external_ids?.imdb_id
    const tmdbId = id
    const mediaId = imdbId || tmdbId

    const params = new URLSearchParams()
    params.set('primaryColor', '#6366f1')
    params.set('lang', 'en')
    // Utilise la progression initiale capturée au chargement, pas le store live
    const progress = initialProgress.current || 0
    if (progress > 30) params.set('resumeAt', String(Math.floor(progress)))

    const qs = `?${params.toString()}`

    if (isMovie) {
      switch (selectedServer) {
        case 'vidsrc.me': return `https://vidsrc.me/embed/movie/${mediaId}`
        case 'vidsrc.to': return `https://vidsrc.to/embed/movie/${mediaId}`
        case '2embed': return `https://www.2embed.cc/embed/${mediaId}`
        case 'embed.su': return `https://embed.su/embed/movie/${tmdbId}`
        case 'vidlink': return `https://vidlink.pro/movie/${mediaId}`
        case 'vaplayer':
        default: return `https://vaplayer.ru/embed/movie/${mediaId}${qs}`
      }
    } else {
      switch (selectedServer) {
        case 'vidsrc.me': return `https://vidsrc.me/embed/tv?imdb=${mediaId}&season=${currentSeason}&episode=${currentEpisode}`
        case 'vidsrc.to': return `https://vidsrc.to/embed/tv/${mediaId}/${currentSeason}/${currentEpisode}`
        case '2embed': return `https://www.2embed.cc/embedtv/${mediaId}&s=${currentSeason}&e=${currentEpisode}`
        case 'embed.su': return `https://embed.su/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}`
        case 'vidlink': return `https://vidlink.pro/tv/${mediaId}/${currentSeason}/${currentEpisode}`
        case 'vaplayer':
        default: return `https://vaplayer.ru/embed/tv/${mediaId}/${currentSeason}/${currentEpisode}${qs}`
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, id, isMovie, currentSeason, currentEpisode, iframeKey, selectedServer])

  const changeEpisode = (s, ep) => {
    setCurrentSeason(s)
    setCurrentEpisode(ep)
    setIframeKey(k => k + 1)
  }

  const title = details?.title || details?.name || '...'
  const seasons = details?.seasons?.filter(s => s.season_number > 0) || []

  return (
    <div className={`min-h-screen bg-[#050505] ${cinemaMode ? 'fixed inset-0 z-[200]' : ''}`}>
      <div className={`${
        cinemaMode
          ? 'fixed top-0 left-0 right-0 z-[300] p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity'
          : 'pt-20 px-6 md:px-12 pb-4'
        } flex items-center gap-4`}
      >
        <button
          onClick={() => cinemaMode ? setCinemaMode(false) : navigate(-1)}
          className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          {!cinemaMode && <span className="text-sm">Back</span>}
        </button>
        {!cinemaMode && (
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg truncate">{title}</h1>
            {!isMovie && (
              <p className="text-[#64748b] text-sm">
                Season {currentSeason} — Episode {currentEpisode}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="text-[#94a3b8] hover:text-white cursor-pointer transition-colors p-1"
            title="Reload player"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setCinemaMode(c => !c)}
            className="text-[#94a3b8] hover:text-white cursor-pointer transition-colors p-1"
            title={cinemaMode ? 'Exit cinema mode' : 'Cinema mode'}
          >
            {cinemaMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div
        className={`relative bg-black ${
          cinemaMode ? 'fixed inset-0 z-[200]' : 'mx-auto max-w-6xl px-6 md:px-12'
        }`}
        style={cinemaMode ? {} : { paddingBottom: '1.5rem' }}
      >
        <div
          className={`relative w-full bg-black ${cinemaMode ? 'h-screen' : ''}`}
          style={!cinemaMode ? { paddingBottom: '56.25%', height: 0 } : {}}
        >
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] text-center px-4">
              <p className="text-xl font-bold text-white mb-2">Sorry, this movie is not available.</p>
              <button 
                onClick={() => navigate(-1)} 
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>
          ) : loading || !embedUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full animate-spin" />
                <p className="text-[#64748b] text-sm">Loading player...</p>
              </div>
            </div>
          ) : (
            <iframe
              key={`${embedUrl}-${iframeKey}`}
              ref={iframeRef}
              src={embedUrl}
              className={`${cinemaMode ? 'w-full h-full' : 'absolute top-0 left-0 w-full h-full'} border-0`}
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              title={title}
            />
          )}
        </div>
      </div>

      {!cinemaMode && !loading && embedUrl && (
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e0e0e] p-4 rounded-xl border border-white/5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[#e2e8f0] font-medium">
                <Server size={16} className="text-[#6366f1]" />
                Select Video Server
              </div>
              <p className="text-[#94a3b8] text-xs">If the video is blocked or buffering, try another server.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SERVERS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedServer(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    selectedServer === s.id
                      ? 'bg-[#6366f1] text-white shadow-lg'
                      : 'bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isMovie && !cinemaMode && seasons.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 md:px-12 pb-8 mt-4">
          <div className="border-t border-white/5 pt-6">
            <h3 className="text-white font-semibold mb-4">Episodes</h3>
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
              {seasons.map(s => (
                <button
                  key={s.season_number}
                  onClick={() => changeEpisode(s.season_number, 1)}
                  className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    currentSeason === s.season_number
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Saison {s.season_number}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                { length: seasons.find(s => s.season_number === currentSeason)?.episode_count || 10 },
                (_, i) => i + 1
              ).map(ep => (
                <button
                  key={ep}
                  onClick={() => changeEpisode(currentSeason, ep)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    currentEpisode === ep
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
