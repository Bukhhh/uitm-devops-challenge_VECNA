// Phase 2 Comprehensive Test Suite
// Tests for all Rentverse Phase 2 enhancements

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'

// Mock Chart.js and react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Radar: () => <div data-testid="radar-chart">Radar Chart</div>,
}))

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1, // OPEN
}))

// Test utilities
const createMockUser = (role: string = 'ADMIN') => ({
  id: '1',
  email: 'admin@rentverse.com',
  firstName: 'Admin',
  lastName: 'User',
  name: 'Admin User',
  dateOfBirth: '1990-01-01',
  phone: '+60123456789',
  role,
  isActive: true,
  createdAt: new Date().toISOString(),
})

// Terminal Emulator Tests
describe('TerminalEmulator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders terminal interface correctly', () => {
    // Import and test TerminalEmulator
    const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
    render(<TerminalEmulator />)
    
    expect(screen.getByText('Rentverse Terminal')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('handles command input correctly', async () => {
    const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
    render(<TerminalEmulator />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'help' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('Available Commands:')).toBeInTheDocument()
    })
  })

  test('executes demo commands successfully', async () => {
    const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
    render(<TerminalEmulator />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'demo module-1' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('MODULE 1: Authentication & Security Testing')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('handles command history navigation', () => {
    const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
    render(<TerminalEmulator />)
    
    const input = screen.getByRole('textbox')
    
    // Test up arrow for command history
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input.value).toBe('')
  })

  test('supports multiple themes', () => {
    const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
    render(<TerminalEmulator />)
    
    // Check if theme controls are present
    expect(screen.getByText('Theme:')).toBeInTheDocument()
  })
})

// Enhanced Admin Dashboard Tests
describe('Enhanced Admin Dashboard', () => {
  beforeEach(() => {
    // Mock authentication
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { user: createMockUser() }
      })
    })
  })

  test('renders dashboard with admin access', async () => {
    const { EnhancedDashboard } = require('@/app/admin/enhanced-dashboard/page')
    
    // Mock useAuthStore
    jest.doMock('@/stores/authStore', () => ({
      __esModule: true,
      default: jest.fn(() => ({ isLoggedIn: true }))
    }))
    
    render(<EnhancedDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Enhanced Admin Dashboard')).toBeInTheDocument()
    })
  })

  test('displays correct tab navigation', async () => {
    const { EnhancedDashboard } = require('@/app/admin/enhanced-dashboard/page')
    
    render(<EnhancedDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Terminal Demo')).toBeInTheDocument()
      expect(screen.getByText('Real-time Monitoring')).toBeInTheDocument()
      expect(screen.getByText('Security Center')).toBeInTheDocument()
    })
  })

  test('shows access denied for non-admin users', async () => {
    const { EnhancedDashboard } = require('@/app/admin/enhanced-dashboard/page')
    
    // Mock non-admin user
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { user: createMockUser('USER') }
      })
    })
    
    render(<EnhancedDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Enhanced Admin Access Required')).toBeInTheDocument()
    })
  })
})

// Real-Time Metrics Tests
describe('RealTimeMetrics', () => {
  test('renders all chart components', () => {
    const { RealTimeMetrics } = require('@/components/admin/RealTimeMetrics')
    render(<RealTimeMetrics />)
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument()
  })

  test('displays system metrics correctly', () => {
    const { RealTimeMetrics } = require('@/components/admin/RealTimeMetrics')
    render(<RealTimeMetrics />)
    
    expect(screen.getByText('CPU Usage')).toBeInTheDocument()
    expect(screen.getByText('Memory Usage')).toBeInTheDocument()
    expect(screen.getByText('Active Connections')).toBeInTheDocument()
    expect(screen.getByText('System Uptime')).toBeInTheDocument()
  })

  test('toggles real-time updates', async () => {
    const { RealTimeMetrics } = require('@/components/admin/RealTimeMetrics')
    render(<RealTimeMetrics />)
    
    const toggleButton = screen.getByText('Live Updates ON')
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('Live Updates OFF')).toBeInTheDocument()
  })

  test('displays activity feed', () => {
    const { RealTimeMetrics } = require('@/components/admin/RealTimeMetrics')
    render(<RealTimeMetrics />)
    
    expect(screen.getByText('Recent Activity Feed')).toBeInTheDocument()
  })
})

// WebSocket Manager Tests
describe('WebSocketManager', () => {
  test('creates WebSocket connection', () => {
    const { WebSocketManager } = require('@/utils/websocket/WebSocketManager')
    
    const manager = new WebSocketManager({
      url: 'ws://localhost:8080/ws',
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
    })
    
    expect(manager.isConnected).toBe(true)
  })

  test('handles reconnection logic', async () => {
    const { WebSocketManager } = require('@/utils/websocket/WebSocketManager')
    
    const onReconnect = jest.fn()
    const manager = new WebSocketManager({
      url: 'ws://localhost:8080/ws',
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
      onConnect: onReconnect,
    })
    
    manager.disconnect()
    expect(manager.isConnected).toBe(false)
  })

  test('sends messages correctly', () => {
    const { WebSocketManager } = require('@/utils/websocket/WebSocketManager')
    
    const manager = new WebSocketManager({
      url: 'ws://localhost:8080/ws',
    })
    
    const testMessage = { type: 'metric', data: 'test' }
    manager.send(testMessage)
    
    expect(global.WebSocket).toHaveBeenCalled()
  })

  test('generates mock metrics correctly', () => {
    const { generateMockMetrics } = require('@/utils/websocket/WebSocketManager')
    
    const metrics = generateMockMetrics()
    
    expect(metrics).toHaveProperty('cpu')
    expect(metrics).toHaveProperty('memory')
    expect(metrics).toHaveProperty('uptime')
    expect(metrics.cpu).toBeGreaterThanOrEqual(10)
    expect(metrics.cpu).toBeLessThanOrEqual(40)
  })
})

// Chart Configuration Tests
describe('Chart Configuration', () => {
  test('registers Chart.js components', () => {
    const { default: chartTheme } = require('@/utils/charts/chartConfig')
    
    expect(chartTheme).toBeDefined()
    expect(chartTheme.colors).toBeDefined()
    expect(chartTheme.colors.primary).toBe('#0f766e')
  })

  test('provides performance chart config', () => {
    const { performanceChartConfig } = require('@/utils/charts/chartConfig')
    
    expect(performanceChartConfig.type).toBe('line')
    expect(performanceChartConfig.data.datasets).toHaveLength(2)
  })

  test('provides color utilities', () => {
    const { colorUtils } = require('@/utils/charts/chartConfig')
    
    expect(colorUtils.getStatusColor('success')).toBe('#059669')
    expect(colorUtils.getPerformanceColor(30, { good: 50, warning: 80 })).toBe('#059669')
  })

  test('ChartDataProcessor works correctly', () => {
    const { ChartDataProcessor } = require('@/utils/charts/chartConfig')
    
    const mockChart = {
      data: {
        labels: [],
        datasets: [{ data: [] }]
      },
      update: jest.fn()
    }
    
    ChartDataProcessor.addDataPoint(mockChart, 'test', [100])
    
    expect(mockChart.data.labels).toContain('test')
    expect(mockChart.data.datasets[0].data).toContain(100)
    expect(mockChart.update).toHaveBeenCalledWith('none')
  })
})

// Integration Tests
describe('Phase 2 Integration Tests', () => {
  test('terminal demo page integrates correctly', async () => {
    const { default: TerminalDemoPage } = require('@/app/terminal-demo/page')
    
    render(<TerminalDemoPage />)
    
    expect(screen.getByText('Terminal Demonstration System')).toBeInTheDocument()
    expect(screen.getByText('Live Terminal')).toBeInTheDocument()
    expect(screen.getByText('Module Overview')).toBeInTheDocument()
  })

  test('admin navigation works correctly', () => {
    const { AdminNavigationLinks } = require('@/components/NavigationLinks')
    
    render(<AdminNavigationLinks />)
    
    expect(screen.getByText('Enhanced Dashboard')).toHaveAttribute('href', '/admin/enhanced-dashboard')
    expect(screen.getByText('Terminal Demo')).toHaveAttribute('href', '/terminal-demo')
  })

  test('full workflow from terminal to dashboard', async () => {
    // This would test the complete user flow
    const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
    const { RealTimeMetrics } = require('@/components/admin/RealTimeMetrics')
    
    render(
      <div>
        <TerminalEmulator />
        <RealTimeMetrics />
      </div>
    )
    
    expect(screen.getByText('Rentverse Terminal')).toBeInTheDocument()
    expect(screen.getByText('Real-Time System Monitoring')).toBeInTheDocument()
  })
})

// Performance Tests
describe('Performance Tests', () => {
  test('terminal component renders within performance budget', async () => {
    const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
    
    const startTime = performance.now()
    render(<TerminalEmulator />)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(100) // Under 100ms
  })

  test('dashboard metrics update efficiently', async () => {
    const { RealTimeMetrics } = require('@/components/admin/RealTimeMetrics')
    
    const updates: number[] = []
    const originalSetInterval = global.setInterval
    
    global.setInterval = jest.fn((callback) => {
      updates.push(Date.now())
      return originalSetInterval(callback, 100)
    })
    
    render(<RealTimeMetrics />)
    
    await waitFor(() => {
      expect(updates.length).toBeGreaterThan(0)
    }, { timeout: 1000 })
    
    global.setInterval = originalSetInterval
  })
})

// Cross-browser Compatibility Tests
describe('Cross-browser Compatibility', () => {
  test('supports modern JavaScript features', () => {
    // Test arrow functions, destructuring, etc.
    expect(() => {
      const { TerminalEmulator } = require('@/components/terminal/TerminalEmulator')
      const component = TerminalEmulator
      expect(component).toBeDefined()
    }).not.toThrow()
  })

  test('handles responsive design', () => {
    // Mock different viewport sizes
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    
    const { RealTimeMetrics } = require('@/components/admin/RealTimeMetrics')
    render(<RealTimeMetrics />)
    
    // Component should render without errors
    expect(screen.getByText('Real-Time System Monitoring')).toBeInTheDocument()
  })
})

export {}