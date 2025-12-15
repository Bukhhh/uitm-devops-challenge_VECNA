'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PropertyIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to demo property
    router.push('/property/451a6abe-0c4f-427a-a211-4b960512cbdc')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading property details...</p>
      </div>
    </div>
  )
}
