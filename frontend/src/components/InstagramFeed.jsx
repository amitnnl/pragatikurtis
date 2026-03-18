import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'
import { BRAND_CONFIG } from '../config/branding'
import { useRef, useEffect, useState } from 'react'

const instaPosts = [
  "https://placehold.co/400x400/1e3a8a/white?text=Royal+Blue",
  "https://placehold.co/400x400/db2777/white?text=Festive+Pink",
  "https://placehold.co/400x400/black/white?text=Elegant+Black",
  "https://placehold.co/400x400/orange/white?text=Summer+Vibe",
  "https://placehold.co/400x400/cyan/white?text=Casual+Chic",
  "https://placehold.co/400x400/yellow/white?text=Haldi+Look",
  "https://placehold.co/400x400/green/white?text=Mehendi+Green",
  "https://placehold.co/400x400/purple/white?text=Sangeet+Night"
]

export default function InstagramFeed() {
  const handle = BRAND_CONFIG.social.instagram.split('/').pop()

  return (
    <section className="container mx-auto px-4 py-20 border-t border-gray-100 overflow-hidden">
      <div className="text-center mb-12">
        <Instagram className="w-8 h-8 mx-auto mb-4 text-indigo-600" />
        <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">@{handle}</h3>
        <p className="text-gray-500 text-sm mt-2">Follow us for style inspiration & updates</p>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {instaPosts.map((src, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05 }}
            className="min-w-[200px] md:min-w-[250px] aspect-square overflow-hidden relative group rounded-xl flex-shrink-0 snap-center"
          >
            <img 
              src={src} 
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Instagram className="text-white w-8 h-8" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}