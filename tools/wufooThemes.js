// must exec this file in project root path
// node ./tools/wufooThemes.js

var fs = require('fs');
var localFile = './tmp/wufooThemes.html';
var localJson = './tmp/wufooThemes.json';

function saveToFile (content) {
	fs.appendFile(localFile, content, function () {
		console.log('save part successfully!');
	});
}

function fetchHtmlFromWufoo (callback) {
	var http = require('http')
  	  , options = {
			host: 'www.wufoo.com',
			port: 80,
			path: '/gallery/designs/',
			method: 'GET'
		};
	
	var req = http.request(options, function (res) {
		console.log("response status: " + res.statusCode);
		res.on('data', function (chunk) {
			callback(chunk);
		});
		res.on('end', function () {
			console.log('fetch over!');
		});
	});
	
	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	
	req.end();
}


function run () {
	fs.exists(localFile, function (yesOrNo) {
		if (yesOrNo) {
			console.log('ready!!');
			parseToJson();
		} else {
			console.log('ready to fetch html and save!');
			fetchHtmlFromWufoo(saveToFile);
		}
	});
}

function parseToJson () {
	fs.readFile(localFile, function (err, data) {
		if (err) throw err;
		
		var html = data.toString().replace(/[\n]+/g, '');
		var re = /<a href="http:\/\/wufoo.com\/gallery\/designs\/[\d]+\/\" onclick="return false;" title="([a-zA-Z0-9 ]+)"(.*?)<\/li>/gi;
		var match, i=0;
		var themes = {};
		
		// w: background
		// l: bgOfTitle
		// i: bgOfFoot
		// f: bgOfContent
		// h: bgOfCatalog
		
		while(match = re.exec(html)) {
			var title = match[1]
			  , subHtml = match[2].replace(/background-color|background/gi, '')
			  , colors = [] // [backgroundColor, bgOfTitle, bgOfFoot, bgOfContent, bgOfCatalog]
			  , subRe, subMatch; 
			  
			// console.log(i + ') ' + title);  
			subRe = /var class="([wlifh])" style=":(#[0-9a-z]{6})/gi;
			while(subMatch = subRe.exec(subHtml)) {
				colors.push(subMatch[2]);
			}
			// console.log(colors);
			themes[title] = colors;
			i++;
		}
		
		console.log(themes);
		console.log('parse over!');
		
		fs.writeFile(localJson, JSON.stringify(themes), function () {
			console.log('save themes to json file successfully!');
		});
		
		
	});
}

run();