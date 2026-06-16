# つくる手帖 — AIで"自分専用"の道具をつくる

AIを相棒に、自分が欲しいアプリ（PWA）を作っていく記録を公開するブログ／ポータルサイトです。GitHub Pages で公開できる静的サイト。

## ファイル構成

```
index.html              トップページ（アプリ一覧＋記事一覧）
articles/
  article.css           記事ページ共通のスタイル
  kakeibo.html          記事：家計簿アプリを、AIと作り切るまで
  ai-app-howto.html     記事：AIでアプリを作るときの勘所と、必要なスキル
```

## デモアプリは別リポジトリ

家計簿のデモは別リポジトリ（demo-kakeibo）で公開し、トップの「使ってみる」はその公開URL
`https://tad551216-rgb.github.io/demo-kakeibo/` を新しいタブで開くようにしています。
デモURLを変える場合は index.html 内 `APPS` の `demo:` を書き換えてください。

## 新しいアプリ・記事の追加

index.html 下部の `<script>` 内 `APPS` / `POSTS` 配列に1件足すだけです。
記事は articles/kakeibo.html をコピーして本文を差し替えると、共通CSSで見た目が自動でそろいます。
※ 配列の文字列内に半角ダブルクォート " は使わないでください（『』や全角を使用）。

## デプロイ

リポジトリにこの一式を置き、Settings → Pages → Deploy from a branch（main / root）で公開。すべて相対パスなのでサブディレクトリでも動作します。
