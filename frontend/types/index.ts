// Core application types
export interface User {
  id: number
  email: string
  username: string
  avatar?: string
  interests: string[]
  streakCount: number
  totalFacts: number
  isPremium: boolean
  lastActivityDate?: string
  createdAt: string
}

export interface Discovery {
  id: number
  userId: number
  imageData: string
  fact: string
  category: string
  createdAt: string
}

export interface ShareStats {
  totalShares: number
  platforms: Record<string, number>
  recentShares: Array<{
    platform: string
    sharedAt: string
  }>
}

// API response types
export interface AnalyzeImageResponse {
  fact: string
  category: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

// Component prop types
export interface FactCardProps {
  discovery: Discovery
  onShare?: (discovery: Discovery) => void
  onLike?: (discovery: Discovery) => void
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, username?: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  isLoading: boolean
}

// Utility types
export type Category = 'science' | 'history' | 'nature' | 'technology' | 'culture' | 'food' | 'art' | 'general'

export type FilterType = 'all' | Category

export type SortType = 'newest' | 'oldest' | 'category'
