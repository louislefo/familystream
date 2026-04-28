import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-8 border-t border-white/5 flex flex-col items-center justify-center gap-2 bg-[#050505]">
      <p className="text-[#64748b] text-sm font-medium flex items-center gap-1.5">
        made by <span className="text-white">el grande lolote</span>
        <Heart size={14} className="text-[#e11d48] fill-[#e11d48]" />
      </p>
    </footer>
  )
}
