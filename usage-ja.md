# X Bookmarks Organizer 使い方ガイド

[< READMEに戻る](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/README-ja.md)

[English](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage.md) | 日本語

> [!NOTE]  
> モバイル版でもクリックをタップ、右クリックを長押しに読み替えればこの通りで使えます。

## v1.4.0からデータの保存フォーマットが変更されました

![format-update.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/format-update.png)

v1.4.0より前からスクリプトを使用している方は必ず更新してください。

更新するまでスクリプトの使用はできません。

## ポストをフォルダに追加する/保存済みブックマークを編集する

ブックマークボタンを右クリックしてフォルダの編集UIを開きます。

![0.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/0.png)

- ポストの内容が表示されている部分でテキストを選択して、「選択したテキストを追加」をクリックすることで、選択したテキストをフォルダとして追加できます。
- ハッシュタグをクリックすることで、ハッシュタグをフォルダとして追加できます。
- 「すべてのハッシュタグを追加」をクリックすることで、すべてのハッシュタグを追加できます。
- テキストボックスにフォルダ名を入力し、「新規フォルダ」をクリックすることでフォルダを追加できます。
- 「スペース区切りで複数追加」のチェックボックスにチェックをいれると、テキストボックスにスペース区切りで複数のフォルダ名を入力することで一括で追加できます。
- 下のフォルダ一覧には、すでにあるフォルダや追加しようとしているフォルダが表示されています。
- フォルダ要素をクリックして、フォルダに追加/削除ができます。
- 新規に追加するフォルダ要素をクリックすると削除されてしまい、再追加するには上記のいずれかの手順でやり直す必要があります。

最後に「保存」を押してブックマークを登録または編集の保存をします。

### ブックマーク登録直後にフォルダに追加する

![1.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/1.png)

「フォルダに追加」をクリックします。

## ブックマークページでポストをフィルタ処理する

![2.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/2.png)

ブックマークページのフォルダ名のボタンをクリックすると、そのフォルダでフィルタ処理とフィルタ処理解除ができます。

## フォルダ一覧を見る

![3.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/3.png)

「...」をクリックしてフォルダ一覧を開きます。

リスト上のフォルダ名のリスト要素をクリックすると、そのフォルダでフィルタ処理することができます。

「フォルダーを編集」をクリックしてフォルダ編集モードに入ります。

「フォルダーを掃除」をクリックして不要なフォルダを掃除します。

## フォルダ編集モード

![4.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/4.png)

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

![5.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/ja/5.png)

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
> この方法では、既存のスクリプトのアカウントのデータやフォルダが失われる可能性があります。

## 選択したアカウントの全フォルダを削除

> [!WARNING]  
> あなたはこれをするということがどういうことかわかっているだろう (・ｖ・)

## 全アカウントのフォルダデータをリセット

> [!WARNING]  
> あなたはこれをするということがどういうことかわかっているだろう (・ｖ・)
