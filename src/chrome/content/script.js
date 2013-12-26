var PlacesCleaner = {
	onLoad: function(){
		var booAutoClean = PlacesCleaner.checkAutoClean();
		var booHideStatus = PlacesCleaner.checkHideStatus();
		var booOnlyVacuum = PlacesCleaner.checkOnlyVacuum();
		var booBackupFile = PlacesCleaner.checkBackupFile();
		var intViewTime = PlacesCleaner.getintViewTime();			// Delete viewer time less than ...
		var intDayInterval = PlacesCleaner.getintDayInterval();		// Checking every ... days
		var intPreserveDay = PlacesCleaner.getintPreserveDay();	//Preserve records newer than setting day interval
		var charLastVacuumTime = PlacesCleaner.getLastVacuumTime();	// Last vacuum time in BSD time
		var intVacuumInterval = Date.now() - charLastVacuumTime - (intDayInterval * 1000 * 60 * 60 * 24)	// How many sec passed after day interval		

		// Check and hide statusbar icon		
		if (booAutoClean == true){
			document.getElementById("PlacesCleaner-panel").hidden = true;	// Always hide when auto clean mode
			if (intVacuumInterval >= 0) {		// If last vacuum older than intDayInterval, vacuum it
				var console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        		console.logStringMessage("Auto Clean");
				PlacesCleaner.cleanIt();
			}
		} else if (booHideStatus == true){	
			// Hide if not pass day interval since lase vacuum
			if (intVacuumInterval <0 )	document.getElementById("PlacesCleaner-panel").hidden = true;
		}
	},
	
	openOptions: function(){		
		/* 
		 * instantApply needs dialog = no
		 * Copied from chrome://mozapps/content/extensions/extensions.js in Firefox
		 * Codes from littlebtc
		 */
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
		
		// Init nsIPromptService for display alert dialog
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		
		// Init nsIAlertsService and click listener nsIObserver
		// Listener to handle click on the end-clean alert message
		var listener = {
			observe: function(subject, topic, data) {
				if (topic == "alertclickcallback")
					prompts.alert(null, "PlacesCleaner", data);
			}
		}	
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
		
		
		/*	Code to check file info and backup places.sqlite
			Adapted from Bootleq http://bootleq.blogspot.com/2009/10/placescleaner-bookmarklet_14.html */
		var ProfD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		var sqliteFile = ProfD.clone();
		sqliteFile.append("places.sqlite");

		//Calculate file size and places database recoeds num.
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
				alert('Backup places database error!'+ PlacesCleaner.getEol() +e);
				return;
			}
		}	

		var booOnlyVacuum = PlacesCleaner.checkOnlyVacuum();
		var booHideStatus = PlacesCleaner.checkHideStatus();
		var intViewTime = PlacesCleaner.getintViewTime();
		var intPreserveDay = PlacesCleaner.getintPreserveDay();	//Preserve records newer than setting day interval
		var intDayInterval = PlacesCleaner.getintDayInterval();	// Checking every ... days
		var intPreservePRtime = (Date.now() - (intPreserveDay * 60 * 60 * 24 * 1000)) * 1000;	//If last_visit_date not older than intPreserveBSDtime, don't delete it
		var intVacuumInterval = Date.now() - (intDayInterval * 1000 * 60 * 60 * 24);	// How many sec passed after day interval

		intViewTime = intViewTime.toString();

		// Begin clean	
		
		if (booOnlyVacuum == false){
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection
				.executeSimpleSQL("DELETE FROM moz_historyvisits WHERE place_id IN (SELECT id FROM moz_places WHERE (visit_count <=" + intViewTime + ") AND (last_visit_date < " + intPreservePRtime + "));");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection
				.executeSimpleSQL("DELETE FROM moz_places WHERE (visit_count <= " + intViewTime + " AND (last_visit_date < " + intPreservePRtime + ") AND hidden <> 1 AND id NOT IN (SELECT place_id FROM moz_annos UNION SELECT fk FROM moz_bookmarks));");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection
				.executeSimpleSQL("DELETE FROM moz_inputhistory WHERE place_id NOT IN (SELECT id FROM moz_places);");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection
				.executeSimpleSQL("DELETE FROM moz_favicons WHERE id NOT IN (SELECT favicon_id FROM moz_places);");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection
				.executeSimpleSQL("DELETE FROM moz_annos WHERE anno_attribute_id IN (SELECT id FROM moz_anno_attributes WHERE name = 'google-toolbar/thumbnail-score' OR name = 'google-toolbar/thumbnail');");
		} else {
			var console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        	console.logStringMessage("Only Vacuum!");
		}
		
        Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("VACUUM");

		
		// Display end clean message
		var strGetRes = document.getElementById("strRes");
		var text = strGetRes.getString("EndClean");
		var detailtext = "";
		
		// Display after clean fileinfo 
		
		// Calculate file size reduced ratio	
		sqliteFile = ProfD.clone();
		sqliteFile.append("places.sqlite");
		var ratio = Math.round( (originalSize-sqliteFile.fileSize)*10000/originalSize )/100;
		
		// Get after clean history items number
		var numbe = Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.createStatement("SELECT count(*) FROM moz_historyvisits;");
		try{
			while (numbe.step()) {  
				var afterRecords = numbe.getString(0);
			}
		}  
		finally {  
			numbe.reset();  
		}
		
		var recordsnum = originalRecords - afterRecords;		
				
		var text2 = strGetRes.getString("FileSizeAfter");	
		var text3 = strGetRes.getString("FileSizeReduce");
		detailtext = text2 + ' ' + Math.round(originalSize/10.24)/100 + ' KB → ' + Math.round(sqliteFile.fileSize/10.24)/100 + ' KB' + text3 + ' ' + ratio  + '%' ;
		var text2 = strGetRes.getString("FileRecordsAfter");	
		var text3 = strGetRes.getString("FileRecordsReduce");
		var text4 = strGetRes.getString("FileRecordsName");
		detailtext = detailtext + '\n' + text2 + ' ' + originalRecords + ' → ' + afterRecords + ' ' + text4 + text3 + ' ' + recordsnum  + ' ' + text4 ;	

		// if (PlacesCleaner.getPlatform() == 'mac'){
		// Mac can handle multi line alert message
		// alertsService.showAlertNotification("chrome://PlacesCleaner/content/edit-clear-32.png",  "PlacesCleaner", longtext, true, longtext, listener);
		alertsService.showAlertNotification("chrome://PlacesCleaner/content/edit-clear-32.png",  "PlacesCleaner", text, true, detailtext, listener);
				
		// Save last clean time			
		var LastVacuumDay = Date.now();
		var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);  
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

	getintPreserveDay: function() {
		return Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.PlacesCleaner.")
		.getIntPref("preserveday");
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

	getLastVacuumTime: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getCharPref("lastvacuumtime");
	},
		
	// String EOL platform dependent
	// http://forums.mozillazine.org/viewtopic.php?f=19&t=572038
	/*
	getPlatform: function() {
	    var p = navigator.platform.toLowerCase(); // platform
	    if(p.indexOf('win') != -1) return 'win'; // win
	    else if(p.indexOf('mac') != -1) return 'mac'; // mac
	    else if(p.indexOf('linux') != -1) return 'linux'; // linux	    
	    else return 'other'; // other (nix)
	},
	*/
	
	getEol: function() {
		//Useless because alert message couldn't handle multiline message
		return '\n';	
		
		/*
		var console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        switch(PlacesCleaner.getPlatform()) {
	        case 'win': 
		       	console.logStringMessage("win");
	        	return '\r\n';
	        case 'mac': 
		       	console.logStringMessage("mac");
	        	return '\r\n';
	        case 'linux': 
		       	console.logStringMessage("linux");
	        	return '\r\n';	        	
	        case 'other': 
		       	console.logStringMessage("oth");
	        	return '\n';
	        default: 
	        	return '<eol>';
	    }
	    */
	},

};

window.addEventListener("load", PlacesCleaner.onLoad, false);
window.addEventListener("unload", PlacesCleaner.onUnload, false);
