exports.list = list;

var authorize = require('../lib/authorize')
  , Theme = require('../models/theme');
  
function list () {
	Theme.findAll(function (err, data) {
		console.log(data);
	});
}
/*
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
	var catalog
	  = cssItem('background-color', node.bgOfCatalog)
	  + cssItem('a.color', node.anchorOfCatalog);
	var foot
	  = cssItem('background-color', node.bgOfFoot)
	  + cssItem('color', node.fgOfFoot);
	  + cssItem('a.color', node.anchorInFoot);
	  
	var css
	  = cssBlock('body', background)
	  + cssBlock('.paper-title', title) 
	  + cssBlock('.paper-content', content) 
	  + cssBlock('.paper-catalog', catalog)
	  + cssBlock('.paper-foot', foot);
*/