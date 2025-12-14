'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ContentWrapper from '@/components/ContentWrapper'
import TerminalEmulator from '@/components/terminal/TerminalEmulator'
import RealTimeMetrics from '@/components/admin/RealTimeMetrics'
import useAuthStore from '@/stores/authStore'
import { 
  Terminal, 
  Activity, 
  Shield, 
  Users, 
  BarChart3,
  Settings,
  RefreshCw,
  Maximize2,
  Grid3X3,
  Zap,
  Database,
  Bell
} from 'lucide-react'

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

export default function EnhancedDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'terminal' | 'monitoring' | 'security'>('overview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
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

  // Generate mock notifications
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        title: 'System Alert',
        message: 'High CPU usage detected on server-01',
        type: 'warning',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        title: 'Security Scan Complete',
        message: 'Weekly security scan completed successfully',
        type: 'success',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        title: 'New User Registration',
        message: '15 new users registered in the last hour',
        type: 'info',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="text-slate-600">Loading enhanced dashboard...</p>
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
                Enhanced Admin Access Required
              </h3>
              <p className="text-base text-slate-500 leading-relaxed">
                You don't have permission to access the enhanced admin dashboard. Only administrators can view this page.
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

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <ContentWrapper>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Enhanced Admin Dashboard</h1>
            <p className="text-slate-600">Comprehensive monitoring and control center</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
            
            {/* Refresh */}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            {/* Settings */}
            <Link
              href="/admin/settings"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">2,847</p>
              <p className="text-sm text-green-600">+12% this month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Properties</p>
              <p className="text-2xl font-bold text-gray-900">1,456</p>
              <p className="text-sm text-green-600">+8% this week</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-600">99.9%</p>
              <p className="text-sm text-gray-600">All systems operational</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-2xl font-bold text-green-600">95/100</p>
              <p className="text-sm text-gray-600">Excellent security</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'terminal'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Terminal className="w-4 h-4 inline mr-2" />
              Terminal Demo
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Real-time Monitoring
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Security Center
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-8 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
                <p className="text-teal-100">Your enhanced admin dashboard is ready for monitoring and control.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{new Date().toLocaleDateString()}</div>
                <div className="text-teal-100">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Terminal className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Terminal Demo</h3>
                  <p className="text-sm text-gray-600">Run module demonstrations</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('terminal')}
                className="mt-4 w-full text-center py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Launch Terminal
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Live Monitoring</h3>
                  <p className="text-sm text-gray-600">Real-time system metrics</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('monitoring')}
                className="mt-4 w-full text-center py-2 text-green-600 hover:text-green-700 font-medium"
              >
                View Monitoring
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Security Center</h3>
                  <p className="text-sm text-gray-600">Monitor security status</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('security')}
                className="mt-4 w-full text-center py-2 text-red-600 hover:text-red-700 font-medium"
              >
                Security Dashboard
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'terminal' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Module Demonstration Terminal</h2>
              <p className="text-gray-600">Interactive terminal showcasing all 6 Rentverse modules</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>
          </div>
          
          <TerminalEmulator />
          
          {/* Quick Commands */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Commands</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => {
                  // This would trigger the terminal command
                  console.log('Running demo all')
                }}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-left"
              >
                <div className="font-mono text-sm text-gray-900">demo all</div>
                <div className="text-xs text-gray-600">Run all modules</div>
              </button>
              <button 
                onClick={() => console.log('Running status')}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-left"
              >
                <div className="font-mono text-sm text-gray-900">status</div>
                <div className="text-xs text-gray-600">System status</div>
              </button>
              <button 
                onClick={() => console.log('Running monitor')}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-left"
              >
                <div className="font-mono text-sm text-gray-900">monitor</div>
                <div className="text-xs text-gray-600">Live monitoring</div>
              </button>
              <button 
                onClick={() => console.log('Running security')}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-left"
              >
                <div className="font-mono text-sm text-gray-900">security</div>
                <div className="text-xs text-gray-600">Security dashboard</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <RealTimeMetrics />
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Center</h2>
              <p className="text-gray-600 mb-6">
                Advanced security monitoring and threat detection dashboard
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Threat Detection</h3>
                  <p className="text-sm text-gray-600">AI-powered anomaly detection</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Access Control</h3>
                  <p className="text-sm text-gray-600">User permission management</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Audit Logging</h3>
                  <p className="text-sm text-gray-600">Comprehensive activity tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ContentWrapper>
  )
}