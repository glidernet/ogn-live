<?php
$link="";

require_once('../config.php');
require_once('../sql.php');
require($config_aerolist_path);
require($config_passwords_path);
$dbh = Database::connect();
date_default_timezone_set('GMT');

ouvrebase();

$bgc=0;
$durmini = 10;		// minimum duration (in secondes) to valide a flight
$planche = array();
$p1 = array();
$p2 = array();

$afget="";
$alti="QFE";
$json=false;
$gvv="1";		//1:diplay time in hh:mm:mm  2: display time in hh.mm
$unit="M";
$units = array ("M"=>"Meters", "F"=>"Feet");
$debug="";
$torecord=false;
$datatorecord="";
$timezone=0;
$password="";
$theme=0;
$debugpw="********";





if (isset($_GET['a'])) $afget=strtoupper($_GET['a']);		// airfield requested in URL
if (isset($_GET['d'])) $date=$_GET['d']; else $date="";		// date requested in URL

if (isset($_GET['debug'])) $debug=$_GET['debug'];	// for debug purpose

if (isset($_GET['j'])) { $json=true; $gvv=$_GET['j']; } 	// output to JSON format

if (isset($_GET['s'])) {														// altimeter setting QFE (default) or QNH
	if (strtoupper($_GET['s'])=="QNH") $alti="QNH";
}
	
if (isset($_GET['p'])) $password=$_GET['p'];		// password
if (isset($_POST['p'])) $password=$_POST['p'];  

if (isset($_GET['u'])) $unit=strtoupper(substr($_GET['u'],0,1));

if (isset($_GET['z'])) $timezone=$_GET['z'];		// timezone in hours
if (!is_numeric($timezone)) $timezone=0;

if (isset($_GET['t'])) $theme=$_GET['t'];		// theme
if (!is_numeric($theme)) $theme=0;

$tz=$timezone*3600;		// convert the "hour" timezone in seconds  

if ($unit=="M") { 
	$affunit="m"; 
	$m2f=1;
} else {
	$unit="F";
	$affunit="ft"; 
	$m2f=1/0.3048;
}


function duree($d,$a,$f=1,$b="-----") {		// return duration between take off ($d) and landing ($a)
	if ($d!="" && $a!="" && $d!=0 && $a!=0) {
		$t= $a-$d;
		$h= intval($t/3600);
		$t=$t-($h*3600);
		$m= intval($t/60);
		$t=$t-($m*60);
		$s=$t;
		if ($f!=2) $dur=sprintf("%02dh%02dm%02ds", $h,$m,$s);
		else $dur=sprintf("%02dh%02d", $h,$m);
		} 
	else {
		if ($d==0 && $a==0) $dur=""; else $dur=$b; 
		}
	return $dur;
	}

function maxalt($flid,$deco,$att) {			// return towplane maximum altitude in meters QNH
	global $req3;
	if ($deco=="" || $att=="") return '----';
	if (!$req3->execute(array(':fid' => $flid, ':deco' => $deco, ':att' => $att)))	return 'err';
	while($ligne = $req3->fetch(PDO::FETCH_ASSOC))  {  extract($ligne); }
	return $maxalt;
	}

function headerHTML() {
	global $nomaf,$airfieldaltitude,$m2f,$affunit,$date,$airfield,$unit,$alti,$password,$timezone,$theme;
	
	$nextday=date("dmY",mktime(1,0,0,substr($date,2,2),substr($date,0,2)+1,substr($date,4,4)));
	$prevday=date("dmY",mktime(1,0,0,substr($date,2,2),substr($date,0,2)-1,substr($date,4,4)));

	echo "<HTML><HEAD><TITLE>Flight Log $nomaf : $date</TITLE>
<link rel=\"stylesheet\" type=\"text/css\" href=\"http://fonts.googleapis.com/css?family=Dosis\">
<link id=\"theme\" rel=\"stylesheet\" type=\"text/css\" href=\"ogn_${theme}.css\">
</HEAD><BODY><DIV style=\"margin-left: auto; margin-right: auto; text-align: center;\"><H1>Flight Log</H1><H2> $nomaf ( ";
		echo round($airfieldaltitude*$m2f);
		$param="?a=$airfield&s=$alti&u=$unit&z=$timezone&p=$password&t=$theme&d=";
		echo " $affunit )</H2>
		<TABLE  style=\"margin-left: auto; margin-right: auto;\"><TR><TD style=\"width:100px; text-align: left;\"><A HREF=\"${param}${prevday}\">Previous</A></TD><TD><H2>On ".substr($date,0,2)."-".substr($date,2,2)."-".substr($date,4,4)."</H2></TD><TD  style=\"width:100px; text-align: right;\"><A HREF='${param}${nextday}'>Next</A></TD></TR></TABLE></H2></DIV><BR>";
	}

function headerJSON() {
		// Allow from any origin
   if (isset($_SERVER['HTTP_ORIGIN'])) {
		header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Max-Age: 5');    
 	  }
   // Access-Control headers are received during OPTIONS requests
   if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
   	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))	header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         
     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))	header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }		
	header('Content-Type: application/json'); 
	}


// ************************************************************************************
// ********************               FORM                     ************************
// ************************************************************************************
if ($afget=="" || !isset($aero[$afget]) || strtoupper($date)=="NIL") 			// no airfield requested or bad code or date to choose
	{
	if (isset($aero[$afget]) && strtoupper($date)=="NIL") $sel=false; else $sel=true;
	echo "<HTML><HEAD><TITLE>Flight Log</TITLE>
<link rel=\"stylesheet\" type=\"text/css\" href=\"http://fonts.googleapis.com/css?family=Dosis\">
<link id=\"theme\" rel=\"stylesheet\" type=\"text/css\" href=\"ogn_${theme}.css\">
<script type=\"text/javascript\" src=\"changeTheme.js\"></script>
<SCRIPT LANGUAGE=\"JavaScript\" SRC=\"CalendarPopup.js\"></SCRIPT>
<SCRIPT LANGUAGE=\"JavaScript\" SRC=\"init.js\"></SCRIPT>
<script type=\"text/javascript\">
	theme = ${theme};
	theme_name = [ 'Original', 'Black', 'White' ];

</script>
</HEAD><BODY onload=\"inittz(${sel});\"><DIV style=\"margin-left: auto; margin-right: auto;\">
	";
    
  echo "<CENTER><BR>";
  echo "<FORM action=\"index.php\" ENCTYPE=\"multipart/form-data\" method=\"get\"><INPUT id=\"tid\" type=\"hidden\" name=\"t\" value=\"0\">";
  if ($debug==$debugpw) echo "<INPUT type=\"hidden\" name=\"debug\" value=\"1\">";
	if ($json)  echo "<INPUT type=\"hidden\" name=\"j\" value=\"1\">";
  echo "<TABLE><TR><TD>Airfield:</TD><TD>";
  if (!$sel) {
  	echo $aero[$afget][0]." ($afget)<input type=\"hidden\" name=\"a\" value=\"$afget\">";
  } else {		// display airfields list  
  	echo "<select name=\"a\" size=\"1\">";
		foreach ($aero as $k => $v) {
			// if a password is needed for this airfield, it is not displayed on the list
			if (array_key_exists($k, $passwords) continue;
			echo "<option value=\"$k\">$v[0] ($k)";
		}
  	echo "</select>";
  }
  echo "</TD></TR><TR><TD>Date</TD><TD>
  		<SCRIPT LANGUAGE=\"JavaScript\" ID=\"jscal1xx\">
			var cal1xx = new CalendarPopup(\"testdiv1\");
			cal1xx.showNavigationDropdowns();
			</SCRIPT>
			<INPUT TYPE=\"text\" NAME=\"d\" id=\"ddate\" VALUE=\"\" SIZE=15>
			<A HREF=\"#\" onClick=\"cal1xx.select(document.forms[0].d,'anchor1xx','dd-MM-yyyy'); return false;\" TITLE=\"cal1xx.select(document.forms[0].d,'anchor1xx','dd-MM-yyyy'); return false;\" NAME=\"anchor1xx\" ID=\"anchor1xx\">select</A>
			</TD></TR>";
  echo "<TR><TD>Altimeter setting</TD><TD>";
  if (!$sel) {
  	echo $alti."<input type=\"hidden\" name=\"s\" value=\"$alti\">";
  } else {
  	echo "<select name=\"s\" size=\"1\"><option value=\"QFE\">QFE<option value=\"QNH\">QNH</select>";
  }
  echo "</TD></TR><TR><TD>Units</TD><TD>";
  if (!$sel) {
  	echo $units[$unit]."<input type=\"hidden\" name=\"u\" value=\"$unit\">";
  } else {
  	echo "<select name=\"u\" size=\"1\"><option value=\"m\">Meters<option value=\"f\">Feet</select>";
  }
  echo "</TD></TR><TR><TD>Time Zone</TD><TD>";
  if (!$sel) {
  	if ($timezone>0) echo "+";
  	echo $timezone." UTC<input type=\"hidden\" name=\"z\" value=\"$timezone\">";
  } else {
  	echo "<select name=\"z\" id=\"tz\" size=\"1\">
  <option value=\"-12\">GMT-12:00
  <option value=\"-11\">GMT-11:00
  <option value=\"-10\">GMT-10:00
  <option value=\"-9.5\">GMT-09:30
  <option value=\"-9\">GMT-09:00
  <option value=\"-8\">GMT-08:00
  <option value=\"-7\">GMT-07:00
  <option value=\"-6\">GMT-06:00
  <option value=\"-5\">GMT-05:00
  <option value=\"-4.5\">GMT-04:30
  <option value=\"-4\">GMT-04:00
  <option value=\"-3.5\">GMT-03:30
  <option value=\"-3\">GMT-03:00
  <option value=\"-2\">GMT-02:00
  <option value=\"-1\">GMT-01:00
  <option value=\"0\">GMT
  <option value=\"1\">GMT+01:00
  <option value=\"2\">GMT+02:00
  <option value=\"3\">GMT+03:00
  <option value=\"3.5\">GMT+03:30
  <option value=\"4\">GMT+04:00
  <option value=\"4.5\">GMT+04:30
  <option value=\"5\">GMT+05:00
  <option value=\"5.5\">GMT+05:30
  <option value=\"5.75\">GMT+05:45
  <option value=\"6\">GMT+06:00
  <option value=\"6.5\">GMT+06:30
  <option value=\"7\">GMT+07:00
  <option value=\"8\">GMT+08:00
  <option value=\"8.75\">GMT+08:45
  <option value=\"9\">GMT+09:00
  <option value=\"9.5\">GMT+09:30
  <option value=\"10\">GMT+10:00
  <option value=\"10.5\">GMT+10:30
  <option value=\"11\">GMT+11:00
  <option value=\"11.5\">GMT+11:30
  <option value=\"12\">GMT+12:00
  <option value=\"12.75\">GMT+12:45
  <option value=\"13\">GMT+13:00
  <option value=\"14\">GMT+14:00
  </select>";
		}
  echo "</TD></TR><TR><TD>Theme</TD><TD><button type='button' id=\"css_switch\" onclick=\"changeTheme()\">Original</button></TD></TABLE><BR><input type=\"submit\" value=\"Submit\"></FORM><BR><IMG SRC=\"../pict/ogn-logo-ani.gif\"></CENTER>";
	echo "</DIV>
	<DIV ID=\"testdiv1\" STYLE=\"position:absolute;visibility:hidden;background-color:white;layer-background-color:white;\"></DIV>
	</BODY></HTML>";
	}
else 
// ************************************************************************************
// ********************        DATABASE OR COMPUTE             ************************
// ************************************************************************************
	{
	$airfield = $afget;
	$nomaf = $aero[$airfield][0];
	if (array_key_exists($airfield, $passwords)) {
		// if a password is requested for this airfield, check credentials
		if (crypt($password, 'GliderNetdotOrg') != $passwords[$airfield]) exit();
	}

	$geo = $aero[$airfield][1];
	$airfieldaltitude = $aero[$airfield][2];
	$altt=$airfieldaltitude+100;		// for landing detection, to check only point between airfield altitude and 100m above




	if ($date=="") {
		$date=date("dmY");
		$dbdate=substr($date,4,4)."-".substr($date,2,2)."-".substr($date,0,2);
		}
	else {
		if (strlen($date)==10) $date=substr($date,0,2).substr($date,3,2).substr($date,6,4);
		$today=date("Ymd");
		$reqdate=substr($date,4,4).substr($date,2,2).substr($date,0,2);
		$dbdate=substr($date,4,4)."-".substr($date,2,2)."-".substr($date,0,2);
		// if requested date < today we check if there is data in the flightlog table
		if ($reqdate<$today) {	
	  	$req = $dbh->prepare("SELECT * from flightlog WHERE airfield=:af AND fdate=:da ORDER BY num ASC");
			$req->execute(array(':af' => $afget, ':da' => $dbdate));
			
			if ($req->rowCount()>0)		// display flights recorded in the Database
				{
	  		// display flightlog table
	  		$nbrow=$first=0;
  			while($ligne = $req->fetch(PDO::FETCH_ASSOC))
 					{
 					extract($ligne); 
 					
 					if ($num==0 && $planereg=='NoF')	{		// "No flight this day" flag recorded in the database
 						if (!$json) {		// web display
 							headerHTML();
			 				echo "<DIV style=\"margin-left: auto; margin-right: auto; text-align: center;\">No flight this day / Pas de vol ce jour</DIV><TABLE>";
						}
						break;
 					}
 					
 					if (++$nbrow==1) {		// display headers before the first row
 						if (!$json) {
	  					headerHTML();
			  			// ---------- à effacer
			  			if ($debug==$debugpw) {
		  					$jour=intval(substr($date,0,2));
								$mois=intval(substr($date,2,2));
								$annee=intval(substr($date,4,4));
								$deb=mktime(0,0,1,$mois,$jour,$annee);			
								$deb-=$tz;			// $deb is the start (midnight - time zone)
								$fin=$deb+86400;	// deb +24h			$fin is the end of time interval to check
								/*
									  					$reqaff="SELECT l.idd,l.pseudo,l.lat,l.lon,l.alt,l.tim,l.vit,l.vz,l.type,l.crc,l.fid,f.cn as ccn,f.type as model
									FROM liveall AS l
									LEFT JOIN flarmnet AS f ON l.fid = f.id
									WHERE (tim BETWEEN $deb AND $fin ) AND $geo ORDER BY l.fid,l.tim;";
															echo "<PRE>$reqaff </PRE><BR>";
								*/							
								$reqaff="SELECT l.pseudo,l.alt,l.tim,l.vit,l.type,l.crc,l.fid,d.dev_accn as ccn,d.dev_actype as model
									FROM liveall AS l
									LEFT JOIN devices AS d ON l.fid = d.dev_id
									WHERE (tim BETWEEN $deb AND $fin ) AND $geo ORDER BY l.fid,l.tim;";
								echo "<PRE>$reqaff </PRE><BR>";
							}
							// ------------------					
					
 							echo "<TABLE style=\"margin-left: auto; margin-right: auto;\"><TR><TH>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</TH><TH class=\"tt\">TowPlane<BR>Plane</TH><TH class=\"tt\">Type</TH><TH>(Moto)Glider</TH><TH>CN</TH><TH class=\"tt\">Type</TH><TH class=\"tt\">Take Off</TH><TH class=\"tt\">Glider<BR>Landing</TH><TH class=\"tt\">Glider<BR>Time</TH><TH class=\"tt\">Plane<BR>Landing</TH><TH class=\"tt\">Plane<BR>Time</TH><TH class=\"tt\">TowPlane<BR>Max Alt.<BR>( $alti )</TH>";
							echo "</TR>";
	  				}
	  				else {
	  					headerJSON();
	  					echo "{
\"date\": \"$date\",
\"airfield\": \"$airfield\",
\"alt_setting\": \"$alti\",
\"unit\": \"$affunit\",
\"flights\": [
";
	  				}
					}

		
//	"INSERT INTO `flightlog` (`fdate`, `airfield`, `num`, `planereg`, `planemodel`, `planelanding`, `gliderreg`, `glidercn`, `glidermodel`, `gliderlanding`, `takeoff`, `maxaltitude`) VALUES ";
//												"('$dbdate','$airfield','$num','$d_preg','$d_pmod','$db_plan','$d_greg','$d_gcn','$d_gmod','$db_glan','$db_tako','$d_malt'),";
 					
					if ($maxaltitude!=-99) {
						if ($alti=="QFE") $maxaltitude=$maxaltitude-$airfieldaltitude;
						$maxaltitude = "".round($maxaltitude*$m2f);
						$d_maxa = $maxaltitude." $affunit";
					} else $maxaltitude = $d_maxa =  "";
					
 					$d_tako=($takeoff==0)?'':(($gvv==2)?date("G.i",$takeoff+$tz):date("G:i:s",$takeoff+$tz));
 					$d_glan=($gliderlanding==0)?'':(($gvv==2)?date("G.i",$gliderlanding+$tz):date("G:i:s",$gliderlanding+$tz));
 					$d_plan=($planelanding==0)?'':(($gvv==2)?date("G.i",$planelanding+$tz):date("G:i:s",$planelanding+$tz));
 					$d_gtim=duree($takeoff,$gliderlanding,$gvv,"-----");  // glider time;
 					$d_ptim=duree($takeoff,$planelanding,$gvv,"-----");	// plane time
 					$d_pfid=$planefid;
 					$d_gfid=$gliderfid;
 					
					if (!$json) {		// web display
						if (++$bgc==3) $bgc=1;
					
						$ech="<TR><TD class=\"t{$bgc}c\">$num</TD><TD class=\"a{$bgc}l\">";
						$ech.=$planereg;			// plane reg
						$ech.="</TD><TD class=\"a{$bgc}l\">";
						$ech.=$planemodel;			// plane model
						$ech.="</TD><TD class=\"p{$bgc}l\">";
						$ech.=$gliderreg;			// glider ID
						$ech.="</TD><TD class=\"p{$bgc}n\">";
						$ech.=$glidercn;			// glider CN
						$ech.="</TD><TD class=\"p{$bgc}l\">";
						$ech.=$glidermodel;			// glider model
						$ech.="</TD><TD class=\"t{$bgc}c\">";
						// if ($takeoff!=0) $disptakeoff = date("G:i:s",$takeoff+$tz); else $disptakeoff="";
						//$ech.=$disptakeoff;		// take-off
						$ech.=$d_tako;		// take-off
						$ech.="</TD><TD class=\"p{$bgc}c\">";
						//if ($gliderlanding!=0) $dispgliderlanding = date("G:i:s",$gliderlanding+$tz); else $dispgliderlanding="";				
						//$ech.=$dispgliderlanding;		// glider landing
						$ech.=$d_glan;		// glider landing
						$ech.="</TD><TD class=\"p{$bgc}c\">";
						$ech.=$d_gtim;  // glider time;
						$ech.="</TD><TD class=\"a{$bgc}c\">";
						//if ($planelanding!=0) $dispplanelanding = date("G:i:s",$planelanding+$tz); else $dispplanelanding="";
						//$ech.=$dispplanelanding;		// plane landing
						$ech.=$d_plan;		// plane landing
						$ech.="</TD><TD class=\"a{$bgc}c\">";
						$ech.=$d_ptim;	// plane time
						$ech.="</TD><TD class=\"a{$bgc}c\">";
						$ech.=$d_maxa;	// Altitude Max 
										
						$ech.="</TD>";
						$ech.="</TR>";
					
						echo $ech;
					}
				else {	// JSON format output
					if ($first==0) $ech=""; else $ech=",
";					
					$ech.= "	{
	\"plane\": \"$planereg\",
	\"glider\": \"$gliderreg\",
	\"takeoff\": \"$d_tako\",
	\"plane_landing\": \"$d_plan\",
	\"glider_landing\": \"$d_glan\",
	\"plane_time\": \"$d_ptim\",
	\"glider_time\": \"$d_gtim\",
	\"towplane_max_alt\": \"$maxaltitude\"";
					if ($gvv==3) {
						$ech.=",
	\"plane_flarmid\": \"$d_pfid\",
	\"glider_flarmid\": \"$d_gfid\"";
					}			
					$ech.="
	}";
	
					echo $ech;
					$first=1;
					}	
					
 				} 

 			if (!$json) {		// web display
 				echo "</TABLE><!--FlightLog From Flightlog DataBase --></BODY></HTML>";
				}
 			else {
				echo "
	]
}";
 				}
 			exit();

	  	} else {
	  		$torecord=true;		// if flights detected, they have to be recorded in the flightlog table
		  }
	  } 	
		
		
	}
	
			
	$jour=intval(substr($date,0,2));
	$mois=intval(substr($date,2,2));
	$annee=intval(substr($date,4,4));


		

	$deb=mktime(0,0,1,$mois,$jour,$annee);			
	$deb-=$tz;			// $deb is the start (midnight - time zone)
	$fin=$deb+86400;	// deb +24h			$fin is the end of time interval to check

	if (!$json) headerHTML();	else headerJSON();

	$req2 = $dbh->prepare("SELECT l.pseudo,l.alt,l.tim,l.vit,l.type,l.crc,l.fid,d.dev_accn as ccn,d.dev_actype as model
	FROM liveall AS l
	LEFT JOIN devices AS d ON l.fid = d.dev_id
	WHERE (l.tim BETWEEN $deb AND $fin ) AND $geo ORDER BY l.fid,l.tim;");
		
	$req2->execute();
	

	$alllog="req: SELECT l.pseudo,l.alt,l.tim,l.vit,l.type,l.crc,l.fid,d.dev_accn as ccn,d.dev_actype as model
	FROM liveall AS l
	LEFT JOIN devices AS d ON l.fid = d.dev_id
	WHERE (l.tim BETWEEN $deb AND $fin ) AND $geo ORDER BY l.fid,l.tim; <BR><BR><BR><TABLE><TR><TH>Ident</TH><TH>Regis.</TH><TH>CRC</TH><TH>Type</TH><TH>timer</TH><TH>time</TH><TH>Alt</TH><TH>Speed</TH><TH>Vz</TH></TR>";

	$id=$dec=$att=$mcrc="";
	$envol=false;

	// ************* Firt loop to detect take off and landing ***************************
	// ************* record them in the $planche array
	// ************* $planche index is the take off timestamp+counter (if there is many takeoff at the same time) 	
	$cptt=0;
	$a_enrg=0;
	    
	while($ligne = $req2->fetch(PDO::FETCH_ASSOC))
	  {
	  extract($ligne);
	  if ($crc!=$mcrc)			// if this is another aircraft
	  	{
	  	if ($id!="") { // record the line
	  		if ($dec!="" || $att!="") {
	  			$ind=($dec=="")?$att:$dec;
	  			$ind.="+".sprintf("%06d", ++$cptt);
	  			if (strlen($id)>=8) $id1=$mcrc; else $id1=$id;
 					$planche[$ind]=array($typ,$id1,$mod,$cn,$dec,$att,$flarmid);
	  			}
	  		}
	  	$id=$pseudo;
	  	$mod=$model;
	  	$typ=$type;
	  	$cn=$ccn;
	  	
	  	$mcrc=$crc;
	  	if (substr($pseudo,3)==$fid) $flarmid=""; else $flarmid=$fid;		// if aircraft in OGN database, retreive Flarm ID
	  	$att=$dec="";
	  	$a_enrg=0;
	  	
	  	if ($vit>50) $envol=true; else $envol=false;		// on the firt point, airborn status is true if speed>50km/h
	  	} 
	  if ($vit>55)		//if speed>55 then take off detected
	  	{
	  	if ($envol==false) 
	  		{
	  		$dec=$tim;		// take off time
	  		$a_enrg=1;
	  		$envol=true;
	  		}
	  	}


	  if ($vit<=40 && $alt<=$altt )		// if speed<40km/h and altitude < $altt then landing detected
	  	{
	  	if ($envol==true) { 
		  	$att=$tim;		// landing time
		  	
		  	$ind=($dec=="")?$att:$dec;
  			$ind.="+".sprintf("%06d", ++$cptt);
  			if (strlen($id)>=8) $id1=$mcrc; else $id1=$id;
				$planche[$ind]=array($typ,$id1,$mod,$cn,$dec,$att,$flarmid);
		  	$envol=false;
		  	$dec=$att="";
		  	$a_enrg=0;
		  	}
		  }
	  
	  
	  $alllog.="<TR><TD></TD><TD>$pseudo</TD><TD>$crc</TD><TD>$typ</TD><TD>$tim</TD><TD>".date("G:i:s",$tim)."</TD><TD>$alt</TD><TD>$vit</TD><TD></TD></TR>";
	  }		// fin while    
	  
  if ($a_enrg==1) {
		$ind=($dec=="")?$att:$dec;
	  $ind.="+".sprintf("%06d", ++$cptt);
	  if (strlen($id)>=8) $id1=$mcrc; else $id1=$id;
 		$planche[$ind]=array($typ,$id1,$mod,$cn,$dec,$att,$flarmid);  	
  	}
	  
 
	  
	$alllog.="</TABLE>";
	// **************************
	if ($debug==$debugpw) {
		echo $alllog;
		echo "<BR>-------------------------------------------------------------<BR>not sorted flightlog:<BR><PRE>";
		var_dump($planche);
		echo "</PRE>";
		}
	// **************************

	ksort($planche);		// sort all records on the time
	
	// **************************
	if ($debug==$debugpw) {
		echo "<BR>------------------------------------------------------------<BR>sorted flightlog:<BR><PRE>";
		var_dump($planche);
		echo "</PRE>";
		}
	// **************************	
	
			
	// ************* second loop to sort every lines to $p1 ***************************
	$ii=-1;
	foreach ($planche as $i => $value) {
		$p1[++$ii]=$value;
		}


	// **************************
	if ($debug==$debugpw) {
		echo "--------------------------------------------------------<BR><BR>p1:<BR><PRE>";
		var_dump($p1);	
		echo "</PRE>";	
		}
	// **************************	

//         0   1     2     3    4	 5     6     
// p1: ($type,$id,$model,$cn,$dec,$att,$flarmid);		
// p2: (valid, (plane) $id,$model,$dec,$att,$flarmid, (glider) $id,$cn,$model,$att,$flarmid,$maxalt);
//        0            1     2    3     4      5  		  			 6    7    8      9    10       11

	if ($ii==-1) {
		$torecordreq= "INSERT INTO `flightlog` (`fdate`, `airfield`, `num`, `planereg`) VALUES ('$dbdate','$airfield','0','NoF');";
		if (!$json)  echo "<DIV style=\"margin-left: auto; margin-right: auto; text-align: center;\">No flight this day / Pas de vol ce jour</DIV>";
		}
	else {
		
	// ************* 3th loop to only set gliders to  $p2 from $p1 ***************************
	
		for ($j=0;$j<=$ii;++$j) {
			$typac=$p1[$j][0];		// aircraft type
		
			switch($typac) {
				
			case 1:		// type glider /motoglider
				if (abs($p1[$j][5]-$p1[$j][4])>=$durmini) $ok=1; else $ok=0;		// tests if duration long enought
				$p2[$j]=array($ok,'','',$p1[$j][4],'','',$p1[$j][1],$p1[$j][3],$p1[$j][2],$p1[$j][5],$p1[$j][6],'');
	
				break;
			}

		}			

	// ************* quatrième boucle affecte lignes remorqueurs et autres  $p2 ***************************	
	$req3 = $dbh->prepare("select max(alt) as maxalt from liveall where fid=:fid AND tim BETWEEN :deco AND :att");
			
		for ($j=0;$j<=$ii;++$j) {
			$typac=$p1[$j][0];		// type aircraft
			$maxalt="";
			
			switch($typac) {

			case 1:		// type glider /motoglider
				// do nothing, done in previous loop
				break;

			case 2:								// type towplane
				if (abs($p1[$j][5]-$p1[$j][4])>=$durmini) {
					if ($p1[$j][6]!="")	$maxalt=maxalt($p1[$j][6],$p1[$j][4],$p1[$j][5]);
					$dp=$ds=-1;
					if ($p1[$j][4]!="") {			// if takeoff not empty, it checks glider before or after
						if ($j>0) {				// if not first line
							if ($p1[$j-1][0]==1 && $p2[$j-1][0]==1) { // previous is a glider and duration ok
								$dif=abs($p1[$j][4]-$p1[$j-1][4]);
								if ($dif<15)	$dp=$dif; 	// if less than 15 secondes with previous glider
								}
							}	
							
						if ($j<$ii) {			// if not last line					
							if ($p1[$j+1][0]==1 && $p2[$j +1][0]==1) { // next is a glider and duration ok
								$dif=abs($p1[$j][4]-$p1[$j+1][4]);
								if ($dif<15)	$ds=$dif;  // if less than 15 secondes with next glider
								}
							}
						}
							
					if ($dp==-1 && $ds==-1)	{	// if no glider before and after or not dif<15s
						if (abs($p1[$j][5]-$p1[$j][4])>=$durmini) $ok=1; else $ok=0;
						$p2[$j]=array($ok,$p1[$j][1],$p1[$j][2],$p1[$j][4],$p1[$j][5],$p1[$j][6],'','','','','',$maxalt);
						}
					elseif ($dp==-1) {		// if previous glider =-1 then the next is ok
						$p2[$j+1]=array(1,$p1[$j][1],$p1[$j][2],$p1[$j][4],$p1[$j][5],$p1[$j][6],$p2[$j+1][6],$p2[$j+1][7],$p2[$j+1][8],$p2[$j+1][9],$p2[$j+1][10],$maxalt);
						$p2[$j]=array(0,'','','','','','','','','','','');
						}
					elseif ($ds==-1) {		// if next glider =-1 then the previous is ok
						$p2[$j-1]=array(1,$p1[$j][1],$p1[$j][2],$p1[$j][4],$p1[$j][5],$p1[$j][6],$p2[$j-1][6],$p2[$j-1][7],$p2[$j-1][8],$p2[$j-1][9],$p2[$j-1][10],$maxalt);
						$p2[$j]=array(0,'','','','','','','','','','','');
						}
					else {
						if ($dp<$ds) {
							$p2[$j-1]=array(1,$p1[$j][1],$p1[$j][2],$p1[$j][4],$p1[$j][5],$p1[$j][6],$p2[$j-1][6],$p2[$j-1][7],$p2[$j-1][8],$p2[$j-1][9],$p2[$j-1][10],$maxalt);
							$p2[$j]=array(0,'','','','','','','','','','','');
							}
						else {
							$p2[$j+1]=array(1,$p1[$j][1],$p1[$j][2],$p1[$j][4],$p1[$j][5],$p1[$j][6],$p2[$j+1][6],$p2[$j+1][7],$p2[$j+1][8],$p2[$j+1][9],$p2[$j+1][10],$maxalt);
							$p2[$j]=array(0,'','','','','','','','','','','');
							}
						}
				
					}
				else {
					$p2[$j]=array(0,'','','','','','','','','','','');
				}
					
				break;
		
			default :		// type planes, helicopter etc
				if (abs($p1[$j][5]-$p1[$j][4])>=$durmini) $ok=1; else $ok=0;
				if ($typac == '5' && $p1[$j][6]!="")	$maxalt=maxalt($p1[$j][6],$p1[$j][4],$p1[$j][5]);  // if drop plane
				$p2[$j]=array($ok,$p1[$j][1],$p1[$j][2],$p1[$j][4],$p1[$j][5],$p1[$j][6],'','','','','',$maxalt);
				break;
			}
		}
	
	
	// **************************
	if ($debug==$debugpw) {
		echo "--------------------------------------------------------<BR><BR>p2:<BR><PRE>";
		var_dump($p2);	
		echo "</PRE>";	
		}
	// **************************	
	
	
		
		
	if (!$json)  {
		echo "<TABLE style=\"margin-left: auto; margin-right: auto;\"><TR><TH>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</TH><TH class=\"tt\">TowPlane<BR>Plane</TH><TH class=\"tt\">Type</TH><TH>(Moto)Glider</TH><TH>CN</TH><TH class=\"tt\">Type</TH><TH class=\"tt\">Take Off</TH><TH class=\"tt\">Glider<BR>Landing</TH><TH class=\"tt\">Glider<BR>Time</TH><TH class=\"tt\">Plane<BR>Landing</TH><TH class=\"tt\">Plane<BR>Time</TH><TH class=\"tt\">TowPlane<BR>Max Alt.<BR>( $alti )</TH>";
		echo "</TR>";
		}
	else {
		echo "{
\"date\": \"$date\",
\"airfield\": \"$airfield\",
\"alt_setting\": \"$alti\",
\"unit\": \"$affunit\",
\"flights\": [
";
	}
		$first=$num=0;
		if ($torecord==true) $torecordreq= "INSERT INTO `flightlog` (`fdate`, `airfield`, `num`, `planereg`, `planemodel`, `planelanding`, `gliderreg`, `glidercn`, `glidermodel`, `gliderlanding`, `takeoff`, `maxaltitude`, `planefid`, `gliderfid`) VALUES ";
		for ($j=0;$j<=$ii;++$j) {
			if ($p2[$j][0]==1) {
				++$num;
				$d_preg=$d_pmod=$d_greg=$d_gcn=$d_gmod=$d_tako=$d_glan=$d_gtim=$d_plan=$d_ptim=$d_malt=$d_gfid=$d_pfid="";		// variables for display
				$db_tako=$db_plan=$db_glan=0;
				$db_malt=-99;

				if (isset($p2[$j][1])) $d_preg="{$p2[$j][1]}";			// plane reg
				if (isset($p2[$j][2])) $d_pmod="{$p2[$j][2]}";			// plane model
				if (isset($p2[$j][5])) $d_pfid="{$p2[$j][5]}";			// plane flarm id
				if (isset($p2[$j][6])) $d_greg="{$p2[$j][6]}";			// glider reg
				if (isset($p2[$j][7])) $d_gcn ="{$p2[$j][7]}";			// glider CN
				if (isset($p2[$j][8])) $d_gmod="{$p2[$j][8]}";			// glider model
				if (isset($p2[$j][10])) $d_gfid="{$p2[$j][10]}";			// glider flarm id
				if (isset($p2[$j][3])) 	// take-off
					{
					$d_tako=($p2[$j][3]=="")?'':(($gvv==2)?date("G.i",$p2[$j][3]+$tz):date("G:i:s",$p2[$j][3]+$tz));		
					$db_tako=$p2[$j][3];
					}
				if (isset($p2[$j][9])) 	// glider landing
					{
					$d_glan=($p2[$j][9]=="")?'':(($gvv==2)?date("G.i",$p2[$j][9]+$tz):date("G:i:s",$p2[$j][9]+$tz));		
					$db_glan=$p2[$j][9];
					}
				if (isset($p2[$j][3]) && isset($p2[$j][9])) $d_gtim=duree($p2[$j][3],$p2[$j][9],$gvv,"-----");  // glider time
				if (isset($p2[$j][4])) 	// plane landing
					{
					$d_plan=($p2[$j][4]=="")?'':(($gvv==2)?date("G.i",$p2[$j][4]+$tz):date("G:i:s",$p2[$j][4]+$tz));		
					$db_plan=$p2[$j][4];
					}
				if (isset($p2[$j][3]) && isset($p2[$j][4])) $d_ptim=duree($p2[$j][3],$p2[$j][4],$gvv,"-----");	// plane time

			
				if ($p2[$j][11]!='') $d_malt=$db_malt="{$p2[$j][11]}";  		// Altitude Max 
				
				

				if ($torecord==true) $torecordreq.= "('$dbdate','$airfield','$num','$d_preg','$d_pmod','$db_plan','$d_greg','$d_gcn','$d_gmod','$db_glan','$db_tako','$db_malt','$d_pfid','$d_gfid'),";
					
				
				if ($d_malt!='' && $d_malt!='----') {
					if ($alti=="QFE") $d_malt=$d_malt-$airfieldaltitude;
					$d_malt = round($d_malt*$m2f);
					}

				
				if (!$json) {		// web display
					if (++$bgc==3) $bgc=1;
					
					$ech="<TR><TD class=\"t{$bgc}c\">$num</TD><TD class=\"a{$bgc}l\">";
					$ech.=$d_preg;			// plane reg
					$ech.="</TD><TD class=\"a{$bgc}l\">";
					$ech.=$d_pmod;			// plane model
					$ech.="</TD><TD class=\"p{$bgc}l\">";
					$ech.=$d_greg;			// glider ID
					$ech.="</TD><TD class=\"p{$bgc}n\">";
					$ech.=$d_gcn;			// glider CN
					$ech.="</TD><TD class=\"p{$bgc}l\">";
					$ech.=$d_gmod;			// glider model
					$ech.="</TD><TD class=\"t{$bgc}c\">";
					$ech.=$d_tako;		// take-off
					$ech.="</TD><TD class=\"p{$bgc}c\">";				
					$ech.=$d_glan;		// glider landing
					$ech.="</TD><TD class=\"p{$bgc}c\">";
					$ech.=$d_gtim;  // glider time
					$ech.="</TD><TD class=\"a{$bgc}c\">";
					$ech.=$d_plan;		// plane landing
					$ech.="</TD><TD class=\"a{$bgc}c\">";
					$ech.=$d_ptim;	// plane time
					$ech.="</TD><TD class=\"a{$bgc}c\">";
					$ech.="$d_malt";		// Altitude Max
					if ($d_malt!='' && $d_malt!='----') $ech.=" $affunit";
										
					$ech.="</TD>";
					$ech.="</TR>";
					
					echo $ech;
					}
				else {	// JSON format output
					if ($first==0) $ech=""; else $ech=",
";					
					$ech.= "	{
	\"plane\": \"$d_preg\",
	\"glider\": \"$d_greg\",
	\"takeoff\": \"$d_tako\",
	\"plane_landing\": \"$d_plan\",
	\"glider_landing\": \"$d_glan\",
	\"plane_time\": \"$d_ptim\",
	\"glider_time\": \"$d_gtim\",
	\"towplane_max_alt\": \"$d_malt\"";
	
	if ($gvv==3) {
		$ech.=",
	\"plane_flarmid\": \"$d_pfid\",
	\"glider_flarmid\": \"$d_gfid\"";
	}
	
					
					$ech.="
	}";
					echo $ech;
					$first=1;
					}	
				}
			}	
		
		if (!$json) echo "</TABLE>"; else echo "
	]
}";
	}
	if ($torecord==true) 
		{
		$torecordreq = substr($torecordreq,0,-1).";";
		$ret = $dbh->exec($torecordreq);
		}
	if (!$json) echo "<!--FlightLog Calculated From OGN Data --></BODY></HTML>";

}		// fin else si date==""



?>