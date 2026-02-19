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
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hors ligne - Devis App</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#111827;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .wrap{text-align:center;max-width:340px}
    .icon{width:72px;height:72px;background:rgba(249,115,22,.15);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
    h1{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:white;margin-bottom:12px}
    p{font-size:15px;color:rgba(255,255,255,.5);line-height:1.6;margin-bottom:28px}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;background:#F97316;color:white;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;text-decoration:none;border:none;cursor:pointer}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2">
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
    </div>
    <h1>Pas de connexion</h1>
    <p>Vous êtes hors ligne. Reconnectez-vous pour accéder à vos données.</p>
    <button class="btn" onclick="location.reload()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      Réessayer
    </button>
  </div>
</body>
</html>`
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
