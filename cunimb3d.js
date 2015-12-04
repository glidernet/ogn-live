/*
   ____                      _____ _ _     _             _   _      _                      _
  / __ \                    / ____| (_)   | |           | \ | |    | |                    | |
 | |  | |_ __   ___ _ __   | |  __| |_  __| | ___ _ __  |  \| | ___| |___      _____  _ __| | __
 | |  | | '_ \ / _ \ '_ \  | | |_ | | |/ _` |/ _ \ '__| | . ` |/ _ \ __\ \ /\ / / _ \| '__| |/ /
 | |__| | |_) |  __/ | | | | |__| | | | (_| |  __/ |    | |\  |  __/ |_ \ V  V / (_) | |  |   <
  \____/| .__/ \___|_| |_|  \_____|_|_|\__,_|\___|_|    |_| \_|\___|\__| \_/\_/ \___/|_|  |_|\_\
        | |
        |_|
*/

var map;
var autoc="";
var acaff="";
var cton=false;
var tcolor= ["000000","FF0000","00FF00","0000FF","FFFF00","00FFFF","FF00FF","C0C0C0","FFFFFF"];
var colort= ["000000","0000FF","00FF00","FF0000","00FFFF","FFFF00","FF00FF","C0C0C0","FFFFFF"]; // pour format aaBBGGRR
var ccolor=0;
var aflist = true;
var vallpolon = true;
var vallpoloff = true;
var vallmaron = true;
var vallmaroff = true;
var lside = 0;		// 0=right 1=left
var online = new Array();	//         ([cn,alt*1,ps+"_"+cn,colcn,afdif]);
var offline = new Array();	//         ([cn,alt*1,ps+"_"+cn,colcn,afdif]);
var receivers = new Array();
var onoff = 1;		// 1: online, 2: offline, 3: Menu
var oldonoff = 1;
var onoffaff ="OnLine";
var triasc = 1;	// 1: asc 2: desc
var tricol = 0; // 0:tri sur cn 1: tri sur alti
var ett1 = "<CENTER><IMG style=\"z-index:50\" onclick=\"alist();\" SRC=\""+tld+"/pict/min.png\">&nbsp;&nbsp;<IMG style=\"z-index:50\" onclick=\"sideclick();\" SRC=\""+tld+"/pict/dbarrow.gif\">&nbsp;&nbsp;<A HREF=\""+tld+"/help-fr.html\" target=\"_blank\"><IMG style=\"z-index:50\" SRC=\""+tld+"/pict/hel.png\"></A>&nbsp;&nbsp;<span id=\"onoff\" onclick=\"onofff();\"></span></CENTER>";
var w = 0;	// watchdog variable
var tmgm;
var tmwd;
var nbreq = 0; // nb request launch
var hnew = false;
var ftype=["unknown","Glider/MotorGlider","Tow Plane","Helicopter","Parachute","Drop Plane","Hand Glider","Para Glider","Plane","Jet","UFO","Balloon","Airship","Drone","unknown","Static Object" ];
var ftypec=["_b","","_g","_r","_b","_b","_p","_p","_b","_b","_b","_b","_b","_b","_b","_b"];

// 	close popup
function cp() {
	clearTimeout(tmop);
	var d = document.getElementById('popup');
	d.style.display='none';
	}

//	open popup
function op(maxw) {
	var d = document.getElementById('popup');
	d.style.display='block';
  d.style.width = maxw + 'px';
  d.style.height = maxw + 'px';
  tmop = setTimeout('cp()', 15000);
	}




function onofff() {
	switch(onoff)	{
		case 1:
			if (all==1) {
				onoffaff="OffLine";
				onoff=2;
			} else {
				onoffaff="Menu";
				onoff=3;
			}
			break;
		case 2:
			onoffaff="Menu";
			onoff=3;
			document.getElementById("ett2").style.display = "none";
			break;
		case 3:
			onoffaff="OnLine";
			onoff=1;
			document.getElementById("ett2").style.display = "block";
			break;
		}
	afftab();
}

function deletepath(pol) {
	window[pol].getGeometry().getCoordinates().clear();
}

function deleteallpath() {
	var j=-1;
	var p;
	if (onoff==true) {
		while(online[++j]){
			window["P_"+online[j][2]].getGeometry().getCoordinates().clear();
		}
	} else {
		while(offline[++j]){
			window["P_"+offline[j][2]].getGeometry().getCoordinates().clear();
		}
	}
}


function allpath() {
	var j=-1;
	if (onoff==true) {
		if (vallpolon==true) vallpolon = false; else vallpolon = true;
		while(online[++j]){
			window["P_"+online[j][2]].setVisibility( vallpolon );
		}
	} else {
		if (vallpoloff==true) vallpoloff = false; else vallpoloff = true;
		while(offline[++j]){
			window["P_"+offline[j][2]].setVisibility( vallpoloff );
		}
	}
	afftab();
}

function allmarker() {
	var j=-1;
	if (onoff==true) {
		if (vallmaron==true) vallmaron = false; else vallmaron = true;
		while(online[++j]){
			window["M_"+online[j][2]].setVisibility( vallmaron );
		}
	} else {
		if (vallmaroff==true) vallmaroff = false; else vallmaroff = true;
		while(offline[++j]){
			window["M_"+offline[j][2]].setVisibility( vallmaroff );
		}
	}
	afftab();
}




function tricn() {
	if (tricol==1) triasc = 1;
	else if (triasc==1) triasc=2; else triasc=1;
	tricol = 0;
	afftab();
}

function trialti() {
	if (tricol==0) triasc = 1;
	else if (triasc==1) triasc=2; else triasc=1;
	tricol = 1;
	afftab();
}

function focuson(vvar) {
	if (document.getElementById(vvar)!=null) document.getElementById(vvar).className= 'yel';
	window[window[vvar].poly].getStyleSelector().getLineStyle().setWidth(5);
	window[window[vvar].mark].setName(window[vvar].desc);
}

function focusoff(vvar) {
	if (document.getElementById(vvar)!=null) document.getElementById(vvar).className= 'whi';
	window[window[vvar].poly].getStyleSelector().getLineStyle().setWidth(3);
	window[window[vvar].mark].setName("");
}

function hidenew() {
	if(document.getElementById('hnewbox').checked) hnew=true; else hnew=false;
}

function lineoff() {
	if(document.getElementById('offl').checked) {
		all=0;
		var j=-1;
		while(offline[++j]){
			ge.getFeatures().removeChild(window["M_"+offline[j][2]]);
			delete window["M_"+offline[j][2]];
			ge.getFeatures().removeChild(window["P_"+offline[j][2]]);
			delete window["P_"+offline[j][2]];
			delete window["V_"+offline[j][2]];
		}
	} else all=1;
}

function bounds() {
	if(document.getElementById('boundsbox').checked) {
		bound = true;
		amax = document.getElementById('latmax').value;
		amin = document.getElementById('latmin').value;
		if (amin > amax) { var tmp = amax; amax = amin; amin = tmp; }
		omax = document.getElementById('lonmax').value;
		omin = document.getElementById('lonmin').value;
		if (omin > omax) { var tmp = omax; omax = omin; omin = tmp; }
		if (amax > 85) amax = 85;
		if (amin < -85) amin = -85;
		if (omax > 180) omax = 180;
		if (omin < -180) omin = -180;
		boundc="&b="+amax+"&c="+amin+"&d="+omax+"&e="+omin;
		document.getElementById('latmax').value = amax;
		document.getElementById('latmin').value = amin;
		document.getElementById('lonmax').value = omax;
		document.getElementById('lonmin').value = omin;
		var j=-1;
		while(online[++j]){
			ge.getFeatures().removeChild(window["M_"+online[j][2]]);
			delete window["M_"+online[j][2]];
			ge.getFeatures().removeChild(window["P_"+online[j][2]]);
			delete window["P_"+online[j][2]];
		}
		j=-1;
		while(offline[++j]){
			ge.getFeatures().removeChild(window["M_"+offline[j][2]]);
			delete window["M_"+offline[j][2]];
			ge.getFeatures().removeChild(window["P_"+offline[j][2]]);
			delete window["P_"+offline[j][2]];
		}
	}
	else {
		bound = false;
		boundc = "";
	}
}

function afftab() {
	var j=-1;
	var dlistd ="<TABLE class=\"tt\">";
	var mar="";
	var pol="";
	var vvar="";
	var affcpt="";
	var raf = true;

	switch(onoff)	{
		case 1:
			online.sort(ASC);
			if (triasc==2) online.reverse();
			while(online[++j]){
		  	mar = "M_"+online[j][2];
			pol = "P_"+online[j][2];
			vvar = "V_"+online[j][2];
				dlistd += "<TR id=\""+vvar+"\" onmouseover=\"focuson('"+vvar+"');\" onmouseout=\"focusoff('"+vvar+"');\"><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'"+mar+"');\" type=\"checkbox\" " + isvisib(mar) + " ></TD><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'"+pol+"');\" type=\"checkbox\" " + isvisib(pol) + " ></TD><TD class=\"cgn\" onmousedown=\"centeron('"+mar+"');\" onmouseup=\"centeroff();\" oncontextmenu=\"event.stopPropagation(); redraw('"+pol+"'); return false;\" ondblclick=\"event.stopPropagation(); autocenter('" +vvar+ "');\" >"+online[j][0]+"</TD><TD class=\"cgc\"><span style='background-color: "+online[j][3]+"' ondblclick=\"deletepath('" +pol+ "'); return false;\" oncontextmenu=\"this.style.backgroundColor=changecolor('"+vvar+"'); return false;\">&nbsp;&nbsp;</span></TD><TD onclick=\"affinfo('"+vvar+"')\" class=\"cga\">"+online[j][1]+"m</TD><TD class=\"cgv\"><IMG src='"+tld+"/pict/"+online[j][4]+".gif'></TD></TR>";
			}
			affcpt = " (" + online.length + ")";
			oldonoff=1;
			break;
		case 2:
			offline.sort(ASC);
			if (triasc==2) offline.reverse();
			while(offline[++j]){
		  	mar = "M_"+offline[j][2];
			pol = "P_"+offline[j][2];
			vvar = "V_"+offline[j][2];
				dlistd += "<TR id=\""+vvar+"\" onmouseover=\"focuson('"+vvar+"');\" onmouseout=\"focusoff('"+vvar+"');\"><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'"+mar+"');\" type=\"checkbox\" " + isvisib(mar) + " ></TD><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'"+pol+"');\" type=\"checkbox\" " + isvisib(pol) + " ></TD><TD class=\"cgn\" onmousedown=\"centeron('"+mar+"');\" onmouseup=\"centeroff();\" oncontextmenu=\"event.stopPropagation(); redraw('"+pol+"'); return false;\" ondblclick=\"event.stopPropagation(); autocenter('" +vvar+ "');\" >"+offline[j][0]+"</TD><TD class=\"cgc\"><span style='background-color: "+offline[j][3]+"' ondblclick=\"deletepath('" +pol+ "'); return false;\" oncontextmenu=\"this.style.backgroundColor=changecolor('"+vvar+"'); return false;\">&nbsp;&nbsp;</span></TD><TD onclick=\"affinfo('"+vvar+"')\" class=\"cga\">"+offline[j][1]+"m</TD><TD class=\"cgv\"><IMG src='"+tld+"/pict/"+offline[j][4]+".gif'></TD></TR>";
			}
			affcpt = " (" + offline.length + ")";
			oldonoff=2;
			break;
		case 3:
			if (oldonoff!=3) {
				dlistd += "<TR><TD><INPUT type=\"checkbox\" id=\"hnewbox\" onChange='javascript : hidenew();'";
				if (hnew==true) dlistd+=" checked";
				dlistd += "> Hide new gliders<BR><INPUT type=\"checkbox\" id=\"offl\" onChange='javascript : lineoff();'";
				if (all==0) dlistd+=" checked";
				dlistd += "> Ignore Offline<HR><INPUT type=\"checkbox\" id=\"boundsbox\" onChange='javascript : bounds();'";
				if (bound==true) dlistd+=" checked";
				dlistd += "> Bounds<BR><TABLE cellspacing=\"0\" cellpading=\"0\"><TR align=\"center\"><TD colspan=\"2\"><INPUT type=\"text\" id=\"latmax\" name=\"latmax\" size=\"7\" value=\""+amax+"\"></TD></TR><TR align=\"center\"><TD><INPUT type=\"text\" id=\"lonmin\" name=\"lonmin\" size=\"7\" value=\""+omin+"\"></TD><TD><INPUT type=\"text\" id=\"lonmax\" name=\"lonmax\" size=\"7\" value=\""+omax+"\"></TD></TR><TR align=\"center\"><TD colspan=\"2\"><INPUT type=\"text\" id=\"latmin\" name=\"latmin\" size=\"7\" value=\""+amin+"\"></TD></TR></TABLE>";
				dlistd += "</TD></TR>";
				oldonoff=3;
			} else raf = false;
			break;
	}

	dlistd +="</TABLE>";
	if (raf == true) document.getElementById("dtable").innerHTML = dlistd;
	document.getElementById("onoff").innerHTML = onoffaff + affcpt;
}

function ASC(a,b){
a=a[tricol];
b=b[tricol];
if(a > b) return 1
if(a < b) return -1
return 0
}


function alist()  {
  if (aflist == true) {
    document.getElementById("ett1").innerHTML = "<CENTER><IMG style=\"z-index:50\" onclick=\"alist();\" SRC=\""+tld+"/pict/plu.png\"></CENTER>";
    document.getElementById('dlist').style.width="20px";
    document.getElementById('dlist').style.height="20px";
    if (lside==1) document.getElementById('ac').style.left="65px"; else document.getElementById('ac').style.right="0px";
    centeroff();
    aflist = false;
    }
  else  {
    document.getElementById("ett1").innerHTML = ett1;
    document.getElementById('dlist').style.width="180px";
    document.getElementById('dlist').style.height="90%";
    if (lside==1) document.getElementById('ac').style.left="245px"; else document.getElementById('ac').style.right="180px";
    aflist = true;
    afftab();
    }
}

function sideclick() {
	if (lside==0) {
		document.getElementById('dlist').className="lleft";
		document.getElementById('ac').className="acleft";
		document.getElementById('ac').style.right="";
		lside=1;
	} else {
		document.getElementById('dlist').className="lright";
		document.getElementById('ac').className="acright";
		document.getElementById('ac').style.left="";
		lside=0;
	}
}

function pointtomarker(mar) {
	var point = window[mar].getGeometry();
	var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
	lookAt.setLatitude(point.getLatitude());
	lookAt.setLongitude(point.getLongitude());
	ge.getView().setAbstractView(lookAt);

}


function autocenter(vvar) {
	document.getElementById("divInfoac").innerHTML = "<B>AC</B>: "+window[vvar].desc;
	autoc=vvar;
	document.getElementById("divInfoac").style.display = "block";
	pointtomarker(window[vvar].mark);
}

function autocenteroff() {
  document.getElementById("divInfoac").innerHTML="&nbsp;";
  autoc="";
  document.getElementById("divInfoac").style.display = "none";
}


function centeron(mark) {
	cton=true;
	pointtomarker(mark);
}


function centeroff() {
	if (autoc!="") {
		pointtomarker(window[autoc].mark);
		}
	cton=false;
}

function vpolmar(chk, pol) {
	if (chk) window[pol].setVisibility( true );
	else window[pol].setVisibility( false );
}


function isvisib(pol) {
	if (window[pol].getVisibility()==true) return "checked";
	else return "";
}



function changecolor(vvar) {
	var colactive = window[vvar].icol;
	if(++colactive==9) colactive=0;
	var ncol = colort[colactive];
	window[window[vvar].poly].getStyleSelector().getLineStyle().getColor().set('EE'+ncol);  // aabbggrr format
	ncol = tcolor[colactive];
	window[vvar].icol = colactive;
	return "#"+ncol;
}

function redraw(pol) {
	var p = pol.substring(2);
	var vvar = window["V_"+p];
	var fi=vvar.fid;
	var lo = window[vvar.mark].getGeometry().getLongitude().toFixed();
  downloadUrl(cxml1+'?id='+p+"&e=1"+"&l="+lo, function(data)
		{
		var vtrace = data.documentElement.getElementsByTagName("m");
		var err = parseFloat(vtrace[0].getAttribute("e"));
		var ppol = "P_"+vtrace[0].getAttribute("i");
		if (err==0 && vtrace.length>2) {
			window[ppol].getGeometry().getCoordinates().clear();
			for (var i = 1; i < vtrace.length; i++)
	      {
	      var lat = parseFloat(vtrace[i].getAttribute("a"));
	      var lon = parseFloat(vtrace[i].getAttribute("o"));
	      var alt = vtrace[i].getAttribute("t");
	      window[ppol].getGeometry().getCoordinates().pushLatLngAlt(lat,lon,alt*1);
	    	}
			}
		});
}


// récupère la liste des récepteurs
function checkrec() {
  downloadUrl(rxml, function(data)
		{
		var vlrec = data.documentElement.getElementsByTagName("m");
		var err = parseFloat(vlrec[0].getAttribute("e"));
		if (err==0 && vlrec.length>1) {
			selrec = "";
			// effacer markers
			var j=-1;
			while(receivers[++j]){
				delete window["R_"+receivers[j][0]];
			}
			receivers.length=0;
			for (var i = 1; i < vlrec.length; i++)
	      {
	      var re = vlrec[i].getAttribute("a");
	      var rlat = parseFloat(vlrec[i].getAttribute("b"));
	      var rlon = parseFloat(vlrec[i].getAttribute("c"));
	      var ract = parseInt(vlrec[i].getAttribute("d"));
	      selrec += "<option value='" + re + "'>" + re + "</option>";
	      receivers.push([re]);
	      window["R_"+re] = [rlat,rlon];
	    	}
	    setTimeout('checkrec()', 120000);
			}
		else 
			{
			selrec =	"<option value='_error_'>Error</option>";
			setTimeout('checkrec()', 20000);
			}
		});
}



function affinfodata(vvar) {
	var mrk=window[vvar];
	var vz=mrk.vz;
	var la = window[window[vvar].mark].getGeometry().getLatitude().toFixed(6);
	var lo = window[window[vvar].mark].getGeometry().getLongitude().toFixed(6);
	document.getElementById("aclt").innerHTML=mrk.tim;
	document.getElementById("acla").innerHTML=la;
	document.getElementById("aclo").innerHTML=lo;
	document.getElementById("acal").innerHTML=mrk.alt;
	document.getElementById("acsp").innerHTML=mrk.speed;
	document.getElementById("actr").innerHTML=mrk.track;
	document.getElementById("acvz").innerHTML=((vz>=0)?"+":"&ndash;")+Math.abs(vz);
	var re = mrk.rec;
	if (typeof(window["R_"+re]) != 'undefined') {
		var mre = window["R_"+re]; 
		var di = dist(la, lo, mre[0], mre[1] );
		re += " ("+di.toFixed()+" Km)";
	} else {
		re += " (?)";
	}
	document.getElementById("acrx").innerHTML=re;
}

function affinfodata2(vvar) {
	var mrk=window[vvar];
	document.getElementById("acmo").innerHTML=mrk.model;
}

function affinfo(vvar) {
	affinfodata(vvar);
	var mrk=window[vvar];
	var rg=mrk.reg;
	var fi=mrk.fid;
	document.getElementById("accn").innerHTML=mrk.cn;
	document.getElementById("acfi").innerHTML=fi;
	document.getElementById("acre").innerHTML=rg;
	document.getElementById("acty").innerHTML=ftype[mrk.type*1];
	if (fi!="hidden") {
		document.getElementById("acif").innerHTML="<A HREF='https://www.google.com/search?nfpr=1&q=\""+rg+"\"' target='_blank' onclick=\"event.stopPropagation();\">Infos</a>&nbsp;&nbsp;&nbsp;&nbsp;<A HREF='https://www.google.com/search?nfpr=1&q=\""+rg+"\"&tbm=isch' target='_blank' onclick=\"event.stopPropagation();\">Pictures</a>";
		if (mrk.dinfo=="") {
			downloadUrl(dxml+'?i='+vvar+'&f='+fi, function(data)
				{
					var dat = data.documentElement.getElementsByTagName("m");
					var err = parseFloat(dat[0].getAttribute("g"));
					var mrk = dat[0].getAttribute("i");
					if (err==0) {
						window[mrk].model = ""+dat[0].getAttribute("c");
						affinfodata2(mrk);
						document.getElementById("ac2").style.display = "block";
					} else {
						window[mrk].dinfo = "_";
						document.getElementById("ac2").style.display = "none";
					}
				});
		} else {
			if (mrk.dinfo!="_") {
				affinfodata2(vvar);
				document.getElementById("ac2").style.display = "block";
			} else {
				document.getElementById("ac2").style.display = "none";
			}
		}
	}
	else {
		document.getElementById("ac2").style.display = "none";
		document.getElementById("acif").innerHTML="";
		document.getElementById("acow").innerHTML="";
		document.getElementById("acaf").innerHTML="";
		document.getElementById("acmo").innerHTML="";
		document.getElementById("acfr").innerHTML="";
	}
	acaff=vvar;
	document.getElementById("ac").style.display = "block";
}

function dist(lat1,lon1,lat2,lon2) {
	var torad = Math.PI / 180;
	lat1 *= torad;
	lon1 *= torad;
	lat2 *= torad;
	lon2 *= torad;
	var dt=Math.acos( (Math.sin(lat1)*Math.sin(lat2)) + (Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2)) );
	dt *=6366;
	return dt;
}


function gesmark() {
	if (nbreq > 0) { --nbreq; return; }
	++nbreq;
	downloadUrl(cxml+"?a="+all+boundc+tz, function(data) {
		++w;
		var planeurs = data.documentElement.getElementsByTagName("m");
		online.length=0;
		offline.length=0;
		var colcn;
		for (var i = 0; i < planeurs.length; i++) {
			// récupération des données transmises pour ce planeur
			var tab=planeurs[i].getAttribute("a").split(",");
			var lat = parseFloat(tab[0]);
			var lon = parseFloat(tab[1]);
			var cn = tab[2];
			var ps = tab[3];
			var alt = tab[4];
			var tim = tab[5];
			var ddf = tab[6];
			var track = tab[7];
			var speed = tab[8];
			var vz = tab[9];
			var typ = tab[10];
			var rec = tab[11];
			var crc = tab[13];
			var polyvar="P_"+crc;
			var markvar="M_"+crc;
			var varvar="V_"+crc;

			if (typeof(window[polyvar]) == 'undefined')     // si planeur non créé (pas déjà présent sur la carte)
				{
				// create a Marker
				window[markvar] = ge.createPlacemark('');
				window[markvar].setDescription(varvar);
				var icon = ge.createIcon('');
				icon.setHref(""+tld+"/markers/"+cn+ftypec[typ*1]+".png");
				var style = ge.createStyle('');
				style.getIconStyle().setIcon(icon);
				style.getIconStyle().setScale(1.0);
				window[markvar].setStyleSelector(style);
				var pointi = ge.createPoint('');
				pointi.setLatitude(lat);
				pointi.setLongitude(lon);
				pointi.setAltitude(alt*1);
				pointi.setAltitudeMode(ge.ALTITUDE_ABSOLUTE);
				window[markvar].setGeometry(pointi);
				ge.getFeatures().appendChild(window[markvar]);

				var fid = tab[12];
				if (fid=="0") fid="hidden";
				window[varvar]= {
					icol: ccolor,
					poly: polyvar,
					mark: markvar,
					desc: cn+" - "+ps+" @ "+alt+"m @ "+tim,
					cn: cn,
					reg: ps,
					type: typ,
					dinfo: "",
					speed: ""+speed,
					track: ""+track,
					vz: ""+vz,
					tim: ""+tim,
					rec: ""+rec,
					off: 0,
					fid: ""+fid
					};

				google.earth.addEventListener(window[markvar], 'mouseover', function() {
					focuson(this.getDescription());
	 				});

				google.earth.addEventListener(window[markvar], 'mouseout', function() {
					focusoff(this.getDescription());
					});

				google.earth.addEventListener(window[markvar], 'dblclick', function(e) {
					e.preventDefault();
					autocenter(this.getDescription());
					});

				google.earth.addEventListener(window[markvar], 'click', function(e) {
					e.preventDefault();
					if (e.getButton() == 2) {
						redraw(this.getDescription());
						}
					else affinfo(this.getDescription());
					});

				// création du PolyLine
				var hcol= colort[ccolor];
				window[polyvar] = ge.createPlacemark('');
				window[polyvar].setDescription(varvar);
				var linei = ge.createLineString('');
				linei.setAltitudeMode(ge.ALTITUDE_ABSOLUTE);
				linei.getCoordinates().pushLatLngAlt(lat,lon,alt*1);
				window[polyvar].setGeometry(linei);
				window[polyvar].setStyleSelector(ge.createStyle(''));
				var stylei = window[polyvar].getStyleSelector().getLineStyle();
				stylei.setWidth(3);
				stylei.getColor().set('EE'+hcol);  // aabbggrr format
				ge.getFeatures().appendChild(window[polyvar]);

				google.earth.addEventListener(window[polyvar], 'mouseover', function() {
					focuson(this.getDescription());
					});

				google.earth.addEventListener(window[polyvar], 'mouseout', function() {
					focusoff(this.getDescription());
					});

				if(++ccolor==9) ccolor=0;
				if (hnew==true) {
					window[markvar].setVisibility( false );
					window[polyvar].setVisibility( false );
					}

				}   // fin du if typeof...
			var difalt=vz*1;
			colcn="#"+tcolor[window[varvar].icol];
			if (ddf<600) {
				if (ddf>120) afdif="n";
				else if (difalt==0) afdif="z";
				else if (difalt<-4) afdif="mmm";
				else if (difalt<-1) afdif="mm";
				else if (difalt<0) afdif="m";
				else if (difalt>4) afdif="ppp";
				else if (difalt>1) afdif="pp";
				else afdif="p";
				online.push([cn,alt*1,crc,colcn,afdif]);
				if (window[varvar].off==1) {
					window[markvar].getStyleSelector().getIconStyle().getIcon().setHref(""+tld+"/markers/"+cn+ftypec[typ*1]+".png");
					window[varvar].off=0;
					}

				// add a point to the path
				window[polyvar].getGeometry().getCoordinates().pushLatLngAlt(lat,lon,alt*1);

				// move marker and change displayed coord
				var point = window[markvar].getGeometry();
				point.setLatitude(lat);
				point.setLongitude(lon);
				point.setAltitude(alt*1);

				window[varvar].desc = cn+" - "+ps+" @ "+alt+"m @ "+tim;
				window[varvar].speed = speed;
				window[varvar].track = track;
				window[varvar].vz = vz;
				window[varvar].tim = tim;
				window[varvar].rec = rec;
				window[varvar].alt = alt;
				}
			else {
				if (all==0) {
					ge.getFeatures().removeChild(window[markvar]);
					delete window[markvar];
					ge.getFeatures().removeChild(window[polyvar]);
					delete window[polyvar];
					}
				else {
					offline.push([cn,alt*1,crc,colcn,"n"]);
					if (window[varvar].off==0) {
						window[markvar].getStyleSelector().getIconStyle().getIcon().setHref(""+tld+"/markers/"+cn+"_o.png");
						window[varvar].off=1;
						}
					}
				}
			if (autoc==varvar) {
				document.getElementById("divInfoac").innerHTML="<B>AC</B>: "+cn+" - "+ps+" @ "+alt+"m";
				if (cton==false) pointtomarker(markvar);
				}
			if (acaff==varvar) affinfodata(varvar);
			}	// fin du for (var i = 0; i < planeurs.length; i++)
		// tri et affichage du tableau
		afftab();
		if (--nbreq < 0) {
  	  nbreq = 0;
	    }
    else {
    	tmgm = setTimeout('gesmark()', 10000);
    	}

		});
}

function wd() {
	if (w==0) {
		clearTimeout(tmgm);
		gesmark();
		}
	w=0;
	tmwd = setTimeout('wd()', 30000);
}

function initialize() {
	google.earth.createInstance('map_canvas', initCB, failureCB);
	document.getElementById("ett1").innerHTML = ett1;
	document.getElementById("ett2").innerHTML = "<TABLE class=\"tt\"><TR width=\"12\"><TH class=\"cgv\" ondblclick=\"allmarker();\"><IMG src='"+tld+"/pict/ico.png'></TH><TH class=\"cgv\" ondblclick=\"allpath();\"><IMG src='"+tld+"/pict/tra.gif'></TH><TH class=\"cgn\" onclick=\"tricn();\">CN</TH><TH	class=\"cgc\" ondblclick=\"deleteallpath();\"><IMG border =\"0\" src='"+tld+"/pict/a.gif'></TH><TH class=\"cga\" onclick=\"trialti();\">Alti.</TH><TH class=\"cgz\">Vz</TH></TR></table>";
	document.getElementById("ac").innerHTML = "<span style=\"color: #333; font-weight: bold; font-size: 1.1em; line-height: 1.3em;\">&nbsp;&nbsp;&nbsp;..::Aircraft::..</span><BR><span class=\"act\">CN: </span><span id=\"accn\" class=\"aca\"></span><BR><span class=\"act\">Regist.: </span><span id=\"acre\" class=\"aca\"></span><BR><span class=\"act\">Device Id: </span><span id=\"acfi\" class=\"aca\"></span><BR><span class=\"act\">Type: </span><span id=\"acty\" class=\"aca\"></span><BR><DIV id=\"ac2\"><span class=\"act\">Model: </span><span id=\"acmo\" class=\"aca\"></span></DIV><span class=\"act\">Last time: </span><span id=\"aclt\" class=\"aca\"></span><BR><span class=\"act\">Latitude: </span><span id=\"acla\" class=\"aca\"></span><BR><span class=\"act\">Longitude: </span><span id=\"aclo\" class=\"aca\"></span><BR><span class=\"act\">Altitude: </span><span id=\"acal\" class=\"aca\"></span><span class=\"aca\">&thinsp;m</span><BR><span class=\"act\">G.Speed: </span><span id=\"acsp\" class=\"aca\"></span><span class=\"aca\">&thinsp;km/h</span><BR><span class=\"act\">Track: </span><span id=\"actr\" class=\"aca\"></span><span class=\"aca\">&thinsp;&deg;</span><BR><span class=\"act\">Vz: </span><span id=\"acvz\" class=\"aca\"></span><span class=\"aca\">&thinsp;m/s</span><BR><span class=\"act\">Receiver: </span><span id=\"acrx\" class=\"aca\"></span><BR><span id=\"acif\" class=\"aca\"></span>";
	}

function initCB(instance) {
	var has = window.location.hash.substring(1).split('&');		// parse the parameters
	var parh = [];
	var cent = [];
	for (var i=0; i<has.length; i++) {
		var x = has[ i ].split('=');
		parh[x[0]]=x[1];
		}

	ge = instance;
	ge.getWindow().setVisibility(true);
	ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
	ge.getNavigationControl().getScreenXY().setXUnits(ge.UNITS_PIXELS);
	ge.getNavigationControl().getScreenXY().setYUnits(ge.UNITS_INSET_PIXELS);
	ge.getOptions().setStatusBarVisibility(true);

	var la = ge.createLookAt('');
	la.set(vlat,vlon, 0, ge.ALTITUDE_RELATIVE_TO_GROUND, 0, 45, 7000000);
	ge.getView().setAbstractView(la);

	// parameter w=0 (Don't display the warning)
	var warn=1;
	if (typeof(parh['w']) != 'undefined') {
		if (parh['w']==0) { warn=0;	}
		}
	
	if (warn==1) {
		document.getElementById("popup").innerHTML = "<img class=\"pr\" alt=\"close\" src=\"../pict/close.png\"><H1>Warning!</H1><BR><P style=\"text-align:justify;\"><B>The data on this site can be ambiguous in certain situations and the displayed position of an aircraft or glider can be displaced relative to the actual position.<BR>Before raising an alert please contact us so we can interpret the data correctly.</B></P>";	
		op(300);
		}
	
	tz ="&z="+(tz /-60);			// the javascript gettimezone function return negative value in minutes then /-60 to have correct hours	
	
	checkrec();
	tmwd = setTimeout('wd()', 60000);
	gesmark();
}

function failureCB(errorCode) {
	}
