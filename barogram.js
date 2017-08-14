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
// barogram option
var baroCanvas;
var baroScale;
var baroMarker;
var baroCtx;
var baroScaleCtx;
var baroMarkCtx;
var X_max;
var X_min;
var Y_max;
var Y_min;
var xScale;
var yScale;
var xWidth;
var yHeight;
var xAxis = [];   // optional scale labels
var yAxis = [];   // optional scale labels
var margin = 10;  // all around line graph
var X_legend = 0;
var Y_legend = 0;
var maxAlt = 5000;
var X_lines = 5+1;
var	Y_lines = 5+1;
var currentUnit = "";
var scaleFlag = 0;
var X_offset = 0;
var Y_offset = margin+X_legend;

// show altitude scale on the graph
function plotScale() {
//    var TxtWidth = baroCtx.measureText(xAxis[0]).width;
//    var TxtHeight = baroCtx.measureText(xAxis[0]).height;
    var TxtHeight = 10;
	baroScaleCtx.strokeStyle="#c0c0c0"; // color of axis text
	baroScaleCtx.beginPath();
    // print parameters on X axis
	if (xAxis.length == X_lines) {
	  for (i=0;i<X_lines;i++) {
		var x = i * xWidth / (X_lines-1);
//		baroScaleCtx.fillText(xAxis[i], x+margin-TxtWidth/2, margin+TxtHeight);
		baroScaleCtx.fillText(xAxis[i], x+margin, margin);
	  }	
	}
   // print parameters on Y axis
    var yStep = yHeight / (Y_lines-1);
    var yScaleStep = (Y_max - Y_min) / (Y_lines-1);
	for (i=0;i<Y_lines;i++) {
	  baroScaleCtx.fillText(Math.round(Y_max - (i * yScaleStep)), margin, (i * yStep) + margin+X_legend+TxtHeight/2);
	}
	baroScaleCtx.stroke();
}

// show grid lines on the graph
function plotGrid() {
	baroCtx.strokeStyle="#808080"; // color of grid lines
	baroCtx.beginPath();
	for (i=0;i<=X_lines;i++) {
		var x = i * xWidth / (X_lines-1);
		baroCtx.moveTo(x, margin+X_legend);
		baroCtx.lineTo(x, yHeight+margin+X_legend);
	}
	for (i=0;i<=Y_lines;i++) {
		var y = i * yHeight / (Y_lines-1) + margin+X_legend; 
		baroCtx.moveTo(0, y)
		baroCtx.lineTo(xWidth,y)
	}
	baroCtx.stroke();

//  //avoid redrawing the grid every time - set the dynamic image as the background
//	var imageDataURL = baroCanvas.toDataURL();
//    baroCanvas.style.background = imageDataURL; // no work
//    $("#div_baro").css("background-image","url(imageDataURL)"); // no work either
}
	
function baro_Init() {
	X_max = "12:00:00".toSeconds();
	X_min = "11:00:00".toSeconds();
	Y_max = maxAlt;
	Y_min = 0;
		
	baroCanvas = document.getElementById("div_baro");
	baroCtx = baroCanvas.getContext("2d");
	baroCtx.fillStyle = "#808080";  // color of text
	baroCtx.font = "12px Arial";
	
	baroScale = document.getElementById("div_baroScale");
	baroScaleCtx = baroScale.getContext("2d");
	baroScaleCtx.fillStyle = "#808080";  // color of text
	baroScaleCtx.font = "12px Arial";

	baroMarker = document.getElementById("div_baroMark");
	baroMarkCtx = baroMarker.getContext("2d");
	baroMarkCtx.fillStyle = "#808080";  // color of text
	baroMarkCtx.font = "12px Arial";

	xWidth = baroCanvas.width;
	yHeight = baroCanvas.height - X_legend - 2*margin;
	
	yScale = (yHeight) / (Y_max - Y_min);
	xScale = (xWidth) / (X_max - X_min);
	
    plotScale();
	plotGrid();

    // create a clipping region - simpler than checking X_min
//	baroCtx.beginPath();
//    baroCtx.rect(0, margin+X_legend, 0+xWidth, margin+X_legend+yHeight);
//    baroCtx.clip();
}
String.prototype.toSeconds = function () { if (!this) return null; var hms = this.split(':'); return (+hms[0]) * 60 * 60 + (+hms[1]) * 60 + (+hms[2] || 0); }

// plot a line with color and [x,y] array - rely on clipping region
function baro_plotData(dCn,dColor,dataSet) {
  if (dataSet.length > 1) {
    // plot the altitude data
    baroCtx.strokeStyle=dColor; // color of line
    baroCtx.beginPath();
	baroCtx.moveTo((dataSet[0][0]-X_min) * xScale + X_offset, yHeight-(dataSet[0][1] * yScale) + Y_offset);
    for (i=1 ;i<dataSet.length;i++) {
	  baroCtx.lineTo((dataSet[i][0]-X_min) * xScale + X_offset, yHeight -(dataSet[i][1] * yScale) + Y_offset);
    }
    baroCtx.stroke();

	// plot the markers 
	baroMarkCtx.fillStyle = dColor;  // color of text
    baroMarkCtx.beginPath();
	baroMarkCtx.fillText(dCn, 0, yHeight -(dataSet[dataSet.length-1][1] * yScale) + Y_offset);
    baroMarkCtx.stroke();
  }
}

function baro_plotRefresh() {
xWidth = baroCanvas.width;
yHeight = baroCanvas.height - X_legend - 2*margin;
  // update the time scale
  X_min = X_max - (pathl>60 ? 900 : pathl*10); // 5, 10 else 15 minutes
  xScale = (xWidth) / (X_max - X_min);
  // update the altitude scale
  var maxRange = maxAlt * m2ft[unit];
  // auto adjust the range
//  (unit == "i") ? maxRange = Math.ceil((maxRange+250)/2000)*2000 : maxRange = Math.ceil((maxRange+100)/1000)*1000; // 2000 ft or 1000 m increments
  (unit == "i") ? maxRange = Math.ceil((maxRange+500)/1000)*1000 : maxRange = Math.ceil((maxRange+250)/500)*500; // 1000 ft or 500 m increments
  if ((maxRange != Y_max) || (unit != currentUnit)) {
    currentUnit = unit;
    Y_max = maxRange;
    yScale = (yHeight) / (Y_max - Y_min) * m2ft[unit]; // adjust scale with unit here to avoid and extra multiply every y point
	// auto adjust the grid spacing
//    (unit == "i") ? Y_lines = (Y_max / 1000) + 1 : Y_lines = (Y_max / 500) + 1; // 1000 ft or 500 m grid steps
    (unit == "i") ? Y_lines = (Y_max / 1000) + 1 : Y_lines = (Y_max / 250) + 1; // 1000 ft or 250 m grid steps
    baroScaleCtx.clearRect(0, 0, baroScale.width, baroScale.height);
	plotScale();
  }
  // erase the plot (and grid)
//  baroCtx.clearRect(0, margin+X_legend, margin+X_legend+xWidth, margin+X_legend+yHeight);
  baroCtx.clearRect(0, 0, baroCanvas.width, baroCanvas.height);
  plotGrid(); // re-plot the grid
  // erase the markers
  baroMarkCtx.clearRect(0, 0, baroMarker.width, baroMarker.height);
  // reset the flag
  scaleFlag = 0;
}

// set the time and altitude scales on the barogram
function Set_XY_Scale(tim,alt) {
	if (scaleFlag++ == 0) {   // use first item as a reference
	  X_max = tim.toSeconds();
	  maxAlt = +alt; // '+' used for conversion from string to integer
	} else {
	  if (X_max < tim.toSeconds()) {
  	    X_max = tim.toSeconds();
	  }
	  if (maxAlt < +alt) {
	    maxAlt = +alt;
	  }
	}
}
