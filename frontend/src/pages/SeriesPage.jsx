import { useEffect, useState } from 'react'
import MovieCard from '../components/MovieCard'
import { getPopularSeries, getTopRatedSeries, getAiringTodaySeries } from '../services/tmdb'

const GENRES = [
  { id: 10759, name: 'Action' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10765, name: 'Sci-Fi' },
  { id: 9648, name: 'Mystery' },
  { id: 10766, name: 'Soap' },
]

export default function SeriesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('popular')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const load = async (newPage = 1, append = false) => {
    setLoading(true)
    try {
      const fn = sort === 'popular' ? getPopularSeries
        : sort === 'top' ? getTopRatedSeries
        : getAiringTodaySeries
      const data = await fn(newPage)
      const results = (data.results || []).map(i => ({ ...i, media_type: 'tv' }))
      setItems(prev => append ? [...prev, ...results] : results)
      setHasMore(newPage < (data.total_pages || 1))
    } catch { } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    load(1, false)
  }, [sort])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next, true)
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-6 md:px-12 pb-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-white">TV Series</h1>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-white/10 transition-colors"
          >
            <option value="popular">Popular</option>
            <option value="top">Top Rated</option>
            <option value="airing">Airing Today</option>
          </select>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i}><div className="skeleton aspect-[2/3] rounded-xl" /></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {items.map(item => (
                <MovieCard key={item.id} item={item} size="lg" />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/10 cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
