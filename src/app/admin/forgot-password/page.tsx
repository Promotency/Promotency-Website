'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, KeyRound, Lock, CheckCircle2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ForgotPassword() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Recovery Key, 2: New Password, 3: Success
  const [recoveryKey, setRecoveryKey] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryKey) {
      setError('Please enter your recovery key')
      return
    }
    setError('')
    // Proceed to password step
    setStep(2)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryKey, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setStep(3) // Success
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-orange-500/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 p-2">
            <img src="/images/p-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Password Recovery
          </h1>
          <p className="text-gray-400">
            {step === 1 && 'Enter your Secret Recovery Key to proceed'}
            {step === 2 && 'Set a new password for the Super Admin'}
            {step === 3 && 'Password successfully updated'}
          </p>
        </div>

        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleVerifyKey} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recovery Key</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Enter recovery key"
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                  />
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Verify Key
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-300">
                Your password has been successfully updated. You can now use your new password to sign in.
              </p>
              <Link
                href="/admin/login"
                className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Return to Login
              </Link>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
              <Link
                href="/admin/login"
                className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
