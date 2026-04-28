import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import { useFavoritesStore } from '../store'

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore()

  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-6 md:px-12 pb-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart size={22} className="text-[#e11d48] fill-[#e11d48]" />
            My List
          </h1>
          <p className="text-[#64748b] text-sm mt-1">
            {favorites.length} title{favorites.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-full bg-[#e11d48]/10 flex items-center justify-center">
              <Heart size={32} className="text-[#e11d48]" />
            </div>
            <h2 className="text-white font-semibold text-lg">No favorites yet</h2>
            <p className="text-[#64748b] text-sm text-center max-w-sm">
              Click the heart on a movie or series to add it to your list.
            </p>
            <Link
              to="/movies"
              className="px-6 py-3 bg-[#6366f1] text-white rounded-xl font-medium text-sm hover:bg-[#818cf8] transition-colors cursor-pointer"
            >
              Browse movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {favorites.map(item => (
              <MovieCard key={item.id} item={item} size="lg" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
