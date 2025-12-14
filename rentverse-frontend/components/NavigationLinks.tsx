import Link from 'next/link'
import { Terminal, Activity, Shield, BarChart3 } from 'lucide-react'

export function AdminNavigationLinks() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center space-x-6">
        <Link
          href="/admin"
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Admin Dashboard</span>
        </Link>
        <Link
          href="/admin/enhanced-dashboard"
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>Enhanced Dashboard</span>
        </Link>
        <Link
          href="/terminal-demo"
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Terminal className="w-4 h-4" />
          <span>Terminal Demo</span>
        </Link>
        <Link
          href="/admin/security"
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Shield className="w-4 h-4" />
          <span>Security Center</span>
        </Link>
      </div>
    </div>
  )
}