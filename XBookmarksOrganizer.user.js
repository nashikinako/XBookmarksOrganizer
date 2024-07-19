// ==UserScript==
// @name        X Bookmarks Organizer
// @name:ja     X Bookmarks Organizer
// @namespace   https://github.com/nashikinako/XBookmarksOrganizer
// @match       https://x.com/*
// @match       https://twitter.com/*
// @icon        https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/icon.png
// @grant       GM_setValue
// @grant       GM_getValue
// @version     1.4.0
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
    } else if ($("#xbo-UI_bgs").length === 0) {
      document.removeEventListener("wheel", noscroll, { passive: false });
      document.removeEventListener("touchmove", noscroll, { passive: false });
    }
  };

  const accountsDataInit = () => {
    if (bookmarksInfo.filter((data) => data.id === accountID).length === 0) {
      bookmarksInfo.push({ id: accountID, folders: [] });
      GM_setValue("bookmarksInfo", bookmarksInfo);
    }
    accountsBkmsInfo = bookmarksInfo.filter((data) => data.id === accountID)[0]
      .folders;
    // すべてのフォルダー一覧を取得する
    allFolders = [...new Set(accountsBkmsInfo.flatMap((post) => post.folders))];
    // フォルダー内の投稿数が多い順にソート
    allFolders.sort((a, b) => {
      return (
        accountsBkmsInfo.filter((post) => post.folders.includes(b)).length -
        accountsBkmsInfo.filter((post) => post.folders.includes(a)).length
      );
    });
    foldersPostNum = allFolders.map(
      (folder) =>
        accountsBkmsInfo.filter((post) => post.folders.includes(folder)).length
    );
  };

  // bookmarksInfoの更新時にallFoldersを更新する関数
  const updateAllFolders = () => {
    if (!accountID) {
      return;
    }

    if (bookmarksInfo.filter((data) => data.id === accountID).length === 0) {
      bookmarksInfo.push({ id: accountID, folders: [] });
      GM_setValue("bookmarksInfo", bookmarksInfo);
    }
    accountsBkmsInfo = bookmarksInfo.filter((data) => data.id === accountID)[0]
      .folders;
    // すべてのフォルダー一覧を取得する
    allFolders = [...new Set(accountsBkmsInfo.flatMap((post) => post.folders))];
    // フォルダー内の投稿数が多い順にソート
    allFolders.sort((a, b) => {
      return (
        accountsBkmsInfo.filter((post) => post.folders.includes(b)).length -
        accountsBkmsInfo.filter((post) => post.folders.includes(a)).length
      );
    });
    foldersPostNum = allFolders.map(
      (folder) =>
        accountsBkmsInfo.filter((post) => post.folders.includes(folder)).length
    );
    if ($("#xbo-folderSelectionUI").length !== 0) {
      $("#xbo-folderSelectionUI").empty();
      // 未分類を追加
      $("#xbo-folderSelectionUI").append(
        $(
          `<div class="xbo-folderElm" data-folder="${uncategorizedFolderID}">${i18n["uncategorized"]}</div>`
        )
      );
      allFolders.slice(0, 10).forEach((folder, index) => {
        $("#xbo-folderSelectionUI").append(
          $(
            `<div class="xbo-folderElm" data-folder="${folder}">${folder} (${foldersPostNum[index]})</div>`
          )
        );
      });
      if (selectedFolder !== undefined) {
        // すでにボタンがある場合はそのボタンを変更し、ない場合はボタンのリストに新規追加する
        if ($(`.xbo-folderElm[data-folder="${selectedFolder}"]`).length === 0) {
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
      }

      $("#xbo-folderSelectionUI").append(
        $(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" id="xbo-showAllFoldersBtn">${svgCodeLib["dots"]}</svg>`
        )
      );
    }
  };

  const showAccountIDSelectUI = (mode, postID, bkmBtn) => {
    $("#react-root").append(
      $(`<div id="xbo-accountIDSelect_bg" class="xbo-UI_bgs">
  <div id="xbo-accountIDSelect" class="xbo-UI"><div><div>
    <p>${i18n["selectAccountID"]}</p>
    <label>${i18n["targetAccount"]}<select id="xbo-targetAccountSelector"></select></label><br>
    <button id="xbo-accountIDSelectBtn">${i18n["select"]}</button>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-accountIDSelectCloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div></div></div>
</div>`)
    );

    scrollLock(true);
    $("#xbo-accountIDSelect_bg").on("click", function () {
      scrollLock(false);
      $("#xbo-accountIDSelect_bg").remove();
    });
    $("#xbo-accountIDSelect").on("click", function (e) {
      e.stopPropagation();
    });
    $("#xbo-accountIDSelectCloseBtn").on("click", function () {
      scrollLock(false);
      $("#xbo-accountIDSelect_bg").remove();
    });
    $("#xbo-accountIDSelect")
      .on("wheel", function (e) {
        if (
          document.querySelector("#xbo-accountIDSelect > div").clientHeight -
            30 <
          document.querySelector("#xbo-accountIDSelect > div > div")
            .clientHeight
        ) {
          e.stopPropagation();
        }
      })
      .on("touchmove", function (e) {
        if (
          document.querySelector("#xbo-accountIDSelect > div").clientHeight -
            30 <
          document.querySelector("#xbo-accountIDSelect > div > div")
            .clientHeight
        ) {
          e.stopPropagation();
        }
      });

    bookmarksInfo.forEach((data) => {
      $("#xbo-targetAccountSelector").append(
        $(`<option value="${data.id}">@${data.id}</option>`)
      );
    });
    $("#xbo-targetAccountSelector").append(
      $(`<option value="i">${i18n["newAccount"]}</option>`)
    );
    if ($("#xbo-targetAccountSelector").val() === "i") {
      $("label:has(#xbo-targetAccountSelector)").append(
        $(
          `<span><br>@<input type="text" id="xbo-newTargetAccountInput"><button id="xbo-newTargetAccountAddBtn">${i18n["newTargetAccountAdd"]}</button></span>`
        )
      );
      $("#xbo-newTargetAccountAddBtn").on("click", function () {
        const newAccountID = $("#xbo-newTargetAccountInput").val();
        if (newAccountID === "" || newAccountID === "i") {
          return;
        }
        if (
          bookmarksInfo.find((data) => data.id === newAccountID) === undefined
        ) {
          bookmarksInfo.push({
            id: newAccountID,
            folders: [],
          });
          GM_setValue("bookmarksInfo", bookmarksInfo);
          $("#xbo-targetAccountSelector option[value='i']").before(
            $(`<option value="${newAccountID}">@${newAccountID}</option>`)
          );
        }
        $("#xbo-targetAccountSelector").val(newAccountID);
        $("span:has(#xbo-newTargetAccountInput)").remove();
      });
    }
    $("#xbo-targetAccountSelector").on("change", function () {
      if ($(this).val() === "i") {
        $("label:has(#xbo-targetAccountSelector)").append(
          $(
            `<span><br>@<input type="text" id="xbo-newTargetAccountInput"><button id="xbo-newTargetAccountAddBtn">${i18n["newTargetAccountAdd"]}</button></span>`
          )
        );
        $("#xbo-newTargetAccountAddBtn").on("click", function () {
          const newAccountID = $("#xbo-newTargetAccountInput").val();
          if (newAccountID === "" || newAccountID === "i") {
            return;
          }
          if (
            bookmarksInfo.find((data) => data.id === newAccountID) === undefined
          ) {
            bookmarksInfo.push({
              id: newAccountID,
              folders: [],
            });
            GM_setValue("bookmarksInfo", bookmarksInfo);
            $("#xbo-targetAccountSelector").append(
              $(`<option value="${newAccountID}">@${newAccountID}</option>`)
            );
          }
          $("#xbo-targetAccountSelector").val(newAccountID);
          $("span:has(#xbo-newTargetAccountInput)").remove();
        });
      } else {
        $("span:has(#xbo-newTargetAccountInput)").remove();
      }
    });
    $("#xbo-accountIDSelectBtn").on("click", function () {
      if ($("#xbo-targetAccountSelector").val() === "i") {
        return;
      }
      accountID = $("#xbo-targetAccountSelector").val();
      accountsDataInit();
      if (mode === "add") {
        showFolderEditUI(postID, bkmBtn);
      } else if (mode === "remove") {
        accountsBkmsInfo = accountsBkmsInfo.filter(
          (post) => post.id !== postID
        );
        bookmarksInfo = bookmarksInfo.map((data) => {
          if (data.id === accountID) {
            data.folders = accountsBkmsInfo;
          }
          return data;
        });
        updateAllFolders();
        GM_setValue("bookmarksInfo", bookmarksInfo);
      }
      $("#xbo-accountIDSelect_bg").remove();
      scrollLock(false);
    });
  };

  // メッセージを表示する関数
  const showMsg = (msg, duration, btnMsg, btnCallback) => {
    let msgElm;
    let mobileExtraDuration = 0;
    if (
      $("nav.css-175oi2r.r-18u37iz.r-drjvcx.r-ripixn.r-13qz1uu").length === 0
    ) {
      if (window.innerWidth < 600) {
        // pc幅狭
        msgElm = $(
          `<div class="xbo-msg-pc-narrow"><span>${msg}</span><span class="xbo-msg-btn-container"></span></div>`
        );
        mobileExtraDuration = 500;
      } else {
        // pc幅広
        msgElm = $(
          `<div class="xbo-msg-pc-wide"><span>${msg}</span><span class="xbo-msg-btn-container"></span></div>`
        );
      }
    } else {
      msgElm = $(
        `<div class="xbo-msg-mobile"><span>${msg}</span><span class="xbo-msg-btn-container"></span></div>`
      );
      mobileExtraDuration = 500;
    }
    $("#react-root").append(msgElm);
    if (btnMsg && btnCallback) {
      $(msgElm)
        .find(".xbo-msg-btn-container")
        .append(
          $(`<button class="xbo-msg-btn">${btnMsg}</button>`)
            .on("click", btnCallback)
            .on("mouseenter", function () {
              $(this).css("text-decoration", "underline");
            })
            .on("mouseleave", function () {
              $(this).css("text-decoration", "none");
            })
        );
    }

    setTimeout(() => {
      msgElm.remove();
    }, duration + mobileExtraDuration);
  };

  // フォルダ編集UIを表示する関数
  const showFolderEditUI = (postID, bkmBtn) => {
    if (!accountID) {
      showAccountIDSelectUI("add", postID, bkmBtn);
      return;
    }
    $("#react-root").append(
      $(`<div id="xbo-bookmarkFolderPopup_bg" class="xbo-UI_bgs">
  <div id="xbo-bookmarkFolderPopup" class="xbo-UI"><div><div>
    <div id="xbo-postTextBox"></div><div id="xbo-postTextActs">
      <button id="xbo-allHashtagsAddBtn">${i18n["addAllHashtags"]}</button>
    </div>
    <input class="xbo-bookmarkFolderInput" type="text"><button id="xbo-addNewFolderBtn">${i18n["addNewFolder"]}</button>
    <br><label><input type="checkbox" id="xbo-splitSwitch">${i18n["splitSwitch"]}</label>
    <div id="xbo-folderAddList"></div>
    <button id="xbo-bookmarkFolderPopupSaveBtn">${i18n["save"]}</button>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="xbo-bookmarkFolderPopupCloseBtn" class="xbo-closeBtns">${svgCodeLib["xMark"]}</svg>
  </div></div></div>
</div>`)
    );
    scrollLock(true);
    $("#xbo-bookmarkFolderPopup_bg").on("click", function () {
      scrollLock(false);
      $("#xbo-bookmarkFolderPopup_bg").remove();
    });
    $("#xbo-bookmarkFolderPopup").on("click", function (e) {
      e.stopPropagation();
    });
    $("#xbo-bookmarkFolderPopupCloseBtn").on("click", function () {
      scrollLock(false);
      $("#xbo-bookmarkFolderPopup_bg").remove();
    });
    $("#xbo-bookmarkFolderPopup")
      .on("wheel", function (e) {
        if (
          document.querySelector("#xbo-bookmarkFolderPopup > div")
            .clientHeight -
            30 <
          document.querySelector("#xbo-bookmarkFolderPopup > div > div")
            .clientHeight
        ) {
          e.stopPropagation();
        }
      })
      .on("touchmove", function (e) {
        if (
          document.querySelector("#xbo-bookmarkFolderPopup > div")
            .clientHeight -
            30 <
          document.querySelector("#xbo-bookmarkFolderPopup > div > div")
            .clientHeight
        ) {
          e.stopPropagation();
        }
      });

    $(bkmBtn)
      .parent()
      .parent()
      .parent()
      .parent()
      .parent()
      .find('[data-testid="tweetText"]')
      .clone()
      .prependTo("#xbo-postTextBox");
    $('#xbo-postTextBox a[href^="/hashtag"]').each(function (index, elm) {
      // 例：https://x.com/hashtag/イラスト?src=hashtag_click
      $(elm)
        .attr("data-folder", $(elm).attr("href").split("/").pop().split("?")[0])
        .on("click", function (e) {
          e.preventDefault();
          const hashtagFolderElm = $(
            `.xbo-folderAddElm[data-folder="${$(elm).attr("data-folder")}"]`
          );
          if (hashtagFolderElm.length !== 0) {
            if ($(hashtagFolderElm).hasClass("xbo-add-temp")) {
              $(hashtagFolderElm).remove();
            } else if ($(hashtagFolderElm).hasClass("xbo-add-selected")) {
              $(hashtagFolderElm).removeClass("xbo-add-selected");
              $(hashtagFolderElm).find(".xbo-deselectionSvg").remove();
            } else {
              $(hashtagFolderElm)
                .addClass("xbo-add-selected")
                .append(
                  $(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg>`
                  )
                );
            }
          } else {
            $folderAddList.append(
              $(
                `<div class="xbo-folderAddElm xbo-add-selected xbo-add-temp" data-folder="${$(
                  elm
                ).attr("data-folder")}">${$(elm).attr(
                  "data-folder"
                )}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${
                  svgCodeLib["xMark"]
                }</svg></div>`
              ).on("click", function () {
                $(this).remove();
              })
            );
          }
        })
        .on("mouseenter", function () {
          $(elm).css("text-decoration", "underline");
        })
        .on("mouseleave", function () {
          $(elm).css("text-decoration", "none");
        });
    });
    if ($("#xbo-postTextBox a").length === 0) {
      $("#xbo-allHashtagsAddBtn").hide();
    }
    // ポストの本文が選択された場合は選択したテキストをフォルダとして追加するボタンを表示する
    $("#xbo-postTextBox").on("mouseup", function () {
      const selectedText = window.getSelection().toString();
      if (selectedText !== "") {
        $("#xbo-selectedTextAddBtn").remove();
        $("#xbo-postTextActs").prepend(
          $(
            `<button id="xbo-selectedTextAddBtn">${i18n["addSelectedText"]}</button>`
          ).on("click", function () {
            if (
              $(`.xbo-folderAddElm[data-folder="${selectedText}"]`).length !== 0
            ) {
              return;
            }
            $folderAddList.append(
              $(
                `<div class="xbo-folderAddElm xbo-add-selected" data-folder="${selectedText}">${selectedText}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg></div>`
              ).on("click", function () {
                $(this).remove();
              })
            );
            window.getSelection().removeAllRanges();
            $(this).remove();
          })
        );
      } else {
        $("#xbo-selectedTextAddBtn").remove();
      }
    });
    $("body").on("mouseup", function () {
      if (window.getSelection().toString() === "") {
        $("#xbo-selectedTextAddBtn").remove();
      }
    });
    // モバイルようにタッチ操作でも反応するようにする
    $("#xbo-postTextBox").on("touchend", function () {
      const selectedText = window.getSelection().toString();
      if (selectedText !== "") {
        $("#xbo-selectedTextAddBtn").remove();
        $("#xbo-postTextActs").prepend(
          $(
            `<button id="xbo-selectedTextAddBtn">${i18n["addSelectedText"]}</button>`
          ).on("click", function () {
            if (
              $(`.xbo-folderAddElm[data-folder="${selectedText}"]`).length !== 0
            ) {
              return;
            }
            $folderAddList.append(
              $(
                `<div class="xbo-folderAddElm xbo-add-selected" data-folder="${selectedText}">${selectedText}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg></div>`
              ).on("click", function () {
                $(this).remove();
              })
            );
            window.getSelection().removeAllRanges();
            $(this).remove();
          })
        );
      } else {
        $("#xbo-selectedTextAddBtn").remove();
      }
    });
    $("body").on("touchend", function () {
      if (window.getSelection().toString() === "") {
        $("#xbo-selectedTextAddBtn").remove();
      }
    });
    $("#xbo-allHashtagsAddBtn").on("click", function () {
      $("#xbo-postTextBox a").each(function (index, elm) {
        if (
          $(
            `.xbo-folderAddElm.xbo-add-selected[data-folder="${$(elm).attr(
              "data-folder"
            )}"]`
          ).length !== 0
        ) {
          return;
        }
        $(elm).click();
      });
    });
    const $bookmarkFolderInput = $(".xbo-bookmarkFolderInput");
    const $folderAddList = $("#xbo-folderAddList");
    allFolders.forEach((folder, index) => {
      $folderAddList.append(
        $(
          `<div class="xbo-folderAddElm" data-folder="${folder}">${folder}</div>`
        )
      );
    });
    if (accountsBkmsInfo.find((post) => post.id === postID) !== undefined) {
      accountsBkmsInfo
        .find((post) => post.id === postID)
        .folders.forEach((folder) => {
          $(`.xbo-folderAddElm[data-folder=${folder}]`).addClass(
            "xbo-add-selected"
          );
          $(`.xbo-folderAddElm[data-folder=${folder}]`).append(
            $(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg>`
            )
          );
        });
    }
    $(".xbo-folderAddElm").each(function (index, elm) {
      $(elm).on("click", function () {
        if ($(elm).hasClass("xbo-add-selected")) {
          $(elm).removeClass("xbo-add-selected");
          $(elm).find(".xbo-deselectionSvg").remove();
          return;
        }
        $(elm).addClass("xbo-add-selected");
        $(elm).append(
          $(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg>`
          )
        );
      });
    });
    $("#xbo-addNewFolderBtn").on("click", function () {
      const newFolderName = $bookmarkFolderInput.val();
      let addedAllFolders = true;
      // 素手の同名フォルダが存在する場合は追加しない
      if ($("#xbo-splitSwitch").prop("checked")) {
        [
          ...new Set([
            ...$("#xbo-bookmarkFolderPopup")
              .find(".xbo-bookmarkFolderInput")
              .val()
              .replaceAll("　", " ")
              .split(" ")
              .filter((folder) => folder !== ""),
          ]),
        ].forEach((newFolderName) => {
          if (
            $(`.xbo-folderAddElm[data-folder="${newFolderName}"]`).length !== 0
          ) {
            addedAllFolders = false;
            return;
          }
          $folderAddList.append(
            $(
              `<div class="xbo-folderAddElm xbo-add-selected" data-folder="${newFolderName}">${newFolderName}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg></div>`
            ).on("click", function () {
              $(this).remove();
            })
          );
        });
      } else {
        if (
          $(`.xbo-folderAddElm[data-folder="${newFolderName}"]`).length !== 0
        ) {
          return;
        }
        $folderAddList.append(
          $(
            `<div class="xbo-folderAddElm xbo-add-selected" data-folder="${newFolderName}">${newFolderName}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="xbo-deselectionSvg">${svgCodeLib["xMark"]}</svg></div>`
          ).on("click", function () {
            $(this).remove();
          })
        );
      }
      if (!addedAllFolders) {
        return;
      }
      $bookmarkFolderInput.val("");
    });
    $("#xbo-bookmarkFolderPopupSaveBtn").on("click", function () {
      let msg;
      if (accountsBkmsInfo.find((post) => post.id === postID) === undefined) {
        if ($(".xbo-add-selected").length !== 0) {
          accountsBkmsInfo.push({
            id: postID,
            folders: [
              ...new Set([
                ...$(".xbo-add-selected").map((index, elm) =>
                  $(elm).attr("data-folder")
                ),
              ]),
            ],
          });
          if ($(bkmBtn).attr("data-testid") === "bookmark") {
            showBookmarkMsg = false;
            $(bkmBtn).click();
            msg = i18n["bkmAddedToFolder"];
            showBookmarkMsg = true;
          } else {
            msg = i18n["addedToFolder"];
          }
        } else {
          if ($(bkmBtn).attr("data-testid") === "bookmark") {
            $(bkmBtn).click();
          }
        }
      } else if ($(".xbo-add-selected").length !== 0) {
        accountsBkmsInfo.find((post) => post.id === postID).folders = [
          ...new Set([
            ...$(".xbo-add-selected").map((index, elm) =>
              $(elm).attr("data-folder")
            ),
          ]),
        ];
        msg = i18n["editedPostFolder"];
      } else {
        // フォルダーが空の場合は削除する
        accountsBkmsInfo = accountsBkmsInfo.filter(
          (post) => post.id !== postID
        );
        msg = i18n["removedFromAllFolder"];
      }
      bookmarksInfo = bookmarksInfo.map((data) => {
        if (data.id === accountID) {
          data.folders = accountsBkmsInfo;
        }
        return data;
      });
      updateAllFolders();
      GM_setValue("bookmarksInfo", bookmarksInfo);
      // UIを閉じる
      scrollLock(false);
      $("#xbo-bookmarkFolderPopup_bg").remove();
      if (msg) {
        showMsg(msg, 6100);
      }
    });
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

  const i18nLib = {
    en: {
      firstRunTitle: "Thank you for installing X Bookmarks Organizer!",
      firstRunBody: `<p>This script enables you to organize your X bookmarks into folders.<br>Please see <a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage.md" target="_blank" rel="noopener noreferrer">usage guide</a> to know how to use.</p>
      <span class="xbo-UI_categoryTitle">About Donation</span>
          <p>
            If you use my script and find it useful, please make a donation.<br />
            Of course, it is not mandatory, but it would be a great encouragement for my future activities.<br>
            Even if you do not make a donation, we would greatly appreciate it if you would share this user script on SNS.
          </p>
          <p>
            If you would like to make a donation, please send an <a
              href="https://www.amazon.co.jp/Amazon%E3%82%AE%E3%83%95%E3%83%88%E3%82%AB%E3%83%BC%E3%83%89-1_JP_Email-E%E3%83%A1%E3%83%BC%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%97-%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%81%AB%E3%82%82%E9%80%81%E4%BF%A1%E5%8F%AF-Amazon%E3%83%99%E3%83%BC%E3%82%B7%E3%83%83%E3%82%AF/dp/B004N3APGO"
              target="_blank" rel="noopener noreferrer">Amazon.co.jp gift card (email type)</a> to <code>nasikinako@gmail.com</code>.<br>
              Please be careful not to purchase and send gift cards from non-Japanese sites of Amazon by mistake, as I am not able to use gift cards other than those from Amazon.co.jp.
          </p>`,
      updateInfoTitle: `X Bookmarks Organizer has been updated to v${GM_info.script.version}!`,
      changeLogTitle: "Change log",
      changeLog: `You can see the changes in the latest version <a href="https://github.com/nashikinako/XBookmarksOrganizer/releases/latest" target="_blank" rel="noopener noreferrer">here</a>.<br>
      Please see the <a href="https://github.com/nashikinako/XBookmarksOrganizer/releases" target="_blank" rel="noopener noreferrer">GitHub release page</a> for a history of updates to past versions.`,
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
      deleteAllFolders: "Delete all folders of selected account",
      confirmImportOverwrite: "Do you want to import and overwrite?",
      confirmDeleteAllFolders: "Do you want to delete all folders of @%0?",
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
<li>Nashikinako Profile (only in Japanese): <a href="https://nashikinako.com" target="_blank" rel="noopener noreferrer">https://nashikinako.com</a></li></ul>`,
      license: `<p class="xbo-UI_categoryTitle">License</p><a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>`,
      settingOpen: "Open X Bookmarks Organizer setting",
      cleanFolders: "Clean folders",
      confirmCleanFolders:
        "Do you want to clean unnecessary folders? Once started, it cannot be stopped!",
      cleaningFoldersMsg: "Cleaning folders...",
      cleaningCompletedMsg: "Cleaning folders has been completed.",
      addedToFolder: "Added to folder",
      removedFromAllFolder: "Removed from all folders",
      editedPostFolder: "Edited post folder",
      bookmarkAdded: "Added to your Bookmarks",
      addToFolder: "Add to Folder",
      editedPostFolder: "Edited post folder",
      bkmAddedToFolder: "Added to Bookmarks and folder",
      addNewFolder: "New folder",
      splitSwitch: "Add multiple with space separation",
      addSelectedText: "Add selected text",
      addAllHashtags: "Add all hashtags",
      targetAccount: "Target account: ",
      newTargetAccountAdd: "Add",
      newAccount: "New account",
      formatUpdateTitle:
        "Data storage format has been changed since version 1.4.0",
      formatUpdateBody: `Starting with version 1.4.0, bookmark folders can be created for each account, and the data storage format has changed accordingly.<br>
      Before continuing to use the script, please link your pre version 1.4.0 data to any of your accounts.`,
      formatUpdateLabel: "ID of the account to be linked",
      formatUpdateBtn: "Link and update",
      formatUpdateConfirm:
        "Do you really want to tie previous data to @%0 and update the data storage format?",
      resetFoldersData: "Reset folders data of all accounts",
      confirmResetFoldersData:
        "Do you want to reset folders data of all accounts?",
      select: "Select",
      selectAccountID:
        "The ID for the account you are currently using could not be retrieved. Please select the account ID for the operation.",
    },
    ja: {
      firstRunTitle:
        "X Bookmarks Organizerをインストールしていただきありがとうございます！",
      firstRunBody: `<p>このスクリプトはXのブックマークを無料でフォルダーに整理できるようにします。<br>使い方は<a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage-ja.md" target="_blank" rel="noopener noreferrer">使い方ガイド</a>をご覧ください。</p>
      <span class="xbo-UI_categoryTitle">寄付について</span>
          <p>
            当スクリプトを使用してみて役に立つと思ったらぜひ、寄付をお願いします。<br />
            もちろん強制ではありませんが、いただけると今後の活動への励ましになります。<br>
            寄付でなくても、当ユーザースクリプトをSNS等でシェアしていただけるだけでも大変助かります。
          </p>
          <p>
            もし寄付をして頂ける場合は、<code>nasikinako@gmail.com</code>に<a
              href="https://www.amazon.co.jp/Amazon%E3%82%AE%E3%83%95%E3%83%88%E3%82%AB%E3%83%BC%E3%83%89-1_JP_Email-E%E3%83%A1%E3%83%BC%E3%83%AB%E3%82%BF%E3%82%A4%E3%83%97-%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%81%AB%E3%82%82%E9%80%81%E4%BF%A1%E5%8F%AF-Amazon%E3%83%99%E3%83%BC%E3%82%B7%E3%83%83%E3%82%AF/dp/B004N3APGO"
              target="_blank" rel="noopener noreferrer">Amazon.co.jpギフトカード(Eメールタイプ)</a
            >を送信してください。
          </p>`,
      updateInfoTitle: `X Bookmarks Organizerがv${GM_info.script.version}にアップデートされました！`,
      changeLogTitle: "変更履歴",
      changeLog: `最新バージョンの変更点は<a href="https://github.com/nashikinako/XBookmarksOrganizer/releases/latest" target="_blank" rel="noopener noreferrer">こちら</a>から見られます。<br>
      過去バージョンの更新履歴は<a href="https://github.com/nashikinako/XBookmarksOrganizer/releases" target="_blank" rel="noopener noreferrer">GitHubのリリースページ</a>をご覧ください。`,
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
      deleteAllFolders: "選択したアカウントの全フォルダーを削除",
      confirmImportOverwrite: "インポートして上書きしますか？",
      confirmDeleteAllFolders: "@%0 の全フォルダーを削除しますか？",
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
<li>なしきなこ Profile: <a href="https://nashikinako.com" target="_blank" rel="noopener noreferrer">https://nashikinako.com</a></li></ul>`,
      license: `<p class="xbo-UI_categoryTitle">ライセンス</p><a href="https://github.com/nashikinako/XBookmarksOrganizer/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MITライセンス</a>`,
      settingOpen: "X Bookmarks Organizerの設定を開く",
      cleanFolders: "フォルダーを掃除",
      confirmCleanFolders:
        "不要なフォルダーを掃除しますか？処理開始後は中断できません！",
      cleaningFoldersMsg: "フォルダーを掃除中...",
      cleaningCompletedMsg: "フォルダーの掃除が完了しました。",
      addedToFolder: "フォルダに追加しました",
      removedFromAllFolder: "すべてのフォルダから削除しました",
      editedPostFolder: "ポストのフォルダを編集しました",
      bookmarkAdded: "ブックマークに追加しました",
      addToFolder: "フォルダに追加",
      editedPostFolder: "ポストのフォルダを編集しました",
      bkmAddedToFolder: "ブックマークとフォルダに追加しました",
      addNewFolder: "新規フォルダ",
      splitSwitch: "スペース区切りで複数追加",
      addSelectedText: "選択したテキストを追加",
      addAllHashtags: "すべてのハッシュタグを追加",
      targetAccount: "対象アカウント：",
      newAccount: "新規アカウント",
      newTargetAccountAdd: "追加",
      formatUpdateTitle:
        "バージョン1.4.0からデータの保存フォーマットが変更されました",
      formatUpdateBody: `バージョン1.4.0からアカウントごとにブックマークフォルダを作成できるようになり、それに伴いデータ保存フォーマットが変更されました。<br>
      スクリプトの使用を続行する前に、バージョン1.4.0より前のデータをどれかのアカウントに紐づけてください。`,
      formatUpdateLabel: "紐づけるアカウントのID",
      formatUpdateBtn: "紐づけて更新",
      formatUpdateConfirm:
        "本当に @%0 に以前のデータを結びつけて、データ保存フォーマットを更新しますか？",
      resetFoldersData: "全アカウントのフォルダデータをリセット",
      confirmResetFoldersData:
        "全アカウントのフォルダデータをリセットしますか？",
      select: "選択",
      selectAccountID:
        "現在使用しているアカウントのIDが取得できませんでした。操作対象のアカウントIDを選択してください。",
    },
  };
  const i18n =
    GM_getValue("lang", "auto") === "auto"
      ? i18nLib[$("html").attr("lang")] || i18nLib.en
      : i18nLib[GM_getValue("lang")];

  // ブックマークフォルダーの情報を取得する
  let bookmarksInfo = GM_getValue("bookmarksInfo", []);

  if (bookmarksInfo.length === 0) {
    GM_setValue("dataVersion", "2.0.0");
  }
  // すべてのフォルダー一覧を取得する
  let allFolders;
  let foldersPostNum;
  let accountsBkmsInfo;
  let accountID;
  // 選択されたフォルダー
  let selectedFolder;
  // フォルダの掃除中かどうか
  let isCleaning = false;
  // 現在ブックマークされているポストのID
  let allBookmarkedPosts = [];
  // すべてのブックマークされたポストが取得されたかを確認するinterval
  let checkGotAllPostsInterval;
  // チェックが完了しているとみられた回数
  let checkedCount = 0;

  let showBookmarkMsg = true;

  // 「未分類」のoption要素の値
  const uncategorizedFolderID = generateRandomStrings(32);

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
.xbo-msg-pc-wide{
  position: fixed;
  bottom: 25px;
  left: 50%;
  transform: translate(-50%, 0);
  background: rgb(29, 155, 240);
  padding: 15px;
  color: #fff;
  border-radius: 10px;
  width: 40%;
  text-align: center;
}
.xbo-msg-pc-narrow, .xbo-msg-mobile{
  position: fixed;
  bottom: 0;
  background: rgb(29, 155, 240);
  padding: 15px;
  color: #fff;
  width: 100%;
}
.xbo-msg-mobile{
  bottom: 50px;
}
.xbo-msg-pc-wide .xbo-msg-btn{
  text-decoration: underline !important;
  margin-left: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.xbo-msg-pc-narrow .xbo-msg-btn, .xbo-msg-mobile .xbo-msg-btn{
  text-decoration: underline !important;
  background: transparent;
  border: none;
  cursor: pointer;
  float: right;
  margin-right: 30px;
  font-weight: bold;
}
#xbo-settingUI, #xbo-updateInfo, #xbo-firstRunInfo, #xbo-aboutUI, #xbo-bookmarkFolderPopup, #xbo-formatUpdate, #xbo-accountIDSelect {
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
#xbo-settingUI > div, #xbo-updateInfo > div, #xbo-firstRunInfo > div, #xbo-aboutUI > div, #xbo-bookmarkFolderPopup > div, #xbo-formatUpdate > div, #xbo-accountIDSelect > div {
  overflow-y: scroll;
  height: 100%;
  padding: 15px;
  padding-right: 30px;
  box-sizing: border-box;
}
.xbo-UI * {
  margin: 0;
}
#xbo-settingUI button, #xbo-updateFormatBtn, #xbo-newTargetAccountAddBtn, #xbo-bookmarkFolderPopup button, #xbo-accountIDSelectBtn{
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
}
#xbo-newTargetAccountInput{
  margin: 10px 5px 10px 0;
}
#xbo-targetAccountSelector, #xbo-deleteTargetSelector, #xbo-newTargetAccountInput, #xbo-formatUpdateInput{
  padding: 5px;
  border-radius: 5px;
}
#xbo-deleteTargetSelector{
  margin: 0 5px 5px 0;
}
span:has(#xbo-newTargetAccountInput){
  margin-left: 5px;
}
#xbo-addNewFolderBtn{
  margin-top: 7px;
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
  top: 5px;
  right: 5px;
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
  z-index: 9999;
}
#xbo-showAllFoldersBtn{
  width: 17px;
  cursor: pointer;
  padding: 8px;
  border-radius: 9999px;
}
.xbo-folderElm, .xbo-folderAddElm{
  user-select: none;
  padding: 5px 18px 5px 18px;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  position: relative;
}
.xbo-folderElm.xbo-selected, .xbo-folderAddElm.xbo-add-selected{
  padding: 5px 26px 5px 10px;
}
.xbo-folderElm svg, .xbo-folderAddElm svg{
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
#xbo-postTextBox{
  margin: 10px 0;
}
.xbo-bookmarkFolderInput, #xbo-oldDataAccountID{
  width: 60%;
  padding: 5px;
  font-size: 16px;
  margin: 10px 0;
  vertical-align: 1px;
  border-radius: 5px;
}
#xbo-folderAddList{
  margin: 10px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
#xbo-resetFoldersDataBtn{
  margin: 10px 0 0 0;
}
@media screen and (max-width: 999px){
  .xbo-UI{
    width: 70% !important;
  }
}
@media screen and (max-width: 599px){
  .xbo-UI{
    width: 90% !important;
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
          UI: { bg: "#ffffff", color: "#000000", border: "#eff3f4" },
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
          UI: { bg: "#000000", color: "#ffffff", border: "#2f3336" },
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
          UI: { bg: "rgb(21, 32, 43)", color: "#ffffff", border: "#38444d" },
        };
        break;
    }
    $("#xbo-themeColor")
      .text(`#xbo-settingUI button, #xbo-langSelect, .xbo-folderNameInput, .xbo-bookmarkFolderInput, xbo-oldDataAccountID, #xbo-bookmarkFolderPopup button, #xbo-updateFormatBtn, #xbo-targetAccountSelector, #xbo-deleteTargetSelector, #xbo-newTargetAccountAddBtn, #xbo-accountIDSelectBtn{
  border: 2px solid ${cssColorLib.btnInput.border};
  background: ${cssColorLib.btnInput.bg};
  color: ${cssColorLib.btnInput.color};
}
#xbo-settingUI button:hover, #xbo-bookmarkFolderPopup button:hover, #xbo-updateFormatBtn:hover, #xbo-newTargetAccountAddBtn:hover, #xbo-accountIDSelectBtn:hover{
  background: ${cssColorLib.btnHover};
}
#xbo-settingUI textarea, #xbo-oldDataAccountID, #xbo-newTargetAccountInput, #xbo-formatUpdateInput{
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
.xbo-folderElm, .xbo-folderAddElm{
  background: ${cssColorLib.folderElm.bg};
  color: ${cssColorLib.folderElm.color};
}
.xbo-folderElm.xbo-selected, .xbo-folderAddElm.xbo-add-selected{
  background: ${cssColorLib.folderElmSelected};
}
.xbo-UI_bgs{
  background: ${cssColorLib.UI_bgs};
}
.xbo-UI{
  background: ${cssColorLib.UI.bg};
  color: ${cssColorLib.UI.color};
}
#xbo-folderSelectionUI{
  background: ${cssColorLib.UI.bg};
  border-bottom: ${cssColorLib.UI.border} solid 1px;
}`);
  };

  let isShowedUpdateInfo =
    GM_getValue("version", "0.0.0") === GM_info.script.version;
  let isShowedFormatUpdate = GM_getValue("dataVersion", "1.0.0") === "2.0.0";
  let isShowedFirstRun = !GM_getValue("firstRun", true);

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

      // 更新情報を更新後の起動時に表示する
      if (
        !isShowedUpdateInfo &&
        GM_getValue("version", "0.0.0") !== GM_info.script.version
      ) {
        GM_setValue("version", GM_info.script.version);
        isShowedUpdateInfo = true;
        $("#react-root").append(
          $(`<div id="xbo-updateInfo_bg" class="xbo-UI_bgs">
  <div id="xbo-updateInfo" class="xbo-UI"><div><div>
    <p class="xbo-UI_title">${i18n["updateInfoTitle"]}</p>
    <p class="xbo-UI_categoryTitle">${i18n["changeLogTitle"]}</p>
    <p>${i18n["changeLog"]}</p>
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
              document.querySelector("#xbo-updateInfo > div").clientHeight -
                30 <
              document.querySelector("#xbo-updateInfo > div > div").clientHeight
            ) {
              e.stopPropagation();
            }
          })
          .on("touchmove", function (e) {
            if (
              document.querySelector("#xbo-updateInfo > div").clientHeight -
                30 <
              document.querySelector("#xbo-updateInfo > div > div").clientHeight
            ) {
              e.stopPropagation();
            }
          });
        $("#xbo-updateInfoCloseBtn").on("click", function () {
          scrollLock(false);
          $("#xbo-updateInfo_bg").remove();
        });
      }

      if (
        !isShowedFormatUpdate &&
        GM_getValue("dataVersion", "1.0.0") !== "2.0.0"
      ) {
        isShowedFormatUpdate = true;
        $("#react-root").append(
          $(`<div id="xbo-formatUpdate_bg" class="xbo-UI_bgs">
  <div id="xbo-formatUpdate" class="xbo-UI"><div><div>
    <p class="xbo-UI_title">${i18n["formatUpdateTitle"]}</p>
    <p>${i18n["formatUpdateBody"]}</p>
    <label>${i18n["formatUpdateLabel"]}: @<input type="text" id="xbo-formatUpdateInput"></label>
    <button id="xbo-updateFormatBtn">${i18n["formatUpdateBtn"]}</button>
    </div></div></div>
</div>`)
        );
        scrollLock(true);
        $("#xbo-updateFormatBtn").on("click", function () {
          showConfirmDialog(
            i18n["formatUpdateConfirm"].replace(
              "%0",
              $("#xbo-formatUpdateInput").val()
            ),
            () => {
              bookmarksInfo = [
                {
                  id: $("#xbo-formatUpdateInput").val(),
                  folders: bookmarksInfo,
                },
              ];
              GM_setValue("bookmarksInfo", bookmarksInfo);
              GM_setValue("dataVersion", "2.0.0");
              scrollLock(false);
              $("#xbo-formatUpdate_bg").remove();
            }
          );
        });
        $("#xbo-formatUpdate > div")
          .on("wheel", function (e) {
            if (
              document.querySelector("#xbo-formatUpdate > div").clientHeight -
                30 <
              document.querySelector("#xbo-formatUpdate > div > div")
                .clientHeight
            ) {
              e.stopPropagation();
            }
          })
          .on("touchmove", function (e) {
            if (
              document.querySelector("#xbo-formatUpdate > div").clientHeight -
                30 <
              document.querySelector("#xbo-formatUpdate > div > div")
                .clientHeight
            ) {
              e.stopPropagation();
            }
          });
      }

      // 初回起動時にこのスクリプトについての説明を表示する
      if (!isShowedFirstRun && GM_getValue("firstRun", true)) {
        isShowedFirstRun = true;
        GM_setValue("firstRun", false);
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
          scrollLock(false);
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
              document.querySelector("#xbo-firstRunInfo > div > div")
                .clientHeight
            ) {
              e.stopPropagation();
            }
          })
          .on("touchmove", function (e) {
            if (
              document.querySelector("#xbo-firstRunInfo > div").clientHeight -
                30 <
              document.querySelector("#xbo-firstRunInfo > div > div")
                .clientHeight
            ) {
              e.stopPropagation();
            }
          });
        $("#xbo-firstRunInfoCloseBtn").on("click", function () {
          scrollLock(false);
          $("#xbo-firstRunInfo_bg").remove();
        });
      }

      if (GM_getValue("dataVersion", "1.0.0") !== "2.0.0") {
        return;
      }

      if (!accountID) {
        if (
          $("nav.css-175oi2r.r-18u37iz.r-drjvcx.r-ripixn.r-13qz1uu").length !==
          0
        ) {
          if (
            $(
              'a:has([d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"]), a:has([d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"])'
            ).length !== 0
          ) {
            accountID = $(
              'a:has([d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"]), a:has([d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"])'
            )
              .attr("href")
              .replace("/", "");
            accountsDataInit();
            $('[data-testid="DashButton_ProfileIcon_Link"').click();
          } else {
            $('[data-testid="DashButton_ProfileIcon_Link"').click();
          }
        } else if (
          $(
            'a:has([d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"]), a:has([d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"])'
          ).length !== 0
        ) {
          accountID = $(
            'a:has([d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"]), a:has([d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"])'
          )
            .attr("href")
            .replace("/", "");
          accountsDataInit();
        }
      }

      if (location.pathname === "/i/bookmarks") {
        // ブックマークページの場合
        if (
          !accountID &&
          $("#react-root h2 + div > span > span").length !== 0
        ) {
          accountID = $("#react-root h2 + div > span > span")
            .text()
            .replace("@", "");
          accountsDataInit();
        }
        if (!accountID) {
          return;
        }
        // フォルダー選択UIが既に追加されていない場合、フォルダー選択UIを追加する
        if ($("#xbo-folderSelectionUI").length === 0) {
          // フォルダー選択UIを追加
          $(".css-175oi2r.r-6koalj.r-18u37iz.r-1777fci.r-13qz1uu").after(
            $(`<div id="xbo-folderSelectionUI"></div>`)
          );
          $("#xbo-folderSelectionUI").append(
            $(
              `<div class="xbo-folderElm" data-folder="${uncategorizedFolderID}">${i18n["uncategorized"]}</div>`
            )
          );
          allFolders.slice(0, 10).forEach((folder, index) => {
            $("#xbo-folderSelectionUI").append(
              $(
                `<div class="xbo-folderElm" data-folder="${folder}">${folder} (${foldersPostNum[index]})</div>`
              )
            );
          });
          $("#xbo-folderSelectionUI").append(
            $(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" id="xbo-showAllFoldersBtn">${svgCodeLib["dots"]}</svg>`
            )
          );
          if (selectedFolder !== undefined) {
            // すでにボタンがある場合はそのボタンを変更し、ない場合はボタンのリストに新規追加する
            if (
              $(`.xbo-folderElm[data-folder="${selectedFolder}"]`).length === 0
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
          }
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
            allFolders.forEach((folder, index) => {
              $("#xbo-allFoldersList > div").append(
                $(
                  `<div class="xbo-folderListElm" data-folder="${folder}"><span class="xbo-folderName">${folder}</span> (<span class="xbo-foldersPostCount">${foldersPostNum[index]}</span>)
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
                  `<div class="xbo-UI_bgs" id="xbo-cleaningBg"></div>`
                );
                showMsg(i18n["cleaningFoldersMsg"], 4000);
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
                      accountsBkmsInfo = accountsBkmsInfo.filter((post) =>
                        allBookmarkedPosts.includes(post.id)
                      );
                      bookmarksInfo = bookmarksInfo.map((data) => {
                        if (data.id === accountID) {
                          data.folders = accountsBkmsInfo;
                        }
                        return data;
                      });
                      updateAllFolders();
                      GM_setValue("bookmarksInfo", bookmarksInfo);
                      showMsg(i18n["cleaningCompletedMsg"], 4000);
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
                  const postNum =
                    foldersPostNum[allFolders.indexOf(selectedFolder)];
                  $("#xbo-showAllFoldersBtn").before(
                    $(
                      `<div class="xbo-folderElm xbo-folderTemp" data-folder="${selectedFolder}">${selectedFolder} (${postNum})</div>`
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
                        const targetFolder = $(elm)
                          .find(".xbo-folderNameInput")
                          .val();
                        if ($(elm).attr("data-folder") === selectedFolder) {
                          selectedFolder = targetFolder;
                        }
                        const originalFolder = $(elm).attr("data-folder");
                        const hasMorePostThanTargetFolder =
                          accountsBkmsInfo.filter((post) =>
                            post.folders.includes(targetFolder)
                          ).length <
                          accountsBkmsInfo.filter((post) =>
                            post.folders.includes(originalFolder)
                          ).length;
                        accountsBkmsInfo.forEach((post) => {
                          if (post.folders.includes(originalFolder)) {
                            post.folders = [
                              ...new Set(
                                post.folders.map((folder) => {
                                  if (folder === originalFolder) {
                                    return targetFolder;
                                  }
                                  return folder;
                                })
                              ),
                            ];
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
                        // フォルダのポストの件数を更新する
                        $(`.xbo-folderListElm[data-folder="${targetFolder}"]`)
                          .find(".xbo-foldersPostCount")
                          .text(
                            accountsBkmsInfo.filter((post) =>
                              post.folders.includes(targetFolder)
                            ).length
                          );
                        bookmarksInfo = bookmarksInfo.map((data) => {
                          if (data.id === accountID) {
                            data.folders = accountsBkmsInfo;
                          }
                          return data;
                        });
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
                      accountsBkmsInfo.forEach((post) => {
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
                      bookmarksInfo = bookmarksInfo.map((data) => {
                        if (data.id === accountID) {
                          data.folders = accountsBkmsInfo;
                        }
                        return data;
                      });
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
                    accountsBkmsInfo.forEach((post) => {
                      if (post.folders.includes(targetFolder)) {
                        post.folders = post.folders.filter(
                          (folder) => folder !== targetFolder
                        );
                      }
                    });
                    // フォルダーが一個もないポストはデータを削除する
                    accountsBkmsInfo = accountsBkmsInfo.filter(
                      (post) => post.folders.length !== 0
                    );
                    // リストの要素を削除
                    $(elm).remove();
                    bookmarksInfo = bookmarksInfo.map((data) => {
                      if (data.id === accountID) {
                        data.folders = accountsBkmsInfo;
                      }
                      return data;
                    });
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
              accountsBkmsInfo.forEach((post) => {
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
                }
              });
              let displayCount = 0;
              $("article:has('time')").each(function (index, timeElm) {
                if (
                  !posts.includes(
                    $(timeElm).find("time").parent().attr("href").split("/")[3]
                  ) &&
                  $(timeElm).parent().parent().parent().css("display") ===
                    "none"
                ) {
                  $(timeElm).parent().parent().parent().css("display", "block");
                  displayCount += 1;
                  if (displayCount > 1) {
                    return false;
                  }
                }
              });
            } else {
              accountsBkmsInfo.forEach((post) => {
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
                }
              });
              let displayCount = 0;
              $("article:has('time')").each(function (index, timeElm) {
                if (
                  posts.includes(
                    $(timeElm).find("time").parent().attr("href").split("/")[3]
                  ) &&
                  $(timeElm).parent().parent().parent().css("display") ===
                    "none"
                ) {
                  $(timeElm).parent().parent().parent().css("display", "block");
                  displayCount += 1;
                  if (displayCount > 1) {
                    return false;
                  }
                }
              });
            }
          } else {
            let displayCount = 0;
            $("article:has('time')").each(function (index, timeElm) {
              // 表示がnoneの場合は表示する
              if (
                $(timeElm).parent().parent().parent().css("display") === "none"
              ) {
                $(timeElm).parent().parent().parent().css("display", "block");
                displayCount += 1;
                if (displayCount > 1) {
                  return false;
                }
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
    <p><select id="xbo-deleteTargetSelector"><option value="i"></option></select><button id="xbo-allFolderDeleteBtn">${i18n["deleteAllFolders"]}</button></p>
    <p><button id="xbo-resetFoldersDataBtn">${i18n["resetFoldersData"]}</button></p>
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
              $("#xbo-deleteTargetSelector").empty();
              $("#xbo-deleteTargetSelector").append(
                $(`<option value="i"></option>`)
              );
              bookmarksInfo.forEach((data) => {
                $("#xbo-deleteTargetSelector").append(
                  $(`<option value="${data.id}">@${data.id}</option>`)
                );
              });
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
                $("#xbo-deleteTargetSelector").empty();
                $("#xbo-deleteTargetSelector").append(
                  $(`<option value="i"></option>`)
                );
                bookmarksInfo.forEach((data) => {
                  $("#xbo-deleteTargetSelector").append(
                    $(`<option value="${data.id}">@${data.id}</option>`)
                  );
                });
              });
            });
            bookmarksInfo.forEach((data) => {
              $("#xbo-deleteTargetSelector").append(
                $(`<option value="${data.id}">@${data.id}</option>`)
              );
            });
            $("#xbo-allFolderDeleteBtn").on("click", function () {
              if ($("#xbo-deleteTargetSelector").val() === "i") {
                return;
              }
              showConfirmDialog(
                i18n["confirmDeleteAllFolders"].replace(
                  "%0",
                  $("#xbo-deleteTargetSelector").val()
                ),
                () => {
                  bookmarksInfo = bookmarksInfo.filter(
                    (data) => data.id !== $("#xbo-deleteTargetSelector").val()
                  );
                  $("#xbo-deleteTargetSelector option").each(function (index) {
                    if (
                      $(this).val() === $("#xbo-deleteTargetSelector").val()
                    ) {
                      $(this).remove();
                    }
                  });
                  $("#xbo-deleteTargetSelector").val("i");
                  updateAllFolders();
                  GM_setValue("bookmarksInfo", bookmarksInfo);
                }
              );
            });
            $("#xbo-resetFoldersDataBtn").on("click", function () {
              showConfirmDialog(i18n["confirmResetFoldersData"], () => {
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
    <p>${i18n["changeLog"]}</p>
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
          showFolderEditUI(postID, elm);
        });
        $(elm).on("click", function () {
          if ($(elm).attr("data-testid") === "removeBookmark") {
            if (!accountID) {
              showAccountIDSelectUI("remove", postID);
            } else {
              accountsBkmsInfo = accountsBkmsInfo.filter(
                (post) => post.id !== postID
              );
              bookmarksInfo = bookmarksInfo.map((data) => {
                if (data.id === accountID) {
                  data.folders = accountsBkmsInfo;
                }
                return data;
              });
              updateAllFolders();
              GM_setValue("bookmarksInfo", bookmarksInfo);
            }
          } else if (showBookmarkMsg) {
            showMsg(i18n["bookmarkAdded"], 6100, i18n["addToFolder"], () => {
              showFolderEditUI(postID, elm);
            });
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
});
