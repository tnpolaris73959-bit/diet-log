// ============================================
// 食事ログ — Service Worker（最小構成）
// ============================================
// PWAとしてホーム画面に追加するために必要。
// オフライン対応は v2 以降で検討。

var CACHE_NAME = 'diet-log-v1';

// インストール時：最低限のファイルをキャッシュ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        './index.html',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ：ネットワーク優先、失敗時キャッシュ
self.addEventListener('fetch', function(event) {
  // GAS API へのリクエストはキャッシュしない
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request).then(function(response) {
      // 成功したらキャッシュを更新
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
