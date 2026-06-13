'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Sparkles,
  Image,
  Settings,
  ChevronDown,
  Menu,
  X,
  Zap,
  LogOut,
  FileText,
  Bell,
  Wrench,
  Star,
  Monitor,
  Target,
  BarChart3,
  UserCog,
} from 'lucide-react'

type NavItem = {
  label: string
  href?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children?: NavItem[]
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content Management',
    items: [
      { label: 'Home Page', href: '/admin/home', icon: Home },
      { label: 'Services', href: '/admin/services', icon: Wrench },
      { label: 'Why Us', href: '/admin/why-us', icon: Target },
      { label: 'Performance', href: '/admin/performance', icon: BarChart3 },
      { label: 'Insights', href: '/admin/insights', icon: FileText },
    ],
  },
  {
    label: 'Lead Management',
    items: [
      { label: 'Contact Leads', href: '/admin/leads', icon: MessageSquare },
      { label: "Let's Talk Leads", href: '/admin/leads?source=lets-talk', icon: Sparkles },
    ],
  },
  {
    label: 'Careers',
    items: [
      { label: 'Jobs', href: '/admin/careers', icon: Briefcase },
      { label: 'Applications', href: '/admin/careers?tab=applications', icon: Users },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Media Library', href: '/admin/media', icon: Image },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Contact Information', href: '/admin/settings?tab=contact', icon: Settings },
      { label: 'Social Links', href: '/admin/settings?tab=social', icon: Settings },
      { label: 'SEO Settings', href: '/admin/settings?tab=seo', icon: Settings },
      { label: 'Logo & Favicon', href: '/admin/settings?tab=logo', icon: Image },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'User Management', href: '/admin/settings?tab=users', icon: UserCog },
      { label: 'Demo Content', href: '/admin/demo', icon: Zap },
    ],
  },
]

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href.split('?')[0])
  }

  const pageTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/leads')) return 'Leads'
    if (pathname.startsWith('/admin/careers')) return 'Careers'
    if (pathname.startsWith('/admin/services')) return 'Services'
    if (pathname.startsWith('/admin/media')) return 'Media Library'
    if (pathname.startsWith('/admin/settings')) return 'Settings'
    if (pathname.startsWith('/admin/home')) return 'Home Manager'
    if (pathname.startsWith('/admin/why-us')) return 'Why Us'
    if (pathname.startsWith('/admin/performance')) return 'Performance'
    return 'Admin'
  }

  const roleColor = (role?: string) => {
    if (role === 'SUPER_ADMIN') return '#EA580C'
    if (role === 'CONTENT_EDITOR') return '#06B6D4'
    if (role === 'HR_MANAGER') return '#7C3AED'
    return 'var(--color-text-secondary)'
  }

  const roleLabel = (role?: string) => {
    if (role === 'SUPER_ADMIN') return 'Super Admin'
    if (role === 'CONTENT_EDITOR') return 'Content Editor'
    if (role === 'HR_MANAGER') return 'HR Manager'
    return role || 'Admin'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Sidebar Overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              zIndex: 40, display: 'block',
            }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Brand */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #2A2A2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(234,88,12,0.4)',
              padding: '4px'
            }}>
              <img src="/images/p-logo.png" alt="P" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.2 }}>
                Promotency
              </div>
              <div style={{ fontSize: 11, color: '#EA580C', fontWeight: 600, letterSpacing: '0.08em' }}>
                ADMIN PANEL
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#4B5563',
                padding: '0 8px', marginBottom: 6,
              }}>
                {section.label}
              </div>
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href || '#'}
                  className={`admin-nav-link${isActive(item.href || '') ? ' active' : ''}`}
                  style={{ marginBottom: 2 }}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div style={{ padding: '16px 16px', borderTop: '1px solid #2A2A2A' }}>
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2A2A',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #EA580C, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {user.name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.name || 'Admin'}
                </div>
                <div style={{ fontSize: 11, color: roleColor(user.role), fontWeight: 600 }}>
                  {roleLabel(user.role)}
                </div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--color-text-secondary)', transform: userMenuOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  style={{
                    position: 'absolute', bottom: '100%', left: 0, right: 0,
                    marginBottom: 8, background: 'var(--color-bg-card)', border: '1px solid #2A2A2A',
                    borderRadius: 10, overflow: 'hidden', zIndex: 100,
                  }}
                >
                  <Link
                    href="/admin/settings?tab=users"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', color: '#D1D5DB', fontSize: 13, textDecoration: 'none' }}
                    className="hover:bg-[#2A2A2A]"
                  >
                    <UserCog size={14} />
                    Account Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      color: '#EF4444', fontSize: 13, background: 'none',
                      border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    }}
                    className="hover:bg-[#2A2A2A]"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header Bar */}
        <header style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px',
          background: 'var(--color-bg-secondary)', borderBottom: '1px solid #2A2A2A',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4,
              }}
            >
              <Menu size={22} />
            </button>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
              {pageTitle()}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/"
              target="_blank"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.2)',
                color: '#EA580C', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <Monitor size={14} />
              <span className="hidden sm:inline">View Site</span>
            </Link>
            <button style={{
              position: 'relative', background: 'none', border: 'none',
              color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 6,
            }}>
              <Bell size={18} />
            </button>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #EA580C, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {user.name?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24, overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
