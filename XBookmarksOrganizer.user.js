// ==UserScript==
// @name        X Bookmarks Organizer
// @name:ja     X Bookmarks Organizer
// @namespace   https://github.com/nashikinako/XBookmarksOrganizer
// @match       https://x.com/*
// @match       https://twitter.com/*
// @icon        https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/icon.png
// @grant       GM_setValue
// @grant       GM_getValue
// @version     1.1.1
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
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg>`
        )
      );
      $("#xbo-folderSelectionUI").append(
        $(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="xbo-showAllFoldersBtn">${svgCodeLib["ellipsis"]}</svg>`
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
        updateAllFolders();
        GM_setValue("bookmarksInfo", bookmarksInfo);
        return;
      }
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
      firstRunBody: `<p>This script enables you to organize your X bookmarks into folders.<br>Please see <a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage.md" target="_blank" rel="noopener noreferrer">usage guide</a> to know how to use.</p>
<p class="xbo-UI_categoryTitle">About Donations</p>
<p>This script is provided free of charge, but donations are welcome.<br>The only method is to purchase gift certificates from Amazon.co.jp, so if you do not live in Japan, it may be difficult to donate, but your donation will help us encourage future development.</p>
<p>If you would like to make a donation, you can do so by purchasing and sending an Amazon.co.jp gift certificate to <code>nashikinako★outlook.com</code> (★→@).</p>`,
      updateInfoTitle: `X Bookmarks Organizer has been updated to v${GM_info.script.version}!`,
      changeLogTitle: "Change log from previous version",
      changeLog: `<p>Add</p>
<ul>
  <li>Officially supports Firefox for mobile.</li>
  <li>Adjust the UI scale to be easy to press when the window width is narrow for touch operation.</li>
  <li>Add button to close folder editing UI due to small margins in mobile version.</li>
</ul>
<p>Change</p>
<ul>
  <li>Reduce file size by consolidating svg data.</li>
  <li>Move the Open Script Settings button to the X settings screen.</li>
  <li>To accommodate mobile devices, the selected items in the folder selection box in the folder editing UI have been changed to change the display string (like [ ] → [v]) instead of changing the background.</li>
  <li>Unified Japanese "フォルダ" to "フォルダー".</li>
</ul>
<p>Fix</p>
<ul>
  <li>Fix problem with X's popup behavior being strange due to post filtering processing.</li>
  <li>Fix problem with UI for filtering folders not displaying when window width is narrow.</li>
  <li>Fix problem in which the width of each element in the folder editing UI was not appropriate in some environments.</li>
  <li>Fix problem with script's modal UI not displaying properly when window size is small.</li>
  <li>Fix problem where the folder editing UI was not displayed when there was a quoted post on the individual post display page.</li>
  <li>Fix problem where the "About This Script" button had a large click detection.</li>
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
<li>Email: <code>nashikinako★outlook.com</code> (★→@)</li>
<li>Nashikinako Website (only in Japanese): <a href="https://nashikinako.com" target="_blank" rel="noopener noreferrer">https://nashikinako.com</a></li></ul>`,
      license: `<p class="xbo-UI_categoryTitle">License</p><a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>`,
      settingOpen: "Open X Bookmarks Organizer setting",
    },
    ja: {
      firstRunTitle:
        "X Bookmarks Organizerをインストールしていただきありがとうございます！",
      firstRunBody: `<p>このスクリプトはXのブックマークを無料でフォルダーに整理できるようにします。<br>使い方は<a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage-ja.md" target="_blank" rel="noopener noreferrer">使い方ガイド</a>をご覧ください。</p>
<p class="xbo-UI_categoryTitle">寄付について</p>
<p>このスクリプトは無料で提供していますが、寄付を受け付けています。<br>寄付をしていただけると、今後の開発の励みになります。</p>
<p>もし寄付をしていただけるなら、Amazon.co.jpギフト券を購入して <code>nashikinako★outlook.com</code> (★→@) 宛に送っていただくことで行うことができます。</p>`,
      updateInfoTitle: `X Bookmarks Organizerがv${GM_info.script.version}にアップデートされました！`,
      changeLogTitle: "前バージョンからの変更履歴",
      changeLog: `<p>追加点</p>
<ul>
  <li>モバイル版Firefoxに正式対応</li>
  <li>タッチ操作向けに幅が狭いときはUIスケールを押しやすいように調整</li>
  <li>モバイル版では余白が少ないため、フォルダー編集UIを閉じるボタンを追加</li>
</ul>
<p>変更点</p>
<ul>
  <li>svgのデータをまとめることでファイルサイズを削減</li>
  <li>スクリプトの設定を開くボタンをXの設定画面に移動</li>
  <li>モバイルに対応するために、フォルダー編集UIのフォルダー選択ボックスの選択済み項目は背景の変更ではなく、表示文字列の変更（[ ]→[v]という感じ）に変更</li>
  <li>日本語の「フォルダ」を「フォルダー」に統一</li>
</ul>
<p>修正点</p>
<ul>
  <li>ポストのフィルタ処理によってXのポップアップの動作がおかしくなる問題を修正</li>
  <li>ウィンドウ幅が狭いときにフォルダーをフィルタ処理するUIが表示されない問題を修正</li>
  <li>フォルダー編集UIの各要素の幅が一部環境では適切ではない問題をを修正</li>
  <li>ウィンドウサイズが小さいときにスクリプトのモーダルUIが正しく表示されない問題を修正</li>
  <li>ポストの個別表示ページで引用ポストがあった場合にフォルダー編集UIが表示されない問題を修正</li>
  <li>「このスクリプトについて」のボタンのクリック判定が大きかった問題を修正</li>
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
<li>Eメール: <code>nashikinako★outlook.com</code> (★→@)</li>
<li>なしきなこ Website: <a href="https://nashikinako.com" target="_blank" rel="noopener noreferrer">https://nashikinako.com</a></li></ul>`,
      license: `<p class="xbo-UI_categoryTitle">ライセンス</p><a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MITライセンス</a>`,
      settingOpen: "X Bookmarks Organizerの設定を開く",
    },
  };
  const i18n =
    GM_getValue("lang", "auto") === "auto"
      ? i18nLib[$("html").attr("lang")] || i18nLib.en
      : i18nLib[GM_getValue("lang")];

  // ブックマークフォルダーの情報を取得する
  let bookmarksInfo = GM_getValue("bookmarksInfo", []);

  // すべてのフォルダ一覧を取得する
  let allFolders = [...new Set(bookmarksInfo.flatMap((post) => post.folders))];
  // フォルダ内の投稿数が多い順にソート
  allFolders.sort((a, b) => {
    return (
      bookmarksInfo.filter((post) => post.folders.includes(b)).length -
      bookmarksInfo.filter((post) => post.folders.includes(a)).length
    );
  });

  // 選択されたフォルダー
  let selectedFolder;

  // 「未分類」のoption要素の値
  const uncategorizedFolderID = generateRandomStrings(16);
  // 「未選択」のoption要素の値
  const unselectedOptionValue = generateRandomStrings(16);

  // body要素を監視対象ノードとする
  const targetNode = document.querySelector("body");
  // MutationObserverの設定
  const config = { childList: true, subtree: true };

  // ユーザースクリプトが追加するUIのスタイルを設定
  $("head").append(
    $(`<style>.xbo-UI_bgs{
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
  top: 15%;
  left: 25%;
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
#xbo-confirmDialog{
  width: 50%;
  height: 30%;
  position: absolute;
  top: 30%;
  left: 25%;
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
  top: 25%;
  left: 30%;
  border-radius: 10px;
  overflow: hidden;
}
#xbo-folderEditBtn{
  float: right;
  margin-top: 5px;
  margin-right: 40px;
  font-size: 15px;
  font-weight: normal;
  text-decoration: underline;
  cursor: pointer;
}
#xbo-allFoldersList{
  overflow-y: scroll;
  height: 95%;
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
#xbo-folderEditCloseBtn{
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
@media screen and (max-width: 999px){
  #xbo-settingUI, #xbo-updateInfo, #xbo-firstRunInfo, #xbo-aboutUI, #xbo-allFoldersUI, #xbo-confirmDialog{
    width: 70%;
    left: 15%;
  }
}
@media screen and (max-width: 599px){
  #xbo-settingUI, #xbo-updateInfo, #xbo-firstRunInfo, #xbo-aboutUI, #xbo-allFoldersUI, #xbo-confirmDialog{
    width: 90%;
    left: 5%;
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
  #xbo-folderEditCloseBtn{
    display: inline-block;
  }
}</style>`)
  );

  const svgCodeLib = {
    gear: `<!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>`,
    save: `<!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>`,
    xMark: `<!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>`,
    ellipsis: `<!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/>`,
    edit: `<!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>`,
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
      .text(`#xbo-settingUI button, #xbo-langSelect, .xbo-folderNameInput, .xbo-bookmarkFolderInput, .xbo-bookmarkFolderEdit select, .xbo-updateBtn{
  border: 2px solid ${cssColorLib.btnInput.border};
  background: ${cssColorLib.btnInput.bg};
  color: ${cssColorLib.btnInput.color};
}
#xbo-folderEditCloseBtn{
  border: 2px solid ${cssColorLib.btnInput.border};
  background: ${cssColorLib.btnInput.bg};
  fill: ${cssColorLib.btnInput.color};
}
#xbo-settingUI button:hover, .xbo-updateBtn:hover, #xbo-folderEditCloseBtn:hover{
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
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="xbo-showAllFoldersBtn">${svgCodeLib["ellipsis"]}</svg>`
            )
          );
        }
        // フォルダー選択UIの各フォルダーボタンをクリックしたとき
        $(".xbo-folderElm:not(.eventAdded)").each(function (index, elm) {
          $(elm).addClass("eventAdded");
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
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg>`
              )
            );
          });
        });
        // フォルダー選択UIの「…」ボタンをクリックしたとき
        $("#xbo-showAllFoldersBtn:not(.eventAdded)").on("click", function () {
          $("#react-root").append(
            $(`<div id="xbo-allFoldersUI_bg" class="xbo-UI_bgs">
  <div id="xbo-allFoldersUI" class="xbo-UI">
    <p class="xbo-UI_title">${i18n["foldersList"]}<a id="xbo-folderEditBtn">${i18n["editFolders"]}</a></p>
    <div id="xbo-allFoldersList"><div class="xbo-folderListElm" data-folder="${uncategorizedFolderID}">${i18n["uncategorized"]}</div></div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" id="xbo-allFoldersUICloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div>
</div>`)
          );
          $("body").css("overflow", "hidden");
          $("#xbo-allFoldersUI_bg").on("click", function () {
            // もしフォルダー名が編集中の項目があれば、変更を破棄するか確認する
            if ($(".xbo-folderNameInput").length !== 0) {
              showConfirmDialog(i18n["confirmDiscardChanges"], () => {
                $("#xbo-allFoldersUI_bg").remove();
                $("body").css("overflow", "unset");
              });
            } else {
              $("#xbo-allFoldersUI_bg").remove();
              $("body").css("overflow", "unset");
            }
          });
          $("#xbo-allFoldersUI").on("click", function (e) {
            e.stopPropagation();
          });
          allFolders.forEach((folder) => {
            $("#xbo-allFoldersList").append(
              $(
                `<div class="xbo-folderListElm" data-folder="${folder}"><span class="xbo-folderName">${folder}</span>
  <div class="xbo-rightBtns">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="xbo-folderNameEditBtn">
      ${svgCodeLib["edit"]}
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="xbo-folderDeleteBtn">
      <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
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
                });
                return;
              }
              $(".xbo-folderListElm").css("cursor", "pointer");
              $(".xbo-rightBtns").css("display", "none");
              $("#xbo-folderEditBtn").text(i18n["editFolders"]);
              return;
            }
            $(".xbo-folderListElm").css("cursor", "auto");
            $(".xbo-rightBtns").css("display", "block");
            $("#xbo-folderEditBtn").text(i18n["finishEditing"]);
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
                $(`.xbo-folderElm[data-folder="${selectedFolder}"]`).length ===
                0
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
                $(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="xbo-deselectionSvg">
  ${svgCodeLib["xMark"]}
</svg>`)
              );
              $("#xbo-allFoldersUI_bg").remove();
              $("body").css("overflow", "unset");
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
                $("body").css("overflow", "unset");
              });
            } else {
              $("#xbo-allFoldersUI_bg").remove();
              $("body").css("overflow", "unset");
            }
          });
        });
        $("#xbo-showAllFoldersBtn:not(.eventAdded)").addClass("eventAdded");

        // フィルタ処理ここから
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
                $(timeElm).parent().parent().parent().css("display") !== "none"
              ) {
                $(timeElm).parent().parent().parent().css("display", "none");
              } else if (
                !posts.includes(
                  $(timeElm).find("time").parent().attr("href").split("/")[3]
                ) &&
                $(timeElm).parent().parent().parent().css("display") === "none"
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
                $(timeElm).parent().parent().parent().css("display") !== "none"
              ) {
                $(timeElm).parent().parent().parent().css("display", "none");
              } else if (
                posts.includes(
                  $(timeElm).find("time").parent().attr("href").split("/")[3]
                ) &&
                $(timeElm).parent().parent().parent().css("display") === "none"
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
        // フィルタ処理ここまで
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
          $("#xbo-settingBtn").find("svg").attr("viewBox", "0 0 512 512");
          $("#xbo-settingBtn").find("svg").html(svgCodeLib["gear"]);
          $("#xbo-settingBtn").on("click", function (e) {
            e.stopPropagation();
            $("#react-root").append(
              $(`<div id="xbo-settingUI_bg" class="xbo-UI_bgs">
  <div id="xbo-settingUI" class="xbo-UI"><div>
    <p class="xbo-UI_title">${i18n["setting"]}</p>
    <p><label>${i18n["language"]}<select id="xbo-langSelect">
      <option value="auto">Auto</option>
      <option value="en">${i18n["langEn"]}</option>
      <option value="ja">${i18n["langJa"]}</option>
    </select></label><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="xbo-langChangeBtn">${svgCodeLib["save"]}</svg></p>
    <p class="xbo-UI_categoryTitle">${i18n["importExport"]}</p>
    <button id="xbo-exportBtn">${i18n["export"]}</button>
    <textarea id="xbo-exportTextarea" readonly placeholder="${i18n["exportTextarea"]}"></textarea>
    <button id="xbo-importMargeBtn">${i18n["importMarge"]}</button><button id="xbo-importOverwriteBtn">${i18n["importOverwrite"]}</button>
    <textarea id="xbo-importTextarea" placeholder="${i18n["importTextarea"]}"></textarea>
    <p class="xbo-UI_categoryTitle">${i18n["reset"]}</p>
    <p><button id="xbo-allFolderDeleteBtn">${i18n["deleteAllFolders"]}</button></p>
    <p>X Bookmarks Organizer ${GM_info.script.version} | <a id="xbo-openAboutUI">${i18n["aboutThisScript"]}</a></p>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" id="xbo-settingUICloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div></div>
</div>`)
            );
            $("body").css("overflow", "hidden");
            $("#xbo-settingUI_bg").on("click", function () {
              $("body").css("overflow", "unset");
              $("#xbo-settingUI_bg").remove();
            });
            $("#xbo-settingUI").on("click", function (e) {
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
    <div>
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" id="xbo-aboutUICloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
    </div></div>
</div>`)
              );
              $("#xbo-aboutUI_bg").on("click", function () {
                $("#xbo-aboutUI_bg").remove();
              });
              $("#xbo-aboutUI").on("click", function (e) {
                e.stopPropagation();
              });
              $("#xbo-aboutUICloseBtn").on("click", function () {
                $("#xbo-aboutUI_bg").remove();
              });
            });
            $("#xbo-settingUICloseBtn").on("click", function () {
              $("body").css("overflow", "unset");
              $("#xbo-settingUI_bg").remove();
            });
          });
        }
      }

      // 以下よりすべてのページに共通する処理
      // すでに処理済みの要素に対しては処理を行わない
      $(
        '[data-testid$="bookmark"]:not(.processed), [data-testid$="removeBookmark"]:not(.processed)'
      ).each(function (index, elm) {
        // 処理済みのクラスを追加
        $(elm).addClass("processed");
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" id="xbo-folderEditCloseBtn">${svgCodeLib["xMark"]}</svg>
</div>`
          )
            .on("click", function (e) {
              e.stopPropagation();
            })
            .on("contextmenu", function (e) {
              e.stopPropagation();
            });
          $bookmarkBtnParent.append($bookmarkFolderEdit);
          $("#xbo-folderEditCloseBtn").on("click", function () {
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
                  .text(folder);
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
                  .text(folder);
              }
            });
            $folderAddSelection.val(unselectedOptionValue);
          });
          if ($(elm).attr("data-testid") === "removeBookmark") {
            addUpdateBtn($bookmarkFolderEdit, postID);
          }
        });
        $(elm).on("click", function () {
          if ($(elm).attr("data-testid") === "removeBookmark") {
            // 更新ボタンを削除
            $bookmarkBtnParent.find(".xbo-updateBtn").remove();
            bookmarksInfo = bookmarksInfo.filter((post) => post.id !== postID);
            updateAllFolders();
            GM_setValue("bookmarksInfo", bookmarksInfo);
          } else {
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
  <div id="xbo-updateInfo" class="xbo-UI"><div>
    <p class="xbo-UI_title">${i18n["updateInfoTitle"]}</p>
    <p class="xbo-UI_categoryTitle">${i18n["changeLogTitle"]}</p>
    ${i18n["changeLog"]}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" id="xbo-updateInfoCloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div></div>
</div>`)
      );
      $("body").css("overflow", "hidden");
      $("#xbo-updateInfo_bg").on("click", function () {
        $("body").css("overflow", "unset");
        $("#xbo-updateInfo_bg").remove();
      });
      $("#xbo-updateInfo").on("click", function (e) {
        e.stopPropagation();
      });
      $("#xbo-updateInfoCloseBtn").on("click", function () {
        $("body").css("overflow", "unset");
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
  <div id="xbo-firstRunInfo" class="xbo-UI"><div>
    <p class="xbo-UI_title">${i18n["firstRunTitle"]}</p>
    ${i18n["firstRunBody"]}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" id="xbo-firstRunInfoCloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
    </div></div>
</div>`)
      );
      $("body").css("overflow", "hidden");
      $("#xbo-firstRunInfo_bg").on("click", function () {
        // 更新情報が表示されていない場合のみスクロールバーを戻す
        if ($("#xbo-updateInfo_bg").length === 0) {
          $("body").css("overflow", "unset");
        }
        $("#xbo-firstRunInfo_bg").remove();
      });
      $("#xbo-firstRunInfo").on("click", function (e) {
        e.stopPropagation();
      });
      $("#xbo-firstRunInfoCloseBtn").on("click", function () {
        // 更新情報が表示されていない場合のみスクロールバーを戻す
        if ($("#xbo-updateInfo_bg").length === 0) {
          $("body").css("overflow", "unset");
        }
        $("#xbo-firstRunInfo_bg").remove();
      });
    }, 1000);
  }
});
