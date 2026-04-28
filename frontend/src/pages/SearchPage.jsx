import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Film, Tv } from 'lucide-react'
import MovieCard from '../components/MovieCard'
import { searchMulti } from '../services/tmdb'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    searchMulti(query)
      .then(data => {
        setResults(
          (data.results || []).filter(
            r => r.media_type === 'movie' || r.media_type === 'tv'
          )
        )
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query])

  const filtered = filter === 'all' ? results
    : results.filter(r => r.media_type === filter)

  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-6 md:px-12 pb-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          {results.length > 0 && (
            <p className="text-[#64748b] text-sm">{results.length} result{results.length > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Filter tabs */}
        {results.length > 0 && (
          <div className="flex gap-2 mb-8">
            {[
              { key: 'all', label: 'All' },
              { key: 'movie', label: 'Movies', icon: Film },
              { key: 'tv', label: 'Series', icon: Tv },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                  filter === key
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {Icon && <Icon size={14} />}
                {label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i}><div className="skeleton aspect-[2/3] rounded-xl" /></div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filtered.map(item => (
              <MovieCard key={item.id} item={item} size="md" />
            ))}
          </div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Search size={24} className="text-[#475569]" />
            </div>
            <p className="text-[#94a3b8]">No results for "{query}"</p>
            <p className="text-[#475569] text-sm">Try another search term</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Search size={24} className="text-[#475569]" />
            </div>
            <p className="text-[#94a3b8]">Start typing to search</p>
          </div>
        )}
      </div>
    </div>
  )
}
