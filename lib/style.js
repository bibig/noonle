exports.make = makeCss;


var load = require('./load');

function makeCss (req) {
	var node = load.fetch(req, 'node');
	var background 
	  = cssItem('background-color', node.backgroundColor)
	  + cssItem('background-image', node.backgroundImage)
	  + cssItem('background-repeat', node.backgroundRepeat)
	  + cssItem('background-position', node.backgroundPosition)
	  + cssItem('background-attachment', node.backgroundAttachment);
	var title
	  = cssItem('background-color', node.bgOfTitle)
	  + cssItem('color', node.fgOfTitle)
	  + cssItem('a.color', node.anchorInTitle);
	var content
	  = cssItem('background-color', node.bgOfContent)
	  + cssItem('color', node.fgOfContent)
	  + cssItem('a.color', node.anchorInContent);
	var foot
	  = cssItem('background-color', node.bgOfFoot)
	  + cssItem('color', node.fgOfFoot);
	  + cssItem('a.color', node.anchorInFoot);
	var css
	  = cssBlock('body', background)
	  + cssBlock('.paper-title', title) 
	  + cssBlock('.paper-content', content)
	  + cssBlock('.paper-foot', foot);
	  
	// return  '<style type="text/css">' + css + node.extraCss + '</style>';
	return  css + node.extraCss;
}

function cssBlock (key, value) {
	if (!value) return '';
	return key + '{' + value + '}';
}

function cssItem (key, value) {
	if (!value) return '';
	return key + ':' + value + ';';
}
