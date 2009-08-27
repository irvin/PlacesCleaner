var PlacesCleaner = {
	onLoad: function(){
		var intViewTime = PlacesCleaner.getintViewTime();
		var intDayInterval = PlacesCleaner.getintDayInterval();
        var booAutoClean = PlacesCleaner.checkAutoClean();
		var charLastVacuumTime = PlacesCleaner.getLastVacuumTime();

        var console = Components.classes["@mozilla.org/consoleservice;1"]  .getService(Components.interfaces.nsIConsoleService);
        console.logStringMessage("intViewTime: " + intViewTime + " intDayInterval: " + intDayInterval + " booAutoClean: " + booAutoClean + " charLastVacuumTime: " + charLastVacuumTime);

		// preference observer (useless now)
		// myListener.register(); 
				
		// Autoclean
		var intVacuumInterval = Date.now() - charLastVacuumTime - (intDayInterval * 1000 * 60 * 60 * 24)		
		console.logStringMessage("date now: " + Date.now() + " charLastVacuumTime: " + charLastVacuumTime + " intDayInterval * 1000 * 60 * 60 * 24: " + (intDayInterval * 1000 * 60 * 60 * 24) + " intVacuumInterval: " + intVacuumInterval);
		if (booAutoClean == true){
			if (intVacuumInterval >= 0) {
				console.logStringMessage("Enter autoclean");
				PlacesCleaner.onClickStatusIcon();
			}
		}

	},
	
	onUnload: function(){
		myListener.unregister();

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
			// Display begin clean message
            var strGetRes = document.getElementById("strRes");
            var text = strGetRes.getString("BeginClean");
     		var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
            alertsService.showAlertNotification("chrome://PlacesCleaner/content/edit-clear-32.png",  "PlacesCleaner", text, false);
	        
            intViewTime = PlacesCleaner.getintViewTime();
            intViewTime = intViewTime.toString();
	
			// Begin clean	
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_historyvisits WHERE place_id IN (SELECT id FROM moz_places WHERE visit_count <=" + intViewTime + ");");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_places WHERE (visit_count <= " + intViewTime + " AND hidden <> 1 AND id NOT IN (SELECT place_id FROM moz_annos UNION SELECT fk FROM moz_bookmarks));");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_inputhistory WHERE place_id NOT IN (SELECT id FROM moz_places);");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_favicons WHERE id NOT IN (SELECT favicon_id FROM moz_places);");
			Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("DELETE FROM moz_annos WHERE anno_attribute_id IN (SELECT id FROM moz_anno_attributes WHERE name = 'google-toolbar/thumbnail-score' OR name = 'google-toolbar/thumbnail');");
	        Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsPIPlacesDatabase).DBConnection.executeSimpleSQL("VACUUM");

			// Display end clean message
			var text = strGetRes.getString("EndClean");
			alertsService.showAlertNotification("chrome://PlacesCleaner/content/edit-clear-32.png",  "PlacesCleaner", text, false);
			
			// Save last clean time			
			var LastVacuumDay = Date.now();
			var pref = Components.classes['@mozilla.org/preferences-service;1']  
				.getService(Components.interfaces.nsIPrefBranch);  
			pref.setCharPref('extensions.PlacesCleaner.lastvacuumtime', LastVacuumDay);
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
	
	getLastVacuumTime: function() {
	     return Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getCharPref("lastvacuumtime");
	},

};


// preference observer from https://developer.mozilla.org/en/Code_snippets/Preferences#Using_preference_observers
/*
function PrefListener(branchName, func)
{
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService);
    var branch = prefService.getBranch(branchName);
    branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

    this.register = function()
    {
        branch.addObserver("", this, false);
        branch.getChildList("", { })
              .forEach(function (name) { func(branch, name); });
    };

    this.unregister = function unregister()
    {
        if (branch)
            branch.removeObserver("", this);
    };

    this.observe = function(subject, topic, data)
    {
        if (topic == "nsPref:changed")
            func(branch, data);
    };
}

var myListener = new PrefListener("extensions.PlacesCleaner.", 
	function(branch, name){
		var console = Components.classes["@mozilla.org/consoleservice;1"]  .getService(Components.interfaces.nsIConsoleService);
		switch (name){
			case "viewtime":
				console.logStringMessage("viewtime change");			
			break;
			case "autoclean":
				var booAutoClean = PlacesCleaner.checkAutoClean();
			    console.logStringMessage("booAutoClean=" + booAutoClean);
				if (booAutoClean == true) {
				}
				if (booAutoClean == false) {
				}
			break;
			case "dayinterval":
				console.logStringMessage("dayinterval change");			
			break;

		}
	}
);
*/

window.addEventListener("load", PlacesCleaner.onLoad, false);
window.addEventListener("unload", PlacesCleaner.onUnload, false);
