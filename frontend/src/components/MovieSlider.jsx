import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import MovieCard from './MovieCard'

export default function MovieSlider({ title, items = [], loading = false, viewAllLink }) {
  const ref = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const scroll = (dir) => {
    if (!ref.current) return
    const amount = ref.current.clientWidth * 0.7
    ref.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  const onScroll = () => {
    if (!ref.current) return
    const { scrollLeft, scrollWidth, clientWidth } = ref.current
    setCanLeft(scrollLeft > 10)
    setCanRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  if (!loading && items.length === 0) return null

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-[#6366f1] text-sm font-medium hover:text-[#818cf8] transition-colors cursor-pointer ml-2"
            >
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
        {/* Scroll arrows */}
        <div className="hidden md:flex gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
              canLeft
                ? 'text-white bg-white/10 hover:bg-white/20'
                : 'text-[#333] bg-white/5 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
              canRight
                ? 'text-white bg-white/10 hover:bg-white/20'
                : 'text-[#333] bg-white/5 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Left fade */}
        {canLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={ref}
          onScroll={onScroll}
          className="flex gap-3 overflow-x-auto no-scrollbar px-6 md:px-12 pb-2"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-40 shrink-0">
                  <div className="skeleton aspect-[2/3] rounded-xl" />
                </div>
              ))
            : items.map(item => (
                <MovieCard key={item.id} item={item} size="md" />
              ))
          }
        </div>

        {/* Right fade */}
        {canRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </section>
  )
}
