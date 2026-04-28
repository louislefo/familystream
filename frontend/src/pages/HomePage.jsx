import { useEffect, useState } from 'react'
import HeroBanner from '../components/HeroBanner'
import MovieSlider from '../components/MovieSlider'
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getPopularSeries,
} from '../services/tmdb'
import { useFavoritesStore, useHistoryStore } from '../store'
import MovieCard from '../components/MovieCard'

export default function HomePage() {
  const [hero, setHero] = useState([])
  const [trending, setTrending] = useState([])
  const [popular, setPopular] = useState([])
  const [topRated, setTopRated] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const { favorites } = useFavoritesStore()
  const { history } = useHistoryStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [trendData, popData, topData, nowData, seriesData] = await Promise.all([
          getTrending('all', 'week'),
          getPopularMovies(),
          getTopRatedMovies(),
          getNowPlayingMovies(),
          getPopularSeries(),
        ])
        const trendItems = trendData.results || []
        setHero(trendItems.slice(0, 5).map(i => ({
          ...i,
          media_type: i.media_type || (i.title ? 'movie' : 'tv'),
        })))
        setTrending(trendItems.slice(0, 20))
        setPopular(popData.results || [])
        setTopRated(topData.results || [])
        setNowPlaying(nowData.results || [])
        setSeries(seriesData.results || [])
      } catch (err) {
        console.error('HomePage load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero */}
      <HeroBanner items={hero} />

      {/* Content */}
      <div className="relative -mt-4 pb-16">
        <MovieSlider
          title="Trending"
          items={trending}
          loading={loading}
          viewAllLink="/movies"
        />
        <MovieSlider
          title="Now Playing"
          items={nowPlaying}
          loading={loading}
          viewAllLink="/movies"
        />
        <MovieSlider
          title="Popular Movies"
          items={popular.map(i => ({ ...i, media_type: 'movie' }))}
          loading={loading}
          viewAllLink="/movies"
        />
        <MovieSlider
          title="Top Rated"
          items={topRated.map(i => ({ ...i, media_type: 'movie' }))}
          loading={loading}
          viewAllLink="/movies"
        />
        <MovieSlider
          title="Popular Series"
          items={series.map(i => ({ ...i, media_type: 'tv' }))}
          loading={loading}
          viewAllLink="/series"
        />

        {/* Continue watching */}
        {history.length > 0 && (
          <MovieSlider
            title="Continue Watching"
            items={history.map(h => ({
              id: h.id,
              poster_path: h.poster,
              title: h.media_type === 'movie' ? h.title : undefined,
              name: h.media_type !== 'movie' ? h.title : undefined,
              media_type: h.media_type,
            }))}
          />
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <MovieSlider
            title="My List"
            items={favorites}
            viewAllLink="/favorites"
          />
        )}
      </div>
    </div>
  )
}
