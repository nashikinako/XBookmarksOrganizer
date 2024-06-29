# X Bookmarks Organizer 使い方ガイド

[< READMEに戻る](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/README-ja.md)

[English ver.](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage.md) | 日本語版

> [!NOTE]  
> 一部の画像は旧バージョンのUIですが、現バージョンと大きな違いはありません。ご了承ください。  
> また、モバイル版でもクリックをタップ、右クリックを長押しに読み替えればこの通りで使えます。

## ポストをフォルダに追加する

![0.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/0.png)

1. ブックマークボタンを右クリックしてフォルダの編集UIを開きます。
2. フォルダーの名前をテキストボックスに入力していきます。
3. ブックマークボタンをクリックします。
4. これでブックマークをXに追加し、スクリプトにフォルダ情報が保存されました。

フォルダはスペースで区切ってください。フォルダ名にスペースが含まれている場合は、アンダースコアまたはハイフンに置き換えてください。

---

![1.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/1.png)

選択ボックスを使って、既存のフォルダにポストを簡単に追加できます。

オプション項目をクリックして、フォルダに追加・削除できます。

### ブックマーク登録直後にフォルダに追加する

![7.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/7.png)

「フォルダに追加」をクリックします。

![8.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/8.png)

上記のフォルダ追加方法と同様にしてフォルダに追加できます。

最後に「保存」を押して保存してください。

## ポストのフォルダを編集する

![2.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/2.png)

すでにブックマークされている記事のフォルダを編集するには、フォルダに追加するときと同じようにフォルダを編集して「更新」ボタンをクリックします。

## ブックマークページでポストをフィルタ処理する

![3.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/3.png)

ブックマークページのフォルダ名のボタンをクリックすると、そのフォルダでフィルタ処理とフィルタ処理解除ができます。

## フォルダ一覧を見る

![4.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/4.png)

「...」をクリックしてフォルダ一覧を開きます。

リスト上のフォルダ名のリスト要素をクリックすると、そのフォルダでフィルタ処理することができます。

「フォルダーを編集」をクリックしてフォルダ編集モードに入ります。

「フォルダーを掃除」をクリックして不要なフォルダを掃除します。

## フォルダ編集モード

![5.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/5.png)

### フォルダ名を編集

1. 鉛筆マークをクリックすると、フォルダ名を編集できるようになります。
2. テキストボックスにフォルダ名を入力します。
3. 保存ボタン（「編集を終了」ではない）をクリックする
4. フォルダ名が変更されます。

変更したフォルダ名と同じフォルダ名のフォルダがある場合、それらを統合することができます。

### フォルダを削除

ゴミ箱のボタンをクリックしてフォルダを削除できます。

### 編集モードを終了する

「編集を終了」をクリックして編集モードを終了します。

## 不要なフォルダの掃除

スクリプトのバグやスクリプトを入れていない環境でのブックマーク削除等により、Xのブックマーク済みポスト一覧にないポストに関するデータがスクリプトのデータに登録されていると、1件もポストが入っていないことになるフォルダが発生します。

フォルダ一覧画面の「フォルダーを掃除」をクリックすることでそのような不要なフォルダを削除することができます。

## スクリプトの設定

### 設定パネルを開く

![9.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/9.png)

Xの設定画面にある「X Bookmarks Organizerの設定を開く」をクリックします。

---

![6.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/6.png)

### 言語

- Auto: Xの言語設定に合わせます。
- 各言語を選択し、その言語に強制的に変更することができます。

保存ボタンをクリックして、ページをリロードし、言語を変更することができます。

### エクスポート

「エクスポート」ボタンをクリックすると、下のテキストボックスにJSON形式でエクスポートできます。

### インポートして統合

下のテキストボックスに入力されたJSONをインポートし、既存のデータに追加します。

この方法では、既存のフォルダが削除されることはありません。

### インポートして上書き

下のテキストボックスに入力されたJSONをインポートし、既存のデータを上書きします。

> [!WARNING]  
> この方法では、既存のフォルダが失われる可能性があります。

## 全フォルダを削除

> [!WARNING]  
> あなたはこれをするということがどういうことかわかっているだろう (・ｖ・)
