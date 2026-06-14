/* sw.js — jot service worker (Web Push + notification handling).
   This MUST stay a separate file at the site root (it is registered by URL),
   so it is NOT inlined into index.html. Keep it deployed alongside index.html. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// A push arrived from the server → show a notification.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: (event.data && event.data.text()) || '' }; }

  const title = data.title || 'jot';
  const options = {
    body: data.body || '',
    icon: data.icon || 'icon-192.png',
    badge: 'icon-192.png',
    tag: data.tag || 'jot-reminder',
    renotify: true,
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Tapping the notification → focus an open jot tab, or open one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
