/* ===========================================================
   はじめかたの案内（つくる手帖 共通）
   -----------------------------------------------------------
   アプリを開く前に、「先にホーム画面へ追加してから使い始める」
   ことをお伝えするための部品です。
   デイサービス応援帖・放課後デイ応援帖の両方から読み込みます。

   使い方：
     <script src="hajimekata.js" defer></script>
   これだけです。アプリの入口（https://…github.io/○○/ の形の
   リンク）を押したときに、自動で案内を出します。

   ・すでにホーム画面から開いているときは、案内を出しません
   ・端末に合った手順だけを出します（iPhone / Android / パソコン）
   ・LINEなどのアプリ内ブラウザでは、追加できないことを伝え、
     アドレスを写して Safari で開いていただくよう案内します
   =========================================================== */
(function(){
  'use strict';

  /* アプリの入口だけを対象にする（PDFやスライドは対象外） */
  var APP_RE = /^https:\/\/tad551216-rgb\.github\.io\/[a-z0-9-]+\/?$/i;

  /* すでにホーム画面から開いているか */
  function isStandalone(){
    try{
      if(window.navigator.standalone === true) return true;
      if(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    }catch(e){}
    return false;
  }

  /* どの端末・どのブラウザか */
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var inApp = /Line\/|FBAN|FBAV|Instagram|Twitter|MicroMessenger|KAKAOTALK/i.test(ua);
  var otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(ua);
  /* ホーム画面から開いた画面には共有ボタンが出ないため、そこからは追加できない。
     LINEなどのアプリ内ブラウザ、iPhoneのSafari以外のブラウザも同じ。 */
  var standalone = isStandalone();
  var iosCantAdd = isIOS && (inApp || otherBrowser || standalone);
  var androidCantAdd = isAndroid && (inApp || standalone);
  var isPhone = isIOS || isAndroid;

  /* ------------------- 見た目 ------------------- */
  var CSS = ''
  + '.hjm-back{position:fixed;left:0;right:0;top:0;bottom:0;z-index:9998;'
  + '  background:rgba(27,42,74,.45);'
  + '  display:flex;align-items:flex-end;justify-content:center;padding:0;}'
  /* iPhoneのSafariは、下のツールバーの分だけ画面が短くなる。
     inset で上下を留めると、下端がツールバーの裏に潜ってしまう。 */
  + '@supports (height:100dvh){.hjm-back{bottom:auto;height:100dvh;}}'
  + '.hjm-box{background:#F3F1EA;color:#1B2A4A;width:100%;max-width:560px;'
  + '  border-radius:16px 16px 0 0;'
  + '  max-height:92vh;max-height:92dvh;'      /* 中身が長くても足もとが隠れないよう三段に分ける */
  + '  display:flex;flex-direction:column;min-height:0;'
  + '  box-shadow:0 -6px 30px rgba(27,42,74,.35);'
  + '  font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif;}'
  + '.hjm-head{background:#1B2A4A;color:#F7F5EE;padding:13px 16px;flex:none;'
  + '  border-radius:16px 16px 0 0;display:flex;align-items:flex-start;gap:10px;}'
  + '.hjm-head .tt{flex:1;min-width:0;}'
  + '.hjm-x{flex:none;background:rgba(247,245,238,.16);color:#F7F5EE;border:none;'
  + '  width:32px;height:32px;border-radius:50%;font-size:17px;line-height:1;'
  + '  cursor:pointer;font-family:inherit;padding:0;}'
  + '.hjm-head .t{font-size:16px;font-weight:700;letter-spacing:.04em;}'
  + '.hjm-head .s{font-size:12px;opacity:.8;margin-top:3px;}'
  + '.hjm-body{padding:14px 18px 6px;flex:1 1 auto;overflow-y:auto;min-height:0;'
  + '  -webkit-overflow-scrolling:touch;}'
  + '.hjm-why{background:#fff;border:1px solid #D8D3C4;border-left:5px solid #C2603A;'
  + '  border-radius:8px;padding:11px 13px;font-size:13px;line-height:1.75;margin-bottom:12px;}'
  + '.hjm-why b{color:#1B2A4A;}'
  + '.hjm-steps{list-style:none;margin:0;padding:0;counter-reset:hjm;}'
  + '.hjm-steps li{counter-increment:hjm;position:relative;padding:0 0 11px 38px;'
  + '  font-size:14px;line-height:1.75;}'
  + '.hjm-steps li:before{content:counter(hjm);position:absolute;left:0;top:1px;'
  + '  width:24px;height:24px;border-radius:50%;background:#1B2A4A;color:#F7F5EE;'
  + '  font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;}'
  + '.hjm-steps li.mark:before{background:#C2603A;}'
  + '.hjm-steps b{color:#9F4A2B;}'
  + '.hjm-url{display:flex;gap:8px;margin:4px 0 14px;}'
  + '.hjm-url input{flex:1;min-width:0;font-size:13px;padding:8px 10px;'
  + '  border:1px solid #D8D3C4;border-radius:8px;background:#fff;color:#3A4A66;}'
  + '.hjm-foot{flex:none;padding:8px 18px calc(14px + env(safe-area-inset-bottom));'
  + '  background:#F3F1EA;border-top:1px solid #E2DED1;}'
  + '.hjm-go{display:block;width:100%;text-align:center;text-decoration:none;'
  + '  background:#C2603A;color:#fff;font-size:16px;font-weight:700;'
  + '  padding:13px;border:none;border-radius:10px;cursor:pointer;font-family:inherit;}'
  + '.hjm-go.calm{background:#1B2A4A;}'
  + '.hjm-sub{display:block;width:100%;text-align:center;background:none;border:none;'
  + '  color:#7A7567;font-size:12.5px;padding:9px 4px 0;cursor:pointer;'
  + '  text-decoration:underline;font-family:inherit;}'
  + '.hjm-copy{flex:none;background:#1B2A4A;color:#fff;border:none;border-radius:8px;'
  + '  font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;font-family:inherit;}'
  + '.hjm-note{font-size:12px;color:#7A7567;line-height:1.8;margin:0 0 10px;}'
  /* どこに焦点があるか、目で分かるようにする */
  + '.hjm-box:focus{outline:3px solid #C2603A;outline-offset:-3px;}'
  + '.hjm-box:focus-visible{outline:3px solid #C2603A;outline-offset:-3px;}'
  + '.hjm-go:focus-visible,.hjm-sub:focus-visible,.hjm-x:focus-visible,'
  + '.hjm-copy:focus-visible,.hjm-url input:focus-visible{'
  + '  outline:3px solid #1B2A4A;outline-offset:2px;}'
  + '.hjm-go:focus-visible{outline-color:#1B2A4A;}'
  + '@media (min-width:600px){.hjm-back{align-items:center;padding:20px;}'
  + '  .hjm-box{border-radius:14px;} .hjm-head{border-radius:14px 14px 0 0;}}'
  + '@media (max-height:700px){.hjm-why{font-size:12.5px;line-height:1.65;}'
  + '  .hjm-steps li{font-size:13.5px;line-height:1.65;padding-bottom:9px;}}';

  function addCSS(){
    if(document.getElementById('hjm-css')) return;
    var st = document.createElement('style');
    st.id = 'hjm-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ------------------- 手順の文面 ------------------- */
  function steps(url, name){
    /* ① iPhone・iPad（Safari） */
    if(isIOS && !iosCantAdd){
      return {
        sub: 'iPhone・iPad の手順',
        html:
          '<ol class="hjm-steps">'
          + '<li>下の<b>「開く」</b>を押します</li>'
          + '<li>開いたら、<b>何も入力せずに</b>画面下の<b>共有ボタン（□に↑）</b>を押します</li>'
          + '<li>メニューを下にすべらせて<b>「ホーム画面に追加」</b>→「追加」</li>'
          + '<li class="mark">Safariを閉じて、<b>ホーム画面のアイコンから開き直します</b></li>'
          + '<li class="mark">そこから<b>使い始めてください</b></li>'
          + '</ol>'
          + '<p class="hjm-note">４と５が大切です。Safariのほうで使い始めると、あとで追加しても、それまでの記録が引き継がれないことがあります。</p>',
        go: '開く', calm: false
      };
    }
    /* ② Android（Chrome） */
    if(isAndroid && !androidCantAdd){
      return {
        sub: 'Android の手順',
        html:
          '<ol class="hjm-steps">'
          + '<li>下の<b>「開く」</b>を押します</li>'
          + '<li>開いたら、<b>何も入力せずに</b>右上の<b>「⋮」</b>を押します</li>'
          + '<li><b>「ホーム画面に追加」</b>（または「アプリをインストール」）を選びます</li>'
          + '<li class="mark">ブラウザを閉じて、<b>ホーム画面のアイコンから開き直します</b></li>'
          + '<li class="mark">そこから<b>使い始めてください</b></li>'
          + '</ol>'
          + '<p class="hjm-note">４と５が大切です。ブラウザのほうで使い始めると、あとで追加しても、それまでの記録が引き継がれないことがあります。</p>',
        go: '開く', calm: false
      };
    }
    /* ③ LINEなどのアプリ内ブラウザ・ほかのブラウザ */
    if(iosCantAdd || androidCantAdd){
      var which = isIOS ? 'Safari' : 'Chrome';
      return {
        sub: standalone ? 'この画面からは追加できません（' + which + 'でお開きください）'
                        : 'この画面からは、ホーム画面に追加できません',
        html:
          '<ol class="hjm-steps">'
          + '<li>下のアドレスを<b>「写す」</b>で写します'
          + '<div class="hjm-url"><input type="text" id="hjm-u" readonly value="' + esc(url) + '">'
          + '<button class="hjm-copy" id="hjm-c" type="button">写す</button></div></li>'
          + '<li><b>' + which + '</b>を開いて、アドレス欄に貼り付けます</li>'
          + '<li>開いたら、' + (isIOS
              ? '<b>共有ボタン（□に↑）</b>→<b>「ホーム画面に追加」</b>'
              : '<b>「⋮」</b>→<b>「ホーム画面に追加」</b>') + '</li>'
          + '<li class="mark"><b>ホーム画面のアイコンから開いて</b>、使い始めてください</li>'
          + '</ol>'
          + '<p class="hjm-note">' + (standalone
              ? 'ホーム画面から開いたこの画面には、共有ボタンが出ないため追加ができません。'
              : 'LINEなどの中で開いた画面では、ホーム画面への追加ができません。')
            + 'お手数ですが' + which + 'でお開きください。</p>',
        go: 'このまま中身だけ見る', calm: true
      };
    }
    /* ④ パソコン */
    return {
      sub: 'パソコンでお使いのとき',
      html:
        '<ol class="hjm-steps">'
        + '<li>下の<b>「開く」</b>を押すと、そのままお使いいただけます</li>'
        + '<li class="mark">続けてお使いになるなら、<b>お気に入りではなく、アプリとして入れて</b>ください'
        + '（Chrome・Edgeならアドレス欄の右にある<b>インストールの印</b>から）</li>'
        + '</ol>'
        + '<p class="hjm-note">記録はこのパソコンの中だけに保存されます。ブラウザの履歴やデータを消すと、記録も消えることがあります。</p>',
      go: '開く', calm: false
    };
  }

  /* ------------------- 案内を出す ------------------- */
  function open(url, name, trigger){
    addCSS();   /* すでに入っていれば何もしない */
    var s = steps(url, name);
    var before = trigger || document.activeElement;

    var back = document.createElement('div');
    back.className = 'hjm-back';
    back.innerHTML =
      '<div class="hjm-box" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="hjm-ttl">'
      + '<div class="hjm-head">'
      + '<div class="tt"><div class="t" id="hjm-ttl">' + esc(name || 'このアプリ') + ' のはじめかた</div>'
      + '<div class="s">' + esc(s.sub) + '</div></div>'
      + '<button class="hjm-x" id="hjm-x2" type="button" aria-label="閉じる">✕</button>'
      + '</div>'
      + '<div class="hjm-body">'
      + (isPhone
          ? '<div class="hjm-why"><b>先にホーム画面へ追加してから、使い始めてください。</b><br>'
            + '追加せずにお使いになると、しばらく開かない間に、書きためた記録が消えてしまうことがあります。</div>'
          : '')
      + s.html
      + '</div>'
      + '<div class="hjm-foot">'
      + '<button class="hjm-go' + (s.calm ? ' calm' : '') + '" id="hjm-go" type="button">' + esc(s.go) + '</button>'
      + '<button class="hjm-sub" id="hjm-x" type="button">やめる</button>'
      + '</div></div>';

    document.body.appendChild(back);
    var prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    var closers = [];
    function close(){
      document.body.style.overflow = prev;
      if(back.parentNode) back.parentNode.removeChild(back);
      document.removeEventListener('keydown', onKey);
      closers.forEach(function(f){ try{ f(); }catch(e){} });
      closers.length = 0;
      /* 焦点を、押したボタンに返す */
      try{ if(before && before.focus) before.focus(); }catch(e){}
    }
    function onKey(e){
      if(e.key === 'Escape'){ close(); return; }
      if(e.key !== 'Tab') return;
      /* 案内の中だけを行き来する */
      var items = back.querySelectorAll('button, [href], input:not([disabled])');
      if(!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);

    back.addEventListener('click', function(e){ if(e.target === back) close(); });
    back.querySelector('#hjm-x').addEventListener('click', close);
    back.querySelector('#hjm-x2').addEventListener('click', close);
    back.querySelector('#hjm-go').addEventListener('click', function(){
      close();
      /* 同じ画面で開く。iPhoneでは、開いた画面から共有→追加をしていただく */
      location.href = url;
    });

    var c = back.querySelector('#hjm-c');
    if(c) c.addEventListener('click', function(){
      var i = back.querySelector('#hjm-u');
      i.focus(); i.select();
      var ok = false;
      try{ ok = document.execCommand('copy'); }catch(e){}
      if(navigator.clipboard && !ok){
        navigator.clipboard.writeText(i.value).then(function(){ c.textContent = '写しました'; })
          .catch(function(){ c.textContent = '長押しで写してください'; });
      }else{
        c.textContent = ok ? '写しました' : '長押しで写してください';
      }
    });

    /* いちばん上を見せる */
    var box = back.querySelector('.hjm-box');
    if(box) box.scrollTop = 0;

    /* iPhoneのSafariでは、下のツールバーの出入りで見える高さが変わる。
       実際に見えている高さを当てて、足もとが隠れないようにする。 */
    var vv = window.visualViewport;
    function fit(){
      var h = (vv && vv.height) || window.innerHeight || 0;
      if(h > 0) back.style.height = h + 'px';
      if(vv && typeof vv.offsetTop === 'number') back.style.top = vv.offsetTop + 'px';
    }
    fit();

    /* 案内に焦点を移す。まず箱に当てて、見出しから読み上げられるようにする。
       描き終わる前だと当たらないことがあるので、当たるまで何度か試す。 */
    function put(){
      if(!box) return true;
      try{ box.focus({ preventScroll:true }); }catch(e){ try{ box.focus(); }catch(e2){} }
      return back.contains(document.activeElement);
    }
    function grab(n){
      if(put() || n <= 0) return;
      if(window.requestAnimationFrame) requestAnimationFrame(function(){ grab(n - 1); });
      else setTimeout(function(){ grab(n - 1); }, 16);
    }
    grab(10);
    setTimeout(function(){ if(back.parentNode) put(); }, 60);
    setTimeout(function(){ if(back.parentNode) put(); }, 250);

    /* 開いている間に焦点が外へ出たら、引き戻す */
    function keep(e){
      if(!back.parentNode) return;
      if(back.contains(e.target)) return;
      put();
    }
    document.addEventListener('focusin', keep, true);
    closers.push(function(){ document.removeEventListener('focusin', keep, true); });

    if(vv){
      vv.addEventListener('resize', fit);
      vv.addEventListener('scroll', fit);
    }
    window.addEventListener('orientationchange', fit);
    closers.push(function(){
      if(vv){
        vv.removeEventListener('resize', fit);
        vv.removeEventListener('scroll', fit);
      }
      window.removeEventListener('orientationchange', fit);
    });
  }

  /* リンクの近くにある見出しから、アプリの名前を拾う */
  function appName(a){
    var box = a.closest ? a.closest('article, section, .app, .appcard, .card') : null;
    if(!box) return '';
    var h = box.querySelector('h2, h3, .nm');
    if(!h) return '';
    return (h.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* ------------------- リンクを見張る ------------------- */
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if(!a) return;
    if(a.hasAttribute('data-hjm-skip')) return;
    var href = a.getAttribute('href') || '';
    if(!APP_RE.test(href)) return;             /* アプリの入口以外は素通り */
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    var name = a.getAttribute('data-hjm-name') || appName(a);
    open(href, name, a);
  }, true);

  /* 体裁は先に入れておく。初回だけ焦点が当たらない、を防ぐため。
     defer で読み込むので、この時点で head は必ずある。 */
  addCSS();
  if(!document.getElementById('hjm-css')){
    document.addEventListener('DOMContentLoaded', addCSS);
  }

  /* ほかから呼びたいとき用 */
  window.Hajimekata = { open: open, isStandalone: isStandalone };
})();
