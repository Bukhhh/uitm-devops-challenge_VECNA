'use client'

import clsx from 'clsx'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import TextAction from '@/components/TextAction'
import SignUpButton from '@/components/SignUpButton'
import Avatar from '@/components/Avatar'
import UserDropdown from '@/components/UserDropdown'
import LanguageSelector from '@/components/LanguageSelector'
import SearchBoxProperty from '@/components/SearchBoxProperty'
import SearchBoxPropertyMini from '@/components/SearchBoxPropertyMini'
import ButtonSecondary from '@/components/ButtonSecondary'
import useAuthStore from '@/stores/authStore'
import { usePropertyListingStore } from '@/stores/propertyListingStore'
import type { SearchBoxType } from '@/types/searchbox'

interface NavBarTopProps {
  searchBoxType?: SearchBoxType
  isQuestionnaire?: boolean
}

function NavBarTop({ searchBoxType = 'none', isQuestionnaire = false }: Readonly<NavBarTopProps>): React.ReactNode {
  // 1. DIRECT STORE ACCESS
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  
  // 2. HYDRATION HANDLING
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
    // Debug: Check if store has data immediately on mount
    console.log("NavBar Mounted. LoggedIn:", useAuthStore.getState().isLoggedIn);
  }, [])

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const { clearTemporaryData, isDirty } = usePropertyListingStore()

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const closeDropdown = () => setIsDropdownOpen(false)

  const handleExit = () => {
    if (isDirty) {
      if (window.confirm('Exit? Unsaved changes will be lost.')) {
        clearTemporaryData()
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  // 3. SIMPLE RENDER LOGIC
  // Only show profile if mounted AND logged in AND user data exists
  const showProfile = isMounted && isLoggedIn && user;

  return (
    <div className={clsx(['w-full fixed z-50', 'px-6 py-4 bg-white top-0 list-none border-b border-slate-200'])}>
      <div className={clsx(['w-full flex items-center justify-between relative', searchBoxType === 'full' && 'mb-8'])}>
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758183655/rentverse-base/logo-nav_j8pl7d.png"
            alt="Logo Rentverse"
            className="w-auto h-12"
            width={150}
            height={48} />
        </Link>

        {(searchBoxType === 'compact' && !isQuestionnaire) &&
          <SearchBoxPropertyMini className="hidden lg:block absolute ml-[16%]" />}

        {!isQuestionnaire && (
          <nav className="hidden md:flex items-center space-x-8">
            <li><TextAction href={'/property/new'} text={'List your property'} /></li>
            <li><LanguageSelector /></li>
            <li className="relative">
              {/* 4. CONDITIONAL RENDERING */}
              {showProfile ? (
                <>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={toggleDropdown}>
                    <Avatar 
                      user={user} 
                      onClick={() => {}} 
                      className="cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                       {user.firstName || 'User'}
                    </span>
                  </div>
                  <UserDropdown isOpen={isDropdownOpen} onClose={closeDropdown} />
                </>
              ) : (
                <SignUpButton />
              )}
            </li>
          </nav>)}
        {isQuestionnaire && <ButtonSecondary label="Exit" onClick={handleExit} />}
      </div>
      {(searchBoxType === 'full' && !isQuestionnaire) && <SearchBoxProperty className="hidden lg:block" />}
    </div>
  )
}

export default NavBarTop