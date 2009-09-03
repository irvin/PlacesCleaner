var PlacesCleaner = {
	onLoad: function(){
        var booAutoClean = PlacesCleaner.checkAutoClean();
        var booHideStatus = PlacesCleaner.checkHideStatus();
        var booOnlyVacuum = PlacesCleaner.checkOnlyVacuum();
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
	
	getLastVacuumTime: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getCharPref("lastvacuumtime");
	},

};




window.addEventListener("load", PlacesCleaner.onLoad, false);
window.addEventListener("unload", PlacesCleaner.onUnload, false);
