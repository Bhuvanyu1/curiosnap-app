// Service Worker for offline functionality
export class CacheManager {
  private static instance: CacheManager
  private cacheName = 'curiosnap-v1'
  private apiCacheName = 'curiosnap-api-v1'

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  async cacheDiscoveries(discoveries: any[]): Promise<void> {
    try {
      const cache = await caches.open(this.apiCacheName)
      await cache.put('/cached-discoveries', new Response(JSON.stringify(discoveries)))
    } catch (error) {
      console.error('Failed to cache discoveries:', error)
    }
  }

  async getCachedDiscoveries(): Promise<any[] | null> {
    try {
      const cache = await caches.open(this.apiCacheName)
      const response = await cache.match('/cached-discoveries')
      if (response) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get cached discoveries:', error)
    }
    return null
  }

  async cacheImage(imageData: string, fact: string): Promise<void> {
    try {
      const cache = await caches.open(this.apiCacheName)
      const cacheKey = `/cached-image-${Date.now()}`
      await cache.put(cacheKey, new Response(JSON.stringify({ imageData, fact })))
    } catch (error) {
      console.error('Failed to cache image:', error)
    }
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine
  }
}

// Offline queue for API requests
export class OfflineQueue {
  private static instance: OfflineQueue
  private queue: Array<{ url: string; options: RequestInit; timestamp: number }> = []
  private storageKey = 'curiosnap-offline-queue'

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue()
    }
    return OfflineQueue.instance
  }

  constructor() {
    this.loadQueue()
    this.setupOnlineListener()
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.processQueue()
    })
  }

  addToQueue(url: string, options: RequestInit): void {
    this.queue.push({
      url,
      options,
      timestamp: Date.now()
    })
    this.saveQueue()
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine || this.queue.length === 0) return

    const queueCopy = [...this.queue]
    this.queue = []
    this.saveQueue()

    for (const item of queueCopy) {
      try {
        await fetch(item.url, item.options)
        console.log('Processed offline request:', item.url)
      } catch (error) {
        console.error('Failed to process offline request:', error)
        // Re-add to queue if it fails
        this.queue.push(item)
      }
    }

    if (this.queue.length > 0) {
      this.saveQueue()
    }
  }

  getQueueSize(): number {
    return this.queue.length
  }
}
