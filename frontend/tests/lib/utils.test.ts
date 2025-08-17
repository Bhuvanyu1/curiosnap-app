import { describe, it, expect, vi } from 'vitest'
import { 
  compressImage, 
  debounce, 
  formatDate, 
  withRetry, 
  storage,
  AppError 
} from '../../lib/utils'

describe('utils', () => {
  describe('formatDate', () => {
    it('returns "Today" for current date', () => {
      const today = new Date()
      expect(formatDate(today)).toBe('Today')
    })

    it('returns "Yesterday" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatDate(yesterday)).toBe('Yesterday')
    })

    it('returns days ago for recent dates', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      expect(formatDate(threeDaysAgo)).toBe('3 days ago')
    })

    it('returns formatted date for older dates', () => {
      const oldDate = new Date('2023-01-15')
      const result = formatDate(oldDate)
      expect(result).toMatch(/Jan 15/)
    })
  })

  describe('debounce', () => {
    it('delays function execution', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      expect(fn).not.toHaveBeenCalled()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledOnce()
    })

    it('cancels previous calls', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledOnce()
    })
  })

  describe('withRetry', () => {
    it('succeeds on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await withRetry(fn)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledOnce()
    })

    it('retries on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const result = await withRetry(fn, 2, 10)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('throws after max retries', async () => {
      const error = new Error('persistent failure')
      const fn = vi.fn().mockRejectedValue(error)
      
      await expect(withRetry(fn, 2, 10)).rejects.toThrow('persistent failure')
      expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
    })
  })

  describe('storage', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('stores and retrieves data', () => {
      const data = { test: 'value' }
      storage.set('test-key', data)
      
      expect(storage.get('test-key')).toEqual(data)
    })

    it('returns default value for missing key', () => {
      expect(storage.get('missing-key', 'default')).toBe('default')
    })

    it('handles invalid JSON gracefully', () => {
      localStorage.setItem('invalid-json', 'not json')
      expect(storage.get('invalid-json', 'fallback')).toBe('fallback')
    })

    it('removes data', () => {
      storage.set('test-key', 'value')
      storage.remove('test-key')
      
      expect(storage.get('test-key')).toBeNull()
    })
  })

  describe('AppError', () => {
    it('creates error with message and code', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400)
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('AppError')
    })
  })
})
