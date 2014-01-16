import xbmc
import xbmcaddon
import xbmcgui
 
__addon__       = xbmcaddon.Addon(id='plugin.video.ldsscriptures')
__addonname__   = __addon__.getAddonInfo('name')
__icon__        = __addon__.getAddonInfo('icon')

title = "LDS Scriptures"
text = "This is some text"
time = 5000  # ms
 

class MyClass(xbmcgui.Window):
	print "Hello World"
