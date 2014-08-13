LDS Scriptures
==============

A Chrome Extension that allows you to download and view scripture content from lds.org

I originally planned to put this on the Chrome Web Store, but I discovered that they are now blocking many of the API features I need for the app to operate. The source code is provided for those that would like to download and install it into their own Chrome installs, circumventing the Web Store.

I no longer plan to develop the extension anymore, so I also hope that it will be forked from here and improved. If you would like to submit pull requests from me, go ahead. I would love for the project to live on.

#Installation instructions
1. In GitHub, click "Download ZIP"
2. Extract the zip to some folder on your computer
2. In Chrome, click on the menu and go to settings
3. Click "Extensions" on the left side
4. Ensure that "Developer mode" is checked, if not already
5. Click "Load unpacked extension..."
6. Find the folder to which you unpacked the zipped folder and click OK

#Notes to Developers
This extension uses IndexedDB to store the data from JSON files it downloads. The API's are intended for [The Church of Jesus Christ of Latter-Day Saints apps](https://lds.org). Feel free to contact me with questions on how it works, etc.
