// ── Devis App — Service Worker v1 ────────────────────────────────────────────
const CACHE_NAME = 'devis-app-v1'
const STATIC_CACHE = 'devis-app-static-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app/login.html',
  '/app/register.html',
  '/app/dashboard.html',
  '/app/quotes.html',
  '/app/view-quote.html',
  '/app/create-quote.html',
  '/app/edit-quote.html',
  '/app/clients.html',
  '/app/liste-clients.html',
  '/app/settings.html',
  '/app/forgot-password.html',
  '/app/shared.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// ── Installation ──────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn(`[SW] Skip: ${url}`, err))
        )
      )
    }).then(() => self.skipWaiting())
  )
})

// ── Activation — nettoyage anciens caches ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME && n !== STATIC_CACHE)
          .map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase.co')) return
  if (url.hostname.includes('esm.sh')) return
  if (url.hostname.includes('cdnjs.cloudflare.com')) return

  // Fonts — cache first
  if (url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Pages HTML — network first, fallback cache
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirst(request))
    return
  }

  // Assets statiques — cache first
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(networkFirst(request))
})

async function networkFirst(request) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.destination === 'document') return offlinePage()
    throw new Error('Offline')
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    throw new Error('Offline + not cached')
  }
}

function offlinePage() {
  const html = ` <!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#012B2A">
  <title>Afrivis — Hors ligne</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #012B2A;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .icon {
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.08);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 36px;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    p {
      color: #7aaee8;
      font-size: 0.95rem;
      line-height: 1.6;
      max-width: 300px;
      margin: 0 auto 2rem;
    }

    button {
      background: #1a5c58;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 0.85rem 2rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    button:hover { background: #226b66; }

    .cached-note {
      margin-top: 2rem;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>

  <div class="icon">📡</div>

  <h1>Vous êtes hors ligne</h1>
  <p>Vérifiez votre connexion internet et réessayez. Vos données locales restent disponibles.</p>

  <button onclick="location.reload()">
    Réessayer la connexion
  </button>

  <p class="cached-note">Afrivis — Les pages déjà visitées restent accessibles hors ligne</p>

</body>
</html>`
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
