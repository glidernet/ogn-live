<?php
$uri = $_SERVER["REQUEST_URI"];
$uri=explode("/",$uri);
if ($uri[1]=="markers")
	{
	$fin=substr($uri[2],-6);
	$png = explode(".",$uri[2]);
	$cn1=$png[0];
	$cn=substr($cn1,0,-2);
	$x=5;
	if (strlen($cn)==2) $x=8;
	if (strlen($cn)==1) $x=12;
	
	
	switch($fin) {
		case "_o.png":		// old, gris
			$filename = "../markers/".$cn."_o.png";
		
			if (file_exists($filename)) {}
			else {
				$source = imagecreatefrompng("../modele_off.png");
	  		imagealphablending($source, true);
	  		imagesavealpha($source, true);
	  		$noir = imagecolorallocate($source, 0, 0, 0);
				imagestring($source,4,$x,4,"$cn",$noir);
				imagepng($source, "../markers/".$cn."_o.png");
	  		header('Content-Type: image/png');
				imagepng($source);
				imagedestroy($source);
			}
			break;
		case "_b.png":		// blue: bleu clair
			$filename = "../markers/".$cn."_b.png";
		
			if (file_exists($filename)) {}
			else {
				$source = imagecreatefrompng("../modele_b.png");
	  		imagealphablending($source, true);
	  		imagesavealpha($source, true);
	  		$noir = imagecolorallocate($source, 0, 0, 0);
				imagestring($source,4,$x,4,"$cn",$noir);
				imagepng($source, "../markers/".$cn."_b.png");
	  		header('Content-Type: image/png');
				imagepng($source);
				imagedestroy($source);
			}
			break;
		case "_g.png":		// green: vert
			$filename = "../markers/".$cn."_g.png";
		
			if (file_exists($filename)) {}
			else {
				$source = imagecreatefrompng("../modele_g.png");
	  		imagealphablending($source, true);
	  		imagesavealpha($source, true);
	  		$noir = imagecolorallocate($source, 0, 0, 0);
				imagestring($source,4,$x,4,"$cn",$noir);
				imagepng($source, "../markers/".$cn."_g.png");
	  		header('Content-Type: image/png');
				imagepng($source);
				imagedestroy($source);
			}
			break;
		case "_r.png":		// red: rouge
			$filename = "../markers/".$cn."_r.png";
		
			if (file_exists($filename)) {}
			else {
				$source = imagecreatefrompng("../modele_r.png");
	  		imagealphablending($source, true);
	  		imagesavealpha($source, true);
	  		$noir = imagecolorallocate($source, 0, 0, 0);
				imagestring($source,4,$x,4,"$cn",$noir);
				imagepng($source, "../markers/".$cn."_r.png");
	  		header('Content-Type: image/png');
				imagepng($source);
				imagedestroy($source);
			}
			break;
		case "_p.png":		// pink: rose
			$filename = "../markers/".$cn."_p.png";
		
			if (file_exists($filename)) {}
			else {
				$source = imagecreatefrompng("../modele_p.png");
	  		imagealphablending($source, true);
	  		imagesavealpha($source, true);
	  		$noir = imagecolorallocate($source, 0, 0, 0);
				imagestring($source,4,$x,4,"$cn",$noir);
				imagepng($source, "../markers/".$cn."_p.png");
	  		header('Content-Type: image/png');
				imagepng($source);
				imagedestroy($source);
			}
			break;
		case "_k.png":		// black: noir
			$filename = "../markers/".$cn."_k.png";
		
			if (file_exists($filename)) {}
			else {
				$source = imagecreatefrompng("../modele_k.png");
	  		imagealphablending($source, true);
	  		imagesavealpha($source, true);
	  		$blanc = imagecolorallocate($source, 255, 255, 255);
				imagestring($source,4,$x,4,"$cn",$blanc);
				imagepng($source, "../markers/".$cn."_k.png");
	  		header('Content-Type: image/png');
				imagepng($source);
				imagedestroy($source);
			}
			break;			
		case "_d.png":		// dark blue: bleu foncé
			$filename = "../markers/".$cn."_d.png";
		
			if (file_exists($filename)) {}
			else {
				$source = imagecreatefrompng("../modele_d.png");
	  		imagealphablending($source, true);
	  		imagesavealpha($source, true);
	  		$blanc = imagecolorallocate($source, 255, 255, 255);
				imagestring($source,4,$x,4,"$cn",$blanc);
				imagepng($source, "../markers/".$cn."_d.png");
	  		header('Content-Type: image/png');
				imagepng($source);
				imagedestroy($source);
			}
			break;			
						
		default:
			$filename = "../markers/".$cn1.".png";
	
	  		if (file_exists($filename)) {}
		 	else {
		 			$x=5;
					if (strlen($cn1)==2) $x=8;
					if (strlen($cn1)==1) $x=12;
		   	$source = imagecreatefrompng("../modele.png");
		   	imagealphablending($source, true);
		   	imagesavealpha($source, true);
		
			    //imagestring($source,4,$x,5,"$cn",0);
				imagestring($source,4,$x,4,"$cn1",0);
	    	imagepng($source, "../markers/".$cn1.".png");
	    	header('Content-Type: image/png');
	    	imagepng($source);
	    	imagedestroy($source);
			}

		}
	
	
	    
    
    
    
	}
else {
	echo "..:: 404_error ::..<BR>File not found<BR>Fichier non trouv&eacute;";
	}

?>
