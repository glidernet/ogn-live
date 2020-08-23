<?php

$prot = "http";

if ( isset($_SERVER['HTTPS']) ) {
  if ( 'on' == strtolower($_SERVER['HTTPS']) )
    $prot = "https";
  if ( '1' == $_SERVER['HTTPS'] )
    $prot = "https";
}


if (isset($_GET['rec']))
{
    $recc="'&r=".$_GET['rec']."'";
}
else
{
    $recc = "\"\"";
}

if (isset($_GET['pw']))
{
    $parc="'&p=".$_GET['pw']."'";
}
else
{
    $parc = "\"\"";
}

$lat = 45;
$lon = 5;





if (isset($location->loc)) {
	$latlon = explode(",", $location->loc);
	if ($latlon[0]>-80 && $latlon[0]<80 && $latlon[1]>-180 && $latlon[1]<180) {
		$lat = $latlon[0];
		$lon = $latlon[1];
	}
}


?>
<!DOCTYPE html>
<!--
   ____                      _____ _ _     _             _   _      _                      _    
  / __ \                    / ____| (_)   | |           | \ | |    | |                    | |   
 | |  | |_ __   ___ _ __   | |  __| |_  __| | ___ _ __  |  \| | ___| |___      _____  _ __| | __
 | |  | | '_ \ / _ \ '_ \  | | |_ | | |/ _` |/ _ \ '__| | . ` |/ _ \ __\ \ /\ / / _ \| '__| |/ /
 | |__| | |_) |  __/ | | | | |__| | | | (_| |  __/ |    | |\  |  __/ |_ \ V  V / (_) | |  |   < 
  \____/| .__/ \___|_| |_|  \_____|_|_|\__,_|\___|_|    |_| \_|\___|\__| \_/\_/ \___/|_|  |_|\_\
        | |                                                                                     
        |_|                                                                                     
-->
<html>
<head>
<link rel="shortcut icon" href="favicon.gif"/>
<link rel="icon" type="image/gif" href="favicon.png"/>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
<title>Spot the gliders!</title>
<link href="ol.css" rel="stylesheet" type="text/css" />
<link href="osm.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="ol.js"></script>
<script type="text/javascript" src="util.js"></script>
<script type="text/javascript">
var cxml = "lxml.php";
var cxml1 = "livexml1.php";
var dxml = "dataxml.php";
var rxml = "rec.php";
var tld = "<?php echo $prot.'://'.$_SERVER['HTTP_HOST'];?>";
var vlon = <?php echo $lon; ?>;
var vlat = <?php echo $lat; ?>;
var bound = false;
var boundc = '';
var amax = 85;
var amin = -85;
var omax = 180;
var omin = -180;
var recc = <?php echo $recc;?>;
var parc = <?php echo $parc;?>;
var tz;
try {
    tz = new Date().getTimezoneOffset();
}
catch(e) {
    tz = 0;
} 

</script>
<script type="text/javascript" src="ogn.js"></script>
<script type="text/javascript" src="barogram.js"></script>
<script type="text/javascript" src="horizZoomControl.js"></script>

</head>
<body onload="initialize()">
	<div id="popup" onclick="cp('popup');"></div>
  <div id="map_canvas"></div>
  <div id="ac" class="acright" onclick="this.style.display='none';"></div>
	<div id="lonlatoverlay" style="background-color: white; border-radius: 10px; border: 1px solid black; padding: 5px 10px; display: none;"></div>
  <div id="dlist" class="lright">
		<DIV id="ett1" ></DIV>
		<DIV id="ett2" ></DIV>
		<DIV id="dtable"></DIV>
  </div>
  <div id="dbaro" class="baroleft" style="display:block; visibility:hidden;">
    <canvas id="div_baroScale" width="45" ></canvas>
    <canvas id="div_baro" width="70"></canvas>
    <canvas id="div_baroMark" width="30" ></canvas>
  </div>
</body>

</html>
