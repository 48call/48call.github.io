self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("48call-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/app.js",
        "/manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// 接收推播
self.addEventListener("push", function(event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || "請記得今日打卡",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: data.url || "https://48call.github.io/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "48call 提醒", options)
  );
});

// 點擊通知
self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
