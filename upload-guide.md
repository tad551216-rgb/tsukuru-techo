# 差し替えファイル一覧（tsukuru-techo リポジトリ直下）

docs/ の中身（ryoiku-douga.mp4 / ryoiku-blueprint.pdf / ohashi-step.png / master-slides.pdf）は
すでにアップ済みでしたので、今回は含めていません。下の6ファイルだけ置き換えれば完了です。

| ファイル | 種別 | 内容 |
|---|---|---|
| `ouen.html` | 差し替え | **ハブに作り替え**。ふたつの入口・公開の趣旨・免責のみ |
| `ouen-apps.html` | **新規** | 業務応援アプリ（ムービー・スライド・一日の流れ・3アプリ・おまけ・導入手順・大事なこと） |
| `ryoiku.html` | 差し替え | ヘッダーのナビを新階層に更新 |
| `ryoiku-hashi.html` | 差し替え | 同上 |
| `sitemap.html` | 差し替え | 「放課後デイ応援」の節を新階層に刷新（全10項目） |
| `sitemap.xml` | 差し替え | ouen-apps.html / ryoiku.html / ryoiku-hashi.html を追加 |

## ページ階層

```
ouen.html                 放課後デイ応援帖（ハブ）
 ├ ouen-apps.html         業務応援アプリ
 └ ryoiku.html            個別支援計画のたね
     └ ryoiku-hashi.html  No.01 おはしマスターへの道
```

## index.html について

トップページの「放課後デイ応援帖 →」は2か所とも `ouen.html`（ハブ）を指しており、
新階層でもそのまま正しく動きます。**変更は不要**です。

## sitemap.html の変更点

- 旧：ouen.html ＋ 3アプリ ＋ スライドサイト ＋ 手順書PDF（全6項目）
- 新：ハブ ＋ 業務応援アプリ ＋ 3アプリ ＋ スライドPDF ＋ 手順書PDF ＋ サンプル体験
      ＋ 個別支援計画のたね ＋ No.01 おはし ＋ 発達支援デザインPDF（全10項目）
- 外部スライドサイトへのリンクは、PDF（viewer.html 経由）に置き換えました。

## 残っている作業

- No.02 クレヨン、No.03 和泉市まわり（ryoiku.html に「準備中」の枠だけ設置済み）
