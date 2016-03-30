<?php
$link="";
require_once('../config.php');
require_once('../sql.php');
ouvrebase();

$tld="http://live.glidernet.org";

if (isset($_GET['offline'])) {
	if ($_GET['offline']==1) $offl=1; else $offl=0;
	}
else $offl=0;


$req="select * from live";

$latmax=$latmin=$lonmax=$lonmin=0;

if (!$result=@mysql_query ($req))
  {
  echo "<BR><BR><CENTER>Database Error</CENTER><BR><BR>";
  @mysql_close($link);
  exit();
  }


if (@mysql_num_rows($result)==0)
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

  while($ligne = @mysql_fetch_array($result))
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
    $lon = $lonmin + (($lonmax-$lonmin)/2);
    $lat = $latmin + (($latmax-$latmin)/2);
    
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
<link href=\"{$tld}/cunimb3d.css\" rel=\"stylesheet\" type=\"text/css\" />

<script type=\"text/javascript\">
var cxml = \"../lxml.php\";
var cxml1 = \"../livexml1.php\";
var dxml = \"../dataxml.php\";
var rxml = \"../rec.php\";
var tld = \"{$tld}\";
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
var all = $offl;
var tz;
try {
    tz = new Date().getTimezoneOffset();
}
catch(e) {
    tz = 0;
} 

</script>
<script type=\"text/javascript\" src=\"https://www.google.com/jsapi\"> </script>
<script type=\"text/javascript\" src=\"{$tld}/util.js\"></script>
<script type=\"text/javascript\" src=\"{$tld}/cunimb3d.js\"></script>
<script type=\"text/javascript\">
var ge;
google.load(\"earth\", \"1\");
google.setOnLoadCallback(initialize);
</script>


</head>
<body>
	<div id=\"popup\" onclick=\"cp('popup');\"></div>
  <div id=\"map_canvas\"></div>
  <div id=\"divInfoac\" class=\"divInfoclass\" style=\"display: none;\" onclick=\"autocenteroff();\"></div>
  <div id=\"ac\" class=\"acright\" onclick=\"this.style.display='none';\"></div>
  <div id=\"dlist\" class=\"lright\">
  	<DIV id=\"ett1\" ></DIV>
		<DIV id=\"ett2\" ></DIV>	 		
  	<DIV id=\"dtable\"></DIV>
  </div>
</body>

</html>";
@mysql_close($link);
?>
