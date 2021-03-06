Lucky Duck Scriptures in JavaScript
==============

A Chrome Extension that allows you to download and view scripture content from churchofjesuschrist.org. The app does _not_ provide the content visible through the app. All content is property of the Church of Jesus Christ of Latter-day Saints.

>This project is unmaintained. I have a problem with the Chrome extension platform. They were breaking things far too often, mostly in the name of security, and I don't want to try to keep up. It was also very frustrating that I would get it working on my computer, but the Web Store had much more strigent requirements, preventing me from every getting a rewrite that both worked and satisfied the security requirements at the same time. Making it a Chrome extension was a work around for the content security policy anyway. A rewrite may occur occur in the future, but under a project.

##Disclaimer
This Application was not developed by or in association with The Church of Jesus Christ of Latter-day Saints or any affiliate of the Church of Jesus Christ of Latter-day Saints. Accordingly, The Church of Jesus Christ of Latter-day Saints and its affiliates are not responsible for the content or the functioning of this Application. Rather, the developer of this Application is solely responsible for its content and functioning. Further, you should understand that this Application is neither owned by nor endorsed by The Church of Jesus Christ of Latter-day Saints. However, any trademarks or service marks associated with The Church of Jesus Christ of Latter-day Saints that may be displayed in this Application are owned by Intellectual Reserve, Inc. or other entity affiliated with The Church of Jesus Christ of Latter-day Saints.

I originally planned to put this on the Chrome Web Store, but I discovered that they are now blocking many of the API features I need for the app to operate. The source code is provided for those that would like to download and install it into their own Chrome installs, circumventing the Web Store.

I am no longer able to develop the extension much anymore, so I also hope that it will continue to be improved. If you would like to submit me pull requests, go ahead. I would love for the project to live on.

#Installation instructions
1. In GitHub, click "Download ZIP"
2. Extract the zip to some folder on your computer
2. In Chrome, click on the menu and go to settings
3. Click "Extensions" on the left side
4. Ensure that "Developer mode" is checked, if not already
5. Click "Load unpacked extension..."
6. Find the folder to which you unpacked the zipped folder and click OK

#Development
This extension uses IndexedDB to store the data from JSON files it downloads. The API's are intended for [The Church of Jesus Christ of Latter-Day Saints apps](https://churchofjesuschrist.org). Feel free to contact me with questions on how it works, etc.
