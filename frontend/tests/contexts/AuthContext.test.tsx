import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import type { User } from '../../types'

// Mock API
vi.mock('../../lib/api', () => ({
  apiClient: {
    login: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn()
  }
}))

const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => login('test@example.com', 'testuser')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('provides initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
  })

  it('handles login successfully', async () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      interests: [],
      streakCount: 0,
      totalFacts: 0,
      isPremium: false,
      createdAt: '2024-01-01T00:00:00Z'
    }

    const { apiClient } = await import('../../lib/api')
    vi.mocked(apiClient.login).mockResolvedValue({
      token: 'test-token',
      user: mockUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    fireEvent.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('handles logout', async () => {
    // Set initial user in localStorage
    localStorage.setItem('curiosnap_token', 'test-token')
    localStorage.setItem('curiosnap_user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    fireEvent.click(screen.getByText('Logout'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })
    
    expect(localStorage.getItem('curiosnap_token')).toBeNull()
    expect(localStorage.getItem('curiosnap_user')).toBeNull()
  })
})
