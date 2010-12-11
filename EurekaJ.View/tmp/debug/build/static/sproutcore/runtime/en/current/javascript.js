/* >>>>>>>>>> BEGIN source/license.js */
/*! @license
==========================================================================
SproutCore Costello -- Property Observing Library
Copyright ©2006-2010, Sprout Systems, Inc. and contributors.
Portions copyright ©2008-2010 Apple Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

For more information about SproutCore, visit http://www.sproutcore.com

==========================================================================
@license */

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global NodeList */
// These commands are used by the build tools to control load order.  On the
// client side these are a no-op.
var require = require || function require() { } ;
var sc_require = sc_require || require;
var sc_resource = sc_resource || function sc_resource() {};
sc_require('license') ;

// ........................................
// GLOBAL CONSTANTS
// 
// Most global constants should be defined inside of the SC namespace.  
// However the following two are useful enough and generally benign enough
// to put into the global object.
var YES = true ; 
var NO = false ;

// prevent a console.log from blowing things up if we are on a browser that
// does not support it
if (typeof console === 'undefined') {
  window.console = {} ;
  console.log = console.info = console.warn = console.error = function(){};
}

// ........................................
// BOOTSTRAP
// 
// The root namespace and some common utility methods are defined here. The
// rest of the methods go into the mixin defined below.

/**
  @namespace
  
  The SproutCore namespace.  All SproutCore methods and functions are defined
  inside of this namespace.  You generally should not add new properties to
  this namespace as it may be overwritten by future versions of SproutCore.
  
  You can also use the shorthand "SC" instead of "SproutCore".
  
  SproutCore-Base is a framework that provides core functions for SproutCore
  including cross-platform functions, support for property observing and
  objects.  It's focus is on small size and performance.  You can use this 
  in place of or along-side other cross-platform libraries such as jQuery or
  Prototype.
  
  The core Base framework is based on the jQuery API with a number of 
  performance optimizations.
*/
var SC = SC || {} ; 
var SproutCore = SproutCore || SC ;

/**
  @private

  Adds properties to a target object. You must specify whether
  to overwrite a value for a property or not.

  Used as a base function for the wrapper functions SC.mixin and SC.supplement.

  @param overwrite {Boolean} if a target has a value for a property, this specifies
                  whether or not to overwrite that value with the copyied object's 
                  property value.
  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC._baseMixin = function (override) {
  var args = Array.prototype.slice.call(arguments, 1), src,
  // copy reference to target object
      target = args[0] || {},
      idx = 1,
      length = args.length ,
      options, copy , key;

  // Handle case where we have only one item...extend SC
  if (length === 1) {
    target = this || {};
    idx=0;
  }

  for ( ; idx < length; idx++ ) {
    if (!(options = args[idx])) continue ;
    for(key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined && ( override || (target[key] === undefined) )) target[key] = copy ;
    }
  }
  
  return target;
} ;

/**
  Adds properties to a target object.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.

  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.mixin = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(true);
  return SC._baseMixin.apply(this, args);
} ;

/**
  Adds properties to a target object.  Unlike SC.mixin, however, if the target
  already has a value for a property, it will not be overwritten.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.

  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.supplement = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(false);
  return SC._baseMixin.apply(this, args);
} ;

/** 
  Alternative to mixin.  Provided for compatibility with jQuery.
  @function 
*/
SC.extend = SC.mixin ;

// ..........................................................
// CORE FUNCTIONS
// 
// Enough with the bootstrap code.  Let's define some core functions

SC.mixin(/** @scope SC */ {
  
  // ........................................
  // GLOBAL CONSTANTS
  // 
  T_ERROR:     'error',
  T_OBJECT:    'object',
  T_NULL:      'null',
  T_CLASS:     'class',
  T_HASH:      'hash',
  T_FUNCTION:  'function',
  T_UNDEFINED: 'undefined',
  T_NUMBER:    'number',
  T_BOOL:      'boolean',
  T_ARRAY:     'array',
  T_STRING:    'string',
  
  // ........................................
  // TYPING & ARRAY MESSAGING
  //   

  /**
    Returns a consistant type for the passed item.

    Use this instead of the built-in typeOf() to get the type of an item. 
    It will return the same result across all browsers and includes a bit 
    more detail.  Here is what will be returned:

    | Return Value Constant | Meaning |
    | SC.T_STRING | String primitive |
    | SC.T_NUMBER | Number primitive |
    | SC.T_BOOLEAN | Boolean primitive |
    | SC.T_NULL | Null value |
    | SC.T_UNDEFINED | Undefined value |
    | SC.T_FUNCTION | A function |
    | SC.T_ARRAY | An instance of Array |
    | SC.T_CLASS | A SproutCore class (created using SC.Object.extend()) |
    | SC.T_OBJECT | A SproutCore object instance |
    | SC.T_HASH | A JavaScript object not inheriting from SC.Object |

    @param item {Object} the item to check
    @returns {String} the type
  */  
  typeOf: function(item) {
    if (item === undefined) return SC.T_UNDEFINED ;
    if (item === null) return SC.T_NULL ; 
    var ret = typeof(item) ;
    if (ret == "object") {
      if (item instanceof Array) {
        ret = SC.T_ARRAY ;
      } else if (item instanceof Function) {
        ret = item.isClass ? SC.T_CLASS : SC.T_FUNCTION ;

      // NB: typeOf() may be called before SC.Error has had a chance to load
      // so this code checks for the presence of SC.Error first just to make
      // sure.  No error instance can exist before the class loads anyway so
      // this is safe.
      } else if (SC.Error && (item instanceof SC.Error)) {
        ret = SC.T_ERROR ;        
      } else if (item instanceof SC.Object) {
        ret = SC.T_OBJECT ;
      } else ret = SC.T_HASH ;
    } else if (ret === SC.T_FUNCTION) ret = (item.isClass) ? SC.T_CLASS : SC.T_FUNCTION;
    return ret ;
  },

  /**
    Returns YES if the passed value is null or undefined.  This avoids errors
    from JSLint complaining about use of ==, which can be technically 
    confusing.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  none: function(obj) {
    return obj===null || obj===undefined;  
  },

  /**
    Verifies that a value is either null or an empty string.  Return false if
    the object is not a string.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  empty: function(obj) {
    return obj===null || obj===undefined || obj==='';
  },
  
  /**
    Returns YES if the passed object is an array or array-like. Instances
    of the NodeList class return NO.

    Unlike SC.typeOf this method returns true even if the passed object is 
    not formally array but appears to be array-like (i.e. has a length 
    property, responds to .objectAt, etc.)

    @param obj {Object} the object to test
    @returns {Boolean} 
  */
  isArray: function(obj) {
    if (obj && obj.objectAt) return YES ; // fast path
    
    var len = (obj ? obj.length : null), type = typeof obj;
    return !((len === undefined) || (len === null) || (obj instanceof Function) || (type === "string") || obj.setInterval);
  },

  /**
    Makes an object into an Array if it is not array or array-like already.
    Unlike SC.A(), this method will not clone the object if it is already
    an array.
    
    @param {Object} obj object to convert
    @returns {Array} Actual array
  */
  makeArray: function(obj) {
    return SC.isArray(obj) ? obj : SC.A(obj);
  },
  
  /**
    Converts the passed object to an Array.  If the object appears to be 
    array-like, a new array will be cloned from it.  Otherwise, a new array
    will be created with the item itself as the only item in the array.
    
    @param object {Object} any enumerable or array-like object.
    @returns {Array} Array of items
  */
  A: function(obj) {
    // null or undefined -- fast path
    if (obj === null || obj === undefined) return [] ;
    
    // primitive -- fast path
    if (obj.slice instanceof Function) {
      // do we have a string?
      if (typeof(obj) === 'string') return [obj] ;
      else return obj.slice() ;
    }
    
    // enumerable -- fast path
    if (obj.toArray) return obj.toArray() ;
    
    // if not array-like, then just wrap in array.
    if (!SC.isArray(obj)) return [obj];
    
    // when all else fails, do a manual convert...
    var ret = [], len = obj.length;
    while(--len >= 0) ret[len] = obj[len];
    return ret ;
  },
  
  // ..........................................................
  // GUIDS & HASHES
  // 
  
  guidKey: "_sc_guid_" + new Date().getTime(),

  // Used for guid generation...
  _nextGUID: 0, _numberGuids: [], _stringGuids: {}, _keyCache: {},

  /**
    Returns a unique GUID for the object.  If the object does not yet have
    a guid, one will be assigned to it.  You can call this on any object,
    SC.Object-based or not, but be aware that it will add a _guid property.

    You can also use this method on DOM Element objects.

    @param obj {Object} any object, string, number, Element, or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    
    // special cases where we don't want to add a key to object
    if (obj === undefined) return "(undefined)";
    if (obj === null) return '(null)';

    var guidKey = this.guidKey;
    if (obj[guidKey]) return obj[guidKey];

    // More special cases; not as common, so we check for them after the cache
    // lookup
    if (obj === Object) return '(Object)';
    if (obj === Array) return '(Array)';

    var cache, ret;

    switch(typeof obj) {
      case SC.T_NUMBER:
        cache = this._numberGuids;
        ret   = cache[obj];
        if (!ret) {
          ret = "nu" + obj;
          cache[obj] = ret;
        }
        return ret;

      case SC.T_STRING:
        cache = this._stringGuids;
        ret   = cache[obj];
        if (!ret) {
          ret = "st" + obj;
          cache[obj] = ret;
        }
        return ret;

      case SC.T_BOOL:
        return (obj) ? "(true)" : "(false)" ;
      default:
        return SC.generateGuid(obj);
    }
  },

  /**
    Returns a key name that combines the named key + prefix.  This is more 
    efficient than simply combining strings because it uses a cache  
    internally for performance.
    
    @param {String} prefix the prefix to attach to the key
    @param {String} key key
    @returns {String} result 
  */
  keyFor: function(prefix, key) {
    var ret, pcache = this._keyCache[prefix];
    if (!pcache) pcache = this._keyCache[prefix] = {}; // get cache for prefix
    ret = pcache[key];
    if (!ret) ret = pcache[key] = prefix + '_' + key ;
    return ret ;
  },

  /**
    Generates a new guid, optionally saving the guid to the object that you
    pass in.  You will rarely need to use this method.  Instead you should
    call SC.guidFor(obj), which return an existing guid if available.

    @param {Object} obj the object to assign the guid to
    @returns {String} the guid
  */
  generateGuid: function(obj) { 
    var ret = ("sc" + (this._nextGUID++)); 
    if (obj) obj[this.guidKey] = ret ;
    return ret ;
  },

  /**
    Returns a unique hash code for the object. If the object implements
    a hash() method, the value of that method will be returned. Otherwise,
    this will return the same value as guidFor().
    
    If you pass multiple arguments, hashFor returns a string obtained by 
    concatenating the hash code of each argument.

    Unlike guidFor(), this method allows you to implement logic in your 
    code to cause two separate instances of the same object to be treated as
    if they were equal for comparisons and other functions.

    IMPORTANT: If you implement a hash() method, it MUST NOT return a 
    number or a string that contains only a number. Typically hash codes 
    are strings that begin with a "%".

    @param obj {Object} the object(s)
    @returns {String} the hash code for this instance.
  */
  hashFor: function() {
    var len = arguments.length,
        h = '',
        obj, f, i;
    
    for (i = 0; i < len; ++i) {
      obj = arguments[i];
      h += (obj && (f = obj.hash) && (typeof f === SC.T_FUNCTION)) ? f.call(obj) : this.guidFor(obj);
    }
    
    return h === '' ? null : h;
  },
  
  /**
    This will compare the two object values using their hash codes.

    @param a {Object} first value to compare
    @param b {Object} the second value to compare
    @returns {Boolean} YES if the two have equal hash code values.

  */
  isEqual: function(a,b) {
    // shortcut a few places.
    if (a === null) {
      return b === null ;
    } else if (a === undefined) {
      return b === undefined ;

    // finally, check their hash-codes
    } else return this.hashFor(a) === this.hashFor(b) ;
  },
  
  
  /**
   This will compare two javascript values of possibly different types.
   It will tell you which one is greater than the other by returning
   -1 if the first is smaller than the second,
    0 if both are equal,
    1 if the first is greater than the second.
  
   The order is calculated based on SC.ORDER_DEFINITION , if types are different.
   In case they have the same type an appropriate comparison for this type is made.

   @param v {Object} first value to compare
   @param w {Object} the second value to compare
   @returns {NUMBER} -1 if v < w, 0 if v = w and 1 if v > w.

  */
  compare: function (v, w) {
    // Doing a '===' check is very cheap, so in the case of equality, checking
    // this up-front is a big win.
    if (v === w) return 0;
    
    var type1 = SC.typeOf(v);
    var type2 = SC.typeOf(w);
    
    // If we haven't yet generated a reverse-mapping of SC.ORDER_DEFINITION,
    // do so now.
    var mapping = SC.ORDER_DEFINITION_MAPPING;
    if (!mapping) {
      var order = SC.ORDER_DEFINITION;
      mapping = SC.ORDER_DEFINITION_MAPPING = {};
      var idx, len;
      for (idx = 0, len = order.length;  idx < len;  ++idx) {
        mapping[order[idx]] = idx;
      }
      
      // We no longer need SC.ORDER_DEFINITION.
      delete SC.ORDER_DEFINITION;
    }
    
    var type1Index = mapping[type1];
    var type2Index = mapping[type2];
    
    if (type1Index < type2Index) return -1;
    if (type1Index > type2Index) return 1;
    
    // ok - types are equal - so we have to check values now
    switch (type1) {
      case SC.T_BOOL:
      case SC.T_NUMBER:
        if (v<w) return -1;
        if (v>w) return 1;
        return 0;

      case SC.T_STRING:
        var comp = v.localeCompare(w);
        if (comp<0) return -1;
        if (comp>0) return 1;
        return 0;

      case SC.T_ARRAY:
        var vLen = v.length;
        var wLen = w.length;
        var l = Math.min(vLen, wLen);
        var r = 0;
        var i = 0;
        var thisFunc = arguments.callee;
        while (r===0 && i < l) {
          r = thisFunc(v[i],w[i]);
          i++;
        }
        if (r !== 0) return r;
      
        // all elements are equal now
        // shorter array should be ordered first
        if (vLen < wLen) return -1;
        if (vLen > wLen) return 1;
        // arrays are equal now
        return 0;
        
      case SC.T_OBJECT:
        if (v.constructor.isComparable === YES) return v.constructor.compare(v, w);
        return 0;

      default:
        return 0;
    }
  },
  
  // ..........................................................
  // OBJECT MANAGEMENT
  
  /** 
    Empty function.  Useful for some operations. 
    
    @returns {Object}
  */
  K: function() { return this; },

  /** 
    Empty array.  Useful for some optimizations.
  
    @property {Array}
  */
  EMPTY_ARRAY: [],

  /**
    Empty hash.  Useful for some optimizations.
  
    @property {Hash}
  */
  EMPTY_HASH: {},

  /**
    Empty range. Useful for some optimizations.
    
    @property {Range}
  */
  EMPTY_RANGE: {start: 0, length: 0},
  
  /**
    Creates a new object with the passed object as its prototype.

    This method uses JavaScript's native inheritence method to create a new 
    object.    

    You cannot use beget() to create new SC.Object-based objects, but you
    can use it to beget Arrays, Hashes, Sets and objects you build yourself.
    Note that when you beget() a new object, this method will also call the
    didBeget() method on the object you passed in if it is defined.  You can
    use this method to perform any other setup needed.

    In general, you will not use beget() often as SC.Object is much more 
    useful, but for certain rare algorithms, this method can be very useful.

    For more information on using beget(), see the section on beget() in 
    Crockford's JavaScript: The Good Parts.

    @param obj {Object} the object to beget
    @returns {Object} the new object.
  */
  beget: function(obj) {
    if (obj === null || obj === undefined) return null ;
    var K = SC.K; K.prototype = obj ;
    var ret = new K();
    K.prototype = null ; // avoid leaks
    if (typeof obj.didBeget === "function") ret = obj.didBeget(ret); 
    return ret ;
  },

  /**
    Creates a clone of the passed object.  This function can take just about
    any type of object and create a clone of it, including primitive values
    (which are not actually cloned because they are immutable).

    If the passed object implements the clone() method, then this function
    will simply call that method and return the result.

    @param object {Object} the object to clone
    @param deep {Boolean} if true, a deep copy of the object is made
    @returns {Object} the cloned object
  */
  copy: function(object, deep) {
    var ret = object, idx ;

    // fast path
    if (object) {
      if (object.isCopyable) return object.copy(deep);
      if (object.clone && SC.typeOf(object.clone) === SC.T_FUNCTION) return object.clone();
    }

    switch (SC.typeOf(object)) {
    case SC.T_ARRAY:
      ret = object.slice() ;
      if (deep) {
        idx = ret.length;
        while (idx--) ret[idx] = SC.copy(ret[idx], true);
      }
      break ;

    case SC.T_HASH:
    case SC.T_OBJECT:
      ret = {};
      for (var key in object) ret[key] = deep ? SC.copy(object[key], true) : object[key];
      break ;
    }

    return ret ;
  },

  /**
    Returns a new object combining the values of all passed hashes.

    @param object {Object} one or more objects
    @returns {Object} new Object
  */
  merge: function() {
    var ret = {}, len = arguments.length, idx;
    for(idx=0;idx<len;idx++) SC.mixin(ret, arguments[idx]);
    return ret ;
  },

  /**
    Returns all of the keys defined on an object or hash.  This is useful
    when inspecting objects for debugging.

    @param {Object} obj
    @returns {Array} array of keys
  */
  keys: function(obj) {
    var ret = [];
    for(var key in obj) ret.push(key);
    return ret;
  },

  /**
    Convenience method to inspect an object.  This method will attempt to 
    convert the object into a useful string description.
  */
  inspect: function(obj) {
    var v, ret = [] ;
    for(var key in obj) {
      v = obj[key] ;
      if (v === 'toString') continue ; // ignore useless items
      if (SC.typeOf(v) === SC.T_FUNCTION) v = "function() { ... }" ;
      ret.push(key + ": " + v) ;
    }
    return "{" + ret.join(" , ") + "}" ;
  },

  /**
    Returns a tuple containing the object and key for the specified property 
    path.  If no object could be found to match the property path, then 
    returns null.

    This is the standard method used throughout SproutCore to resolve property
    paths.

    @param path {String} the property path
    @param root {Object} optional parameter specifying the place to start
    @returns {Array} array with [object, property] if found or null
  */
  tupleForPropertyPath: function(path, root) {

    // if the passed path is itself a tuple, return it
    if (typeof path === "object" && (path instanceof Array)) return path ;

    // find the key.  It is the last . or first *
    var key ;
    var stopAt = path.indexOf('*') ;
    if (stopAt < 0) stopAt = path.lastIndexOf('.') ;
    key = (stopAt >= 0) ? path.slice(stopAt+1) : path ;

    // convert path to object.
    var obj = this.objectForPropertyPath(path, root, stopAt) ;
    return (obj && key) ? [obj,key] : null ;
  },

  /** 
    Finds the object for the passed path or array of path components.  This is 
    the standard method used in SproutCore to traverse object paths.

    @param path {String} the path
    @param root {Object} optional root object.  window is used otherwise
    @param stopAt {Integer} optional point to stop searching the path.
    @returns {Object} the found object or undefined.
  */
  objectForPropertyPath: function(path, root, stopAt) {

    var loc, nextDotAt, key, max ;

    if (!root) root = window ;

    // faster method for strings
    if (SC.typeOf(path) === SC.T_STRING) {
      if (stopAt === undefined) stopAt = path.length ;
      loc = 0 ;
      while((root) && (loc < stopAt)) {
        nextDotAt = path.indexOf('.', loc) ;
        if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
        key = path.slice(loc, nextDotAt);
        root = root.get ? root.get(key) : root[key] ;
        loc = nextDotAt+1; 
      }
      if (loc < stopAt) root = undefined; // hit a dead end. :(

    // older method using an array
    } else {

      loc = 0; max = path.length; key = null;
      while((loc < max) && root) {
        key = path[loc++];
        if (key) root = (root.get) ? root.get(key) : root[key] ;
      }
      if (loc < max) root = undefined ;
    }

    return root ;
  },
  
  
  // ..........................................................
  // LOCALIZATION SUPPORT
  // 
  
  /**
    Known loc strings
    
    @property {Hash}
  */
  STRINGS: {},
  
  /**
    This is a simplified handler for installing a bunch of strings.  This
    ignores the language name and simply applies the passed strings hash.
    
    @param {String} lang the language the strings are for
    @param {Hash} strings hash of strings
    @returns {SC} receiver
  */
  stringsFor: function(lang, strings) {
    SC.mixin(SC.STRINGS, strings);
    return this ;
  }
  
  
}); // end mixin

/** @private Aliasn for SC.clone() */
SC.clone = SC.copy ;

/** @private Alias for SC.A() */
SC.$A = SC.A;

/** @private Provided for compatibility with old HTML templates. */
SC.didLoad = SC.K ;

/** @private Used by SC.compare */
SC.ORDER_DEFINITION = [ SC.T_ERROR,
                        SC.T_UNDEFINED,
                        SC.T_NULL,
                        SC.T_BOOL,
                        SC.T_NUMBER,
                        SC.T_STRING,
                        SC.T_ARRAY,
                        SC.T_HASH,
                        SC.T_OBJECT,
                        SC.T_FUNCTION,
                        SC.T_CLASS ];


// ........................................
// FUNCTION ENHANCEMENTS
//

SC.mixin(Function.prototype, 
/** @lends Function.prototype */ {
  
  /**
    Indicates that the function should be treated as a computed property.
    
    Computed properties are methods that you want to treat as if they were
    static properties.  When you use get() or set() on a computed property,
    the object will call the property method and return its value instead of 
    returning the method itself.  This makes it easy to create "virtual 
    properties" that are computed dynamically from other properties.
    
    Consider the following example:
    
    {{{
      contact = SC.Object.create({

        firstName: "Charles",
        lastName: "Jolley",
        
        // This is a computed property!
        fullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }.property('firstName', 'lastName'),
        
        // this is not
        getFullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }
      });

      contact.get('firstName') ;
      --> "Charles"
      
      contact.get('fullName') ;
      --> "Charles Jolley"
      
      contact.get('getFullName') ;
      --> function()
    }}}
    
    Note that when you get the fullName property, SproutCore will call the
    fullName() function and return its value whereas when you get() a property
    that contains a regular method (such as getFullName above), then the 
    function itself will be returned instead.
    
    h2. Using Dependent Keys

    Computed properties are often computed dynamically from other member 
    properties.  Whenever those properties change, you need to notify any
    object that is observing the computed property that the computed property
    has changed also.  We call these properties the computed property is based
    upon "dependent keys".
    
    For example, in the contact object above, the fullName property depends on
    the firstName and lastName property.  If either property value changes,
    any observer watching the fullName property will need to be notified as 
    well.
    
    You inform SproutCore of these dependent keys by passing the key names
    as parameters to the property() function.  Whenever the value of any key
    you name here changes, the computed property will be marked as changed
    also.
    
    You should always register dependent keys for computed properties to 
    ensure they update.
    
    h2. Using Computed Properties as Setters
    
    Computed properties can be used to modify the state of an object as well
    as to return a value.  Unlike many other key-value system, you use the 
    same method to both get and set values on a computed property.  To 
    write a setter, simply declare two extra parameters: key and value.
    
    Whenever your property function is called as a setter, the value 
    parameter will be set.  Whenever your property is called as a getter the
    value parameter will be undefined.
    
    For example, the following object will split any full name that you set
    into a first name and last name components and save them.
    
    {{{
      contact = SC.Object.create({
        
        fullName: function(key, value) {
          if (value !== undefined) {
            var parts = value.split(' ') ;
            this.beginPropertyChanges()
              .set('firstName', parts[0])
              .set('lastName', parts[1])
            .endPropertyChanges() ;
          }
          return this.getEach('firstName', 'lastName').compact().join(' ');
        }.property('firstName','lastName')
        
      }) ;
      
    }}}
    
    h2. Why Use The Same Method for Getters and Setters?
    
    Most property-based frameworks expect you to write two methods for each
    property but SproutCore only uses one. We do this because most of the time
    when you write a setter is is basically a getter plus some extra work.
    There is little added benefit in writing both methods when you can
    conditionally exclude part of it. This helps to keep your code more
    compact and easier to maintain.
    
    @param dependentKeys {String...} optional set of dependent keys
    @returns {Function} the declared function instance
  */
  property: function() {
    this.dependentKeys = SC.$A(arguments) ;
    var guid = SC.guidFor(this) ;
    this.cacheKey = "__cache__" + guid ;
    this.lastSetValueKey = "__lastValue__" + guid ;
    this.isProperty = YES ;
    return this ;
  },
  
  /**
    You can call this method on a computed property to indicate that the 
    property is cacheable (or not cacheable).  By default all computed 
    properties are not cached.  Enabling this feature will allow SproutCore
    to cache the return value of your computed property and to use that
    value until one of your dependent properties changes or until you 
    invoke propertyDidChange() and name the computed property itself.
    
    If you do not specify this option, computed properties are assumed to be
    not cacheable.
    
    @param {Boolean} aFlag optionally indicate cacheable or no, default YES
    @returns {Function} reciever
  */
  cacheable: function(aFlag) {
    this.isProperty = YES ;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isCacheable = (aFlag === undefined) ? YES : aFlag ;
    return this ;
  },
  
  /**
    Indicates that the computed property is volatile.  Normally SproutCore 
    assumes that your computed property is idempotent.  That is, calling 
    set() on your property more than once with the same value has the same
    effect as calling it only once.  
    
    All non-computed properties are idempotent and normally you should make
    your computed properties behave the same way.  However, if you need to
    make your property change its return value everytime your method is
    called, you may chain this to your property to make it volatile.
    
    If you do not specify this option, properties are assumed to be 
    non-volatile. 
    
    @param {Boolean} aFlag optionally indicate state, default to YES
    @returns {Function} receiver
  */
  idempotent: function(aFlag) {
    this.isProperty = YES;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isVolatile = (aFlag === undefined) ? YES : aFlag ;
    return this ;
  },
  
  /**
    Declare that a function should observe an object at the named path.  Note
    that the path is used only to construct the observation one time.
    
    @returns {Function} receiver
  */
  observes: function(propertyPaths) { 
    // sort property paths into local paths (i.e just a property name) and
    // full paths (i.e. those with a . or * in them)
    var loc = arguments.length, local = null, paths = null ;
    while(--loc >= 0) {
      var path = arguments[loc] ;
      // local
      if ((path.indexOf('.')<0) && (path.indexOf('*')<0)) {
        if (!local) local = this.localPropertyPaths = [] ;
        local.push(path);
        
      // regular
      } else {
        if (!paths) paths = this.propertyPaths = [] ;
        paths.push(path) ;
      }
    }
    return this ;
  }
  
});

// ..........................................................
// STRING ENHANCEMENT
// 

// Interpolate string. looks for %@ or %@1; to control the order of params.
/**
  Apply formatting options to the string.  This will look for occurrences
  of %@ in your string and substitute them with the arguments you pass into
  this method.  If you want to control the specific order of replacement, 
  you can add a number after the key as well to indicate which argument 
  you want to insert.  

  Ordered insertions are most useful when building loc strings where values
  you need to insert may appear in different orders.

  h3. Examples
  
  {{{
    "Hello %@ %@".fmt('John', 'Doe') => "Hello John Doe"
    "Hello %@2, %@1".fmt('John', 'Doe') => "Hello Doe, John"
  }}}
  
  @param args {Object...} optional arguments
  @returns {String} formatted string
*/
String.prototype.fmt = function() {
  // first, replace any ORDERED replacements.
  var args = arguments,
      idx  = 0; // the current index for non-numerical replacements
  return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {
    argIndex = (argIndex) ? parseInt(argIndex,0)-1 : idx++ ;
    s =args[argIndex];
    return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString(); 
  }) ;
};

/**
  Localizes the string.  This will look up the reciever string as a key 
  in the current Strings hash.  If the key matches, the loc'd value will be
  used.  The resulting string will also be passed through fmt() to insert
  any variables.
  
  @param args {Object...} optional arguments to interpolate also
  @returns {String} the localized and formatted string.
*/
String.prototype.loc = function() {
  var str = SC.STRINGS[this] || this;
  return str.fmt.apply(str,arguments) ;
};


  
/**
  Splits the string into words, separated by spaces. Empty strings are
  removed from the results.
  
  @returns {Array} an array of non-empty strings
*/
String.prototype.w = function() { 
  var ary = [], ary2 = this.split(' '), len = ary2.length, str, idx=0;
  for (idx=0; idx<len; ++idx) {
    str = ary2[idx] ;
    if (str.length !== 0) ary.push(str) ; // skip empty strings
  }
  return ary ;
};

//
// DATE ENHANCEMENT
//
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime() ;
  };
}
  

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/base.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

/**
  Adds a new module of unit tests to verify that the passed object implements
  the SC.Array interface.  To generate, call the ArrayTests array with a 
  test descriptor.  Any properties you pass will be applied to the ArrayTests
  descendent created by the create method.
  
  You should pass at least a newObject() method, which should return a new 
  instance of the object you want to have tested.  You can also implement the
  destroyObject() method, which should destroy a passed object.
  
  {{{
    SC.ArrayTests.generate("Array", {
      newObject:  function() { return []; }
    });
  }}}
  
  newObject must accept an optional array indicating the number of items
  that should be in the array.  You should initialize the the item with 
  that many items.  The actual objects you add are up to you.
  
  Unit tests themselves can be added by calling the define() method.  The
  function you pass will be invoked whenever the ArrayTests are generated. The
  parameter passed will be the instance of ArrayTests you should work with.
  
  {{{
    SC.ArrayTests.define(function(T) {
      T.module("length");
      
      test("verify length", function() {
        var ary = T.newObject();
        equals(ary.get('length'), 0, 'should have 0 initial length');
      });
    }
  }}}
  
  
*/
SC.ArraySuite = CoreTest.Suite.create("Verify SC.Array compliance: %@#%@", {
  
  /** 
    Override to return a set of simple values such as numbers or strings.
    Return null if your set does not support primitives.
  */
  simple: function(amt) {
    var ret = [];
    if (amt === undefined) amt = 0;
    while(--amt >= 0) ret[amt] = amt ;
    return ret ;
  },

  /**  Override with the name of the key we should get/set on hashes */
  hashValueKey: 'foo',
  
  /**
    Override to return hashes of values if supported.  Or return null.
  */
  hashes: function(amt) {
    var ret = [];  
    if (amt === undefined) amt = 0;
    while(--amt >= 0) {
      ret[amt] = {};
      ret[amt][this.hashValueKey] = amt ;
    }
    return ret ;
  },
  
  /** Override with the name of the key we should get/set on objects */
  objectValueKey: "foo",
  
  /**
    Override to return observable objects if supported.  Or return null.
  */
  objects: function(amt) {
    var ret = [];  
    if (amt === undefined) amt = 0;
    while(--amt >= 0) {
      var o = {};
      o[this.objectValueKey] = amt ;
      ret[amt] = SC.Object.create(o);
    }
    return ret ;
  },

  /**
    Returns an array of content items in your preferred format.  This will
    be used whenever the test does not care about the specific object content.
  */
  expected: function(amt) {
    return this.simple(amt);
  },
  
  /**
    Example of how to implement newObject
  */
  newObject: function(expected) {
    if (!expected || SC.typeOf(expected) === SC.T_NUMBER) {
      expected = this.expected(expected);
    }
    
    return expected.slice();
  },
  
  
  /**
    Creates an observer object for use when tracking object modifications.
  */
  observer: function(obj) {
    return SC.Object.create({

      // ..........................................................
      // NORMAL OBSERVER TESTING
      // 
      
      observer: function(target, key, value) {
        this.notified[key] = true ;
        this.notifiedValue[key] = value ;
      },

      resetObservers: function() {
        this.notified = {} ;
        this.notifiedValue = {} ;
      },

      observe: function() {
        var keys = SC.$A(arguments) ;
        var loc = keys.length ;
        while(--loc >= 0) {
          obj.addObserver(keys[loc], this, this.observer) ;
        }
        return this ;
      },

      didNotify: function(key) {
        return !!this.notified[key] ;
      },

      init: function() {
        arguments.callee.base.apply(this,arguments) ;
        this.resetObservers() ;
      },
      
      // ..........................................................
      // RANGE OBSERVER TESTING
      // 
      
      callCount: 0,

      // call afterward to verify
      expectRangeChange: function(source, object, key, indexes, context) {
        equals(this.callCount, 1, 'expects one callback');
        
        if (source !== undefined && source !== NO) {
          ok(this.source, source, 'source should equal array');
        }
        
        if (object !== undefined && object !== NO) {
          equals(this.object, object, 'object');
        }
        
        if (key !== undefined && key !== NO) {
          equals(this.key, key, 'key');
        }
        
        if (indexes !== undefined && indexes !== NO) {
          if (indexes.isIndexSet) {
            ok(this.indexes && this.indexes.isIndexSet, 'indexes should be index set');
            ok(indexes.isEqual(this.indexes), 'indexes should match %@ (actual: %@)'.fmt(indexes, this.indexes));
          } else equals(this.indexes, indexes, 'indexes');
        }
          
        if (context !== undefined && context !== NO) {
          equals(this.context, context, 'context should match');
        }
        
      },
      
      rangeDidChange: function(source, object, key, indexes, context) {
        this.callCount++ ;
        this.source = source ;
        this.object = object ;
        this.key    = key ;
        
        // clone this because the index set may be reused after this callback
        // runs.
        this.indexes = (indexes && indexes.isIndexSet) ? indexes.clone() : indexes;
        this.context = context ;          
      }
      
    });  
  },
  
  /**
    Verifies that the passed object matches the passed array.
  */
  validateAfter: function(obj, after, observer, lengthDidChange, enumerableDidChange) {
    var loc = after.length;
    equals(obj.get('length'), loc, 'length should update (%@)'.fmt(obj)) ;
    while(--loc >= 0) {
      equals(obj.objectAt(loc), after[loc], 'objectAt(%@)'.fmt(loc)) ;
    }

    // note: we only test that the length notification happens when we expect
    // it.  If we don't expect a length notification, it is OK for a class
    // to trigger a change anyway so we don't check for this case.
    if (enumerableDidChange !== NO) {
      equals(observer.didNotify("[]"), YES, 'should notify []') ;
    }
    
    if (lengthDidChange) {
      equals(observer.didNotify('length'), YES, 'should notify length change');
    }
  }
  
});

// Simple verfication of length
SC.ArraySuite.define(function(T) {
  T.module("length");
  
  test("should return 0 on empty array", function() {
    equals(T.object.get('length'), 0, 'should have empty length');
  });
  
  test("should return array length", function() {
    var obj = T.newObject(3);
    equals(obj.get('length'), 3, 'should return length');
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/indexOf.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  T.module("indexOf");
  
  test("should return index of object", function() {
    var expected = T.expected(3), 
        obj      = T.newObject(3), 
        len      = 3,
        idx;
        
    for(idx=0;idx<len;idx++) {
      equals(obj.indexOf(expected[idx]), idx, 'obj.indexOf(%@) should match idx'.fmt(expected[idx]));
    }
    
  });
  
  test("should return -1 when requesting object not in index", function() {
    var obj = T.newObject(3), foo = {};
    equals(obj.indexOf(foo), -1, 'obj.indexOf(foo) should be < 0');
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/insertAt.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("insertAt"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].insertAt(0, X) => [X] + notify", function() {

    var after = T.expected(1);
    
    observer.observe('[]') ;
    obj.insertAt(0, after) ;
    T.validateAfter(obj, after, observer);
  });
  
  test("[].insertAt(200,X) => OUT_OF_RANGE_EXCEPTION exception", function() {
    var didThrow = NO ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      equals(e, SC.OUT_OF_RANGE_EXCEPTION, 'should throw SC.OUT_OF_RANGE_EXCEPTION');
      didThrow = YES ;
    }
    ok(didThrow, 'should raise exception');
  });

  test("[A].insertAt(0, X) => [X,A] + notify", function() {
    var exp = T.expected(2), 
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [replace, before[0]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });
  
  test("[A].insertAt(1, X) => [A,X] + notify", function() {
    var exp = T.expected(2), 
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [before[0], replace];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A].insertAt(200,X) => OUT_OF_RANGE exception", function() {
    obj.replace(0,0, T.expected(1)); // add an item
    
    var didThrow = NO ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      equals(e, SC.OUT_OF_RANGE_EXCEPTION, 'should throw SC.OUT_OF_RANGE_EXCEPTION');
      didThrow = YES ;
    }
    ok(didThrow, 'should raise exception');
  });
  
  test("[A,B,C].insertAt(0,X) => [X,A,B,C] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [replace, before[0], before[1], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });
  
  test("[A,B,C].insertAt(1,X) => [A,X,B,C] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], replace, before[1], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A,B,C].insertAt(3,X) => [A,B,C,X] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], before[1], before[2], replace];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(3, replace);
    T.validateAfter(obj, after, observer);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/objectAt.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  T.module("objectAt");
  
  test("should return object at specified index", function() {
    var expected = T.expected(3), 
        obj      = T.newObject(3), 
        len      = 3,
        idx;
        
    for(idx=0;idx<len;idx++) {
      equals(obj.objectAt(idx), expected[idx], 'obj.objectAt(%@) should match'.fmt(idx));
    }
    
  });
  
  test("should return undefined when requesting objects beyond index", function() {
    var obj = T.newObject(3);
    equals(obj.objectAt(5), undefined, 'should return undefined for obj.objectAt(5) when len = 3');
    equals(T.object.objectAt(0), undefined, 'should return undefined for obj.objectAt(0) when len = 0');
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/popObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("popObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].popObject() => [] + returns undefined + NO notify", function() {
    observer.observe('[]', 'length') ;
    equals(obj.popObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, NO, NO);
  });

  test("[X].popObject() => [] + notify", function() {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    equals(obj.popObject(), exp, 'should return popped object') ;
    T.validateAfter(obj, [], observer, YES, YES);
  });

  test("[A,B,C].popObject() => [A,B] + notify", function() {
    var before  = T.expected(3),
        value   = before[2],
        after   = before.slice(0,2);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    equals(obj.popObject(), value, 'should return popped object') ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/pushObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("pushObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns pushed object", function() {
    var exp = T.expected(1)[0];
    equals(obj.pushObject(exp), exp, 'should return receiver');
  });
  
  test("[].pushObject(X) => [X] + notify", function() {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.pushObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, YES);
  });

  test("[A,B,C].pushObject(X) => [A,B,C,X] + notify", function() {
    var after  = T.expected(4),
        before = after.slice(0,3),
        value  = after[3];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.pushObject(value) ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/rangeObserver.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var expected, array, observer, rangeObserver ;

  // ..........................................................
  // MODULE: isDeep = YES 
  // 
  module(T.desc("RangeObserver Methods"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(SC.IndexSet.create(2,3), 
                observer, observer.rangeDidChange, null, NO);
      
    },
    
    teardown: function() {
      T.destroyObject(array);
    }
  });
  
  test("returns RangeObserver object", function() {
    ok(rangeObserver && rangeObserver.isRangeObserver, 'returns a range observer object');
  });

  // NOTE: Deep Property Observing is disabled for SproutCore 1.0
  //
  // // ..........................................................
  // // EDIT PROPERTIES
  // // 
  //
  // test("editing property on object in range should fire observer", function() {
  //   var obj = array.objectAt(3);
  //   obj.set('foo', 'BAR');
  //   observer.expectRangeChange(array, obj, 'foo', SC.IndexSet.create(3));
  // });
  // 
  // test("editing property on object outside of range should NOT fire observer", function() {
  //   var obj = array.objectAt(0);
  //   obj.set('foo', 'BAR');
  //   equals(observer.callCount, 0, 'observer should not fire');
  // });
  // 
  // 
  // test("updating property after changing observer range", function() {
  //   array.updateRangeObserver(rangeObserver, SC.IndexSet.create(8,2));
  //   observer.callCount = 0 ;// reset b/c callback should happen here
  // 
  //   var obj = array.objectAt(3);
  //   obj.set('foo', 'BAR');
  //   equals(observer.callCount, 0, 'modifying object in old range should not fire observer');
  //   
  //   obj = array.objectAt(9);
  //   obj.set('foo', 'BAR');
  //   observer.expectRangeChange(array, obj, 'foo', SC.IndexSet.create(9));
  //   
  // });
  // 
  // test("updating a property after removing an range should not longer update", function() {
  //   array.removeRangeObserver(rangeObserver);
  // 
  //   observer.callCount = 0 ;// reset b/c callback should happen here
  // 
  //   var obj = array.objectAt(3);
  //   obj.set('foo', 'BAR');
  //   equals(observer.callCount, 0, 'modifying object in old range should not fire observer');
  //   
  // });

  // ..........................................................
  // REPLACE
  // 

  test("replacing object in range fires observer with index set covering only the effected item", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(2,1));
  });

  test("replacing object before range", function() {
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  test("replacing object after range", function() {
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  test("updating range should be reflected by replace operations", function() {
    array.updateRangeObserver(rangeObserver, SC.IndexSet.create(9,1));
    
    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(9));
  });

  test("removing range should no longer fire observers", function() {
    array.removeRangeObserver(rangeObserver);
    
    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // GROUPED CHANGES
  // 
  
  test("grouping property changes should notify observer only once at end with single IndexSet", function() {
    
    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(4, 1, T.objects(1));
    array.endPropertyChanges();
    
    var set = SC.IndexSet.create().add(2).add(4); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("should notify observer when some but not all grouped changes are inside range", function() {
    
    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(9, 1, T.objects(1));
    array.endPropertyChanges();
    
    var set = SC.IndexSet.create().add(2).add(9); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });
  
  test("should NOT notify observer when grouping changes all outside of observer", function() {
    
    array.beginPropertyChanges();
    array.replace(0, 1, T.objects(1));
    array.replace(9, 1, T.objects(1));
    array.endPropertyChanges();

    equals(observer.callCount, 0, 'observer should not fire');
  });
  
  // ..........................................................
  // INSERTING
  // 
  
  test("insertAt in range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = SC.IndexSet.create(3,array.get('length')-2);
        
    array.insertAt(3, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("insertAt BEFORE range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = SC.IndexSet.create(0,array.get('length')+1);
        
    array.insertAt(0, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("insertAt AFTER range does not fire observer", function() {
    var newItem = T.objects(1)[0];
        
    array.insertAt(9, newItem);
    equals(observer.callCount, 0, 'observer should not fire');
  });
  
  // ..........................................................
  // REMOVING
  // 
  
  test("removeAt IN range fires observer with index set covering edit to end of array plus delta", function() {
    var set     = SC.IndexSet.create(3,array.get('length')-3);
    array.removeAt(3);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("removeAt BEFORE range fires observer with index set covering edit to end of array plus delta", function() {
    var set     = SC.IndexSet.create(0,array.get('length'));
    array.removeAt(0);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("removeAt AFTER range does not fire observer", function() {
    array.removeAt(9);
    equals(observer.callCount, 0, 'observer should not fire');
  });
  
  
  
  
  // ..........................................................
  // MODULE: No explicit range
  // 
  module(T.desc("RangeObserver Methods - No explicit range"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(null, observer, 
                          observer.rangeDidChange, null, NO);
      
    },
    
    teardown: function() {
      T.destroyObject(array);
    }
  });
  
  test("returns RangeObserver object", function() {
    ok(rangeObserver && rangeObserver.isRangeObserver, 'returns a range observer object');
  });

  // ..........................................................
  // REPLACE
  // 

  test("replacing object in range fires observer with index set covering only the effected item", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(2,1));
  });

  test("replacing at start of array", function() {
    array.replace(0, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(0,1));
  });

  test("replacing object at end of array", function() {
    array.replace(9, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(9,1));
  });

  test("removing range should no longer fire observers", function() {
    array.removeRangeObserver(rangeObserver);
    
    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // GROUPED CHANGES
  // 
  
  test("grouping property changes should notify observer only once at end with single IndexSet", function() {
    
    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(4, 1, T.objects(1));
    array.endPropertyChanges();
    
    var set = SC.IndexSet.create().add(2).add(4); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });

  // ..........................................................
  // INSERTING
  // 
  
  test("insertAt in range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = SC.IndexSet.create(3,array.get('length')-2);
        
    array.insertAt(3, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("adding object fires observer", function() {
    var newItem = T.objects(1)[0];
    var set = SC.IndexSet.create(array.get('length'));

    array.pushObject(newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });
  
  // ..........................................................
  // REMOVING
  // 
  
  test("removeAt fires observer with index set covering edit to end of array", function() {
    var set     = SC.IndexSet.create(3,array.get('length')-3);
    array.removeAt(3);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("popObject fires observer with index set covering removed range", function() {
    var set = SC.IndexSet.create(array.get('length')-1);
    array.popObject();
    observer.expectRangeChange(array, null, '[]', set);
  });
  
  
  // ..........................................................
  // MODULE: isDeep = NO 
  // 
  module(T.desc("RangeObserver Methods - isDeep NO"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(SC.IndexSet.create(2,3), 
                observer, observer.rangeDidChange, null, NO);
      
    },
    
    teardown: function() {
      T.destroyObject(array);
    }
  });
  
  test("editing property on object at any point should not fire observer", function() {
    
    var indexes = [0,3,9], 
        loc     = 3,
        obj,idx;
        
    while(--loc>=0) {
      idx = indexes[loc];
      obj = array.objectAt(idx);
      obj.set('foo', 'BAR');
      equals(observer.callCount, 0, 'observer should not fire when editing object at index %@'.fmt(idx));
    }
  });
  
  test("replacing object in range fires observer with index set", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(2,1));
  });
    
  
});


/* >>>>>>>>>> BEGIN source/debug/test_suites/array/removeAt.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("removeAt"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[X].removeAt(0) => [] + notify", function() {

    var before = T.expected(1);
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(0) ;
    T.validateAfter(obj, [], observer, YES);
  });
  
  test("[].removeAt(200) => OUT_OF_RANGE_EXCEPTION exception", function() {
    var didThrow = NO ;
    try {
      obj.removeAt(200);
    } catch (e) {
      equals(e, SC.OUT_OF_RANGE_EXCEPTION, 'should throw SC.OUT_OF_RANGE_EXCEPTION');
      didThrow = YES ;
    }
    ok(didThrow, 'should raise exception');
  });

  test("[A,B].removeAt(0) => [B] + notify", function() {
    var before = T.expected(2), 
        after   = [before[1]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(0);
    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B].removeAt(1) => [A] + notify", function() {
    var before = T.expected(2), 
        after   = [before[0]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1);
    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B,C].removeAt(1) => [A,C] + notify", function() {
    var before = T.expected(3), 
        after   = [before[0], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1);
    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B,C,D].removeAt(1,2) => [A,D] + notify", function() {
    var before = T.expected(4), 
        after   = [before[0], before[3]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1,2);
    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B,C,D].removeAt(IndexSet<0,2-3>) => [B] + notify", function() {
    var before = T.expected(4), 
        after   = [before[1]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(SC.IndexSet.create(0).add(2,2));
    T.validateAfter(obj, after, observer, YES);
  });
  
});


/* >>>>>>>>>> BEGIN source/debug/test_suites/array/removeObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("removeObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("should return receiver", function() {
    obj = T.newObject(3);
    equals(obj.removeObject(obj.objectAt(0)), obj, 'should return receiver');
  });
  
  test("[A,B,C].removeObject(B) => [A,C] + notify", function() {

    var before = T.expected(3),
        after  = [before[0], before[2]];
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(before[1]) ;
    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B,C].removeObject(D) => [A,B,C]", function() {
    var exp = T.expected(4),
        extra = exp.pop();
    obj.replace(0,0,exp);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(extra);
    T.validateAfter(obj, exp, observer, NO, NO);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/replace.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("replace"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });
  
  test("[].replace(0,0,'X') => ['X'] + notify", function() {

    var exp = T.expected(1);
    
    observer.observe('[]', 'length') ;
    obj.replace(0,0,exp) ;

    T.validateAfter(obj, exp, observer, YES);
  });

  test("[A,B,C,D].replace(1,2,X) => [A,X,D] + notify", function() {
    
    var exp = T.expected(5), 
        before = exp.slice(0,4),
        replace = exp.slice(4),
        after = [before[0], replace[0], before[3]];
        
    obj.replace(0,0, before) ; // precond
    observer.observe('[]', 'length') ;

    obj.replace(1,2,replace) ;

    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B,C,D].replace(1,2,[X,Y]) => [A,X,Y,D] + notify", function() {
    
    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(6),
        before  = exp.slice(0, 4),
        replace = exp.slice(4),
        after   = [before[0], replace[0], replace[1], before[3]]; 
        
    obj.replace(0,0, before) ;
    observer.observe('[]', 'length') ;

    obj.replace(1,2, replace) ;

    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B].replace(1,0,[X,Y]) => [A,X,Y,B] + notify", function() {

    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(4),
        before  = exp.slice(0, 2),
        replace = exp.slice(2),
        after   = [before[0], replace[0], replace[1], before[1]] ;

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(1,0, replace) ;
    
    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B,C,D].replace(2,2) => [A,B] + notify", function() {

    // setup the before, after, and replace arrays.  Use generated objects
    var before  = T.expected(4),
        after   = [before[0], before[1]];

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(2,2) ;
    
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/shiftObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("shiftObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].shiftObject() => [] + returns undefined + NO notify", function() {
    observer.observe('[]', 'length') ;
    equals(obj.shiftObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, NO, NO);
  });

  test("[X].shiftObject() => [] + notify", function() {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    equals(obj.shiftObject(), exp, 'should return shifted object') ;
    T.validateAfter(obj, [], observer, YES, YES);
  });

  test("[A,B,C].shiftObject() => [B,C] + notify", function() {
    var before  = T.expected(3),
        value   = before[0],
        after   = before.slice(1);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    equals(obj.shiftObject(), value, 'should return shifted object') ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/unshiftObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("unshiftObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns unshifted object", function() {
    var exp = T.expected(1)[0];
    equals(obj.pushObject(exp), exp, 'should return receiver');
  });
  

  test("[].unshiftObject(X) => [X] + notify", function() {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, YES);
  });

  test("[A,B,C].unshiftObject(X) => [X,A,B,C] + notify", function() {
    var after  = T.expected(4),
        before = after.slice(1),
        value  = after[0];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(value) ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/private/observer_set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ........................................................................
// ObserverSet
//

/**
  @namespace

  This private class is used to store information about obversers on a
  particular key.  Note that this object is not observable.  You create new
  instances by calling SC.beget(SC.ObserverSet) ;

  @since SproutCore 1.0
*/
SC.ObserverSet = {

  /**
    the number of targets in the set.
  */
  targets: 0,

  _membersCacheIsValid: NO,

  /**
    Adds the named target/method observer to the set.  The method must be
    a function, not a string.

    Note that in debugging mode only, this method is overridden to also record
    the name of the object and function that resulted in the target/method
    being added.
  */
  add: function(target, method, context) {
    var targetGuid = (target) ? SC.guidFor(target) : "__this__";

    // get the set of methods
    var methods = this[targetGuid] ;
    if (!methods) {
      methods = this[targetGuid] = SC.CoreSet.create() ;
      methods.target = target ;
      methods.isTargetSet = YES ; // used for getMembers().
      this.targets++ ;
    }
    methods.add(method) ;

    // context is really useful sometimes but not used that often so this
    // implementation is intentionally lazy.
    if (context !== undefined) {
      if (!methods.contexts) methods.contexts = {} ;
      methods.contexts[SC.guidFor(method)] = context ;
    }

    this._membersCacheIsValid = NO ;
  },

  /**
    removes the named target/method observer from the set.  If this is the
    last method for the named target, then the number of targets will also
    be reduced.

    returns YES if the items was removed, NO if it was not found.
  */
  remove: function(target, method) {
    var targetGuid = (target) ? SC.guidFor(target) : "__this__";

    // get the set of methods
    var methods = this[targetGuid] ;
    if (!methods) return NO ;

    methods.remove(method) ;
    if (methods.length <= 0) {
      methods.target = null;
      methods.isTargetSet = NO ;
      methods.contexts = null ;
      delete this[targetGuid] ;
      this.targets-- ;

    } else if (methods.contexts) {
      delete methods.contexts[SC.guidFor(method)];
    }

    this._membersCacheIsValid = NO;

    return YES ;
  },

  /**
    Invokes the target/method pairs in the receiver.  Used by SC.RunLoop
    Note: does not support context
  */
  invokeMethods: function() {
    var key, value, idx, target, val;

    // iterate through the set, look for sets.
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      value = this[key] ;
      if (value && value.isTargetSet) {
        idx = value.length;
        target = value.target ;
        while(--idx>=0) {
          val = value[idx];
          if(val) val.call(target);
        }
      }
    }
  },

  /**
    Returns an array of target/method pairs.  This is cached.
  */
  getMembers: function() {
    if (this._membersCacheIsValid) return this._members ;

    // need to recache, reset the array...
    if (!this._members) {
      this._members = [] ;
    } else this._members.length = 0 ; // reset
    var ret = this._members ;

    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;

        // slightly slower - only do if we have contexts
        var contexts = value.contexts ;
        if (contexts) {
          while(--idx>=0) {
            var method = value[idx] ;
            ret.push([target, method, contexts[SC.guidFor(method)]]) ;
          }
        } else {
          while(--idx>=0) ret.push([target, value[idx]]);
        }
      }
    }

    this._membersCacheIsValid = YES ;
    return ret ;
  },

  /**
    Returns a new instance of the set with the contents cloned.
  */
  clone: function() {
    var oldSet, newSet, key, ret = SC.ObserverSet.create() ;
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      oldSet = this[key];
      if (oldSet && oldSet.isTargetSet) {
        newSet = oldSet.clone();
        newSet.target = oldSet.target ;
        if (oldSet.contexts) newSet.contexts = SC.clone(oldSet.contexts);
        ret[key] = newSet ;
      }
    }
    ret.targets = this.targets ;
    ret._membersCacheIsValid = NO ;
    return ret ;
  },

  /**
    Creates a new instance of the observer set.
  */
  create: function() { return SC.beget(this); }

} ;

SC.ObserverSet.slice = SC.ObserverSet.clone ;



/* >>>>>>>>>> BEGIN source/mixins/observable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('private/observer_set') ;

/*globals logChange */

/**
  Set to YES to have all observing activity logged to the console.  This 
  should be used for debugging only.
  
  @property {Boolean}
*/
SC.LOG_OBSERVERS = NO ;

/**
  @namespace 
  
  Key-Value-Observing (KVO) simply allows one object to observe changes to a 
  property on another object. It is one of the fundamental ways that models, 
  controllers and views communicate with each other in a SproutCore 
  application.  Any object that has this module applied to it can be used in 
  KVO-operations.
  
  This module is applied automatically to all objects that inherit from
  SC.Object, which includes most objects bundled with the SproutCore 
  framework.  You will not generally apply this module to classes yourself,
  but you will use the features provided by this module frequently, so it is
  important to understand how to use it.
  
  h2. Enabling Key Value Observing

  With KVO, you can write functions that will be called automatically whenever 
  a property on a particular object changes.  You can use this feature to
  reduce the amount of "glue code" that you often write to tie the various 
  parts of your application together.
  
  To use KVO, just use the KVO-aware methods get() and set() to access 
  properties instead of accessing properties directly.  Instead of writing:
  
  {{{
    var aName = contact.firstName ;
    contact.firstName = 'Charles' ;
  }}}

  use:

  {{{
    var aName = contact.get('firstName') ;
    contact.set('firstName', 'Charles') ;
  }}}
  
  get() and set() work just like the normal "dot operators" provided by 
  JavaScript but they provide you with much more power, including not only
  observing but computed properties as well.

  h2. Observing Property Changes

  You typically observe property changes simply by adding the observes() 
  call to the end of your method declarations in classes that you write.  For
  example:
  
  {{{
    SC.Object.create({
      valueObserver: function() {
        // Executes whenever the "Value" property changes
      }.observes('value')
    }) ;
  }}}
  
  Although this is the most common way to add an observer, this capability is
  actually built into the SC.Object class on top of two methods defined in
  this mixin called addObserver() and removeObserver().  You can use these two
  methods to add and remove observers yourself if you need to do so at run 
  time.  
  
  To add an observer for a property, just call:
  
  {{{
    object.addObserver('propertyKey', targetObject, targetAction) ;
  }}}
  
  This will call the 'targetAction' method on the targetObject to be called
  whenever the value of the propertyKey changes.
  
  h2. Observer Parameters
  
  An observer function typically does not need to accept any parameters, 
  however you can accept certain arguments when writing generic observers. 
  An observer function can have the following arguments:
  
  {{{
    propertyObserver(target, key, value, revision) ;
  }}}
  
  - *target* - This is the object whose value changed.  Usually this.
  - *key* - The key of the value that changed
  - *value* - this property is no longer used.  It will always be null
  - *revision* - this is the revision of the target object
  
  h2. Implementing Manual Change Notifications
  
  Sometimes you may want to control the rate at which notifications for 
  a property are delivered, for example by checking first to make sure 
  that the value has changed.
  
  To do this, you need to implement a computed property for the property 
  you want to change and override automaticallyNotifiesObserversFor().
  
  The example below will only notify if the "balance" property value actually
  changes:
  
  {{{
    
    automaticallyNotifiesObserversFor: function(key) {
      return (key === 'balance') ? NO : arguments.callee.base.apply(this,arguments) ;
    },
    
    balance: function(key, value) {
      var balance = this._balance ;
      if ((value !== undefined) && (balance !== value)) {
        this.propertyWillChange(key) ;
        balance = this._balance = value ;
        this.propertyDidChange(key) ;
      }
      return balance ;
    }
    
  }}}
  
  h1. Implementation Details
  
  Internally, SproutCore keeps track of observable information by adding a
  number of properties to the object adopting the observable.  All of these
  properties begin with "_kvo_" to separate them from the rest of your object.
  
  @static
  @since SproutCore 1.0
*/
SC.Observable = {

  /** 
    Walk like that ol' duck 
    
    @property {Boolean}
  */
  isObservable: YES,
  
  /**
    Determines whether observers should be automatically notified of changes
    to a key.
    
    If you are manually implementing change notifications for a property, you
    can override this method to return NO for properties you do not want the
    observing system to automatically notify for.
    
    The default implementation always returns YES.
    
    @param key {String} the key that is changing
    @returns {Boolean} YES if automatic notification should occur.
  */
  automaticallyNotifiesObserversFor: function(key) { 
    return YES;
  },

  // ..........................................
  // PROPERTIES
  // 
  // Use these methods to get/set properties.  This will handle observing
  // notifications as well as allowing you to define functions that can be 
  // used as properties.

  /**  
    Retrieves the value of key from the object.
    
    This method is generally very similar to using object[key] or object.key,
    however it supports both computed properties and the unknownProperty
    handler.
    
    *Computed Properties*
    
    Computed properties are methods defined with the property() modifier
    declared at the end, such as:
    
    {{{
      fullName: function() {
        return this.getEach('firstName', 'lastName').compact().join(' ');
      }.property('firstName', 'lastName')
    }}}
    
    When you call get() on a computed property, the property function will be
    called and the return value will be returned instead of the function
    itself.
    
    *Unknown Properties*
    
    Likewise, if you try to call get() on a property whose values is
    undefined, the unknownProperty() method will be called on the object.
    If this method reutrns any value other than undefined, it will be returned
    instead.  This allows you to implement "virtual" properties that are 
    not defined upfront.
    
    @param key {String} the property to retrieve
    @returns {Object} the property value or undefined.
    
  */
  get: function(key) {
    var ret = this[key], cache ;
    if (ret === undefined) {
      return this.unknownProperty(key) ;
    } else if (ret && ret.isProperty) {
      if (ret.isCacheable) {
        cache = this._kvo_cache ;
        if (!cache) cache = this._kvo_cache = {};
        return (cache[ret.cacheKey] !== undefined) ? cache[ret.cacheKey] : (cache[ret.cacheKey] = ret.call(this,key)) ;
      } else return ret.call(this,key);
    } else return ret ;
  },

  /**  
    Sets the key equal to value.
    
    This method is generally very similar to calling object[key] = value or
    object.key = value, except that it provides support for computed 
    properties, the unknownProperty() method and property observers.
    
    *Computed Properties*
    
    If you try to set a value on a key that has a computed property handler
    defined (see the get() method for an example), then set() will call
    that method, passing both the value and key instead of simply changing 
    the value itself.  This is useful for those times when you need to 
    implement a property that is composed of one or more member
    properties.
    
    *Unknown Properties*
    
    If you try to set a value on a key that is undefined in the target 
    object, then the unknownProperty() handler will be called instead.  This
    gives you an opportunity to implement complex "virtual" properties that
    are not predefined on the obejct.  If unknownProperty() returns 
    undefined, then set() will simply set the value on the object.
    
    *Property Observers*
    
    In addition to changing the property, set() will also register a 
    property change with the object.  Unless you have placed this call 
    inside of a beginPropertyChanges() and endPropertyChanges(), any "local"
    observers (i.e. observer methods declared on the same object), will be
    called immediately.  Any "remote" observers (i.e. observer methods 
    declared on another object) will be placed in a queue and called at a
    later time in a coelesced manner.
    
    *Chaining*
    
    In addition to property changes, set() returns the value of the object
    itself so you can do chaining like this:
    
    {{{
      record.set('firstName', 'Charles').set('lastName', 'Jolley');
    }}}
    
    @param key {String} the property to set
    @param value {Object} the value to set or null.
    @returns {SC.Observable}
  */
  set: function(key, value) {
    var func   = this[key], 
        notify = this.automaticallyNotifiesObserversFor(key),
        ret    = value, 
        cachedep, cache, idx, dfunc ;

    // if there are any dependent keys and they use caching, then clear the
    // cache.  (If we're notifying, then propertyDidChange will do this for
    // us.)
    if (!notify && this._kvo_cacheable && (cache = this._kvo_cache)) {
      // lookup the cached dependents for this key.  if undefined, compute.
      // note that if cachdep is set to null is means we figure out it has no
      // cached dependencies already.  this is different from undefined.
      cachedep = this._kvo_cachedep;
      if (!cachedep || (cachedep = cachedep[key])===undefined) {
        cachedep = this._kvo_computeCachedDependentsFor(key);
      }
      
      if (cachedep) {
        idx = cachedep.length;
        while(--idx>=0) {
          dfunc = cachedep[idx];
          cache[dfunc.cacheKey] = cache[dfunc.lastSetValueKey] = undefined;
        }
      }
    }

    // set the value.
    if (func && func.isProperty) {
      cache = this._kvo_cache;
      if (func.isVolatile || !cache || (cache[func.lastSetValueKey] !== value)) {
        if (!cache) cache = this._kvo_cache = {};

        cache[func.lastSetValueKey] = value ;
        if (notify) this.propertyWillChange(key) ;
        ret = func.call(this,key,value) ;

        // update cached value
        if (func.isCacheable) cache[func.cacheKey] = ret ;
        if (notify) this.propertyDidChange(key, ret, YES) ;
      }

    } else if (func === undefined) {
      if (notify) this.propertyWillChange(key) ;
      this.unknownProperty(key,value) ;
      if (notify) this.propertyDidChange(key, ret) ;

    } else {
      if (this[key] !== value) {
        if (notify) this.propertyWillChange(key) ;
        ret = this[key] = value ;
        if (notify) this.propertyDidChange(key, ret) ;
      }
    }

    return this ;
  },

  /**  
    Called whenever you try to get or set an undefined property.
    
    This is a generic property handler.  If you define it, it will be called
    when the named property is not yet set in the object.  The default does
    nothing.
    
    @param key {String} the key that was requested
    @param value {Object} The value if called as a setter, undefined if called as a getter.
    @returns {Object} The new value for key.
  */
  unknownProperty: function(key,value) {
    if (!(value === undefined)) { this[key] = value; }
    return value ;
  },

  /**  
    Begins a grouping of property changes.
    
    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished.  If you plan to make a 
    large number of changes to an object at one time, you should call this 
    method at the beginning of the changes to suspend change notifications.
    When you are done making changes, all endPropertyChanges() to allow 
    notification to resume.
    
    @returns {SC.Observable}
  */
  beginPropertyChanges: function() {
    this._kvo_changeLevel = (this._kvo_changeLevel || 0) + 1; 
    return this;
  },

  /**  
    Ends a grouping of property changes.
    
    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished.  If you plan to make a 
    large number of changes to an object at one time, you should call 
    beginPropertyChanges() at the beginning of the changes to suspend change 
    notifications. When you are done making changes, call this method to allow 
    notification to resume.
    
    @returns {SC.Observable}
  */
  endPropertyChanges: function() {
    this._kvo_changeLevel = (this._kvo_changeLevel || 1) - 1 ;
    var level = this._kvo_changeLevel, changes = this._kvo_changes;
    if ((level<=0) && changes && (changes.length>0) && !SC.Observers.isObservingSuspended) {
      this._notifyPropertyObservers() ;
    } 
    return this ;
  },

  /**  
    Notify the observer system that a property is about to change.

    Sometimes you need to change a value directly or indirectly without 
    actually calling get() or set() on it.  In this case, you can use this 
    method and propertyDidChange() instead.  Calling these two methods 
    together will notify all observers that the property has potentially 
    changed value.
    
    Note that you must always call propertyWillChange and propertyDidChange as 
    a pair.  If you do not, it may get the property change groups out of order 
    and cause notifications to be delivered more often than you would like.
    
    @param key {String} The property key that is about to change.
    @returns {SC.Observable}
  */
  propertyWillChange: function(key) {
    return this ;
  },

  /**  
    Notify the observer system that a property has just changed.

    Sometimes you need to change a value directly or indirectly without 
    actually calling get() or set() on it.  In this case, you can use this 
    method and propertyWillChange() instead.  Calling these two methods 
    together will notify all observers that the property has potentially 
    changed value.
    
    Note that you must always call propertyWillChange and propertyDidChange as 
    a pair. If you do not, it may get the property change groups out of order 
    and cause notifications to be delivered more often than you would like.
    
    @param key {String} The property key that has just changed.
    @param value {Object} The new value of the key.  May be null.
    @returns {SC.Observable}
  */
  propertyDidChange: function(key,value, _keepCache) {

    this._kvo_revision = (this._kvo_revision || 0) + 1; 
    var level = this._kvo_changeLevel || 0,
        cachedep, idx, dfunc, cache, func,
        log = SC.LOG_OBSERVERS && !(this.LOG_OBSERVING===NO);

    if (cache = this._kvo_cache) {

      // clear any cached value
      if (!_keepCache) {
        func = this[key] ;
        if (func && func.isProperty) {
          cache[func.cacheKey] = cache[func.lastSetValueKey] = undefined ;
        }
      }

      if (this._kvo_cacheable) {
        // if there are any dependent keys and they use caching, then clear the
        // cache.  This is the same code as is in set.  It is inlined for perf.
        cachedep = this._kvo_cachedep;
        if (!cachedep || (cachedep = cachedep[key])===undefined) {
          cachedep = this._kvo_computeCachedDependentsFor(key);
        }

        if (cachedep) {
          idx = cachedep.length;
          while(--idx>=0) {
            dfunc = cachedep[idx];
            cache[dfunc.cacheKey] = cache[dfunc.lastSetValueKey] = undefined;
          }
        }
      }
    }

    // save in the change set if queuing changes
    var suspended = SC.Observers.isObservingSuspended;
    if ((level > 0) || suspended) {
      var changes = this._kvo_changes ;
      if (!changes) changes = this._kvo_changes = SC.CoreSet.create() ;
      changes.add(key) ;
      
      if (suspended) {
        if (log) console.log("%@%@: will not notify observers because observing is suspended".fmt(SC.KVO_SPACES,this));
        SC.Observers.objectHasPendingChanges(this) ;
      }
      
    // otherwise notify property observers immediately
    } else this._notifyPropertyObservers(key) ;
    
    return this ;
  },

  // ..........................................
  // DEPENDENT KEYS
  // 

  /**
    Use this to indicate that one key changes if other keys it depends on 
    change.  Pass the key that is dependent and additional keys it depends
    upon.  You can either pass the additional keys inline as arguments or 
    in a single array.
    
    You generally do not call this method, but instead pass dependent keys to
    your property() method when you declare a computed property.
    
    You can call this method during your init to register the keys that should
    trigger a change notification for your computed properties.  
    
    @param {String} key the dependent key
    @param {Array|String} dependentKeys one or more dependent keys 
    @returns {Object} this
  */  
  registerDependentKey: function(key, dependentKeys) {
    var dependents = this._kvo_dependents,
        func       = this[key],
        keys, idx, lim, dep, queue;

    // normalize input.
    if (typeof dependentKeys === "object" && (dependentKeys instanceof Array)) {
      keys = dependentKeys;
      lim  = 0;
    } else {
      keys = arguments;
      lim  = 1;
    }
    idx  = keys.length;

    // define dependents if not defined already.
    if (!dependents) this._kvo_dependents = dependents = {} ;

    // for each key, build array of dependents, add this key...
    // note that we ignore the first argument since it is the key...
    while(--idx >= lim) {
      dep = keys[idx] ;

      // add dependent key to dependents array of key it depends on
      queue = dependents[dep] ;
      if (!queue) queue = dependents[dep] = [] ;
      queue.push(key) ;
    }
  },

  /** @private 
  
    Helper method used by computeCachedDependents.  Just loops over the 
    array of dependent keys.  If the passed function is cacheable, it will
    be added to the queue.  Also, recursively call on each keys dependent 
    keys.
  
    @param {Array} queue the queue to add functions to
    @param {Array} keys the array of dependent keys for this key
    @param {Hash} dependents the _kvo_dependents cache
    @param {SC.Set} seen already seen keys
    @returns {void}
  */
  _kvo_addCachedDependents: function(queue, keys, dependents, seen) {
    var idx = keys.length,
        func, key, deps ;
        
    while(--idx >= 0) {
      key  = keys[idx];
      seen.add(key);
      
      // if the value for this key is a computed property, then add it to the
      // set if it is cacheable, and process any of its dependent keys also.
      func = this[key];
      if (func && (func instanceof Function) && func.isProperty) {
        if (func.isCacheable) queue.push(func); // handle this func
        if ((deps = dependents[key]) && deps.length>0) { // and any dependents
          this._kvo_addCachedDependents(queue, deps, dependents, seen);
        }
      } 
    }
        
  },
  
  /** @private

    Called by set() whenever it needs to determine which cached dependent
    keys to clear.  Recursively searches dependent keys to determine all 
    cached property direcly or indirectly affected.
    
    The return value is also saved for future reference
    
    @param {String} key the key to compute
    @returns {Array}
  */
  _kvo_computeCachedDependentsFor: function(key) {
    var cached     = this._kvo_cachedep,
        dependents = this._kvo_dependents,
        keys       = dependents ? dependents[key] : null,
        queue, seen ;
    if (!cached) cached = this._kvo_cachedep = {};

    // if there are no dependent keys, then just set and return null to avoid
    // this mess again.
    if (!keys || keys.length===0) return cached[key] = null;

    // there are dependent keys, so we need to do the work to find out if 
    // any of them or their dependent keys are cached.
    queue = cached[key] = [];
    seen  = SC._TMP_SEEN_SET = (SC._TMP_SEEN_SET || SC.CoreSet.create());
    seen.add(key);
    this._kvo_addCachedDependents(queue, keys, dependents, seen);
    seen.clear(); // reset
    
    if (queue.length === 0) queue = cached[key] = null ; // turns out nothing
    return queue ;
  },
  
  // ..........................................
  // OBSERVERS
  // 
  
  _kvo_for: function(kvoKey, type) {
    var ret = this[kvoKey] ;

    if (!this._kvo_cloned) this._kvo_cloned = {} ;
    
    // if the item does not exist, create it.  Unless type is passed, 
    // assume array.
    if (!ret) {
      ret = this[kvoKey] = (type === undefined) ? [] : type.create();
      this._kvo_cloned[kvoKey] = YES ;
      
    // if item does exist but has not been cloned, then clone it.  Note
    // that all types must implement copy().0
    } else if (!this._kvo_cloned[kvoKey]) {
      ret = this[kvoKey] = ret.copy();
      this._kvo_cloned[kvoKey] = YES; 
    }
    
    return ret ;
  },

  /**  
    Adds an observer on a property.
    
    This is the core method used to register an observer for a property.
    
    Once you call this method, anytime the key's value is set, your observer
    will be notified.  Note that the observers are triggered anytime the
    value is set, regardless of whether it has actually changed.  Your
    observer should be prepared to handle that.
    
    You can also pass an optional context parameter to this method.  The 
    context will be passed to your observer method whenever it is triggered.
    Note that if you add the same target/method pair on a key multiple times
    with different context parameters, your observer will only be called once
    with the last context you passed.
    
    h2. Observer Methods
    
    Observer methods you pass should generally have the following signature if
    you do not pass a "context" parameter:
    
    {{{
      fooDidChange: function(sender, key, value, rev);
    }}}
    
    The sender is the object that changed.  The key is the property that
    changes.  The value property is currently reserved and unused.  The rev
    is the last property revision of the object when it changed, which you can
    use to detect if the key value has really changed or not.
    
    If you pass a "context" parameter, the context will be passed before the
    revision like so:
    
    {{{
      fooDidChange: function(sender, key, value, context, rev);
    }}}
    
    Usually you will not need the value, context or revision parameters at 
    the end.  In this case, it is common to write observer methods that take
    only a sender and key value as parameters or, if you aren't interested in
    any of these values, to write an observer that has no parameters at all.
    
    @param key {String} the key to observer
    @param target {Object} the target object to invoke
    @param method {String|Function} the method to invoke.
    @param context {Object} optional context
    @returns {SC.Object} self
  */
  addObserver: function(key, target, method, context) {
    
    var kvoKey, chain, chains, observers;
    
    // normalize.  if a function is passed to target, make it the method.
    if (method === undefined) {
      method = target; target = this ;
    }
    if (!target) target = this ;
    
    if (typeof method === "string") method = target[method] ;
    if (!method) throw "You must pass a method to addObserver()" ;

    // Normalize key...
    key = key.toString() ;
    if (key.indexOf('.') >= 0) {
      
      // create the chain and save it for later so we can tear it down if 
      // needed.
      chain = SC._ChainObserver.createChain(this, key, target, method, context);
      chain.masterTarget = target;  
      chain.masterMethod = method ;
      
      // Save in set for chain observers.
      this._kvo_for(SC.keyFor('_kvo_chains', key)).push(chain);
      
    // Create observers if needed...
    } else {
      
      // Special case to support reduced properties.  If the property 
      // key begins with '@' and its value is unknown, then try to get its
      // value.  This will configure the dependent keys if needed.
      if ((this[key] === undefined) && (key.indexOf('@') === 0)) {
        this.get(key) ;
      }

      if (target === this) target = null ; // use null for observers only.
      kvoKey = SC.keyFor('_kvo_observers', key);
      this._kvo_for(kvoKey, SC.ObserverSet).add(target, method, context);
      this._kvo_for('_kvo_observed_keys', SC.CoreSet).add(key) ;
    }

    if (this.didAddObserver) this.didAddObserver(key, target, method);
    return this;
  },

  /**
    Remove an observer you have previously registered on this object.  Pass
    the same key, target, and method you passed to addObserver() and your 
    target will no longer receive notifications.
    
    @returns {SC.Observable} reciever
  */
  removeObserver: function(key, target, method) {
    
    var kvoKey, chains, chain, observers, idx ;
    
    // normalize.  if a function is passed to target, make it the method.
    if (method === undefined) {
      method = target; target = this ;
    }
    if (!target) target = this ;
    
    if (typeof method === "string") method = target[method] ;
    if (!method) throw "You must pass a method to removeObserver()" ;

    // if the key contains a '.', this is a chained observer.
    key = key.toString() ;
    if (key.indexOf('.') >= 0) {
      
      // try to find matching chains
      kvoKey = SC.keyFor('_kvo_chains', key);
      if (chains = this[kvoKey]) {
        
        // if chains have not been cloned yet, do so now.
        chains = this._kvo_for(kvoKey) ;
        
        // remove any chains
        idx = chains.length;
        while(--idx >= 0) {
          chain = chains[idx];
          if (chain && (chain.masterTarget===target) && (chain.masterMethod===method)) {
            chains[idx] = chain.destroyChain() ;
          }
        }
      }
      
    // otherwise, just like a normal observer.
    } else {
      if (target === this) target = null ; // use null for observers only.
      kvoKey = SC.keyFor('_kvo_observers', key) ;
      if (observers = this[kvoKey]) {
        // if observers have not been cloned yet, do so now
        observers = this._kvo_for(kvoKey) ;
        observers.remove(target, method) ;
        if (observers.targets <= 0) {
          this._kvo_for('_kvo_observed_keys', SC.CoreSet).remove(key);
        }
      }
    }

    if (this.didRemoveObserver) this.didRemoveObserver(key, target, method);
    return this;
  },
  
  /**
    Returns YES if the object currently has observers registered for a 
    particular key.  You can use this method to potentially defer performing
    an expensive action until someone begins observing a particular property
    on the object.
    
    @param {String} key key to check
    @returns {Boolean}
  */
  hasObserverFor: function(key) {
    SC.Observers.flush(this) ; // hookup as many observers as possible.
    
    var observers = this[SC.keyFor('_kvo_observers', key)],
        locals    = this[SC.keyFor('_kvo_local', key)],
        members ;

    if (locals && locals.length>0) return YES ;
    if (observers && observers.getMembers().length>0) return YES ;
    return NO ;
  },

  /**
    This method will register any observers and computed properties saved on
    the object.  Normally you do not need to call this method youself.  It
    is invoked automatically just before property notifications are sent and
    from the init() method of SC.Object.  You may choose to call this
    from your own initialization method if you are using SC.Observable in
    a non-SC.Object-based object.
    
    This method looks for several private variables, which you can setup,
    to initialize:
    
      - _observers: this should contain an array of key names for observers
        you need to configure.
        
      - _bindings: this should contain an array of key names that configure
        bindings.
        
      - _properties: this should contain an array of key names for computed
        properties.
        
    @returns {Object} this
  */
  initObservable: function() {
    if (this._observableInited) return ;
    this._observableInited = YES ;
    
    var loc, keys, key, value, observer, propertyPaths, propertyPathsLength,
        len, ploc, path, dotIndex, root, propertyKey, keysLen;
    
    // Loop through observer functions and register them
    if (keys = this._observers) {
      len = keys.length ;
      for(loc=0;loc<len;loc++) {
        key = keys[loc]; observer = this[key] ;
        propertyPaths = observer.propertyPaths ;
        propertyPathsLength = (propertyPaths) ? propertyPaths.length : 0 ;
        for(ploc=0;ploc<propertyPathsLength;ploc++) {
          path = propertyPaths[ploc] ;
          dotIndex = path.indexOf('.') ;
          // handle most common case, observing a local property
          if (dotIndex < 0) {
            this.addObserver(path, this, observer) ;

          // next most common case, use a chained observer
          } else if (path.indexOf('*') === 0) {
            this.addObserver(path.slice(1), this, observer) ;
            
          // otherwise register the observer in the observers queue.  This 
          // will add the observer now or later when the named path becomes
          // available.
          } else {
            root = null ;
            
            // handle special cases for observers that look to the local root
            if (dotIndex === 0) {
              root = this; path = path.slice(1) ;
            } else if (dotIndex===4 && path.slice(0,5) === 'this.') {
              root = this; path = path.slice(5) ;
            } else if (dotIndex<0 && path.length===4 && path === 'this') {
              root = this; path = '';
            }
            
            SC.Observers.addObserver(path, this, observer, root); 
          }
        }
      }
    }

    // Add Bindings
    this.bindings = []; // will be filled in by the bind() method.
    if (keys = this._bindings) {
      for(loc=0, keysLen = keys.length; loc < keysLen;loc++) {
        // get propertyKey
        key = keys[loc] ; value = this[key] ;
        propertyKey = key.slice(0,-7) ; // contentBinding => content
        this[key] = this.bind(propertyKey, value) ;
      }
    }

    // Add Properties
    if (keys = this._properties) {
      for(loc=0, keysLen = keys.length; loc<keysLen;loc++) {
        key = keys[loc];
        if (value = this[key]) {

          // activate cacheable only if needed for perf reasons
          if (value.isCacheable) this._kvo_cacheable = YES; 

          // register dependent keys
          if (value.dependentKeys && (value.dependentKeys.length>0)) {
            this.registerDependentKey(key, value.dependentKeys) ;
          }
        }
      }
    }
    
  },
  
  // ..........................................
  // NOTIFICATION
  // 

  /**
    Returns an array with all of the observers registered for the specified
    key.  This is intended for debugging purposes only.  You generally do not
    want to rely on this method for production code.
    
    @params key {String} the key to evaluate
    @returns {Array} array of Observer objects, describing the observer.
  */
  observersForKey: function(key) {
    var observers = this._kvo_for('_kvo_observers', key) ;
    return observers.getMembers() || [] ;
  },
  
  // this private method actually notifies the observers for any keys in the
  // observer queue.  If you pass a key it will be added to the queue.
  _notifyPropertyObservers: function(key) {

    if (!this._observableInited) this.initObservable() ;
    
    SC.Observers.flush(this) ; // hookup as many observers as possible.

    var log = SC.LOG_OBSERVERS && !(this.LOG_OBSERVING===NO),
        observers, changes, dependents, starObservers, idx, keys, rev,
        members, membersLength, member, memberLoc, target, method, loc, func,
        context, spaces, cache ;

    if (log) {
      spaces = SC.KVO_SPACES = (SC.KVO_SPACES || '') + '  ';
      console.log('%@%@: notifying observers after change to key "%@"'.fmt(spaces, this, key));
    }
    
    // Get any starObservers -- they will be notified of all changes.
    starObservers =  this['_kvo_observers_*'] ;
    
    // prevent notifications from being sent until complete
    this._kvo_changeLevel = (this._kvo_changeLevel || 0) + 1; 

    // keep sending notifications as long as there are changes
    while(((changes = this._kvo_changes) && (changes.length > 0)) || key) {
      
      // increment revision
      rev = ++this.propertyRevision ;
      
      // save the current set of changes and swap out the kvo_changes so that
      // any set() calls by observers will be saved in a new set.
      if (!changes) changes = SC.CoreSet.create() ;
      this._kvo_changes = null ;

      // Add the passed key to the changes set.  If a '*' was passed, then
      // add all keys in the observers to the set...
      // once finished, clear the key so the loop will end.
      if (key === '*') {
        changes.add('*') ;
        changes.addEach(this._kvo_for('_kvo_observed_keys', SC.CoreSet));

      } else if (key) changes.add(key) ;

      // Now go through the set and add all dependent keys...
      if (dependents = this._kvo_dependents) {

        // NOTE: each time we loop, we check the changes length, this
        // way any dependent keys added to the set will also be evaluated...
        for(idx=0;idx<changes.length;idx++) {
          key = changes[idx] ;
          keys = dependents[key] ;
          
          // for each dependent key, add to set of changes.  Also, if key
          // value is a cacheable property, clear the cached value...
          if (keys && (loc = keys.length)) {
            if (log) {
              console.log("%@...including dependent keys for %@: %@".fmt(spaces, key, keys));
            }
            cache = this._kvo_cache;
            if (!cache) cache = this._kvo_cache = {};
            while(--loc >= 0) {
              changes.add(key = keys[loc]);
              if (func = this[key]) {
                this[func.cacheKey] = undefined;
                cache[func.cacheKey] = cache[func.lastSetValueKey] = undefined;
              } // if (func=)
            } // while (--loc)
          } // if (keys && 
        } // for(idx...
      } // if (dependents...)

      // now iterate through all changed keys and notify observers.
      while(changes.length > 0) {
        key = changes.pop() ; // the changed key

        // find any observers and notify them...
        observers = this[SC.keyFor('_kvo_observers', key)];
        if (observers) {
          members = observers.getMembers() ;
          membersLength = members.length ;
          for(memberLoc=0;memberLoc < membersLength; memberLoc++) {
            member = members[memberLoc] ;
            if (member[3] === rev) continue ; // skip notified items.

            target = member[0] || this; 
            method = member[1] ; 
            context = member[2];
            member[3] = rev;
            
            if (log) console.log('%@...firing observer on %@ for key "%@"'.fmt(spaces, target, key));
            if (context !== undefined) {
              method.call(target, this, key, null, context, rev);
            } else {
              method.call(target, this, key, null, rev) ;
            }
          }
        }

        // look for local observers.  Local observers are added by SC.Object
        // as an optimization to avoid having to add observers for every 
        // instance when you are just observing your local object.
        members = this[SC.keyFor('_kvo_local', key)];
        if (members) {
          membersLength = members.length ;
          for(memberLoc=0;memberLoc<membersLength;memberLoc++) {
            member = members[memberLoc];
            method = this[member] ; // try to find observer function
            if (method) {
              if (log) console.log('%@...firing local observer %@.%@ for key "%@"'.fmt(spaces, this, member, key));
              method.call(this, this, key, null, rev);
            }
          }
        }
        
        // if there are starObservers, do the same thing for them
        if (starObservers && key !== '*') {          
          members = starObservers.getMembers() ;
          membersLength = members.length ;
          for(memberLoc=0;memberLoc < membersLength; memberLoc++) {
            member = members[memberLoc] ;
            target = member[0] || this; 
            method = member[1] ;
            context = member[2] ;
            
            if (log) console.log('%@...firing * observer on %@ for key "%@"'.fmt(spaces, target, key));
            if (context !== undefined) {
              method.call(target, this, key, null, context, rev);
            } else {
              method.call(target, this, key, null, rev) ;
            }
          }
        }

        // if there is a default property observer, call that also
        if (this.propertyObserver) {
          if (log) console.log('%@...firing %@.propertyObserver for key "%@"'.fmt(spaces, this, key));
          this.propertyObserver(this, key, null, rev);
        }
      } // while(changes.length>0)

      // changes set should be empty. release it for reuse
      if (changes) changes.destroy() ;
      
      // key is no longer needed; clear it to avoid infinite loops
      key = null ; 
      
    } // while (changes)
    
    // done with loop, reduce change level so that future sets can resume
    this._kvo_changeLevel = (this._kvo_changeLevel || 1) - 1; 
    
    if (log) SC.KVO_SPACES = spaces.slice(0, -2);
    
    return YES ; // finished successfully
  },

  // ..........................................
  // BINDINGS
  // 
    
  /**  
    Manually add a new binding to an object.  This is the same as doing
    the more familiar propertyBinding: 'property.path' approach.
    
    @param {String} toKey the key to bind to
    @param {Object} target target or property path to bind from
    @param {String|Function} method method for target to bind from
    @returns {SC.Binding} new binding instance
  */
  bind: function(toKey, target, method) {

    var binding , pathType;

    // normalize...
    if (method !== undefined) target = [target, method];

    // if a string or array (i.e. tuple) is passed, convert this into a
    // binding.  If a binding default was provided, use that.
    pathType = typeof target;
    
    if (pathType === "string" || (pathType === "object" && (target instanceof Array))) {
      binding = this[toKey + 'BindingDefault'] || SC.Binding;
      binding = binding.beget().from(target) ;
    } else binding = target ;

    // finish configuring the binding and then connect it.
    binding = binding.to(toKey, this).connect() ;
    this.bindings.push(binding) ;
    
    return binding ;
  },
  
  /**  
    didChangeFor makes it easy for you to verify that you haven't seen any
    changed values.  You need to use this if your method observes multiple
    properties.  To use this, call it like this:
  
    if (this.didChangeFor('render','height','width')) {
       // DO SOMETHING HERE IF CHANGED.
    }
  */  
  didChangeFor: function(context) { 
    var valueCache, revisionCache, seenValues, seenRevisions, ret,
        currentRevision, idx, key, value;
    context = SC.hashFor(context) ; // get a hash key we can use in caches.
    
    // setup caches...
    valueCache = this._kvo_didChange_valueCache ;
    if (!valueCache) valueCache = this._kvo_didChange_valueCache = {};
    revisionCache = this._kvo_didChange_revisionCache;
    if (!revisionCache) revisionCache=this._kvo_didChange_revisionCache={};

    // get the cache of values and revisions already seen in this context
    seenValues = valueCache[context] || {} ;
    seenRevisions = revisionCache[context] || {} ;
    
    // prepare too loop!
    ret = false ;
    currentRevision = this._kvo_revision || 0  ;
    idx = arguments.length ;
    while(--idx >= 1) {  // NB: loop only to 1 to ignore context arg.
      key = arguments[idx];
      
      // has the kvo revision changed since the last time we did this?
      if (seenRevisions[key] != currentRevision) {
        // yes, check the value with the last seen value
        value = this.get(key) ;
        if (seenValues[key] !== value) {
          ret = true ; // did change!
          seenValues[key] = value;
        }
      }
      seenRevisions[key] = currentRevision;
    }
    
    valueCache[context] = seenValues ;
    revisionCache[context] = seenRevisions ;
    return ret ;
  },



  /**
    Sets the property only if the passed value is different from the
    current value.  Depending on how expensive a get() is on this property,
    this may be more efficient.

    NOTE: By default, the set() method will not set the value unless it has
    changed. However, this check can skipped by setting .property().indempotent(NO)
    setIfChanged() may be useful in this case.

    @param key {String} the key to change
    @param value {Object} the value to change
    @returns {SC.Observable}
  */
  setIfChanged: function(key, value) {
    return (this.get(key) !== value) ? this.set(key, value) : this ;
  },
  
  /**  
    Navigates the property path, returning the value at that point.
    
    If any object in the path is undefined, returns undefined.
  */
  getPath: function(path) {
    var tuple = SC.tupleForPropertyPath(path, this) ;
    if (tuple === null || tuple[0] === null) return undefined ;
    return tuple[0].get(tuple[1]) ;
  },
  
  /**
    Navigates the property path, finally setting the value.
    
    @param path {String} the property path to set
    @param value {Object} the value to set
    @returns {SC.Observable}
  */
  setPath: function(path, value) {
    if (path.indexOf('.') >= 0) {
      var tuple = SC.tupleForPropertyPath(path, this) ;
      if (!tuple || !tuple[0]) return null ;
      tuple[0].set(tuple[1], value) ;
    } else this.set(path, value) ; // shortcut
    return this;
  },

  /**
    Navigates the property path, finally setting the value but only if 
    the value does not match the current value.  This will avoid sending
    unecessary change notifications.
    
    @param path {String} the property path to set
    @param value {Object} the value to set
    @returns {Object} this
  */
  setPathIfChanged: function(path, value) {
    if (path.indexOf('.') >= 0) {
      var tuple = SC.tupleForPropertyPath(path, this) ;
      if (!tuple || !tuple[0]) return null ;
      if (tuple[0].get(tuple[1]) !== value) {
        tuple[0].set(tuple[1], value) ;
      }
    } else this.setIfChanged(path, value) ; // shortcut
    return this;
  },
  
  /** 
    Convenience method to get an array of properties.
    
    Pass in multiple property keys or an array of property keys.  This
    method uses getPath() so you can also pass key paths.

    @returns {Array} Values of property keys.
  */
  getEach: function() {
    var keys = SC.A(arguments),
        ret = [], idx, idxLen;
    for(idx=0, idxLen = keys.length; idx < idxLen;idx++) {
      ret[ret.length] = this.getPath(keys[idx]);
    }
    return ret ;
  },
  
  
  /**  
    Increments the value of a property.
    
    @param key {String} property name
    @param increment {Number} the amount to increment (optional)
    @returns {Number} new value of property
  */
  incrementProperty: function(key,increment) {
    if (!increment) increment = 1;
    this.set(key,(this.get(key) || 0)+increment); 
    return this.get(key) ;
  },

  /**  
    Decrements the value of a property.
    
    @param key {String} property name
    @param increment {Number} the amount to decrement (optional)
    @returns {Number} new value of property
  */
  decrementProperty: function(key,increment) {
    if (!increment) increment = 1;
    this.set(key,(this.get(key) || 0) - increment) ;
    return this.get(key) ;
  },

  /**  
    Inverts a property.  Property should be a bool.
    
    @param key {String} property name
    @param value {Object} optional parameter for "true" value
    @param alt {Object} optional parameter for "false" value
    @returns {Object} new value
  */
  toggleProperty: function(key,value,alt) { 
    if (value === undefined) value = true ;
    if (alt === undefined) alt = false ;
    value = (this.get(key) == value) ? alt : value ;
    this.set(key,value);
    return this.get(key) ;
  },

  /**
    Convenience method to call propertyWillChange/propertyDidChange.
    
    Sometimes you need to notify observers that a property has changed value 
    without actually changing this value.  In those cases, you can use this 
    method as a convenience instead of calling propertyWillChange() and 
    propertyDidChange().
    
    @param key {String} The property key that has just changed.
    @param value {Object} The new value of the key.  May be null.
    @returns {SC.Observable}
  */
  notifyPropertyChange: function(key, value) {
    this.propertyWillChange(key) ;
    this.propertyDidChange(key, value) ;
    return this; 
  },
  
  /**  
    Notifies all of observers of a property changes.
    
    Sometimes when you make a major update to your object, it is cheaper to
    simply notify all observers that their property might have changed than
    to figure out specifically which properties actually did change.
    
    In those cases, you can simply call this method to notify all property
    observers immediately.  Note that this ignores property groups.
    
    @returns {SC.Observable}
  */
  allPropertiesDidChange: function() {
    this._kvo_cache = null; //clear cached props
    this._notifyPropertyObservers('*') ;
    return this ;
  },

  addProbe: function(key) { this.addObserver(key,SC.logChange); },
  removeProbe: function(key) { this.removeObserver(key,SC.logChange); },

  /**
    Logs the named properties to the console.
    
    @param {String...} propertyNames one or more property names
  */
  logProperty: function() {
    var props = SC.$A(arguments),
        prop, propsLen, idx;
    for(idx=0, propsLen = props.length; idx<propsLen; idx++) {
      prop = props[idx] ;
      console.log('%@:%@: '.fmt(SC.guidFor(this), prop), this.get(prop)) ;
    }
  },

  propertyRevision: 1
    
} ;

/** @private used by addProbe/removeProbe */
SC.logChange = function logChange(target, key, value) {
  console.log("CHANGE: %@[%@] =>".fmt(target, key), target.get(key));
};

/**
  Retrieves a property from an object, using get() if the
  object implements SC.Observable.

  @param  {Object}  object  the object to query
  @param  {String}  key the property to retrieve
*/
SC.mixin(SC, {
  get: function(object, key) {
    if (!object) return undefined;
    if (key === undefined) return this[object];
    if (object.get) return object.get(key);
    return object[key];
  }
});

// Make all Array's observable
SC.mixin(Array.prototype, SC.Observable) ;

/* >>>>>>>>>> BEGIN source/system/enumerator.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  An object that iterates over all of the values in an object.  
  
  An instance of this object is returned everytime you call the 
  enumerator() method on an object that implements the SC.Enumerable mixin.
  
  Once you create an enumerator instance, you can call nextObject() on it
  until you can iterated through the entire collection.  Once you have
  exhausted the enumerator, you can reuse it if you want by calling reset().
  
  @since SproutCore 1.0
*/
SC.Enumerator = function(enumerableObject) {
  this.enumerable = enumerableObject ;
  this.reset() ;
  return this ;
} ;

SC.Enumerator.prototype = {
  
  /** 
    Returns the next object in the enumeration or undefined when complete.
    
    @returns {Object} the next object or undefined
  */
  nextObject: function() {
    var index = this._index ;
    var len = this._length;
    if (index >= len) return undefined ; // nothing to do
    
    // get the value
    var ret = this.enumerable.nextObject(index, this._previousObject, this._context) ;
    this._previousObject = ret ;
    this._index = index + 1 ;
    
    if (index >= len) {
      this._context = SC.Enumerator._pushContext(this._context); 
    }
    
    return ret ;
  },
  
  /**
    Resets the enumerator to the beginning.  This is a nice way to reuse
    an existing enumerator. 
    
    @returns {Object} this
  */
  reset: function() {
    var e = this.enumerable ;
    if (!e) throw SC.$error("Enumerator has been destroyed");
    this._length = e.get ? e.get('length') : e.length ;
    var len = this._length;
    this._index = 0;
    this._previousObject = null ;
    this._context = (len > 0) ? SC.Enumerator._popContext() : null;
  },
  
  /**
    Releases the enumerators enumerable object.  You cannot use this object
    anymore.  This is not often needed but it is useful when you need to 
    make sure memory gets cleared.
    
    @returns {Object} null 
  */
  destroy: function() {
    this.enumerable = this._length = this._index = this._previousObject = this._context = null;
  }
  
} ;

/**
  Use this method to manually create a new Enumerator object.  Usually you
  will not access this method directly but instead call enumerator() on the
  item you want to enumerate.

  @param {SC.Enumerable}  enumerableObject enumerable object.
  @returns {SC.Enumerator} the enumerator
*/
SC.Enumerator.create = function(enumerableObject) {
  return new SC.Enumerator(enumerableObject) ;
};

// Private context caching methods.  This avoids recreating lots of context
// objects.

SC.Enumerator._popContext = function() {
  var ret = this._contextCache ? this._contextCache.pop() : null ;
  return ret || {} ;
} ;

SC.Enumerator._pushContext = function(context) {
  this._contextCache = this._contextCache || [] ;
  var cache = this._contextCache;
  cache.push(context);
  return null ;
}; 


/* >>>>>>>>>> BEGIN source/mixins/enumerable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('core') ;
require('system/enumerator');

/*globals Prototype */

/**
  @namespace

  This mixin defines the common interface implemented by enumerable objects 
  in SproutCore.  Most of these methods follow the standard Array iteration
  API defined up to JavaScript 1.8 (excluding language-specific features that
  cannot be emulated in older versions of JavaScript).
  
  This mixin is applied automatically to the Array class on page load, so you
  can use any of these methods on simple arrays.  If Array already implements
  one of these methods, the mixin will not override them.
  
  h3. Writing Your Own Enumerable

  To make your own custom class enumerable, you need two items:
  
  1. You must have a length property.  This property should change whenever
     the number of items in your enumerable object changes.  If you using this
     with an SC.Object subclass, you should be sure to change the length 
     property using set().
     
  2. If you must implement nextObject().  See documentation.
    
  Once you have these two methods implement, apply the SC.Enumerable mixin
  to your class and you will be able to enumerate the contents of your object
  like any other collection.
  
  h3. Using SproutCore Enumeration with Other Libraries
  
  Many other libraries provide some kind of iterator or enumeration like
  facility.  This is often where the most common API conflicts occur. 
  SproutCore's API is designed to be as friendly as possible with other 
  libraries by implementing only methods that mostly correspond to the
  JavaScript 1.8 API.  
  
  @since SproutCore 1.0
*/
SC.Enumerable = {

  /** 
    Walk like a duck.
    
    @property {Boolean}
  */
  isEnumerable: YES,
  
  /**
    Implement this method to make your class enumerable.
    
    This method will be call repeatedly during enumeration.  The index value
    will always begin with 0 and increment monotonically.  You don't have to
    rely on the index value to determine what object to return, but you should
    always check the value and start from the beginning when you see the
    requested index is 0.
    
    The previousObject is the object that was returned from the last call
    to nextObject for the current iteration.  This is a useful way to 
    manage iteration if you are tracing a linked list, for example.
    
    Finally the context paramter will always contain a hash you can use as 
    a "scratchpad" to maintain any other state you need in order to iterate
    properly.  The context object is reused and is not reset between 
    iterations so make sure you setup the context with a fresh state whenever
    the index parameter is 0.
    
    Generally iterators will continue to call nextObject until the index
    reaches the your current length-1.  If you run out of data before this 
    time for some reason, you should simply return undefined.
    
    The default impementation of this method simply looks up the index.
    This works great on any Array-like objects.
    
    @param index {Number} the current index of the iteration
    @param previousObject {Object} the value returned by the last call to nextObject.
    @param context {Object} a context object you can use to maintain state.
    @returns {Object} the next object in the iteration or undefined   
  */ 
  nextObject: function(index, previousObject, context) {
    return this.objectAt ? this.objectAt(index) : this[index] ;
  },
  
  /**
    Helper method returns the first object from a collection.  This is usually
    used by bindings and other parts of the framework to extract a single 
    object if the enumerable contains only one item.
    
    If you override this method, you should implement it so that it will 
    always return the same value each time it is called.  If your enumerable
    contains only one object, this method should always return that object.
    If your enumerable is empty, this method should return undefined.
    
    @returns {Object} the object or undefined
  */
  firstObject: function() {
    if (this.get('length')===0) return undefined ;
    if (this.objectAt) return this.objectAt(0); // support arrays out of box
    
    // handle generic enumerables
    var context = SC.Enumerator._popContext(), ret;
    ret = this.nextObject(0, null, context);
    context = SC.Enumerator._pushContext(context);  
    return ret ;
  }.property(),
  
  /**
    Helper method returns the last object from a collection.
    
    @returns {Object} the object or undefined
  */
  lastObject: function() {
    var len = this.get('length');
    if (len===0) return undefined ;
    if (this.objectAt) return this.objectAt(len-1); // support arrays out of box
  }.property(),
  
  /**
    Returns a new enumerator for this object.  See SC.Enumerator for
    documentation on how to use this object.  Enumeration is an alternative
    to using one of the other iterators described here.
    
    @returns {SC.Enumerator} an enumerator for the receiver
  */
  enumerator: function() { return SC.Enumerator.create(this); },
  
  /**
    Iterates through the enumerable, calling the passed function on each
    item.  This method corresponds to the forEach() method defined in 
    JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Object} this
  */
  forEach: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      callback.call(target, next, idx, this);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return this ;
  },
  
  /**
    Retrieves the named value on each member object.  This is more efficient
    than using one of the wrapper methods defined here.  Objects that 
    implement SC.Observable will use the get() method, otherwise the property
    will be accessed directly.
    
    @param {String} key the key to retrieve
    @returns {Array} extracted values
  */
  getEach: function(key) {
    return this.map(function(next) {
      return next ? (next.get ? next.get(key) : next[key]) : null;
    }, this);
  },

  /**
    Sets the value on the named property for each member.  This is more
    efficient than using other methods defined on this helper.  If the object
    implements SC.Observable, the value will be changed to set(), otherwise
    it will be set directly.  null objects are skipped.
    
    @param {String} key the key to set
    @param {Object} value the object to set
    @returns {Object} receiver
  */
  setEach: function(key, value) {
    this.forEach(function(next) {
      if (next) {
        if (next.set) next.set(key, value) ;
        else next[key] = value ;
      }
    }, this);
    return this ;
  },
  
  /**
    Maps all of the items in the enumeration to another value, returning 
    a new array.  This method corresponds to map() defined in JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the mapped value.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Array} The mapped array.
  */
  map: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      ret[idx] = callback.call(target, next, idx, this) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Similar to map, this specialized function returns the value of the named
    property on all items in the enumeration.
    
    @params key {String} name of the property
    @returns {Array} The mapped array.
  */
  mapProperty: function(key) {
    return this.map(function(next) { 
      return next ? (next.get ? next.get(key) : next[key]) : null;
    });
  },

  /**
    Returns an array with all of the items in the enumeration that the passed
    function returns YES for. This method corresponds to filter() defined in 
    JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the YES to include the item in the results, NO otherwise.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Array} A filtered array.
  */
  filter: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(callback.call(target, next, idx, this)) ret.push(next) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /** 
    Returns an array sorted by the value of the passed key parameters.
    null objects will be sorted first.  You can pass either an array of keys
    or multiple parameters which will act as key names
    
    @param {String} key one or more key names
    @returns {Array}
  */
  sortProperty: function(key) {
    var keys = (typeof key === SC.T_STRING) ? arguments : key,
        len  = keys.length,
        src;
     
    // get the src array to sort   
    if (this instanceof Array) src = this;
    else {
      src = [];
      this.forEach(function(i) { src.push(i); });
    }
    
    if (!src) return [];
    return src.sort(function(a,b) {
      var idx, key, aValue, bValue, ret = 0;
      
      for(idx=0;ret===0 && idx<len;idx++) {
        key = keys[idx];
        aValue = a ? (a.get ? a.get(key) : a[key]) : null;
        bValue = b ? (b.get ? b.get(key) : b[key]) : null;
        ret = SC.compare(aValue, bValue);
      }
      return ret ;
    });
  },
  

  /**
    Returns an array with just the items with the matched property.  You
    can pass an optional second argument with the target value.  Otherwise
    this will match any property that evaluates to true.
    
    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Array} filtered array
  */
  filterProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      var matched = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      if (matched) ret.push(next) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
    
  /**
    Returns the first item in the array for which the callback returns YES.
    This method works similar to the filter() method defined in JavaScript 1.6
    except that it will stop working on the array once a match is found.

    The callback method you provide should have the following signature (all
    parameters are optional):

    {{{
      function(item, index, enumerable) ;      
    }}}

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the YES to include the item in the results, NO otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Object} Found item or null.
  */
  find: function(callback, target) {
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var last = null, next, found = NO, ret = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len && !found;idx++) {
      next = this.nextObject(idx, last, context) ;
      if (found = callback.call(target, next, idx, this)) ret = next ;
      last = next ;
    }
    next = last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns an the first item with a property matching the passed value.  You
    can pass an optional second argument with the target value.  Otherwise
    this will match any property that evaluates to true.
    
    This method works much like the more generic find() method.
    
    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Object} found item or null
  */
  findProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var found = NO, ret = null, last = null, next, cur ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len && !found;idx++) {
      next = this.nextObject(idx, last, context) ;
      cur = next ? (next.get ? next.get(key) : next[key]) : null;
      found = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      if (found) ret = next ;
      last = next ;
    }
    last = next = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
      
  /**
    Returns YES if the passed function returns YES for every item in the
    enumeration.  This corresponds with the every() method in JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the YES or NO.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    h4. Example Usage
    
    {{{
      if (people.every(isEngineer)) { Paychecks.addBigBonus(); }
    }}}
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Boolean} 
  */
  every: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = YES;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;ret && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(!callback.call(target, next, idx, this)) ret = NO ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns YES if the passed property resolves to true for all items in the
    enumerable.  This method is often simpler/faster than using a callback.

    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Array} filtered array
  */
  everyProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = YES;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;ret && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
  
  
  /**
    Returns YES if the passed function returns true for any item in the 
    enumeration. This corresponds with the every() method in JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the YES to include the item in the results, NO otherwise.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    h4. Usage Example
    
    {{{
      if (people.some(isManager)) { Paychecks.addBiggerBonus(); }
    }}}
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Array} A filtered array.
  */
  some: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = NO;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;(!ret) && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(callback.call(target, next, idx, this)) ret = YES ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns YES if the passed property resolves to true for any item in the
    enumerable.  This method is often simpler/faster than using a callback.

    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Boolean} YES 
  */
  someProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = NO;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0; !ret && (idx<len); idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;  // return the invert
  },

  /**
    This will combine the values of the enumerator into a single value. It 
    is a useful way to collect a summary value from an enumeration.  This
    corresponds to the reduce() method defined in JavaScript 1.8.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(previousValue, item, index, enumerable) ;      
    }}}
    
    - *previousValue* is the value returned by the last call to the iterator.
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    Return the new cumulative value.

    In addition to the callback you can also pass an initialValue.  An error
    will be raised if you do not pass an initial value and the enumerator is
    empty.

    Note that unlike the other methods, this method does not allow you to 
    pass a target object to set as this for the callback.  It's part of the
    spec. Sorry.
    
    @params callback {Function} the callback to execute
    @params initialValue {Object} initial value for the reduce
    @params reducerProperty {String} internal use only.  May not be available.
    @returns {Array} A filtered array.
  */
  reduce: function(callback, initialValue, reducerProperty) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;

    // no value to return if no initial value & empty
    if (len===0 && initialValue === undefined) throw new TypeError();
    
    var ret  = initialValue;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      
      // while ret is still undefined, just set the first value we get as ret.
      // this is not the ideal behavior actually but it matches the FireFox
      // implementation... :(
      if (next !== null) {
        if (ret === undefined) {
          ret = next ;
        } else {
          ret = callback.call(null, ret, next, idx, this, reducerProperty);
        }
      }
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    
    // uh oh...we never found a value!
    if (ret === undefined) throw new TypeError() ;
    return ret ;
  },
  
  /**
    Invokes the named method on every object in the receiver that
    implements it.  This method corresponds to the implementation in
    Prototype 1.6.
    
    @param methodName {String} the name of the method
    @param args {Object...} optional arguments to pass as well.
    @returns {Array} return values from calling invoke.
  */
  invoke: function(methodName) {
    var len = this.get ? this.get('length') : this.length ;
    if (len <= 0) return [] ; // nothing to invoke....
    
    var idx;
    
    // collect the arguments
    var args = [] ;
    var alen = arguments.length ;
    if (alen > 1) {
      for(idx=1;idx<alen;idx++) args.push(arguments[idx]) ;
    }
    
    // call invoke
    var ret = [] ;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var method = next ? next[methodName] : null ;
      if (method) ret[idx] = method.apply(next, args) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Invokes the passed method and optional arguments on the receiver elements
    as long as the methods return value matches the target value.  This is 
    a useful way to attempt to apply changes to a collection of objects unless
    or until one fails.

    @param targetValue {Object} the target return value
    @param methodName {String} the name of the method
    @param args {Object...} optional arguments to pass as well.
    @returns {Array} return values from calling invoke.
  */
  invokeWhile: function(targetValue, methodName) {
    var len = this.get ? this.get('length') : this.length ;
    if (len <= 0) return null; // nothing to invoke....

    var idx;

    // collect the arguments
    var args = [] ;
    var alen = arguments.length ;
    if (alen > 2) {
      for(idx=2;idx<alen;idx++) args.push(arguments[idx]) ;
    }
    
    // call invoke
    var ret = targetValue ;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(idx=0;(ret === targetValue) && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      var method = next ? next[methodName] : null ;
      if (method) ret = method.apply(next, args) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
  
  /**
    Simply converts the enumerable into a genuine array.  The order, of
    course, is not gauranteed.  Corresponds to the method implemented by 
    Prototype.
        
    @returns {Array} the enumerable as an array.
  */
  toArray: function() {
    var ret = [];
    this.forEach(function(o) { ret.push(o); }, this);
    return ret ;
  },
  
  /**
    Converts an enumerable into a matrix, with inner arrays grouped based 
    on a particular property of the elements of the enumerable.

    @params key {String} the property to test
    @returns {Array} matrix of arrays
  */        
  groupBy: function(key){
    var len = this.get ? this.get('length') : this.length,
        ret = [],
        last = null,
        context = SC.Enumerator._popContext(),
        grouped = [], 
        keyValues = [];          
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      if(SC.none(grouped[cur])){ grouped[cur] = []; keyValues.push(cur); }
      grouped[cur].push(next);
      last = next;
    }
    last = null;
    context = SC.Enumerator._pushContext(context);
    
    for(var idx=0,len2=keyValues.length; idx < len2; idx++){
      ret.push(grouped[keyValues[idx]]);        
    }
    return ret ;
  }
  
} ;

// Build in a separate function to avoid unintential leaks through closures...
SC._buildReducerFor = function(reducerKey, reducerProperty) {
  return function(key, value) {
    var reducer = this[reducerKey] ;
    if (SC.typeOf(reducer) !== SC.T_FUNCTION) {
      return this.unknownProperty ? this.unknownProperty(key, value) : null;
    } else {
      // Invoke the reduce method defined in enumerable instead of using the
      // one implemented in the receiver.  The receiver might be a native 
      // implementation that does not support reducerProperty.
      var ret = SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
      return ret ;
    }
  }.property('[]') ;
};

SC.Reducers = /** @lends SC.Enumerable */ {
  /**
    This property will trigger anytime the enumerable's content changes.
    You can observe this property to be notified of changes to the enumerables
    content.
    
    For plain enumerables, this property is read only.  SC.Array overrides
    this method.
    
    @property {SC.Array}
  */
  '[]': function(key, value) { return this ; }.property(),

  /**
    Invoke this method when the contents of your enumerable has changed.
    This will notify any observers watching for content changes.  If your are
    implementing an ordered enumerable (such as an array), also pass the 
    start and end values where the content changed so that it can be used to
    notify range observers.
    
    @param {Number} start optional start offset for the content change
    @param {Number} length optional length of change
    @returns {Object} receiver 
  */
  enumerableContentDidChange: function(start, length) {
    this.notifyPropertyChange('[]') ;
    return this ;
  },
  
  /**
    Call this method from your unknownProperty() handler to implement 
    automatic reduced properties.  A reduced property is a property that 
    collects its contents dynamically from your array contents.  Reduced 
    properties always begin with "@".  Getting this property will call 
    reduce() on your array with the function matching the key name as the
    processor.
    
    The return value of this will be either the return value from the 
    reduced property or undefined, which means this key is not a reduced 
    property.  You can call this at the top of your unknownProperty handler
    like so:
    
    {{{
      unknownProperty: function(key, value) {
        var ret = this.handleReduceProperty(key, value) ;
        if (ret === undefined) {
          // process like normal
        }
      }
    }}}
     
    @param {String} key
      the reduce property key
    
    @param {Object} value
      a value or undefined.
    
    @param {Boolean} generateProperty
      only set to false if you do not want an optimized computed property 
      handler generated for this.  Not common.
  
    @returns {Object} the reduced property or undefined
  */
  reducedProperty: function(key, value, generateProperty) {
     
    if (!key || key.charAt(0) !== '@') return undefined ; // not a reduced property
    
    // get the reducer key and the reducer
    var matches = key.match(/^@([^(]*)(\(([^)]*)\))?$/) ;
    if (!matches || matches.length < 2) return undefined ; // no match
    
    var reducerKey = matches[1]; // = 'max' if key = '@max(balance)'
    var reducerProperty = matches[3] ; // = 'balance' if key = '@max(balance)'
    reducerKey = "reduce" + reducerKey.slice(0,1).toUpperCase() + reducerKey.slice(1);
    var reducer = this[reducerKey] ;

    // if there is no reduce function defined for this key, then we can't 
    // build a reducer for it.
    if (SC.typeOf(reducer) !== SC.T_FUNCTION) return undefined;
    
    // if we can't generate the property, just run reduce
    if (generateProperty === NO) {
      return SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
    }

    // ok, found the reducer.  Let's build the computed property and install
    var func = SC._buildReducerFor(reducerKey, reducerProperty);
    var p = this.constructor.prototype ;
    
    if (p) {
      p[key] = func ;
      
      // add the function to the properties array so that new instances
      // will have their dependent key registered.
      var props = p._properties || [] ;
      props.push(key) ;
      p._properties = props ;
      this.registerDependentKey(key, '[]') ;
    }
    
    // and reduce anyway...
    return SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
  },
  
  /** 
    Reducer for @max reduced property.
  */
  reduceMax: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    if (previousValue === null) return item ;
    return (item > previousValue) ? item : previousValue ;
  },

  /** 
    Reducer for @maxObject reduced property.
  */
  reduceMaxObject: function(previousItem, item, index, e, reducerProperty) {
    
    // get the value for both the previous and current item.  If no
    // reducerProperty was supplied, use the items themselves.
    var previousValue = previousItem, itemValue = item ;
    if (reducerProperty) {
      if (item) {
        itemValue = item.get ? item.get(reducerProperty) : item[reducerProperty] ;
      }
      
      if (previousItem) {
        previousValue = previousItem.get ? previousItem.get(reducerProperty) : previousItem[reducerProperty] ;
      }
    }
    if (previousValue === null) return item ;
    return (itemValue > previousValue) ? item : previousItem ;
  },

  /** 
    Reducer for @min reduced property.
  */
  reduceMin: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    if (previousValue === null) return item ;
    return (item < previousValue) ? item : previousValue ;
  },

  /** 
    Reducer for @maxObject reduced property.
  */
  reduceMinObject: function(previousItem, item, index, e, reducerProperty) {

    // get the value for both the previous and current item.  If no
    // reducerProperty was supplied, use the items themselves.
    var previousValue = previousItem, itemValue = item ;
    if (reducerProperty) {
      if (item) {
        itemValue = item.get ? item.get(reducerProperty) : item[reducerProperty] ;
      }
      
      if (previousItem) {
        previousValue = previousItem.get ? previousItem.get(reducerProperty) : previousItem[reducerProperty] ;
      }
    }
    if (previousValue === null) return item ;
    return (itemValue < previousValue) ? item : previousItem ;
  },

  /** 
    Reducer for @average reduced property.
  */
  reduceAverage: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    var ret = (previousValue || 0) + item ;
    var len = e.get ? e.get('length') : e.length;
    if (index >= len-1) ret = ret / len; //avg after last item.
    return ret ; 
  },

  /** 
    Reducer for @sum reduced property.
  */
  reduceSum: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    return (previousValue === null) ? item : previousValue + item ;
  }
} ;

// Apply reducers...
SC.mixin(SC.Enumerable, SC.Reducers) ;
SC.mixin(Array.prototype, SC.Reducers) ;
Array.prototype.isEnumerable = YES ;

// ......................................................
// ARRAY SUPPORT
//

// Implement the same enhancements on Array.  We use specialized methods
// because working with arrays are so common.
(function() {
  
  // These methods will be applied even if they already exist b/c we do it
  // better.
  var alwaysMixin = {
    
    // this is supported so you can get an enumerator.  The rest of the
    // methods do not use this just to squeeze every last ounce of perf as
    // possible.
    nextObject: SC.Enumerable.nextObject,
    enumerator: SC.Enumerable.enumerator,
    firstObject: SC.Enumerable.firstObject,
    lastObject: SC.Enumerable.lastObject,
    sortProperty: SC.Enumerable.sortProperty,
    
    // see above...
    mapProperty: function(key) {
      var len = this.length ;
      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret[idx] = next ? (next.get ? next.get(key) : next[key]) : null;
      }
      return ret ;
    },

    filterProperty: function(key, value) {
      var len = this.length ;
      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        var matched = (value === undefined) ? !!cur : SC.isEqual(cur, value);
        if (matched) ret.push(next) ;
      }
      return ret ;
    },    

    //returns a matrix
    groupBy: function(key) {
      var len = this.length,
          ret = [],
          grouped = [], 
          keyValues = [];          
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        if(SC.none(grouped[cur])){ grouped[cur] = []; keyValues.push(cur); }
        grouped[cur].push(next);
      }
      for(var idx=0,len2=keyValues.length; idx < len2; idx++){
        ret.push(grouped[keyValues[idx]]);        
      }
      return ret ;
    },    

    
    find: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var next, ret = null, found = NO;
      for(var idx=0;idx<len && !found;idx++) {
        next = this[idx] ;
        if(found = callback.call(target, next, idx, this)) ret = next ;
      }
      next = null;
      return ret ;
    },

    findProperty: function(key, value) {
      var len = this.length ;
      var next, cur, found=NO, ret=null;
      for(var idx=0;idx<len && !found;idx++) {
        cur = (next=this[idx]) ? (next.get ? next.get(key): next[key]):null;
        found = (value === undefined) ? !!cur : SC.isEqual(cur, value);
        if (found) ret = next ;
      }
      next=null;
      return ret ;
    },    

    everyProperty: function(key, value) {
      var len = this.length ;
      var ret  = YES;
      for(var idx=0;ret && (idx<len);idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      }
      return ret ;
    },
    
    someProperty: function(key, value) {
      var len = this.length ;
      var ret  = NO;
      for(var idx=0; !ret && (idx<len); idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      }
      return ret ;  // return the invert
    },
    
    invoke: function(methodName) {
      var len = this.length ;
      if (len <= 0) return [] ; // nothing to invoke....

      var idx;

      // collect the arguments
      var args = [] ;
      var alen = arguments.length ;
      if (alen > 1) {
        for(idx=1;idx<alen;idx++) args.push(arguments[idx]) ;
      }

      // call invoke
      var ret = [] ;
      for(idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var method = next ? next[methodName] : null ;
        if (method) ret[idx] = method.apply(next, args) ;
      }
      return ret ;
    },

    invokeWhile: function(targetValue, methodName) {
      var len = this.length ;
      if (len <= 0) return null ; // nothing to invoke....

      var idx;

      // collect the arguments
      var args = [] ;
      var alen = arguments.length ;
      if (alen > 2) {
        for(idx=2;idx<alen;idx++) args.push(arguments[idx]) ;
      }

      // call invoke
      var ret = targetValue ;
      for(idx=0;(ret === targetValue) && (idx<len);idx++) {
        var next = this[idx] ;
        var method = next ? next[methodName] : null ;
        if (method) ret = method.apply(next, args) ;
      }
      return ret ;
    },

    toArray: function() {
      var len = this.length ;
      if (len <= 0) return [] ; // nothing to invoke....

      // call invoke
      var ret = [] ;
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret.push(next) ;
      }
      return ret ;
    },
    
    getEach: function(key) {
      var ret = [];
      var len = this.length ;
      for(var idx=0;idx<len;idx++) {
        var obj = this[idx];
        ret[idx] = obj ? (obj.get ? obj.get(key) : obj[key]) : null;
      }
      return ret ;
    },
    
    setEach: function(key, value) {
      var len = this.length;
      for(var idx=0;idx<len;idx++) {
        var obj = this[idx];
        if (obj) {
          if (obj.set) {
            obj.set(key, value);
          } else obj[key] = value ;
        }
      }
      return this ;
    }
    
  }; 
  
  // These methods will only be applied if they are not already defined b/c 
  // the browser is probably getting it.
  var mixinIfMissing = {

    forEach: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        callback.call(target, next, idx, this);
      }
      return this ;
    },

    map: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret[idx] = callback.call(target, next, idx, this) ;
      }
      return ret ;
    },

    filter: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        if(callback.call(target, next, idx, this)) ret.push(next) ;
      }
      return ret ;
    },

    every: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = YES;
      for(var idx=0;ret && (idx<len);idx++) {
        var next = this[idx] ;
        if(!callback.call(target, next, idx, this)) ret = NO ;
      }
      return ret ;
    },

    some: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = NO;
      for(var idx=0;(!ret) && (idx<len);idx++) {
        var next = this[idx] ;
        if(callback.call(target, next, idx, this)) ret = YES ;
      }
      return ret ;
    },

    reduce: function(callback, initialValue, reducerProperty) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;

      // no value to return if no initial value & empty
      if (len===0 && initialValue === undefined) throw new TypeError();

      var ret  = initialValue;
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;

        // while ret is still undefined, just set the first value we get as 
        // ret. this is not the ideal behavior actually but it matches the 
        // FireFox implementation... :(
        if (next !== null) {
          if (ret === undefined) {
            ret = next ;
          } else {
            ret = callback.call(null, ret, next, idx, this, reducerProperty);
          }
        }
      }

      // uh oh...we never found a value!
      if (ret === undefined) throw new TypeError() ;
      return ret ;
    }   
  };
  
  // Apply methods if missing...
  for(var key in mixinIfMissing) {
    if (!mixinIfMissing.hasOwnProperty(key)) continue ;
    
    // The mixinIfMissing methods should be applied if they are not defined.
    // If Prototype 1.6 is included, some of these methods will be defined
    // already, but we want to override them anyway in this special case 
    // because our version is faster and functionally identitical.
    if (!Array.prototype[key] || ((typeof Prototype === 'object') && Prototype.Version.match(/^1\.6/))) {
      Array.prototype[key] = mixinIfMissing[key] ;
    }
  }
  
  // Apply other methods...
  SC.mixin(Array.prototype, alwaysMixin) ;
  
})() ;


/* >>>>>>>>>> BEGIN source/system/range_observer.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class

  A RangeObserver is used by Arrays to automatically observe all of the
  objects in a particular range on the array.  Whenever any property on one 
  of those objects changes, it will notify its delegate.  Likewise, whenever
  the contents of the array itself changes, it will notify its delegate and
  possibly update its own registration.

  This implementation uses only SC.Array methods.  It can be used on any 
  object that complies with SC.Array.  You may, however, choose to subclass
  this object in a way that is more optimized for your particular design.
  
  @since SproutCore 1.0
*/
SC.RangeObserver = {

  /** 
    Walk like a duck.
    
    @property {Boolean}
  */
  isRangeObserver: YES,
  
  /** @private */
  toString: function() { 
    var base = this.indexes ? this.indexes.toString() : "SC.IndexSet<..>";
    return base.replace('IndexSet', 'RangeObserver(%@)'.fmt(SC.guidFor(this)));
  },
  
  /**
    Creates a new range observer owned by the source.  The indexSet you pass
    must identify the indexes you are interested in observing.  The passed
    target/method will be invoked whenever the observed range changes.
    
    Note that changes to a range are buffered until the end of a run loop
    unless a property on the record itself changes.
  
    @param {SC.Array} source the source array
    @param {SC.IndexSet} indexSet set of indexes to observer
    @param {Object} target the target
    @param {Function|String} method the method to invoke
    @param {Object} context optional context to include in callback
    @param {Boolean} isDeep if YES, observe property changes as well
    @returns {SC.RangeObserver} instance
  */
  create: function(source, indexSet, target, method, context, isDeep) {
    var ret = SC.beget(this);
    ret.source = source;
    ret.indexes = indexSet ? indexSet.frozenCopy() : null;
    ret.target = target;
    ret.method = method;
    ret.context = context ;
    ret.isDeep  = isDeep || NO ;
    ret.beginObserving();
    return ret ;
  },

  /**
    Create subclasses for the RangeObserver.  Pass one or more attribute
    hashes.  Use this to create customized RangeObservers if needed for your 
    classes.
    
    @param {Hash} attrs one or more attribute hashes
    @returns {SC.RangeObserver} extended range observer class
  */
  extend: function(attrs) {
    var ret = SC.beget(this), args = arguments, len = args.length, idx;
    for(idx=0;idx<len;idx++) SC.mixin(ret, args[idx]);
    return ret ;
  },

  /**
    Destroys an active ranger observer, cleaning up first.
    
    @param {SC.Array} source the source array
    @returns {SC.RangeObserver} receiver
  */
  destroy: function(source) { 
    this.endObserving(); 
    return this; 
  },

  /**
    Updates the set of indexes the range observer applies to.  This will 
    stop observing the old objects for changes and start observing the 
    new objects instead.
    
    @param {SC.Array} source the source array
    @returns {SC.RangeObserver} receiver
  */
  update: function(source, indexSet) {
    if (this.indexes && this.indexes.isEqual(indexSet)) return this ;
    
    this.indexes = indexSet ? indexSet.frozenCopy() : null ;
    this.endObserving().beginObserving();
    return this;
  },
  
  /**
    Configures observing for each item in the current range.  Should update
    the observing array with the list of observed objects so they can be
    torn down later
    
    @returns {SC.RangeObserver} receiver
  */
  beginObserving: function() {
    if (!this.isDeep) return this; // nothing to do
    
    var observing = this.observing;
    if (!observing) observing = this.observing = SC.CoreSet.create();
    
    // cache iterator function to keep things fast
    var func = this._beginObservingForEach;
    if (!func) {
      func = this._beginObservingForEach = function(idx) {
        var obj = this.source.objectAt(idx);
        if (obj && obj.addObserver) {
          observing.push(obj);
          obj._kvo_needsRangeObserver = YES ;
        }
      };
    }
    this.indexes.forEach(func,this);

    // add to pending range observers queue so that if any of these objects
    // change we will have a chance to setup observing on them.
    this.isObserving = NO ;
    SC.Observers.addPendingRangeObserver(this);

    return this;
  },
  
  /** @private
    Called when an object that appears to need range observers has changed.
    Check to see if the range observer contains this object in its list.  If
    it does, go ahead and setup observers on all objects and remove ourself
    from the queue.
  */
  setupPending: function(object) {
    var observing = this.observing ;

    if (this.isObserving || !observing || (observing.get('length')===0)) {
      return YES ;
    } 
    
    if (observing.contains(object)) {
      this.isObserving = YES ;

      // cache iterator function to keep things fast
      var func = this._setupPendingForEach;
      if (!func) {
        var source = this.source,
            method = this.objectPropertyDidChange;

        func = this._setupPendingForEach = function(idx) {
          var obj = this.source.objectAt(idx),
              guid = SC.guidFor(obj),
              key ;
              
          if (obj && obj.addObserver) {
            observing.push(obj);
            obj.addObserver('*', this, method);
            
            // also save idx of object on range observer itself.  If there is
            // more than one idx, convert to IndexSet.
            key = this[guid];
            if (key === undefined || key === null) {
              this[guid] = idx ;
            } else if (key.isIndexSet) {
              key.add(idx);
            } else {
              key = this[guid] = SC.IndexSet.create(key).add(idx);
            }
            
          }
        };
      }
      this.indexes.forEach(func,this);
      return YES ;
      
    } else return NO ;
  },
  
  /**
    Remove observers for any objects currently begin observed.  This is 
    called whenever the observed range changes due to an array change or 
    due to destroying the observer.
    
    @returns {SC.RangeObserver} receiver
  */
  endObserving: function() {
    if (!this.isDeep) return this; // nothing to do
    
    var observing = this.observing;
    
    if (this.isObserving) {
      var meth      = this.objectPropertyDidChange,
          source    = this.source,
          idx, lim, obj;

      if (observing) {
        lim = observing.length;
        for(idx=0;idx<lim;idx++) {
          obj = observing[idx];
          obj.removeObserver('*', this, meth);
          this[SC.guidFor(obj)] = null;
        }
        observing.length = 0 ; // reset
      } 
      
      this.isObserving = NO ;
    }
    
    if (observing) observing.clear(); // empty set.
    return this ;
  },
  
  /**
    Whenever the actual objects in the range changes, notify the delegate
    then begin observing again.  Usually this method will be passed an 
    IndexSet with the changed indexes.  The range observer will only notify
    its delegate if the changed indexes include some of all of the indexes
    this range observer is monitoring.
    
    @param {SC.IndexSet} changes optional set of changed indexes
    @returns {SC.RangeObserver} receiver
  */
  rangeDidChange: function(changes) {
    var indexes = this.indexes;
    if (!changes || !indexes || indexes.intersects(changes)) {
      this.endObserving(); // remove old observers
      this.method.call(this.target, this.source, null, '[]', changes, this.context);
      this.beginObserving(); // setup new ones
    }
    return this ;
  },

  /**
    Whenever an object changes, notify the delegate
    
    @param {Object} the object that changed
    @param {String} key the property that changed
    @returns {SC.RangeObserver} receiver
  */
  objectPropertyDidChange: function(object, key, value, rev) {
    var context = this.context,
        method  = this.method, 
        guid    = SC.guidFor(object),
        index   = this[guid];
      
    // lazily convert index to IndexSet.  
    if (index && !index.isIndexSet) {
      index = this[guid] = SC.IndexSet.create(index).freeze();
    }
    
    if (context) {
      method.call(this.target, this.source, object, key, index, context, rev);
    } else {
      method.call(this.target, this.source, object, key, index, rev);
    }
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// note: SC.Observable also enhances array.  make sure we are called after
// SC.Observable so our version of unknownProperty wins.
sc_require('mixins/observable');
sc_require('mixins/enumerable');
sc_require('system/range_observer');

SC.OUT_OF_RANGE_EXCEPTION = "Index out of range" ;

/**
  @namespace
  
  This module implements Observer-friendly Array-like behavior.  This mixin is 
  picked up by the Array class as well as other controllers, etc. that want to  
  appear to be arrays.
  
  Unlike SC.Enumerable, this mixin defines methods specifically for 
  collections that provide index-ordered access to their contents.  When you
  are designing code that needs to accept any kind of Array-like object, you
  should use these methods instead of Array primitives because these will 
  properly notify observers of changes to the array. 
  
  Although these methods are efficient, they do add a layer of indirection to
  your application so it is a good idea to use them only when you need the 
  flexibility of using both true JavaScript arrays and "virtual" arrays such
  as controllers and collections.
  
  You can use the methods defined in this module to access and modify array 
  contents in a KVO-friendly way.  You can also be notified whenever the 
  membership if an array changes by changing the syntax of the property to
  .observes('*myProperty.[]') .
  
  To support SC.Array in your own class, you must override two
  primitives to use it: replace() and objectAt().  
  
  Note that the SC.Array mixin also incorporates the SC.Enumerable mixin.  All
  SC.Array-like objects are also enumerable.
  
  @extends SC.Enumerable
  @since SproutCore 0.9.0
*/
SC.Array = {
  
  /**
    Walk like a duck - use isSCArray to avoid conflicts
  */
  isSCArray: YES,
  
  /**
    @field {Number} length
    
    Your array must support the length property.  Your replace methods should
    set this property whenever it changes.
  */
  // length: 0,
  
  /**
    This is one of the primitves you must implement to support SC.Array.  You 
    should replace amt objects started at idx with the objects in the passed 
    array.  You should also call this.enumerableContentDidChange() ;
    
    @param {Number} idx 
      Starting index in the array to replace.  If idx >= length, then append to 
      the end of the array.
      
    @param {Number} amt 
      Number of elements that should be removed from the array, starting at 
      *idx*.
      
    @param {Array} objects 
      An array of zero or more objects that should be inserted into the array at 
      *idx* 
  */
  replace: function(idx, amt, objects) {
    throw "replace() must be implemented to support SC.Array" ;
  },
  
  /**
    This is one of the primitives you must implement to support SC.Array.  
    Returns the object at the named index.  If your object supports retrieving 
    the value of an array item using get() (i.e. myArray.get(0)), then you do
    not need to implement this method yourself.
    
    @param {Number} idx
      The index of the item to return.  If idx exceeds the current length, 
      return null.
  */
  objectAt: function(idx) {
    if (idx < 0) return undefined ;
    if (idx >= this.get('length')) return undefined;
    return this.get(idx);
  },
  
  /**
    @field []
    
    This is the handler for the special array content property.  If you get
    this property, it will return this.  If you set this property it a new 
    array, it will replace the current content.
    
    This property overrides the default property defined in SC.Enumerable.
  */
  '[]': function(key, value) {
    if (value !== undefined) {
      this.replace(0, this.get('length'), value) ;
    }  
    return this ;
  }.property(),
  
  /**
    This will use the primitive replace() method to insert an object at the 
    specified index.
    
    @param {Number} idx index of insert the object at.
    @param {Object} object object to insert
  */
  insertAt: function(idx, object) {
    if (idx > this.get('length')) throw SC.OUT_OF_RANGE_EXCEPTION ;
    this.replace(idx,0,[object]) ;
    return this ;
  },
  
  /**
    Remove an object at the specified index using the replace() primitive 
    method.  You can pass either a single index, a start and a length or an
    index set.
    
    If you pass a single index or a start and length that is beyond the 
    length this method will throw an SC.OUT_OF_RANGE_EXCEPTION
    
    @param {Number|SC.IndexSet} start index, start of range, or index set
    @param {Number} length length of passing range
    @returns {Object} receiver
  */
  removeAt: function(start, length) {
    
    var delta = 0, // used to shift range
        empty = [];
    
    if (typeof start === SC.T_NUMBER) {
      
      if ((start < 0) || (start >= this.get('length'))) {
        throw SC.OUT_OF_RANGE_EXCEPTION;
      }
      
      // fast case
      if (length === undefined) {
        this.replace(start,1,empty);
        return this ;
      } else {
        start = SC.IndexSet.create(start, length);
      }
    }
    
    this.beginPropertyChanges();
    start.forEachRange(function(start, length) {
      start -= delta ;
      delta += length ;
      this.replace(start, length, empty); // remove!
    }, this);
    this.endPropertyChanges();
    
    return this ;
  },
    
  /**
    Search the array of this object, removing any occurrences of it.
    @param {object} obj object to remove
  */
  removeObject: function(obj) {
    var loc = this.get('length') || 0;
    while(--loc >= 0) {
      var curObject = this.objectAt(loc) ;
      if (curObject == obj) this.removeAt(loc) ;
    }
    return this ;
  },
  
  /**
    Search the array for the passed set of objects and remove any occurrences
    of the. 
    
    @param {SC.Enumerable} objects the objects to remove
    @returns {SC.Array} receiver
  */
  removeObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.removeObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },
  
  /**
    Push the object onto the end of the array.  Works just like push() but it 
    is KVO-compliant.
  */
  pushObject: function(obj) {
    this.insertAt(this.get('length'), obj) ;
    return obj ;
  },
  
  
  /**
    Add the objects in the passed numerable to the end of the array.  Defers
    notifying observers of the change until all objects are added.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  pushObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.pushObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },

  /**
    Pop object from array or nil if none are left.  Works just like pop() but 
    it is KVO-compliant.
  */
  popObject: function() {
    var len = this.get('length') ;
    if (len === 0) return null ;
    
    var ret = this.objectAt(len-1) ;
    this.removeAt(len-1) ;
    return ret ;
  },
  
  /**
    Shift an object from start of array or nil if none are left.  Works just 
    like shift() but it is KVO-compliant.
  */
  shiftObject: function() {
    if (this.get('length') === 0) return null ;
    var ret = this.objectAt(0) ;
    this.removeAt(0) ;
    return ret ;
  },
  
  /**
    Unshift an object to start of array.  Works just like unshift() but it is 
    KVO-compliant.
  */
  unshiftObject: function(obj) {
    this.insertAt(0, obj) ;
    return obj ;
  },

  
  /**
    Adds the named objects to the beginning of the array.  Defers notifying
    observers until all objects have been added.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  unshiftObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.unshiftObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },
  
  /**  
    Compares each item in the array.  Returns true if they are equal.
  */
  isEqual: function(ary) {
    if (!ary) return false ;
    if (ary == this) return true;
    
    var loc = ary.get('length') ;
    if (loc != this.get('length')) return false ;

    while(--loc >= 0) {
      if (!SC.isEqual(ary.objectAt(loc), this.objectAt(loc))) return false ;
    }
    return true ;
  },
  
  /**
    Generates a new array with the contents of the old array, sans any null
    values.
    
    @returns {Array}
  */
  compact: function() { return this.without(null); },
  
  /**
    Generates a new array with the contents of the old array, sans the passed
    value.
    
    @param {Object} value
    @returns {Array}
  */
  without: function(value) {
    if (this.indexOf(value)<0) return this; // value not present.
    var ret = [] ;
    this.forEach(function(k) { 
      if (k !== value) ret[ret.length] = k; 
    }) ;
    return ret ;
  },

  /**
    Generates a new array with only unique values from the contents of the
    old array.
    
    @returns {Array}
  */
  uniq: function() {
    var ret = [] ;
    this.forEach(function(k){
      if (ret.indexOf(k)<0) ret[ret.length] = k;
    });
    return ret ;
  },
  
  /**
    Returns the largest Number in an array of Numbers. Make sure the array
    only contains values of type Number to get expected result.
    
    Note: This only works for dense arrays.
    
    @returns {Number}
  */
  max: function() {
    return Math.max.apply(Math, this);
  },
  
  /**
    Returns the smallest Number in an array of Numbers. Make sure the array
    only contains values of type Number to get expected result.
    
    Note: This only works for dense arrays.
    
    @returns {Number}
  */
  min: function() {
    return Math.min.apply(Math, this);
  },
  
  rangeObserverClass: SC.RangeObserver,
  
  /**
    Creates a new range observer on the receiver.  The target/method callback
    you provide will be invoked anytime any property on the objects in the 
    specified range changes.  It will also be invoked if the objects in the
    range itself changes also.
    
    The callback for a range observer should have the signature:
    
    {{{
      function rangePropertyDidChange(array, objects, key, indexes, conext)
    }}}
    
    If the passed key is '[]' it means that the object itself changed.
    
    The return value from this method is an opaque reference to the 
    range observer object.  You can use this reference to destroy the 
    range observer when you are done with it or to update its range.
    
    @param {SC.IndexSet} indexes indexes to observe
    @param {Object} target object to invoke on change
    @param {String|Function} method the method to invoke
    @param {Object} context optional context
    @returns {SC.RangeObserver} range observer
  */
  addRangeObserver: function(indexes, target, method, context) {
    var rangeob = this._array_rangeObservers;
    if (!rangeob) rangeob = this._array_rangeObservers = SC.CoreSet.create() ;

    // The first time a range observer is added, cache the current length so
    // we can properly notify observers the first time through
    if (this._array_oldLength===undefined) {
      this._array_oldLength = this.get('length') ;
    }
    
    var C = this.rangeObserverClass ;
    var isDeep = NO; //disable this feature for now
    var ret = C.create(this, indexes, target, method, context, isDeep) ;
    rangeob.add(ret);
    
    // first time a range observer is added, begin observing the [] property
    if (!this._array_isNotifyingRangeObservers) {
      this._array_isNotifyingRangeObservers = YES ;
      this.addObserver('[]', this, this._array_notifyRangeObservers);
    }
    
    return ret ;
  },
  
  /**
    Moves a range observer so that it observes a new range of objects on the 
    array.  You must have an existing range observer object from a call to
    addRangeObserver().
    
    The return value should replace the old range observer object that you
    pass in.
    
    @param {SC.RangeObserver} rangeObserver the range observer
    @param {SC.IndexSet} indexes new indexes to observe
    @returns {SC.RangeObserver} the range observer (or a new one)
  */
  updateRangeObserver: function(rangeObserver, indexes) {
    return rangeObserver.update(this, indexes);
  },

  /**
    Removes a range observer from the receiver.  The range observer must
    already be active on the array.
    
    The return value should replace the old range observer object.  It will
    usually be null.
    
    @param {SC.RangeObserver} rangeObserver the range observer
    @returns {SC.RangeObserver} updated range observer or null
  */
  removeRangeObserver: function(rangeObserver) {
    var ret = rangeObserver.destroy(this);
    var rangeob = this._array_rangeObservers;
    if (rangeob) rangeob.remove(rangeObserver) ; // clear
    return ret ;
  },
  
  /**
    Updates observers with content change.  To support range observers, 
    you must pass three change parameters to this method.  Otherwise this
    method will assume the entire range has changed.
    
    This also assumes you have already updated the length property.
    @param {Number} start the starting index of the change
    @param {Number} amt the final range of objects changed
    @param {Number} delta if you added or removed objects, the delta change
    @returns {SC.Array} receiver
  */
  enumerableContentDidChange: function(start, amt, delta) {
    var rangeob = this._array_rangeObservers, 
        oldlen  = this._array_oldLength,
        newlen, length, changes ;

    this.beginPropertyChanges();    
    this.notifyPropertyChange('length'); // flush caches

    // schedule info for range observers
    if (rangeob && rangeob.length>0) {

      // if no oldLength has been cached, just assume 0
      if (oldlen === undefined) oldlen = 0;    
      this._array_oldLength = newlen = this.get('length');
      
      // normalize input parameters
      // if delta was not passed, assume it is the different between the 
      // new and old length.
      if (start === undefined) start = 0;
      if (delta === undefined) delta = newlen - oldlen ;
      if (delta !== 0 || amt === undefined) {
        length = newlen - start ;
        if (delta<0) length -= delta; // cover removed range as well
      } else {
        length = amt ;
      }
      
      changes = this._array_rangeChanges;
      if (!changes) changes = this._array_rangeChanges = SC.IndexSet.create();
      changes.add(start, length);
    }
    
    this.notifyPropertyChange('[]') ;
    this.endPropertyChanges();
    
    return this ;
  },
  
  /**  @private
    Observer fires whenever the '[]' property changes.  If there are 
    range observers, will notify observers of change.
  */
  _array_notifyRangeObservers: function() {
    var rangeob = this._array_rangeObservers,
        changes = this._array_rangeChanges,
        len     = rangeob ? rangeob.length : 0, 
        idx, cur;
        
    if (len > 0 && changes && changes.length > 0) {
      for(idx=0;idx<len;idx++) rangeob[idx].rangeDidChange(changes);
      changes.clear(); // reset for later notifications
    }
  }
  
} ;

// Add SC.Array to the built-in array before we add SC.Enumerable to SC.Array
// since built-in Array's are already enumerable.
SC.mixin(Array.prototype, SC.Array) ; 
SC.Array = SC.mixin({}, SC.Enumerable, SC.Array) ;

// Add any extra methods to SC.Array that are native to the built-in Array.
/**
  Returns a new array that is a slice of the receiver.  This implementation
  uses the observable array methods to retrieve the objects for the new 
  slice.
  
  @param beginIndex {Integer} (Optional) index to begin slicing from.     
  @param endIndex {Integer} (Optional) index to end the slice at.
  @returns {Array} New array with specified slice
*/
SC.Array.slice = function(beginIndex, endIndex) {
  var ret = []; 
  var length = this.get('length') ;
  if (SC.none(beginIndex)) beginIndex = 0 ;
  if (SC.none(endIndex) || (endIndex > length)) endIndex = length ;
  while(beginIndex < endIndex) ret[ret.length] = this.objectAt(beginIndex++) ;
  return ret ;
}  ;

/**
  Returns the index for a particular object in the index.
  
  @param {Object} object the item to search for
  @param {NUmber} startAt optional starting location to search, default 0
  @returns {Number} index of -1 if not found
*/
SC.Array.indexOf = function(object, startAt) {
  var idx, len = this.get('length');
  
  if (startAt === undefined) startAt = 0;
  else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
  if (startAt < 0) startAt += len;
  
  for(idx=startAt;idx<len;idx++) {
    if (this.objectAt(idx) === object) return idx ;
  }
  return -1;
};

// Some browsers do not support indexOf natively.  Patch if needed
if (!Array.prototype.indexOf) Array.prototype.indexOf = SC.Array.indexOf;

/**
  Returns the last index for a particular object in the index.
  
  @param {Object} object the item to search for
  @param {NUmber} startAt optional starting location to search, default 0
  @returns {Number} index of -1 if not found
*/
SC.Array.lastIndexOf = function(object, startAt) {
  var idx, len = this.get('length');
  
  if (startAt === undefined) startAt = len-1;
  else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
  if (startAt < 0) startAt += len;
  
  for(idx=startAt;idx>=0;idx--) {
    if (this.objectAt(idx) === object) return idx ;
  }
  return -1;
};

// Some browsers do not support lastIndexOf natively.  Patch if needed
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = SC.Array.lastIndexOf;
}

// ......................................................
// ARRAY SUPPORT
//
// Implement the same enhancements on Array.  We use specialized methods
// because working with arrays are so common.
(function() {
  SC.mixin(Array.prototype, {
    
    // primitive for array support.
    replace: function(idx, amt, objects) {
      if (this.isFrozen) throw SC.FROZEN_ERROR ;
      if (!objects || objects.length === 0) {
        this.splice(idx, amt) ;
      } else {
        var args = [idx, amt].concat(objects) ;
        this.splice.apply(this,args) ;
      }
      
      // if we replaced exactly the same number of items, then pass only the
      // replaced range.  Otherwise, pass the full remaining array length 
      // since everything has shifted
      var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;
      this.enumerableContentDidChange(idx, amt, len - amt) ;
      return this ;
    },
    
    // If you ask for an unknown property, then try to collect the value
    // from member items.
    unknownProperty: function(key, value) {
      var ret = this.reducedProperty(key, value) ;
      if ((value !== undefined) && ret === undefined) {
        ret = this[key] = value;
      }
      return ret ;
    }
    
  });
    
  // If browser did not implement indexOf natively, then override with
  // specialized version
  var indexOf = Array.prototype.indexOf;
  if (!indexOf || (indexOf === SC.Array.indexOf)) {
    Array.prototype.indexOf = function(object, startAt) {
      var idx, len = this.length;
      
      if (startAt === undefined) startAt = 0;
      else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0) startAt += len;
      
      for(idx=startAt;idx<len;idx++) {
        if (this[idx] === object) return idx ;
      }
      return -1;
    } ; 
  }
  
  var lastIndexOf = Array.prototype.lastIndexOf ;
  if (!lastIndexOf || (lastIndexOf === SC.Array.lastIndexOf)) {
    Array.prototype.lastIndexOf = function(object, startAt) {
      var idx, len = this.length;
      
      if (startAt === undefined) startAt = len-1;
      else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0) startAt += len;
      
      for(idx=startAt;idx>=0;idx--) {
        if (this[idx] === object) return idx ;
      }
      return -1;
    };
  }
  
})();

/* >>>>>>>>>> BEGIN source/mixins/comparable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  Implements some standard methods for comparing objects. Add this mixin to
  any class you create that can compare its instances.
  
  You should implement the compare() method.
  
  @since SproutCore 1.0
*/
SC.Comparable = {
  
  /**
    walk like a duck. Indicates that the object can be compared.
    
    @type Boolean
  */
  isComparable: YES,
  
  /**
    Override to return the result of the comparison of the two parameters. The
    compare method should return
      -1 if a < b
       0 if a == b
       1 if a > b
    
    Default implementation raises
    an exception.
    
    @param a {Object} the first object to compare
    @param b {Object} the second object to compare
    @returns {Integer} the result of the comparison
  */
  compare: function(a, b) {
    throw "%@.compare() is not implemented".fmt(this.toString());
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/copyable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  Impelements some standard methods for copying an object.  Add this mixin to
  any object you create that can create a copy of itself.  This mixin is 
  added automatically to the built-in array.
  
  You should generally implement the copy() method to return a copy of the 
  receiver.
  
  Note that frozenCopy() will only work if you also implement SC.Freezable.

  @since SproutCore 1.0
*/
SC.Copyable = {
  
  /**
    Walk like a duck.  Indicates that the object can be copied.
    
    @type Boolean
  */
  isCopyable: YES,
  
  /**
    Override to return a copy of the receiver.  Default implementation raises
    an exception.

    @param deep {Boolean} if true, a deep copy of the object should be made
    @returns {Object} copy of receiver
  */
  copy: function(deep) {
    throw "%@.copy() is not implemented";
  },
  
  /**
    If the object implements SC.Freezable, then this will return a new copy 
    if the object is not frozen and the receiver if the object is frozen.  
    
    Raises an exception if you try to call this method on a object that does
    not support freezing.
    
    You should use this method whenever you want a copy of a freezable object
    since a freezable object can simply return itself without actually 
    consuming more memory.
  
    @returns {Object} copy of receiver or receiver
  */
  frozenCopy: function() {
    var isFrozen = this.get ? this.get('isFrozen') : this.isFrozen;
    if (isFrozen === YES) return this;
    else if (isFrozen === undefined) throw "%@ does not support freezing".fmt(this);
    else return this.copy().freeze();
  }
};

// Make Array copyable
SC.mixin(Array.prototype, SC.Copyable);
Array.prototype.copy = function(deep) {
	var ret = this.slice(), idx;
	if (deep) {
      idx = ret.length;
	  while (idx--) ret[idx] = SC.copy(ret[idx], true);
	}
	return ret;
}

/* >>>>>>>>>> BEGIN source/mixins/delegate_support.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  Support methods for the Delegate design pattern.
  
  The Delegate design pattern makes it easy to delegate a portion of your 
  application logic to another object.  This is most often used in views to 
  delegate various application-logic decisions to controllers in order to 
  avoid having to bake application-logic directly into the view itself.
  
  The methods provided by this mixin make it easier to implement this pattern
  but they are not required to support delegates.
  
  h2. The Pattern
  
  The delegate design pattern typically means that you provide a property,
  usually ending in "delegate", that can be set to another object in the 
  system.  
  
  When events occur or logic decisions need to be made that you would prefer
  to delegate, you can call methods on the delegate if it is set.  If the 
  delegate is not set, you should provide some default functionality instead.
  
  Note that typically delegates are not observable, hence it is not necessary
  to use get() to retrieve the value of the delegate.
  
  @since SproutCore 1.0
  
*/
SC.DelegateSupport = {  
  
  /**
    Selects the delegate that implements the specified method name.  Pass one
    or more delegates.  The receiver is automatically included as a default.
    
    This can be more efficient than using invokeDelegateMethod() which has
    to marshall arguments into a delegate call.
    
    @param {String} methodName
    @param {Object...} delegate one or more delegate arguments
    @returns {Object} delegate or null
  */
  delegateFor: function(methodName) {
    var idx = 1,
        len = arguments.length,
        ret ;
        
    while(idx<len) {
      ret = arguments[idx];
      if (ret && ret[methodName] !== undefined) return ret ;
      idx++;      
    }
    
    return (this[methodName] !== undefined) ? this : null;
  },
  
  /**
    Invokes the named method on the delegate that you pass.  If no delegate
    is defined or if the delegate does not implement the method, then a 
    method of the same name on the receiver will be called instead.  
    
    You can pass any arguments you want to pass onto the delegate after the
    delegate and methodName.
    
    @param {Object} delegate a delegate object.  May be null.
    @param {String} methodName a method name
    @param {Object...} args (OPTIONAL) any additional arguments
    
    @returns {Object} value returned by delegate
  */
  invokeDelegateMethod: function(delegate, methodName, args) {
    args = SC.A(arguments); args = args.slice(2, args.length) ;
    if (!delegate || !delegate[methodName]) delegate = this ;
    
    var method = delegate[methodName];
    return method ? method.apply(delegate, args) : null;
  },
  
  /**
    Search the named delegates for the passed property.  If one is found, 
    gets the property value and returns it.  If none of the passed delegates 
    implement the property, search the receiver for the property as well.
    
    @param {String} key the property to get.
    @param {Object} delegate one or more delegate
    @returns {Object} property value or undefined
  */
  getDelegateProperty: function(key, delegate) {
    var idx = 1,
        len = arguments.length,
        ret ;
        
    while(idx<len) {
      ret = arguments[idx++];
      if (ret && ret[key] !== undefined) {
        return ret.get ? ret.get(key) : ret[key] ;
      }
    }
    
    return (this[key] !== undefined) ? this.get(key) : undefined ;
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/freezable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  Standard Error that should be raised when you try to modify a frozen object.
  
  @property {Error}
*/
SC.FROZEN_ERROR = new Error("Cannot modify a frozen object");

/** 
  @namespace
  
  The SC.Freezable mixin implements some basic methods for marking an object
  as frozen.  Once an object is frozen it should be read only.  No changes 
  may be made the internal state of the object.
  
  h2. Enforcement

  To fully support freezing in your subclass, you must include this mixin and
  override any method that might alter any property on the object to instead
  raise an exception.  You can check the state of an object by checking the
  isFrozen property.

  Although future versions of JavaScript may support language-level freezing
  object objects, that is not the case today.  Even if an object is freezable,
  it is still technically possible to modify the object, even though it could
  break other parts of your application that do not expect a frozen object to
  change.  It is, therefore, very important that you always respect the 
  isFrozen property on all freezable objects.
  
  h2. Example

  The example below shows a simple object that implement the SC.Freezable 
  protocol.  
  
  {{{
    Contact = SC.Object.extend(SC.Freezable, {
      
      firstName: null,
      
      lastName: null,
      
      // swaps the names
      swapNames: function() {
        if (this.get('isFrozen')) throw SC.FROZEN_ERROR;
        var tmp = this.get('firstName');
        this.set('firstName', this.get('lastName'));
        this.set('lastName', tmp);
        return this;
      }
      
    });
    
    c = Context.create({ firstName: "John", lastName: "Doe" });
    c.swapNames();  => returns c
    c.freeze();
    c.swapNames();  => EXCEPTION
    
  }}}
  
  h2. Copying
  
  Usually the SC.Freezable protocol is implemented in cooperation with the
  SC.Copyable protocol, which defines a frozenCopy() method that will return
  a frozen object, if the object implements this method as well.
  
*/
SC.Freezable = {
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isFreezable: YES,
  
  /**
    Set to YES when the object is frozen.  Use this property to detect whether
    your object is frozen or not.
    
    @property {Boolean}
  */
  isFrozen: NO,
  
  /**
    Freezes the object.  Once this method has been called the object should
    no longer allow any properties to be edited.
    
    @returns {Object} reciever
  */
  freeze: function() {
    // NOTE: Once someone actually implements Object.freeze() in the browser,
    // add a call to that here also.
    
    if (this.set) this.set('isFrozen', YES);
    else this.isFrozen = YES;
    return this;
  }
    
};


// Add to Array
SC.mixin(Array.prototype, SC.Freezable);

/* >>>>>>>>>> BEGIN source/system/set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/observable') ;
sc_require('mixins/freezable');
sc_require('mixins/copyable');

// IMPORTANT NOTE:  This file actually defines two classes: 
// SC.Set is a fully observable set class documented below. 
// SC._CoreSet is just like SC.Set but is not observable.  This is required
// because SC.Observable is built on using sets and requires sets without 
// observability.
//
// We use pointer swizzling below to swap around the actual definitions so 
// that the documentation will turn out right.  (The docs should only 
// define SC.Set - not SC._CoreSet)

/**
  @class 

  An unordered collection of objects.

  A Set works a bit like an array except that its items are not ordered.  
  You can create a set to efficiently test for membership for an object. You 
  can also iterate through a set just like an array, even accessing objects
  by index, however there is no gaurantee as to their order.
  
  Whether or not property observing is enabled, sets offer very powerful
  notifications of items being added and removed, through the 
  `#js:addSetObserver` and `#js:removeSetObserver` methods; this can be
  very useful, for instance, for filtering or mapping sets.

  Note that SC.Set is a primitive object, like an array.  It does implement
  limited key-value observing support, but it does not extend from SC.Object
  so you should not subclass it.

  Creating a Set
  --------------
  You can create a set like you would most objects using SC.Set.create().  
  Most new sets you create will be empty, but you can also initialize the set 
  with some content by passing an array or other enumerable of objects to the 
  constructor.

  Finally, you can pass in an existing set and the set will be copied.  You
  can also create a copy of a set by calling SC.Set#clone().

      #js
      // creates a new empty set
      var foundNames = SC.Set.create();

      // creates a set with four names in it.
      var names = SC.Set.create(["Charles", "Tom", "Juan", "Alex"]) ; // :P

      // creates a copy of the names set.
      var namesCopy = SC.Set.create(names);

      // same as above.
      var anotherNamesCopy = names.clone();

  Adding/Removing Objects
  -----------------------
  You generally add or remove objects from a set using add() or remove().
  You can add any type of object including primitives such as numbers,
  strings, and booleans.

  Note that objects can only exist one time in a set.  If you call add() on
  a set with the same object multiple times, the object will only be added 
  once.  Likewise, calling remove() with the same object multiple times will
  remove the object the first time and have no effect on future calls until 
  you add the object to the set again.

  Note that you cannot add/remove null or undefined to a set.  Any attempt to
  do so will be ignored.  

  In addition to add/remove you can also call push()/pop().  Push behaves just
  like add() but pop(), unlike remove() will pick an arbitrary object, remove
  it and return it.  This is a good way to use a set as a job queue when you
  don't care which order the jobs are executed in.

  Testing for an Object
  ---------------------
  To test for an object's presence in a set you simply call SC.Set#contains().
  This method tests for the object's hash, which is generally the same as the
  object's guid; however, if you implement the hash() method on the object, it will
  use the return value from that method instead.
  
  Observing changes
  -----------------
  When using `#js:SC.Set` (rather than `#js:SC.CoreSet`), you can observe the
  `#js:"[]"` property to be alerted whenever the content changes.
  
  This is often unhelpful. If you are filtering sets of objects, for instance,
  it is very inefficient to re-filter all of the items each time the set changes.
  It would be better if you could just adjust the filtered set based on what
  was changed on the original set. The same issue applies to merging sets,
  as well.
  
  `#js:SC.Set` and `#js:SC.CoreSet` both offer another method of being observed:
  `#js:addSetObserver` and `#js:removeSetObserver`. These take a single parameter:
  an object which implements `#js:didAddItem(set, item)` and 
  `#js:didRemoveItem(set, item)`.
  
  Whenever an item is added or removed from the set, all objects in the set
  (a SC.CoreSet, actually) of observing objects will be alerted appropriately.
  
  BIG WARNING
  ===========
  SetObservers are not intended to be used "_creatively_"; for instance, do 
  not expect to be alerted immediately to any changes. **While the notifications
  are currently sent out immediately, if we find a fast way to send them at end
  of run loop, we most likely will do so.**

  @extends SC.Enumerable 
  @extends SC.Observable
  @extends SC.Copyable
  @extends SC.Freezable

  @since SproutCore 1.0
*/
SC.Set = SC.mixin({}, 
  SC.Enumerable, 
  SC.Observable, 
  SC.Freezable, 
/** @scope SC.Set.prototype */ {

  /** 
    Creates a new set, with the optional array of items included in the 
    return set.

    @param {SC.Enumerable} items items to add
    @return {SC.Set}
  */
  create: function(items) {
    var ret, idx, pool = SC.Set._pool, isObservable = this.isObservable;
    if (!isObservable && items===undefined && pool.length>0) ret = pool.pop();
    else {
      ret = SC.beget(this);
      if (isObservable) ret.initObservable();
      
      if (items && items.isEnumerable && items.get('length')>0) {

        ret.isObservable = NO; // suspend change notifications
        
        // arrays and sets get special treatment to make them a bit faster
        if (items.isSCArray) {
          idx = items.get ? items.get('length') : items.length;
          while(--idx>=0) ret.add(items.objectAt(idx));
        
        } else if (items.isSet) {
          idx = items.length;
          while(--idx>=0) ret.add(items[idx]);
          
        // otherwise use standard SC.Enumerable API
        } else items.forEach(function(i) { ret.add(i); }, this);
        
        ret.isObservable = isObservable;
      }
    }
    return ret ;
  },
  
  /**
    Walk like a duck
    
    @property {Boolean}
  */
  isSet: YES,
  
  /**
    This property will change as the number of objects in the set changes.

    @property {Number}
  */
  length: 0,

  /**
    Returns the first object in the set or null if the set is empty
    
    @property {Object}
  */
  firstObject: function() {
    return (this.length>0) ? this[0] : undefined ;
  }.property(),
  
  /**
    Clears the set 
    
    @returns {SC.Set}
  */
  clear: function() { 
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    this.length = 0;
    return this ;
  },

  /**
    Call this method to test for membership.
    
    @returns {Boolean}
  */
  contains: function(obj) {

    // because of the way a set is "reset", the guid for an object may 
    // still be stored as a key, but points to an index that is beyond the
    // length.  Therefore the found idx must both be defined and less than
    // the current length.
    if (obj === null) return NO ;
    var idx = this[SC.hashFor(obj)] ;
    return (!SC.none(idx) && (idx < this.length) && (this[idx]===obj)) ;
  },
  
  /**
    Returns YES if the passed object is also a set that contains the same 
    objects as the receiver.
  
    @param {SC.Set} obj the other object
    @returns {Boolean}
  */
  isEqual: function(obj) {
    // fail fast
    if (!obj || !obj.isSet || (obj.get('length') !== this.get('length'))) {
      return NO ;
    }
    
    var loc = this.get('length');
    while(--loc>=0) {
      if (!obj.contains(this[loc])) return NO ;
    }
    
    return YES;
  },
  
  /**
    Adds a set observers. Set observers must implement two methods:
    
    - didAddItem(set, item)
    - didRemoveItem(set, item)
    
    Set observers are, in fact, stored in another set (a CoreSet).
  */
  addSetObserver: function(setObserver) {
    // create set observer set if needed
    if (!this.setObservers) {
      this.setObservers = SC.CoreSet.create();
    }
    
    // add
    this.setObservers.add(setObserver);
  },
  
  /**
    Removes a set observer.
  */
  removeSetObserver: function(setObserver) {
    // if there is no set, there can be no currently observing set observers
    if (!this.setObservers) return;
    
    // remove the set observer. Pretty simple, if you think about it. I mean,
    // honestly.
    this.setObservers.remove(setObserver);
  },

  /**
    Call this method to add an object. performs a basic add.

    If the object is already in the set it will not be added again.

    @param obj {Object} the object to add
    @returns {SC.Set} receiver
  */
  add: function(obj) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    // cannot add null to a set.
    if (obj===null || obj===undefined) return this; 

    // Implementation note:  SC.hashFor() is inlined because sets are
    // fundamental in SproutCore, and the inlined code is ~ 25% faster than
    // calling SC.hashFor() in IE8.
    var hashFunc,
        guid = (obj && (hashFunc = obj.hash) && (typeof hashFunc === SC.T_FUNCTION)) ? hashFunc.call(obj) : SC.guidFor(obj),
        idx  = this[guid],
        len  = this.length;
    if ((idx===null || idx===undefined) || (idx >= len) || (this[idx]!==obj)) {
      this[len] = obj;
      this[guid] = len;
      this.length = len+1;
      if (this.setObservers) this.didAddItem(obj);
    }
    
    if (this.isObservable) this.enumerableContentDidChange();
    
    return this ;
  },

  /**
    Add all the items in the passed array or enumerable

    @returns {SC.Set} receiver
  */
  addEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (!objects || !objects.isEnumerable) {
      throw "%@.addEach must pass enumerable".fmt(this);
    }

    var idx, isObservable = this.isObservable ;
    
    if (isObservable) this.beginPropertyChanges();
    if (objects.isSCArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.add(objects[idx]);
      
    } else objects.forEach(function(i) { this.add(i); }, this);
    if (isObservable) this.endPropertyChanges();
    
    return this ;
  },  

  /**
    Removes the object from the set if it is found.

    If the object is not in the set, nothing will be changed.

    @param obj {Object} the object to remove
    @returns {SC.Set} receiver
  */  
  remove: function(obj) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    // Implementation note:  SC.none() and SC.hashFor() are inlined because
    // sets are fundamental in SproutCore, and the inlined code is ~ 25%
    // faster than calling them "normally" in IE8.
    if (obj === null || obj === undefined) return this ;

    var hashFunc,
        guid = (obj && (hashFunc = obj.hash) && (typeof hashFunc === SC.T_FUNCTION)) ? hashFunc.call(obj) : SC.guidFor(obj),
        idx  = this[guid],
        len  = this.length;

    // not in set.
    // (SC.none is inlined for the reasons given above)
    if ((idx === null || idx === undefined) || (idx >= len) || (this[idx] !== obj)) return this; 

    // clear the guid key
    delete this[guid];

    // to clear the index, we will swap the object stored in the last index.
    // if this is the last object, just reduce the length.
    if (idx < (len-1)) {
      // we need to keep a reference to "obj" so we can alert others below;
      // so, no changing it. Instead, create a temporary variable.
      tmp = this[idx] = this[len-1];
      guid = (tmp && (hashFunc = tmp.hash) && (typeof hashFunc === SC.T_FUNCTION)) ? hashFunc.call(tmp) : SC.guidFor(tmp);
      this[guid] = idx;
    }

    // reduce the length
    this.length = len-1;
    if (this.isObservable) this.enumerableContentDidChange();
    if (this.setObservers) this.didRemoveItem(obj);
    return this ;
  },

  /**
    Removes an arbitrary object from the set and returns it.

    @returns {Object} an object from the set or null
  */
  pop: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    var obj = (this.length > 0) ? this[this.length-1] : null ;
    if (obj) this.remove(obj) ;
    return obj ;
  },

  /**
    Removes all the items in the passed array.

    @returns {SC.Set} receiver
  */
  removeEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (!objects || !objects.isEnumerable) {
      throw "%@.addEach must pass enumerable".fmt(this);
    }

    var idx, isObservable = this.isObservable ;
    
    if (isObservable) this.beginPropertyChanges();
    if (objects.isSCArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.remove(objects[idx]);
    } else objects.forEach(function(i) { this.remove(i); }, this);
    if (isObservable) this.endPropertyChanges();
    
    return this ;
  },  

  /**
   Clones the set into a new set.  

    @returns {SC.Set} new copy
  */
  copy: function() {
    return this.constructor.create(this);    
  },

  /**
    Return a set to the pool for reallocation.

    @returns {SC.Set} receiver
  */
  destroy: function() {
    this.isFrozen = NO ; // unfreeze to return to pool
    if (!this.isObservable) SC.Set._pool.push(this.clear());
    return this;
  },
  
  // .......................................
  // PRIVATE 
  //

  /** @private - optimized */
  forEach: function(iterator, target) {
    var len = this.length;
    if (!target) target = this ;
    for(var idx=0;idx<len;idx++) iterator.call(target, this[idx], idx, this);
    return this ;
  },

  /** @private */
  toString: function() {
    var len = this.length, idx, ary = [];
    for(idx=0;idx<len;idx++) ary[idx] = this[idx];
    return "SC.Set<%@>".fmt(ary.join(',')) ;
  },
  
  /**
    @private
    Alerts set observers that an item has been added.
  */
  didAddItem: function(item) {
    // get the set observers
    var o = this.setObservers;
    
    // return if there aren't any
    if (!o) return;
    
    // loop through and call didAddItem.
    var len = o.length, idx;
    for (idx = 0; idx < len; idx++) o[idx].didAddItem(this, item);
  },
  
  /**
    @private
    Alerts set observers that an item has been removed.
  */
  didRemoveItem: function(item) {
    // get the set observers
    var o = this.setObservers;
    
    // return if there aren't any
    if (!o) return;
    
    // loop through and call didAddItem.
    var len = o.length, idx;
    for (idx = 0; idx < len; idx++) o[idx].didRemoveItem(this, item);
  },
  
  // the pool used for non-observable sets
  _pool: [],

  /** @private */
  isObservable: YES

}) ;

SC.Set.constructor = SC.Set;

// Make SC.Set look a bit more like other enumerables

/** @private */
SC.Set.clone = SC.Set.copy ;

/** @private */
SC.Set.push = SC.Set.unshift = SC.Set.add ;

/** @private */
SC.Set.shift = SC.Set.pop ;

// add generic add/remove enumerable support

/** @private */
SC.Set.addObject = SC.Set.add ;

/** @private */
SC.Set.removeObject = SC.Set.remove;

SC.Set._pool = [];

// ..........................................................
// CORE SET
// 

/** @class

  CoreSet is just like set but not observable.  If you want to use the set 
  as a simple data structure with no observing, CoreSet is slightly faster
  and more memory efficient.
  
  @extends SC.Set
  @since SproutCore 1.0
*/
SC.CoreSet = SC.beget(SC.Set);

/** @private */
SC.CoreSet.isObservable = NO ;

/** @private */
SC.CoreSet.constructor = SC.CoreSet;

/* >>>>>>>>>> BEGIN source/private/observer_queue.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/observable');
sc_require('system/set');

// ........................................................................
// OBSERVER QUEUE
//
// This queue is used to hold observers when the object you tried to observe
// does not exist yet.  This queue is flushed just before any property 
// notification is sent.

/**
  @namespace 
  
  The private ObserverQueue is used to maintain a set of pending observers. 
  This allows you to setup an observer on an object before the object exists.
  
  Whenever the observer fires, the queue will be flushed to connect any 
  pending observers.
  
  @since SproutCore 1.0
*/
SC.Observers = {

  queue: [],
  
  /**
   @private 
  
   Attempt to add the named observer.  If the observer cannot be found, put
   it into a queue for later.
  */
  addObserver: function(propertyPath, target, method, pathRoot) {
    var tuple ;

    // try to get the tuple for this.
    if (typeof propertyPath === "string") {
      tuple = SC.tupleForPropertyPath(propertyPath, pathRoot) ;
    } else {
      tuple = propertyPath; 
    }

    // if a tuple was found, add the observer immediately...
    if (tuple) {
      tuple[0].addObserver(tuple[1],target, method) ;
      
    // otherwise, save this in the queue.
    } else {
      this.queue.push([propertyPath, target, method, pathRoot]) ;
    }
  },

  /** 
    @private 
  
    Remove the observer.  If it is already in the queue, remove it.  Also
    if already found on the object, remove that.
  */
  removeObserver: function(propertyPath, target, method, pathRoot) {
    var idx, queue, tuple, item;
    
    tuple = SC.tupleForPropertyPath(propertyPath, pathRoot) ;
    if (tuple) {
      tuple[0].removeObserver(tuple[1], target, method) ;
    } 

    idx = this.queue.length; queue = this.queue ;
    while(--idx >= 0) {
      item = queue[idx] ;
      if ((item[0] === propertyPath) && (item[1] === target) && (item[2] == method) && (item[3] === pathRoot)) queue[idx] = null ;
    }
  },
  
  /**
    @private 
    
    Range Observers register here to indicate that they may potentially 
    need to start observing.
  */
  addPendingRangeObserver: function(observer) {
    var ro = this.rangeObservers;
    if (!ro) ro = this.rangeObservers = SC.CoreSet.create();
    ro.add(observer);
    return this ;
  },
  
  _TMP_OUT: [],
  
  /** 
    Flush the queue.  Attempt to add any saved observers.
  */
  flush: function(object) { 
       
    // flush any observers that we tried to setup but didn't have a path yet
    var oldQueue = this.queue ;
    if (oldQueue && oldQueue.length > 0) {
      var newQueue = (this.queue = []) ; 
      var idx = oldQueue.length ;
      while(--idx >= 0) {
        var item = oldQueue[idx] ;
        if (!item) continue ;

        var tuple = SC.tupleForPropertyPath(item[0], item[3]);
        if (tuple) {
          tuple[0].addObserver(tuple[1], item[1], item[2]) ;
        } else newQueue.push(item) ;
      }
    }
    
    // if this object needsRangeObserver then see if any pending range 
    // observers need it.
    if (object._kvo_needsRangeObserver) {
      var set = this.rangeObservers,
          len = set ? set.get('length') : 0,
          out = this._TMP_OUT,
          ro;
          
      for(idx=0;idx<len;idx++) {
        ro = set[idx]; // get the range observer
        if (ro.setupPending(object)) {
          out.push(ro); // save to remove later
        }
      }
      
      // remove any that have setup
      if (out.length > 0) set.removeEach(out);
      out.length = 0; // reset
      object._kvo_needsRangeObserver = NO ;
    }
    
  },
  
  /** @private */
  isObservingSuspended: 0,

  _pending: SC.CoreSet.create(),

  /** @private */
  objectHasPendingChanges: function(obj) {
    this._pending.add(obj) ; // save for later
  },

  /** @private */
  // temporarily suspends all property change notifications.
  suspendPropertyObserving: function() {
    this.isObservingSuspended++ ;
  },
  
  // resume change notifications.  This will call notifications to be
  // delivered for all pending objects.
  /** @private */
  resumePropertyObserving: function() {
    var pending ;
    if(--this.isObservingSuspended <= 0) {
      pending = this._pending ;
      this._pending = SC.CoreSet.create() ;
      
      var idx, len = pending.length;
      for(idx=0;idx<len;idx++) {
        pending[idx]._notifyPropertyObservers() ;
      }
      pending.clear();
      pending = null ;
    }
  }
  
} ;

/* >>>>>>>>>> BEGIN source/system/object.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('core') ;
sc_require('mixins/observable') ;
sc_require('private/observer_queue');
sc_require('mixins/array') ;
sc_require('system/set');

/*globals $$sel */

SC.BENCHMARK_OBJECTS = NO;

// ..........................................................
// PRIVATE HELPER METHODS
// 
// Private helper methods.  These are not kept as part of the class
// definition because SC.Object is copied frequently and we want to keep the
// number of class methods to a minimum.

/** @private
  Augments a base object by copying the properties from the extended hash.
  In addition to simply copying properties, this method also performs a 
  number of optimizations that can make init'ing a new object much faster
  including:
  
  - concatenating concatenatedProperties
  - prepping a list of bindings, observers, and dependent keys
  - caching local observers so they don't need to be manually constructed.

  @param {Hash} base hash
  @param {Hash} extension
  @returns {Hash} base hash
*/
SC._object_extend = function _object_extend(base, ext) {
  if (!ext) throw "SC.Object.extend expects a non-null value.  Did you forget to 'sc_require' something?  Or were you passing a Protocol to extend() as if it were a mixin?";

  // set _kvo_cloned for later use
  base._kvo_cloned = null;

  // get some common vars
  var key, idx, len, cur, cprops = base.concatenatedProperties, K = SC.K ;
  var p1,p2;

  // first, save any concat props.  use old or new array or concat
  idx = (cprops) ? cprops.length : 0 ;
  var concats = (idx>0) ? {} : null;
  while(--idx>=0) {
    key = cprops[idx]; p1 = base[key]; p2 = ext[key];

    if (p1) {
      if (!(p1 instanceof Array)) p1 = SC.$A(p1);
      concats[key] = (p2) ? p1.concat(p2) : p2 ;
    } else {
      if (!(p2 instanceof Array)) p2 = SC.$A(p2);
      concats[key] = p2 ;
    }
  }

  // setup arrays for bindings, observers, and properties.  Normally, just
  // save the arrays from the base.  If these need to be changed during 
  // processing, then they will be cloned first.
  var bindings = base._bindings, clonedBindings = NO;
  var observers = base._observers, clonedObservers = NO;
  var properties = base._properties, clonedProperties = NO;
  var paths, pathLoc, local ;

  // outlets are treated a little differently because you can manually 
  // name outlets in the passed in hash. If this is the case, then clone
  // the array first.
  var outlets = base.outlets, clonedOutlets = NO ;
  if (ext.outlets) { 
    outlets = (outlets || SC.EMPTY_ARRAY).concat(ext.outlets);
    clonedOutlets = YES ;
  }

  // now copy properties, add superclass to func.
  for(key in ext) {

    if (key === '_kvo_cloned') continue; // do not copy

    // avoid copying builtin methods
    if (!ext.hasOwnProperty(key)) continue ; 

    // get the value.  use concats if defined
    var value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;

    // Possibly add to a bindings.
    if (key.length > 7 && key.slice(-7) === "Binding") {
      if (!clonedBindings) {
        bindings = (bindings || SC.EMPTY_ARRAY).slice() ;
        clonedBindings = YES ;
      }

      if (bindings === null) bindings = (base._bindings || SC.EMPTY_ARRAY).slice();
      bindings[bindings.length] = key ;

    // Also add observers, outlets, and properties for functions...
    } else if (value && (value instanceof Function)) {

      // add super to funcs.  Be sure not to set the base of a func to 
      // itself to avoid infinite loops.
      if (!value.superclass && (value !== (cur=base[key]))) {
        value.superclass = value.base = cur || K;
      }

      // handle regular observers
      if (value.propertyPaths) {
        if (!clonedObservers) {
          observers = (observers || SC.EMPTY_ARRAY).slice() ;
          clonedObservers = YES ;
        }
        observers[observers.length] = key ;

      // handle local properties
      }
      
      if (paths = value.localPropertyPaths) {
        pathLoc = paths.length;
        while(--pathLoc >= 0) {
          local = base._kvo_for(SC.keyFor('_kvo_local', paths[pathLoc]), SC.CoreSet);
          local.add(key);
          base._kvo_for('_kvo_observed_keys', SC.CoreSet).add(paths[pathLoc]);
        }

      // handle computed properties
      }
      
      if (value.dependentKeys) {
        if (!clonedProperties) {
          properties = (properties || SC.EMPTY_ARRAY).slice() ;
          clonedProperties = YES ;
        }
        properties[properties.length] = key ;

      // handle outlets
      }
      
      if (value.autoconfiguredOutlet) {
        if (!clonedOutlets) {
          outlets = (outlets || SC.EMPTY_ARRAY).slice();
          clonedOutlets = YES ;
        }
        outlets[outlets.length] = key ;          
      }
    }

    // copy property
    base[key] = value ;
  }
  
  // Manually set base on toString() because some JS engines (such as IE8) do
  // not enumerate it
  if (ext.hasOwnProperty('toString')) {
    key = 'toString';
    // get the value.  use concats if defined
    value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;
    if (!value.superclass && (value !== (cur=base[key]))) {
      value.superclass = value.base = cur || K ;
    }
    // copy property
    base[key] = value ;
  }


  // copy bindings, observers, and properties 
  base._bindings = bindings || [];
  base._observers = observers || [] ;
  base._properties = properties || [] ;
  base.outlets = outlets || [];

  return base ;
} ;

/** @class

  Root object for the SproutCore framework.  SC.Object is the root class for
  most classes defined by SproutCore.  It builds on top of the native object
  support provided by JavaScript to provide support for class-like 
  inheritance, automatic bindings, properties observers, and more.  
  
  Most of the classes you define in your application should inherit from 
  SC.Object or one of its subclasses.  If you are writing objects of your
  own, you should read this documentation to learn some of the details of 
  how SC.Object's behave and how they differ from other frameworks.
  
  h2. About SproutCore Classes
  
  JavaScript is not a class-based language.  Instead it uses a type of 
  inheritence inspired by self called "prototypical" inheritance. 
  ...

  h2. Using SproutCore objects with other JavaScript object.
  
  You can create a SproutCore object just like any other object...
  obj = new SC.Object() ;
  
  @extends SC.Observable 
  @since SproutCore 1.0
*/
SC.Object = function(props) { return this._object_init(props); };

SC.mixin(SC.Object, /** @scope SC.Object */ {

  /**
    Adds the passed properties to the object's class definition.  You can 
    pass as many hashes as you want, including Mixins, and they will be 
    added in the order they are passed.

    This is a shorthand for calling SC.mixin(MyClass, props...);
    
    @params {Hash} props the properties you want to add.
    @returns {Object} receiver
  */
  mixin: function(props) {
    var len = arguments.length, loc ;
    for(loc =0;loc<len;loc++) SC.mixin(this, arguments[loc]);
    return this ;
  },

  // ..........................................
  // CREATING CLASSES AND INSTANCES
  //

  /**
    Points to the superclass for this class.  You can use this to trace a
    class hierarchy.
    
    @property {SC.Object}
  */
  superclass: null,
  
  /**
    Creates a new subclass of the receiver, adding any passed properties to
    the instance definition of the new class.  You should use this method
    when you plan to create several objects based on a class with similar 
    properties.

    h2. Init

    If you define an init() method, it will be called when you create 
    instances of your new class.  Since SproutCore uses the init() method to
    do important setup, you must be sure to always call arguments.callee.base.apply(this,arguments) somewhere
    in your init() to allow the normal setup to proceed.

    @params {Hash} props the methods of properties you want to add
    @returns {Class} A new object class
  */
  extend: function(props) {   
    var bench = SC.BENCHMARK_OBJECTS ;
    if (bench) SC.Benchmark.start('SC.Object.extend') ;

    // build a new constructor and copy class methods.  Do this before 
    // adding any other properties so they are not overwritten by the copy.
    var prop, ret = function(props) { return this._object_init(props); } ;
    for(prop in this) {
      if (!this.hasOwnProperty(prop)) continue ;
      ret[prop] = this[prop];
    }
    
    // manually copy toString() because some JS engines do not enumerate it
    if (this.hasOwnProperty('toString')) ret.toString = this.toString;

    // now setup superclass, guid
    ret.superclass = this ;
    SC.generateGuid(ret); // setup guid

    ret.subclasses = SC.Set.create();
    this.subclasses.add(ret); // now we can walk a class hierarchy

    // setup new prototype and add properties to it
    var base = (ret.prototype = SC.beget(this.prototype));
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) SC._object_extend(base, arguments[idx]) ;
    base.constructor = ret; // save constructor

    if (bench) SC.Benchmark.end('SC.Object.extend') ;
    return ret ;
  },

  /**
    Creates a new instance of the class.

    Unlike most frameworks, you do not pass parameters to the init function
    for an object.  Instead, you pass a hash of additional properties you 
    want to have assigned to the object when it is first created.  This is
    functionally like creating an anonymous subclass of the receiver and then
    instantiating it, but more efficient.

    You can use create() like you would a normal constructor in a 
    class-based system, or you can use it to create highly customized 
    singleton objects such as controllers or app-level objects.  This is 
    often more efficient than creating subclasses and then instantiating 
    them.

    You can pass any hash of properties to this method, including mixins.
    
    @param {Hash} props 
      optional hash of method or properties to add to the instance.
      
    @returns {SC.Object} new instance of the receiver class.
  */
  create: function() {
    var C=this, ret = new C(arguments); 
    if (SC.ObjectDesigner) {
      SC.ObjectDesigner.didCreateObject(ret, SC.$A(arguments));
    }
    return ret ; 
  },
  /**
    Walk like a duck.  You can use this to quickly test classes.
    
    @property {Boolean}
  */
  isClass: YES,

  /**
    Set of subclasses that extend from this class.  You can observe this 
    array if you want to be notified when the object is extended.
    
    @property {SC.Set}
  */
  subclasses: SC.Set.create(),
  
  /** @private */
  toString: function() { return SC._object_className(this); },

  // ..........................................
  // PROPERTY SUPPORT METHODS
  //

  /** 
    Returns YES if the receiver is a subclass of the named class.  If the 
    receiver is the class passed, this will return NO since the class is not
    a subclass of itself.  See also kindOf().

    h2. Example
    
    {{{
      ClassA = SC.Object.extend();
      ClassB = ClassA.extend();

      ClassB.subclassOf(ClassA) => YES
      ClassA.subclassOf(ClassA) => NO
    }}}
    
    @param {Class} scClass class to compare
    @returns {Boolean} 
  */
  subclassOf: function(scClass) {
    if (this === scClass) return NO ;
    var t = this ;
    while(t = t.superclass) if (t === scClass) return YES ;
    return NO ;
  },
  
  /**
    Returns YES if the passed object is a subclass of the receiver.  This is 
    the inverse of subclassOf() which you call on the class you want to test.
    
    @param {Class} scClass class to compare
    @returns {Boolean}
  */
  hasSubclass: function(scClass) {
    return (scClass && scClass.subclassOf) ? scClass.subclassOf(this) : NO;
  },

  /**
    Returns YES if the receiver is the passed class or is a subclass of the 
    passed class.  Unlike subclassOf(), this method will return YES if you
    pass the receiver itself, since class is a kind of itself.  See also 
    subclassOf().

    h2. Example

    {{{
      ClassA = SC.Object.extend();
      ClassB = ClassA.extend();

      ClassB.kindOf(ClassA) => YES
      ClassA.kindOf(ClassA) => YES
    }}}
    
    @param {Class} scClass class to compare
    @returns {Boolean} 
  */
  kindOf: function(scClass) { 
    return (this === scClass) || this.subclassOf(scClass) ;
  },
  
  // ..........................................................
  // Designers
  //   
  /**
    This method works just like extend() except that it will also preserve
    the passed attributes.
    
    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.Object subclass to create
    @function
  */ 
  design: function() {
    if (this.isDesign) return this; // only run design one time
    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES ;
    if (SC.ObjectDesigner) {
      SC.ObjectDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret ;
  }
}) ;

// ..........................................
// DEFAULT OBJECT INSTANCE
// 
SC.Object.prototype = {
  
  _kvo_enabled: YES,
  
  /** @private
    This is the first method invoked on a new instance.  It will first apply
    any added properties to the new instance and then calls the real init()
    method.
    
    @param {Array} extensions an array-like object with hashes to apply.
    @returns {Object} receiver
  */
  _object_init: function(extensions) {
    // apply any new properties
    var idx, len = (extensions) ? extensions.length : 0;
    for(idx=0;idx<len;idx++) SC._object_extend(this, extensions[idx]) ;
    SC.generateGuid(this) ; // add guid
    this.init() ; // call real init
    
    // Call 'initMixin' methods to automatically setup modules.
    var inits = this.initMixin; len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);
    
    return this ; // done!
  },
  
  /**
    You can call this method on an object to mixin one or more hashes of 
    properties on the receiver object.  In addition to simply copying 
    properties, this method will also prepare the properties for use in 
    bindings, computed properties, etc.
    
    If you plan to use this method, you should call it before you call
    the inherited init method from SC.Object or else your instance may not 
    function properly.
    
    h2. Example
    
    {{{
      // dynamically apply a mixin specified in an object property
      var MyClass = SC.Object.extend({
         extraMixin: null,
         
         init: function() {
           this.mixin(this.extraMixin);
           arguments.callee.base.apply(this,arguments);
         }
      });
      
      var ExampleMixin = { foo: "bar" };
      
      var instance = MyClass.create({ extraMixin: ExampleMixin }) ;
      
      instance.get('foo') => "bar"
    }}}

    @param {Hash} ext a hash to copy.  Only one.
    @returns {Object} receiver
  */
  mixin: function() {
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) SC.mixin(this, arguments[idx]) ;

    // call initMixin
    for(idx=0;idx<len;idx++) {
      var init = arguments[idx].initMixin ;
      if (init) init.call(this) ;
    }
    return this ;
  },

  /**
    This method is invoked automatically whenever a new object is 
    instantiated.  You can override this method as you like to setup your
    new object.  

    Within your object, be sure to call arguments.callee.base.apply(this,arguments) to ensure that the 
    built-in init method is also called or your observers and computed 
    properties may not be configured.

    Although the default init() method returns the receiver, the return 
    value is ignored.

    @returns {void}
  */
  init: function() {
    this.initObservable();
    return this ;
  },

  /**
    Set to NO once this object has been destroyed. 
    
    @property {Boolean}
  */
  isDestroyed: NO,

  /**
    Call this method when you are finished with an object to teardown its
    contents.  Because JavaScript is garbage collected, you do not usually 
    need to call this method.  However, you may choose to do so for certain
    objects, especially views, in order to let them reclaim memory they 
    consume immediately.

    If you would like to perform additional cleanup when an object is
    finished, you may override this method.  Be sure to call arguments.callee.base.apply(this,arguments).
    
    @returns {SC.Object} receiver
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
    this.set('isDestroyed', YES);

    // destroy any mixins
    var idx, inits = this.destroyMixin, len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);

    return this ;
  },

  /**
    Walk like a duck. Always YES since this is an object and not a class.
    
    @property {Boolean}
  */
  isObject: true,

  /**
    Returns YES if the named value is an executable function.

    @param methodName {String} the property name to check
    @returns {Boolean}
  */
  respondsTo: function( methodName ) {
    return !!(this[methodName] instanceof Function);
  },
  
  /**
    Attemps to invoke the named method, passing the included two arguments.  
    Returns NO if the method is either not implemented or if the handler 
    returns NO (indicating that it did not handle the event).  This method 
    is invoked to deliver actions from menu items and to deliver events.  
    You can override this method to provide additional handling if you 
    prefer.

    @param {String} methodName
    @param {Object} arg1
    @param {Object} arg2
    @returns {Boolean} YES if handled, NO if not handled
  */
  tryToPerform: function(methodName, arg1, arg2) {
    return this.respondsTo(methodName) && (this[methodName](arg1, arg2) !== NO);
  },

  /**  
    EXPERIMENTAL:  You can use this to invoke a superclass implementation in
    any method.  This does not work in Safari 2 or earlier.  If you need to
    target these methods, you should use one of the alternatives below:

    - *With Build Tools:* arguments.callee.base.apply(this,arguments);
    - *Without Build Tools:* arguments.callee.base.apply(this, arguments);
    
    h2. Example
    
    All of the following methods will call the superclass implementation of
    your method:
    
    {{{
      SC.Object.create({
        
        // DOES NOT WORK IN SAFARI 2 OR EARLIER
        method1: function() {
          this.superclass();
        },
        
        // REQUIRES SC-BUILD TOOLS
        method2: function() {
          arguments.callee.base.apply(this,arguments);
        },
        
        // WORKS ANYTIME
        method3: function() {
          arguments.callee.base.apply(this, arguments);
        }
      });
    }}}

    @params args {*args} any arguments you want to pass along.
    @returns {Object} return value from super
  */
  superclass: function(args) {
    var caller = arguments.callee.caller; 
    if (!caller) throw "superclass cannot determine the caller method" ;
    return caller.superclass ? caller.superclass.apply(this, arguments) : null;
  },

  /**  
    returns YES if the receiver is an instance of the named class.  See also
    kindOf().

    h2. Example
    
    {{{
      var ClassA = SC.Object.extend();
      var ClassB = SC.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.instanceOf(ClassA) => YES
      instB.instanceOf(ClassA) => NO
    }}}
    
    @param {Class} scClass the class
    @returns {Boolean}
  */
  instanceOf: function(scClass) {
    return this.constructor === scClass ;  
  },

  /**  
    Returns true if the receiver is an instance of the named class or any 
    subclass of the named class.  See also instanceOf().

    h2. Example
    
    {{{
      var ClassA = SC.Object.extend();
      var ClassB = SC.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.kindOf(ClassA) => YES
      instB.kindOf(ClassA) => YES
    }}}

    @param scClass {Class} the class
    @returns {Boolean}
  */
  kindOf: function(scClass) { return this.constructor.kindOf(scClass); },

  /** @private */
  toString: function() {
    if (!this._object_toString) {
      // only cache the string if the klass name is available
      var klassName = SC._object_className(this.constructor) ;
      var string = "%@:%@".fmt(klassName, SC.guidFor(this));
      if (klassName) this._object_toString = string ;
      else return string ;
    } 
    return this._object_toString ;
  },

  /**  
    Activates any outlet connections in object and syncs any bindings.  This
    method is called automatically for view classes but may be used for any
    object.
    
    @returns {void}
  */
  awake: function(key) {
    var outlets = this.outlets,
        i, len, outlet;
    for (i = 0, len = outlets.length;  i < len;  ++i) {
      outlet = outlets[i];
      this.get(outlet);
    }
    this.bindings.invoke('sync'); 
  },

  /**
    Invokes the passed method or method name one time during the runloop.  You
    can use this method to schedule methods that need to execute but may be 
    too expensive to execute more than once, such as methods that update the
    DOM.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Function|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeOnce: function(method) {
    SC.RunLoop.currentRunLoop.invokeOnce(this, method) ;
    return this ;
  },
  
  /**
    Invokes the passed method once at the beginning of the next runloop, 
    before any other methods (including events) are processed. This is useful
    for situations where you know you need to update something, but due to
    the way the run loop works, you can't actually do the update until the
    run loop has completed.
    
    A simple example is setting the selection on a collection controller to a 
    newly created object. Because the collection controller won't have its
    content collection updated until later in the run loop, setting the 
    selection immediately will have no effect. In this situation, you could do
    this instead:
    
    {{{
      // Creates a new MyRecord object and sets the selection of the
      // myRecord collection controller to the new object.
      createObjectAction: function(sender, evt) {
        // create a new record and add it to the store
        var obj = MyRecord.newRecord() ;
        
        // update the collection controller's selection
        MyApp.myRecordCollectionController.invokeLast( function() {
          this.set('selection', [obj]) ;
        });
      }
    }}}
    
    You can call invokeLast as many times as you like and the method will
    only be invoked once.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Function|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeLast: function(method) {
    SC.RunLoop.currentRunLoop.invokeLast(this, method) ;
    return this ;
  },
  
  /**
    The properties named in this array will be concatenated in subclasses
    instead of replaced.  This allows you to name special properties that
    should contain any values you specify plus values specified by parents.

    It is used by SproutCore and is available for your use, though you 
    should limit the number of properties you include in this list as it 
    adds a slight overhead to new class and instance creation.

    @property {Array}
  */
  concatenatedProperties: ['concatenatedProperties', 'initMixin', 'destroyMixin']  

} ;

// bootstrap the constructor for SC.Object.
SC.Object.prototype.constructor = SC.Object;

// Add observable to mixin
SC.mixin(SC.Object.prototype, SC.Observable) ;

// ..........................................................
// CLASS NAME SUPPORT
// 

/** @private
  This is a way of performing brute-force introspection.  This searches 
  through all the top-level properties looking for classes.  When it finds
  one, it saves the class path name.
*/
function findClassNames() {

  if (SC._object_foundObjectClassNames) return ;
  SC._object_foundObjectClassNames = true ;

  var seen = [] ;
  var detectedSC = false;
  var searchObject = function(root, object, levels) {
    levels-- ;

    // not the fastest, but safe
    if (seen.indexOf(object) >= 0) return ;
    seen.push(object) ;

    for(var key in object) {
      if (key == '__scope__') continue ;
      if (key == 'superclass') continue ;
      if (key == '__SC__') key = 'SC' ;
      if (!key.match(/^[A-Z0-9]/)) continue ;
      if (key == 'SC') {
        if (detectedSC) continue;
        detectedSC = true;
      }

      var path = (root) ? [root,key].join('.') : key ;
      var value = object[key] ;


      switch(SC.typeOf(value)) {
      case SC.T_CLASS:
        if (!value._object_className) value._object_className = path;
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case SC.T_OBJECT:
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case SC.T_HASH:
        if (((root) || (path==='SC')) && (levels>=0)) searchObject(path, value, levels) ;
        break ;

      default:
        break;
      }
    }
  } ;

  // Fix for IE 7 and 8 in order to detect the SC global variable. When you create
  // a global variable in IE, it is not added to the window object like in other
  // browsers. Therefore the searchObject method will not pick it up. So we have to
  // update the window object to have a reference to the global variable. And
  // doing window['SC'] does not work since the global variable already exists. For
  // any object that you create that is used act as a namespace, be sure to create it
  // like so:
  //
  //   window.MyApp = window.MyApp || SC.Object.create({ ... })
  //
  window['__SC__'] = SC;
  searchObject(null, window, 2) ;
}

/**  
  Same as the instance method, but lets you check instanceOf without
  having to first check if instanceOf exists as a method.
  
  @param {Object} scObject the object to check instance of
  @param {Class} scClass the class
  @returns {Boolean} if object1 is instance of class
*/
SC.instanceOf = function(scObject, scClass) {
  return !!(scObject && scObject.constructor === scClass) ;  
} ; 

/**
  Same as the instance method, but lets you check kindOf without having to 
  first check if kindOf exists as a method.
  
  @param {Object} scObject object to check kind of
  @param {Class} scClass the class to check
  @returns {Boolean} if object is an instance of class or subclass
*/
SC.kindOf = function(scObject, scClass) {
  if (scObject && !scObject.isClass) scObject = scObject.constructor;
  return !!(scObject && scObject.kindOf && scObject.kindOf(scClass));
};

/** @private
  Returns the name of this class.  If the name is not known, triggers
  a search.  This can be expensive the first time it is called.
  
  This method is used to allow classes to determine their own name.
*/
SC._object_className = function(obj) {
  if (SC.isReady === NO) return ''; // class names are not available until ready
  if (!obj._object_className) findClassNames() ;
  if (obj._object_className) return obj._object_className ;

  // if no direct classname was found, walk up class chain looking for a 
  // match.
  var ret = obj ;
  while(ret && !ret._object_className) ret = ret.superclass; 
  return (ret && ret._object_className) ? ret._object_className : 'Anonymous';
} ;


/* >>>>>>>>>> BEGIN source/private/chain_observer.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/object');

// ........................................................................
// CHAIN OBSERVER
//

// This is a private class used by the observable mixin to support chained
// properties.

// ChainObservers are used to automatically monitor a property several 
// layers deep.
// org.plan.name = SC._ChainObserver.create({
//    target: this, property: 'org',
//    next: SC._ChainObserver.create({
//      property: 'plan',
//      next: SC._ChainObserver.create({
//        property: 'name', func: myFunc
//      })
//    })
//  })
//
SC._ChainObserver = function(property) {
  this.property = property ;
} ;

// This is the primary entry point.  Configures the chain.
SC._ChainObserver.createChain = function(rootObject, path, target, method, context) {

  // First we create the chain.
  var parts = path.split('.'),
      root  = new SC._ChainObserver(parts[0]),
      tail  = root,
      len   = parts.length;

  for(var idx=1;idx<len;idx++) {
    tail = tail.next = new SC._ChainObserver(parts[idx]) ;
  }
  
  // Now root has the first observer and tail has the last one.
  // Feed the rootObject into the front to setup the chain...
  // do this BEFORE we set the target/method so they will not be triggered.
  root.objectDidChange(rootObject);
  
  // Finally, set the target/method on the tail so that future changes will
  // trigger.
  tail.target = target; tail.method = method ; tail.context = context ;
  
  // and return the root to save
  return root ;
};

SC._ChainObserver.prototype = {
  isChainObserver: true,
  
  // the object this instance is observing
  object: null,
  
  // the property on the object this link is observing.
  property: null,
  
  // if not null, this is the next link in the chain.  Whenever the 
  // current property changes, the next observer will be notified.
  next: null,
  
  // if not null, this is the final target observer.
  target: null,
  
  // if not null, this is the final target method
  method: null,
  
  // invoked when the source object changes.  removes observer on old 
  // object, sets up new observer, if needed.
  objectDidChange: function(newObject) {
    if (newObject === this.object) return; // nothing to do.
    
    // if an old object, remove observer on it.
    if (this.object && this.object.removeObserver) {
      this.object.removeObserver(this.property, this, this.propertyDidChange);
    }
    
    // if a new object, add observer on it...
    this.object = newObject ;
    if (this.object && this.object.addObserver) {
      this.object.addObserver(this.property, this, this.propertyDidChange); 
    }
    
    // now, notify myself that my property value has probably changed.
    this.propertyDidChange() ;
  },
  
  // the observer method invoked when the observed property changes.
  propertyDidChange: function() {
    
    // get the new value
    var object = this.object ;
    var property = this.property ;
    var value = (object && object.get) ? object.get(property) : null ;
    
    // if we have a next object in the chain, notify it that its object 
    // did change...
    if (this.next) this.next.objectDidChange(value) ;
    
    // if we have a target/method, call it.
    var target  = this.target,
        method  = this.method,
        context = this.context ;
    if (target && method) {
      var rev = object ? object.propertyRevision : null ;
      if (context) {
        method.call(target, object, property, value, context, rev);
      } else {
        method.call(target, object, property, value, rev) ;
      }
    } 
  },
  
  // teardown the chain...
  destroyChain: function() {
    
    // remove observer
    var obj = this.object ;
    if (obj && obj.removeObserver) {
      obj.removeObserver(this.property, this, this.propertyDidChange) ;
    }  
    
    // destroy next item in chain
    if (this.next) this.next.destroyChain() ;
    
    // and clear left overs...
    this.next = this.target = this.method = this.object = this.context = null;
    return null ;
  }
  
} ;

/* >>>>>>>>>> BEGIN source/protocols/observable_protocol.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  The SC.ObservableProtocol defines optional methods you can implement on your
  objects.  They will be used if defined but are not required for observing to
  work.
*/
SC.ObservableProtocol = {
  
  /**  
    Generic property observer called whenever a property on the receiver 
    changes.
    
    If you need to observe a large number of properties on your object, it
    is sometimes more efficient to implement this observer only and then to
    handle requests yourself.  Although this observer will be triggered 
    more often than an observer registered on a specific property, it also
    does not need to be registered which can make it faster to setup your 
    object instance.
    
    You will often implement this observer using a switch statement on the
    key parameter, taking appropriate action. 
    
    @param observer {null} no longer used; usually null
    @param target {Object} the target of the change.  usually this
    @param key {String} the name of the property that changed
    @param value {Object} the new value of the property.
    @param revision {Number} a revision you can use to quickly detect changes.
    @returns {void}
  */
  propertyObserver: function(observer,target,key,value, revision) {
    
  }
  
};

/* >>>>>>>>>> BEGIN source/protocols/sparse_array_delegate.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace

  Delegate that provides data for a sparse array.  If you set the delegate for
  a sparse array to an object that implements one or more of these methods,
  they will be invoked by the sparse array to fetch data or to update the 
  array content as needed.
  
  Your object does not need to implement all of these methods, but it should 
  at least implment the sparseArrayDidRequestIndex() method.

  @since SproutCore 1.0
*/
SC.SparseArrayDelegate = {
  
  /**
    Invoked when an object requests the length of the sparse array and the 
    length has not yet been set.  You can implement this method to update 
    the length property of the sparse array immediately or at a later time
    by calling the provideLength() method on the sparse array.
    
    This method will only be called once on your delegate unless you 
    subsequently call provideLength(null) on the array, which will effectively
    "empty" the array and cause the array to invoke the delegate again the
    next time its length is request.
    
    If you do not set a length on the sparse array immediately, it will return
    a length of 0 until you provide the length.
    
    @param {SC.SparseArray} sparseArray the array that needs a length.
    @returns {void}
  */
  sparseArrayDidRequestLength: function(sparseArray) {
    // Default does nothing.
  },
  
  /**
    Invoked when an object requests an index on the sparse array that has not
    yet been set.  You should implement this method to set the object at the
    index using provideObjectsAtIndex() or provideObjectsInRange() on the 
    sparse array.  You can call these methods immediately during this handler
    or you can wait and call them at a later time once you have loaded any 
    data.
    
    This method will only be called when an index is requested on the sparse
    array that has not yet been filled.  If you have filled an index or range
    and you would like to reset it, call the objectsDidChangeInRange() method
    on the sparse array.
    
    Note that if you implement the sparseArrayDidRequestRange() method, that
    method will be invoked instead of this one whenever possible to allow you
    to fill in the array with the most efficiency possible.
    
    @param {SC.SparseArray} sparseArray the sparse array
    @param {Number} index the requested index
    @returns {void}
  */
  sparseArrayDidRequestIndex: function(sparseArray, index) {
    
  },
  
  /**
    Alternative method invoked when an object requests an index on the 
    sparse array that has not yet been set.  If you set the 
    rangeWindowSize property on the Sparse Array, then all object index 
    requests will be expanded to to nearest range window and then this 
    method will be called with that range.
    
    You should fill in the passed range by calling the provideObjectsInRange()
    method on the sparse array.
    
    If you do not implement this method but set the rangeWindowSize anyway,
    then the sparseArrayDidRequestIndex() method will be invoked instead.
  
    Note that the passed range is a temporary object.  Be sure to clone it if
    you want to keep the range for later use.
    
    @param {SC.SparseArray} sparseArray the sparse array
    @param {Range} range read only range.
    @returns {void}
  */
  sparseArrayDidRequestRange: function(sparseArray, range) {
    
  },
  
  /**
    Optional delegate method you can use to determine the index of a 
    particular object.  If you do not implement this method, then the 
    sparse array will just search the objects it has loaded already.
    
    @param {SC.SparseArray} sparseArray the sparse array
    @param {Object} object the object to find the index of
    @return {Number} the index or -1
    @returns {void}
  */
  sparseArrayDidRequestIndexOf: function(sparseArray, object) {
    
  },
  
  /**
    Optional delegate method invoked whenever the sparse array attempts to 
    changes its contents.  If you do not implement this method or if you 
    return NO from this method, then the edit will not be allowed.
    
    @param {SC.SparseArray} sparseArray the sparse array
    @param {Number} idx the starting index to replace
    @param {Number} amt the number if items to replace
    @param {Array} objects the array of objects to insert
    @returns {Boolean} YES to allow replace, NO to deny
  */
  sparseArrayShouldReplace: function(sparseArray, idx, amt, objects) {
    return NO ;
  },
  
  /**
    Invoked whenever the sparse array is reset.  Resetting a sparse array 
    will cause it to flush its content and go back to the delegate for all
    property requests again.
    
    @param {SC.SparseArray} sparseArray the sparse array
    @returns {void}
  */
  sparseArrayDidReset: function(sparseArray) { 
  }
};

/* >>>>>>>>>> BEGIN source/system/binding.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/object') ;

/**
  Debug parameter you can turn on.  This will log all bindings that fire to
  the console.  This should be disabled in production code.  Note that you
  can also enable this from the console or temporarily.
  
  @property {Boolean}
*/
SC.LOG_BINDINGS = NO ;

/**
  Performance paramter.  This will benchmark the time spent firing each 
  binding.
  
  @property {Boolean}
*/
SC.BENCHMARK_BINDING_NOTIFICATIONS = NO ;

/**
  Performance parameter.  This will benchmark the time spend configuring each
  binding.  
  
  @property {Boolean}
*/
SC.BENCHMARK_BINDING_SETUP = NO;
  
/** 
  Default placeholder for multiple values in bindings.
  
  @property {String}
*/
SC.MULTIPLE_PLACEHOLDER = '@@MULT@@' ;

/**
  Default placeholder for null values in bindings.
  
  @property {String}
*/
SC.NULL_PLACEHOLDER = '@@NULL@@' ;

/**
  Default placeholder for empty values in bindings.
  
  @property {String}
*/
SC.EMPTY_PLACEHOLDER = '@@EMPTY@@' ;


/**
  @namespace 
  
  A binding simply connects the properties of two objects so that whenever the
  value of one property changes, the other property will be changed also.  You
  do not usually work with Binding objects directly but instead describe
  bindings in your class definition using something like:
  
  {{{
    valueBinding: "MyApp.someController.title"
  }}}
    
  This will create a binding from "MyApp.someController.title" to the "value"
  property of your object instance automatically.  Now the two values will be
  kept in sync.
  
  h2. Customizing Your Bindings
  
  In addition to synchronizing values, bindings can also perform some basic 
  transforms on values.  These transforms can help to make sure the data fed 
  into one object always meets the expectations of that object regardless of
  what the other object outputs.
  
  To customize a binding, you can use one of the many helper methods defined 
  on SC.Binding like so:
  
  {{{
    valueBinding: SC.Binding.single("MyApp.someController.title") 
  }}}
    
  This will create a binding just like the example above, except that now the
  binding will convert the value of MyApp.someController.title to a single 
  object (removing any arrays) before applying it to the "value" property of
  your object.
  
  You can also chain helper methods to build custom bindings like so:
  
  {{{
    valueBinding: SC.Binding.single("MyApp.someController.title").notEmpty("(EMPTY)")
  }}}
    
  This will force the value of MyApp.someController.title to be a single value
  and then check to see if the value is "empty" (null, undefined, empty array,
  or an empty string).  If it is empty, the value will be set to the string 
  "(EMPTY)".
  
  h2. One Way Bindings
  
  One especially useful binding customization you can use is the oneWay() 
  helper.  This helper tells SproutCore that you are only interested in 
  receiving changes on the object you are binding from.  For example, if you
  are binding to a preference and you want to be notified if the preference 
  has changed, but your object will not be changing the preference itself, you
  could do:
  
  {{{
    bigTitlesBinding: SC.Binding.oneWay("MyApp.preferencesController.bigTitles")
  }}}
    
  This way if the value of MyApp.preferencesController.bigTitles changes the
  "bigTitles" property of your object will change also.  However, if you 
  change the value of your "bigTitles" property, it will not update the 
  preferencesController.
  
  One way bindings are almost twice as fast to setup and twice as fast to 
  execute because the binding only has to worry about changes to one side.
  
  You should consider using one way bindings anytime you have an object that 
  may be created frequently and you do not intend to change a property; only 
  to monitor it for changes. (such as in the example above).
      
  h2. Adding Custom Transforms
  
  In addition to using the standard helpers provided by SproutCore, you can 
  also defined your own custom transform functions which will be used to 
  convert the value.  To do this, just define your transform function and add
  it to the binding with the transform() helper.  The following example will 
  not allow Integers less than ten.  Note that it checks the value of the 
  bindings and allows all other values to pass:
  
  {{{
    valueBinding: SC.Binding.transform(function(value, binding) {
      return ((SC.typeOf(value) === SC.T_NUMBER) && (value < 10)) ? 10 : value;      
    }).from("MyApp.someController.value")
  }}}
  
  If you would like to instead use this transform on a number of bindings,
  you can also optionally add your own helper method to SC.Binding.  This
  method should simply return the value of this.transform(). The example 
  below adds a new helper called notLessThan() which will limit the value to
  be not less than the passed minimum:
  
  {{{
    SC.Binding.notLessThan = function(minValue) {
      return this.transform(function(value, binding) {
        return ((SC.typeOf(value) === SC.T_NUMBER) && (value < minValue)) ? minValue : value ;
      }) ;
    } ;
  }}}
  
  You could specify this in your core.js file, for example.  Then anywhere in 
  your application you can use it to define bindings like so:
  
  {{{
    valueBinding: SC.Binding.from("MyApp.someController.value").notLessThan(10)
  }}}
  
  Also, remember that helpers are chained so you can use your helper along with
  any other helpers.  The example below will create a one way binding that 
  does not allow empty values or values less than 10:
  
  {{{
    valueBinding: SC.Binding.oneWay("MyApp.someController.value").notEmpty().notLessThan(10)
  }}}
  
  Note that the built in helper methods all allow you to pass a "from" 
  property path so you don't have to use the from() helper to set the path.  
  You can do the same thing with your own helper methods if you like, but it 
  is not required.
  
  h2. Creating Custom Binding Templates
  
  Another way you can customize bindings is to create a binding template.  A
  template is simply a binding that is already partially or completely 
  configured.  You can specify this template anywhere in your app and then use 
  it instead of designating your own custom bindings.  This is a bit faster on
  app startup but it is mostly useful in making your code less verbose.
  
  For example, let's say you will be frequently creating one way, not empty 
  bindings that allow values greater than 10 throughout your app.  You could
  create a binding template in your core.js like this:
  
  {{{
    MyApp.LimitBinding = SC.Binding.oneWay().notEmpty().notLessThan(10);
  }}}
  
  Then anywhere you want to use this binding, just refer to the template like 
  so:

  {{{
    valueBinding: MyApp.LimitBinding.beget("MyApp.someController.value")
  }}}
    
  Note that when you use binding templates, it is very important that you 
  always start by using beget() to extend the template.  If you do not do 
  this, you will end up using the same binding instance throughout your app 
  which will lead to erratic behavior.
  
  h2. How to Manually Activate a Binding

  All of the examples above show you how to configure a custom binding, but 
  the result of these customizations will be a binding template, not a fully 
  active binding.  The binding will actually become active only when you 
  instantiate the object the binding belongs to.  It is useful however, to 
  understand what actually happens when the binding is activated.
  
  For a binding to function it must have at least a "from" property and a "to"
  property.  The from property path points to the object/key that you want to
  bind from while the to path points to the object/key you want to bind to.  
  
  When you define a custom binding, you are usually describing the property 
  you want to bind from (such as "MyApp.someController.value" in the examples
  above).  When your object is created, it will automatically assign the value
  you want to bind "to" based on the name of your binding key.  In the 
  examples above, during init, SproutCore objects will effectively call 
  something like this on your binding:
  
  {{{
    binding = this.valueBinding.beget().to("value", this) ;
  }}}
    
  This creates a new binding instance based on the template you provide, and 
  sets the to path to the "value" property of the new object.  Now that the 
  binding is fully configured with a "from" and a "to", it simply needs to be
  connected to become active.  This is done through the connect() method:
  
  {{{
    binding.connect() ;
  }}}
    
  Now that the binding is connected, it will observe both the from and to side 
  and relay changes.
  
  If you ever needed to do so (you almost never will, but it is useful to 
  understand this anyway), you could manually create an active binding by 
  doing the following:
  
  {{{
    SC.Binding.from("MyApp.someController.value")
     .to("MyApp.anotherObject.value")
     .connect();
  }}}
     
  You could also use the bind() helper method provided by SC.Object. (This is 
  the same method used by SC.Object.init() to setup your bindings):
  
  {{{
    MyApp.anotherObject.bind("value", "MyApp.someController.value") ;
  }}}

  Both of these code fragments have the same effect as doing the most friendly
  form of binding creation like so:
  
  {{{
    MyApp.anotherObject = SC.Object.create({
      valueBinding: "MyApp.someController.value",
      
      // OTHER CODE FOR THIS OBJECT...
      
    }) ;
  }}}
  
  SproutCore's built in binding creation method make it easy to automatically
  create bindings for you.  You should always use the highest-level APIs 
  available, even if you understand how to it works underneath.
  
  @since SproutCore 1.0
*/
SC.Binding = {
  
  /**
    This is the core method you use to create a new binding instance.  The
    binding instance will have the receiver instance as its parent which means
    any configuration you have there will be inherited.  
    
    The returned instance will also have its parentBinding property set to the 
    receiver.

    @param fromPath {String} optional from path.
    @returns {SC.Binding} new binding instance
  */
  beget: function(fromPath) {
    var ret = SC.beget(this) ;
    ret.parentBinding = this;
    if (fromPath !== undefined) ret = ret.from(fromPath) ;
    return ret ;
  },
  
  /**
    Returns a builder function for compatibility.  
  */
  builder: function() {
    var binding = this,
        ret = function(fromProperty) { return binding.beget().from(fromProperty); };
    ret.beget = function() { return binding.beget(); } ;
    return ret ;
  },
  
  /**
    This will set "from" property path to the specified value.  It will not
    attempt to resolve this property path to an actual object/property tuple
    until you connect the binding.

    The binding will search for the property path starting at the root level 
    unless you specify an alternate root object as the second paramter to this 
    method.  Alternatively, you can begin your property path with either "." or
    "*", which will use the root object of the to side be default.  This special
    behavior is used to support the high-level API provided by SC.Object.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  from: function(propertyPath, root) {
    
    // if the propertyPath is null/undefined, return this.  This allows the
    // method to be called from other methods when the fromPath might be 
    // optional. (cf single(), multiple())
    if (!propertyPath) return this ;
    
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._fromPropertyPath = propertyPath ;
    binding._fromRoot = root ;
    binding._fromTuple = null ;
    return binding ;
  },
  
  /**
   This will set the "to" property path to the specified value.  It will not 
   attempt to reoslve this property path to an actual object/property tuple
   until you connect the binding.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  to: function(propertyPath, root) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._toPropertyPath = propertyPath ;
    binding._toRoot = root ;
    binding._toTuple = null ; // clear out any existing one.
    return binding ;
  },

  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes.  This method will raise an exception if you have not set the 
    from/to properties yet.
    
    @returns {SC.Binding} this
  */
  connect: function() {
    // If the binding is already connected, do nothing.
    if (this.isConnected) return this ;
    this.isConnected = YES ;
    this._connectionPending = YES ; // its connected but not really...    
    this._syncOnConnect = YES ;
    SC.Binding._connectQueue.add(this) ;
    return this; 
  },
  
  /** @private
    Actually connects the binding.  This is done at the end of the runloop
    to give you time to setup your entire object graph before the bindings 
    try to activate.
  */
  _connect: function() {
    if (!this._connectionPending) return; //nothing to do
    this._connectionPending = NO ;

    var path, root,
        bench = SC.BENCHMARK_BINDING_SETUP;

    if (bench) SC.Benchmark.start("SC.Binding.connect()");
    
    // try to connect the from side.
    // as a special behavior, if the from property path begins with either a 
    // . or * and the fromRoot is null, use the toRoot instead.  This allows 
    // for support for the SC.Object shorthand:
    //
    // contentBinding: "*owner.value"
    //
    path = this._fromPropertyPath; root = this._fromRoot ;
    
    if (typeof path === "string") {
      
      // if the first character is a '.', this is a static path.  make the 
      // toRoot the default root.
      if (path.indexOf('.') === 0) {
        path = path.slice(1);
        if (!root) root = this._toRoot ;
        
      // if the first character is a '*', then setup a tuple since this is a 
      // chained path.
      } else if (path.indexOf('*') === 0) {
        path = [this._fromRoot || this._toRoot, path.slice(1)] ;
        root = null ;
      }
    }
    this._fromObserverData = [path, this, this.fromPropertyDidChange, root];
    SC.Observers.addObserver.apply(SC.Observers, this._fromObserverData);
    
    // try to connect the to side
    if (!this._oneWay) {
      path = this._toPropertyPath; root = this._toRoot ;
      this._toObserverData = [path, this, this.toPropertyDidChange, root];
      SC.Observers.addObserver.apply(SC.Observers, this._toObserverData);
    }

    if (bench) SC.Benchmark.end("SC.Binding.connect()");

    // now try to sync if needed
    if (this._syncOnConnect) {
      this._syncOnConnect = NO ;
      if (bench) SC.Benchmark.start("SC.Binding.connect().sync");
      this.sync();
      if (bench) SC.Benchmark.end("SC.Binding.connect().sync");
    }
  },
  
  /**
    Disconnects the binding instance.  Changes will no longer be relayed.  You
    will not usually need to call this method.
    
    @returns {SC.Binding} this
  */
  disconnect: function() {
    if (!this.isConnected) return this; // nothing to do.
    
    // if connection is still pending, just cancel
    if (this._connectionPending) {
      this._connectionPending = NO ;
      
    // connection is completed, disconnect.
    } else {
      SC.Observers.removeObserver.apply(SC.Observers, this._fromObserverData);
      if (!this._oneWay) {
        SC.Observers.removeObserver.apply(SC.Observers, this._toObserverData);
      }
    }
    
    this.isConnected = NO ;
    return this ;  
  },

  /**
    Invoked whenever the value of the "from" property changes.  This will mark
    the binding as dirty if the value has changed.
  */
  fromPropertyDidChange: function(target, key) {
    var v = target ? target.get(key) : null;

    //console.log("fromPropertyDidChange: %@ v = %@".fmt(this, v)) ;
    
    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._bindingValue || key === '[]') {

      this._setBindingValue(target, key) ;
      this._changePending = YES ;
      SC.Binding._changeQueue.add(this) ; // save for later.  
    }
  },

  /**
    Invoked whenever the value of the "to" property changes.  This will mark the
    binding as dirty only if:
    
    - the binding is not one way
    - the value does not match the stored transformedBindingValue
    
    if the value does not match the transformedBindingValue, then it will 
    become the new bindingValue. 
  */
  toPropertyDidChange: function(target, key) {
    if (this._oneWay) return; // nothing to do
    
    var v = target.get(key) ;
    
    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._transformedBindingValue) {
      this._setBindingValue(target, key) ;
      this._changePending = YES ;
      SC.Binding._changeQueue.add(this) ; // save for later.  
    }
  },
  
  /** @private
    Saves the source location for the binding value.  This will be used later
    to actually update the binding value.
  */
  _setBindingValue: function(source, key) {
    this._bindingSource = source;
    this._bindingKey    = key;
  },
  
  /** @private 
    Updates the binding value from the current binding source if needed.  This
    should be called just before using this._bindingValue.
  */
  _computeBindingValue: function() {
    var source = this._bindingSource,
        key    = this._bindingKey,
        v, idx;
    
    this._bindingValue = v = (source ? source.getPath(key) : null);
    
    // apply any transforms to get the to property value also
    var transforms = this._transforms;
    if (transforms) {
      var len = transforms.length,
          transform;
      for(idx=0;idx<len;idx++) {
        transform = transforms[idx] ;
        v = transform(v, this) ;
      }
    }

    // if error objects are not allowed, and the value is an error, then
    // change it to null.
    if (this._noError && SC.typeOf(v) === SC.T_ERROR) v = null ;
    
    this._transformedBindingValue = v;
  },
  
  _connectQueue: SC.CoreSet.create(),
  _alternateConnectQueue: SC.CoreSet.create(),
  _changeQueue: SC.CoreSet.create(),
  _alternateChangeQueue: SC.CoreSet.create(),
  _changePending: NO,

  /**
    Call this method on SC.Binding to flush all bindings with changed pending.
    
    @returns {Boolean} YES if changes were flushed.
  */
  flushPendingChanges: function() {
    
    // don't allow flushing more than one at a time
    if (this._isFlushing) return NO; 
    this._isFlushing = YES ;
    SC.Observers.suspendPropertyObserving();

    var didFlush = NO,
        log = SC.LOG_BINDINGS,
        // connect any bindings
        queue, binding ;
    while((queue = this._connectQueue).length >0) {
      this._connectQueue = this._alternateConnectQueue ;
      this._alternateConnectQueue = queue ;
      while(binding = queue.pop()) binding._connect() ;
    }
    
    // loop through the changed queue...
    while ((queue = this._changeQueue).length > 0) {
      if (log) console.log("Begin: Trigger changed bindings") ;
      
      didFlush = YES ;
      
      // first, swap the change queues.  This way any binding changes that
      // happen while we flush the current queue can be queued up.
      this._changeQueue = this._alternateChangeQueue ;
      this._alternateChangeQueue = queue ;
      
      // next, apply any bindings in the current queue.  This may cause 
      // additional bindings to trigger, which will end up in the new active 
      // queue.
      while(binding = queue.pop()) binding.applyBindingValue() ;
      
      // now loop back and see if there are additional changes pending in the
      // active queue.  Repeat this until all bindings that need to trigger 
      // have triggered.
      if (log) console.log("End: Trigger changed bindings") ;
    }
    
    // clean up
    this._isFlushing = NO ;
    SC.Observers.resumePropertyObserving();

    return didFlush ;
  },
  
  /**
    This method is called at the end of the Run Loop to relay the changed 
    binding value from one side to the other.
  */
  applyBindingValue: function() {
    this._changePending = NO ;

    // compute the binding targets if needed.
    this._computeBindingTargets() ;
    this._computeBindingValue();
    
    var v = this._bindingValue,
        tv = this._transformedBindingValue,
        bench = SC.BENCHMARK_BINDING_NOTIFICATIONS,
        log = SC.LOG_BINDINGS ; 
    
    // the from property value will always be the binding value, update if 
    // needed.
    if (!this._oneWay && this._fromTarget) {
      if (log) console.log("%@: %@ -> %@".fmt(this, v, tv)) ;
      if (bench) SC.Benchmark.start(this.toString() + "->") ;
      this._fromTarget.setPathIfChanged(this._fromPropertyKey, v) ;
      if (bench) SC.Benchmark.end(this.toString() + "->") ;
    }
    
    // update the to value with the transformed value if needed.
    if (this._toTarget) {
      if (log) console.log("%@: %@ <- %@".fmt(this, v, tv)) ;
      if (bench) SC.Benchmark.start(this.toString() + "<-") ;
      this._toTarget.setPathIfChanged(this._toPropertyKey, tv) ;
      if (bench) SC.Benchmark.start(this.toString() + "<-") ;
    }
  },

  /**
    Calling this method on a binding will cause it to check the value of the 
    from side of the binding matches the current expected value of the 
    binding. If not, it will relay the change as if the from side's value has 
    just changed.
    
    This method is useful when you are dynamically connecting bindings to a 
    network of objects that may have already been initialized.
  */
  sync: function() {

    // do nothing if not connected
    if (!this.isConnected) return this;
    
    // connection is pending, just note that we should sync also
    if (this._connectionPending) {
      this._syncOnConnect = YES ;
      
    // we are connected, go ahead and sync
    } else {
      this._computeBindingTargets() ;
      var target = this._fromTarget,
          key = this._fromPropertyKey ;
      if (!target || !key) return this ; // nothing to do

      // get the new value
      var v = target.getPath(key) ;

      // if the new value is different from the current binding value, then 
      // schedule to register an update.
      if (v !== this._bindingValue || key === '[]') {
        this._setBindingValue(target, key) ;
        this._changePending = YES ;
        SC.Binding._changeQueue.add(this) ; // save for later.  
      }
    }
    
    return this ;
  },
  
  // set if you call sync() when the binding connection is still pending.
  _syncOnConnect: NO,
  
  _computeBindingTargets: function() {
    if (!this._fromTarget) {

      var path, root, tuple ;
      
      // if the fromPropertyPath begins with a . or * then we may use the 
      // toRoot as the root object.  Similar code exists in connect() so if 
      // you make a change to one be sure to update the other.
      path = this._fromPropertyPath; root = this._fromRoot ;
      if (typeof path === "string") {
        
        // static path beginning with the toRoot
        if (path.indexOf('.') === 0) {
          path = path.slice(1) ; // remove the .
          if (!root) root = this._toRoot; // use the toRoot optionally
          
        // chained path beginning with toRoot.  Setup a tuple
        } else if (path.indexOf('*') === 0) {
          path = [root || this._toRoot, path.slice(1)];
          root = null ;
        }
      }
      
      tuple = SC.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._fromTarget = tuple[0]; this._fromPropertyKey = tuple[1] ;
      }
    }

    if (!this._toTarget) {
      path = this._toPropertyPath; root = this._toRoot ;
      tuple = SC.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._toTarget = tuple[0]; this._toPropertyKey = tuple[1] ;
      }
    }
  },
  
  /**
    Configures the binding as one way.  A one-way binding will relay changes
    on the "from" side to the "to" side, but not the other way around.  This
    means that if you change the "to" side directly, the "from" side may have 
    a different value.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} Optionally pass NO to set the binding back to two-way
    @returns {SC.Binding} this
  */
  oneWay: function(fromPath, aFlag) {
    
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._oneWay = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds the specified transform function to the array of transform functions.
    
    The function you pass must have the following signature:
    
    {{{
      function(value) {} ;
    }}}
    
    It must return either the transformed value or an error object.  
        
    Transform functions are chained, so they are called in order.  If you are
    extending a binding and want to reset the transforms, you can call
    resetTransform() first.
    
    @param transformFunc {Function} the transform function.
    @returns {SC.Binding} this
  */
  transform: function(transformFunc) {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    var t = binding._transforms ;
    
    // clone the transform array if this comes from the parent
    if (t && (t === binding.parentBinding._transform)) {
      t = binding._transforms = t.slice() ;
    }
    
    // create the transform array if needed.
    if (!t) t = binding._transforms = [] ;
    
    // add the transform function
    t.push(transformFunc) ;
    return binding;
  },
  
  /**
    Resets the transforms for the binding.  After calling this method the 
    binding will no longer transform values.  You can then add new transforms
    as needed.
  
    @returns {SC.Binding} this
  */
  resetTransforms: function() {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._transforms = null ; return binding ;
  },
  
  /**
    Specifies that the binding should not return error objects.  If the value
    of a binding is an Error object, it will be transformed to a null value
    instead.
    
    Note that this is not a transform function since it will be called at the
    end of the transform chain.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} optionally pass NO to allow error objects again.
    @returns {SC.Binding} this
  */
  noError: function(fromPath, aFlag) {
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._noError = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds a transform to the chain that will allow only single values to pass.
    This will allow single values, nulls, and error values to pass through.  If
    you pass an array, it will be mapped as so:
    
    {{{
      [] => null
      [a] => a
      [a,b,c] => Multiple Placeholder
    }}}
    
    You can pass in an optional multiple placeholder or it will use the 
    default.
    
    Note that this transform will only happen on forwarded valued.  Reverse
    values are send unchanged.
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder value.
    @returns {SC.Binding} this
  */
  single: function(fromPath, placeholder) {
    if (placeholder === undefined) {
      placeholder = SC.MULTIPLE_PLACEHOLDER ;
    }
    return this.from(fromPath).transform(function(value, isForward) {
      if (value && value.isEnumerable) {
        var len = value.get('length');
        value = (len>1) ? placeholder : (len<=0) ? null : value.firstObject();
      }
      return value ;
    }) ;
  },
  
  /** 
    Adds a transform that will return the placeholder value if the value is 
    null, undefined, an empty array or an empty string.  See also notNull().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder.
    @returns {SC.Binding} this
  */
  notEmpty: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (SC.none(value) || (value === '') || (SC.isArray(value) && value.length === 0)) {
        value = placeholder ;
      }
      return value ;
    }) ;
  },
  
  /**
    Adds a transform that will return the placeholder value if the value is
    null.  Otherwise it will passthrough untouched.  See also notEmpty().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder;
    @returns {SC.Binding} this
  */
  notNull: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (SC.none(value)) value = placeholder ;
      return value ;
    }) ;
  },

  /** 
    Adds a transform that will convert the passed value to an array.  If 
    the value is null or undefined, it will be converted to an empty array.

    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  multiple: function(fromPath) {
    return this.from(fromPath).transform(function(value) {
      if (!SC.isArray(value)) value = (value == null) ? [] : [value] ;
      return value ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to a bool value.  If the value is
    an array it will return YES if array is not empty.  If the value is a string
    it will return YES if the string is not empty.
  
    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  bool: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = SC.typeOf(v) ;
      if (t === SC.T_ERROR) return v ;
      return (t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v ;
    }) ;
  },

  /**
    Adds a transform that forwards the logical 'AND' of values at 'pathA' and
    'pathB' whenever either source changes.  Note that the transform acts strictly
    as a one-way binding, working only in the direction
    
      'pathA' AND 'pathB' --> value  (value returned is the result of ('pathA' && 'pathB'))

    Usage example where a delete button's 'isEnabled' value is determined by whether
    something is selected in a list and whether the current user is allowed to delete:
    
      deleteButton: SC.ButtonView.design({
        isEnabledBinding: SC.Binding.and('MyApp.itemsController.hasSelection', 'MyApp.userController.canDelete')
      })

  */
  and: function(pathA, pathB) {

    // create an object to do the logical computation
    var gate = SC.Object.create({
      valueABinding: pathA,
      valueBBinding: pathB,

      and: function() {
        return (this.get('valueA') && this.get('valueB'));
      }.property('valueA', 'valueB').cacheable()
    });

    // add a transform that depends on the result of that computation.
    return this.from('and', gate).oneWay();
  },

  /**
    Adds a transform that forwards the 'OR' of values at 'pathA' and
    'pathB' whenever either source changes.  Note that the transform acts strictly
    as a one-way binding, working only in the direction

      'pathA' AND 'pathB' --> value  (value returned is the result of ('pathA' || 'pathB'))

  */
  or: function(pathA, pathB) {
    
    // create an object to the logical computation
    var gate = SC.Object.create({
      valueABinding: pathA,
      valueBBinding: pathB,
      
      or: function() {
        return (this.get('valueA') || this.get('valueB'));
      }.property('valueA', 'valueB').cacheable()
    });
    
    return this.from('or', gate).oneWay();
  },
  
  /**
    Adds a transform to convert the value to the inverse of a bool value.  This
    uses the same transform as bool() but inverts it.
    
    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  not: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = SC.typeOf(v) ;
      if (t === SC.T_ERROR) return v ;
      return !((t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v) ;
    }) ;
  },
  
  /**
    Adds a transform that will return YES if the value is null, NO otherwise.
    
    @returns {SC.Binding} this
  */
  isNull: function(fromPath) {
    return this.from(fromPath).transform(function(v) { 
      var t = SC.typeOf(v) ;
      return (t === SC.T_ERROR) ? v : SC.none(v) ;
    });
  },
  
  toString: function() {
    var from = this._fromRoot ? "<%@>:%@".fmt(this._fromRoot,this._fromPropertyPath) : this._fromPropertyPath;

    var to = this._toRoot ? "<%@>:%@".fmt(this._toRoot,this._toPropertyPath) : this._toPropertyPath;
    
    var oneWay = this._oneWay ? '[oneWay]' : '';
    return "SC.Binding%@(%@ -> %@)%@".fmt(SC.guidFor(this), from, to, oneWay);
  }  
} ;

/** 
  Shorthand method to define a binding.  This is the same as calling:
  
  {{{
    SC.binding(path) = SC.Binding.from(path)
  }}}
*/
SC.binding = function(path, root) { return SC.Binding.from(path,root); } ;


/* >>>>>>>>>> BEGIN source/system/cookie.js */
// ==========================================================================
// SC.Cookie
// ==========================================================================

/** @class
  
  Allows for easier handling of the document.cookie object. To create a cookie,
  simply call SC.Cookie.create. To retrieve a cookie, use SC.Cookie.find.
  Cookies are not added to document.cookie, which SC.Cookie.find uses, until you
  have called SC.Cookie#write.
  
  Heavy inspiration from the
  {@link <a href="http://plugins.jquery.com/project/cookie">jQuery cookie plugin</a>}.
  
  @extends SC.Object
  @since Sproutcore 1.0
  @author Colin Campbell
*/

SC.Cookie = SC.Object.extend({
  
  // ..........................................................
  // PROPERTIES
  //   
  
  /**
    The name of the cookie
    
    @property {String}
  */
  name: null,
  
  /**
    The value of the cookie
    
    @property {String}
  */
  value: '',
  
  /**
    Amount of time until the cookie expires. Set to -1 in order to delete the cookie.
    
    @property {Integer|SC.DateTime|Date}
  */
  expires: null,
  
  /**
    The value of the path atribute of the cookie (default: path of page that created the cookie).
    
    @property {String}
  */
  path: null,
  
  /**
    The value of the domain attribute of the cookie (default: domain of page that created the cookie).
    
    @property {String}
  */
  domain: null,
  
  /**
    If true, the secure attribute of the cookie will be set and the cookie transmission will
    require a secure protocol (like HTTPS).
    
    @property {Boolean}
  */
  secure: NO,
  
  /**
    Walk like a duck
    
    @property {Boolean}
    @isReadOnly
  */
  isCookie: YES,
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Sets SC.Cookie#expires to -1, which destroys the cookie.
  */
  destroy: function() {
    this.set('expires', -1);
    this.write();
    
    arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Writes this SC.Cookie to document.cookie and adds it to SC.Cookie collection. To find this
    cookie later, or on reload, use SC.Cookie.find.
    
    @see SC.Cookie.find
  */
  write: function() {
    var name = this.get('name'),
        value = this.get('value'),
        expires = this.get('expires'),
        path = this.get('path'),
        domain = this.get('domain'),
        secure = this.get('secure');
    
    var expiresOutput = '';
    if (expires && (SC.typeOf(expires) === SC.T_NUMBER || (SC.DateTime && expires.get && expires.get('milliseconds')) || SC.typeOf(expires.toUTCString) === SC.T_FUNCTION)) {
      var date;
      if (SC.typeOf(expires) === SC.T_NUMBER) {
        date = new Date();
        date.setTime(date.getTime()+(expires*24*60*60*1000));
      }
      else if (SC.DateTime && expires.get && expires.get('milliseconds')) {
        date = new Date(expires.get('milliseconds'));
      }
      else if (SC.typeOf(expires.toUTCString) === SC.T_FUNCTION) {
        date = expires;
      }
      
      if (date) {
        expiresOutput = '; expires=' + date.toUTCString();
      }
    }
    
    var pathOutput = path ? '; path=' + path : '';
    var domainOutput = domain ? '; domain=' + domain : '';
    var secureOutput = secure ? '; secure' : '';
    
    document.cookie = [name, '=', encodeURIComponent(value), expiresOutput, pathOutput, domainOutput, secureOutput].join('');
    
    return this;
  }
  
});

SC.Cookie.mixin(
  /** @scope SC.Cookie */ {
  
  /**
    Finds a cookie that has been stored
    
    @param {String} name The name of the cookie
    @returns SC.Cookie object containing name and value of cookie
  */
  find: function(name) {
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = String(cookies[i]).trim();
        if (cookie.substring(0, name.length + 1) === (name + "=")) {
          return SC.Cookie.create({
            name: name,
            value: decodeURIComponent(cookie.substring(name.length + 1))
          });
        }
      }
    }
    return null;
  }
  
});
/* >>>>>>>>>> BEGIN source/system/error.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  An error, used to represent an error state.
  
  Many API's within SproutCore will return an instance of this object whenever
  they have an error occur.  An error includes an error code, description,
  and optional human readable label that indicates the item that failed. 
  
  Depending on the error, other properties may also be added to the object
  to help you recover from the failure.
  
  You can pass error objects to various UI elements to display the error in
  the interface. You can easily determine if the value returned by some API is 
  an error or not using the helper SC.ok(value).
  
  h2. Faking Error Objects
  
  You can actually make any object you want to be treated like an Error object
  by simply implementing two properties: isError and errorValue.  If you 
  set isError to YES, then calling SC.ok(obj) on your object will return NO.
  If isError is YES, then SC.val(obj) will return your errorValue property 
  instead of the receiver.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Error = SC.Object.extend(
/** @scope SC.Error.prototype */ {
  
  /**
    error code.  Used to designate the error type.
    
    @property {Number}
  */
  code: -1,
  
  /**
    Human readable description of the error.  This can also be a non-localized
    key.
    
    @property {String}
  */
  message: '',
  
  /**
    The value the error represents.  This is used when wrapping a value inside
    of an error to represent the validation failure.
    
    @property {Object}
  */
  errorValue: null,
  
  /**
    The original error object.  Normally this will return the receiver.  
    However, sometimes another object will masquarade as an error; this gives
    you a way to get at the underyling error.
    
    @property {SC.Error}
  */
  errorObject: function() {
    return this;
  }.property().cacheable(),
  
  /**
    Human readable name of the item with the error.
    
    @property {String}
  */
  label: null,

  /** @private */
  toString: function() {
    return "SC.Error:%@:%@ (%@)".fmt(SC.guidFor(this), this.get('message'), this.get('code'));
  },
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isError: YES
}) ;

/**
  Creates a new SC.Error instance with the passed description, label, and
  code.  All parameters are optional.
  
  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.Error.desc = function(description, label, value, code) {
  var opts = { message: description } ;
  if (label !== undefined) opts.label = label ;
  if (code !== undefined) opts.code = code ;
  if (value !== undefined) opts.errorValue = value ;
  return this.create(opts) ;
} ;

/**
  Shorthand form of the SC.Error.desc method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.$error = function(description, label, value, c) { 
  return SC.Error.desc(description,label, value, c); 
} ;

/**
  Returns YES if the passed value is an error object or false.
  
  @param {Object} ret object value
  @returns {Boolean}
*/
SC.ok = function(ret) {
  return (ret !== false) && !(ret && ret.isError);
};

/** @private */
SC.$ok = SC.ok;

/**
  Returns the value of an object.  If the passed object is an error, returns
  the value associated with the error; otherwise returns the receiver itself.
  
  @param {Object} obj the object
  @returns {Object} value 
*/
SC.val = function(obj) {
  if (obj && obj.isError) {
    return obj.get ? obj.get('errorValue') : null ; // Error has no value
  } else return obj ;
};

/** @private */
SC.$val = SC.val;

// STANDARD ERROR OBJECTS

/**
  Standard error code for errors that do not support multiple values.
  
  @property {Number}
*/
SC.Error.HAS_MULTIPLE_VALUES = -100 ;

/* >>>>>>>>>> BEGIN source/system/index_set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/observable') ;
sc_require('mixins/freezable');
sc_require('mixins/copyable');

/**
  @class 

  A collection of ranges.  You can use an IndexSet to keep track of non-
  continuous ranges of items in a parent array.  IndexSet's are used for 
  selection, for managing invalidation ranges and other data-propogation.

  h2. Examples
  
  {{{
    var set = SC.IndexSet.create(ranges) ;
    set.contains(index);
    set.add(index, length);
    set.remove(index, length);
    
    // uses a backing SC.Array object to return each index
    set.forEach(function(object) { .. })
    
    // returns the index
    set.forEachIndex(function(index) { ... });
    
    // returns ranges
    set.forEachRange(function(start, length) { .. });
  }}}

  h2. Implementation Notes

  An IndexSet stores indices on the object.  A positive value great than the
  index tells you the end of an occupied range.  A negative values tells you
  the end of an empty range.  A value less than the index is a search 
  accelerator.  It tells you the start of the nearest range.

  @extends SC.Enumerable 
  @extends SC.Observable
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/
SC.IndexSet = SC.mixin({}, 
  SC.Enumerable, SC.Observable, SC.Freezable, SC.Copyable,
/** @scope SC.IndexSet.prototype */ {

  /** @private
    Walks a content array and copies its contents to a new array.  For large
    content arrays this is faster than using slice()
  */
  _sc_sliceContent: function(c) {
    if (c.length < 1000) return c.slice(); // use native when faster
    var cur = 0, ret = [], next = c[0];
    while(next !== 0) {
      ret[cur] = next ;
      cur = (next<0) ? (0-next) : next ;
      next = c[cur];
    }
    ret[cur] = 0;
    this._hint(0, cur, ret); // hints are not copied manually - add them
    return ret ;
  },
  
  /**
    To create a set, pass either a start and index or another IndexSet.
    
    @returns {SC.IndexSet}
  */
  create: function(start, length) { 
    var ret = SC.beget(this);
    ret.initObservable();
    ret.registerDependentKey('min', '[]');
    
    // optimized method to clone an index set.
    if (start && start.isIndexSet) {
      ret._content = this._sc_sliceContent(start._content);
      ret.max = start.max;
      ret.length = start.length; 
      ret.source = start.source ;
      
    // otherwise just do a regular add
    } else {
      ret._content = [0];
      if (start !== undefined) ret.add(start, length);
    }
    return ret ;
  },

  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isIndexSet: YES,

  /**  @private 
    Internal setting determines the preferred skip size for hinting sets.
    
    @property {Number}
  */
  HINT_SIZE: 256,
  
  /**
    Total number of indexes contained in the set

    @property {Number}
  */
  length: 0,
  
  /**
    One greater than the largest index currently stored in the set.  This 
    is sometimes useful when determining the total range of items covering
    the index set.
    
    @property {Number}
  */
  max: 0,
  
  /**
    The first index included in the set or -1.
    
    @property {Number}
  */
  min: function() {  
    var content = this._content, 
        cur = content[0];
    return (cur === 0) ? -1 : (cur>0) ? 0 : Math.abs(cur);
    
  }.property('[]').cacheable(),
  
  /**
    Returns the first index in the set .
    
    @property {Number}
  */
  firstObject: function() {
    return (this.get('length')>0) ? this.get('min') : undefined;  
  }.property(),
  
  /** 
    Returns the starting index of the nearest range for the specified 
    index.
    
    @param {Number} index
    @returns {Number} starting index
  */
  rangeStartForIndex: function(index) {    
    var content = this._content,
        max     = this.get('max'),
        ret, next, accel;
    
    // fast cases
    if (index >= max) return max ;
    if (Math.abs(content[index]) > index) return index ; // we hit a border
    
    // use accelerator to find nearest content range
    accel = index - (index % SC.IndexSet.HINT_SIZE);
    ret = content[accel];
    if (ret<0 || ret>index) ret = accel;
    next = Math.abs(content[ret]);

    // now step forward through ranges until we find one that includes the
    // index.
    while (next < index) {
      ret = next ;
      next = Math.abs(content[ret]);
    }
    return ret ;
  },
    
  /**
    Returns YES if the passed index set contains the exact same indexes as 
    the receiver.  If you pass any object other than an index set, returns NO.
    
    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    
    // optimize for some special cases
    if (obj === this) return YES ;
    if (!obj || !obj.isIndexSet || (obj.max !== this.max) || (obj.length !== this.length)) return NO;

    // ok, now we need to actually compare the ranges of the two.
    var lcontent = this._content,
        rcontent = obj._content,
        cur      = 0,
        next     = lcontent[cur];
    
    do {
      if (rcontent[cur] !== next) return NO ;
      cur = Math.abs(next) ;
      next = lcontent[cur];
    } while (cur !== 0);
    return YES ;
  },
  
  /**
    Returns the first index in the set before the passed index or null if 
    there are no previous indexes in the set.
    
    @param {Number} index index to check
    @returns {Number} index or -1
  */
  indexBefore: function(index) {
    
    if (index===0) return -1; // fast path
    index--; // start with previous index
    
    var content = this._content, 
        max     = this.get('max'),
        start   = this.rangeStartForIndex(index);
    if (!content) return null;

    // loop backwards until we find a range that is in the set.
    while((start===max) || (content[start]<0)) {
      if (start === 0) return -1 ; // nothing before; just quit
      index = start -1 ;
      start = this.rangeStartForIndex(index);
    }
    
    return index;
  },

  /**
    Returns the first index in the set after the passed index or null if 
    there are no additional indexes in the set.
    
    @param {Number} index index to check
    @returns {Number} index or -1
  */
  indexAfter: function(index) {
    var content = this._content,
        max     = this.get('max'),
        start, next ;
    if (!content || (index>=max)) return -1; // fast path
    index++; // start with next index
    

    // loop forwards until we find a range that is in the set.
    start = this.rangeStartForIndex(index);
    next  = content[start];
    while(next<0) {
      if (next === 0) return -1 ; //nothing after; just quit
      index = start = Math.abs(next);
      next  = content[start];
    }
    
    return index;
  },
  
  /**
    Returns YES if the index set contains the named index
    
    @param {Number} start index or range
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(start, length) {
    var content, cur, next, rstart, rnext;
    
    // normalize input
    if (length === undefined) { 
      if (start === null || start === undefined) return NO ;
      
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, check each receiver range
      } else if (start && start.isIndexSet) {
        if (start === this) return YES ; // optimization

        content = start._content ;
        cur = 0 ;
        next = content[cur];
        while (next !== 0) {
          if ((next>0) && !this.contains(cur, next-cur)) return NO ;
          cur = Math.abs(next);
          next = content[cur];
        }
        return YES ;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }
    
    rstart = this.rangeStartForIndex(start);
    rnext  = this._content[rstart];
    
    return (rnext>0) && (rstart <= start) && (rnext >= (start+length));
  },

  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.
    
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(start, length) {
    var content, cur, next, lim;
    
    // normalize input
    if (length === undefined) { 
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, check each receiver range
      } else if (start && start.isIndexSet) {
        if (start === this) return YES ; // optimization

        content = start._content ;
        cur = 0 ;
        next = content[cur];
        while (next !== 0) {
          if ((next>0) && this.intersects(cur, next-cur)) return YES ;
          cur = Math.abs(next);
          next = content[cur];
        }
        return NO ;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }
    
    cur     = this.rangeStartForIndex(start);
    content = this._content;
    next    = content[cur];
    lim     = start + length;
    while (cur < lim) {
      if (next === 0) return NO; // no match and at end!
      if ((next > 0) && (next > start)) return YES ; // found a match
      cur = Math.abs(next);
      next = content[cur];
    }
    return NO ; // no match
  },

  /**
    Returns a new IndexSet without the passed range or indexes.   This is a
    convenience over simply cloning and removing.  Does some optimizations.
    
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {SC.IndexSet} new index set
  */
  without: function(start, length) {
    if (start === this) return SC.IndexSet.create(); // just need empty set
    return this.clone().remove(start, length);
  },
  
  /**
    Replace the index set's current content with the passed index set.  This
    is faster than clearing the index set adding the values again.
    
    @param {Number} start index, Range, or another IndexSet
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  replace: function(start, length) {
    
    if (length === undefined) {
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      } else if (start && start.isIndexSet) {
        this._content = this._sc_sliceContent(start._content);
        this.beginPropertyChanges()
          .set('max', start.max)
          .set('length', start.length)
          .set('source', start.source)
          .enumerableContentDidChange()
        .endPropertyChanges();
        return this ;
        
      } else {
        length = start.length;
        start  = start.start;
      }
    }
    
    var oldlen = this.length;
    this._content.length=1;
    this._content[0] = 0;
    this.length = this.max = 0 ; // reset without notifying since add()
    return this.add(start, length);
  },
  
  /**
    Adds the specified range of indexes to the set.  You can also pass another
    IndexSet to union the contents of the index set with the receiver.
    
    @param {Number} start index, Range, or another IndexSet
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  add: function(start, length) {
    
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    var content, cur, next;

    // normalize IndexSet input
    if (start && start.isIndexSet) {
      
      content = start._content;
      
      if (!content) return this; // nothing to do

      cur = 0 ;
      next = content[0];
      while(next !== 0) {
        if (next>0) this.add(cur, next-cur);
        cur = next<0 ? 0-next : next;
        next = content[cur];
      }
      return this ;
      
    } else if (length === undefined) { 
      
      if (start === null || start === undefined) {
        return this; // nothing to do
      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      } else {
        length = start.length; 
        start = start.start;
      }
    } else if (length === null) length = 1 ;

    // if no length - do nothing.
    if (length <= 0) return this;
    
    // special case - appending to end of set
    var max     = this.get('max'),
        oldmax  = max,
        delta, value ;

    content = this._content ;
    
    if (start === max) {

      // if adding to the end and the end is in set, merge.
      if (start > 0) {
        cur = this.rangeStartForIndex(start-1);
        next = content[cur];
        
        // just extend range at end
        if (next > 0) { 
          delete content[max]; // no 0
          content[cur] = max = start + length ;
          start = cur ;
          
        // previous range was not in set, just tack onto the end
        } else {
          content[max] = max = start + length;
        }
      } else {
        content[start] = max = length;
      }
      
      content[max] = 0 ;
      this.set('max', max);
      this.set('length', this.length + length) ;
      length = max - start ;
      
    } else if (start > max) {
      content[max] = 0-start; // empty!
      content[start] = start+length ;
      content[start+length] = 0; // set end
      this.set('max', start + length) ;
      this.set('length', this.length + length) ;
      
      // affected range goes from starting range to end of content.
      length = start + length - max ;
      start = max ;
      
    // otherwise, merge into existing range
    } else {

      // find nearest starting range.  split or join that range
      cur   = this.rangeStartForIndex(start);
      next  = content[cur];
      max   = start + length ;
      delta = 0 ;

      // we are right on a boundary and we had a range or were the end, then
      // go back one more.
      if ((start>0) && (cur === start) && (next <= 0)) {
        cur = this.rangeStartForIndex(start-1);
        next = content[cur] ;
      }
      
      // previous range is not in set.  splice it here
      if (next < 0) { 
        content[cur] = 0-start ;
        
        // if previous range extends beyond this range, splice afterwards also
        if (Math.abs(next) > max) {
          content[start] = 0-max;
          content[max] = next ;
        } else content[start] = next;
        
      // previous range is in set.  merge the ranges
      } else {
        start = cur ;
        if (next > max) {
          // delta -= next - max ;
          max = next ;
        }
      }
      
      // at this point there should be clean starting point for the range.
      // just walk the ranges, adding up the length delta and then removing
      // the range until we find a range that passes last
      cur = start;
      while (cur < max) {
        // get next boundary.  splice if needed - if value is 0, we are at end
        // just skip to last
        value = content[cur];
        if (value === 0) {
          content[max] = 0;
          next = max ;
          delta += max - cur ;
        } else {
          next  = Math.abs(value);
          if (next > max) {
            content[max] = value ;
            next = max ;
          }

          // ok, cur range is entirely inside top range.  
          // add to delta if needed
          if (value < 0) delta += next - cur ;
        }

        delete content[cur] ; // and remove range
        cur = next;
      }
      
      // cur should always === last now.  if the following range is in set,
      // merge in also - don't adjust delta because these aren't new indexes
      if ((cur = content[max]) > 0) {
        delete content[max];     
        max = cur ;
      }

      // finally set my own range.
      content[start] = max ;
      if (max > oldmax) this.set('max', max) ;

      // adjust length
      this.set('length', this.get('length') + delta);
      
      // compute hint range
      length = max - start ;
    }
    
    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },

  /**
    Removes the specified range of indexes from the set
    
    @param {Number} start index, Range, or IndexSet
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  remove: function(start, length) {

    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    // normalize input
    if (length === undefined) { 
      if (start === null || start === undefined) {
        return this; // nothing to do

      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      
      // if passed an index set, just add each range in the index set.
      } else if (start.isIndexSet) {
        start.forEachRange(this.remove, this);
        return this;

      } else {
        length = start.length; 
        start = start.start;
      }
    }

    if (length <= 0) return this; // nothing to do
    
    // special case - appending to end of set
    var max     = this.get('max'),
        oldmax  = max,
        content = this._content,
        cur, next, delta, value, last ;

    // if we're past the end, do nothing.
    if (start >= max) return this;

    // find nearest starting range.  split or join that range
    cur   = this.rangeStartForIndex(start);
    next  = content[cur];
    last  = start + length ;
    delta = 0 ;

    // we are right on a boundary and we had a range or were the end, then
    // go back one more.
    if ((start>0) && (cur === start) && (next > 0)) {
      cur = this.rangeStartForIndex(start-1);
      next = content[cur] ;
    }
    
    // previous range is in set.  splice it here
    if (next > 0) { 
      content[cur] = start ;
      
      // if previous range extends beyond this range, splice afterwards also
      if (next > last) {
        content[start] = last;
        content[last] = next ;
      } else content[start] = next;
      
    // previous range is not in set.  merge the ranges
    } else {
      start = cur ;
      next  = Math.abs(next);
      if (next > last) {
        last = next ;
      }
    }
    
    // at this point there should be clean starting point for the range.
    // just walk the ranges, adding up the length delta and then removing
    // the range until we find a range that passes last
    cur = start;
    while (cur < last) {
      // get next boundary.  splice if needed - if value is 0, we are at end
      // just skip to last
      value = content[cur];
      if (value === 0) {
        content[last] = 0;
        next = last ;

      } else {
        next  = Math.abs(value);
        if (next > last) {
          content[last] = value ;
          next = last ;
        }

        // ok, cur range is entirely inside top range.  
        // add to delta if needed
        if (value > 0) delta += next - cur ;
      }

      delete content[cur] ; // and remove range
      cur = next;
    }
    
    // cur should always === last now.  if the following range is not in set,
    // merge in also - don't adjust delta because these aren't new indexes
    if ((cur = content[last]) < 0) {
      delete content[last];     
      last = Math.abs(cur) ;
    }

    // set my own range - if the next item is 0, then clear it.
    if (content[last] === 0) {
      delete content[last];
      content[start] = 0 ;
      this.set('max', start); //max has changed
      
    } else {
      content[start] = 0-last ;
    }

    // adjust length
    this.set('length', this.get('length') - delta);
    
    // compute hint range
    length = last - start ;
    
    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },
    
  /** @private 
    iterates through a named range, setting hints every HINT_SIZE indexes 
    pointing to the nearest range start.  The passed range must start on a
    range boundary.  It can end anywhere.
  */
  _hint: function(start, length, content) {
    if (content === undefined) content = this._content;
    
    var skip    = SC.IndexSet.HINT_SIZE,
        next    = Math.abs(content[start]), // start of next range
        loc     = start - (start % skip) + skip, // next hint loc
        lim     = start + length ; // stop
        
    while (loc < lim) {
      // make sure we are in current rnage
      while ((next !== 0) && (next <= loc)) {
        start = next ; 
        next  = Math.abs(content[start]) ;
      }
      
      // past end
      if (next === 0) {
        delete content[loc];

      // do not change if on actual boundary
      } else if (loc !== start) {
        content[loc] = start ;  // set hint
      }
      
      loc += skip;
    }
  },

  /**
    Clears the set 
  */
  clear: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    var oldlen = this.length;
    this._content.length=1;
    this._content[0] = 0;
    this.set('length', 0).set('max', 0);
    if (oldlen > 0) this.enumerableContentDidChange();
  },
  
  /**
    Add all the ranges in the passed array.
  */
  addEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    this.beginPropertyChanges();
    var idx = objects.get('length') ;
    if (objects.isSCArray) {
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else if (objects.isEnumerable) {
      objects.forEach(function(idx) { this.add(idx); }, this);
    }
    this.endPropertyChanges();
    
    return this ;
  },  

  /**
    Removes all the ranges in the passed array.
  */
  removeEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    this.beginPropertyChanges();
    
    var idx = objects.get('length') ;
    if (objects.isSCArray) {
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else if (objects.isEnumerable) {
      objects.forEach(function(idx) { this.remove(idx); }, this); 
    }
    
    this.endPropertyChanges();
    
    return this ;
  },  

  /**
   Clones the set into a new set.  
  */
  clone: function() {
    return SC.IndexSet.create(this);    
  },
  
  /**
    Returns a string describing the internal range structure.  Useful for
    debugging.
    
    @returns {String}
  */
  inspect: function() {
    var content = this._content,
        len     = content.length,
        idx     = 0,
        ret     = [],
        item;
    
    for(idx=0;idx<len;idx++) {
      item = content[idx];
      if (item !== undefined) ret.push("%@:%@".fmt(idx,item));      
    }
    return "SC.IndexSet<%@>".fmt(ret.join(' , '));
  },
  
  /** 
    Invoke the callback, passing each occuppied range instead of each 
    index.  This can be a more efficient way to iterate in some cases.  The
    callback should have the signature:
    
    {{{
      callback(start, length, indexSet, source) { ... }
    }}}
    
    If you pass a target as a second option, the callback will be called in
    the target context.
    
    @param {Function} callback the iterator callback
    @param {Object} target the target
    @returns {SC.IndexSet} receiver
  */
  forEachRange: function(callback, target) {
    var content = this._content,
        cur     = 0,
        next    = content[cur],
        source  = this.source;

    if (target === undefined) target = null ;
    while (next !== 0) {
      if (next > 0) callback.call(target, cur, next - cur, this, source);
      cur  = Math.abs(next);
      next = content[cur];
    }
    
    return this ;
  },    
  
  /**
    Invokes the callback for each index within the passed start/length range.
    Otherwise works just like regular forEach().
    
    @param {Number} start starting index
    @param {Number} length length of range
    @param {Function} callback
    @param {Object} target
    @returns {SC.IndexSet} receiver
  */
  forEachIn: function(start, length, callback, target) {
    var content = this._content,
        cur     = 0,
        idx     = 0,
        lim     = start + length,
        source  = this.source,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      if (cur < start) cur = start ; // skip forward 
      while((cur < next) && (cur < lim)) { 
        callback.call(target, cur++, idx++, this, source); 
      }
      
      if (cur >= lim) {
        cur = next = 0 ;
      } else {
        cur  = Math.abs(next);
        next = content[cur];
      }
    }
    return this ;
  },

  /**
    Total number of indexes within the specified range.
    
    @param {Number|SC.IndexSet} start index, range object or IndexSet
    @param {Number} length optional range length
    @returns {Number} count of indexes
  */
  lengthIn: function(start, length) {

    var ret = 0 ;
    
    // normalize input
    if (length === undefined) { 
      if (start === null || start === undefined) {
        return 0; // nothing to do

      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, just add each range in the index set.
      } else if (start.isIndexSet) {
        start.forEachRange(function(start, length) { 
          ret += this.lengthIn(start, length);
        }, this);
        return ret;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }

    // fast path
    if (this.get('length') === 0) return 0;
    
    var content = this._content,
        cur     = 0,
        next    = content[cur],
        lim     = start + length ;

    while (cur<lim && next !== 0) {
      if (next>0) {
        ret += (next>lim) ? lim-cur : next-cur;
      }
      cur  = Math.abs(next);
      next = content[cur];
    }
    
    return ret ;
  },
  
  // ..........................................................
  // OBJECT API
  // 
  
  /**
    Optionally set the source property on an index set and then you can 
    iterate over the actual object values referenced by the index set.  See
    indexOf(), lastIndexOf(), forEachObject(), addObject() and removeObject().
  */
  source: null,
  
  /**
    Returns the first index in the set that matches the passed object.  You
    must have a source property on the set for this to work.
    
    @param {Object} object the object to check 
    @param {Number} startAt optional starting point
    @returns {Number} found index or -1 if not in set
  */
  indexOf: function(object, startAt) {
    var source  = this.source;
    if (!source) throw "%@.indexOf() requires source".fmt(this);
    
    var len     = source.get('length'),
        
        // start with the first index in the set
        content = this._content,
        cur     = content[0]<0 ? Math.abs(content[0]) : 0,
        idx ;
        
    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx<0) return -1 ; // not found in source
      if (this.contains(idx)) return idx; // found in source and in set.
      cur = idx+1;
    } 
    
    return -1; // not found
  },

  /**
    Returns the last index in the set that matches the passed object.  You
    must have a source property on the set for this to work.
    
    @param {Object} object the object to check 
    @param {Number} startAt optional starting point
    @returns {Number} found index or -1 if not in set
  */
  lastIndexOf: function(object, startAt) {
    var source  = this.source;
    if (!source) throw "%@.lastIndexOf() requires source".fmt(this);
    
    // start with the last index in the set
    var len     = source.get('length'),
        cur     = this.max-1,
        idx ;

    if (cur >= len) cur = len-1;
    while (cur>=0) {
      idx = source.lastIndexOf(object, cur);
      if (idx<0) return -1 ; // not found in source
      if (this.contains(idx)) return idx; // found in source and in set.
      cur = idx+1;
    } 
    
    return -1; // not found
  },
  
  /**
    Iterates through the objects at each index location in the set.  You must
    have a source property on the set for this to work.  The callback you pass
    will be invoked for each object in the set with the following signature:
    
    {{{
      function callback(object, index, source, indexSet) { ... }
    }}}
    
    If you pass a target, it will be used when the callback is called.
    
    @param {Function} callback function to invoke.  
    @param {Object} target optional content. otherwise uses window
    @returns {SC.IndexSet} receiver
  */ 
  forEachObject: function(callback, target) {
    var source  = this.source;
    if (!source) throw "%@.forEachObject() requires source".fmt(this);

    var content = this._content,
        cur     = 0,
        idx     = 0,
        next    = content[cur];
        
    if (target === undefined) target = null ;
    while (next !== 0) {
      
      while(cur < next) { 
        callback.call(target, source.objectAt(cur), cur, source, this); 
        cur++;
      }
      
      cur  = Math.abs(next);
      next = content[cur];
    }
    return this ;
  },
  
  /**
    Adds all indexes where the object appears to the set.  If firstOnly is 
    passed, then it will find only the first index and add it.  If  you know
    the object only appears in the source array one time, firstOnly may make
    this method faster.
    
    Requires source to work.
    
    @param {Object} object the object to add
    @returns {SC.IndexSet} receiver
  */
  addObject: function(object, firstOnly) {
    var source  = this.source;
    if (!source) throw "%@.addObject() requires source".fmt(this);

    var len = source.get('length'),
        cur = 0, idx;
        
    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx >= 0) { 
        this.add(idx);
        if (firstOnly) return this ;
        cur = idx++;
      } else return this ;
    }
    return this ;    
  },

  /**
    Adds any indexes matching the passed objects.  If firstOnly is passed, 
    then only finds the first index for each object.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.IndexSet} receiver
  */
  addObjects: function(objects, firstOnly) {
    objects.forEach(function(object) {
      this.addObject(object, firstOnly);
    }, this);
    return this;
  },
  
  /**
    Removes all indexes where the object appears to the set.  If firstOnly is 
    passed, then it will find only the first index and add it.  If  you know
    the object only appears in the source array one time, firstOnly may make
    this method faster.
    
    Requires source to work.
    
    @param {Object} object the object to add
    @returns {SC.IndexSet} receiver
  */
  removeObject: function(object, firstOnly) {
    var source  = this.source;
    if (!source) throw "%@.removeObject() requires source".fmt(this);

    var len = source.get('length'),
        cur = 0, idx;
        
    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx >= 0) { 
        this.remove(idx);
        if (firstOnly) return this ;
        cur = idx+1;
      } else return this ;
    }
    return this ;    
  },

  /**
    Removes any indexes matching the passed objects.  If firstOnly is passed, 
    then only finds the first index for each object.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.IndexSet} receiver
  */
  removeObjects: function(objects, firstOnly) {
    objects.forEach(function(object) {
      this.removeObject(object, firstOnly);
    }, this);
    return this;
  },
  
  
  // .......................................
  // PRIVATE 
  //

  /** 
    Usually observing notifications from IndexSet are not useful, so 
    supress them by default.
    
    @property {Boolean}
  */
  LOG_OBSERVING: NO,
  
  /** @private - optimized call to forEach() */
  forEach: function(callback, target) {
    var content = this._content,
        cur     = 0,
        idx     = 0,
        source  = this.source,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      while(cur < next) { 
        callback.call(target, cur++, idx++, this, source); 
      }
      cur  = Math.abs(next);
      next = content[cur];
    }
    return this ;
  },
  
  /** @private - support iterators */
  nextObject: function(ignore, idx, context) {
    var content = this._content,
        next    = context.next,
        max     = this.get('max'); // next boundary
    
    // seed.
    if (idx === null) {
      idx = next = 0 ;

    } else if (idx >= max) {
      delete context.next; // cleanup context
      return null ; // nothing left to do

    } else idx++; // look on next index
    
    // look for next non-empty range if needed.
    if (idx === next) {
      do { 
        idx = Math.abs(next);
        next = content[idx];
      } while(next < 0);
      context.next = next;
    }
    
    return idx;
  },
  
  toString: function() {
    var str = [];
    this.forEachRange(function(start, length) {
      str.push(length === 1 ? start : "%@..%@".fmt(start, start + length - 1));
    }, this);
    return "SC.IndexSet<%@>".fmt(str.join(',')) ;
  },
  
  max: 0

}) ;

SC.IndexSet.slice = SC.IndexSet.copy = SC.IndexSet.clone ;
SC.IndexSet.EMPTY = SC.IndexSet.create().freeze();

/* >>>>>>>>>> BEGIN source/system/logger.js */
// ==========================================================================
// SC.Logger
// ==========================================================================


/**
  If {@link SC.Logger.format} is true, this delimiter will be put between arguments.

  @property {String}
*/
SC.LOGGER_LOG_DELIMITER = ", ";

/**
  If {@link SC.Logger.error} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_ERROR = "ERROR: ";

/**
  If {@link SC.Logger.info} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_INFO = "INFO: ";

/**
  If {@link SC.Logger.warn} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_WARN = "WARNING: ";

/**
  If {@link SC.Logger.debug} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_DEBUG = "DEBUG: ";

/** @class

  Object to allow for safe logging actions, such as using the browser console.

  The FireFox plugin Firebug was used as a function reference. Please see
  {@link <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>}
  for further information.

  @author Colin Campbell
  @author Benedikt Böhm
  @extends SC.Object
  @since Sproutcore 1.0
  @see <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>
*/
SC.Logger = SC.Object.create({

  // ..........................................................
  // PROPERTIES
  //

  /**
    Whether or not to enable debug logging.

    @property: {Boolean}
  */
  debugEnabled: NO,

  /**
    Computed property that checks for the existence of the reporter object.

    @property {Boolean}
  */
  exists: function() {
    return typeof(this.get('reporter')) !== 'undefined' && this.get('reporter') != null;
  }.property('reporter').cacheable(),

  /**
    If console.log does not exist, SC.Logger will use window.alert instead.

    This property is only used inside {@link SC.Logger.log}. If fallBackOnLog is
    false and you call a different function, an alert will not be opened.

    @property {Boolean}
  */
  fallBackOnAlert: NO,

  /**
    If some function, such as console.dir, does not exist,
    SC.Logger will try console.log if this is true.

    @property {Boolean}
  */
  fallBackOnLog: YES,

  /**
    Whether or not to format multiple arguments together
    or let the browser deal with that.

    @property {Boolean}
  */
  format: YES,

  /**
    The reporter is the object which implements the actual logging functions.

    @default The browser's console
    @property {Object}
  */
  reporter: console,

  // ..........................................................
  // METHODS
  //

  /**
    Log output to the console, but only if it exists.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if reporter.log exists, false otherwise
  */
  log: function() {
    var reporter = this.get('reporter');

    // log through the reporter
    if (this.get('exists') && typeof(reporter.log) === "function") {
      if (this.get('format')) {
        reporter.log(this._argumentsToString.apply(this, arguments));
      }
      else {
        reporter.log.apply(reporter, arguments);
      }
      return true;
    }

    // log through alert
    else if (this.fallBackOnAlert) {
      var s = this.get('format') ? this._argumentsToString.apply(this, arguments) : arguments;
      // include support for overriding the alert through the reporter
      // if it has come this far, it's likely this will fail
      if (this.get('exists') && typeof(reporter.alert) === "function") {
        reporter.alert(s);
      }
      else {
        alert(s);
      }
      return true;
    }
    return false;
  },

  /**
    Log a debug message to the console.

    Logs the response using {@link SC.Logger.log} if reporter.debug does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  debug: function() {
    var reporter = this.get('reporter');

    if (this.get('debugEnabled') !== YES) {
      return false;
    }

    if (this.get('exists') && (typeof reporter.debug === "function")) {
      reporter.debug.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_DEBUG);
      return this.log.apply(this, a);
    }
    return false;
  },

  /**
    Prints the properties of an object.

    Logs the object using {@link SC.Logger.log} if the reporter.dir function does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {Object}
    @returns {Boolean} true if logged to console, false if not
  */
  dir: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.dir) === "function") {
      // Firebug's console.dir doesn't support multiple objects here
      // but maybe custom reporters will
      reporter.dir.apply(reporter, arguments);
      return true;
    }
    return (this.fallBackOnLog) ? this.log.apply(this, arguments) : false;
  },

  /**
    Prints an XML outline for any HTML or XML object.

    Logs the object using {@link SC.Logger.log} if reporter.dirxml function does not exist and
    {@lnk SC.Logger.fallBackOnLog} is true.

    @param {Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  dirxml: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.dirxml) === "function") {
      // Firebug's console.dirxml doesn't support multiple objects here
      // but maybe custom reporters will
      reporter.dirxml.apply(reporter, arguments);
      return true;
    }
    return (this.fallBackOnLog) ? this.log.apply(this, arguments) : false;
  },

  /**
    Log an error to the console

    Logs the error using {@link SC.Logger.log} if reporter.error does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  error: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.error) === "function") {
      reporter.error.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_ERROR);
      return this.log.apply(this, a);
    }
    return false;
  },

  /**
    Every log after this call until {@link SC.Logger.groupEnd} is called
    will be indented for readability. You can create as many levels
    as you want.

    @param {String} [title] An optional title to display above the group
    @returns {Boolean} true if reporter.group exists, false otherwise
  */
  group: function(s) {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.group) === "function") {
      reporter.group(s);
      return true;
    }
    return false;
  },

  /**
    Ends a group declared with {@link SC.Logger.group}.

    @returns {Boolean} true if the reporter.groupEnd exists, false otherwise
    @see SC.Logger.group
  */
  groupEnd: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.groupEnd) === "function") {
      reporter.groupEnd();
      return true;
    }
    return false;
  },

  /**
    Log an information response to the reporter.

    Logs the response using {@link SC.Logger.log} if reporter.info does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  info: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.info) === "function") {
      reporter.info.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_INFO);
      return this.log.apply(this, a);
    }
    return false;
  },

  /**
    Begins the JavaScript profiler, if it exists. Call {@link SC.Logger.profileEnd}
    to end the profiling process and receive a report.

    @returns {Boolean} true if reporter.profile exists, false otherwise
  */
  profile: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.profile) === "function") {
      reporter.profile();
      return true;
    }
    return false;
  },

  /**
    Ends the JavaScript profiler, if it exists.

    @returns {Boolean} true if reporter.profileEnd exists, false otherwise
    @see SC.Logger.profile
  */
  profileEnd: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.profileEnd) === "function") {
      reporter.profileEnd();
      return true;
    }
    return false;
  },

  /**
    Measure the time between when this function is called and
    {@link SC.Logger.timeEnd} is called.

    @param {String} name The name of the profile to begin
    @returns {Boolean} true if reporter.time exists, false otherwise
    @see SC.Logger.timeEnd
  */
  time: function(name) {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.time) === "function") {
      reporter.time(name);
      return true;
    }
    return false;
  },

  /**
    Ends the profile specified.

    @param {String} name The name of the profile to end
    @returns {Boolean} true if reporter.timeEnd exists, false otherwise
    @see SC.Logger.time
  */
  timeEnd: function(name) {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.timeEnd) === "function") {
      reporter.timeEnd(name);
      return true;
    }
    return false;
  },

  /**
    Prints a stack-trace.

    @returns {Boolean} true if reporter.trace exists, false otherwise
  */
  trace: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.trace) === "function") {
      reporter.trace();
      return true;
    }
    return false;
  },

  /**
    Log a warning to the console.

    Logs the warning using {@link SC.Logger.log} if reporter.warning does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  warn: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.warn) === "function") {
      reporter.warn.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_WARN);
      return this.log.apply(this, a);
    }
    return false;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /**
    @private

    The arguments function property doesn't support Array#unshift. This helper
    copies the elements of arguments to a blank array.

    @param {Array} arguments The arguments property of a function
    @returns {Array} An array containing the elements of arguments parameter
  */
  _argumentsToArray: function(arguments) {
    if (!arguments) return [];
    var a = [];
    for (var i = 0; i < arguments.length; i++) {
      a[i] = arguments[i];
    }
    return a;
  },

  /**
    @private

    Formats the arguments array of a function by creating a string
    with SC.LOGGER_LOG_DELIMITER between the elements.

    @returns {String} A string of formatted arguments
  */
  _argumentsToString: function() {
    var s = "";
    for (var i = 0; i<arguments.length - 1; i++) {
      s += arguments[i] + SC.LOGGER_LOG_DELIMITER;
    }
    s += arguments[arguments.length-1];
    return s;
  }

});

/* >>>>>>>>>> BEGIN source/system/run_loop.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('private/observer_set');

/**
  @class
  
  The run loop provides a universal system for coordinating events within
  your application.  The run loop processes timers as well as pending 
  observer notifications within your application.
  
  To use a RunLoop within your application, you should make sure your event
  handlers always begin and end with SC.RunLoop.begin() and SC.RunLoop.end()
  
  The RunLoop is important because bindings do not fire until the end of 
  your run loop is reached.  This improves the performance of your
  application.
  
  h2. Example
  
  This is how you could write your mouseup handler in jQuery:
  
  {{{
    $('#okButton').on('click', function() {
      SC.RunLoop.begin();
      
      // handle click event...
      
      SC.RunLoop.end(); // allows bindings to trigger...
    });
  }}}
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.RunLoop = SC.Object.extend(/** @scope SC.RunLoop.prototype */ {
  
  /**
    Call this method whenver you begin executing code.  
    
    This is typically invoked automatically for you from event handlers and 
    the timeout handler.  If you call setTimeout() or setInterval() yourself, 
    you may need to invoke this yourself.
    
    @returns {SC.RunLoop} receiver
  */
  beginRunLoop: function() {
    this._start = new Date().getTime() ; // can't use Date.now() in runtime
    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      console.log("-- SC.RunLoop.beginRunLoop at %@".fmt(this._start));
    } 
    this._runLoopInProgress = YES;
    return this ; 
  },
  
  /**
    YES when a run loop is in progress
  
    @property {Boolean}
  */
  isRunLoopInProgress: function() {
    return this._runLoopInProgress;
  }.property(),
  
  /**
    Call this method whenever you are done executing code.
    
    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself
    you may need to invoke this yourself.
    
    @returns {SC.RunLoop} receiver
  */
  endRunLoop: function() {
    // at the end of a runloop, flush all the delayed actions we may have 
    // stored up.  Note that if any of these queues actually run, we will 
    // step through all of them again.  This way any changes get flushed
    // out completely.
    var didChange ;

    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      console.log("-- SC.RunLoop.endRunLoop ~ flushing application queues");
    } 
    
    do {
      didChange = this.flushApplicationQueues() ;
      if (!didChange) didChange = this._flushinvokeLastQueue() ; 
    } while(didChange) ;
    this._start = null ;

    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      console.log("-- SC.RunLoop.endRunLoop ~ End");
    } 
    
    SC.RunLoop.lastRunLoopEnd = Date.now();
    this._runLoopInProgress = NO;
    
    return this ; 
  },
  
  /**
    Invokes the passed target/method pair once at the end of the runloop.
    You can call this method as many times as you like and the method will
    only be invoked once.  
    
    Usually you will not call this method directly but use invokeOnce() 
    defined on SC.Object.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Object} target
    @param {Function} method
    @returns {SC.RunLoop} receiver
  */
  invokeOnce: function(target, method) {
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    
    if (typeof method === "string") method = target[method];
    if (!this._invokeQueue) this._invokeQueue = SC.ObserverSet.create();
    this._invokeQueue.add(target, method);
    return this ;
  },
  
  /**
    Invokes the passed target/method pair at the very end of the run loop,
    once all other delayed invoke queues have been flushed.  Use this to 
    schedule cleanup methods at the end of the run loop once all other work
    (including rendering) has finished.

    If you call this with the same target/method pair multiple times it will
    only invoke the pair only once at the end of the runloop.
    
    Usually you will not call this method directly but use invokeLast() 
    defined on SC.Object.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Object} target
    @param {Function} method
    @returns {SC.RunLoop} receiver
  */
  invokeLast: function(target, method) {
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    
    if (typeof method === "string") method = target[method];
    if (!this._invokeLastQueue) this._invokeLastQueue = SC.ObserverSet.create();
    this._invokeLastQueue.add(target, method);
    return this ;
  },
  
  /**
    Executes any pending events at the end of the run loop.  This method is 
    called automatically at the end of a run loop to flush any pending 
    queue changes.
    
    The default method will invoke any one time methods and then sync any 
    bindings that might have changed.  You can override this method in a 
    subclass if you like to handle additional cleanup. 
    
    This method must return YES if it found any items pending in its queues
    to take action on.  endRunLoop will invoke this method repeatedly until
    the method returns NO.  This way if any if your final executing code
    causes additional queues to trigger, then can be flushed again.
    
    @returns {Boolean} YES if items were found in any queue, NO otherwise
  */
  flushApplicationQueues: function() {
    var hadContent = NO,
        // execute any methods in the invokeQueue.
        queue = this._invokeQueue;
    if (queue && queue.targets > 0) {
      this._invokeQueue = null; // reset so that a new queue will be created
      hadContent = YES ; // needs to execute again
      queue.invokeMethods();
    }
    
    // flush any pending changed bindings.  This could actually trigger a 
    // lot of code to execute.
    return SC.Binding.flushPendingChanges() || hadContent ;
  },
  
  _flushinvokeLastQueue: function() {
    var queue = this._invokeLastQueue, hadContent = NO ;
    if (queue && queue.targets > 0) {
      this._invokeLastQueue = null; // reset queue.
      hadContent = YES; // has targets!
      if (hadContent) queue.invokeMethods();
    }
    return hadContent ;
  }
  
});

/** 
  The current run loop.  This is created automatically the first time you
  call begin(). 
  
  @property {SC.RunLoop}
*/
SC.RunLoop.currentRunLoop = null;

/**
  The default RunLoop class.  If you choose to extend the RunLoop, you can
  set this property to make sure your class is used instead.
  
  @property {Class}
*/
SC.RunLoop.runLoopClass = SC.RunLoop;

/** 
  Begins a new run loop on the currentRunLoop.  If you are already in a 
  runloop, this method has no effect.
  
  @returns {SC.RunLoop} receiver
*/
SC.RunLoop.begin = function() {    
  var runLoop = this.currentRunLoop;
  if (!runLoop) runLoop = this.currentRunLoop = this.runLoopClass.create();
  runLoop.beginRunLoop();
  return this ;
};

/**
  Ends the run loop on the currentRunLoop.  This will deliver any final 
  pending notifications and schedule any additional necessary cleanup.
  
  @returns {SC.RunLoop} receiver
*/
SC.RunLoop.end = function() {
  var runLoop = this.currentRunLoop;
  if (!runLoop) {
    throw "SC.RunLoop.end() called outside of a runloop!";
  }
  runLoop.endRunLoop();
  return this ;
} ;

/**
  Returns YES when a run loop is in progress

  @return {Boolean}
*/
SC.RunLoop.isRunLoopInProgress = function() {
  if(this.currentRunLoop) return this.currentRunLoop.get('isRunLoopInProgress');
  return NO;
};

/**
  Executes a passed function in the context of a run loop.

  If an exception is thrown during execution, we give an error catcher the
  opportunity to handle it before allowing the exception to bubble again.

  @param {Function} callback callback to execute
  @param {Object} target context for callback
  @param {Boolean} if YES, does not start/end a new runloop if one is already running
*/
SC.run = function(callback, target, useExistingRunLoop) {
  if(useExistingRunLoop) {
    var alreadyRunning = SC.RunLoop.isRunLoopInProgress();
    if(!alreadyRunning) SC.RunLoop.begin();
    callback.call(target);
    if(!alreadyRunning) SC.RunLoop.end();
  } else {
    try {
      SC.RunLoop.begin();
      if (callback) callback.call(target);
      SC.RunLoop.end();
    } catch (e) {
      if (SC.ExceptionHandler) {
        SC.ExceptionHandler.handleException(e);
      }

      // Now that we've handled the exception, throw it again so the browser
      // can deal with it (and potentially use it for debugging).
      // (We don't throw it in IE because the user will see two errors)
      if (!SC.browser.msie) {
        throw e;
      }
    }
  }
};

/* >>>>>>>>>> BEGIN source/system/selection_set.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/object');
sc_require('mixins/enumerable');
sc_require('mixins/copyable');
sc_require('mixins/freezable');

/** @class

  A SelectionSet contains a set of objects that represent the current 
  selection.  You can select objects by either adding them to the set directly
  or indirectly by selecting a range of indexes on a source object.
  
  @extends SC.Object
  @extends SC.Enumerable
  @extends SC.Freezable
  @extends SC.Copyable
  @since SproutCore 1.0
*/
SC.SelectionSet = SC.Object.extend(SC.Enumerable, SC.Freezable, SC.Copyable, 
  /** @scope SC.SelectionSet.prototype */ {
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isSelectionSet: YES,
  
  /**
    Total number of indexes in the selection set
    
    @property {Number}
  */
  length: function() {
    var ret     = 0,
        sets    = this._sets,
        objects = this._objects;
    if (objects) ret += objects.get('length');
    if (sets) sets.forEach(function(s) { ret += s.get('length'); });
    return ret ;
  }.property().cacheable(),

  // ..........................................................
  // INDEX-BASED SELECTION
  // 

  /**
    A set of all the source objects used in the selection set.  This 
    property changes automatically as you add or remove index sets.
    
    @property {SC.Array}
  */
  sources: function() {
    var ret  = [],
        sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set, source;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.get('length')>0 && set.source) ret.push(set.source);
    }
    return ret ;
  }.property().cacheable(),
  
  /**
    Returns the index set for the passed source object or null if no items are
    seleted in the source.
    
    @param {SC.Array} source the source object
    @returns {SC.IndexSet} index set or null
  */
  indexSetForSource: function(source) {
    if (!source || !source.isSCArray) return null; // nothing to do
    
    var cache   = this._indexSetCache,
        objects = this._objects,
        ret, idx;

    // try to find in cache
    if (!cache) cache = this._indexSetCache = {};
    ret = cache[SC.guidFor(source)];
    if (ret && ret._sourceRevision && (ret._sourceRevision !== source.propertyRevision)) {
      ret = null;
    }

    // not in cache.  generate from index sets and any saved objects
    if (!ret) {
      ret = this._indexSetForSource(source, NO);
      if (ret && ret.get('length')===0) ret = null;
    
      if (objects) {
        if (ret) ret = ret.copy();
        objects.forEach(function(o) {
          if ((idx = source.indexOf(o)) >= 0) {
            if (!ret) ret = SC.IndexSet.create();
            ret.add(idx);
          }
        }, this);
      }
      
      if (ret) {
        ret = cache[SC.guidFor(source)] = ret.frozenCopy();
        ret._sourceRevision = source.propertyRevision;
      }
    }
    
    return ret;
  },
    
  /** 
    @private
  
    Internal method gets the index set for the source, ignoring objects
    that have been added directly.
  */
  _indexSetForSource: function(source, canCreate) {
    if (canCreate === undefined) canCreate = YES;

    var guid  = SC.guidFor(source),
        index = this[guid],
        sets  = this._sets,
        len   = sets ? sets.length : 0,
        ret   = null;
                
    if (index >= len) index = null;
    if (SC.none(index)) {
      if (canCreate && !this.isFrozen) {
        this.propertyWillChange('sources');
        if (!sets) sets = this._sets = [];
        ret = sets[len] = SC.IndexSet.create();
        ret.source = source ;
        this[guid] = len;
        this.propertyDidChange('sources');
      }
      
    } else ret = sets ? sets[index] : null;
    return ret ;
  },
  
  /**
    Add the passed index, range of indexSet belonging to the passed source
    object to the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    You can also pass an SC.SelectionSet to this method and all the selected
    sets will be added from their instead.
    
    @param {SC.Array} source source object or object to add.
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  add: function(source, start, length) {
    
    if (this.isFrozen) throw SC.FROZEN_ERROR ;

    var sets, len, idx, set, oldlen, newlen, setlen, objects;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.add()";
      if (source.isIndexSet) return this.add(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.add(set.source, set);
        }
        if (objects) this.addObjects(objects);
        this.endPropertyChanges();
        return this ;
        
      }
    }

    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    setlen = set.get('length');
    newlen = oldlen - setlen;
        
    set.add(start, length);

    this._indexSetCache = null;

    newlen += set.get('length');
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  /**
    Removes the passed index, range of indexSet belonging to the passed source
    object from the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    @param {SC.Array} source source object. must not be null
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  remove: function(source, start, length) {
    
    if (this.isFrozen) throw SC.FROZEN_ERROR ;
    
    var sets, len, idx, set, oldlen, newlen, setlen, objects;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.remove()";
      if (source.isIndexSet) return this.remove(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;
            
        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.remove(set.source, set);
        }
        if (objects) this.removeObjects(objects);
        this.endPropertyChanges();
        return this ;
      }
    }
    
    // save starter info
    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    newlen = oldlen - set.get('length');

    // if we have objects selected, determine if they are in the index 
    // set and remove them as well.
    if (set && (objects = this._objects)) {
      
      // convert start/length to index set so the iterator below will work...
      if (length !== undefined) {
        start = SC.IndexSet.create(start, length);
        length = undefined;
      }
      
      objects.forEach(function(object) {
        idx = source.indexOf(object);
        if (start.contains(idx)) {
          objects.remove(object);
          newlen--;
        }
      }, this);
    }
    
    // remove indexes from source index set
    set.remove(start, length);
    setlen = set.get('length');
    newlen += setlen;

    // update caches; change enumerable...
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  
  /**
    Returns YES if the selection contains the named index, range of indexes.
    
    @param {Object} source source object for range
    @param {Number} start index, start of range, range object, or indexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(source, start, length) {
    if (start === undefined && length === undefined) {
      return this.containsObject(source);
    }
    
    var set = this.indexSetForSource(source);
    if (!set) return NO ;
    return set.contains(start, length);
  },

  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.
    
    @param {Object} source source object for range
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(source, start, length) {
    var set = this.indexSetForSource(source, NO);
    if (!set) return NO ;
    return set.intersects(start, length);
  },
  
  
  // ..........................................................
  // OBJECT-BASED API
  // 

  _TMP_ARY: [],
  
  /**
    Adds the object to the selection set.  Unlike adding an index set, the 
    selection will actually track the object independent of its location in 
    the array.
    
    @param {Object} object 
    @returns {SC.SelectionSet} receiver
  */
  addObject: function(object) {  
    var ary = this._TMP_ARY, ret;
    ary[0] = object;
    
    ret = this.addObjects(ary);
    ary.length = 0;
    
    return ret;
  },
  
  /**
    Adds objects in the passed enumerable to the selection set.  Unlike adding
    an index set, the seleciton will actually track the object independent of
    its location the array.
    
    @param {SC.Enumerable} objects
    @returns {SC.SelectionSet} receiver
  */
  addObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen;
    if (!cur) cur = this._objects = SC.CoreSet.create();
    oldlen = cur.get('length');

    cur.addEach(objects);
    newlen = cur.get('length');
    
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Removes the object from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may 
    still be in the selection set.
    
    @param {Object} object 
    @returns {SC.SelectionSet} receiver
  */
  removeObject: function(object) {  
    var ary = this._TMP_ARY, ret;
    ary[0] = object;
    
    ret = this.removeObjects(ary);
    ary.length = 0;
    
    return ret;
  },
  
  /**
    Removes the objects from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may 
    still be in the selection set.
    
    @param {Object} object 
    @returns {SC.SelectionSet} receiver
  */
  removeObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen, sets;
        
    if (!cur) return this;

    oldlen = cur.get('length');

    cur.removeEach(objects);
    newlen = cur.get('length');
    
    // also remove from index sets, if present
    if (sets = this._sets) {
      sets.forEach(function(set) {
        oldlen += set.get('length');
        set.removeObjects(objects);
        newlen += set.get('length');
      }, this);
    }
    
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Returns YES if the selection contains the passed object.  This will search
    selected ranges in all source objects.
    
    @param {Object} object the object to search for
    @returns {Boolean}
  */
  containsObject: function(object) {
    // fast path
    var objects = this._objects ;
    if (objects && objects.contains(object)) return YES ;
    
    var sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set;
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.indexOf(object)>=0) return YES;
    }
    
    return NO ;
  },
  
  
  // ..........................................................
  // GENERIC HELPER METHODS
  // 
  
  /**
    Constrains the selection set to only objects found in the passed source
    object.  This will remove any indexes selected in other sources, any 
    indexes beyond the length of the content, and any objects not found in the
    set.
    
    @param {Object} source the source to limit
    @returns {SC.SelectionSet} receiver
  */
  constrain: function(source) {
    var set, len, max, objects;
    
    this.beginPropertyChanges();
    
    // remove sources other than this one
    this.get('sources').forEach(function(cur) {
      if (cur === source) return; //skip
      var set = this._indexSetForSource(source, NO);
      if (set) this.remove(source, set);
    },this); 
    
    // remove indexes beyond end of source length
    set = this._indexSetForSource(source, NO);
    if (set && ((max=set.get('max'))>(len=source.get('length')))) {
      this.remove(source, len, max-len);
    }
    
    // remove objects not in source
    if (objects = this._objects) {
      objects.forEach(function(cur) {
        if (source.indexOf(cur)<0) this.removeObject(cur);
      },this);
    }
    
    this.endPropertyChanges();
    return this ;
  },
  
  /**
    Returns YES if the passed index set or selection set contains the exact 
    same source objects and indexes as  the receiver.  If you pass any object 
    other than an IndexSet or SelectionSet, returns NO.
    
    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    var left, right, idx, len, sources, source;
    
    // fast paths
    if (!obj || !obj.isSelectionSet) return NO ;
    if (obj === this) return YES;
    if ((this._sets === obj._sets) && (this._objects === obj._objects)) return YES;
    if (this.get('length') !== obj.get('length')) return NO;
    
    // check objects
    left = this._objects;
    right = obj._objects;
    if (left || right) {
      if ((left ? left.get('length'):0) !== (right ? right.get('length'):0)) {
        return NO;
      }
      if (left && !left.isEqual(right)) return NO ;
    }

    // now go through the sets
    sources = this.get('sources');
    len     = sources.get('length');
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      left = this._indexSetForSource(source, NO);
      right = this._indexSetForSource(source, NO);
      if (!!right !== !!left) return NO ;
      if (left && !left.isEqual(right)) return NO ;
    }
    
    return YES ;
  },

  /**
    Clears the set.  Removes all IndexSets from the object
    
    @returns {SC.SelectionSet}
  */
  clear: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (this._sets) this._sets.length = 0 ; // truncate
    if (this._objects) this._objects = null;
    
    this._indexSetCache = null;
    this.propertyDidChange('length');
    this.enumerableContentDidChange();
    this.notifyPropertyChange('sources');
    
    return this ;
  },
  
  /**
   Clones the set into a new set.  
   
   @returns {SC.SelectionSet}
  */
  copy: function() {
    var ret  = this.constructor.create(),
        sets = this._sets,
        len  = sets ? sets.length : 0 ,
        idx, set;
    
    if (sets && len>0) {
      sets = ret._sets = sets.slice();
      for(idx=0;idx<len;idx++) {
        if (!(set = sets[idx])) continue ;
        set = sets[idx] = set.copy();
        ret[SC.guidFor(set.source)] = idx;
      }
    }
    
    if (this._objects) ret._objects = this._objects.copy();
    return ret ;
  },
  
  /**
    @private 
    
    Freezing a SelectionSet also freezes its internal sets.
  */
  freeze: function() {
    if (this.isFrozen) return this ;
    var sets = this._sets,
        loc  = sets ? sets.length : 0,
        set ;
        
    while(--loc >= 0) {
      if (set = sets[loc]) set.freeze();
    }
    
    if (this._objects) this._objects.freeze();
    return arguments.callee.base.apply(this,arguments);
  },
  
  // ..........................................................
  // ITERATORS
  // 
  
  /** @private */
  toString: function() {
    var sets = this._sets || [];
    sets = sets.map(function(set) { 
      return set.toString().replace("SC.IndexSet", SC.guidFor(set.source)); 
    }, this);
    if (this._objects) sets.push(this._objects.toString());
    return "SC.SelectionSet:%@<%@>".fmt(SC.guidFor(this), sets.join(','));  
  },
  
  /** @private */
  firstObject: function() {
    var sets    = this._sets,
        objects = this._objects;
        
    // if we have sets, get the first one
    if (sets && sets.get('length')>0) {
      var set  = sets ? sets[0] : null,
          src  = set ? set.source : null,
          idx  = set ? set.firstObject() : -1;
      if (src && idx>=0) return src.objectAt(idx);
    }
    
    // otherwise if we have objects, get the first one
    return objects ? objects.firstObject() : undefined;
    
  }.property(),
  
  /** @private
    Implement primitive enumerable support.  Returns each object in the 
    selection.
  */
  nextObject: function(count, lastObject, context) { 
    var objects, ret;
    
    // TODO: Make this more efficient.  Right now it collects all objects
    // first.  
    
    if (count === 0) {
      objects = context.objects = [];
      this.forEach(function(o) { objects.push(o); }, this);
      context.max = objects.length;
    }

    objects = context.objects ;
    ret = objects[count];
    
    if (count+1 >= context.max) {
      context.objects = context.max = null;
    }
    
    return ret ;
  },
  
  /** 
    Iterates over the selection, invoking your callback with each __object__.
    This will actually find the object referenced by each index in the 
    selection, not just the index.

    The callback must have the following signature:
    
    {{{
      function callback(object, index, source, indexSet) { ... }
    }}}
    
    If you pass a target, it will be used when the callback is called.
    
    @param {Function} callback function to invoke.  
    @param {Object} target optional content. otherwise uses window
    @returns {SC.SelectionSet} receiver
  */
  forEach: function(callback, target) {
    var sets = this._sets,
        objects = this._objects,
        len = sets ? sets.length : 0,
        set, idx;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEachObject(callback, target);
    }
    
    if (objects) objects.forEach(callback, target);
    return this ;
  }  
  
});

/** @private */
SC.SelectionSet.prototype.clone = SC.SelectionSet.prototype.copy;

/** 
  Default frozen empty selection set
  
  @property {SC.SelectionSet}
*/
SC.SelectionSet.EMPTY = SC.SelectionSet.create().freeze();


/* >>>>>>>>>> BEGIN source/system/sparse_array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/array') ;
sc_require('mixins/observable') ;
sc_require('mixins/delegate_support') ;

/**
  @class

  A dynamically filled array.  A SparseArray makes it easy for you to create 
  very large arrays of data but then to defer actually populating that array
  until it is actually needed.  This is often much faster than generating an
  array up front and paying the cost to load your data then.
  
  Although technically all arrays in JavaScript are "sparse" (in the sense 
  that you can read and write properties at arbitrary indexes), this array
  keeps track of which elements in the array have been populated already 
  and which ones have not.  If you try to get a value at an index that has 
  not yet been populated, the SparseArray will notify a delegate object first,
  giving the delegate a chance to populate the component.
  
  Most of the time, you will use a SparseArray to incrementally load data 
  from the server.  For example, if you have a contact list with 3,000
  contacts in it, you may create a SparseArray with a length of 3,000 and set
  that as the content for a ListView.  As the ListView tries to display the
  visible contacts, it will request them from the SparseArray, which will in
  turn notify your delegate, giving you a chance to load the contact data from
  the server.
  
  @extends SC.Enumerable
  @extends SC.Array
  @extends SC.Observable
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/

SC.SparseArray = SC.Object.extend(SC.Observable, SC.Enumerable, SC.Array, 
  SC.DelegateSupport, /** @scope SC.SparseArray.prototype */ {  

  // ..........................................................
  // LENGTH SUPPORT
  // 

  _requestingLength: 0,  
  _requestingIndex: 0,
   
  /**
    The length of the sparse array.  The delegate for the array should set 
    this length.
    
    @property {Number}
  */
  length: function() {
    var del = this.delegate ;
    if (del && SC.none(this._length) && del.sparseArrayDidRequestLength) {
      this._requestingLength++ ;
      del.sparseArrayDidRequestLength(this);
      this._requestingLength-- ;
    }
    return this._length || 0 ;
  }.property().cacheable(),

  /**
    Call this method from a delegate to provide a length for the sparse array.
    If you pass null for this property, it will essentially "reset" the array
    causing your delegate to be called again the next time another object 
    requests the array length.
  
    @param {Number} length the length or null
    @returns {SC.SparseArray} receiver
  */
  provideLength: function(length) {
    if (SC.none(length)) this._sa_content = null ;
    if (length !== this._length) {
      this._length = length ;
      if (this._requestingLength <= 0) this.enumerableContentDidChange() ;
    }
    return this ;
  },

  // ..........................................................
  // READING CONTENT 
  // 

  /** 
    The minimum range of elements that should be requested from the delegate.
    If this value is set to larger than 1, then the sparse array will always
    fit a requested index into a range of this size and request it.
    
    @property {Number}
  */
  rangeWindowSize: 1,
  
  /*
    This array contains all the start_indexes of ranges requested. This is to 
    avoid calling sparseArrayDidRequestRange to often. Indexes are removed and 
    added as range requests are completed.
  */
  requestedRangeIndex: [],
  
  /** 
    Returns the object at the specified index.  If the value for the index
    is currently undefined, invokes the didRequestIndex() method to notify
    the delegate.
    
    @param  {Number} idx the index to get
    @return {Object} the object
  */
  objectAt: function(idx) {
    var content = this._sa_content, ret ;
    if (!content) content = this._sa_content = [] ;
    if ((ret = content[idx]) === undefined) {
      this.requestIndex(idx);
      ret = content[idx]; // just in case the delegate provided immediately
    }
    return ret ;
  },

  /**
    Returns the set of indexes that are currently defined on the sparse array.
    If you pass an optional index set, the search will be limited to only 
    those indexes.  Otherwise this method will return an index set containing
    all of the defined indexes.  Currently this can be quite expensive if 
    you have a lot of indexes defined.
    
    @param {SC.IndexSet} indexes optional from indexes
    @returns {SC.IndexSet} defined indexes
  */
  definedIndexes: function(indexes) {
    var ret = SC.IndexSet.create(),
        content = this._sa_content,
        idx, len;
        
    if (!content) return ret.freeze(); // nothing to do
    
    if (indexes) {
      indexes.forEach(function(idx) { 
        if (content[idx] !== undefined) ret.add(idx);
      });
    } else {      
      len = content.length;
      for(idx=0;idx<len;idx++) {
        if (content[idx] !== undefined) ret.add(idx);
      }
    }
    
    return ret.freeze();
  },
  
  _TMP_RANGE: {},
  
  /**
    Called by objectAt() whenever you request an index that has not yet been
    loaded.  This will possibly expand the index into a range and then invoke
    an appropriate method on the delegate to request the data.
    
    It will check if the range has been already requested.
    
    @param {Number} idx the index to retrieve
    @returns {SC.SparseArray} receiver
  */
  requestIndex: function(idx) {
    var del = this.delegate;
    if (!del) return this; // nothing to do
    
    // adjust window
    var len = this.get('rangeWindowSize'), start = idx;
    if (len > 1) start = start - Math.floor(start % len);
    if (len < 1) len = 1 ;
    
    // invoke appropriate callback
    this._requestingIndex++;
    if (del.sparseArrayDidRequestRange) {
      var range = this._TMP_RANGE;
      if(this.wasRangeRequested(start)===-1){
        range.start = start;
        range.length = len;
        del.sparseArrayDidRequestRange(this, range);
        this.requestedRangeIndex.push(start);
      }
    } else if (del.sparseArrayDidRequestIndex) {
      while(--len >= 0) del.sparseArrayDidRequestIndex(this, start + len);
    }
    this._requestingIndex--;

    return this ;
  },
  
  /*
    This method is called by requestIndex to check if the range has already 
    been requested. We assume that rangeWindowSize is not changed often.
    
     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  wasRangeRequested: function(rangeStart) {
    var i, ilen;
    for(i=0, ilen=this.requestedRangeIndex.length; i<ilen; i++){
      if(this.requestedRangeIndex[i]===rangeStart) return i;
    }
    return -1;
  },
  
  /*
    This method has to be called after a request for a range has completed.
    To remove the index from the sparseArray to allow future updates on the 
    range.
    
     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  rangeRequestCompleted: function(start) { 
    var i = this.wasRangeRequested(start);
    if(i>=0) { 
      this.requestedRangeIndex.removeAt(i,1);
      return YES;
    }
    return NO;
  },
  
  /**
    This method sets the content for the specified to the objects in the 
    passed array.  If you change the way SparseArray implements its internal
    tracking of objects, you should override this method along with 
    objectAt().
    
    @param {Range} range the range to apply to
    @param {Array} array the array of objects to insert
    @returns {SC.SparseArray} reciever
  */
  provideObjectsInRange: function(range, array) {
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    var start = range.start, len = range.length;
    while(--len >= 0) content[start+len] = array[len];
    if (this._requestingIndex <= 0) this.enumerableContentDidChange() ;
    return this ;
  },

  _TMP_PROVIDE_ARRAY: [],
  _TMP_PROVIDE_RANGE: { length: 1 },
  
  /**
    Convenience method to provide a single object at a specified index.  Under
    the covers this calls provideObjectsInRange() so you can override only 
    that method and this one will still work.
    
    @param {Number} index the index to insert
    @param {Object} the object to insert
    @return {SC.SparseArray} receiver
  */
  provideObjectAtIndex: function(index, object) {
    var array = this._TMP_PROVIDE_ARRAY, range = this._TMP_PROVIDE_RANGE;
    array[0] = object;
    range.start = index;
    return this.provideObjectsInRange(range, array);
  },

  /**
    Invalidates the array content in the specified range.  This is not the 
    same as editing an array.  Rather it will cause the array to reload the
    content from the delegate again when it is requested.
    
    @param {Range} the range
    @returns {SC.SparseArray} receiver
  */
  objectsDidChangeInRange: function(range) {

    // delete cached content
    var content = this._sa_content ;
    if (content) {
      // if range covers entire length of cached content, just reset array
      if (range.start === 0 && SC.maxRange(range)>=content.length) {
        this._sa_content = null ;
        
      // otherwise, step through the changed parts and delete them.
      } else {
        var start = range.start, loc = Math.min(start + range.length, content.length);
        while (--loc>=start) content[loc] = undefined;
      }
    }    
    this.enumerableContentDidChange(range) ; // notify
    return this ;
  },
  
  /**
    Optimized version of indexOf().  Asks the delegate to provide the index 
    of the specified object.  If the delegate does not implement this method
    then it will search the internal array directly.
    
    @param {Object} obj the object to search for
    @returns {Number} the discovered index or -1 if not found
  */
  indexOf: function(obj) {
    var del = this.delegate ;
    if (del && del.sparseArrayDidRequestIndexOf) {
      return del.sparseArrayDidRequestIndexOf(this, obj);
    } else {
      var content = this._sa_content ;
      if (!content) content = this._sa_content = [] ;
      return content.indexOf(obj) ;
    }
  },  
  
  // ..........................................................
  // EDITING
  // 

  /**
    Array primitive edits the objects at the specified index unless the 
    delegate rejects the change.
    
    @param {Number} idx the index to begin to replace
    @param {Number} amt the number of items to replace
    @param {Array} objects the new objects to set instead
    @returns {SC.SparseArray} receiver
  */
  replace: function(idx, amt, objects) {
    objects = objects || [] ;

    // if we have a delegate, get permission to make the replacement.
    var del = this.delegate ;
    if (del) {
      if (!del.sparseArrayShouldReplace || 
          !del.sparseArrayShouldReplace(this, idx, amt, objects)) {
            return this;
      }
    }

    // go ahead and apply to local content.
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    content.replace(idx, amt, objects) ;
    
    // update length
    var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;
    var delta = len - amt ;
    if (!SC.none(this._length)) {
      this.propertyWillChange('length');
      this._length += delta;
      this.propertyDidChange('length');
    }

    this.enumerableContentDidChange(idx, amt, delta) ;
    return this ;
  },

  /** 
    Resets the SparseArray, causing it to reload its content from the 
    delegate again.
    
    @returns {SC.SparseArray} receiver
  */
  reset: function() {
    this._sa_content = null ;
    this._length = null ;
    this.enumerableContentDidChange() ;
    this.invokeDelegateMethod(this.delegate, 'sparseArrayDidReset', this);
    return this ;
  }
      
}) ;

/** 
  Convenience metohd returns a new sparse array with a default length already 
  provided.
  
  @param {Number} len the length of the array
  @returns {SC.SparseArray}
*/
SC.SparseArray.array = function(len) {
  return this.create({ _length: len||0 });
};

/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/runtime');
