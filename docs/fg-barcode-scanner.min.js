/* ============================================================
 * forguncy-barcode-page-script.js
 * Forguncyの「ページ設定」→「カスタムJavaScript」に貼り付けるコード。
 *
 * 事前準備（Forguncy Builder側）:
 *   1) このページに fg-barcode-scanner.min.js を読み込ませる。
 *      方法A: サイト管理の「カスタムファイル」等でファイルをアップロードし、
 *             ページの<head>にスクリプト参照を追加できる設定があればそこで読み込む。
 *      方法B（確実・推奨）: 下記コードが実行時に動的に<script>タグを挿入して読み込む
 *             （このファイルの先頭に用意済み。fg-barcode-scanner.min.js を
 *              Forguncyサーバーの静的ファイルとして配置し、パスを指定するだけでよい）。
 *   2) 空の「コンテナ」セル（何も配置しない領域）を1つ用意し、オブジェクト名を
 *      「barcodeVideoArea」に設定する（右ペイン→セル型タブ→名前）。
 *   3) 「ボタン」セルを1つ用意し、オブジェクト名を「btnStartScan」に設定する。
 *      （コマンドは設定しない。クリック処理はこのJSで拾う）
 *   4) 読み取った値を受け取る既存のセル（テキストボックス等）のオブジェクト名を
 *      控えておき、下の TARGET_CELL_NAME を書き換える。
 *   5) 任意：スキャン中に表示する「停止」ボタンを用意し、
 *      オブジェクト名を「btnStopScan」に設定する（無くても自動検出後に自動停止する）。
 *
 * 注意:
 *   - カメラ取得(getUserMedia)は HTTPS（またはlocalhost）必須。HTTP配信では動作しない。
 *   - iOS Safari は「ユーザー操作（タップ）の直後」でないとカメラ許可ダイアログが
 *     出ないことがあるため、必ずボタンのclickイベント内でstartを呼ぶこと
 *     （このコードはその前提で書いている）。
 * ============================================================ */
(function () {
  'use strict';

  // ==== 設定（環境に合わせて書き換える） ====
  var SCANNER_SCRIPT_URL = 'https://tad551216-rgb.github.io/barcode-scanner/fg-barcode-scanner.min.js';
  var VIDEO_AREA_NAME = 'barcodeVideoArea';
  var START_BUTTON_NAME = 'btnStartScan';
  var STOP_BUTTON_NAME = 'btnStopScan';   // 無ければ null にしてよい
  var TARGET_CELL_NAME = 'ScanResult';    // 読み取り値を書き込む先のセル名
  var FORMATS = ['QR_CODE', 'CODE_128', 'EAN_13', 'EAN_8', 'CODE_39', 'CODABAR', 'ITF']; // 使う種別だけ残す
  var AUTO_STOP_ON_DECODE = true;         // 1件読み取ったら自動停止するか

  var scannerLoaded = false;
  var scannerLoading = null;
  var videoEl = null;

  function loadScannerScript() {
    if (scannerLoaded) return Promise.resolve();
    if (scannerLoading) return scannerLoading;
    scannerLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SCANNER_SCRIPT_URL;
      s.onload = function () { scannerLoaded = true; resolve(); };
      s.onerror = function () { reject(new Error('fg-barcode-scanner.min.js の読み込みに失敗しました: ' + SCANNER_SCRIPT_URL)); };
      document.head.appendChild(s);
    });
    return scannerLoading;
  }

  function getVideoElement() {
    if (videoEl && document.body.contains(videoEl)) return videoEl;
    // オブジェクト名を設定したセルは div[fgcname="..."] として描画される
    var container = document.querySelector('div[fgcname="' + VIDEO_AREA_NAME + '"]');
    if (!container) {
      throw new Error('コンテナセル "' + VIDEO_AREA_NAME + '" が見つかりません。オブジェクト名の設定を確認してください。');
    }
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.background = '#000';

    videoEl = document.createElement('video');
    videoEl.setAttribute('playsinline', ''); // iOSでフルスクリーン強制再生を防ぐ
    videoEl.setAttribute('muted', '');
    videoEl.autoplay = true;
    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'cover';
    videoEl.style.display = 'block';
    container.appendChild(videoEl);

    // 目印の枠（無くても機能には影響しない）
    var reticle = document.createElement('div');
    reticle.style.cssText = 'position:absolute;inset:15% 10%;border:3px solid #D6452B;border-radius:8px;pointer-events:none;box-shadow:0 0 0 2000px rgba(0,0,0,.25)';
    container.appendChild(reticle);

    return videoEl;
  }

  function writeResultToCell(text) {
    var page = Forguncy.Page;
    var cell = page.getCell(TARGET_CELL_NAME);
    if (!cell) {
      console.error('セル "' + TARGET_CELL_NAME + '" が見つかりません。TARGET_CELL_NAME を確認してください。');
      return;
    }
    // setValueにより、そのセルに紐づく「値変更時」の既存コマンド（検索・登録等）が
    // そのまま発火する。読み取り後の処理は従来どおりForguncy側の設定に任せられる。
    cell.setValue(text);
  }

  var lastCode = null, lastTime = 0;
  function onDecode(text) {
    var now = Date.now();
    if (text === lastCode && now - lastTime < 1500) return; // 同一値の連続検出を間引く
    lastCode = text; lastTime = now;

    if (navigator.vibrate) { try { navigator.vibrate(80); } catch (e) {} }
    writeResultToCell(text);

    if (AUTO_STOP_ON_DECODE) {
      stopScan();
    }
  }

  function onScanError(err) {
    console.error('バーコードスキャンでエラー:', err);
  }

  function startScan() {
    loadScannerScript().then(function () {
      if (!window.FGBarcodeScanner.isSupported()) {
        alert('この端末・ブラウザはカメラ取得に対応していません。');
        return;
      }
      var video = getVideoElement();
      return window.FGBarcodeScanner.start(video, onDecode, onScanError, FORMATS);
    }).catch(function (e) {
      console.error(e);
      alert('カメラを起動できませんでした。HTTPS接続か、カメラの利用許可設定をご確認ください。\n(' + (e && e.message ? e.message : e) + ')');
    });
  }

  function stopScan() {
    if (window.FGBarcodeScanner) {
      window.FGBarcodeScanner.stop();
    }
  }

  // ==== ページ初期化時にボタンへイベントを紐付け ====
  Forguncy.Page.onPageLoaded(function () {
    var page = Forguncy.Page;

    var startBtn = page.getCell(START_BUTTON_NAME);
    if (startBtn) {
      startBtn.bind('click', function () {
        startScan(); // ★ユーザーのタップ操作の中で直接呼ぶ（iOSのカメラ許可対策）
      });
    } else {
      console.error('ボタン "' + START_BUTTON_NAME + '" が見つかりません。');
    }

    if (STOP_BUTTON_NAME) {
      var stopBtn = page.getCell(STOP_BUTTON_NAME);
      if (stopBtn) {
        stopBtn.bind('click', function () { stopScan(); });
      }
    }
  });

  // ページ離脱時にカメラを確実に止める（バッテリー消費・プライバシー対策）
  window.addEventListener('beforeunload', function () { stopScan(); });
})();
