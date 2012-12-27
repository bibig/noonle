exports.form = validateForm;
// exports.ifCreateNode = ifCreateNode;
// exports.ifCreatePage = ifCreatePage;
// exports.nodeExist = checkNodeExist;
// exports.nodeExistInDb = checkNodeExistInDb;
// exports.pageExist = checkPageExist;
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

function validateHub (validator, key, value) {
	// console.log('validateHub:' + key + '=' + value);
	var isValid = validator.isValid;
	var keyInfo = key.split('.');
	var name = (keyInfo.length == 1) ? key : keyInfo[1];
	
	switch (key) {
		case 'entity.title':
			isValid.check(value, name + '|请输入标题').notEmpty();			
			if ( validator.pass()) {
				isValid.check(value, name + '|长度请保持在1~200个字符长度内').len(1, 200);
			}
			break;
		case 'entity.content':
			isValid.check(value, name + '|最多支持20000个字符').len(0, 20000);
			break;
		case 'node.id':
		case 'page.id':
			isValid.check(value, name + '|请输入id').notEmpty();	
			/*if ( validator.pass()) {
				isValid.check(value, name + '|只能包含英文字母、数字及"-"、"_"符号').is(/^[a-zA-Z\-\_]+$/);
			}
			*/
			if ( validator.pass()) {
				isValid.check(value, name + '|长度最多支持' + idMaxLength + '个字符').len(1, idMaxLength);
			}
			break;
		case 'node.sort':
			isValid.check(value, name + '|排序内容不符').isInt();
			if ( validator.pass()) {
				isValid.check(value, name + '|请选择正确的排序方式').min(0);
				isValid.check(value, name + '|请选择正确的排序方式').max(1);
			}
			break;
		case 'node.email':
			if (value !== '') {
				isValid.check(value, name + '|格式不符').isEmail();
			}
			break;
		case 'node.readPassword':
		case 'node.adminPassword':
			isValid.check(value, name + '|最多支持16位').len(0, 16);
			break;
		case 'password':
			isValid.check(value, name + '|请输入密码').notEmpty();
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
