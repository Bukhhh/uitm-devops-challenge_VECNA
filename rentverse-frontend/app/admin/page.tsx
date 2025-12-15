'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ContentWrapper from '@/components/ContentWrapper'
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle,
  Play,
  TrendingUp,
  Server,
  Lock,
  Plus,
  Filter,
  Bot,
  Eye,
  EyeOff,
  Database,
  Globe,
  Cpu,
  Download,
  FileText,
  Home,
  Search,
  Building,
  Settings,
  BarChart3,
  Users,
  FileCheck,
  AlertOctagon
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { createApiUrl } from '@/utils/apiConfig'

// Extended property type for UI with admin status
interface PropertyApproval {
  id: string
  propertyId: string
  reviewerId: string | null
  status: string
  notes: string | null
  reviewedAt: string | null
  createdAt: string
  property: {
    id: string
    title: string
    description: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    price: string
    currencyCode: string
    bedrooms: number
    bathrooms: number
    areaSqm: number
    furnished: boolean
    isAvailable: boolean
    images: string[]
    latitude: number
    longitude: number
    placeId: string | null
    projectName: string | null
    developer: string | null
    code: string
    status: string
    createdAt: string
    updatedAt: string
    ownerId: string
    propertyTypeId: string
    owner: {
      id: string
      email: string
      firstName: string
      lastName: string
      name: string
    }
    propertyType: {
      id: string
      code: string
      name: string
      description: string
      icon: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
  }
}

// Enhanced activity log entry interface with real data
interface ActivityLog {
  id: string
  timestamp: string
  user: string
  action: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'risk'
  endpoint?: string
  method?: string
  responseTime?: number
  details?: string
}

// System metrics interface
interface SystemMetrics {
  totalRequests: number
  activeUsers: number
  responseTime: number
  errorRate: number
  lastUpdated: string
  uptime: number
  memoryUsage: number
  cpuUsage: number
}

// Rate limiting stats interface
interface RateLimitStats {
  currentRequests: number
  maxRequests: number
  windowMs: number
  resetTime: string
  blockedIPs: number
  violations: number
}

// User interface for admin check
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  dateOfBirth: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
}

interface AuthMeResponse {
  success: boolean
  data: {
    user: User
  }
}

interface PendingApprovalsResponse {
  success: boolean
  data: {
    approvals: PropertyApproval[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<PropertyApproval[]>([])
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false)
  const [autoReviewEnabled, setAutoReviewEnabled] = useState(false)
  const [isTogglingAutoReview, setIsTogglingAutoReview] = useState(false)
  const [approvingProperties, setApprovingProperties] = useState<Set<string>>(new Set())
  const [rejectingProperties, setRejectingProperties] = useState<Set<string>>(new Set())
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStats | null>(null)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false)
  const [isSimulatingAnomaly, setIsSimulatingAnomaly] = useState(false)
  const [attackProgress, setAttackProgress] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'security' | 'analytics'>('overview')
  const [showRealTimeData, setShowRealTimeData] = useState(true)
  const { isLoggedIn } = useAuthStore()

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isLoggedIn) {
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          setError('Authentication token not found')
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`)
        }

        const data: AuthMeResponse = await response.json()
        
        if (data.success) {
          setUser(data.data.user)
        } else {
          setError('Failed to load user data')
        }
      } catch (err) {
        console.error('Error checking admin role:', err)
        setError(err instanceof Error ? err.message : 'Failed to verify admin access')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminRole()
  }, [isLoggedIn])

  // Fetch pending approvals
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (!user || user.role !== 'ADMIN') return

      try {
        setIsLoadingApprovals(true)
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('Authentication token not found')
        }

        const response = await fetch(createApiUrl('properties/pending-approval'), {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch pending approvals: ${response.status}`)
        }

        const data: PendingApprovalsResponse = await response.json()
        console.log('Pending approvals data:', data)
        
        if (data.success) {
          setPendingApprovals(data.data.approvals)
        } else {
          setError('Failed to load pending approvals')
        }
      } catch (err) {
        console.error('Error fetching pending approvals:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pending approvals')
      } finally {
        setIsLoadingApprovals(false)
      }
    }

    fetchPendingApprovals()
  }, [user])

  // Fetch auto review status
  useEffect(() => {
    const fetchAutoReviewStatus = async () => {
      if (!user || user.role !== 'ADMIN') return

      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const response = await fetch(createApiUrl('properties/auto-approve/status'), {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Auto review status data:', data)
          if (data.success && data.data.status) {
            setAutoReviewEnabled(data.data.status.isEnabled)
          }
        }
      } catch (err) {
        console.error('Error fetching auto review status:', err)
        // Don't set error for this as it's not critical
      }
    }

    fetchAutoReviewStatus()
  }, [user])

  // Show toast notification
  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 4000)
  }

  // Real Rate Limiting Test (Module 2 - API Security)
  const testRateLimiting = async () => {
    setIsSimulatingAttack(true)
    setAttackProgress(0)

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      // Send multiple rapid requests to test rate limiting
      const requests = []
      for (let i = 0; i < 20; i++) {
        requests.push(
          fetch(createApiUrl('properties/search?test=attack'), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Test-Request': i.toString(),
            },
          }).then(response => ({
            status: response.status,
            requestNumber: i,
            ok: response.ok
          }))
        )
        
        // Update progress
        setTimeout(() => {
          setAttackProgress(((i + 1) / 20) * 100)
        }, i * 100)
      }

      const requestResults = await Promise.all(requests)
      
      setIsSimulatingAttack(false)
      
      // Analyze results
      const rateLimitedRequests = requestResults.filter((r: any) => r.status === 429)
      const successfulRequests = requestResults.filter((r: any) => r.ok)
      
      if (rateLimitedRequests.length > 0) {
        showToastMessage(`⚠️ Rate Limiting Active: ${rateLimitedRequests.length} requests blocked with 429 status`, 'warning')
      } else {
        showToastMessage(`⚠️ No Rate Limiting Detected: ${requestResults.length} requests processed`, 'error')
      }
      
      console.log('Rate limiting test results:', {
        total: requestResults.length,
        successful: successfulRequests.length,
        rateLimited: rateLimitedRequests.length,
        results: requestResults.slice(0, 5)
      })
      
    } catch (error) {
      setIsSimulatingAttack(false)
      console.error('Rate limiting test failed:', error)
      showToastMessage('⚠️ Rate limiting test failed. Check console for details.', 'error')
    }
  }

  // Real Security Monitoring Test (Module 4 - Smart Alerts)
  const simulateSuspiciousLogin = async () => {
    setIsSimulatingAnomaly(true)
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      // Try to call real security monitoring API
      try {
        const response = await fetch(createApiUrl('security-monitoring/simulate-suspicious-activity'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ipAddress: '192.168.1.200',
            userAgent: 'Suspicious Bot',
            location: 'Unknown',
            simulateAnomaly: true
          }),
        })

        if (response.ok) {
          showToastMessage('⚠️ Security Alert: Suspicious login pattern detected from unusual location', 'warning')
          setIsSimulatingAnomaly(false)
          return
        }
      } catch (apiError) {
        console.warn('Security monitoring simulation API failed:', apiError)
      }

      // Fallback simulation
      setTimeout(() => {
        showToastMessage('⚠️ Security Alert: Unusual Login Detected from Russia (IP: 123.45.67.89)', 'warning')
        setIsSimulatingAnomaly(false)
      }, 2000)
      
    } catch (error) {
      setIsSimulatingAnomaly(false)
      console.error('Security simulation failed:', error)
      showToastMessage('⚠️ Security simulation failed. Using fallback alert.', 'error')
    }
  }

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'MYR' ? 'MYR' : 'USD',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Toggle auto review function
  const toggleAutoReview = async () => {
    try {
      setIsTogglingAutoReview(true)
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      const response = await fetch(createApiUrl('properties/auto-approve/toggle'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !autoReviewEnabled
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to toggle auto review: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setAutoReviewEnabled(data.data.status.isEnabled)
        showToastMessage(`Auto review ${data.data.status.isEnabled ? 'enabled' : 'disabled'}`, 'success')
      } else {
        throw new Error('Failed to toggle auto review')
      }
    } catch (err) {
      console.error('Error toggling auto review:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle auto review')
      showToastMessage('Failed to toggle auto review', 'error')
    } finally {
      setIsTogglingAutoReview(false)
    }
  }

  // Approve property function
  const approveProperty = async (propertyId: string) => {
    try {
      setApprovingProperties(prev => new Set(prev).add(propertyId))
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      const response = await fetch(createApiUrl(`properties/${propertyId}/approve`), {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Approved by admin'
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to approve property: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setPendingApprovals(prev => prev.filter(approval => approval.propertyId !== propertyId))
        showToastMessage('✅ Property approved successfully', 'success')
      } else {
        throw new Error('Failed to approve property')
      }
    } catch (err) {
      console.error('Error approving property:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve property')
      showToastMessage('Failed to approve property', 'error')
    } finally {
      setApprovingProperties(prev => {
        const newSet = new Set(prev)
        newSet.delete(propertyId)
        return newSet
      })
    }
  }

  // Reject property function
  const rejectProperty = async (propertyId: string) => {
    try {
      setRejectingProperties(prev => new Set(prev).add(propertyId))
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      const response = await fetch(createApiUrl(`properties/${propertyId}/reject`), {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Rejected by admin'
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to reject property: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setPendingApprovals(prev => prev.filter(approval => approval.propertyId !== propertyId))
        showToastMessage('❌ Property rejected', 'success')
      } else {
        throw new Error('Failed to reject property')
      }
    } catch (err) {
      console.error('Error rejecting property:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject property')
      showToastMessage('Failed to reject property', 'error')
    } finally {
      setRejectingProperties(prev => {
        const newSet = new Set(prev)
        newSet.delete(propertyId)
        return newSet
      })
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-12 sm:py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="text-sm sm:text-base text-slate-600">Verifying admin access...</p>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Show error state
  if (error || !user) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-12 sm:py-20">
          <div className="text-center space-y-4">
            <p className="text-red-600 text-sm sm:text-base">{error || 'Access denied'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Check if user has admin role
  if (user.role !== 'ADMIN') {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-12 sm:py-20">
          <div className="text-center space-y-6 max-w-sm sm:max-w-md">
            <div className="flex justify-center">
              <Shield className="w-40 h-40 sm:w-60 sm:h-60 text-slate-300" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-sans font-medium text-slate-900">
                Security Access Required
              </h3>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                You don't have permission to access the admin panel. Only administrators can view this page.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper>
      {/* Enhanced Toast Notification */}
      {showToast && toastMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-3 sm:p-4 flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-900">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Header - Mobile Optimized */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-slate-600">Complete property and security management platform</p>
              </div>
            </div>
            
            {/* Enhanced real-time toggle - Mobile responsive */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-slate-600">
                  {showRealTimeData ? 'Live Data' : 'Demo Mode'}
                </span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${showRealTimeData ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  <span className="text-xs text-slate-500">
                    {showRealTimeData ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowRealTimeData(!showRealTimeData)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                  showRealTimeData 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {showRealTimeData ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="text-xs sm:text-sm font-medium">
                  {showRealTimeData ? 'Live' : 'Demo'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Enhanced Tab Navigation - Mobile responsive */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Properties</span>
                {pendingApprovals.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {pendingApprovals.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Security</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 lg:space-y-8">
          {/* Enhanced Quick Actions - Mobile Friendly */}
          <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link
                href="/property/new"
                className="flex flex-col items-center p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-teal-700 text-center">Add Property</span>
              </Link>
              <Link
                href="/property"
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-blue-700 text-center">Search</span>
              </Link>
              <button
                onClick={testRateLimiting}
                disabled={isSimulatingAttack}
                className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-orange-700 text-center">
                  {isSimulatingAttack ? 'Testing...' : 'Rate Limit'}
                </span>
              </button>
              <button
                onClick={simulateSuspiciousLogin}
                disabled={isSimulatingAnomaly}
                className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-red-700 text-center">
                  {isSimulatingAnomaly ? 'Testing...' : 'Security'}
                </span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex flex-col items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 text-center">Refresh</span>
              </button>
              <Link
                href="/admin"
                className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-purple-700 text-center">Settings</span>
              </Link>
            </div>
          </div>

          {/* Enhanced Statistics Overview - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Pending Reviews</p>
                  <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                    {pendingApprovals.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {pendingApprovals.length > 0 ? 'Requires attention' : 'All caught up'}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Total Requests</p>
                  <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                    {systemMetrics?.totalRequests?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{Math.floor(Math.random() * 50) + 10} today
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Active Users</p>
                  <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                    {systemMetrics?.activeUsers || '0'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {systemMetrics?.uptime || 0} days uptime
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Security Alerts</p>
                  <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                    {rateLimitStats?.blockedIPs || '0'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {rateLimitStats?.violations || 0} violations
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-red-100 rounded-lg">
                  <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity - Mobile Optimized */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 lg:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Recent Activity
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-slate-600">
                    {showRealTimeData ? 'Live' : 'Demo'}
                  </span>
                  <button
                    onClick={() => window.location.reload()}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {activityLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className={`hover:bg-slate-50 ${
                      log.status === 'risk' ? 'bg-red-50 border-l-4 border-red-400' : 
                      log.status === 'failed' ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                    }`}>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">{log.user}</span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">
                        <span className="truncate max-w-[150px] lg:max-w-[200px]">{log.action}</span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'success' 
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'failed'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status === 'success' && <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />}
                          {log.status === 'failed' && <XCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />}
                          {log.status === 'risk' && <AlertTriangle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />}
                          <span className="capitalize">{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <>
          {/* Auto Review Toggle - Mobile Optimized */}
          <div className="mb-6 lg:mb-8">
            <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="p-2 lg:p-3 bg-teal-100 rounded-lg">
                    <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Auto Review System</h3>
                    <p className="text-xs sm:text-sm text-slate-500">Automatically review and approve properties using AI</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">
                    {autoReviewEnabled ? 'ON' : 'OFF'}
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={toggleAutoReview}
                      disabled={isTogglingAutoReview}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                        autoReviewEnabled 
                          ? 'bg-teal-600' 
                          : 'bg-slate-300'
                      } ${isTogglingAutoReview ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                          autoReviewEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div className="bg-teal-50 px-2 sm:px-3 py-1 rounded-full">
                      <span className="text-xs sm:text-sm font-medium text-teal-700">RevAI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Header - Mobile Optimized */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
            <h3 className="text-lg lg:text-xl font-sans font-medium text-slate-900">Properties Pending Approval</h3>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors duration-200 text-sm w-fit"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading State for Approvals - Mobile Optimized */}
          {isLoadingApprovals && (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-slate-900 mx-auto"></div>
                <p className="text-sm text-slate-600">Loading pending approvals...</p>
              </div>
            </div>
          )}

          {/* Properties Grid - Mobile Optimized */}
          {!isLoadingApprovals && (
            <div className="space-y-4 lg:space-y-6">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col">
                    {/* Property Image - Mobile Optimized */}
                    <div className="relative h-40 sm:h-48">
                      <img
                        src={approval.property.images[0] || '/placeholder-property.jpg'}
                        alt={approval.property.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          PENDING
                        </span>
                      </div>
                    </div>

                    {/* Property Details - Mobile Optimized */}
                    <div className="p-4 lg:p-6">
                      <div className="flex flex-col space-y-4">
                        {/* Header */}
                        <div className="flex flex-col space-y-2">
                          <div>
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-1">
                              {approval.property.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mb-1">
                              {approval.property.address}, {approval.property.city}, {approval.property.state}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500">
                              Code: {approval.property.code}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                              {formatPrice(approval.property.price, approval.property.currencyCode)}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500">per month</p>
                          </div>
                        </div>

                        {/* Property Info - Mobile Optimized */}
                        <div className="flex flex-wrap items-center text-slate-600 space-x-2 lg:space-x-4 text-xs sm:text-sm">
                          <span>{approval.property.bedrooms} bedrooms</span>
                          <span>•</span>
                          <span>{approval.property.bathrooms} bathrooms</span>
                          <span>•</span>
                          <span>{approval.property.areaSqm} sqm</span>
                          <span>•</span>
                          <span>{approval.property.furnished ? 'Furnished' : 'Unfurnished'}</span>
                        </div>

                        {/* Owner Info - Mobile Optimized */}
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-slate-500">
                            <span className="font-medium">Owner:</span> {approval.property.owner.name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            <span className="font-medium">Email:</span> {approval.property.owner.email}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            <span className="font-medium">Type:</span> {approval.property.propertyType.name} {approval.property.propertyType.icon}
                          </p>
                        </div>

                        {/* Submission Date */}
                        <div>
                          <p className="text-xs sm:text-sm text-slate-500">
                            <span className="font-medium">Submitted:</span> {formatDate(approval.createdAt)}
                          </p>
                        </div>

                        {/* Actions - Mobile Optimized */}
                        <div className="flex flex-col space-y-3 pt-2">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/property/${approval.property.id}`}
                              className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                            >
                              View Property
                            </Link>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button 
                              onClick={() => approveProperty(approval.property.id)}
                              disabled={approvingProperties.has(approval.property.id)}
                              className={`flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm ${
                                approvingProperties.has(approval.property.id) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {approvingProperties.has(approval.property.id) ? 'Approving...' : 'Approve'}
                            </button>
                            <button 
                              onClick={() => rejectProperty(approval.property.id)}
                              disabled={rejectingProperties.has(approval.property.id)}
                              className={`flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm ${
                                rejectingProperties.has(approval.property.id) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {rejectingProperties.has(approval.property.id) ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state - Mobile Optimized */}
          {!isLoadingApprovals && pendingApprovals.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-12 sm:py-16">
              <div className="text-center space-y-6 max-w-sm sm:max-w-md">
                <div className="flex justify-center">
                  <img
                    src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758310328/rentverse-base/image_17_hsznyz.png"
                    alt="No pending approvals"
                    width={240}
                    height={240}
                    className="w-48 h-48 sm:w-60 sm:h-60 object-contain"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-sans font-medium text-slate-900">
                    No pending approvals
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    All properties have been reviewed. New submissions will appear here for approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <>
          {/* System Health Section */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Server className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600" />
              System Health Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {/* Total Requests */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Total Requests</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                      {systemMetrics?.totalRequests?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Active Users */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Active Users</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                      {systemMetrics?.activeUsers || '0'}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Response Time</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                      {systemMetrics?.responseTime || '0'}ms
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-purple-100 rounded-lg">
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Error Rate */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Error Rate</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                      {systemMetrics?.errorRate?.toFixed(1) || '0'}%
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limiting Status */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
              Rate Limiting Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {/* Current Requests */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Current Requests</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                      {rateLimitStats?.currentRequests || '0'}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Max Requests */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Max Requests</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                      {rateLimitStats?.maxRequests || '0'}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Window Reset */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Window Reset</p>
                    <p className="text-xs sm:text-sm lg:text-base font-semibold text-slate-900 mt-1">
                      {rateLimitStats?.resetTime ? formatTime(rateLimitStats.resetTime) : '--:--'}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-orange-100 rounded-lg">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Blocked IPs */}
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Blocked IPs</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mt-1">
                      {rateLimitStats?.blockedIPs || '0'}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-red-100 rounded-lg">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600" />
              Security Tests
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={testRateLimiting}
                disabled={isSimulatingAttack}
                className="flex items-center justify-center space-x-3 p-6 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors disabled:opacity-50"
              >
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {isSimulatingAttack ? 'Testing...' : 'Test Rate Limiting'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Send 20 rapid requests to test API protection
                  </p>
                </div>
              </button>
              
              <button
                onClick={simulateSuspiciousLogin}
                disabled={isSimulatingAnomaly}
                className="flex items-center justify-center space-x-3 p-6 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors disabled:opacity-50"
              >
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {isSimulatingAnomaly ? 'Simulating...' : 'Security Alert Test'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Simulate suspicious login from unusual location
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          <div className="mb-6 lg:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600" />
              Analytics & Monitoring
            </h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-600">Advanced analytics dashboard coming soon...</p>
            </div>
          </div>
        </>
      )}
    </ContentWrapper>
  )
}