# X Bookmarks Organizer Usage Guide

[< Back to README](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/README.md)

English ver. | [日本語版](https://github.com/nashikinako/XBookmarksOrganizer/blob/main/usage-ja.md)

> [!NOTE]  
> Some of the images are the UI from the previous version, but there are no major differences from the current version. Please understand.  
> The mobile version can also be used in this way by replacing click with tap and right-click with long-press.

## Add post to folder

![0.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/0.png)

1. Right-click on the bookmark button to open the Edit Folder UI.
2. Input folders' name to textbox.
3. Click the bookmark button.
4. You have now added the bookmark to X and saved the folder info to the script data.

Separate folders from each other with a space. If a folder name contains spaces, replace them with such things as underscores or hyphens.

---

![1.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/1.png)

Using the selection box, you can easily add posts to an existing folder.

Click on an option item to add or remove it from the folder.

### Add to folder immediately after bookmark registration

![7.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/7.png)

Click on "Add to Folder."

![8.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/8.png)

You can add folders in the same way as above for adding folders.

Finally, press "Save" to save the file.

## Edit folder of post

![2.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/2.png)

You can edit a folder of already bookmarked posts by editing the folder and clicking the "Update" button in the same way as when adding to a folder.

## Filter posts in Bookmarks page

![3.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/3.png)

By clicking on the button with the folder name on the bookmarks page, you can filter and unfilter by that folder.

## View folder list

![4.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/4.png)

Click "..." to open the folder list.

By clicking on the list element with the folder name on the list, you can filter by that folder.

Click "Edit folders" to enter editing mode.

Click "Clean Folders" to clean unnecessary folders.

## Folder editing mode

![5.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/5.png)

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

![9.png](https://raw.githubusercontent.com/nashikinako/XBookmarksOrganizer/main/usage-imgs/9.png)

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
> This method may result in the loss of existing folders.

## Delete all folders

> [!WARNING]  
> You will know what it means that you are doing this (:>)
