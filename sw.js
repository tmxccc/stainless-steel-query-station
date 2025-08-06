// Service Worker for Stainless Steel Query Station
const CACHE_NAME = 'stainless-steel-v1.3.0';
const STATIC_CACHE = 'static-v1.3.0';
const DYNAMIC_CACHE = 'dynamic-v1.3.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/index.html',
    '/src/js/search-enhancement.js',
    '/src/js/data-visualization.js',
    '/src/js/performance-optimization.js',
    '/src/js/analytics.js',
    '/src/js/favorites.js',
    '/src/js/mobile-optimization.js',

    '/src/js/data-enhancement.js',
    '/src/js/extended-data.js',
    '/src/js/intelligent-analysis.js',
    '/src/js/ui-enhancement.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
    console.log('Service Worker 安装中...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('缓存静态资源...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('静态资源缓存完成');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('缓存静态资源失败:', error);
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    console.log('Service Worker 激活中...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker 激活完成');
                return self.clients.claim();
            })
    );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 跳过非HTTP请求
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // 对于静态资源，优先使用缓存
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request));
    }
    // 对于API请求，优先使用网络
    else if (isApiRequest(request.url)) {
        event.respondWith(networkFirst(request));
    }
    // 对于其他请求，使用网络优先策略
    else {
        event.respondWith(networkFirst(request));
    }
});

// 缓存优先策略
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('缓存优先策略失败:', error);
        return new Response('离线模式下资源不可用', { status: 503 });
    }
}

// 网络优先策略
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('网络请求失败，尝试缓存:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 如果是HTML请求，返回离线页面
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
        }
        
        return new Response('网络错误，资源不可用', { status: 503 });
    }
}

// 判断是否为静态资源
function isStaticAsset(url) {
    return url.includes('.js') || 
           url.includes('.css') || 
           url.includes('.png') || 
           url.includes('.jpg') || 
           url.includes('.svg') || 
           url.includes('fonts.googleapis.com') ||
           url.includes('cdn.tailwindcss.com');
}

// 判断是否为API请求
function isApiRequest(url) {
    return url.includes('/api/') || url.includes('/data/');
}

// 消息处理
self.addEventListener('message', event => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_SIZE':
            getCacheSize().then(size => {
                event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
            });
            break;
            
        case 'CLEAR_CACHE':
            clearCache(payload.cacheName).then(() => {
                event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
            });
            break;
            
        case 'PREFETCH_RESOURCES':
            prefetchResources(payload.urls);
            break;
    }
});

// 获取缓存大小
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return Math.round(totalSize / 1024 / 1024 * 100) / 100; // MB
}

// 清理指定缓存
async function clearCache(cacheName) {
    if (cacheName) {
        return caches.delete(cacheName);
    } else {
        const cacheNames = await caches.keys();
        return Promise.all(cacheNames.map(name => caches.delete(name)));
    }
}

// 预取资源
async function prefetchResources(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
                console.log('预取资源成功:', url);
            }
        } catch (error) {
            console.error('预取资源失败:', url, error);
        }
    }
}

// 后台同步
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('执行后台同步...');
    // 这里可以添加后台同步逻辑，比如同步用户数据等
}

// 推送通知
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '新的不锈钢牌号数据已更新',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看更新',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: '关闭',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('不锈钢查询工作站', options)
    );
});

// 通知点击处理
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('Service Worker 已加载');