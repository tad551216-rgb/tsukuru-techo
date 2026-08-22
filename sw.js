/* ===========================================================
   つくる手帖 ポータル — サービスワーカー

   もともとここには「後片づけ専用」のワーカーが置かれていました。
   自分自身を unregister するだけで fetch を受け取らないため、
   ブラウザから見ると「サービスワーカーの無いサイト」でした。
   PWAとしてインストールできなかったのはこれが理由です。

   このファイルは、その後片づけの働きを引き継いだうえで、
   インストール要件を満たす本来のワーカーにしたものです。

   【設計上ゆずれない点】
   ・控え(Cache Storage)はオリジン単位で共有されます。
     tad551216-rgb.github.io はどのリポジトリでも同じオリジンなので、
     消してよいのは自分の名前空間(TT_NS)のものだけです。
   ・かつて「控えがあれば控えを返す」作りだったせいで、
     更新しても古いページが出続けました。ここでは通信を先に試し、
     つながらないときだけ控えを返します。
   =========================================================== */

const TT_NS  = 'tt:tsukuru-techo:';
const CACHE  = TT_NS + 'v1';
const SCOPE  = '/tsukuru-techo/';
const ASSETS = [
  './', './index.html', './manifest.json',
  './icons/icon-192.png', './icons/icon-180.png', './icons/favicon.ico'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .catch(() => {})            /* 1つ失敗しても導入は止めない */
      .then(() => self.skipWaiting())
  );
});

/* 昔のワーカーが残した控えか？ 中身がすべて /tsukuru-techo/ のものなら自分のもの。
   ひとつでも別の場所のものが混ざっていれば、他アプリの控えとみなして手を出さない。 */
async function isLegacyMine(name){
  if(name.startsWith(TT_NS)) return false;
  try{
    const c = await caches.open(name);
    const reqs = await c.keys();
    if(!reqs.length) return false;
    return reqs.every(r => {
      try{ return new URL(r.url).pathname.indexOf(SCOPE) === 0; }
      catch(err){ return false; }
    });
  }catch(err){ return false; }
}

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try{
      const keys = await caches.keys();
      for(const k of keys){
        if(k.startsWith(TT_NS)){
          if(k !== CACHE) await caches.delete(k);        /* 自分の古い版 */
        }else if(await isLegacyMine(k)){
          await caches.delete(k);                        /* 昔のワーカーの置き土産 */
        }
      }
    }catch(err){}
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
