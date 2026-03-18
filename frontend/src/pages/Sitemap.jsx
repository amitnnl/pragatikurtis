import React from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { BRAND_CONFIG } from '../config/branding'

export default function Sitemap() {
  const sections = [
    {
      title: "Shop",
      links: [
        { name: "All Products", path: "/shop" },
        { name: "Kurtis", path: "/shop?category=Kurti" },
        { name: "Suit Sets", path: "/shop?category=Suit Set" },
        { name: "Gowns & Dresses", path: "/shop?category=Gown/Dresses" },
        { name: "New Arrivals", path: "/shop?sort=newest" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact" },
        { name: "Home", path: "/" },
      ]
    },
    {
      title: "Customer Service",
      links: [
        { name: "My Profile", path: "/profile" },
        { name: "Track Order", path: "/track-order/1" },
        { name: "Wishlist", path: "/wishlist" },
        { name: "Shopping Bag", path: "/checkout" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
      ]
    }
  ]

  return (
    <div className="bg-surface-100 min-h-screen py-20 px-6 md:px-12">
      <SEO title="Sitemap" description="Site Map for Pragati Kurties" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-4">Sitemap</h1>
          <p className="text-muted/70 font-sans">Overview of available pages on {BRAND_CONFIG.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {sections.map((section) => (
            <div key={section.title} className="bg-surface p-8 rounded-sm shadow-soft hover:shadow-card transition-all duration-300">
              <h2 className="text-xl font-serif text-text-700 mb-6 border-b border-surface-200 pb-2">{section.title}</h2>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-sm font-sans text-text-700 hover:text-accent transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-surface-200 rounded-full group-hover:bg-accent transition-colors"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
