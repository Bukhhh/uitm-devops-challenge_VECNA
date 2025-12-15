'use client'

import SearchBoxProperty from '@/components/SearchBoxProperty'
import ContentWrapper from '@/components/ContentWrapper'
import CardProperty from '@/components/CardProperty'
import { useState, useEffect } from 'react'
import usePropertiesStore from '@/stores/propertiesStore'

function ListsPage() {
  const { properties, isLoading, loadProperties } = usePropertiesStore()
  const [showResults, setShowResults] = useState(false)

  // Load all properties initially
  useEffect(() => {
    loadProperties({ limit: 20, page: 1 })
  }, [loadProperties])

  return (
    <ContentWrapper searchBoxType="full">
      <div className="space-y-8">
        {/* Search Box is now in the header */}

        {/* Search Results Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-4">
              {showResults ? 'Search Results' : 'Browse All Properties'}
            </h2>
            <p className="text-base text-slate-600">
              {showResults ? 'Properties matching your search criteria' : 'Discover your perfect home from our extensive collection'}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          )}

          {/* Properties Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="group">
                  <CardProperty property={property} />
                </div>
              ))}
            </div>
          )}

          {/* No properties message */}
          {!isLoading && properties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600">No properties found</p>
              <p className="text-sm text-slate-500 mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  )
}

export default ListsPage
