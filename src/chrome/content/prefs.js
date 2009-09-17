var PrefWindow = {

	chkAutoClean: function(){	
		var booAutoClean = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.PlacesCleaner.")
			.getBoolPref("autoclean");
		var element = document.getElementById("PlacesCleaner-chkAuto");
		var auto = document.getElementById("item-auto");
		var auto1 = document.getElementById("item-auto1");
		var auto2 = document.getElementById("item-auto2");
		var manual = document.getElementById("item-manual");
		var manual1 = document.getElementById("item-manual1");
		var manual2 = document.getElementById("item-manual2");
		var manual3 = document.getElementById("item-manual3");
		var restart = document.getElementById("restart");

		if (booAutoClean == true){
			element.selectedIndex = 0;
			manual.setAttribute("disabled", true);
			manual1.setAttribute("disabled", true);
			manual2.setAttribute("disabled", true);
			manual3.setAttribute("disabled", true);
			restart.setAttribute("disabled", true);
			
			auto.removeAttribute("disabled");
			auto1.removeAttribute("disabled");
			auto2.removeAttribute("disabled");
						
		}else{
			element.selectedIndex = 1;
			auto.setAttribute("disabled", true);
			auto1.setAttribute("disabled", true);
			auto2.setAttribute("disabled", true);
			manual.removeAttribute("disabled");
			manual1.removeAttribute("disabled");
			manual2.removeAttribute("disabled");
			manual3.removeAttribute("disabled");
			restart.setAttribute("disabled", true);

			var booHideStatus = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.PlacesCleaner.")
				.getBoolPref("hidestatus");
			
			if (booHideStatus==false){
				manual.removeAttribute("checked");
				manual1.setAttribute("disabled", true);
				manual2.setAttribute("disabled", true);
				manual3.setAttribute("disabled", true);
			}else {
				manual.setAttribute("checked", true);
				manual1.removeAttribute("disabled");
				manual2.removeAttribute("disabled");
				manual3.removeAttribute("disabled");
			}

		}
		
		PrefWindow.setOnlyVacuum();

	},
	
	setHideStatus: function(){
		var manual = document.getElementById("item-manual");
		var manual1 = document.getElementById("item-manual1");
		var manual2 = document.getElementById("item-manual2");
		var manual3 = document.getElementById("item-manual3");
		var restart = document.getElementById("restart");
					
		restart.removeAttribute("disabled");
			
		if (manual.hasAttribute("checked") == true){
   			manual1.removeAttribute("disabled");			
   			manual2.removeAttribute("disabled");
   			manual3.removeAttribute("disabled");
		}else {
			manual1.setAttribute("disabled", true);
			manual2.setAttribute("disabled", true);
			manual3.setAttribute("disabled", true);
		}
	},
	
	setAutoClean: function(){
		var auto = document.getElementById("item-auto");
		var auto1 = document.getElementById("item-auto1");
		var auto2 = document.getElementById("item-auto2");
		var manual = document.getElementById("item-manual");
		var manual1 = document.getElementById("item-manual1");
		var manual2 = document.getElementById("item-manual2");
		var manual3 = document.getElementById("item-manual3");
		var restart = document.getElementById("restart");

		var element = document.getElementById("PlacesCleaner-chkAuto");
		var autoclean = element.selectedIndex;
		if (autoclean == 0){
			manual.setAttribute("disabled", true);
			manual1.setAttribute("disabled", true);
			manual2.setAttribute("disabled", true);
			manual3.setAttribute("disabled", true);
			restart.setAttribute("disabled", true);
			auto.removeAttribute("disabled");
			auto1.removeAttribute("disabled");
			auto2.removeAttribute("disabled");
		}else {
			auto.setAttribute("disabled", true);
			auto1.setAttribute("disabled", true);
			auto2.setAttribute("disabled", true);
			manual.removeAttribute("disabled");

			if (manual.hasAttribute("checked") == true){
				manual1.removeAttribute("disabled");
				manual2.removeAttribute("disabled");
				manual3.removeAttribute("disabled");			
			}else {
				manual1.setAttribute("disabled", true);
				manual2.setAttribute("disabled", true);
				manual3.setAttribute("disabled", true);
			}
		}
	},

	setOnlyVacuum: function(){
		var element = document.getElementById("chk-vacuum");
		var element2 = document.getElementById("PlacesCleaner-viewtime");
		var element3 = document.getElementById("PlacesCleaner-viewtime1");
		var element4 = document.getElementById("PlacesCleaner-viewtime2");
		
		if (element.hasAttribute("checked")==true){
			element2.setAttribute("disabled", "true");
			element3.setAttribute("disabled", "true");
			element4.setAttribute("disabled", "true");
		} else {
			element2.removeAttribute("disabled");
			element3.removeAttribute("disabled");
			element4.removeAttribute("disabled");
		}

    },

};
