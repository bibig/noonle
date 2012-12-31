/*
function darkCatalog () {
	var bgOfContent = rgb2hex($(".paper-content", ".paper").css('background-color'));
	$(".paper-catalog", ".paper").css('background-color', shadeColor(bgOfContent, -3));
	// console.log(shadeColor(bgOfContent, -3));
}
*/

function getBackground($dom) {
	// Is current element's background color set?
	var color = $dom.css("background-color");
	if ((color !== 'rgba(0, 0, 0, 0)') && (color !== 'transparent')) {
		// if so then return that color
		return color;
	}

	// if not: are you at the body element?
	if ($dom.is("body")) {
		// return known 'false' value
		return false;
	} else {
		// call getBackground with parent item
		return getBackground($dom.parent());
	}
}

function rgb2hex (rgb) {
	if (!rgb) return '';
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	function hex(x) {
		return ("0" + parseInt(x).toString(16)).slice(-2);
	}
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function shadeColor (color, percent) {
	var R = parseInt(color.substring(1,3),16)
	var G = parseInt(color.substring(3,5),16)
	var B = parseInt(color.substring(5,7),16);
	
	R = parseInt(R * (100 + percent) / 100);
	G = parseInt(G * (100 + percent) / 100);
	B = parseInt(B * (100 + percent) / 100);
	
	R = (R<255)?R:255;  
	G = (G<255)?G:255;  
	B = (B<255)?B:255;  
	
	var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
	var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
	var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
	
	return "#"+RR+GG+BB;
}