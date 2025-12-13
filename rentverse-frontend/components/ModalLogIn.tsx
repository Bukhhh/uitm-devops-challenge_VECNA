'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import React, { ChangeEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import BoxError from '@/components/BoxError'
import InputEmail from '@/components/InputEmail'
import InputPassword from '@/components/InputPassword'
import ButtonFilled from '@/components/ButtonFilled'
import useAuthStore from '@/stores/authStore'

interface ModalLogInProps {
  isModal?: boolean
}

function ModalLogIn({ isModal = true }: ModalLogInProps) {
  const {
    email,
    password,
    otp,
    requireOTP,
    isLoading,
    error,
    setEmail,
    setPassword,
    setOtp,
    isLoginFormValid,
    submitLogIn,
    submitOtpVerification,
    resetForm,
  } = useAuthStore()
  const router = useRouter()

  // ============================================
  // Event Handlers
  // ============================================

  const handleBackButton = () => {
    if (requireOTP) {
      // Back from OTP step - go back to password step
      useAuthStore.setState({ requireOTP: false, otp: '' })
    } else {
      // Back from login step - go back to previous page
      router.back()
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitLogIn()
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitOtpVerification()
  }

  const handleBackToEmail = () => {
    useAuthStore.setState({ requireOTP: false, otp: '' })
  }

  // ============================================
  // Render: Step 1 - Email & Password
  // ============================================
  const renderLoginStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-6">
      {/* Email Section */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-3">
          Email Address
        </label>
        <InputEmail
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
        />
      </div>

      {/* Password Section */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-3">
          Password
        </label>
        <InputPassword
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Password"
          required
          showStrengthIndicator={false}
        />
      </div>

      {/* Submit Button */}
      <ButtonFilled
        type="submit"
        disabled={!isLoginFormValid() || isLoading}
      >
        {isLoading ? 'Verifying...' : 'Log in'}
      </ButtonFilled>

      <div className="text-center">
        <Link href={'/'} className={'underline text-slate-700 text-sm hover:text-slate-900 transition-colors'}>
          Forgot password?
        </Link>
      </div>
    </form>
  )

  // ============================================
  // Render: Step 2 - OTP Verification
  // ============================================
  const renderOTPStep = () => (
    <form onSubmit={handleOTPSubmit} className="space-y-6">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          We've sent a 6-digit code to<br />
          <span className="font-semibold">{email}</span>
        </p>
      </div>

      {/* OTP Section */}
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-slate-900 mb-3">
          Verification Code
        </label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            // Only allow numbers, max 6 digits
            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
            setOtp(value)
          }}
          placeholder="000000"
          maxLength={6}
          inputMode="numeric"
          required
          className="w-full px-4 py-2 text-lg tracking-widest text-center font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-500 mt-2">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      {/* Submit Button */}
      <ButtonFilled
        type="submit"
        disabled={otp.length !== 6 || isLoading}
      >
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </ButtonFilled>

      {/* Back Button */}
      <button
        type="button"
        onClick={handleBackToEmail}
        className="w-full text-center text-slate-700 text-sm hover:text-slate-900 transition-colors underline"
      >
        Use a different email
      </button>
    </form>
  )

  // ============================================
  // Container Content
  // ============================================
  const containerContent = (
    <div className={clsx([
      isModal ? 'shadow-xl' : 'border border-slate-400',
      'bg-white rounded-3xl max-w-md w-full p-8',
    ])}>
      {/* Header */}
      <div className="text-center mb-6 relative">
        {requireOTP && (
          <ArrowLeft
            onClick={handleBackButton}
            size={20}
            className="absolute left-0 top-1 text-slate-800 cursor-pointer hover:text-slate-600"
          />
        )}
        {!requireOTP && (
          <ArrowLeft
            onClick={handleBackButton}
            size={20}
            className="absolute left-0 top-1 text-slate-800 cursor-pointer hover:text-slate-600"
          />
        )}
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {requireOTP ? 'Verify Code' : 'Log in'}
        </h2>
        <div className="w-full h-px bg-slate-200 mt-4"></div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {/* Alert box - show error if any */}
        {error && (
          <div className="mb-6">
            <BoxError
              errorTitle={requireOTP ? 'Verification Failed' : "Let's try that again"}
              errorDescription={error}
            />
          </div>
        )}

        {/* Render appropriate step */}
        {requireOTP ? renderOTPStep() : renderLoginStep()}
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        {containerContent}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      {containerContent}
    </div>
  )
}

export default ModalLogIn
