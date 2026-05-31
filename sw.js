/* Tend service worker — receives push notifications and makes the app installable.
   Lives at the site root next to index.html. Do not edit unless you know why. */

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

// A push arrived from the send-reminders Edge Function.
self.addEventListener('push', function(event){
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e){ data = { title:'Tend', body: (event.data && event.data.text()) || '' }; }
  var title = data.title || 'Tend';
  var options = {
    body: data.body || '',
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='44' fill='%236B7F5A'/%3E%3Cpath d='M96 152s-48-30-62-60A30 30 0 0 1 96 48a30 30 0 0 1 62 44c-14 30-62 60-62 60Z' fill='%23F7F2E7'/%3E%3C/svg%3E",
    badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%236B7F5A'/%3E%3C/svg%3E",
    data: { url: data.url || './' },
    tag: data.tag || 'tend-reminder'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Tapping the notification focuses an open Tend tab, or opens one.
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(list){
      for (var i=0;i<list.length;i++){ if ('focus' in list[i]) return list[i].focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
