exports.filter = filter;

var css = require('css');

/**
 * filter css string according to whitelist
	'whitelist': {
		'body': '*',
		'.paper': 'font, background, color, line, width, height',
		'.paper-title': '*'
	}
	'compress': true,
};
*/

function filter (cssStr, whitelist, compress) {

	var cssObj = css.parse(cssStr);
	var cssRules = cssObj.stylesheet.rules;
	var checkedRules = [];

	cssRules.forEach(function checkRule (rule) {
		// console.log(rule);
		rule.selectors.forEach(function checkSelector (selector) {
			// console.log('check selector:' + selector);
			var validProperties = getValidProperties(selector, whitelist);
			if (!validProperties) return;
			
			// console.log('can use:');
			// console.log(validProperties);
			
			checkedRules.push({
				selectors: [selector],
				declarations: checkDeclarations(rule.declarations, validProperties)
			});
			
		});
	});
	
	// console.log('checked rules');
	// console.log(checkedRules);
	
	cssObj.stylesheet.rules = checkedRules;
	return  css.stringify(cssObj, {compress: compress});
}

function getValidProperties (selector, whitelist) {
	// console.log('current selector:' + selector + ', properties:' + whitelist[selector]);
	if (undefined !== whitelist[selector]) return whitelist[selector];
	if (undefined !== whitelist[selector.replace(' ', '')]) return whitelist[selector];
	if (selector.indexOf(' ') === -1) return false;
	return getValidProperties(selector.substr(0, selector.lastIndexOf(' ')), whitelist);
}

/**
 * "declarations": [
	  {
		"property": "name",
		"value": "tobi"
	  }
	]
 *
 */
function checkDeclarations (declarations, selectorValidProperties) {
	var checked = [];
	declarations.forEach(function checkDeclaration (declaration) {
		if (selectorValidProperties === '*' || selectorValidProperties.indexOf(declaration.property.split('-')[0]) >= 0 ) {
			checked.push(declaration);
		}
	});
	return checked;
}