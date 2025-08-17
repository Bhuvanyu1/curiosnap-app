const CACHE_NAME = 'curiosnap-v1'
const API_CACHE_NAME = 'curiosnap-api-v1'
const STATIC_CACHE_NAME = 'curiosnap-static-v1'

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/discoveries',
  '/auth/profile'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_FILES)
      }),
      caches.open(API_CACHE_NAME)
    ])
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== API_CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME
          ) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/') || API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static files
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request))
  }
})

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for failed requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This request failed and no cached version is available'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME)
  
  try {
    // Try cache first for static files
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/offline.html')
    }
    
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processOfflineQueue())
  }
})

async function processOfflineQueue() {
  // Process any queued offline actions
  const cache = await caches.open(API_CACHE_NAME)
  const queuedRequests = await cache.match('/offline-queue')
  
  if (queuedRequests) {
    const queue = await queuedRequests.json()
    
    for (const item of queue) {
      try {
        await fetch(item.url, item.options)
      } catch (error) {
        console.error('Failed to sync offline request:', error)
      }
    }
    
    // Clear the queue
    await cache.delete('/offline-queue')
  }
}
