var PlacesCleaner = {
	onLoad: function(){
		var booAutoClean = PlacesCleaner.checkAutoClean();
		var booHideStatus = PlacesCleaner.checkHideStatus();
		var booOnlyVacuum = PlacesCleaner.checkOnlyVacuum();
		var booBackupFile = PlacesCleaner.checkBackupFile();
		var booShowFileInfo = PlacesCleaner.checkShowFileInfo();
		var intViewTime = PlacesCleaner.getintViewTime();
		var intDayInterval = PlacesCleaner.getintDayInterval();
		var charLastVacuumTime = PlacesCleaner.getLastVacuumTime();
		var intVacuumInterval = Date.now() - charLastVacuumTime - (intDayInterval * 1000 * 60 * 60 * 24)		

		// Check and hide statusbar icon		
		if (booAutoClean == true){
				document.getElementById("PlacesCleaner-panel").hidden = true;
		} else if (booHideStatus == true){
			if (intVacuumInterval <0 )
				document.getElementById("PlacesCleaner-panel").hidden = true;
		}

		// Autoclean
		if (booAutoClean == true){
			if (intVacuumInterval >= 0) {
				var console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        		console.logStringMessage("Auto Clean");
				PlacesCleaner.cleanIt();
			}
		}

	},
	
	onUnload: function(){
	},
	
	
	openOptions: function(){		
		/* instantApply needs dialog = no */
		/* Copied from chrome://mozapps/content/extensions/extensions.js in Firefox */
		var features;
		var instant_apply = true;
		try {
			var root_prefs = Components.classes["@mozilla.org/preferences-service;1"]
			                           .getService(Components.interfaces.nsIPrefBranch);
			instant_apply = root_prefs.getBoolPref("browser.preferences.instantApply");
			features = "chrome,titlebar,toolbar,centerscreen" + (instant_apply ? ",dialog=no" : ",modal");
		} catch (e) {
			features = "chrome,titlebar,toolbar,centerscreen,modal";
		}
		pref_window = window.openDialog('chrome://PlacesCleaner/content/prefs.xul', '', features);
		pref_window.focus();

	},
	
	onClickStatusIcon: function() {
		PlacesCleaner.cleanIt();
	},	
	
	
	cleanIt: function(){
		
		/*	Code to check file info and backup places.sqlite
			Adapted from Bootleq http://bootleq.blogspot.com/2009/10/placescleaner-bookmarklet_14.html */
		var ProfD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		var sqliteFile = ProfD.clone();
		sqliteFile.append("places.sqlite");

		//Calculate file size and places database recoeds num.
		var booShowFileInfo = PlacesCleaner.checkShowFileInfo();
		if(booShowFileInfo == true) {
			var originalSize = sqliteFile.fileSize;			
			//Get history items number before cleaning
			var numbe = Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.createStatement("SELECT count(*) FROM moz_historyvisits;");
			try{
				while (numbe.step()) {  
					var originalRecords = numbe.getString(0);
				} 
			}  
			finally {  
				numbe.reset();  
			}
		}

		//Backup places.sqlite	
		var booBackupFile = PlacesCleaner.checkBackupFile();
		if(booBackupFile == true) {
			var bkFile = ProfD.clone();
			bkFile.append("placescleaner_places.bak");
			if (bkFile.exists()) bkFile.remove(true);
			try {
				sqliteFile.copyTo( ProfD, bkFile.leafName );
			}
			catch(e) {
				alert('Backup places database error!\n '+e);
				return;
			}
		}		

		
		// Display begin clean message
		var strGetRes = document.getElementById("strRes");
		var text = strGetRes.getString("BeginClean");
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
		alertsService.showAlertNotification("chrome://PlacesCleaner/content/edit-clear-32.png",  "PlacesCleaner", text, false);
		
		var booOnlyVacuum = PlacesCleaner.checkOnlyVacuum();
		var booHideStatus = PlacesCleaner.checkHideStatus();
		var intViewTime = PlacesCleaner.getintViewTime();
		intViewTime = intViewTime.toString();

		// Begin clean	
		
		if (booOnlyVacuum == false){
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_historyvisits WHERE place_id IN (SELECT id FROM moz_places WHERE visit_count <=" + intViewTime + ");");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_places WHERE (visit_count <= " + intViewTime + " AND hidden <> 1 AND id NOT IN (SELECT place_id FROM moz_annos UNION SELECT fk FROM moz_bookmarks));");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_inputhistory WHERE place_id NOT IN (SELECT id FROM moz_places);");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_favicons WHERE id NOT IN (SELECT favicon_id FROM moz_places);");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_annos WHERE anno_attribute_id IN (SELECT id FROM moz_anno_attributes WHERE name = 'google-toolbar/thumbnail-score' OR name = 'google-toolbar/thumbnail');");
		} else {
			var console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        	console.logStringMessage("Only Vacuum!");
		}
		
        Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("VACUUM");

		
		// Display end clean message
		var text = strGetRes.getString("EndClean");
		// Display After clean fileinfo
		if(booShowFileInfo == true) {
			sqliteFile = ProfD.clone();
			sqliteFile.append("places.sqlite");
			//Calculate file size reduced ratio	
			var ratio = Math.round( (originalSize-sqliteFile.fileSize)*10000/originalSize )/100;
			//Get history items number after cleaning
			var numbe = Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.createStatement("SELECT count(*) FROM moz_historyvisits;");
			try{
				while (numbe.step()) {  
					var afterRecords = numbe.getString(0);
				}
			}  
			finally {  
				numbe.reset();  
			}
			
			var recordsnum = afterRecords - originalRecords;		
			
			var text2 = strGetRes.getString("FileSizeAfter");	
			var text3 = strGetRes.getString("FileSizeReduce");
			text = text + '\n' + text2 + ' ' + Math.round(originalSize/10.24)/100 + ' KB → ' + Math.round(sqliteFile.fileSize/10.24)/100 + ' KB' + text3 + ' ' + ratio  + '%' ;
			var text2 = strGetRes.getString("FileRecordsAfter");	
			var text3 = strGetRes.getString("FileRecordsReduce");
			var text4 = strGetRes.getString("FileRecordsName");
			text = text + '\n' + text2 + ' ' + originalRecords + ' → ' + afterRecords + ' ' + text4 + text3 + ' ' + recordsnum  + ' ' + text4 ;
		}
				
		alertsService.showAlertNotification("chrome://PlacesCleaner/content/edit-clear-32.png",  "PlacesCleaner", text, false);
		
		// Save last clean time			
		var LastVacuumDay = Date.now();
		var pref = Components.classes['@mozilla.org/preferences-service;1']  
			.getService(Components.interfaces.nsIPrefBranch);  
		pref.setCharPref('extensions.PlacesCleaner.lastvacuumtime', LastVacuumDay);
		
		// If set manual and hide statusbar icon, hide it
		if (booHideStatus == true)
			document.getElementById("PlacesCleaner-panel").hidden = true;
	},
	
	getintViewTime: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getIntPref("viewtime");
	},
    
    getintDayInterval: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getIntPref("dayinterval");
	},

	checkAutoClean: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getBoolPref("autoclean");
	},

	checkOnlyVacuum: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getBoolPref("onlyvacuum");
	},

	checkHideStatus: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getBoolPref("hidestatus");
	},
	

	checkBackupFile: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getBoolPref("backupfile");
	},
	
	checkShowFileInfo: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getBoolPref("showfileinfo");
	},	

	getLastVacuumTime: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getCharPref("lastvacuumtime");
	},

};




window.addEventListener("load", PlacesCleaner.onLoad, false);
window.addEventListener("unload", PlacesCleaner.onUnload, false);
