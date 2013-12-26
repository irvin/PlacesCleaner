→ [中文](http://code.google.com/p/placescleaner/wiki/ZhHome)

# PlacesCleaner extension

[![](https://98b9ed33-a-62cb3a1a-s-sites.googlegroups.com/site/bilogiifilestorage/Home/follow-on-twitter.png?attachauth=ANoY7crIYqbci8prb1u4pQvlSd9mrOlCJv-CxF1Py2VhvDuipJzhjKTBFsah6jgWvfJyAURPl9JdByP8NxKJJH1r8CVmEm_51jmkE07HmxV2mCjgbHWB3HFACM5xgesSnhdzECZvrov4bxelf7gbY0xKfJKzLgxqPYNY9OlJLmXb9Uocxo_HOQvrTaRZqWL3gplXWmVE0uEPyzjObdFbHr5K3kqWHOOxFCEOZfRu7mMjvaprAcUyQns%3D&attredirects=0)](https://twitter.com/placescleaner)


##What's New

0.42

 * Fix notification after Firefox 22
 * Update compatible to Firefox 28.*

0.41

 * Update locales for cs-CZ, de, pt-BR, sv-SE, uk-UA

0.40

 * Prevent recently records within desire periods to be delete.
 * Compatible for Firefox 4.0 beta.
 * 0.4 Init. release with en-US, es-ES, fr, nl, pl, pt-PT, ru, sr, zh-CN, zh-TW languages.
  
[Version History](https://code.google.com/p/placescleaner/wiki/VersionHistory)


##Installation

1. Open [PlacesCleaner :: Add-ons for Firefox](https://addons.mozilla.org/firefox/addon/13860/)   
2. Click "+ Add to Firefox".

----

##Introduction

This extension can be handy to clean up your firefox places database.
It will:
 # Delete history entries which have been rarely accessed (default is twice, you can chage the value)
 # Vacuum it, in order to keep the places database clean, compact and efficient.
 # It also deals with website screenshot data from some buggy versions of Google Toolbar, which will cause your places.sqlite growing extremely bigger. (In some cases, the file size will reach hundreds of megabytes.)

The extension is designed based on the following article (only in chinese, sorry):
[http://mozlinks-zh.blogspot.com/2009/05/firefox-3.html](http://mozlinks-zh.blogspot.com/2009/05/firefox-3.html)


##Localization

The languages available: fr, de-DE, es-ES, zh-TW, sr-RS, ru-RU, pt-PT, mk-MK, en-US, zh-CN, pt-BR, pl-PL

You can help us translate the extension on [BabelZilla](http://www.babelzilla.org/index.php?option=com_wts&Itemid=203&type=show&extension=5176).


##Instruction

 * Simply click on the statusbar icon to clean places database.

![](http://farm4.static.flickr.com/3504/3884136790_3c1da2a7e8_o.png)

 * Click on the "End Clean" message to view detailed infomation.

![](http://farm3.static.flickr.com/2768/4076901513_128c1c854d_o.png)

##Preference

 * Open preference window by right-click menu of statusbar icon or tools menu

![](http://farm3.static.flickr.com/2677/4076901557_ed1be0089e_o.png)

###Automatic cleaning mode

 * Automatic clean after opening Firefox for every 30 days. _Adjustable_
 * It's not recommended to clean your places database too often, it may lower Firefox performance

###Maunal mode

 * Ability to hide statusbar icon for 30 days after clean. _Adjustable_

###Vacuum only

 * Select "Only vacuum" to disable deleting useless browse history entries, default is disable.

###Backup places datebase file

 * By select the option, PlacesCleaner will backup "places.sqlite" into "placescleaner_places.bak" in your Firefox profile directory before cleaning.
 * If you want to restore the places database, just rename the backup file back to "places.sqlite", and restart Firefox.
 * Backup procedure only keep the last backup file, thus remember to move it elsewhere if you need it.

----
## Donation History

[Donation details](https://code.google.com/p/placescleaner/wiki/Donation)