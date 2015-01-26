/*
   _____            _           _                      _
  / ____|          (_)         | |                    | |
 | |    _   _ _ __  _ _ __ ___ | |__        _ __   ___| |_
 | |   | | | | '_ \| | '_ ` _ \| '_ \      | '_ \ / _ \ __|
 | |___| |_| | | | | | | | | | | |_) |  _  | | | |  __/ |_
  \_____\__,_|_| |_|_|_| |_| |_|_.__/  (_) |_| |_|\___|\__|

*/

var map;
var autoc = "";
var acaff = "";
var cton = false;
var tcolor = ["000000", "FF0000", "00FF00", "0000FF", "FFFF00", "00FFFF", "FF00FF", "C0C0C0", "FFFFFF"];
var ccolor = 0;
var aflist = true;
var vallpolon = true;
var vallpoloff = true;
var vallmaron = true;
var vallmaroff = true;
var lside = 0; // 0=right 1=left
var infowindow = new google.maps.InfoWindow();
var online = []; //         ([cn,alt*1,cn+"_"+ps,colcn,afdif]);
var offline = []; //         ([cn,alt*1,cn+"_"+ps,colcn,afdif]);
var receivers = [];
var all = 0;
var pathl = 30; // path length 5' (30points)
var unit = "m"; // metric units
var onoff = 1; // 1: online, 2: offline, 3: Menu
var onoffaff = "OnLine";
var triasc = 1; // 1: asc 2: desc
var tricol = 0; // 0:tri sur cn 1: tri sur alti
var ett1 = "<CENTER><IMG style=\"z-index:50\" onclick=\"alist();\" SRC=\"" + tld + "/pict/min.png\">&nbsp;&nbsp;<IMG style=\"z-index:50\" onclick=\"sideclick();\" SRC=\"" + tld + "/pict/dbarrow.gif\">&nbsp;&nbsp;<A HREF=\"" + tld + "/help-fr.html\" target=\"_blank\"><IMG style=\"z-index:50\" SRC=\"" + tld + "/pict/hel.png\"></A>&nbsp;&nbsp;<span id=\"onoff\" onclick=\"onofff();\"></span></CENTER>";
var w = 0; // watchdog variable
var tmgm, tmwd;
var vasp = false;
var vrec = false;
var vrecl = false;
var vtas = false;
var vstm = false;
var vapt = false;
var vwin = false;
var vpre = false;
var vwea = false;
var vclo = false;
var hnew = false;
selrec = "";
var ftype = ["unknown", "Glider/MotorGlider", "Tow Plane", "Helicopter", "Parachute", "Drop Plane", "Hangglider", "Paraglider", "Plane", "Jet", "UFO", "Balloon", "Airship", "Drone", "Static Object"];
var ftypec = ["_b", "", "_g", "_r", "_b", "_b", "_p", "_p", "_b", "_b", "_b", "_b", "_b", "_b", "_b"];
var taska = [];
var initialResolution = 2 * Math.PI * 6378137 / 256; // == 156543.0339
var originShift = 2 * Math.PI * 6378137 / 2.0; // == 20037508.34
var m2ft={"m":1, "i":3.2808};
var am2ft={"m":"m", "i":"ft"};
var kh2kt={"m":1, "i":0.53996};
var akh2kt={"m":"km/h", "i":"kt"};
var m2kt={"m":1, "i":1.94384};
var am2kt={"m":"m/s", "i":"kt"};


var hashc="",hashz="",hashm="",hasho="",hashb="",hashs="",hashl="",hasht="",hl="       ",hashw="",hashu="",hashp="";
// center     zoom    maptype  offline  bound   autoset2ma  layers  tasks                warning   units   pathlength


//  close popup
function cp() {
  clearTimeout(tmop);
  var d = document.getElementById('popup');
  d.style.display = 'none';
}

//  open popup
function op(maxw) {
  var d = document.getElementById('popup');
  d.style.display = 'block';
  d.style.width = maxw + 'px';
  d.style.height = maxw + 'px';
  tmop = setTimeout(cp, 15000);
}

function chunit() { // change units
  if (document.getElementById('uni').checked === true) { // units imperial
    unit = 'i';
    hashu = "&u=i";
  } else { // units metric
    unit = 'm';
    hashu = "";
  }
  rehash();
}


function chpl() { // change path length
  if (document.getElementById('rp1').checked === true) { // 5 minutes
    pathl = 30;
    hashp = "";
  } else if (document.getElementById('rp2').checked === true) { // 10 minutes
    pathl = 60;
    hashp = "&p=2";
  } else { // all points
    pathl = 99999;
    hashp = "&p=3";
  }
  delpon();
  delpoff();
  rehash();
}


function onofff() {
  switch (onoff) {
    case 1:
      if (all == 1) {
        onoffaff = "OffLine";
        onoff = 2;
      } else {
        onoffaff = "Menu";
        onoff = 3;
        document.getElementById("ett2").style.display = "none";
        document.getElementById("dtlist").style.display = "none";
        document.getElementById("menu").style.display = "block";
      }
      break;
    case 2:
      onoffaff = "Menu";
      onoff = 3;
      document.getElementById("ett2").style.display = "none";
      document.getElementById("dtlist").style.display = "none";
      document.getElementById("menu").style.display = "block";
      break;
    case 3:
      onoffaff = "OnLine";
      onoff = 1;
      document.getElementById("ett2").style.display = "block";
      document.getElementById("dtlist").style.display = "block";
      document.getElementById("menu").style.display = "none";
      break;
  }
  afftab();
}

function delpon() { // delete all online path
  var j = -1;
  while (online[++j]) {
    window["P_" + online[j][2]].getPath().clear();
    window["M_" + online[j][2]].set('tra', 0);
  }
}

function delpoff() { // delete all offline path
  var j = -1;
  while (offline[++j]) {
    window["P_" + offline[j][2]].getPath().clear();
    window["M_" + offline[j][2]].set('tra', 0);
  }

}

function deletepath(pol) {
  window[pol].getPath().clear();
  window["M_" + pol.substring(2)].set('tra', 0);
}

function deleteallpath() {
  if (onoff == 1) {
    delpon();
  } else {
    delpoff();
  }
}


function allpath() {
  var j = -1;
  if (onoff == 1) {
    if (vallpolon === true) vallpolon = false;
    else vallpolon = true;
    while (online[++j]) {
      window["P_" + online[j][2]].setOptions({
        visible: vallpolon
      });
    }
  } else {
    if (vallpoloff === true) vallpoloff = false;
    else vallpoloff = true;
    while (offline[++j]) {
      window["P_" + offline[j][2]].setOptions({
        visible: vallpoloff
      });
    }
  }
  afftab();
}

function allmarker() {
  var j = -1;
  if (onoff == 1) {
    if (vallmaron === true) vallmaron = false;
    else vallmaron = true;
    while (online[++j]) {
      window["M_" + online[j][2]].setOptions({
        visible: vallmaron
      });
    }
  } else {
    if (vallmaroff === true) vallmaroff = false;
    else vallmaroff = true;
    while (offline[++j]) {
      window["M_" + offline[j][2]].setOptions({
        visible: vallmaroff
      });
    }
  }
  afftab();
}




function tricn() {
  if (tricol == 1) triasc = 1;
  else if (triasc == 1) triasc = 2;
  else triasc = 1;
  tricol = 0;
  afftab();
}

function trialti() {
  if (tricol === 0) triasc = 1;
  else if (triasc == 1) triasc = 2;
  else triasc = 1;
  tricol = 1;
  afftab();
}

function focuson(poly) {
  if (document.getElementById(poly) !== null) document.getElementById(poly).className = 'yel';
  window[poly].setOptions({
    strokeWeight: 4,
    strokeOpacity: 1
  });
}

function focusoff(poly) {
  if (document.getElementById(poly) !== null) document.getElementById(poly).className = 'whi';
  window[poly].setOptions({
    strokeWeight: 2,
    strokeOpacity: 0.75
  });
}

function asp() {
  if (document.getElementById('aspbox').checked) {
    vasp = true;
    airspaceoverlay.setOpacity(1);
    map.overlayMapTypes.setAt(1, airspaceoverlay);
    rempl(4, "z");
  } else {
    vasp = false;
    airspaceoverlay.setOpacity(0);
    map.overlayMapTypes.removeAt(1);
    rempl(4, " ");
  }
  rehash();
}

function apt() {
  if (document.getElementById('aptbox').checked) {
    vapt = true;
    airportoverlay.setOpacity(1);
    map.overlayMapTypes.setAt(2, airportoverlay);
    rempl(5, "a");
  } else {
    vapt = false;
    airportoverlay.setOpacity(0);
    map.overlayMapTypes.removeAt(2);
    rempl(5, " ");
  }
  rehash();
}

function wind() {
  if (document.getElementById('winbox').checked) {
    vwin = true;
    windoverlay.setOpacity(1);
    map.overlayMapTypes.setAt(3, windoverlay);
    if (map.getZoom() > 7) map.setZoom(7);
    rempl(2, "v");
  } else {
    vwin = false;
    windoverlay.setOpacity(0);
    map.overlayMapTypes.removeAt(3);
    rempl(2, " ");
  }
  rehash();
}

function pres() {
  if (document.getElementById('prebox').checked) {
    vpre = true;
    presoverlay.setOpacity(1);
    map.overlayMapTypes.setAt(4, presoverlay);
    if (map.getZoom() > 7) map.setZoom(7);
    rempl(3, "p");
  } else {
    vpre = false;
    presoverlay.setOpacity(0);
    map.overlayMapTypes.removeAt(4);
    rempl(3, " ");
  }
  rehash();
}


function wea() {
  if (document.getElementById('weabox').checked) {
    vwea = true;
    weatherLayer = new google.maps.weather.WeatherLayer({
      temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
    });
    weatherLayer.setMap(map);
    if (map.getZoom() > 12) map.setZoom(12);
    rempl(0, "w");
  } else {
    vwea = false;
    weatherLayer.setMap(null);
    rempl(0, " ");
  }
  rehash();
}

function clo() {
  if (document.getElementById('clobox').checked) {
    vclo = true;
    cloudLayer = new google.maps.weather.CloudLayer();
    cloudLayer.setMap(map);
    if (map.getZoom() > 6) map.setZoom(6);
    rempl(1, "c");
  } else {
    vclo = false;
    cloudLayer.setMap(null);
    rempl(1, " ");
  }
  rehash();
}


function hidenew() {
  if (document.getElementById('hnewbox').checked) hnew = true;
  else hnew = false;
}

function lineoff() {
  if (document.getElementById('offl').checked) {
    all = 0;
    var j = -1;
    while (offline[++j]) {
      window["M_" + offline[j][2]].setMap(null);
      delete window["M_" + offline[j][2]];
      window["P_" + offline[j][2]].setMap(null);
      delete window["P_" + offline[j][2]];
    }
    hasho = "";
  } else {
    all = 1;
    hasho = "&o=1";
  }
  rehash();
}

function bounds() {
  if (document.getElementById('boundsbox').checked) {
    bound = true;
    if (document.getElementById('astmbox').checked) {
      vstm = false;
      hashs = "";
      document.getElementById('astmbox').checked = false;
    }
    amax = parseFloat(document.getElementById('latmax').value);
    amin = parseFloat(document.getElementById('latmin').value);
    if (amin > amax) {
      var tmp = amax;
      amax = amin;
      amin = tmp;
    }
    omax = parseFloat(document.getElementById('lonmax').value);
    omin = parseFloat(document.getElementById('lonmin').value);
    if (omin > omax) {
      var tmp = omax;
      omax = omin;
      omin = tmp;
    }
    if (amax > 85) amax = 85;
    if (amin < -85) amin = -85;
    if (omax > 180) omax = 180;
    if (omin < -180) omin = -180;
    boundc = "&b=" + amax + "&c=" + amin + "&d=" + omax + "&e=" + omin;
    document.getElementById('latmax').value = amax;
    document.getElementById('latmin').value = amin;
    document.getElementById('lonmax').value = omax;
    document.getElementById('lonmin').value = omin;
    var j = -1;
    while (online[++j]) {
      window["M_" + online[j][2]].setMap(null);
      delete window["M_" + online[j][2]];
      window["P_" + online[j][2]].setMap(null);
      delete window["P_" + online[j][2]];
    }
    j = -1;
    while (offline[++j]) {
      window["M_" + offline[j][2]].setMap(null);
      delete window["M_" + offline[j][2]];
      window["P_" + offline[j][2]].setMap(null);
      delete window["P_" + offline[j][2]];
    }
    hashb = "&b=" + amax.toFixed(4) + "," + amin.toFixed(4) + "," + omax.toFixed(4) + "," + omin.toFixed(4);
  } else {
    bound = false;
    if (vstm === false) boundc = "";
    hashb = "";
  }
  rehash();
}

function afftab() {
  var j = -1;
  var dlistd = "<TABLE class=\"tt\">";
  var mar = "";
  var pol = "";
  var affcpt = "";

  switch (onoff) {
    case 1:
      online.sort(ASC);
      if (triasc == 2) online.reverse();
      while (online[++j]) {
        mar = "M_" + online[j][2];
        pol = "P_" + online[j][2];
        dlistd += "<TR id=\"" + pol + "\" onmouseover=\"focuson('" + pol + "');\" onmouseout=\"focusoff('" + pol + "');\"><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'" + mar + "');\" type=\"checkbox\" " + isvisib(mar) + " ></TD><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'" + pol + "');\" type=\"checkbox\" " + isvisib(pol) + " ></TD><TD class=\"cgn\" onmousedown=\"centeron('" + mar + "');\" onmouseup=\"centeroff();\" oncontextmenu=\"event.stopPropagation(); redraw('" + pol + "'); return false;\" ondblclick=\"event.stopPropagation(); autocenter('" + mar + "');\" >" + online[j][0] + "</TD><TD class=\"cgc\"><span style='background-color: " + online[j][3] + "' ondblclick=\"deletepath('" + pol + "'); return false;\" oncontextmenu=\"this.style.backgroundColor=changecolor('" + mar + "'); return false;\">&nbsp;&nbsp;</span></TD><TD onclick=\"affinfo('" + mar + "')\" class=\"cga\">";
        if (unit == "i") {
          dlistd += (online[j][1] * m2ft[unit]).toFixed();
        } // { var tv=online[j][1]*m2ft[unit];   dlistd+= tv.toFixed(); }
        else dlistd += online[j][1] + "m";
        dlistd += "</TD><TD class=\"cgv\"><IMG src='" + tld + "/pict/" + online[j][4] + ".gif'></TD></TR>";
      }
      affcpt = " (" + online.length + ")";
      break;
    case 2:
      offline.sort(ASC);
      if (triasc == 2) offline.reverse();
      while (offline[++j]) {
        mar = "M_" + offline[j][2];
        pol = "P_" + offline[j][2];
        dlistd += "<TR id=\"" + pol + "\" onmouseover=\"focuson('" + pol + "');\" onmouseout=\"focusoff('" + pol + "');\"><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'" + mar + "');\" type=\"checkbox\" " + isvisib(mar) + " ></TD><TD class=\"cgv\"><input onchange=\"vpolmar(this.checked ,'" + pol + "');\" type=\"checkbox\" " + isvisib(pol) + " ></TD><TD class=\"cgn\" onmousedown=\"centeron('" + mar + "');\" onmouseup=\"centeroff();\" oncontextmenu=\"event.stopPropagation(); redraw('" + pol + "'); return false;\" ondblclick=\"event.stopPropagation(); autocenter('" + mar + "');\" >" + offline[j][0] + "</TD><TD class=\"cgc\"><span style='background-color: " + offline[j][3] + "' ondblclick=\"deletepath('" + pol + "'); return false;\" oncontextmenu=\"this.style.backgroundColor=changecolor('" + mar + "'); return false;\">&nbsp;&nbsp;</span></TD><TD onclick=\"affinfo('" + mar + "')\" class=\"cga\">";
        if (unit == "i") {
          dlistd += (offline[j][1] * m2ft[unit]).toFixed();
        } else dlistd += offline[j][1] + "m";
        dlistd += "</TD><TD class=\"cgv\"><IMG src='" + tld + "/pict/" + offline[j][4] + ".gif'></TD></TR>";
      }
      affcpt = " (" + offline.length + ")";
      break;
    case 3:
      affcpt = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      break;
  }
  dlistd += "</TABLE>";
  document.getElementById("dtlist").innerHTML = dlistd;
  if (aflist === true) document.getElementById("onoff").innerHTML = onoffaff + affcpt;

}

function ASC(a, b) {
  a = a[tricol];
  b = b[tricol];
  if (a > b)
    return 1;
  if (a < b)
    return -1;
  return 0;
}


function alist() {
  if (aflist === true) {
    document.getElementById("ett1").innerHTML = "<CENTER><IMG style=\"z-index:50\" onclick=\"alist();\" SRC=\"" + tld + "/pict/plu.png\"></CENTER>";
    document.getElementById('dlist').style.width = "20px";
    document.getElementById('dlist').style.height = "20px";
    if (lside == 1) document.getElementById('ac').style.left = "65px";
    else document.getElementById('ac').style.right = "0px";
    centeroff();
    aflist = false;
  } else {
    document.getElementById("ett1").innerHTML = ett1;
    document.getElementById('dlist').style.width = "180px";
    document.getElementById('dlist').style.height = "90%";
    if (lside == 1) document.getElementById('ac').style.left = "245px";
    else document.getElementById('ac').style.right = "180px";
    aflist = true;
    afftab();
  }
}

function sideclick() {
  if (lside === 0) {
    document.getElementById('dlist').className = "lleft";
    document.getElementById('ac').className = "acleft";
    document.getElementById('ac').style.right = "";
    lside = 1;
  } else {
    document.getElementById('dlist').className = "lright";
    document.getElementById('ac').className = "acright";
    document.getElementById('ac').style.left = "";
    lside = 0;
  }
}


function autocenter(mark) {
  document.getElementById("divInfoac").innerHTML = "<B>AC</B>: " + window[mark].get('title');
  autoc = mark;
  document.getElementById("divInfoac").style.display = "block";
  map.setCenter(window[mark].getPosition());
}



function centeron(mark) {
  cton = true;
  map.setCenter(window[mark].getPosition());
}


function centeroff() {
  if (autoc !== "") {
    map.setCenter(window[autoc].getPosition());
  }
  cton = false;
}

function vpolmar(chk, polmar) {
  window[polmar].setOptions({
    visible: chk
  });
}


function isvisib(pol) {
  if (window[pol].getVisible() === true) return "checked";
  else return "";
}



function dec2dms(dec) {
  dec = Math.abs(dec);
  var decd = Math.floor(dec);
  var decm = Math.floor((dec - decd) * 60);
  var decs = Math.floor((dec - decd - (decm / 60)) * 3600);
  return "" + decd + "&deg; " + decm + "' " + decs + "\"";
}

function changecolor(mark) {
  var colactive = window[mark].get('icol');
  if (++colactive == 9) colactive = 0;
  var ncol = tcolor[colactive];
  window[window[mark].get('poly')].setOptions({
    strokeColor: '#' + ncol
  });
  window[mark].set('icol', "" + colactive);
  return "#" + ncol;
}

function redraw(pol) {
  var p = pol.substring(2);
  var mrk = window["M_" + p];
  var fi = mrk.get('fid');
  var lo = mrk.getPosition().lng().toFixed();
  mrk.set('tra', 1);
  var aa = "";
  if (fi == "hidden") aa = "&a=1";
  downloadUrl(tld + '/' + cxml1 + '?id=' + p + aa + "&l=" + lo, function(data) {
    var vtrace = data.documentElement.getElementsByTagName("m");
    var err = parseFloat(vtrace[0].getAttribute("e"));
    var idd = vtrace[0].getAttribute("i");
    var encodedt = vtrace[0].getAttribute("r");

    if (err === 0 && encodedt.length > 2) {
      window['P_' + idd].getPath().clear();
      var ftrace = google.maps.geometry.encoding.decodePath(encodedt);
      window['P_' + idd].setPath(ftrace);
    }
  });
}


function taskbox() {
  if (document.getElementById('taskbox').checked) {
    vtas = true;
  } else {
    vtas = false;
  }
  var j = -1;
  while (taska[++j]) {
    taska[j].setOptions({
      visible: vtas
    });
  }
}


function reclbox() {
  if (document.getElementById('reclbox').checked) {
    vrecl = true;
    rempl(6, "r");
  } else {
    vrecl = false;
    rempl(6, " ");
  }
  var j = -1;
  while (receivers[++j]) {
    window["R_" + receivers[j][0]].setOptions({
      visible: vrecl
    });
  }
  rehash();
}


function checkrec() {
  downloadUrl(tld + '/' + rxml, function(data) {
    var vlrec = data.documentElement.getElementsByTagName("m");
    var err = parseFloat(vlrec[0].getAttribute("e"));
    if (err === 0 && vlrec.length > 1) {
      selrec = "";
      // effacer markers
      var j = -1;
      while (receivers[++j]) {
        window["R_" + receivers[j][0]].setMap(null);
        delete window["R_" + receivers[j][0]];
      }
      receivers.length = 0;
      for (var i = 1; i < vlrec.length; i++) {
        var re = vlrec[i].getAttribute("a");
        var rlat = parseFloat(vlrec[i].getAttribute("b"));
        var rlon = parseFloat(vlrec[i].getAttribute("c"));
        var ract = parseInt(vlrec[i].getAttribute("d"));
        var rind = 2000 * ract;
        selrec += "<option value='" + re + "'>" + re + "</option>";
        receivers.push([re, rlat, rlon]); // lat et lon stockées mais jamais utilisées ?
        window["R_" + re] = new google.maps.Marker({
          position: new google.maps.LatLng(rlat, rlon),
          title: "Receiver: " + re,
          map: map,
          icon: "" + tld + "/pict/rec" + ract + ".png",
          zIndex: rind,
          visible: vrecl
        });
      }
      setTimeout(checkrec, 120000);
    } else {
      selrec = "<option value='_error_'>Error</option>";
      setTimeout(checkrec, 20000);
    }
    reclbox();
  });

}




function receiv() {
  if (document.getElementById('recbox').checked) {
    vrec = true;
    /*
    var s = document.getElementById("recsel");
    var sv = s.options[s.selectedIndex].value;
    recc="&r="+sv;
    var j=-1;
    while(online[++j]){
      window["M_"+online[j][2]].setMap(null);   delete window["M_"+online[j][2]];
      window["P_"+online[j][2]].setMap(null);   delete window["P_"+online[j][2]];
    }
    j=-1;
    while(offline[++j]){
      window["M_"+offline[j][2]].setMap(null);  delete window["M_"+offline[j][2]];
      window["P_"+offline[j][2]].setMap(null);  delete window["P_"+offline[j][2]];
    }
    */

  } else {
    vrec = false;
    /*
    recc="";
    */
  }
}


function affinfodata(mark) {
  var mrk = window[mark];
  var vz = mrk.get('vz') * m2kt[unit];
  var vx = mrk.get('speed') * kh2kt[unit];
  var al = mrk.get('alt') * m2ft[unit];
  document.getElementById("aclt").innerHTML = mrk.get('tim');
  document.getElementById("acla").innerHTML = mrk.getPosition().lat().toFixed(6);
  document.getElementById("aclo").innerHTML = mrk.getPosition().lng().toFixed(6);
  document.getElementById("acal").innerHTML = al.toFixed() + "&thinsp;" + am2ft[unit];
  document.getElementById("acsp").innerHTML = vx.toFixed() + "&thinsp;" + akh2kt[unit];
  document.getElementById("actr").innerHTML = mrk.get('track');
  document.getElementById("acvz").innerHTML = ((vz >= 0) ? "+" : "&ndash;") + Math.abs(vz).toFixed(1) + "&thinsp;" + am2kt[unit];
  var re = mrk.get('rec');
  if (typeof(window["R_" + re]) != 'undefined') {
    var mre = window["R_" + re];
    var di = dist(mrk.getPosition().lat(), mrk.getPosition().lng(), mre.getPosition().lat(), mre.getPosition().lng());
    re += " (" + di.toFixed() + " Km)";
  } else {
    re += " (?)";
  }
  document.getElementById("acrx").innerHTML = re;
}

function affinfodata2(mark) {
  var mrk = window[mark];
  document.getElementById("acow").innerHTML = mrk.get('owner');
  document.getElementById("acaf").innerHTML = mrk.get('airf');
  document.getElementById("acmo").innerHTML = mrk.get('model');
  document.getElementById("acfr").innerHTML = mrk.get('freq');
}

function affinfo(mark) {
  affinfodata(mark);
  var mrk = window[mark];
  var rg = mrk.get('reg');
  var fi = mrk.get('fid');
  var vd = "block";
  if (fi == rg) vd = "none";
  document.getElementById("ac1").style.display = vd;
  document.getElementById("accn").innerHTML = mrk.get('cn');
  document.getElementById("acfi").innerHTML = fi;
  document.getElementById("acre").innerHTML = rg;
  document.getElementById("acty").innerHTML = ftype[mrk.get('type') * 1];
  if (fi != "hidden") {
    document.getElementById("acif").innerHTML = "<A HREF='https://www.google.com/search?nfpr=1&q=\"" + rg + "\"' target='_blank' onclick=\"event.stopPropagation();\">Infos</a>&nbsp;&nbsp;&nbsp;&nbsp;<A HREF='https://www.google.com/search?nfpr=1&q=\"" + rg + "\"&tbm=isch' target='_blank' onclick=\"event.stopPropagation();\">Pictures</a>";
    if (mrk.get('owner') === "") {
      downloadUrl(tld + '/' + dxml + '?i=' + mark + '&f=' + fi, function(data) {
        var dat = data.documentElement.getElementsByTagName("m");
        var err = parseFloat(dat[0].getAttribute("g"));
        var mrk = dat[0].getAttribute("i");
        if (err === 0) {
          window[mrk].set('owner', "" + dat[0].getAttribute("a"));
          window[mrk].set('airf', "" + dat[0].getAttribute("b"));
          window[mrk].set('model', "" + dat[0].getAttribute("c"));
          window[mrk].set('freq', "" + dat[0].getAttribute("e"));
          affinfodata2(mrk);
          document.getElementById("ac2").style.display = "block";
        } else {
          window[mrk].set('owner', "_");
          document.getElementById("ac2").style.display = "none";
        }
      });


    } else {
      if (mrk.get('owner') != "_") {
        affinfodata2(mark);
        document.getElementById("ac2").style.display = "block";
      } else {
        document.getElementById("ac2").style.display = "none";
      }
    }
  } else {
    document.getElementById("ac2").style.display = "none";
    document.getElementById("acif").innerHTML = "";
    document.getElementById("acow").innerHTML = "";
    document.getElementById("acaf").innerHTML = "";
    document.getElementById("acmo").innerHTML = "";
    document.getElementById("acfr").innerHTML = "";
  }
  acaff = mark;
  document.getElementById("ac").style.display = "block";
}

function settomap() {
  var b = map.getBounds();
  amax = b.getNorthEast().lat();
  amin = b.getSouthWest().lat();
  omax = b.getNorthEast().lng();
  omin = b.getSouthWest().lng();
  if (amax > 85) amax = 85;
  if (amin < -85) amin = -85;
  if (omax > 180) omax = 180;
  if (omin < -180) omin = -180;
  document.getElementById('latmax').value = amax;
  document.getElementById('latmin').value = amin;
  document.getElementById('lonmax').value = omax;
  document.getElementById('lonmin').value = omin;
  if (bound === true) bounds();
  if (vstm === true) {
    boundc = "&b=" + amax + "&c=" + amin + "&d=" + omax + "&e=" + omin;
    hashs = "&s=1";
    rehash();
  }

}

function astm() {
  if (document.getElementById('astmbox').checked) {
    vstm = true;
    if (document.getElementById('boundsbox').checked) {
      bound = false;
      document.getElementById('boundsbox').checked = false;
      hashb = "";
    }
    settomap();

  } else {
    vstm = false;
    if (bound === false) boundc = "";
    hashs = "";
    rehash();
  }
}

function dist(lat1, lon1, lat2, lon2) {
  var torad = Math.PI / 180;
  lat1 *= torad;
  lon1 *= torad;
  lat2 *= torad;
  lon2 *= torad;
  var dt = Math.acos((Math.sin(lat1) * Math.sin(lat2)) + (Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)));
  dt *= 6366;
  return dt;
}

function gesmark() {

  downloadUrl(tld + '/' + cxml + "?a=" + all + boundc + recc + parc + tz, function(data) {
    ++w;
    var planeurs = data.documentElement.getElementsByTagName("m");
    online.length = 0;
    offline.length = 0;
    var colcn;
    var del = "N";

    for (var i = 0; i < planeurs.length; i++) {
      // récupération des données transmises pour ce planeur
      var tab = planeurs[i].getAttribute("a").split(",");

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



      var posi = new google.maps.LatLng(lat, lon);
      var polyvar = "P_" + ps + "_" + cn;
      var markvar = "M_" + ps + "_" + cn;
      var visib = true;


      if (typeof(window[polyvar]) == 'undefined') // si planeur non créé (pas déjà présent sur la carte)
      {
        // **** création de la couleur de la trace en fonction d'un tableau de 9 couleurs
        hcol = tcolor[ccolor];
        if (hnew === true) visib = false;

        // création du PolyLine
        var polyOptions = {
          strokeColor: '#' + hcol,
          strokeOpacity: 0.75,
          strokeWeight: 2,
          visible: visib
        };
        window[polyvar] = new google.maps.Polyline(polyOptions);
        window[polyvar].setMap(map);
        window[polyvar].set('nom', "" + cn + " - " + ps);
        window[polyvar].set('poly', "" + polyvar);

        window[polyvar].getPath().push(posi); // ajout d'une position sur le tracé

        google.maps.event.addListener(window[polyvar], "mouseover", function() {
          focuson(this.get('poly'));
          var bcol = this.strokeColor;
          document.getElementById("divInfo").innerHTML = "<span style='background-color: " + bcol + "'>&nbsp;&nbsp;&nbsp;</span>&nbsp;" + this.get('nom');
        });

        google.maps.event.addListener(window[polyvar], "mouseout", function() {
          focusoff(this.get('poly'));
          document.getElementById("divInfo").innerHTML = "&nbsp;";
        });

        // création du Marker
        window[markvar] = new google.maps.Marker({
          position: posi,
          title: cn + " - " + ps + " @ " + alt + "m",
          map: map,
          icon: "" + tld + "/markers/" + cn + ftypec[typ * 1] + ".png",
          visible: visib
        });
        window[markvar].set('poly', "" + polyvar);
        window[markvar].set('mark', "" + markvar);
        window[markvar].set('nom', "" + cn + " - " + ps);
        window[markvar].set('cn', "" + cn);
        window[markvar].set('reg', "" + ps);
        var fid = tab[12];
        if (fid == "0") fid = "hidden";
        window[markvar].set('fid', "" + fid);
        window[markvar].set('type', "" + typ);
        window[markvar].set('icol', "" + ccolor);
        window[markvar].set('off', 0);
        window[markvar].set('owner', "");
        window[markvar].setTitle("" + cn + " - " + ps + " @ " + (alt * m2ft[unit]).toFixed() + am2ft[unit] + " @ " + tim);
        window[markvar].set('speed', "" + speed);
        window[markvar].set('track', "" + track);
        window[markvar].set('vz', "" + vz);
        window[markvar].set('tim', "" + tim);
        window[markvar].set('rec', "" + rec);
        window[markvar].set('alt', "" + alt);
        window[markvar].set('tra', 0);


        google.maps.event.addListener(window[markvar], "mouseover", function() {
          var bcol = window[this.get('poly')].strokeColor;
          document.getElementById("divInfo").innerHTML = "<span style='background-color: " + bcol + "'>&nbsp;&nbsp;&nbsp;</span>&nbsp;" + this.get('nom');
          focuson(this.get('poly'));
        });

        google.maps.event.addListener(window[markvar], "mouseout", function() {
          document.getElementById("divInfo").innerHTML = "&nbsp;";
          focusoff(this.get('poly'));
        });

        google.maps.event.addListener(window[markvar], "click", function() {
          affinfo(this.get('mark'));
        });

        google.maps.event.addListener(window[markvar], "dblclick", function() {
          document.getElementById("divInfoac").innerHTML = "<B>AC</B>: " + this.get('title');
          autoc = this.get('mark');
          document.getElementById("divInfoac").style.display = "block";
          map.setCenter(this.position);
        });

        google.maps.event.addListener(window[markvar], "rightclick", function() {
          var pol = this.get('poly');
          redraw(pol);
        });

        if (++ccolor == 9) ccolor = 0;
      } // fin du if typeof...



      //var oldalt=window[markvar].get('alt');
      //var difalt=(alt-oldalt)/15;
      var difalt = vz * 1;


      colcn = window[polyvar].strokeColor;

      if (ddf < 600) {
        if (ddf > 120) afdif = "n";
        else if (difalt === 0) afdif = "z";
        else if (difalt < -4) afdif = "mmm";
        else if (difalt < -1) afdif = "mm";
        else if (difalt < 0) afdif = "m";
        else if (difalt > 4) afdif = "ppp";
        else if (difalt > 1) afdif = "pp";
        else afdif = "p";

        online.push([cn, alt * 1, ps + "_" + cn, colcn, afdif]);
        if (window[markvar].get('off') == 1) {
          window[markvar].setOptions({
            zIndex: 50
          });
          window[markvar].setIcon("" + tld + "/markers/" + cn + ftypec[typ * 1] + ".png");
          window[markvar].set('off', 0);
        }

        if (window[markvar].get('tra') === 0) {
          if (window[polyvar].getPath().getLength() >= pathl) window[polyvar].getPath().removeAt(0); // remove first point of the trace
        }


        window[polyvar].getPath().push(posi); // ajout d'une position sur le tracé
        window[markvar].setPosition(posi); // déplace le marker

        // change l'altitude affichée
        window[markvar].setTitle("" + cn + " - " + ps + " @ " + (alt * m2ft[unit]).toFixed() + am2ft[unit] + " @ " + tim);
        window[markvar].set('speed', "" + speed);
        window[markvar].set('track', "" + track);
        window[markvar].set('vz', "" + vz);
        window[markvar].set('tim', "" + tim);
        window[markvar].set('rec', "" + rec);
        window[markvar].set('alt', "" + alt);

      } else {
        if (all === 0) {
          if (typeof(window[polyvar]) != 'undefined') { // si pas déjà effacé
            // efface et détruit le PolyLine et le Marker
            window[polyvar].setMap(null);
            delete window[polyvar];

            window[markvar].setMap(null);
            delete window[markvar];

            if (autoc == markvar) {
              autoc = "";
              document.getElementById("divInfoac").innerHTML = "&nbsp;";
              document.getElementById("divInfoac").style.display = "none";
            }
            if (acaff == markvar) acaff = "";

          }
        } else {
          offline.push([cn, alt * 1, ps + "_" + cn, colcn, "n"]);
          if (window[markvar].get('off') === 0) {
            window[markvar].setOptions({
              zIndex: 10
            });
            window[markvar].setIcon("" + tld + "/markers/" + cn + "_o.png");
            window[markvar].set('off', 1);
          }
        }
      }


      if (autoc == markvar) {
        document.getElementById("divInfoac").innerHTML = "<B>AC</B>: " + cn + " - " + ps + " @ " + (alt * m2ft[unit]).toFixed() + am2ft[unit];
        if (cton === false) map.setCenter(new google.maps.LatLng(lat, lon));
      }

      if (acaff == markvar) affinfodata(markvar);



    } // fin du for (var i = 0; i < planeurs.length; i++)
    // tri et affichage du tableau
    afftab();
    tmgm = setTimeout(gesmark, 10000);
  });

}

function wd() {
  if (w === 0) {
    clearTimeout(tmgm);
    gesmark();
  }
  w = 0;
  tmwd = setTimeout(wd, 30000);
}

function rehash() {
  window.location.hash = hashc + hashz + hashm + hasho + hashb + hashs + hashl + hashw + hashp + hashu;
}

function rempl(po, c) {
  var thl = hl;
  hl = thl.substring(0, po) + c + thl.substring(po + 1);
  thl = hl.replace(/ /g, '');
  if (thl === '') hashl = '';
  else hashl = "&l=" + thl;
}

function taskclic() {
  document.getElementById("chfile").click();
}

function task(cont) {
  var res = JSON.parse(cont);
  var tc, tn, ltp;
  var tp = [];
  var tasks = res.tasks;
  for (var i = 0; i < tasks.length; i++) {
    tn = tasks[i].name || "task" + i;
    tc = tasks[i].color || "FFFFFF";
    tp.length = 0;
    for (var ii = 0; ii < tasks[i].legs.length; ii++) {
      if (typeof tasks[i].legs[ii][1] == 'undefined') { // circle
        aatCircle = new google.maps.Circle({
          strokeColor: '#' + tc,
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: '#' + tc,
          fillOpacity: 0.1,
          map: map,
          center: ltp,
          radius: tasks[i].legs[ii][0]
        });
        taska.push(aatCircle);
      } else {
        ltp = new google.maps.LatLng(tasks[i].legs[ii][0], tasks[i].legs[ii][1]);
        tp.push(ltp);
      }
    }
    var flightPath = new google.maps.Polyline({
      path: tp,
      strokeColor: "#" + tc,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map
    });
    flightPath.set('nom', "" + tn);
    taska.push(flightPath);
    google.maps.event.addListener(flightPath, "mouseover", function() {
      var bcol = this.strokeColor;
      document.getElementById("divInfo").innerHTML = "<span style='background-color: " + bcol + "'>&nbsp;&nbsp;&nbsp;</span>&nbsp;task:&nbsp;" + this.get('nom');
    });

    google.maps.event.addListener(flightPath, "mouseout", function() {
      document.getElementById("divInfo").innerHTML = "&nbsp;";
    });


    // prévoir whitelist pour chaqsue task (avec couleur de fond différente?)
  }
  document.getElementById("dtaskbox").innerHTML = "<INPUT type=\"checkbox\" id=\"taskbox\" onChange=\"javascript : taskbox();\" checked>";

}

function rtask() {
  var files = document.getElementById('chfile').files;
  if (!files.length) {
    alert('Please select a file!');
    return;
  }
  var file = files[0];
  var reader = new FileReader();
  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) {
      var cont = evt.target.result;
      cont = cont.trim();
      task(cont);
    }
  };
  reader.readAsText(file);
}

function initialize() {
  var has = window.location.hash.substring(1).split('&'); // parse the parameters
  var parh = [];
  var cent = [];
  for (var i = 0; i < has.length; i++) {
    var x = has[i].split('=');
    parh[x[0]] = x[1];
  }

  // parameter c=lat,lon (center of the map)
  if (typeof(parh.c) != 'undefined') {
    cent = parh.c.split(',');
    vlat = parseFloat(cent[0]);
    vlon = parseFloat(cent[1]);
    hashc = "c=" + vlat.toFixed(5) + "," + vlon.toFixed(5);
  }

  // parameter o=1 (display offline)
  if (typeof(parh.o) != 'undefined') {
    if (parh.o == "1") {
      all = 1;
      hasho = "&o=1";
    }
  }

  /*
  RELIEF = new google.maps.ImageMapType({
    alt: "www.maps-for-free.com",
    getTileUrl: function(aB,aA) {
      return "http://www.maps-for-free.com//layer/relief/z"+aA+"/row"+aB.y+"/"+aA+"_"+aB.x+"-"+aB.y+".jpg";
      },
    maxZoom: 11,
    name: "Relief",
    tileSize: new google.maps.Size(256,256)
    });

  wateroverlay = new google.maps.ImageMapType({
    getTileUrl: function(aB, aA) {
      if (aA>11) return;
      return "http://www.maps-for-free.com//layer/water/z"+aA+"/row"+aB.y+"/"+aA+"_"+aB.x+"-"+aB.y+".gif";
      },
    maxZoom: 11,
    opacity: 0,
    tileSize: new google.maps.Size(256, 256)
    });
  */
  airspaceoverlay = new google.maps.ImageMapType({
    getTileUrl: function(tile, zoom) {
      var tx = tile.x;
      var ty = tile.y;
      var res = initialResolution / Math.pow(2, zoom);
      ty = ((1 << zoom) - ty - 1); // TMS
      var swlon = tx * 256 * res - originShift;
      var swlat = ty * 256 * res - originShift;
      var nelon = (tx + 1) * 256 * res - originShift;
      var nelat = (ty + 1) * 256 * res - originShift;
      var baseURL = "http://maps.openaip.net/geowebcache/service/wms?service=WMS&request=GetMap&version=1.1.1&layers=openaip_approved_airspaces_geometries&styles=&format=image/png&transparent=true&height=256&width=256&srs=EPSG:900913&bbox=";
      var url = baseURL + swlon + "," + swlat + "," + nelon + "," + nelat;
      return url;
    },
    maxZoom: 17,
    minZoom: 4,
    opacity: 0,
    tileSize: new google.maps.Size(256, 256)
  });

  airportoverlay = new google.maps.ImageMapType({
    getTileUrl: function(tile, zoom) {
      var tx = tile.x;
      var ty = tile.y;
      var res = initialResolution / Math.pow(2, zoom);
      ty = ((1 << zoom) - ty - 1); // TMS
      var swlon = tx * 256 * res - originShift;
      var swlat = ty * 256 * res - originShift;
      var nelon = (tx + 1) * 256 * res - originShift;
      var nelat = (ty + 1) * 256 * res - originShift;
      var baseURL = "http://maps.openaip.net/geowebcache/service/wms?service=WMS&request=GetMap&version=1.1.1&layers=openaip_approved_airports&styles=&format=image/png&transparent=true&height=256&width=256&srs=EPSG:900913&bbox=";
      var url = baseURL + swlon + "," + swlat + "," + nelon + "," + nelat;
      return url;
    },
    maxZoom: 17,
    minZoom: 6,
    opacity: 0,
    tileSize: new google.maps.Size(256, 256)
  });

  windoverlay = new google.maps.ImageMapType({
    getTileUrl: function(tile, zoom) {
      if (zoom > 7) return;
      return "http://www.openportguide.org/tiles/actual/wind_vector/5/" + zoom + "/" + tile.x + "/" + tile.y + ".png";
    },
    maxZoom: 7,
    opacity: 0,
    tileSize: new google.maps.Size(256, 256)
  });

  presoverlay = new google.maps.ImageMapType({
    getTileUrl: function(tile, zoom) {
      if (zoom > 7) return;
      return "http://www.openportguide.org/tiles/actual/surface_pressure/5/" + zoom + "/" + tile.x + "/" + tile.y + ".png";
    },
    maxZoom: 7,
    opacity: 0,
    tileSize: new google.maps.Size(256, 256)
  });


  var myOptions = {
    mapTypeControlOptions: {
      // mapTypeIds: ['RELIEF', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID ]
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
    },
    zoom: 13,
    center: new google.maps.LatLng(vlat, vlon),
    overviewMapControl: true,
    scaleControl: true,
    draggableCursor: 'default',
    draggingCursor: 'default'
      //mapTypeId: google.maps.MapTypeId.TERRAIN
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  //map.mapTypes.set('RELIEF' , RELIEF);

  var mid = 'TERRAIN';
  var tmid = {
    "r": "ROADMAP",
    "t": "TERRAIN",
    "s": "SATELLITE",
    "h": "HYBRID"
  };

  // parameter m= map type
  if (typeof(parh.m) != 'undefined') {
    mid = tmid[parh.m];
    hashm = "&m=" + parh.m;
  }

  map.setMapTypeId(google.maps.MapTypeId[mid]);

  google.maps.event.addListener(map, 'maptypeid_changed', function() {
    hashm = "&m=" + map.getMapTypeId().substr(0, 1);
    rehash();
    /*
      if (id=="RELIEF") {
        wateroverlay.setOpacity(1);
        map.overlayMapTypes.setAt(0, wateroverlay);
      } else {
        wateroverlay.setOpacity(0);
        map.overlayMapTypes.removeAt(0);
      }
        */
  });


  google.maps.event.addListener(map, 'click', function() {
    infowindow.close();
  });

  google.maps.event.addListener(map, 'bounds_changed', function() {
    if (vstm === true) settomap();
  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
    hashz = "&z=" + map.getZoom();
    rehash();
  });

  google.maps.event.addListener(map, 'center_changed', function() {
    var nc = map.getCenter();
    hashc = "c=" + nc.lat().toFixed(5) + "," + nc.lng().toFixed(5);
    rehash();
  });

  // parameter z=  zoom level
  if (typeof(parh.z) != 'undefined') map.setZoom(parseInt(parh.z));
  else {
    var southWest = new google.maps.LatLng(vlatmin, vlonmin);
    var northEast = new google.maps.LatLng(vlatmax, vlonmax);
    var bounds = new google.maps.LatLngBounds(southWest, northEast);
    map.fitBounds(bounds);
  }




  var divinfoCont = document.createElement('DIV'); // contener glider info when overmouse
  divinfoCont.style.paddingTop = "7px";
  divinfoCont.style.paddingRight = "3px";

  var divinfoContac = document.createElement('DIV'); // contener autocenter
  divinfoContac.style.paddingTop = "7px";
  divinfoContac.style.paddingRight = "3px";

  var divinfoContpb = document.createElement('DIV'); // contener poweredby
  divinfoContpb.style.paddingTop = "7px";
  divinfoContpb.style.paddingRight = "3px";


  var divInfo = document.createElement("div");
  divInfo.id = "divInfo";
  divInfo.className = "divInfoclass";
  divInfo.style.width = "170px";
  divInfo.style.float = "left";
  divInfo.style.display = "block";

  divInfo.appendChild(document.createTextNode("..."));

  var divInfoac = document.createElement("div");
  divInfoac.id = "divInfoac";
  divInfoac.className = "divInfoclass";
  divInfoac.style.width = "170px";
  divInfoac.style.cursor = 'pointer';
  divInfoac.style.float = "left";
  divInfoac.style.display = "none";

  divInfoac.appendChild(document.createTextNode("..."));

  var divInfopb = document.createElement("div");
  divInfopb.id = "divInfopb";
  //divInfopb.className = "divInfoclass";
  //divInfopb.style.width = "170px";
  divInfopb.style.backgroundColor = '#F5F5F5';
  divInfopb.style.opacity = 0.7;

  divInfopb.style.cursor = 'pointer';
  divInfopb.style.float = "left";
  divInfopb.style.display = "block";
  divInfopb.innerHTML = "&nbsp;&nbsp;Powered By <A HREF=\"http://glidernet.org\" target=\"_blank\"><B>GliderNet.Org</B></A>&nbsp;&nbsp;";


  // divInfopb.appendChild ( document.createTextNode("Powered By <B>GliderNet.Org</B>"));


  divinfoCont.appendChild(divInfo);
  divinfoContac.appendChild(divInfoac);
  divinfoContpb.appendChild(divInfopb);

  divinfoCont.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(divinfoCont);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(divinfoContac);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(divinfoContpb);

  google.maps.event.addDomListener(divInfoac, 'click', function() {
    document.getElementById("divInfoac").innerHTML = "&nbsp;";
    autoc = "";
    document.getElementById("divInfoac").style.display = "none";
  });




  // affiche l'altitude du terrain quand clic-droit
  elevator = new google.maps.ElevationService();
  google.maps.event.addListener(map, 'rightclick', function(event) {
    var locations = [];
    var clickedLocation = event.latLng;
    locations.push(clickedLocation);

    var latc = clickedLocation.lat();
    var alat = (latc >= 0 ? "N" : "S") + " " + dec2dms(latc);

    var lonc = clickedLocation.lng();
    var alon = (lonc >= 0 ? "E" : "W") + " " + dec2dms(lonc);

    var positionalRequest = {
      'locations': locations
    };

    elevator.getElevationForLocations(positionalRequest, function(results, status) {
      if (status == google.maps.ElevationStatus.OK) {
        if (results[0]) {
          var te = Math.round(results[0].elevation);
          infowindow.setContent('Elevation:' + (te * m2ft[unit]).toFixed() + am2ft[unit] + '<BR>Lat: ' + alat + '<BR>Lon: ' + alon);
          infowindow.setPosition(clickedLocation);
          infowindow.open(map);
        } else {
          alert('No results found');
        }
      } else {
        alert('Elevation service failed due to: ' + status);
      }
    });
  });

  document.getElementById("ett1").innerHTML = ett1;
  document.getElementById("ett2").innerHTML = "<TABLE class=\"tt\"><TR width=\"12\"><TH class=\"cgv\" ondblclick=\"allmarker();\"><IMG src='" + tld + "/pict/ico.png'></TH><TH class=\"cgv\" ondblclick=\"allpath();\"><IMG src='" + tld + "/pict/tra.gif'></TH><TH class=\"cgn\" onclick=\"tricn();\">CN</TH><TH class=\"cgc\" ondblclick=\"deleteallpath();\"><IMG border =\"0\" src='" + tld + "/pict/a.gif'></TH><TH class=\"cga\" onclick=\"trialti();\">Alti.</TH><TH class=\"cgz\">Vz</TH></TR></table>";
  document.getElementById("ac").innerHTML = "<span style=\"color: #333; font-weight: bold; font-size: 1.1em; line-height: 1.3em;\">&nbsp;&nbsp;&nbsp;..::Aircraft::..</span><BR><span class=\"act\">CN: </span><span id=\"accn\" class=\"aca\"></span><BR><DIV id=\"ac1\"><span class=\"act\">Regist.: </span><span id=\"acre\" class=\"aca\"></span><BR></DIV><span class=\"act\">Flarm Id: </span><span id=\"acfi\" class=\"aca\"></span><BR><span class=\"act\">Type: </span><span id=\"acty\" class=\"aca\"></span><BR><DIV id=\"ac2\"><span class=\"act\">Owner: </span><span id=\"acow\" class=\"aca\"></span><BR><span class=\"act\">Airfield: </span><span id=\"acaf\" class=\"aca\"></span><BR><span class=\"act\">Model: </span><span id=\"acmo\" class=\"aca\"></span><BR><span class=\"act\">Freq.: </span><span id=\"acfr\" class=\"aca\"></span></DIV><span class=\"act\">Last time: </span><span id=\"aclt\" class=\"aca\"></span><BR><span class=\"act\">Latitude: </span><span id=\"acla\" class=\"aca\"></span><BR><span class=\"act\">Longitude: </span><span id=\"aclo\" class=\"aca\"></span><BR><span class=\"act\">Altitude: </span><span id=\"acal\" class=\"aca\"></span><BR><span class=\"act\">G.Speed: </span><span id=\"acsp\" class=\"aca\"></span><BR><span class=\"act\">Track: </span><span id=\"actr\" class=\"aca\"></span><span class=\"aca\">&thinsp;&deg;</span><BR><span class=\"act\">Vz: </span><span id=\"acvz\" class=\"aca\"></span><BR><span class=\"act\">Receiver: </span><span id=\"acrx\" class=\"aca\"></span><BR><span id=\"acif\" class=\"aca\"></span>";
  document.getElementById("dtable").innerHTML = "<DIV id=\"menu\" style=\"display:none;\"></DIV><DIV id=\"dtlist\" style=\"display:block\"></DIV>";
  document.getElementById("menu").innerHTML = "<TABLE class=\"tt\"><TR><TD><INPUT type=\"checkbox\" id=\"hnewbox\" onChange='javascript : hidenew();'> Hide new gliders<BR><INPUT type=\"checkbox\" id=\"offl\" onChange='javascript : lineoff();'" + ((all === 0) ? " checked" : "") + "> Ignore Offline<HR><INPUT type=\"checkbox\" id=\"boundsbox\" onChange='javascript : bounds();'" + ((bound === true) ? " checked" : "") + "> Bounds<BR><TABLE cellspacing=\"0\" cellpading=\"0\"><TR align=\"center\"><TD colspan=\"2\"><INPUT type=\"text\" id=\"latmax\" name=\"latmax\" size=\"7\" value=\"" + amax + "\"></TD></TR><TR align=\"center\"><TD><INPUT type=\"text\" id=\"lonmin\" name=\"lonmin\" size=\"7\" value=\"" + omin + "\"></TD><TD><INPUT type=\"text\" id=\"lonmax\" name=\"lonmax\" size=\"7\" value=\"" + omax + "\"></TD></TR><TR align=\"center\"><TD colspan=\"2\"><INPUT type=\"text\" id=\"latmin\" name=\"latmin\" size=\"7\" value=\"" + amin + "\"></TD></TR></TABLE><BR>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type=\"button\" onclick=\"settomap()\" value=\"Set to map\"><BR><INPUT type=\"checkbox\" id=\"astmbox\" onChange='javascript : astm();'> Auto Set to map<HR>..:: Layers ::..<BR><INPUT type=\"checkbox\" id=\"weabox\" onChange=\"javascript : wea();\"> Weather <BR><INPUT type=\"checkbox\" id=\"clobox\" onChange=\"javascript : clo();\"> Clouds <BR><INPUT type=\"checkbox\" id=\"winbox\" onChange=\"javascript : wind();\"> Wind <BR><INPUT type=\"checkbox\" id=\"prebox\" onChange=\"javascript : pres();\"> Pressure <BR><INPUT type=\"checkbox\" id=\"aspbox\" onChange=\"javascript : asp();\"> AirSpaces <A HREF=\"http://www.openaip.net\" target=\"_blank\" style=\"font-size:10px;\">( openaip.net )</A><BR><INPUT type=\"checkbox\" id=\"aptbox\" onChange=\"javascript : apt();\"> Airports <A HREF=\"http://www.openaip.net\" target=\"_blank\" style=\"font-size:10px;\">( openaip.net )</A><BR><INPUT type=\"checkbox\" id=\"reclbox\" onChange=\"javascript : reclbox();\"> Receivers<BR><span id=\"dtaskbox\"><INPUT type=\"checkbox\" disabled></span> <span onclick=\"taskclic();\">Tasks</span><BR> <DIV style=\"display:none\"><input type=\"file\" id=\"chfile\" onchange=\"rtask()\" /></DIV><HR>..::Units::..<BR><input type=\"radio\" name=\"units\" id=\"unm\" value=\"m\" onclick=\"chunit()\" checked>Met. <input type=\"radio\" name=\"units\" id=\"uni\" value=\"i\" onclick=\"chunit()\">Imp.<HR>..::Path length::..<BR><input type=\"radio\" name=\"pl\" id=\"rp1\" value=\"1\" checked onclick=\"chpl()\">5' <input type=\"radio\" name=\"pl\" id=\"rp2\" value=\"2\" onclick=\"chpl()\">10' <input type=\"radio\" name=\"pl\" id=\"rp3\" value=\"3\" onclick=\"chpl()\">All</TD></TR></TABLE>";

  // parameter b=lat1,lon1,lat2,lon2 bounds
  if (typeof(parh.b) != 'undefined') {
    cent = parh.b.split(',');
    document.getElementById('latmax').value = parseFloat(cent[0]);
    document.getElementById('latmin').value = parseFloat(cent[1]);
    document.getElementById('lonmax').value = parseFloat(cent[2]);
    document.getElementById('lonmin').value = parseFloat(cent[3]);
    boundc = "&b=" + cent[0] + "&c=" + cent[1] + "&d=" + cent[2] + "&e=" + cent[3];
    document.getElementById('boundsbox').checked = true;
    bound = true;
    hashb = "&b=" + cent[0] + "," + cent[1] + "," + cent[2] + "," + cent[3];
  }

  // parameter l= active layers
  if (typeof(parh.l) != 'undefined') {
    for (var i = 0; i < parh.l.length; i++) {
      switch (parh.l[i]) {
        case 'w': // weather
          document.getElementById('weabox').checked = true;
          wea();
          break;
        case 'c': // cloud
          document.getElementById('clobox').checked = true;
          clo();
          break;
        case 'v': // wind
          document.getElementById('winbox').checked = true;
          wind();
          break;
        case 'p': // pressure
          document.getElementById('prebox').checked = true;
          pres();
          break;
        case 'z': // airspace
          document.getElementById('aspbox').checked = true;
          asp();
          break;
        case 'a': // airport
          document.getElementById('aptbox').checked = true;
          apt();
          break;
        case 'r': // receivers
          document.getElementById('reclbox').checked = true;
          break;
      }
    }
  }

  if (typeof(parh.t) != 'undefined') {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", parh.t, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var status = xhr.status;
        if ((status >= 200 && status < 300) || status === 304) {
          task(xhr.responseText);
        } else {
          alert("Task Request unsuccessful" + status);
        }
      }
    };

    xhr.send(null);
  }

  // parameter w=0 (Don't display the warning)
  var warn = 1;
  if (typeof(parh.w) != 'undefined') {
    if (parh.w == "0") {
      warn = 0;
      hashw = "&w=0";
    }
  }

  if (warn == 1) {
    document.getElementById("popup").innerHTML = "<img class=\"pr\" alt=\"close\" src=\"" + tld + "/pict/close.png\"><H1>Warning!</H1><BR><P style=\"text-align:justify;\"><B>The data on this site can be ambiguous in certain situations and the displayed position of an aircraft or glider can be displaced relative to the actual position.<BR>Before raising an alert please contact us so we can interpret the data correctly.</B></P>";
    op(300);
  }

  // parameter s=1 auto set bounds to the map
  if (typeof(parh.s) != 'undefined') {
    if (parh.s == "1") {
      document.getElementById('astmbox').checked = true;
      vstm = true;
      hashs = "&s=1";
    }
  }

  // parameter u=i units imperial ou metric (default))
  if (typeof(parh.u) != 'undefined') {
    if (parh.u == "i") {
      document.getElementById('uni').checked = true;
      unit = "i";
      hashs = "&u=i";
    }
  }


  // parameter p=1,2 or 3 path length 5", 10" or all points
  if (typeof(parh.p) != 'undefined') {
    if (parh.p == "2") { // 10 minutes
      pathl = 60;
      document.getElementById('rp2').checked = true;
      hashp = "&p=2";
    } else if (parh.p == "3") { // all points
      pathl = 99999;
      document.getElementById('rp3').checked = true;
      hashp = "&p=3";
    }
  }


  tz = "&z=" + (tz / -60); // the javascript gettimezone function return negative value in minutes then /-60 to have correct hours

  rehash();
  checkrec();
  tmwd = setTimeout(wd, 30000);
  gesmark();
}
