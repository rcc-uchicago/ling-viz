/* Add an Array remove function*/
if (!Array.prototype.remove) {
  Object.defineProperty(Array.prototype, 'remove', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(val) {
      if (this == null) {
        throw new TypeError('Array.prototype.remove called on null or undefined');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      
      var j = 0;
      for (var i = 0; i < length; i++) {
        if (i in list) {
          if (list[i] === val) {
            j++;
                 list.splice(i,1)
          }
        }
      }
      return j;
    }
  });
}

/*
   Some array functions are in Firefox but not Chrome. We add them below. See more at (for example):   
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
*/

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return i;
          }
        }
      }
      return -1;
    }
  });
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
}

