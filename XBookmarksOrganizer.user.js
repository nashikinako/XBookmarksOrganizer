// ==UserScript==
// @name        X Bookmarks Organizer
// @name:ja     X Bookmarks Organizer
// @namespace   https://github.com/nashikinako/XBookmarksOrganizer
// @match       https://x.com/*
// @match       https://twitter.com/*
// @icon        https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/icon.png
// @grant       GM_setValue
// @grant       GM_getValue
// @version     1.3.0
// @author      Nashikinako
// @license     MIT
// @description Organize your X bookmarks into folders for free.
// @description:ja Xのブックマークを無料でフォルダーに整理。
// @supportURL  https://github.com/nashikinako/XBookmarksOrganizer/issues
// @require     https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

// X Bookmarks Organizer is under MIT license. https://github.com/nashikinako/XBookmarksOrganizer/blob/main/LICENSE

$(function () {
  // ランダムな文字列を生成する関数
  const generateRandomStrings = (length) => {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  // スクロールを禁止するイベントリスナーのコールバック関数
  function noscroll(e) {
    e.preventDefault();
  }
  // スクロールを禁止する関数
  // swがtrueの場合はスクロールを禁止し、falseの場合は解除する
  const scrollLock = (sw) => {
    if (sw) {
      document.addEventListener("wheel", noscroll, { passive: false });
      document.addEventListener("touchmove", noscroll, { passive: false });
    } else {
      document.removeEventListener("wheel", noscroll, { passive: false });
      document.removeEventListener("touchmove", noscroll, { passive: false });
    }
  };

  // bookmarksInfoの更新時にallFoldersを更新する関数
  const updateAllFolders = () => {
    allFolders = [...new Set(bookmarksInfo.flatMap((post) => post.folders))];
    // フォルダー内の投稿数が多い順にソート
    allFolders.sort((a, b) => {
      return (
        bookmarksInfo.filter((post) => post.folders.includes(b)).length -
        bookmarksInfo.filter((post) => post.folders.includes(a)).length
      );
    });
    if ($("#xbo-folderSelectionUI").length !== 0) {
      $("#xbo-folderSelectionUI").empty();
      // 未分類を追加
      $("#xbo-folderSelectionUI").append(
        $(
          `<div class="xbo-folderElm" data-folder="${uncategorizedFolderID}">${i18n["uncategorized"]}</div>`
        )
      );
      allFolders.slice(0, 10).forEach((folder) => {
        $("#xbo-folderSelectionUI").append(
          $(
            `<div class="xbo-folderElm" data-folder="${folder}">${folder}</div>`
          )
        );
      });
      // すでにボタンがある場合はそのボタンを変更し、ない場合はボタンのリストに新規追加する
      if (
        $(`.xbo-folderElm[data-folder="${selectedFolder}"]`).length === 0 &&
        selectedFolder !== undefined
      ) {
        $("#xbo-folderSelectionUI").append(
          $(
            `<div class="xbo-folderElm xbo-folderTemp" data-folder="${selectedFolder}">${selectedFolder}</div>`
          )
        );
      }
      $(`.xbo-folderElm[data-folder="${selectedFolder}"]`).addClass(
        "xbo-selected"
      );
      $(`.xbo-folderElm[data-folder="${selectedFolder}"]`).append(
        $(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg>`
        )
      );
      $("#xbo-folderSelectionUI").append(
        $(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" id="xbo-showAllFoldersBtn">${svgCodeLib["dots"]}</svg>`
        )
      );
    }
  };

  // 確認ダイアログを表示する関数
  const showConfirmDialog = (message, callback) => {
    $("#react-root").append(
      $(`<div id="xbo-confirmDialog_bg" class="xbo-UI_bgs">
  <div id="xbo-confirmDialog" class="xbo-UI">
    <p>${message}</p>
    <button id="xbo-yesBtn">${i18n["yes"]}</button><button id="xbo-noBtn">${i18n["no"]}</button>
  </div>
</div>`)
    );
    $("#xbo-confirmDialog_bg").on("click", function () {
      $("#xbo-confirmDialog_bg").remove();
    });
    $("#xbo-confirmDialog").on("click", function (e) {
      e.stopPropagation();
    });
    $("#xbo-yesBtn").on("click", function () {
      $("#xbo-confirmDialog").remove();
      callback();
    });
    $("#xbo-noBtn").on("click", function () {
      $("#xbo-confirmDialog").remove();
    });
  };

  // 更新ボタンを追加する関数
  const addUpdateBtn = (elm, postID) => {
    const $updateButton = $(
      `<button class="xbo-updateBtn">${i18n["updateFolder"]}</button>`
    );
    elm.append($updateButton);
    $updateButton.on("click", function (e) {
      // 空白またはスペースのみの場合は削除する
      if (
        elm
          .parent()
          .find(".xbo-bookmarkFolderInput")
          .val()
          .replaceAll("　", " ")
          .split(" ")
          .every((folder) => folder === "")
      ) {
        bookmarksInfo = bookmarksInfo.filter((post) => post.id !== postID);
      } else {
        if (bookmarksInfo.find((post) => post.id === postID)) {
          bookmarksInfo.find((post) => post.id === postID).folders = [
            ...elm
              .parent()
              .find(".xbo-bookmarkFolderInput")
              .val()
              .replaceAll("　", " ")
              .split(" ")
              .filter((folder) => folder !== ""),
          ];
        } else {
          bookmarksInfo.push({
            id: postID,
            folders: [
              ...elm
                .parent()
                .find(".xbo-bookmarkFolderInput")
                .val()
                .replaceAll("　", " ")
                .split(" ")
                .filter((folder) => folder !== ""),
            ],
          });
        }
        // 重複を削除
        bookmarksInfo = bookmarksInfo.map((post) => ({
          id: post.id,
          folders: [...new Set(post.folders)],
        }));
      }
      updateAllFolders();
      GM_setValue("bookmarksInfo", bookmarksInfo);
      $updateButton.attr("style", "background: rgb(29, 155, 240);color: #fff;");
      setTimeout(() => {
        $updateButton.removeAttr("style");
      }, 1000);
    });
  };

  const i18nLib = {
    en: {
      firstRunTitle: "Thank you for installing X Bookmarks Organizer!",
      firstRunBody: `<p>This script enables you to organize your X bookmarks into folders.<br>Please see <a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage.md" target="_blank" rel="noopener noreferrer">usage guide</a> to know how to use.</p>`,
      updateInfoTitle: `X Bookmarks Organizer has been updated to v${GM_info.script.version}!`,
      changeLogTitle: "Change log from previous version",
      changeLog: `<p>Add</p>
<ul>
  <li>Add a function to automatically delete unnecessary folders.</li>
</ul>
<p>Change</p>
<ul>
  <li>Change the length of the random string for the ID of unselected or unclassified items from 16 to 32 characters.</li>
  <li>Improve popup UI center display style.</li>
  <li>Change svg design.</li>
  <li>Add prefix to class names that identify processed elements.</li>
  <li>Update information about script and author.</li>
</ul>
<p>Fix</p>
<ul>
  <li>Fix post data was not deleted from the script when the bookmark edit UI was not displayed when unmarking a bookmark.</li>
  <li>Fix no feedback on the update button when deleting from a folder by emptying the folder edit text box.</li>
  <li>Fix script events interfering with posts translation button events, preventing translation functionality.</li>
  <li>Fix the mark of unselected items in the select box for selecting existing folders not displaying properly.</li>
  <li>Fix import/export text box could not be scrolled.</li>
</ul>`,
      showPastChanges: `For past changes, see <a href="https://github.com/nashikinako/XBookmarksOrganizer/releases" target="_blank" rel="noopener noreferrer">GitHub release page</a>.`,
      setting: "Setting",
      language: "Language: ",
      langEn: "English",
      langJa: "Japanese - 日本語",
      importExport: "Import/Export",
      export: "Export",
      exportTextarea: "Exported here in JSON format.",
      importMarge: "Import and merge",
      importOverwrite: "Import and overwrite",
      importTextarea: "Paste in JSON format here to import.",
      reset: "Reset",
      deleteAllFolders: "Delete all folders",
      confirmImportOverwrite: "Do you want to import and overwrite?",
      confirmDeleteAllFolders: "Do you want to delete all folders?",
      foldersList: "Folders list",
      editFolders: "Edit folders",
      finishEditing: "Finish editing",
      confirmDiscardChanges:
        "There are some folder which are editing folder name. Discard changes?",
      confirmMargeFolders: "There are folders with the same name. Merge them?",
      confirmDeleteFolder: "Do you want to delete this folder?",
      updateFolder: "Update",
      save: "Save",
      yes: "Yes",
      no: "No",
      uncategorized: "Uncategorized",
      aboutThisScript: "About this script",
      relatedLinks: "Related links",
      author: `<p class="xbo-UI_categoryTitle">Author</p>
<ul>
<li>Nashikinako</li>
<li>X: <a href="https://x.com/nashikinako" target="_blank" rel="noopener noreferrer">@nashikinako</a></li>
<li>YouTube: <a href="https://www.youtube.com/@nashikinako" target="_blank" rel="noopener noreferrer">@nashikinako</a></li>
<li>Nashikinako Website (only in Japanese): <a href="https://nashikinako.com" target="_blank" rel="noopener noreferrer">https://nashikinako.com</a></li></ul>`,
      license: `<p class="xbo-UI_categoryTitle">License</p><a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>`,
      settingOpen: "Open X Bookmarks Organizer setting",
      cleanFolders: "Clean folders",
      confirmCleanFolders:
        "Do you want to clean unnecessary folders? Once started, it cannot be stopped!",
      cleaningFoldersMsg: "Cleaning folders...",
      cleaningCompletedMsg: "Cleaning folders has been completed.",
      addedToFolder: "Added to folder",
    },
    ja: {
      firstRunTitle:
        "X Bookmarks Organizerをインストールしていただきありがとうございます！",
      firstRunBody: `<p>このスクリプトはXのブックマークを無料でフォルダーに整理できるようにします。<br>使い方は<a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage-ja.md" target="_blank" rel="noopener noreferrer">使い方ガイド</a>をご覧ください。</p>`,
      updateInfoTitle: `X Bookmarks Organizerがv${GM_info.script.version}にアップデートされました！`,
      changeLogTitle: "前バージョンからの変更履歴",
      changeLog: `<p>追加点</p>
<ul>
  <li>不要なフォルダを自動で削除する機能を追加</li>
</ul>
<p>変更点</p>
<ul>
  <li>未選択や未分類の項目のIDのランダム文字列の長さを16文字から32文字に変更</li>
  <li>ポップアップUIの中央表示のスタイルを改善</li>
  <li>svgのデザインを変更</li>
  <li>処理済みの要素を判別するclass名にプレフィックスを追加</li>
  <li>スクリプトや作者についての情報を更新</li>
</ul>
<p>修正点</p>
<ul>
  <li>ブックマーク解除時にブックマーク編集UIが表示されていないとスクリプトからポストのデータが削除されなかったのを修正</li>
  <li>フォルダー編集テキストボックスを空にしてフォルダーから削除するとき、更新ボタンのフィードバックがなかったのを修正</li>
  <li>スクリプトのイベントがポストの翻訳ボタンのイベントと干渉して、翻訳機能が使えなくなっていたのを修正</li>
  <li>既存のフォルダーを選択するセレクトボックスで未選択の項目のマークが正しく表示されない場合があるのを修正</li>
  <li>インポート・エクスポートのテキストボックスがスクロールできなかったのを修正</li>
</ul>`,
      showPastChanges: `過去の変更履歴は<a href="https://github.com/nashikinako/XBookmarksOrganizer/releases" target="_blank" rel="noopener noreferrer">GitHubのリリースページ</a>をご覧ください。`,
      setting: "設定",
      language: "言語：",
      langEn: "英語 - English",
      langJa: "日本語",
      importExport: "インポート・エクスポート",
      export: "エクスポート",
      exportTextarea: "ここにJSON形式でエクスポートされます。",
      importMarge: "インポートして統合",
      importOverwrite: "インポートして上書き",
      importTextarea: "ここにJSON形式で貼り付けてインポートします。",
      reset: "リセット",
      deleteAllFolders: "全フォルダーを削除",
      confirmImportOverwrite: "インポートして上書きしますか？",
      confirmDeleteAllFolders: "全フォルダーを削除しますか？",
      foldersList: "フォルダー一覧",
      editFolders: "フォルダーを編集",
      finishEditing: "編集を終了",
      confirmDiscardChanges:
        "フォルダー名を編集中のフォルダーがあります。変更を破棄しますか？",
      confirmMargeFolders: "同名のフォルダーが存在します。統合しますか？",
      confirmDeleteFolder: "フォルダーを削除しますか？",
      updateFolder: "更新",
      save: "保存",
      yes: "はい",
      no: "いいえ",
      uncategorized: "未分類",
      aboutThisScript: "このスクリプトについて",
      relatedLinks: "関連リンク",
      author: `<p class="xbo-UI_categoryTitle">作者</p>
<ul>
<li>なしきなこ</li>
<li>X: <a href="https://x.com/nashikinako" target="_blank" rel="noopener noreferrer">@nashikinako</a></li>
<li>YouTube: <a href="https://www.youtube.com/@nashikinako" target="_blank" rel="noopener noreferrer">@nashikinako</a></li>
<li>なしきなこ Website: <a href="https://nashikinako.com" target="_blank" rel="noopener noreferrer">https://nashikinako.com</a></li></ul>`,
      license: `<p class="xbo-UI_categoryTitle">ライセンス</p><a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MITライセンス</a>`,
      settingOpen: "X Bookmarks Organizerの設定を開く",
      cleanFolders: "フォルダーを掃除",
      confirmCleanFolders:
        "不要なフォルダーを掃除しますか？処理開始後は中断できません！",
      cleaningFoldersMsg: "フォルダーを掃除中...",
      cleaningCompletedMsg: "フォルダーの掃除が完了しました。",
      addedToFolder: "フォルダに追加しました",
    },
  };
  const i18n =
    GM_getValue("lang", "auto") === "auto"
      ? i18nLib[$("html").attr("lang")] || i18nLib.en
      : i18nLib[GM_getValue("lang")];

  // ブックマークフォルダーの情報を取得する
  let bookmarksInfo = GM_getValue("bookmarksInfo", []);

  // すべてのフォルダー一覧を取得する
  let allFolders = [...new Set(bookmarksInfo.flatMap((post) => post.folders))];
  // フォルダー内の投稿数が多い順にソート
  allFolders.sort((a, b) => {
    return (
      bookmarksInfo.filter((post) => post.folders.includes(b)).length -
      bookmarksInfo.filter((post) => post.folders.includes(a)).length
    );
  });

  // 選択されたフォルダー
  let selectedFolder;
  // 一番最後にブックマークしたポストのID
  let lastBookmarkedPostID;
  // フォルダの掃除中かどうか
  let isCleaning = false;
  // 現在ブックマークされているポストのID
  let allBookmarkedPosts = [];
  // すべてのブックマークされたポストが取得されたかを確認するinterval
  let checkGotAllPostsInterval;
  // チェックが完了しているとみられた回数
  let checkedCount = 0;

  // 「未分類」のoption要素の値
  const uncategorizedFolderID = generateRandomStrings(32);
  // 「未選択」のoption要素の値
  const unselectedOptionValue = generateRandomStrings(32);

  // body要素を監視対象ノードとする
  const targetNode = document.querySelector("body");
  // MutationObserverの設定
  const config = { childList: true, subtree: true };

  // ユーザースクリプトが追加するUIのスタイルを設定
  $("head").append(
    $(`<style>.cls-6374f8d9b67f094e4896c636-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}
.cls-6374f8d9b67f094e4896c62d-1{fill:currentColor;stroke:currentColor;stroke-miterlimit:10;}
.cls-6374f8d9b67f094e4896c631-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}
.xbo-UI_bgs{
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}
#xbo-settingUI, #xbo-updateInfo, #xbo-firstRunInfo, #xbo-aboutUI {
  box-sizing: border-box;
  width: 50%;
  height: 70%;
  padding: 15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  border-radius: 10px;
  overflow: hidden;
  padding: 0;
}
#xbo-settingUI > div, #xbo-updateInfo > div, #xbo-firstRunInfo > div, #xbo-aboutUI > div{
  overflow-y: scroll;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
}
.xbo-UI * {
  margin: 0;
}
#xbo-settingUI button{
  cursor: pointer;
  padding: 3px;
  border-radius: 5px;
}
#xbo-bookmarkFolderPopupSaveBtn{
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  cursor: pointer;
}
#xbo-langSelect{
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}
#xbo-langChangeBtn{
  width: 20px;
  cursor: pointer;
  margin-left: 10px;
  vertical-align: -6px;
  fill: currentColor;
}
#xbo-exportBtn, #xbo-importMargeBtn, #xbo-importOverwriteBtn{
  margin-bottom: 5px;
  margin-right: 5px;
}
#xbo-settingUI textarea{
  width: 100%;
  height: 70px;
  resize: none;
  margin-bottom: 4px;
  border-radius: 5px;
  box-sizing: border-box;
}
p:has(#xbo-openAboutUI){
  margin-top: 12px;
}
#xbo-openAboutUI{
  text-decoration: underline;
  cursor: pointer;
}
.xbo-closeBtns{
  width: 25px;
  height: 25px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  padding: 5px;
  border-radius: 9999px;
}
.xbo-UI_title{
  font-size: 25px;
  font-weight: bold;
}
.xbo-UI_categoryTitle{
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px !important;
}
#xbo-confirmDialog, #xbo-bookmarkFolderPopup{
  width: 50%;
  height: 30%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  border-radius: 10px;
}
#xbo-confirmDialog p {
  margin: 10px;
  font-size: 20px;
}
#xbo-yesBtn{
  cursor: pointer;
  padding: 9px;
  margin: 0 10px;
  border-radius: 5px;
  color: #fff;
}
#xbo-noBtn{
  cursor: pointer;
  padding: 10px;
  margin: 0 10px;
  border-radius: 5px;
  color: #fff;
}
#xbo-folderSelectionUI{
  padding: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
#xbo-showAllFoldersBtn{
  width: 17px;
  cursor: pointer;
  padding: 8px;
  border-radius: 9999px;
}
.xbo-folderElm{
  user-select: none;
  padding: 5px 18px 5px 18px;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  position: relative;
}
.xbo-folderElm.xbo-selected{
  padding: 5px 26px 5px 10px;
}
.xbo-folderElm svg{
  fill: currentColor;
  width: 12px;
  position: absolute;
  top: 8px;
  right: 8px;
}
#xbo-allFoldersUI{
  box-sizing: border-box;
  width: 40%;
  height: 60%;
  padding: 15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  border-radius: 10px;
  overflow: hidden;
}
#xbo-folderEditBtn{
  text-decoration: underline;
  cursor: pointer;
  margin-top: 10px;
  display: block;
  float: right;
}
#xbo-folderCleanBtn{
  text-decoration: underline;
  cursor: pointer;
  margin-top: 10px;
  display: block;
  float: right;
  margin-right: 15px;
}
#xbo-allFoldersList{
  overflow-y: scroll;
  height: 85%;
  margin: 0 -15px;
}
.xbo-folderListElm{
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  margin: 0 10px !important;
}
.xbo-rightBtns{
  float: right;
  display: none;
}
.xbo-folderNameEditBtn{
  cursor: pointer;
  width: 25px;
  fill: currentColor;
  margin-right: 5px;
}
.xbo-folderDeleteBtn{
  cursor: pointer;
  width: 21px;
  fill: currentColor;
}
.xbo-folderNameInput{
  font-size: 20px;
  width: 74%;
  height: 32px;
  margin: -6px 0 !important;
}
.xbo-bookmarkFolderEdit{
  border-radius: 10px;
  cursor: default;
  display: none;
  background: rgba(29, 155, 240, 0.5);
  width: 100%;
  padding: 5px;
  margin: 10px;
  box-sizing: border-box;
}
.xbo-bookmarkFolderInput{
  width: 70%;
  padding: 5px;
  font-size: 16px;
  margin-right: 2%;
  vertical-align: 1px;
  border-radius: 5px;
}
.xbo-bookmarkFolderEdit select{
  width: 10%;
  padding: 6px 0;
  font-size: 12px;
  vertical-align: 2px;
  border-radius: 5px;
  cursor: pointer;
}
.xbo-updateBtn{
  width: 12%;
  padding: 5px;
  font-size: 12px;
  margin-left: 2%;
  vertical-align: 2px;
  cursor: pointer;
  border-radius: 5px;
  text-align: center;
}
.xbo-folderEditCloseBtn{
  border: 2px solid #a3a3a3;
  display: none;
  width: 15px;
  padding: 9px;
  vertical-align: -23px;
  border-radius: 5px;
  margin-right: 2%;
  margin-bottom: 10px;
  cursor: pointer;
}
.xbo-fixed-msg{
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%,0);
  background: rgb(29, 155, 240);
  color: #fff;
  padding: 10px;
  border-radius: 10px;
  z-index: 9999;
}
@media screen and (max-width: 999px){
  #xbo-settingUI, #xbo-updateInfo, #xbo-firstRunInfo, #xbo-aboutUI, #xbo-allFoldersUI, #xbo-confirmDialog, #xbo-bookmarkFolderPopup{
    width: 70%;
  }
}
@media screen and (max-width: 599px){
  #xbo-settingUI, #xbo-updateInfo, #xbo-firstRunInfo, #xbo-aboutUI, #xbo-allFoldersUI, #xbo-confirmDialog, #xbo-bookmarkFolderPopup{
    width: 90%;
  }
  .xbo-bookmarkFolderInput{
    width: 76%;
    padding: 10px 5px;
    margin-right: 3%;
  }
  .xbo-bookmarkFolderEdit select{
    width: 15%;
    padding: 11px 0;
    font-size: 12px;
  }
  .xbo-updateBtn{
    padding: 10px 5px;
    margin-left: 3%;
    width: 18%;
  }
  .xbo-folderEditCloseBtn{
    display: inline-block;
  }
  #xbo-bookmarkFolderPopupCloseBtn{
    top: unset;
    bottom: 10px;
  }
}
@media screen and (max-height: 749px){
  #xbo-allFoldersList{
    height: 78%;
  }
}</style>`)
  );

  const svgCodeLib = {
    xMark: `<path d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z"/>`,
    save: `<path d="M14 3h2.997v5h-2.997v-5zm9 1v20h-22v-24h17.997l4.003 4zm-17 5h12v-7h-12v7zm14 4h-16v9h16v-9z"/>`,
    gear: `<path class="cls-6374f8d9b67f094e4896c636-1" d="M20.59,12a8.12,8.12,0,0,0-.15-1.57l2.09-1.2-2.87-5-2.08,1.2a8.65,8.65,0,0,0-2.72-1.56V1.5H9.14V3.91A8.65,8.65,0,0,0,6.42,5.47L4.34,4.27l-2.87,5,2.09,1.2a8.29,8.29,0,0,0,0,3.14l-2.09,1.2,2.87,5,2.08-1.2a8.65,8.65,0,0,0,2.72,1.56V22.5h5.72V20.09a8.65,8.65,0,0,0,2.72-1.56l2.08,1.2,2.87-5-2.09-1.2A8.12,8.12,0,0,0,20.59,12Z"></path><circle class="cls-6374f8d9b67f094e4896c636-1" cx="12" cy="12" r="3.82"></circle>`,
    dots: `<circle class="cls-6374f8d9b67f094e4896c62d-1" cx="3.41" cy="12" r="1.91"></circle><circle class="cls-6374f8d9b67f094e4896c62d-1" cx="12" cy="12" r="1.91"></circle><circle class="cls-6374f8d9b67f094e4896c62d-1" cx="20.59" cy="12" r="1.91"></circle>`,
    edit: `<polyline class="cls-6374f8d9b67f094e4896c631-1" points="20.59 12 20.59 22.5 1.5 22.5 1.5 3.41 12.96 3.41"></polyline><path class="cls-6374f8d9b67f094e4896c631-1" d="M12,15.82l-4.77.95L8.18,12l9.71-9.71A2.69,2.69,0,0,1,19.8,1.5h0a2.7,2.7,0,0,1,2.7,2.7h0a2.69,2.69,0,0,1-.79,1.91Z"></path>`,
  };

  let cachedBodyBg;
  $("head").append($(`<style id="xbo-themeColor"></style>`));
  const updateColor = () => {
    let cssColorLib;
    switch ($("body").css("background-color")) {
      case "rgb(255, 255, 255)":
        cssColorLib = {
          btnInput: { border: "#b7b7b7", bg: "#dddddd", color: "#000" },
          btnHover: "#bdbdbd",
          textarea: { border: "#b7b7b7", bg: "#dddddd", color: "#000" },
          yesBtn: { bg: "#db2626", border: "#000" },
          yesBtnHover: "#c70000",
          noBtn: { bg: "#008d2c", border: "#000" },
          noBtnHover: "#006b21",
          overUIBtn: "#000",
          overUIBtnHover: "rgb(0 0 0 / 10%)",
          folderListElmHover: "rgba(0, 0, 0, 0.4)",
          folderElm: { bg: "#dddddd", color: "#000" },
          folderElmSelected: "rgb(89 188 255)",
          UI_bgs: "rgba(0, 0, 0, 0.8)",
          UI: { bg: "#ffffff", color: "#000000" },
        };
        break;
      case "rgb(0, 0, 0)":
        cssColorLib = {
          btnInput: { border: "#a3a3a3", bg: "#2f2f2f", color: "#fff" },
          btnHover: "#6d6d6d",
          textarea: { border: "#a3a3a3", bg: "#2f2f2f", color: "#fff" },
          yesBtn: { bg: "#c70000", border: "#ffffff" },
          yesBtnHover: "#db2626",
          noBtn: { bg: "#006b21", border: "#ffffff" },
          noBtnHover: "#008d2c",
          overUIBtn: "#fff",
          overUIBtnHover: "rgb(255 255 255 / 10%)",
          folderListElmHover: "rgba(255, 255, 255, 0.4)",
          folderElm: { bg: "#555555", color: "#fff" },
          folderElmSelected: "rgb(29, 155, 240)",
          UI_bgs: "rgba(255, 255, 255, 0.4)",
          UI: { bg: "#000000", color: "#ffffff" },
        };
        break;
      case "rgb(21, 32, 43)":
        cssColorLib = {
          btnInput: { border: "#a3a3a3", bg: "#2f2f2f", color: "#fff" },
          btnHover: "#6d6d6d",
          textarea: { border: "#a3a3a3", bg: "#2f2f2f", color: "#fff" },
          yesBtn: { bg: "#c70000", border: "#ffffff" },
          yesBtnHover: "#db2626",
          noBtn: { bg: "#006b21", border: "#ffffff" },
          noBtnHover: "#008d2c",
          overUIBtn: "#fff",
          overUIBtnHover: "rgb(255 255 255 / 10%)",
          folderListElmHover: "rgba(255, 255, 255, 0.4)",
          folderElm: { bg: "#555555", color: "#fff" },
          folderElmSelected: "rgb(29, 155, 240)",
          UI_bgs: "rgba(255, 255, 255, 0.4)",
          UI: { bg: "rgb(21, 32, 43)", color: "#ffffff" },
        };
        break;
    }
    $("#xbo-themeColor")
      .text(`#xbo-settingUI button, #xbo-langSelect, .xbo-folderNameInput, .xbo-bookmarkFolderInput, .xbo-bookmarkFolderEdit select, .xbo-updateBtn, #xbo-bookmarkFolderPopupSaveBtn{
  border: 2px solid ${cssColorLib.btnInput.border};
  background: ${cssColorLib.btnInput.bg};
  color: ${cssColorLib.btnInput.color};
}
.xbo-folderEditCloseBtn{
  border: 2px solid ${cssColorLib.btnInput.border};
  background: ${cssColorLib.btnInput.bg};
  fill: ${cssColorLib.btnInput.color};
}
#xbo-settingUI button:hover, .xbo-updateBtn:hover, .xbo-folderEditCloseBtn:hover, #xbo-bookmarkFolderPopupSaveBtn:hover{
  background: ${cssColorLib.btnHover};
}
#xbo-settingUI textarea{
  border: 2px solid ${cssColorLib.textarea.border};
  background: ${cssColorLib.textarea.bg};
  color: ${cssColorLib.textarea.color};
}
#xbo-yesBtn{
  background: ${cssColorLib.yesBtn.bg};
  border: 2px solid ${cssColorLib.yesBtn.border};
}
#xbo-yesBtn:hover{
  background: ${cssColorLib.yesBtnHover};
}
#xbo-noBtn{
  background: ${cssColorLib.noBtn.bg};
  border: 2px solid ${cssColorLib.noBtn.border};
}
#xbo-noBtn:hover{
  background: ${cssColorLib.noBtnHover};
}
#xbo-showAllFoldersBtn, .xbo-closeBtns{
  fill: ${cssColorLib.overUIBtn};
}
#xbo-settingBtn:hover, #xbo-showAllFoldersBtn:hover, .xbo-closeBtns:hover{
  background: ${cssColorLib.overUIBtnHover};
}
.xbo-folderListElm:hover{
  background: ${cssColorLib.folderListElmHover};
}
.xbo-folderElm{
  background: ${cssColorLib.folderElm.bg};
  color: ${cssColorLib.folderElm.color};
}
.xbo-folderElm.xbo-selected{
  background: ${cssColorLib.folderElmSelected};
}
.xbo-UI_bgs{
  background: ${cssColorLib.UI_bgs};
}
.xbo-UI{
  background: ${cssColorLib.UI.bg};
  color: ${cssColorLib.UI.color};
}`);
  };

  // MutationObserverのコールバック関数
  const MOCallback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      // 子ノードの変更のみを対象とする
      if (mutation.type !== "childList") {
        continue;
      }
      if (cachedBodyBg !== $("body").css("background-color")) {
        updateColor();
        cachedBodyBg = $("body").css("background-color");
      }
      // ブックマークページの場合
      if (location.pathname === "/i/bookmarks") {
        // フォルダー選択UIが既に追加されていない場合、フォルダー選択UIを追加する
        if ($("#xbo-folderSelectionUI").length === 0) {
          // フォルダー選択UIを追加
          $("article:has('time'):nth-child(1)")
            .parent()
            .parent()
            .parent()
            .parent()
            .parent()
            .before($(`<div id="xbo-folderSelectionUI"></div>`));
          $("#xbo-folderSelectionUI").append(
            $(
              `<div class="xbo-folderElm" data-folder="${uncategorizedFolderID}">${i18n["uncategorized"]}</div>`
            )
          );
          allFolders.slice(0, 10).forEach((folder) => {
            $("#xbo-folderSelectionUI").append(
              $(
                `<div class="xbo-folderElm" data-folder="${folder}">${folder}</div>`
              )
            );
          });
          $("#xbo-folderSelectionUI").append(
            $(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" id="xbo-showAllFoldersBtn">${svgCodeLib["dots"]}</svg>`
            )
          );
        }
        // フォルダー選択UIの各フォルダーボタンをクリックしたとき
        $(".xbo-folderElm:not(.xbo-eventAdded)").each(function (index, elm) {
          $(elm).addClass("xbo-eventAdded");
          $(elm).on("click", function () {
            if ($(elm).hasClass("xbo-selected")) {
              $(".xbo-folderTemp").remove();
              $(elm).removeClass("xbo-selected");
              $(elm).find(".xbo-deselectionSvg").remove();
              return;
            }
            $(".xbo-selected").removeClass("xbo-selected");
            $(".xbo-folderTemp").remove();
            $(".xbo-folderElm").find(".xbo-deselectionSvg").remove();
            $(elm).addClass("xbo-selected");
            $(elm).append(
              $(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg>`
              )
            );
          });
        });
        // フォルダー選択UIの「…」ボタンをクリックしたとき
        $("#xbo-showAllFoldersBtn:not(.xbo-eventAdded)").on(
          "click",
          function () {
            $("#react-root").append(
              $(`<div id="xbo-allFoldersUI_bg" class="xbo-UI_bgs">
  <div id="xbo-allFoldersUI" class="xbo-UI">
    <p class="xbo-UI_title">${i18n["foldersList"]}</p>
    <div id="xbo-allFoldersList"><div><div class="xbo-folderListElm" data-folder="${uncategorizedFolderID}">${i18n["uncategorized"]}</div></div></div>
    <p id="xbo-folderEditBtn">${i18n["editFolders"]}</p><p id="xbo-folderCleanBtn">${i18n["cleanFolders"]}</p>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-allFoldersUICloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div>
</div>`)
            );
            scrollLock(true);
            $("#xbo-allFoldersUI_bg").on("click", function () {
              // もしフォルダー名が編集中の項目があれば、変更を破棄するか確認する
              if ($(".xbo-folderNameInput").length !== 0) {
                showConfirmDialog(i18n["confirmDiscardChanges"], () => {
                  $("#xbo-allFoldersUI_bg").remove();
                  scrollLock(false);
                });
              } else {
                $("#xbo-allFoldersUI_bg").remove();
                scrollLock(false);
              }
            });
            $("#xbo-allFoldersUI").on("click", function (e) {
              e.stopPropagation();
            });
            $("#xbo-allFoldersList")
              .on("wheel", function (e) {
                if (
                  document.querySelector("#xbo-allFoldersList").clientHeight <
                  document.querySelector("#xbo-allFoldersList > div")
                    .clientHeight
                ) {
                  e.stopPropagation();
                }
              })
              .on("touchmove", function (e) {
                if (
                  document.querySelector("#xbo-allFoldersList").clientHeight <
                  document.querySelector("#xbo-allFoldersList > div")
                    .clientHeight
                ) {
                  e.stopPropagation();
                }
              });
            allFolders.forEach((folder) => {
              $("#xbo-allFoldersList > div").append(
                $(
                  `<div class="xbo-folderListElm" data-folder="${folder}"><span class="xbo-folderName">${folder}</span>
  <div class="xbo-rightBtns">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" class="xbo-folderNameEditBtn">
      ${svgCodeLib["edit"]}
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" class="xbo-folderDeleteBtn">
      <defs><style>.cls-6374f8d9b67f094e4896c66b-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><path class="cls-6374f8d9b67f094e4896c66b-1" d="M16.88,22.5H7.12a1.9,1.9,0,0,1-1.9-1.8L4.36,5.32H19.64L18.78,20.7A1.9,1.9,0,0,1,16.88,22.5Z"></path><line class="cls-6374f8d9b67f094e4896c66b-1" x1="2.45" y1="5.32" x2="21.55" y2="5.32"></line><path class="cls-6374f8d9b67f094e4896c66b-1" d="M10.09,1.5h3.82a1.91,1.91,0,0,1,1.91,1.91V5.32a0,0,0,0,1,0,0H8.18a0,0,0,0,1,0,0V3.41A1.91,1.91,0,0,1,10.09,1.5Z"></path><line class="cls-6374f8d9b67f094e4896c66b-1" x1="12" y1="8.18" x2="12" y2="19.64"></line><line class="cls-6374f8d9b67f094e4896c66b-1" x1="15.82" y1="8.18" x2="15.82" y2="19.64"></line><line class="cls-6374f8d9b67f094e4896c66b-1" x1="8.18" y1="8.18" x2="8.18" y2="19.64"></line>
    </svg>
  </div>
</div>`
                )
              );
            });
            $("#xbo-folderEditBtn").on("click", function () {
              if ($("#xbo-folderEditBtn").text() === i18n["finishEditing"]) {
                // もしフォルダー名が編集中の項目があれば、変更を破棄するか確認する
                if ($(".xbo-folderNameInput").length !== 0) {
                  showConfirmDialog(i18n["confirmDiscardChanges"], () => {
                    $(".xbo-folderNameInput").each(function (index, elm) {
                      $(elm).replaceWith(
                        $(
                          `<span class="xbo-folderName">${$(elm)
                            .parent()
                            .attr("data-folder")}</span>`
                        )
                      );
                    });
                    // 編集ボタンを元の状態に戻す
                    $(".xbo-folderNameEditing").html(svgCodeLib["edit"]);
                    $(".xbo-folderNameEditing").removeClass(
                      "xbo-folderNameEditing"
                    );
                    $(".xbo-folderListElm").css("cursor", "pointer");
                    $(".xbo-rightBtns").css("display", "none");
                    $("#xbo-folderEditBtn").text(i18n["editFolders"]);
                    $("#xbo-folderCleanBtn").css("display", "block");
                  });
                  return;
                }
                $(".xbo-folderListElm").css("cursor", "pointer");
                $(".xbo-rightBtns").css("display", "none");
                $("#xbo-folderEditBtn").text(i18n["editFolders"]);
                $("#xbo-folderCleanBtn").css("display", "block");
                return;
              }
              $(".xbo-folderListElm").css("cursor", "auto");
              $(".xbo-rightBtns").css("display", "block");
              $("#xbo-folderEditBtn").text(i18n["finishEditing"]);
              $("#xbo-folderCleanBtn").css("display", "none");
            });
            $("#xbo-folderCleanBtn").on("click", function () {
              showConfirmDialog(i18n["confirmCleanFolders"], () => {
                // フォルダー一覧UIを削除する
                $("#xbo-allFoldersUI_bg").remove();
                allBookmarkedPosts = [];
                checkedCount = 0;
                $("article.xbo-gotID:has('time')").each(function (index, elm) {
                  $(elm).removeClass("xbo-gotID");
                });
                $("#react-root").append(
                  $(
                    `<div class="xbo-UI_bgs" id="xbo-cleaningBg"></div><div class="xbo-fixed-msg">${i18n["cleaningFoldersMsg"]}</div>`
                  )
                );
                isCleaning = true;
                let cachedMinHeight;
                checkGotAllPostsInterval = setInterval(() => {
                  if (
                    $("article:has('time'):nth-child(1)")
                      .parent()
                      .parent()
                      .parent()
                      .parent()
                      .css("min-height") === cachedMinHeight
                  ) {
                    checkedCount += 1;
                    cachedMinHeight = $("article:has('time'):nth-child(1)")
                      .parent()
                      .parent()
                      .parent()
                      .parent()
                      .css("min-height");
                    if (checkedCount > 10) {
                      clearInterval(checkGotAllPostsInterval);
                      // もしブックマークフォルダ情報に保存されているポストのIDで現在そのポストがブックマークされていない場合は、そのフォルダー情報を削除する
                      bookmarksInfo = bookmarksInfo.filter((post) =>
                        allBookmarkedPosts.includes(post.id)
                      );
                      updateAllFolders();
                      GM_setValue("bookmarksInfo", bookmarksInfo);
                      $(".xbo-fixed-msg").text(i18n["cleaningCompletedMsg"]);
                      setTimeout(() => {
                        $(".xbo-fixed-msg").remove();
                      }, 6000);
                      $("#xbo-cleaningBg").remove();
                      scrollLock(false);
                      isCleaning = false;
                    }
                  } else {
                    cachedMinHeight = $("article:has('time'):nth-child(1)")
                      .parent()
                      .parent()
                      .parent()
                      .parent()
                      .css("min-height");
                    checkedCount = 0;
                  }
                }, 400);
              });
            });
            $(".xbo-folderListElm").each(function (index, elm) {
              $(elm).on("click", function () {
                if ($("#xbo-folderEditBtn").text() === i18n["finishEditing"]) {
                  return;
                }
                selectedFolder = $(elm).attr("data-folder");
                // フォルダーが選択されたとき、通常のフォルダーボタンも選択状態にする
                $(".xbo-selected").removeClass("xbo-selected");
                $(".xbo-folderTemp").remove();
                $(".xbo-folderElm").find(".xbo-deselectionSvg").remove();
                // すでにボタンがある場合はそのボタンを変更し、ない場合はボタンのリストに新規追加する
                if (
                  $(`.xbo-folderElm[data-folder="${selectedFolder}"]`)
                    .length === 0
                ) {
                  $("#xbo-showAllFoldersBtn").before(
                    $(
                      `<div class="xbo-folderElm xbo-folderTemp" data-folder="${selectedFolder}">${selectedFolder}</div>`
                    )
                  );
                }
                $(`.xbo-folderElm[data-folder="${selectedFolder}"]`).addClass(
                  "xbo-selected"
                );
                $(`.xbo-folderElm[data-folder="${selectedFolder}"]`).append(
                  $(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">
  ${svgCodeLib["xMark"]}
</svg>`)
                );
                $("#xbo-allFoldersUI_bg").remove();
                scrollLock(false);
              });

              $(elm)
                .find(".xbo-folderNameEditBtn")
                .on("click", function (e) {
                  e.stopPropagation();
                  if (
                    $(elm)
                      .find(".xbo-folderNameEditBtn")
                      .hasClass("xbo-folderNameEditing")
                  ) {
                    $(elm)
                      .find(".xbo-folderNameEditBtn")
                      .removeClass("xbo-folderNameEditing");
                    $(elm)
                      .find(".xbo-folderNameEditBtn")
                      .html(`${svgCodeLib["edit"]}`);
                    // すでに同名のフォルダーが存在する場合は統合するかどうか確認する
                    if (
                      $(elm).find(".xbo-folderNameInput").val() !== "" &&
                      allFolders.includes(
                        $(elm).find(".xbo-folderNameInput").val()
                      ) &&
                      $(elm).attr("data-folder") !==
                        $(elm).find(".xbo-folderNameInput").val()
                    ) {
                      showConfirmDialog(i18n["confirmMargeFolders"], () => {
                        if ($(elm).attr("data-folder") === selectedFolder) {
                          selectedFolder = $(elm)
                            .find(".xbo-folderNameInput")
                            .val();
                        }
                        const targetFolder = $(elm)
                          .find(".xbo-folderNameInput")
                          .val();
                        const originalFolder = $(elm).attr("data-folder");
                        const hasMorePostThanTargetFolder =
                          bookmarksInfo.filter((post) =>
                            post.folders.includes(targetFolder)
                          ).length <
                          bookmarksInfo.filter((post) =>
                            post.folders.includes(originalFolder)
                          ).length;
                        bookmarksInfo.forEach((post) => {
                          if (post.folders.includes(originalFolder)) {
                            post.folders = post.folders.filter(
                              (folder) => folder !== originalFolder
                            );
                            if (!post.folders.includes(targetFolder)) {
                              post.folders.push(targetFolder);
                            }
                          }
                        });
                        // 統合先フォルダーの方が件数が少ない場合は統合先フォルダーの要素を削除する
                        // そうでない場合は統合元フォルダーの要素を削除する
                        if (hasMorePostThanTargetFolder) {
                          $(
                            `.xbo-folderListElm[data-folder="${targetFolder}"]`
                          ).remove();
                          $(elm)
                            .find(".xbo-folderNameInput")
                            .replaceWith(
                              $(
                                `<span class="xbo-folderName">${targetFolder}</span>`
                              )
                            );
                        } else {
                          $(elm).remove();
                        }
                        updateAllFolders();
                        GM_setValue("bookmarksInfo", bookmarksInfo);
                      });
                    } else if (
                      $(elm).find(".xbo-folderNameInput").val() !== "" &&
                      $(elm).attr("data-folder") !==
                        $(elm).find(".xbo-folderNameInput").val()
                    ) {
                      if ($(elm).attr("data-folder") === selectedFolder) {
                        selectedFolder = $(elm)
                          .find(".xbo-folderNameInput")
                          .val();
                      }
                      bookmarksInfo.forEach((post) => {
                        if (post.folders.includes($(elm).attr("data-folder"))) {
                          post.folders = post.folders.filter(
                            (folder) => folder !== $(elm).attr("data-folder")
                          );
                          post.folders.push(
                            $(elm).find(".xbo-folderNameInput").val()
                          );
                        }
                      });
                      $(elm)
                        .find(".xbo-folderNameInput")
                        .replaceWith(
                          $(
                            `<span class="xbo-folderName">${$(elm)
                              .find(".xbo-folderNameInput")
                              .val()}</span>`
                          )
                        );
                      updateAllFolders();
                      GM_setValue("bookmarksInfo", bookmarksInfo);
                      // data-folder属性を変更
                      $(elm).attr(
                        "data-folder",
                        $(elm).find(".xbo-folderNameInput").val()
                      );
                      $(elm)
                        .find(".xbo-folderNameInput")
                        .replaceWith(
                          $(
                            `<span class="xbo-folderName">${$(elm)
                              .find(".xbo-folderNameInput")
                              .val()}</span>`
                          )
                        );
                    } else {
                      $(elm)
                        .find(".xbo-folderNameInput")
                        .replaceWith(
                          $(
                            `<span class="xbo-folderName">${$(elm).attr(
                              "data-folder"
                            )}</span>`
                          )
                        );
                    }
                    return;
                  }
                  $(elm)
                    .find(".xbo-folderNameEditBtn")
                    .addClass("xbo-folderNameEditing");
                  const folderName = $(elm).find(".xbo-folderName").text();
                  $(elm)
                    .find(".xbo-folderName")
                    .replaceWith(
                      $(
                        `<input class="xbo-folderNameInput" type="text" value="${folderName}">`
                      ).on("click", function (e) {
                        e.stopPropagation();
                      })
                    );
                  $(elm).find(".xbo-folderNameInput").focus();
                  $(elm)
                    .find(".xbo-folderNameEditBtn")
                    .html(`${svgCodeLib["save"]}`);
                });
              $(elm)
                .find(".xbo-folderDeleteBtn")
                .on("click", function (e) {
                  e.stopPropagation();
                  showConfirmDialog(i18n["confirmDeleteFolder"], () => {
                    if ($(elm).attr("data-folder") === selectedFolder) {
                      selectedFolder = undefined;
                    }
                    const targetFolder = $(elm).attr("data-folder");
                    bookmarksInfo.forEach((post) => {
                      if (post.folders.includes(targetFolder)) {
                        post.folders = post.folders.filter(
                          (folder) => folder !== targetFolder
                        );
                      }
                    });
                    // フォルダーが一個もないポストはデータを削除する
                    bookmarksInfo = bookmarksInfo.filter(
                      (post) => post.folders.length !== 0
                    );
                    // リストの要素を削除
                    $(elm).remove();
                    updateAllFolders();
                    GM_setValue("bookmarksInfo", bookmarksInfo);
                  });
                });
            });
            $("#xbo-allFoldersUICloseBtn").on("click", function () {
              // もしフォルダー名が編集中の項目があれば、変更を破棄するか確認する
              if ($(".xbo-folderNameInput").length !== 0) {
                showConfirmDialog(i18n["confirmDiscardChanges"], () => {
                  $("#xbo-allFoldersUI_bg").remove();
                  scrollLock(false);
                });
              } else {
                $("#xbo-allFoldersUI_bg").remove();
                scrollLock(false);
              }
            });
          }
        );
        $("#xbo-showAllFoldersBtn:not(.xbo-eventAdded)").addClass(
          "xbo-eventAdded"
        );

        if (isCleaning) {
          // 現在ブックマークされているすべての投稿を取得する
          $("article:has('time'):not(.xbo-gotID)").each(function (
            index,
            timeElm
          ) {
            $(timeElm).addClass("xbo-gotID");
            if (
              $(timeElm).parent().parent().parent().css("display") !== "none"
            ) {
              $(timeElm).parent().parent().parent().css("display", "none");
            }
            allBookmarkedPosts.push(
              $(timeElm).find("time").parent().attr("href").split("/")[3]
            );
          });
        } else {
          selectedFolder = $(".xbo-selected").attr("data-folder");
          if (selectedFolder !== undefined) {
            let posts = [];
            if (selectedFolder === uncategorizedFolderID) {
              bookmarksInfo.forEach((post) => {
                posts.push(post.id);
              });
              $("article:has('time')").each(function (index, timeElm) {
                if (
                  posts.includes(
                    $(timeElm).find("time").parent().attr("href").split("/")[3]
                  ) &&
                  $(timeElm).parent().parent().parent().css("display") !==
                    "none"
                ) {
                  $(timeElm).parent().parent().parent().css("display", "none");
                } else if (
                  !posts.includes(
                    $(timeElm).find("time").parent().attr("href").split("/")[3]
                  ) &&
                  $(timeElm).parent().parent().parent().css("display") ===
                    "none"
                ) {
                  $(timeElm).parent().parent().parent().css("display", "block");
                }
              });
            } else {
              bookmarksInfo.forEach((post) => {
                if (post.folders.includes(selectedFolder)) {
                  posts.push(post.id);
                }
              });
              $("article:has('time')").each(function (index, timeElm) {
                if (
                  !posts.includes(
                    $(timeElm).find("time").parent().attr("href").split("/")[3]
                  ) &&
                  $(timeElm).parent().parent().parent().css("display") !==
                    "none"
                ) {
                  $(timeElm).parent().parent().parent().css("display", "none");
                } else if (
                  posts.includes(
                    $(timeElm).find("time").parent().attr("href").split("/")[3]
                  ) &&
                  $(timeElm).parent().parent().parent().css("display") ===
                    "none"
                ) {
                  $(timeElm).parent().parent().parent().css("display", "block");
                }
              });
            }
          } else {
            $("article:has('time')").each(function (index, timeElm) {
              // 表示がnoneの場合は表示する
              if (
                $(timeElm).parent().parent().parent().css("display") === "none"
              ) {
                $(timeElm).parent().parent().parent().css("display", "block");
              }
            });
          }
        }
      }

      // 設定ページの場合
      if (location.pathname.includes("/settings")) {
        // ユーザースクリプトの設定画面を開くボタンが追加されていない場合、設定画面を開くボタンを追加する
        if ($("#xbo-settingBtn").length === 0) {
          $('a[href="https://support.x.com/"]')
            .clone(true)
            .attr("id", "xbo-settingBtn")
            .removeAttr("href")
            .insertBefore('a[href="https://support.x.com/"]');
          $("#xbo-settingBtn").find("span").text(i18n["settingOpen"]);
          $("#xbo-settingBtn")
            .find("svg")
            .attr("viewBox", "0 0 24 24")
            .attr("stroke-width", "1.5")
            .html(svgCodeLib["gear"]);
          $("#xbo-settingBtn").on("click", function (e) {
            e.stopPropagation();
            $("#react-root").append(
              $(`<div id="xbo-settingUI_bg" class="xbo-UI_bgs">
  <div id="xbo-settingUI" class="xbo-UI"><div><div>
    <p class="xbo-UI_title">${i18n["setting"]}</p>
    <p><label>${i18n["language"]}<select id="xbo-langSelect">
      <option value="auto">Auto</option>
      <option value="en">${i18n["langEn"]}</option>
      <option value="ja">${i18n["langJa"]}</option>
    </select></label><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" id="xbo-langChangeBtn">${svgCodeLib["save"]}</svg></p>
    <p class="xbo-UI_categoryTitle">${i18n["importExport"]}</p>
    <button id="xbo-exportBtn">${i18n["export"]}</button>
    <textarea id="xbo-exportTextarea" readonly placeholder="${i18n["exportTextarea"]}"></textarea>
    <button id="xbo-importMargeBtn">${i18n["importMarge"]}</button><button id="xbo-importOverwriteBtn">${i18n["importOverwrite"]}</button>
    <textarea id="xbo-importTextarea" placeholder="${i18n["importTextarea"]}"></textarea>
    <p class="xbo-UI_categoryTitle">${i18n["reset"]}</p>
    <p><button id="xbo-allFolderDeleteBtn">${i18n["deleteAllFolders"]}</button></p>
    <p>X Bookmarks Organizer ${GM_info.script.version} | <a id="xbo-openAboutUI">${i18n["aboutThisScript"]}</a></p>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-settingUICloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div></div></div>
</div>`)
            );
            scrollLock(true);
            $("#xbo-settingUI_bg").on("click", function () {
              scrollLock(false);
              $("#xbo-settingUI_bg").remove();
            });
            $("#xbo-settingUI").on("click", function (e) {
              e.stopPropagation();
            });
            $("#xbo-settingUI > div")
              .on("wheel", function (e) {
                if (
                  document.querySelector("#xbo-settingUI > div").clientHeight -
                    30 <
                  document.querySelector("#xbo-settingUI > div > div")
                    .clientHeight
                ) {
                  e.stopPropagation();
                }
              })
              .on("touchmove", function (e) {
                if (
                  document.querySelector("#xbo-settingUI > div").clientHeight -
                    30 <
                  document.querySelector("#xbo-settingUI > div > div")
                    .clientHeight
                ) {
                  e.stopPropagation();
                }
              });
            $("#xbo-exportTextarea, #xbo-importTextarea")
              .on("wheel", function (e) {
                e.stopPropagation();
              })
              .on("touchmove", function (e) {
                e.stopPropagation();
              });
            $("#xbo-langSelect").val(GM_getValue("lang", "auto"));
            $("#xbo-langChangeBtn").on("click", function () {
              GM_setValue("lang", $("#xbo-langSelect").val());
              location.reload();
            });
            $("#xbo-exportBtn").on("click", function () {
              $("#xbo-exportTextarea").val(JSON.stringify(bookmarksInfo));
            });
            $("#xbo-importMargeBtn").on("click", function () {
              if ($("#xbo-importTextarea").val() === "") {
                return;
              }
              const importedBookmarksInfo = JSON.parse(
                $("#xbo-importTextarea").val()
              );
              // すでに同じIDのポストが存在する場合はフォルダーを統合する。新規IDの場合はそのまま追加する
              importedBookmarksInfo.forEach((importedPost) => {
                if (
                  bookmarksInfo.find((post) => post.id === importedPost.id) !==
                  undefined
                ) {
                  bookmarksInfo.find(
                    (post) => post.id === importedPost.id
                  ).folders = [
                    ...new Set([
                      ...bookmarksInfo.find(
                        (post) => post.id === importedPost.id
                      ).folders,
                      ...importedPost.folders,
                    ]),
                  ];
                } else {
                  bookmarksInfo.push(importedPost);
                }
              });
              // フォルダーを更新
              updateAllFolders();
              GM_setValue("bookmarksInfo", bookmarksInfo);
            });
            $("#xbo-importOverwriteBtn").on("click", function () {
              if ($("#xbo-importTextarea").val() === "") {
                return;
              }
              showConfirmDialog(i18n["confirmImportOverwrite"], () => {
                selectedFolder = undefined;
                const importedBookmarksInfo = JSON.parse(
                  $("#xbo-importTextarea").val()
                );
                // BookmarksInfoを上書きする
                bookmarksInfo = importedBookmarksInfo;
                updateAllFolders();
                GM_setValue("bookmarksInfo", bookmarksInfo);
              });
            });
            $("#xbo-allFolderDeleteBtn").on("click", function () {
              showConfirmDialog(i18n["confirmDeleteAllFolders"], () => {
                selectedFolder = undefined;
                bookmarksInfo = [];
                updateAllFolders();
                GM_setValue("bookmarksInfo", bookmarksInfo);
              });
            });
            $("#xbo-openAboutUI").on("click", function () {
              $("#react-root").append(
                $(`<div id="xbo-aboutUI_bg" class="xbo-UI_bgs">
  <div id="xbo-aboutUI" class="xbo-UI">
    <div><div>
    <p class="xbo-UI_title">${i18n["aboutThisScript"]}</p>
    <p class="xbo-UI_categoryTitle">X Bookmarks Organizer ${GM_info.script.version}</p>
    <div>${i18n["firstRunBody"]}</div>
    <p class="xbo-UI_categoryTitle">${i18n["changeLogTitle"]}</p>
    <div>${i18n["changeLog"]}</div>
    <p>${i18n["showPastChanges"]}</p>
    <p class="xbo-UI_categoryTitle">${i18n["relatedLinks"]}</p>
    <p><a href="https://github.com/nashikinako/XBookmarksOrganizer" target="_blank" rel="noopener noreferrer">GitHub</a> | <a href="https://greasyfork.org/scripts/496107-x-bookmarks-organizer" target="_blank" rel="noopener noreferrer">GreasyFork</a></p>
    <div>${i18n["author"]}</div>
    <div>${i18n["license"]}</div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-aboutUICloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
    </div></div>
  </div>
</div>`)
              );
              $("#xbo-aboutUI_bg").on("click", function () {
                $("#xbo-aboutUI_bg").remove();
              });
              $("#xbo-aboutUI").on("click", function (e) {
                e.stopPropagation();
              });
              $("#xbo-aboutUI > div")
                .on("wheel", function (e) {
                  if (
                    document.querySelector("#xbo-aboutUI > div").clientHeight -
                      30 <
                    document.querySelector("#xbo-aboutUI > div > div")
                      .clientHeight
                  )
                    e.stopPropagation();
                })
                .on("touchmove", function (e) {
                  e.stopPropagation();
                });
              $("#xbo-aboutUICloseBtn").on("click", function () {
                $("#xbo-aboutUI_bg").remove();
              });
            });
            $("#xbo-settingUICloseBtn").on("click", function () {
              scrollLock(false);
              $("#xbo-settingUI_bg").remove();
            });
          });
        }
      }

      // 以下よりすべてのページに共通する処理
      // すでに処理済みの要素に対しては処理を行わない
      $(
        '[data-testid$="bookmark"]:not(.xbo-processed), [data-testid$="removeBookmark"]:not(.xbo-processed)'
      ).each(function (index, elm) {
        // 処理済みのクラスを追加
        $(elm).addClass("xbo-processed");
        const $bookmarkBtnParent = $(elm)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .parent();
        let postID;
        if (location.pathname.includes("/status")) {
          postID = location.pathname.split("/")[3];
        } else {
          postID = $(elm)
            .parent()
            .parent()
            .parent()
            .parent()
            .parent()
            .find("time")
            .parent()
            .attr("href")
            .split("/")[3];
        }
        $(elm).on("contextmenu", function (e) {
          e.preventDefault();
          if ($bookmarkBtnParent.find(".xbo-bookmarkFolderEdit").length !== 0) {
            if (
              $bookmarkBtnParent
                .find(".xbo-bookmarkFolderEdit")
                .css("display") === "none"
            ) {
              $bookmarkBtnParent.find(".xbo-bookmarkFolderEdit").slideDown(50);
            } else {
              $bookmarkBtnParent.find(".xbo-bookmarkFolderEdit").hide();
            }
            return;
          }
          const $bookmarkFolderEdit = $(
            `<div class="xbo-bookmarkFolderEdit">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-folderEditCloseBtn">${svgCodeLib["xMark"]}</svg>
</div>`
          )
            .on("click", function (e) {
              e.stopPropagation();
            })
            .on("contextmenu", function (e) {
              e.stopPropagation();
            });
          $bookmarkBtnParent.append($bookmarkFolderEdit);
          $bookmarkFolderEdit
            .find(".xbo-folderEditCloseBtn")
            .on("click", function () {
              $bookmarkFolderEdit.hide();
            });
          $bookmarkFolderEdit.slideDown(50);
          const $bookmarkFolderInput = $(
            `<input class="xbo-bookmarkFolderInput" type="text">`
          );
          const $folderAddSelection = $(
            `<select><option value="${unselectedOptionValue}"></option></select>`
          );
          $bookmarkFolderEdit.append($bookmarkFolderInput);
          if (bookmarksInfo.find((post) => post.id === postID) !== undefined) {
            $bookmarkFolderInput.val(
              bookmarksInfo.find((post) => post.id === postID).folders.join(" ")
            );
          }
          $bookmarkFolderEdit.append($folderAddSelection);
          $folderAddSelection.append(
            allFolders.map(
              (folder) => `<option value="${folder}">[ ] ${folder}</option>`
            )
          );
          allFolders.forEach((folder) => {
            // テキストボックスにフォルダーが存在する場合はセレクトボックスの項目をハイライトする
            if ($bookmarkFolderInput.val().includes(folder)) {
              $folderAddSelection
                .find(`option[value="${folder}"]`)
                .text("[v] " + folder);
            }
          });
          $bookmarkFolderInput.on("change", function () {
            allFolders.forEach((folder) => {
              // テキストボックスにフォルダーが存在する場合はセレクトボックスの項目をハイライトする
              if ($bookmarkFolderInput.val().includes(folder)) {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[v] " + folder);
              } else {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[ ] " + folder);
              }
            });
          });
          $folderAddSelection.on("change", function () {
            if (
              $bookmarkFolderInput.val().includes($folderAddSelection.val())
            ) {
              // すでに存在するフォルダーが選択された場合は削除する
              $bookmarkFolderInput.val(
                $bookmarkFolderInput
                  .val()
                  .replaceAll("　", " ")
                  .split(" ")
                  .filter((folder) => folder !== $folderAddSelection.val())
                  .join(" ")
              );
            } else if ($folderAddSelection.val() !== unselectedOptionValue) {
              if ($bookmarkFolderInput.val() === "") {
                $bookmarkFolderInput.val($folderAddSelection.val());
              } else {
                $bookmarkFolderInput.val(
                  $bookmarkFolderInput.val() + " " + $folderAddSelection.val()
                );
              }
            }
            allFolders.forEach((folder) => {
              // テキストボックスにフォルダーが存在する場合はセレクトボックスの項目をハイライトする
              if ($bookmarkFolderInput.val().includes(folder)) {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[v] " + folder);
              } else {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[ ] " + folder);
              }
            });
            $folderAddSelection.val(unselectedOptionValue);
          });
          if ($(elm).attr("data-testid") === "removeBookmark") {
            addUpdateBtn($bookmarkFolderEdit, postID);
          }
        });
        $(elm).on("click", function () {
          lastBookmarkedPostID = postID;
          if ($(elm).attr("data-testid") === "removeBookmark") {
            if (
              $bookmarkBtnParent.find(".xbo-bookmarkFolderEdit").length !== 0
            ) {
              // 更新ボタンを削除
              $bookmarkBtnParent.find(".xbo-updateBtn").remove();
            }
            bookmarksInfo = bookmarksInfo.filter((post) => post.id !== postID);
            updateAllFolders();
            GM_setValue("bookmarksInfo", bookmarksInfo);
          } else if (
            $bookmarkBtnParent.find(".xbo-bookmarkFolderEdit").length !== 0
          ) {
            addUpdateBtn(
              $bookmarkBtnParent.find(".xbo-bookmarkFolderEdit"),
              postID
            );
            // 空白またはスペースのみの場合は登録しない
            if (
              !$bookmarkBtnParent
                .find(".xbo-bookmarkFolderInput")
                .val()
                .replaceAll("　", " ")
                .split(" ")
                .every((folder) => folder === "")
            ) {
              bookmarksInfo.push({
                id: postID,
                folders: [
                  ...$bookmarkBtnParent
                    .find(".xbo-bookmarkFolderInput")
                    .val()
                    .replaceAll("　", " ")
                    .split(" ")
                    .filter((folder) => folder !== ""),
                ],
              });
              // 重複を削除
              bookmarksInfo = bookmarksInfo.map((post) => ({
                id: post.id,
                folders: [...new Set(post.folders)],
              }));
              updateAllFolders();
              GM_setValue("bookmarksInfo", bookmarksInfo);
            }
          }
          // UIを閉じる
          $bookmarkBtnParent.find(".xbo-bookmarkFolderEdit").hide();
        });
        $("body").on(`click`, function () {
          $bookmarkBtnParent.find(".xbo-bookmarkFolderEdit").hide();
        });
      });

      // フォルダーがブックマークに追加されたときのメッセージにある「フォルダーに追加」ボタンを押したときの処理
      $("div#layers button.css-146c3p1:not(.xbo-processed)").on(
        "click",
        function (e) {
          e.stopImmediatePropagation();
          $("#react-root").append(
            $(`<div id="xbo-bookmarkFolderPopup_bg" class="xbo-UI_bgs">
  <div id="xbo-bookmarkFolderPopup" class="xbo-UI">
    <div class="xbo-bookmarkFolderEdit"></div>
    <button id="xbo-bookmarkFolderPopupSaveBtn">${i18n["save"]}</button>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-bookmarkFolderPopupCloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div>
</div>`)
          );
          scrollLock(true);
          $("#xbo-bookmarkFolderPopup_bg").on("click", function () {
            $("#xbo-bookmarkFolderPopup_bg").remove();
          });
          $("#xbo-bookmarkFolderPopup").on("click", function (e) {
            e.stopPropagation();
          });
          $("#xbo-bookmarkFolderPopupCloseBtn").on("click", function () {
            scrollLock(false);
            $("#xbo-bookmarkFolderPopup_bg").remove();
          });
          const postID = lastBookmarkedPostID;
          const $bookmarkFolderEdit = $(".xbo-bookmarkFolderEdit");
          $bookmarkFolderEdit.css("display", "block");
          $bookmarkFolderEdit.css("width", "90%");
          const $bookmarkFolderInput = $(
            `<input class="xbo-bookmarkFolderInput" type="text">`
          );
          const $folderAddSelection = $(
            `<select><option value="${unselectedOptionValue}"></option></select>`
          );
          $bookmarkFolderEdit.append($bookmarkFolderInput);
          if (bookmarksInfo.find((post) => post.id === postID) !== undefined) {
            $bookmarkFolderInput.val(
              bookmarksInfo.find((post) => post.id === postID).folders.join(" ")
            );
          }
          $bookmarkFolderEdit.append($folderAddSelection);
          $folderAddSelection.append(
            allFolders.map(
              (folder) => `<option value="${folder}">[ ] ${folder}</option>`
            )
          );
          allFolders.forEach((folder) => {
            // テキストボックスにフォルダーが存在する場合はセレクトボックスの項目をハイライトする
            if ($bookmarkFolderInput.val().includes(folder)) {
              $folderAddSelection
                .find(`option[value="${folder}"]`)
                .text("[v] " + folder);
            }
          });
          $bookmarkFolderInput.on("change", function () {
            allFolders.forEach((folder) => {
              // テキストボックスにフォルダーが存在する場合はセレクトボックスの項目をハイライトする
              if ($bookmarkFolderInput.val().includes(folder)) {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[v] " + folder);
              } else {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[ ] " + folder);
              }
            });
          });
          $folderAddSelection.on("change", function () {
            if (
              $bookmarkFolderInput.val().includes($folderAddSelection.val())
            ) {
              // すでに存在するフォルダーが選択された場合は削除する
              $bookmarkFolderInput.val(
                $bookmarkFolderInput
                  .val()
                  .replaceAll("　", " ")
                  .split(" ")
                  .filter((folder) => folder !== $folderAddSelection.val())
                  .join(" ")
              );
            } else if ($folderAddSelection.val() !== unselectedOptionValue) {
              if ($bookmarkFolderInput.val() === "") {
                $bookmarkFolderInput.val($folderAddSelection.val());
              } else {
                $bookmarkFolderInput.val(
                  $bookmarkFolderInput.val() + " " + $folderAddSelection.val()
                );
              }
            }
            allFolders.forEach((folder) => {
              // テキストボックスにフォルダーが存在する場合はセレクトボックスの項目をハイライトする
              if ($bookmarkFolderInput.val().includes(folder)) {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[v] " + folder);
              } else {
                $folderAddSelection
                  .find(`option[value="${folder}"]`)
                  .text("[ ] " + folder);
              }
            });
            $folderAddSelection.val(unselectedOptionValue);
          });
          $("#xbo-bookmarkFolderPopupSaveBtn").on("click", function () {
            // 空白またはスペースのみの場合は登録しない
            if (
              !$("#xbo-bookmarkFolderPopup")
                .find(".xbo-bookmarkFolderInput")
                .val()
                .replaceAll("　", " ")
                .split(" ")
                .every((folder) => folder === "")
            ) {
              bookmarksInfo.push({
                id: postID,
                folders: [
                  ...$("#xbo-bookmarkFolderPopup")
                    .find(".xbo-bookmarkFolderInput")
                    .val()
                    .replaceAll("　", " ")
                    .split(" ")
                    .filter((folder) => folder !== ""),
                ],
              });
              // 重複を削除
              bookmarksInfo = bookmarksInfo.map((post) => ({
                id: post.id,
                folders: [...new Set(post.folders)],
              }));
              updateAllFolders();
              GM_setValue("bookmarksInfo", bookmarksInfo);
            }
            // UIを閉じる
            scrollLock(false);
            $("#xbo-bookmarkFolderPopup_bg").remove();
            // メッセージを表示
            $("#react-root").append(
              $(`<div class="xbo-fixed-msg">${i18n["addedToFolder"]}</div>`)
            );
            setTimeout(() => {
              $(".xbo-fixed-msg").remove();
            }, 6000);
          });
        }
      );
      // 処理済みのクラスを追加
      $("div#layers button.css-146c3p1:not(.xbo-processed)").addClass(
        "xbo-processed"
      );
    }
  };

  // コールバック関数に結びつけられたオブザーバーのインスタンスを生成
  const MO = new MutationObserver(MOCallback);
  // 対象ノードの設定された変更の監視を開始
  MO.observe(targetNode, config);

  // 更新情報を更新後の起動時に表示する
  if (GM_getValue("version", "0.0.0") !== GM_info.script.version) {
    GM_setValue("version", GM_info.script.version);
    setTimeout(() => {
      $("#react-root").append(
        $(`<div id="xbo-updateInfo_bg" class="xbo-UI_bgs">
  <div id="xbo-updateInfo" class="xbo-UI"><div><div>
    <p class="xbo-UI_title">${i18n["updateInfoTitle"]}</p>
    <p class="xbo-UI_categoryTitle">${i18n["changeLogTitle"]}</p>
    ${i18n["changeLog"]}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-updateInfoCloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div></div></div>
</div>`)
      );
      scrollLock(true);
      $("#xbo-updateInfo_bg").on("click", function () {
        scrollLock(false);
        $("#xbo-updateInfo_bg").remove();
      });
      $("#xbo-updateInfo").on("click", function (e) {
        e.stopPropagation();
      });
      $("#xbo-updateInfo > div")
        .on("wheel", function (e) {
          if (
            document.querySelector("#xbo-updateInfo > div").clientHeight - 30 <
            document.querySelector("#xbo-updateInfo > div > div").clientHeight
          ) {
            e.stopPropagation();
          }
        })
        .on("touchmove", function (e) {
          if (
            document.querySelector("#xbo-updateInfo > div").clientHeight - 30 <
            document.querySelector("#xbo-updateInfo > div > div").clientHeight
          ) {
            e.stopPropagation();
          }
        });
      $("#xbo-updateInfoCloseBtn").on("click", function () {
        scrollLock(false);
        $("#xbo-updateInfo_bg").remove();
      });
    }, 1000);
  }
  // 初回起動時にこのスクリプトについての説明を表示する
  if (GM_getValue("firstRun", true)) {
    GM_setValue("firstRun", false);
    setTimeout(() => {
      $("#react-root").append(
        $(`<div id="xbo-firstRunInfo_bg" class="xbo-UI_bgs">
  <div id="xbo-firstRunInfo" class="xbo-UI"><div><div>
    <p class="xbo-UI_title">${i18n["firstRunTitle"]}</p>
    ${i18n["firstRunBody"]}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-firstRunInfoCloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
    </div></div></div>
</div>`)
      );
      scrollLock(true);
      $("#xbo-firstRunInfo_bg").on("click", function () {
        // 更新情報が表示されていない場合のみスクロールバーを戻す
        if ($("#xbo-updateInfo_bg").length === 0) {
          scrollLock(false);
        }
        $("#xbo-firstRunInfo_bg").remove();
      });
      $("#xbo-firstRunInfo").on("click", function (e) {
        e.stopPropagation();
      });
      $("#xbo-firstRunInfo > div")
        .on("wheel", function (e) {
          if (
            document.querySelector("#xbo-firstRunInfo > div").clientHeight -
              30 <
            document.querySelector("#xbo-firstRunInfo > div > div").clientHeight
          ) {
            e.stopPropagation();
          }
        })
        .on("touchmove", function (e) {
          if (
            document.querySelector("#xbo-firstRunInfo > div").clientHeight -
              30 <
            document.querySelector("#xbo-firstRunInfo > div > div").clientHeight
          ) {
            e.stopPropagation();
          }
        });
      $("#xbo-firstRunInfoCloseBtn").on("click", function () {
        // 更新情報が表示されていない場合のみスクロールバーを戻す
        if ($("#xbo-updateInfo_bg").length === 0) {
          scrollLock(false);
        }
        $("#xbo-firstRunInfo_bg").remove();
      });
    }, 1000);
  }
});
