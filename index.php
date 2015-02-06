<?php
require('sql.php');

$q="select * from live where tim > 0";

if (isset($_GET['rec']))
{
    $recc="'&r=".$_GET['rec']."'";
    $q .=" AND rec=?";
    $params[] = $_GET['rec'];
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


$latmax=$latmin=$lonmax=$lonmin=0;

$stmt = $dbh->prepare($q);
$stmt->execute($params);

if ($stmt->rowCount() == 0)
{
    $latmax=60;
    $latmin=35;
    $lonmax=30;
    $lonmin=-10;
    $lon=2;
    $lat=45;
}
else
{
    $aa=0;
    while($ligne = $stmt->fetch(PDO::FETCH_ASSOC))
    {
        extract($ligne);
        if ($aa==0)
        {
            $latmax=$latmin=$lat;
            $lonmax=$lonmin=$lon;
            $aa=1;
        }
        else
        {
            if ($lat>$latmax) $latmax=$lat;
            if ($lat<$latmin) $latmin=$lat;
            if ($lon>$lonmax) $lonmax=$lon;
            if ($lon<$lonmin) $lonmin=$lon;
        }
    }
}


echo "<!DOCTYPE html>
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
<meta name=\"viewport\" content=\"initial-scale=1.0, user-scalable=no\" />
<meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\"/>
<title>Spot the gliders!</title>
<link href=\"cunimb.css\" rel=\"stylesheet\" type=\"text/css\" />


<script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?libraries=geometry,weather&amp;sensor=false\"></script>
<script type=\"text/javascript\" src=\"util.js\"></script>
<script type=\"text/javascript\">
var cxml = \"lxml.php\";
var cxml1 = \"livexml1.php\";
var dxml = \"dataxml.php\";
var rxml = \"rec.php\";
var tld = \"http://live.glidernet.org\";
var vlon = $lon;
var vlat = $lat;
var vlatmin = $latmin;
var vlonmin = $lonmin;
var vlatmax = $latmax;
var vlonmax = $lonmax;
var bound = false;
var boundc = '';
var amax = 85;
var amin = -85;
var omax = 180;
var omin = -180;
var recc = $recc;
var parc = $parc;
var tz;
try {
    tz = new Date().getTimezoneOffset();
}
catch(e) {
    tz = 0;
} 

</script>
<script type=\"text/javascript\" src=\"cunimb.js\"></script>

</head>
<body onload=\"initialize()\">
	<div id=\"popup\" onclick=\"cp('popup');\"></div>
  <div id=\"map_canvas\"></div>
  <div id=\"ac\" class=\"acright\" onclick=\"this.style.display='none';\"></div>
  <div id=\"dlist\" class=\"lright\">
  	<DIV id=\"ett1\" ></DIV>
		<DIV id=\"ett2\" ></DIV>	 		
  	<DIV id=\"dtable\"></DIV>
  </div>
</body>

</html>";
