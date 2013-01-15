// node ./tools/importThemes.js
var Theme = require('../models/Theme')
  , fs = require('fs')
  , color = require('color')
  , localJson = './tools/wufooThemes.json';
  
  
function jsonToDb () {
	fs.readFile(localJson, function (err, str) {
		if (err) throw err;
		// console.log('get json!' + str);
		var themes = JSON.parse(str)
		  , i = 1
		  , theme;
		// console.log(themes);
		for (name in themes) {
			theme = {
				id: i++,
				name: name,
				backgroundColor: themes[name][0],
				bgOfTitle: themes[name][1],
				bgOfFoot: themes[name][2],
				bgOfContent: themes[name][3],
				bgOfCatalog: themes[name][4],
				fgOfTitle: '#fff',
				fgOfContent: '#333',
				fgOfFoot: '#999',
				anchorInTitle: '#fff',
				anchorInContent: '#666',
				anchorInCatalog: '#222',
				anchorInFoot: '#999'
			};
			// console.log(theme);
			Theme.add(theme, function () {
				console.log('add no.' + theme.id + ' theme!');
			});
		}
	});
}

Theme.removeAll(function () { 
	console.log('clear all exist themes!');
	console.log('ready to import.'); 
	jsonToDb();
});
