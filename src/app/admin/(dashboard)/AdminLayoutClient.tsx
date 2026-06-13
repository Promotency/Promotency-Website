'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Briefcase, MessageSquare, Image as ImageIcon, Settings, LogOut, BarChart3, Home, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navGroups = [
  {
    title: 'Menu',
    links: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Home Manager', href: '/admin/home', icon: Home },
      { label: 'Performance', href: '/admin/performance', icon: BarChart3 },
      { label: 'Insights', href: '/admin/insights', icon: FileText },
      { label: 'Leads', href: '/admin/leads', icon: MessageSquare },
      { label: 'Services', href: '/admin/services', icon: FileText },
      { label: 'Careers', href: '/admin/careers', icon: Briefcase },
      { label: 'Media', href: '/admin/media', icon: ImageIcon },
    ],
  },
  {
    title: 'Settings',
    links: [
      { label: 'Global Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

export default function AdminLayoutClient({ children, session }: { children: React.ReactNode, session: any }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white">
      {/* Mobile Header Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-[#2A2A2A] z-40 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center p-1">
            <img src="/images/p-logo.png" alt="P" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Promotency</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
          <Menu className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-64 bg-[#111111] border-r border-[#2A2A2A] flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center p-1">
                <img src="/images/p-logo.png" alt="P" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Promotency</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-6 flex-1 overflow-y-auto pr-2">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? 'bg-orange-500/10 text-orange-500 border-l-2 border-orange-500' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                        }`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold shrink-0">
                {session?.user?.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <Link href="/api/auth/signout" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen p-4 pt-24 lg:p-8 lg:pt-8 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
