import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, X, Home, Film, Tv, Heart } from 'lucide-react'
import { useUIStore } from '../store'
import { searchMulti } from '../services/tmdb'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { searchQuery, setSearchQuery, openModal } = useUIStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const handleSearch = (val) => {
    setSearchQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMulti(val)
        setResults(data.results?.slice(0, 6) || [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 150)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
    setResults([])
  }

  // Ouvre la modale au lieu de naviguer vers une route inexistante
  const goTo = (item) => {
    closeSearch()
    openModal({
      ...item,
      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
    })
  }

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/series', label: 'Series', icon: Tv },
    { to: '/favorites', label: 'My List', icon: Heart },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <polygon points="3,2 13,8 3,14" fill="white"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Family<span className="text-[#6366f1]">Stream</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                location.pathname === to
                  ? 'text-white bg-white/10'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="flex items-center gap-3 ml-auto">
          {searchOpen ? (
            <div className="relative animate-scale-in">
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
                    closeSearch()
                  }
                  if (e.key === 'Escape') closeSearch()
                }}
                placeholder="Movies, series..."
                className="w-64 bg-white/10 border border-white/15 rounded-xl px-4 py-2 pr-10 text-sm text-white placeholder-[#64748b] outline-none focus:border-[#6366f1] focus:bg-white/15 transition-all"
              />
              <button onClick={closeSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white cursor-pointer">
                <X size={16} />
              </button>

              {/* Dropdown */}
              {results.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
                  {results.map(item => {
                    if (!item.poster_path && !item.profile_path) return null
                    const isMovie = item.media_type === 'movie' || item.title
                    return (
                      <button
                        key={item.id}
                        onClick={() => goTo(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left cursor-pointer transition-colors"
                      >
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                            alt=""
                            className="w-8 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-8 h-12 bg-white/10 rounded flex items-center justify-center">
                            {isMovie ? <Film size={14} className="text-[#6366f1]" /> : <Tv size={14} className="text-[#6366f1]" />}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-white font-medium line-clamp-1">
                            {item.title || item.name}
                          </p>
                          <p className="text-xs text-[#64748b]">
                            {isMovie ? 'Movie' : 'Series'} • {(item.release_date || item.first_air_date || '').slice(0,4)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                  <button
                    onClick={() => { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); closeSearch() }}
                    className="w-full px-4 py-3 text-sm text-[#6366f1] hover:bg-white/5 cursor-pointer border-t border-white/10 text-left transition-colors"
                  >
                    See all results →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="search-btn"
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Rechercher"
            >
              <Search size={18} />
            </button>
          )}

          {/* Avatar */}
          
        </div>
      </div>
    </header>
  )
}
