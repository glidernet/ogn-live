function changeTheme() {
	if (++theme == 3) theme = 0;
	document.getElementById("theme").href = "ogn_" + theme + ".css";
	document.getElementById("css_switch").innerHTML = theme_name[theme];
	document.getElementById("tid").value = theme;
}