function inittz(sel=true) {
	if (sel) {
		var tz;
		try { tz = new Date().getTimezoneOffset(); }
		catch(e) { tz = 0; }
		tz = (tz /-60);			// the javascript gettimezone function return negative value in minutes then /-60 to have correct hours
		var tzlist = {  "-12":0, 
									"-11":1,
									"-10":2,
									"-9.5":3,
									"-9":4,
									"-8":5,
									"-7":6,
									"-6":7,
									"-5":8,
									"-4.5":9,
									"-4":10,
									"-3.5":11,
									"-3":12,
									"-2":13,
									"-1":14,
									"0":15,
									"1":16,
									"2":17,
									"3":18,
									"3.5":19,
									"4":20,
									"4.5":21,
									"5":22,
									"5.5":23,
									"5.75":24,
									"6":25,
									"6.5":26,
									"7":27,
									"8":28,
									"8.75":29,
									"9":30,
									"9.5":31,
									"10":32,
									"10.5":33,
									"11":34,
									"11.5":35,
									"12":36,
									"12.75":37,
									"13":38,
									"14":39 
									};
		document.getElementById("tz").selectedIndex = tzlist[""+tz];
	}
	var d = new Date();
	var cur_day = "0"+d.getDate();
	var cur_month = "0"+(d.getMonth()+1);
	var cur_year = d.getFullYear(); 
	document.getElementById("ddate").value = cur_day.slice(-2)+"-"+cur_month.slice(-2)+"-"+cur_year;	
	document.getElementById("css_switch").innerHTML = theme_name[theme];
	document.getElementById("tid").value = theme;
} 
