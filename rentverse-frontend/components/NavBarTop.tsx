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
// FIX: Import the new Store
import useAuthStore from '@/stores/authStore'
import { usePropertyListingStore } from '@/stores/propertyListingStore'

import type { SearchBoxType } from '@/types/searchbox'

interface NavBarTopProps {
  searchBoxType?: SearchBoxType
  isQuestionnaire?: boolean
}

function NavBarTop({ searchBoxType = 'none', isQuestionnaire = false }: Readonly<NavBarTopProps>): React.ReactNode {
  // FIX: Use the store state instead of the old hook
  const { user, isLoggedIn } = useAuthStore()
  
  // Hydration fix to prevent server/client mismatch
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const { clearTemporaryData, isDirty } = usePropertyListingStore()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  const handleExit = () => {
    if (isDirty) {
      const confirmExit = window.confirm(
        'You have unsaved changes. Are you sure you want to exit? This will delete all your progress.'
      )
      if (confirmExit) {
        clearTemporaryData()
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  return (
    <div className={clsx([
      'w-full fixed z-50',
      'px-6 py-4 bg-white top-0 list-none border-b border-slate-200',
    ])}>
      <div className={clsx([
        'w-full flex items-center justify-between relative',
        searchBoxType === 'full' && 'mb-8',
      ])}>
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
            <li>
              <TextAction href={'/property/new'} text={'List your property'} />
            </li>
            <li>
              <LanguageSelector />
            </li>
            <li className="relative">
              {/* FIX: Check isMounted AND isLoggedIn */}
              {isMounted && isLoggedIn && user ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Hi, {user.firstName || 'User'}
                    </span>
                    <Avatar 
                      user={user} 
                      onClick={toggleDropdown}
                      className="cursor-pointer border-2 border-blue-500 rounded-full hover:opacity-80 transition"
                    />
                  </div>
                  <UserDropdown 
                    isOpen={isDropdownOpen} 
                    onClose={closeDropdown}
                  />
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