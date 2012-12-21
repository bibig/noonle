exports.create = create;


function create () {
	var Validator = require('validator').Validator
	  , errors = {}
	  , errorCount = 0
	  , isValid = new Validator();
	  
	function clear () {
		errors = {};
		errorCount = 0;
	}
	
	function getErrors () {
		var arr = [];
		for(key in errors) {
		 	arr.push(errors[key]);
		}
		return arr;
	}
	
	function mapErrors (key) {
		if ( key ) {
			if (errors[key] === undefined) {
				return null;
			} else {
				return errors[key];
			}
		} else { 
			return errors;
		}
	}
	
	function getErrorCount () {
		return errorCount;
	}
	
	
	function pass () {
	  	return errorCount === 0 ;
	};
	  
	function addError (name, message) {
		errors[name] = message;
		errorCount++;
	};
	  
	isValid.error = function (errorInfo) { // msg = name|message
		var info = errorInfo.split('|');
		addError(info[0], info[1]);
	};
	  
	return {
		pass: pass,
		getErrors: getErrors,
		mapErrors: mapErrors,
		getErrorCount: getErrorCount,
		isValid: isValid,
		clear: clear
	};
  
};