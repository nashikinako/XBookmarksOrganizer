# X Bookmarks Organizer Usage Guide

[< Back to README](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/README.md)

English | [日本語](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage-ja.md)

> [!NOTE]  
> The mobile version can also be used in this way by replacing click with tap and right-click with long-press.

## Data storage format has been changed since v1.4.0

![format-update.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/format-update.png)

If you have been using the script since before v1.4.0, please be sure to update it.

You will not be able to use the script until it is updated.

## Add post to folder/Edit saved bookmarks

Right-click on the bookmark button to open the Edit Folder UI.

![0.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/0.png)

- You can add the selected text as a folder by selecting the text in the area where the post content is displayed and clicking on “Add selected text”.
- You can add a hashtag as a folder by clicking on the hashtag.
- By clicking “Add all hashtags,” you can add all hashtags.
- You can add a folder by entering a folder name in the text box and clicking “New Folder”.
- If you check the “Add multiple with space separation” checkbox, you can add multiple folders at once by entering multiple folder names separated by spaces in the text box.
- The folder list below shows folders that already exist and folders you are about to add.
- Click on a folder element to add/remove it from the folder.
- If you click on a folder element to add a new one, it will be deleted and you will have to start over with one of the above steps to re-add it.

Finally, press “Save” to register the bookmark or save your edits.

### Add to folder immediately after bookmark registration

![1.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/1.png)

Click on "Add to Folder."

## Filter posts in Bookmarks page

![2.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/2.png)

By clicking on the button with the folder name on the bookmarks page, you can filter and unfilter by that folder.

## View folder list

![3.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/3.png)

Click "..." to open the folder list.

By clicking on the list element with the folder name on the list, you can filter by that folder.

Click "Edit folders" to enter editing mode.

Click "Clean Folders" to clean unnecessary folders.

## Folder editing mode

![4.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/4.png)

### Edit folder name

1. Click on the pencil symbol to be able to edit the folder name.
2. Type the folder name in the text box.
3. Click the Save button (not "Finish editing")
4. The folder name will be changed.

If there are folders with the same folder name as the changed folder name, they can be merged.

### Delete folder

You can delete folders by clicking on the Trash button.

### Finish editing mode

Click "Finish editing" to finish editing mode.

## Clean unnecessary folders

Due to a bug in the script, deletion of bookmarks in an environment without the script, etc., if data regarding posts that are not in the list of bookmarked posts in X are registered in the script's data, a folder will be generated that will not contain a single post.

You can delete such unnecessary folders by clicking "Clean Folders" on the folder list screen.

## Script's Setting

### Open setting panel

![5.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/5.png)

Click the "Open X Bookmarks Organizer setting" that is in X's setting page.

---

![6.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/6.png)

### Language

- Auto: Match the language setting of X.
- Each language can be selected and forced to change to that language.

Click the Save button to reload the page and change the language.

### Export

You can export in JSON format in the text box below by clicking on the "Export" button.

### Import and merge

Import the JSON entered in the text box below and add it to your existing data.

This method never deletes existing folders.

### Import and overwrite

Imports the JSON entered in the text box below, overwriting existing data.

> [!WARNING]  
> This method may result in the loss of data and folders in existing script accounts.

## Delete all folders for selected account

> [!WARNING]  
> You know what it means to do this (:>)

## Reset folder data for all accounts

> [!WARNING]  
> you know what it means to do this (:>)
