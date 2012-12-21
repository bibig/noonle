/*
	http://wekeroad.com/2012/02/25/testing-your-model-with-mocha-mongo-and-nodejs
	This pattern can look a bit noisy - but it's a good habit to wrap your code in a nice, 
	tight little scope ball - and you get the added benefit of keeping things private. 
	It takes a bit to understand what's happening if you don't know Javascript well
	but basically this is a "self-invoking" function that executes when referenced.
	example:
	var Yi = function () {
		var _fn1 = function () { ... }
		var _fn2 = function () { ... }
		
		return {
			fn1: _fn1,
			fn2: _fn2
		};
	}();
*/

var Yi = function () {

	function randomString (_len) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var rs = '';
		var len = _len || 8 ;
		for (var i=0; i< len; i++) {
			var pos = Math.floor( Math.random() * chars.length);
			rs += chars.substring(pos, pos + 1);
		}
		return rs;
	}
	
	function prototypeToString (o) {
        return Object.prototype.toString.call(o);
    }
    
    function isArray (a) {
    	return prototypeToString(a) === '[object Array]';
    }
    
    function isObject (a) {
    	return prototypeToString(a) === '[object Object]';
    }
    
    function isFunction (a) {
    	return prototypeToString(a) === '[object Function]';
    }
    
    function inArray (v, a) {
    	if (isArray(a)) {
    		for (var i = 0; i < a.length; i++) {
				if (a[i] === v) {
					return true;
				}
			}
    	}
        return false;
    }
    
    function isEmpty (v) {
        var length = 0;
        if ( v === undefined || v === null || v === '') {
        	return true;
        }
        
        if ( isArray(v) ) {
            return v.length === 0;
        } else if ( isObject(v) ) {
        	for (k in v) {
        		length++;
        		break;
        	}
        	return length === 0;
        }
        return false;
    };
    
    return {
    	randomString: randomString,
    	isArray: isArray,
    	isObject: isObject,
    	isFunction: isFunction,
    	isEmpty: isEmpty,
    	inArray: inArray
    };
    
}();

module.exports = Yi;