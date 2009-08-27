var PrefWindow = {
	enableDayInterval: function(){		
		var obj = document.getElementById("PlacesCleaner-autoclean-check");
		var obj2 = document.getElementById("PlacesCleaner-dayinterval-box");
		var obj3 = document.getElementById("PlacesCleaner-dayinterval-label");
        
		var isdisable = obj.hasAttribute("checked");
		
		if (isdisable == true){
				obj2.removeAttribute("disabled");
				obj3.removeAttribute("disabled");                
		} else {
				obj2.setAttribute("disabled", true);
                obj3.setAttribute("disabled", true);
		}
		
	},
};