var PrefWindow = {

	chkAutoClean: function(){	
		var booAutoClean = Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.PlacesCleaner.")
         .getBoolPref("autoclean");
		var element = document.getElementById("PlacesCleaner-chkAuto");
		var auto = document.getElementById("item-auto");
		var manual = document.getElementById("item-manual");
		var manual2 = document.getElementById("item-manual2");

		if (booAutoClean == true){
			element.selectedIndex = 0;
			manual.setAttribute("disabled", true);
			manual2.setAttribute("disabled", true);

			auto.removeAttribute("disabled");
		}else{
			element.selectedIndex = 1;
			auto.setAttribute("disabled", true);
			manual.removeAttribute("disabled");

			var booHideStatus = Components.classes["@mozilla.org/preferences-service;1"]
	         .getService(Components.interfaces.nsIPrefService)
	         .getBranch("extensions.PlacesCleaner.")
	         .getBoolPref("hidestatus");
			
			if (booHideStatus==false){
				manual.removeAttribute("checked");
				manual2.setAttribute("disabled", true);
			}else {
				manual.setAttribute("checked", true);
				manual2.removeAttribute("disabled");
			}

		}
	},
	
	setHideStatus: function(){
		var manual = document.getElementById("item-manual");
		var manual2 = document.getElementById("item-manual2");
					
		if (manual.hasAttribute("checked") == true){
   			manual2.removeAttribute("disabled");
		}else {
			manual2.setAttribute("disabled", true);
		}
	},
	
	setAutoClean: function(){
		var auto = document.getElementById("item-auto");
		var manual = document.getElementById("item-manual");
		var manual2 = document.getElementById("item-manual2");

		var element = document.getElementById("PlacesCleaner-chkAuto");
		var autoclean = element.selectedIndex;
		if (autoclean == 0){
			manual.setAttribute("disabled", true);
			manual2.setAttribute("disabled", true);
			auto.removeAttribute("disabled");
		}else {
			auto.setAttribute("disabled", true);
			manual.removeAttribute("disabled");
			
			if (manual.hasAttribute("checked") == true){
	   			manual2.removeAttribute("disabled");
			}else {
				manual2.setAttribute("disabled", true);
			}
		}
    },

	setOnlyVacuum: function(){
		var element = document.getElementById("chk-vacuum");
		var element2 = document.getElementById("PlacesCleaner-viewtime");
		if (element.hasAttribute("checked")==true){
	        element2.setAttribute("disabled", "true");
		} else {
	        element2.removeAttribute("disabled");
		}
         
    },

};
