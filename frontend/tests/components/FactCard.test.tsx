import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FactCard } from '../../components/FactCard'
import type { Discovery } from '../../types'

const mockDiscovery: Discovery = {
  id: 1,
  userId: 1,
  imageData: 'base64imagedata',
  fact: 'Did you know that octopuses have three hearts?',
  category: 'science',
  createdAt: '2024-01-01T00:00:00Z'
}

describe('FactCard', () => {
  it('renders discovery fact and category', () => {
    render(<FactCard discovery={mockDiscovery} />)
    
    expect(screen.getByText(mockDiscovery.fact)).toBeInTheDocument()
    expect(screen.getByText('science')).toBeInTheDocument()
  })

  it('displays the discovery image', () => {
    render(<FactCard discovery={mockDiscovery} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', `data:image/jpeg;base64,${mockDiscovery.imageData}`)
  })

  it('calls onShare when share button is clicked', () => {
    const onShare = vi.fn()
    render(<FactCard discovery={mockDiscovery} onShare={onShare} />)
    
    const shareButton = screen.getByLabelText(/share/i)
    fireEvent.click(shareButton)
    
    expect(onShare).toHaveBeenCalledWith(mockDiscovery)
  })

  it('calls onLike when like button is clicked', () => {
    const onLike = vi.fn()
    render(<FactCard discovery={mockDiscovery} onLike={onLike} />)
    
    const likeButton = screen.getByLabelText(/like/i)
    fireEvent.click(likeButton)
    
    expect(onLike).toHaveBeenCalledWith(mockDiscovery)
  })

  it('copies fact to clipboard when copy button is clicked', async () => {
    // Mock clipboard API
    const writeText = vi.fn()
    Object.assign(navigator, {
      clipboard: { writeText }
    })

    render(<FactCard discovery={mockDiscovery} />)
    
    const copyButton = screen.getByLabelText(/copy/i)
    fireEvent.click(copyButton)
    
    expect(writeText).toHaveBeenCalledWith(mockDiscovery.fact)
  })

  it('shows formatted date', () => {
    render(<FactCard discovery={mockDiscovery} />)
    
    // Should show some form of date (exact format depends on implementation)
    expect(screen.getByText(/2024|Jan|ago/)).toBeInTheDocument()
  })
})
