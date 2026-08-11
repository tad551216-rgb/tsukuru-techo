/* ===========================================================
   つくる手帖 — 後片づけ用のサービスワーカー
   -----------------------------------------------------------
   もともとここには、ピンボール用のサービスワーカーが置かれて
   いました。受け持ち範囲が /tsukuru-techo/ 配下すべてで、
   しかも「控えがあれば控えを返す」作りだったため、
   ページを更新しても端末には古いものが表示され続けていました。

   このファイルは、その後始末をするためだけのものです。

     1. /tsukuru-techo/ の控えだけを捨てる
     2. 自分自身の登録を取り消す
     3. 開いているページを読み込み直す

   fetch を受け取らないので、通信はふつうに素通りします。

   -----------------------------------------------------------
   【2026年8月 修正】

   以前はここで caches.keys() のすべてを消していました。

   サービスワーカーの受け持ち範囲はパスで分かれますが、
   控え（Cache Storage）はオリジン単位で共有されます。
   tad551216-rgb.github.io は、どのリポジトリでも同じオリジンです。

   そのため、ポータルを開くたびに
   day-kiroku・shien-kiroku・おむかえルート帖などの控えまで
   まとめて消えていました（オフラインで開けなくなる原因）。

   いまは、中身が /tsukuru-techo/ のものだけを選んで消します。
   =========================================================== */

const TT_SCOPE = '/tsukuru-techo/';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

/* この控えは /tsukuru-techo/ のものか？ */
async function isMine(name){
  try{
    const c = await caches.open(name);
    const reqs = await c.keys();
    if(!reqs.length) return false;
    /* ひとつでも別の場所のものが入っていれば、他のアプリの控えとみなして手を出さない */
    return reqs.every(function(r){
      try{ return new URL(r.url).pathname.indexOf(TT_SCOPE) === 0; }
      catch(err){ return false; }
    });
  }catch(err){ return false; }
}

self.addEventListener('activate', function(e){
  e.waitUntil((async function(){

    /* /tsukuru-techo/ の控えだけを捨てる */
    try{
      const keys = await caches.keys();
      for(const k of keys){
        if(await isMine(k)) await caches.delete(k);
      }
    }catch(err){}

    /* 自分の登録を取り消す */
    try{ await self.registration.unregister(); }catch(err){}

    /* 開いているページを読み込み直して、最新に入れ替える */
    try{
      const list = await self.clients.matchAll({ type:'window' });
      list.forEach(function(c){
        try{ c.navigate(c.url); }catch(err){}
      });
    }catch(err){}

  })());
});
