/* ===========================================================
   つくる手帖 — 後片づけ用のサービスワーカー
   -----------------------------------------------------------
   もともとここには、ピンボール用のサービスワーカーが置かれて
   いました。受け持ち範囲が /tsukuru-techo/ 配下すべてで、
   しかも「控えがあれば控えを返す」作りだったため、
   ページを更新しても端末には古いものが表示され続けていました。

   このファイルは、その後始末をするためだけのものです。

     1. 溜まっている控えを、すべて捨てる
     2. 自分自身の登録を取り消す
     3. 開いているページを読み込み直す

   fetch を受け取らないので、通信はふつうに素通りします。
   つくる手帖の各ページは、これ以降つねに最新が表示されます。

   ※ 各アプリ（day-kiroku、shien-kiroku など）のサービスワーカーは
     それぞれ別の場所にあり、これには影響されません。
     アプリのオフライン動作はそのまま保たれます。
   =========================================================== */

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    /* 溜まっている控えを捨てる */
    try{
      var keys = await caches.keys();
      await Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }catch(err){}

    /* 自分の登録を取り消す */
    try{ await self.registration.unregister(); }catch(err){}

    /* 開いているページを読み込み直して、最新に入れ替える */
    try{
      var list = await self.clients.matchAll({ type:'window' });
      list.forEach(function(c){
        try{ c.navigate(c.url); }catch(err){}
      });
    }catch(err){}
  })());
});
