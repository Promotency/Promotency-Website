'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Briefcase, FileText, TrendingUp, Users, ArrowRight, Settings } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalLeads: number
  letsTalkLeads: number
  totalJobs: number
  totalApplications: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API route. 
    // We'll simulate fetching for now since we just need the UI structure.
    setTimeout(() => {
      setStats({
        totalLeads: 124,
        letsTalkLeads: 45,
        totalJobs: 4,
        totalApplications: 28,
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const statCards = [
    { label: 'Total Leads', value: stats?.totalLeads, icon: MessageSquare, color: '#EA580C', link: '/admin/leads' },
    { label: "Let's Talk Consultations", value: stats?.letsTalkLeads, icon: TrendingUp, color: '#06B6D4', link: '/admin/leads?source=lets-talk' },
    { label: 'Open Job Positions', value: stats?.totalJobs, icon: Briefcase, color: '#7C3AED', link: '/admin/careers' },
    { label: 'Job Applications', value: stats?.totalApplications, icon: Users, color: '#22C55E', link: '/admin/careers?tab=applications' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Dashboard Overview
        </h1>
        <p className="text-gray-400">Welcome to the Promotency Operating System.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <card.icon className="w-16 h-16" style={{ color: card.color }} />
            </div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            
            <div className="relative z-10">
              {isLoading ? (
                <div className="w-16 h-8 bg-[#2A2A2A] animate-pulse rounded mb-1" />
              ) : (
                <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {card.value}
                </p>
              )}
              <p className="text-sm text-gray-400 font-medium">{card.label}</p>
            </div>

            <Link href={card.link} className="absolute inset-0 z-20">
              <span className="sr-only">View {card.label}</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/services" className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">Edit Services</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
            </Link>
            <Link href="/admin/settings" className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] transition-colors group">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">Update Global Settings</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
            </Link>
            <Link href="/admin/careers" className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] transition-colors group">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">Post New Job</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Recent Leads Preview */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-orange-500 hover:text-orange-400 font-medium">
              View All
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <MessageSquare className="w-12 h-12 text-[#2A2A2A] mb-4" />
            <p className="text-gray-400 text-sm">Leads database connected. View the Leads tab for details.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
