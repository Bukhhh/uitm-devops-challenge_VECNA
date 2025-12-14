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
  Lock
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'

// Activity log entry interface
interface ActivityLog {
  id: string
  timestamp: string
  user: string
  action: string
  ipAddress: string
  status: 'success' | 'failed' | 'risk'
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

export default function SecurityDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false)
  const [isSimulatingAnomaly, setIsSimulatingAnomaly] = useState(false)
  const [attackProgress, setAttackProgress] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const { isLoggedIn } = useAuthStore()

  // Mock activity data
  const mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      timestamp: '2025-12-14 16:45:30',
      user: 'admin@rentverse.com',
      action: 'Property Approved',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2025-12-14 16:42:15',
      user: 'user@example.com',
      action: 'Login Attempt',
      ipAddress: '203.45.67.89',
      status: 'failed'
    },
    {
      id: '3',
      timestamp: '2025-12-14 16:40:22',
      user: 'owner@rentverse.com',
      action: 'Property Upload',
      ipAddress: '192.168.1.105',
      status: 'success'
    },
    {
      id: '4',
      timestamp: '2025-12-14 16:38:45',
      user: 'unknown@suspicious.com',
      action: 'Multiple Failed Logins',
      ipAddress: '45.123.456.78',
      status: 'risk'
    },
    {
      id: '5',
      timestamp: '2025-12-14 16:35:12',
      user: 'tenant@rentverse.com',
      action: 'Property Search',
      ipAddress: '192.168.1.110',
      status: 'success'
    },
    {
      id: '6',
      timestamp: '2025-12-14 16:32:08',
      user: 'admin@rentverse.com',
      action: 'User Role Changed',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '7',
      timestamp: '2025-12-14 16:30:55',
      user: 'suspicious@attack.com',
      action: 'SQL Injection Attempt',
      ipAddress: '123.45.67.89',
      status: 'risk'
    },
    {
      id: '8',
      timestamp: '2025-12-14 16:28:33',
      user: 'tenant@rentverse.com',
      action: 'Profile Updated',
      ipAddress: '192.168.1.115',
      status: 'success'
    }
  ]

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
          setActivityLogs(mockActivityLogs)
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

  // Show toast notification
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 4000)
  }

  // Test Rate Limiting Function (Module 2 - API Security)
  const testRateLimiting = async () => {
    setIsSimulatingAttack(true)
    setAttackProgress(0)

    // Simulate rapid API calls
    for (let i = 1; i <= 20; i++) {
      setTimeout(() => {
        setAttackProgress((i / 20) * 100)
        
        if (i === 20) {
          setIsSimulatingAttack(false)
          showToastMessage('⚠️ Security Alert: Rate limit exceeded! Error 429: Too Many Requests')
        }
      }, i * 150)
    }
  }

  // Simulate Suspicious Login (Module 4 - Smart Alerts)
  const simulateSuspiciousLogin = async () => {
    setIsSimulatingAnomaly(true)
    
    // Simulate processing delay
    setTimeout(() => {
      setIsSimulatingAnomaly(false)
      showToastMessage('⚠️ Security Alert: Unusual Login Detected from Russia (IP: 123.45.67.89)')
    }, 2000)
  }

  // Show loading state
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="text-slate-600">Verifying admin access...</p>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Show error state
  if (error || !user) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error || 'Access denied'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
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
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <Shield className="w-60 h-60 text-slate-300" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-sans font-medium text-slate-900">
                Security Access Required
              </h3>
              <p className="text-base text-slate-500 leading-relaxed">
                You don't have permission to access the security dashboard. Only administrators can view this page.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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
      {/* Toast Notification */}
      {showToast && toastMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{toastMessage}</p>
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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-slate-900">Security Demonstration Dashboard</h1>
        </div>
        <p className="text-slate-600">Real-time security monitoring and threat simulation platform</p>
      </div>

      {/* System Health Section (Module 1 & 6) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2 text-teal-600" />
          System Health Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Auth Type */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current Auth Type</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-lg font-semibold text-green-600">MFA Verified</p>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Session Security */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Session Security</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-lg font-semibold text-green-600">JWT Valid / Encrypted</p>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Security Scan */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Latest Security Scan</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-lg font-semibold text-green-600">Passed</p>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attack Simulator (Module 2 - API Security) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-600" />
            Attack Simulator - Rate Limiting Test
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Test API rate limiting by firing 20 rapid requests to detect potential abuse.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={testRateLimiting}
              disabled={isSimulatingAttack}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                isSimulatingAttack
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{isSimulatingAttack ? 'Testing Rate Limits...' : 'Test Rate Limiting'}</span>
            </button>

            {/* Progress Bar */}
            {isSimulatingAttack && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-slate-600">{Math.round(attackProgress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      attackProgress < 80 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${attackProgress}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  {attackProgress < 80 
                    ? 'Requests processing normally...' 
                    : '⚠️ Rate limit exceeded! Error 429: Too Many Requests'
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Anomaly Simulation (Module 4 - Smart Alerts) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Anomaly Simulation - Suspicious Login
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Simulate unusual login behavior to test anomaly detection systems.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={simulateSuspiciousLogin}
              disabled={isSimulatingAnomaly}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                isSimulatingAnomaly
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{isSimulatingAnomaly ? 'Simulating...' : 'Simulate Suspicious Login'}</span>
            </button>

            {isSimulatingAnomaly && (
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing login patterns...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Feed (Module 5) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Live Activity Feed
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Live</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {activityLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-50 ${
                  log.status === 'risk' ? 'bg-red-50 border-l-4 border-red-400' : 
                  log.status === 'failed' ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-slate-400 mr-2" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-slate-400 mr-2" />
                      {log.user}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                      {log.ipAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'success' 
                        ? 'bg-green-100 text-green-800'
                        : log.status === 'failed'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {log.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                      {log.status === 'risk' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ContentWrapper>
  )
}