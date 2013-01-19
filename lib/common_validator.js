exports.form = validateForm;
exports.ifNodeIdExistWhenChange = ifNodeIdExistWhenChange;
exports.ifPageIdExistWhenChange = ifPageIdExistWhenChange;
exports.ifNodeIsFrozen = ifNodeIsFrozen;

var yi = require('./yi')
  , form = require('./form')
  , load = require('./load')
  , Node = require('../models/node')
  , Page = require('../models/page')
  , idMaxLength = 256;


function init () {
	return  require('./validator').create();
}

/**
 * validate the data from the create node form
 * including: title, content
 * @return the validator
 */
function validateForm (req, res, next) {
	var validator = init();
	var key, value, subKey;
	// console.log('ready to validate value');
	for (key in req.body) {
		// console.log('name:' + key);
		value = req.body[key];
		// console.log(value);
		if (typeof value == 'object') {
			for (subKey in value) {
				validateHub(validator, key + '.' + subKey, value[subKey]);
			}
		} else {
			validateHub(validator, key, value);
		}
	}
	
	req.validator = validator;
	
	return next();
}

function errorMessage (name, message) {
	return name + '|' + message
}

function validateHub (validator, key, value) {
	// console.log('validateHub:' + key + '=' + value);
	var isValid = validator.isValid;
	var keyInfo = key.split('.');
	var name = (keyInfo.length == 1) ? key : keyInfo[1];
	
	switch (key) {
		case 'entity.title':
			isValid.check(value, errorMessage(name, __('please input %s', __('name')))).notEmpty();			
			if ( validator.pass()) {
				isValid.check(value, errorMessage(name, __('length should be in [%s, %s]', 1, 200))).len(1, 200);
			}
			break;
		case 'entity.content':
			isValid.check(value, errorMessage(name,  __('max length is %s', 20000))).len(0, 20000);
			break;
		case 'node.id':
		case 'page.id':
			isValid.check(value, errorMessage(name, __('please input %s', __('id')))).notEmpty();	
			/*if ( validator.pass()) {
				isValid.check(value, name + '|只能包含英文字母、数字及"-"、"_"符号').is(/^[a-zA-Z\-\_]+$/);
			}
			*/
			if ( validator.pass()) {
				isValid.check(value, errorMessage(name,  __('max length is %s', idMaxLength))).len(1, idMaxLength);
			}
			break;
		case 'node.sort':
			isValid.check(value, errorMessage(name,  __('sort way is invalid'))).isInt();
			if ( validator.pass()) {
				isValid.check(value, errorMessage(name,  __('sort way is invalid'))).min(0);
				isValid.check(value, errorMessage(name,  __('sort way is invalid'))).max(2);
			}
			break;
		case 'node.sortDirection':
			isValid.check(value, errorMessage(name,  __('sort direction is invalid'))).isInt();
			if ( validator.pass()) {
				isValid.check(value, errorMessage(name,  __('sort direction is invalid'))).min(0);
				isValid.check(value, errorMessage(name,  __('sort direction is invalid'))).max(1);
			}
			break;
		case 'node.css':
			isValid.check(value, errorMessage(name,  __('max length is %s', 2000))).len(1, 2000);
			break;
		case 'node.email':
			if (value !== '') {
				isValid.check(value, errorMessage(name,  __('invalid email'))).isEmail();
			}
			break;
		case 'node.readPassword':
		case 'node.adminPassword':
			isValid.check(value, errorMessage(name,  __('max length is %s', 16))).len(0, 16);
			break;
		case 'node.readPasswordTip':
		case 'node.adminPasswordTip':
			isValid.check(value, errorMessage(name,  __('max length is %s', 200))).len(0, 200);
			break;
		case 'password':
			isValid.check(value, errorMessage(name, __('please input %s', __('password')))).notEmpty();
			break;
	}
}

function ifNodeIsFrozen (req, res, next) {
	// console.log('ready to check ifNodeIsFrozen');
	var node = load.fetch(req, 'node');
	if (node.isFrozen) {
		// console.log('failed');
		res.redirect('/' + node.id);
	} else {
		// console.log('pass');
		return next();
	}
}

/**
 * call the corresponding callback by judging whether the given id exist in the nodes.
 * @id: node id
 * @yesCb: callback for exist
 * @noCb: callback for non-exist
 */
function ifNodeIdExistWhenChange (id, yesCb, noCb, next) {
	Node.exists(id, function (err, yesOrNo) {
		if (err) {
			next(err);
		} else {
			yesOrNo ? yesCb() : noCb();
		}
	});
}


function ifPageIdExistWhenChange (_node, id, yesCb, noCb, next) {
	Page.exists(_node, id, function (err, yesOrNo) {
		if (err) {
			next(err);
		} else {
			yesOrNo ? yesCb() : noCb();
		}
	});
}
