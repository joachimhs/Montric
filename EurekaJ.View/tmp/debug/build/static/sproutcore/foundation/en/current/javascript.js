/* >>>>>>>>>> BEGIN source/system/locale.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  The Locale defined information about a specific locale, including date and
  number formatting conventions, and localization strings.  You can define
  various locales by adding them to the SC.locales hash, keyed by language
  and/or country code.
  
  On page load, the default locale will be chosen based on the current 
  languages and saved at SC.Locale.current.  This locale is used for 
  localization, etc.
  
  h2. Creating a new locale
  
  You can create a locale by simply extending the SC.Locale class and adding
  it to the locales hash:
  
  {{{
    SC.Locale.locales['en'] = SC.Locale.extend({ .. config .. }) ;
  }}}
  
  Alternatively, you could choose to base your locale on another locale by
  extending that locale:
  
  {{{
    SC.Locale.locales['en-US'] = SC.Locale.locales['en'].extend({ ... }) ;
  }}}
  
  Note that if you do not define your own strings property, then your locale
  will inherit any strings added to the parent locale.  Otherwise you must
  implement your own strings instead.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Locale = SC.Object.extend({
  
  init: function() {
    // make sure we know the name of our own locale.
    if (!this.language) SC.Locale._assignLocales();
    
    // Make sure we have strings that were set using the new API.  To do this
    // we check to a bool that is set by one of the string helpers.  This 
    // indicates that the new API was used. If the new API was not used, we
    // check to see if the old API was used (which places strings on the 
    // String class). 
    if (!this.hasStrings) {
      var langs = this._deprecatedLanguageCodes || [] ;
      langs.push(this.language);
      var idx = langs.length ;
      var strings = null ;
      while(!strings && --idx >= 0) {
        strings = String[langs[idx]];
      }
      if (strings) {
        this.hasStrings = YES; 
        this.strings = strings ;
      }
    }
  },
  
  /** Set to YES when strings have been added to this locale. */
  hasStrings: NO,
  
  /** The strings hash for this locale. */
  strings: {},
  
  toString: function() {
    if (!this.language) SC.Locale._assignLocales() ;
    return "SC.Locale["+this.language+"]"+SC.guidFor(this) ;
  },
  
  /** 
    Returns the localized version of the string or the string if no match
    was found.
    
    @param {String} string
    @param {String} optional default string to return instead
    @returns {String}
  */
  locWithDefault: function(string, def) {
    var ret = this.strings[string];
    
    // strings may be blank, so test with typeOf.
    if (SC.typeOf(ret) === SC.T_STRING) return ret;
    else if (SC.typeOf(def) === SC.T_STRING) return def;
    return string;
  }
  
  
}) ;

SC.Locale.mixin(/** @scope SC.Locale */ {

  /**
    If YES, localization will favor the detected language instead of the
    preferred one.
  */
  useAutodetectedLanguage: NO,
  
  /**
    This property is set by the build tools to the current build language.
  */
  preferredLanguage: null,
  
  /** 
    Invoked at the start of SproutCore's document onready handler to setup 
    the currentLocale.  This will use the language properties you have set on
    the locale to make a decision.
  */
  createCurrentLocale: function() {

    // get values from String if defined for compatibility with < 1.0 build 
    // tools.
    var autodetect = (String.useAutodetectedLanguage !== undefined) ? String.useAutodetectedLanguage : this.useAutodetectedLanguage; 
    var preferred = (String.preferredLanguage !== undefined) ? String.preferredLanguage : this.preferredLanguage ;

    // determine the language
    var lang = ((autodetect) ? SC.browser.language : null) || preferred || SC.browser.language || 'en';
    lang = SC.Locale.normalizeLanguage(lang) ;

    // get the locale class.  If a class cannot be found, fall back to generic
    // language then to english.
    var klass = this.localeClassFor(lang) ;

    // if the detected language does not match the current language (or there
    // is none) then set it up.
    if (lang != this.currentLanguage) {
      this.currentLanguage = lang ; // save language
      this.currentLocale = klass.create(); // setup locale
    }
    return this.currentLocale ;
  },

  /**
    Finds the locale class for the names language code or creates on based on
    its most likely parent.
  */
  localeClassFor: function(lang) {
    lang = SC.Locale.normalizeLanguage(lang) ;
    var parent, klass = this.locales[lang];
    
    // if locale class was not found and there is a broader-based locale
    // present, create a new locale based on that.
    if (!klass && ((parent = lang.split('-')[0]) !== lang) && (klass = this.locales[parent])) {
      klass = this.locales[lang] = klass.extend() ;      
    }
    
    // otherwise, try to create a new locale based on english.
    if (!klass) klass = this.locales[lang] = this.locales.en.extend();
    
    return klass;
  },

  /** 
    Shorthand method to define the settings for a particular locale.
    The settings you pass here will be applied directly to the locale you
    designate.  

    If you are already holding a reference to a locale definition, you can
    also use this method to operate on the receiver.
    
    If the locale you name does not exist yet, this method will create the 
    locale for you, based on the most closely related locale or english.  For 
    example, if you name the locale 'fr-CA', you will be creating a locale for
    French as it is used in Canada.  This will be based on the general French
    locale (fr), since that is more generic.  On the other hand, if you create
    a locale for manadarin (cn), it will be based on generic english (en) 
    since there is no broader language code to match against.

    @param {String} localeName
    @param {Hash} options
    @returns {SC.Locale} the defined locale
  */
  define: function(localeName, options) {
    var locale ;
    if (options===undefined && (SC.typeOf(localeName) !== SC.T_STRING)) {
      locale = this; options = localeName ;
    } else locale = SC.Locale.localeClassFor(localeName) ;
    SC.mixin(locale.prototype, options) ;
    return locale ;
  },
  
  /**
    Gets the current options for the receiver locale.  This is useful for 
    inspecting registered locales that have not been instantiated.
    
    @returns {Hash} options + instance methods
  */
  options: function() { return this.prototype; },
  
  /**
    Adds the passed hash of strings to the locale's strings table.  Note that
    if the receiver locale inherits its strings from its parent, then the 
    strings table will be cloned first.
    
    @returns {Object} receiver
  */
  addStrings: function(stringsHash) {
    // make sure the target strings hash exists and belongs to the locale
    var strings = this.prototype.strings ;
    if (strings) {
      if (!this.prototype.hasOwnProperty('strings')) {
        this.prototype.strings = SC.clone(strings) ;
      }
    } else strings = this.prototype.strings = {} ;
    
    // add strings hash
    if (stringsHash)  this.prototype.strings = SC.mixin(strings, stringsHash) ;
    this.prototype.hasStrings = YES ;
    return this;
  },
  
  _map: { english: 'en', french: 'fr', german: 'de', japanese: 'ja', jp: 'ja', spanish: 'es' },
  
  /**
    Normalizes the passed language into a two-character language code.
    This method allows you to specify common languages in their full english
    name (i.e. English, French, etc). and it will be treated like their two
    letter code equivalent.
    
    @param {String} languageCode
    @returns {String} normalized code
  */
  normalizeLanguage: function(languageCode) {
    if (!languageCode) return 'en' ;
    return SC.Locale._map[languageCode.toLowerCase()] || languageCode ;
  },
  
  // this method is called once during init to walk the installed locales 
  // and make sure they know their own names.
  _assignLocales: function() {
    for(var key in this.locales) this.locales[key].prototype.language = key;
  },
  
  toString: function() {
    if (!this.prototype.language) SC.Locale._assignLocales() ;
    return "SC.Locale["+this.prototype.language+"]" ;
  },
  
  // make sure important properties are copied to new class. 
  extend: function() {
    var ret= SC.Object.extend.apply(this, arguments) ;
    ret.addStrings= SC.Locale.addStrings;
    ret.define = SC.Locale.define ;
    ret.options = SC.Locale.options ;
    ret.toString = SC.Locale.toString ;
    return ret ;
  }
    
}) ;

/** 
  This locales hash contains all of the locales defined by SproutCore and
  by your own application.  See the SC.Locale class definition for the
  various properties you can set on your own locales.
  
  @property {Hash}
*/
SC.Locale.locales = {
  en: SC.Locale.extend({ _deprecatedLanguageCodes: ['English'] }),
  fr: SC.Locale.extend({ _deprecatedLanguageCodes: ['French'] }),
  de: SC.Locale.extend({ _deprecatedLanguageCodes: ['German'] }),
  ja: SC.Locale.extend({ _deprecatedLanguageCodes: ['Japanese', 'jp'] }),
  es: SC.Locale.extend({ _deprecatedLanguageCodes: ['Spanish'] })
} ;




/**
  This special helper will store the strings you pass in the locale matching
  the language code.  If a locale is not defined from the language code you
  specify, then one will be created for you with the english locale as the 
  parent.
  
  @param {String} languageCode
  @param {Hash} strings
  @returns {Object} receiver 
*/
SC.stringsFor = function(languageCode, strings) {
  // get the locale, creating one if needed.
  var locale = SC.Locale.localeClassFor(languageCode);
  locale.addStrings(strings) ;
  return this ;
} ;



/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');

SC.stringsFor('English', {
  '_SC.DateTime.dayNames': 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday',
  '_SC.DateTime.abbreviatedDayNames': 'Sun Mon Tue Wed Thu Fri Sat',
  '_SC.DateTime.monthNames': 'January February March April May June July August September October November December',
  '_SC.DateTime.abbreviatedMonthNames': 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'
}) ;

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Indicates that the collection view expects to accept a drop ON the specified
  item.
  
  @property {Number}
*/
SC.DROP_ON = 0x01 ;

/**
  Indicates that the collection view expects to accept a drop BEFORE the 
  specified item.
  
  @property {Number}
*/
SC.DROP_BEFORE = 0x02 ;

/**
  Indicates that the collection view expects to accept a drop AFTER the
  specified item.  This is treated just like SC.DROP_BEFORE is most views
  except for tree lists.
  
  @property {Number}
*/
SC.DROP_AFTER = 0x04 ;

/**
  Indicates that the collection view want's to know which operations would 
  be allowed for either drop operation.
  
  @property {Number}
*/
SC.DROP_ANY = 0x07 ;


/**
  This variable is here to make the tab focus behavior work like safari's.
*/
SC.SAFARI_FOCUS_BEHAVIOR = YES;

SC.mixin(/** @lends SC */ {
  
  /**
    Reads or writes data from a global cache.  You can use this facility to
    store information about an object without actually adding properties to
    the object itself.  This is needed especially when working with DOM,
    which can leak easily in IE.
    
    To read data, simply pass in the reference element (used as a key) and
    the name of the value to read.  To write, also include the data.
    
    You can also just pass an object to retrieve the entire cache.
    
    @param elem {Object} An object or Element to use as scope
    @param name {String} Optional name of the value to read/write
    @param data {Object} Optional data.  If passed, write.
    @returns {Object} the value of the named data
  */
  data: function(elem, name, data) {
    elem = (elem === window) ? "@window" : elem ;
    var hash = SC.hashFor(elem) ; // get the hash key
    
    // Generate the data cache if needed
    var cache = SC._data_cache ;
    if (!cache) SC._data_cache = cache = {} ;
    
    // Now get cache for element
    var elemCache = cache[hash] ;
    if (name && !elemCache) cache[hash] = elemCache = {} ;
    
    // Write data if provided 
    if (elemCache && (data !== undefined)) elemCache[name] = data ;
    
    return (name) ? elemCache[name] : elemCache ;
  },
  
  /**
    Removes data from the global cache.  This is used throughout the
    framework to hold data without creating memory leaks.
    
    You can remove either a single item on the cache or all of the cached 
    data for an object.
    
    @param elem {Object} An object or Element to use as scope
    @param name {String} optional name to remove. 
    @returns {Object} the value or cache that was removed
  */
  removeData: function(elem, name) {
    elem = (elem === window) ? "@window" : elem ;
    var hash = SC.hashFor(elem) ;
    
    // return undefined if no cache is defined
    var cache = SC._data_cache ;
    if (!cache) return undefined ;
    
    // return undefined if the elem cache is undefined
    var elemCache = cache[hash] ;
    if (!elemCache) return undefined;
    
    // get the return value
    var ret = (name) ? elemCache[name] : elemCache ;
    
    // and delete as appropriate
    if (name) {
      delete elemCache[name] ;
    } else {
      delete cache[hash] ;
    }
    
    return ret ;
  }
}) ;

SC.mixin(Function.prototype, /** @scope Function.prototype */ {
  /**
    Creates a timer that will execute the function after a specified 
    period of time.
    
    If you pass an optional set of arguments, the arguments will be passed
    to the function as well.  Otherwise the function should have the 
    signature:
    
    {{{
      function functionName(timer)
    }}}

    @param target {Object} optional target object to use as this
    @param interval {Number} the time to wait, in msec
    @returns {SC.Timer} scheduled timer
  */
  invokeLater: function(target, interval) {
    if (interval === undefined) interval = 1 ;
    var f = this;
    if (arguments.length > 2) {
      var args = SC.$A(arguments).slice(2,arguments.length);
      args.unshift(target);
      // f = f.bind.apply(f, args) ;
      var that = this, func = f ;
      f = function() { return func.apply(that, args.slice(1)); } ;
    }
    return SC.Timer.schedule({ target: target, action: f, interval: interval });
  }    

});

/* >>>>>>>>>> BEGIN source/controllers/controller.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  The controller base class provides some common functions you will need
  for controllers in your applications, especially related to maintaining
  an editing context.
  
  In general you will not use this class, but you can use a subclass such
  as ObjectController, TreeController, or ArrayController.
  
  h2. EDITING CONTEXTS
  
  One major function of a controller is to mediate between changes in the
  UI and changes in the model.  In particular, you usually do not want 
  changes you make in the UI to be applied to a model object directly.  
  Instead, you often will want to collect changes to an object and then
  apply them only when the user is ready to commit their changes.
  
  The editing contact support in the controller class will help you
  provide this capability.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Controller = SC.Object.extend(
/** @scope SC.Controller.prototype */ {
  
  /**
    Makes a controller editable or not editable.  The SC.Controller class 
    itself does not do anything with this property but subclasses will 
    respect it when modifying content.
    
    @property {Boolean}
  */
  isEditable: YES

});

/* >>>>>>>>>> BEGIN source/mixins/selection_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/**
  @namespace
  
  Implements common selection management properties for controllers.
  
  Selection can be managed by any controller in your applications.  This
  mixin provides some common management features you might want such as
  disabling selection, or restricting empty or multiple selections.
  
  To use this mixin, simply add it to any controller you want to manage 
  selection and call updateSelectionAfterContentChange()
  whenever your source content changes.  You can also override the properties
  defined below to configure how the selection management will treat your 
  content.
  
  This mixin assumes the arrangedObjects property will return an SC.Array of 
  content you want the selection to reflect.
  
  Add this mixin to any controller you want to manage selection.  It is 
  already applied to the CollectionController and ArrayController.
  
  @since SproutCore 1.0
*/
SC.SelectionSupport = {

  // ..........................................................
  // PROPERTIES
  // 
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  hasSelectionSupport: YES,

  /**
    If YES, selection is allowed. Default is YES.
    
    @property {Boolean}
  */
  allowsSelection: YES,

  /**
    If YES, multiple selection is allowed. Default is YES.
    
    @property {Boolean}
  */
  allowsMultipleSelection: YES,

  /**
    If YES, allow empty selection Default is YES.
    
    @property {Boolean}
  */
  allowsEmptySelection: YES,

  /**
    Override to return the first selectable object.  For example, if you 
    have groups or want to otherwise limit the kinds of objects that can be
    selected.
    
    the default imeplementation returns firstObject property.
    
    @returns {Object} first selectable object
  */
  firstSelectableObject: function() {
    return this.get('firstObject');
  }.property(),

  /**
    This is the current selection.  You can make this selection and another
    controller's selection work in concert by binding them together. You
    generally have a master selection that relays changes TO all the others.
    
    @property {SC.SelectionSet}
  */
  selection: function(key, value) {

    var old = this._scsel_selection,
    oldlen = old ? old.get('length') : 0,
    content,
    empty,
    len;

    // whenever we have to recompute selection, reapply all the conditions to
    // the selection.  This ensures that changing the conditions immediately
    // updates the selection.
    // 
    // Note also if we don't allowSelection, we don't clear the old selection;
    // we just don't allow it to be changed.
    if ((value === undefined) || !this.get('allowsSelection')) value = old;

    len = (value && value.isEnumerable) ? value.get('length') : 0;

    // if we don't allow multiple selection
    if ((len > 1) && !this.get('allowsMultipleSelection')) {

      if (oldlen > 1) {
        value = SC.SelectionSet.create().addObject(old.get('firstObject')).freeze();
        len = 1;
      } else {
        value = old;
        len = oldlen;
      }
    }

    // if we don't allow empty selection, block that also.  select first 
    // selectable item if necessary.
    if ((len === 0) && !this.get('allowsEmptySelection')) {
      if (oldlen === 0) {
        value = this.get('firstSelectableObject');
        if (value) value = SC.SelectionSet.create().addObject(value).freeze();
        else value = SC.SelectionSet.EMPTY;
        len = value.get('length');

      } else {
        value = old;
        len = oldlen;
      }
    }

    // if value is empty or is not enumerable, then use empty set
    if (len === 0) value = SC.SelectionSet.EMPTY;

    // always use a frozen copy...
    value = value.frozenCopy();
    this._scsel_selection = value;

    return value;

  }.property('arrangedObjects', 'allowsEmptySelection', 'allowsMultipleSelection', 'allowsSelection').cacheable(),

  /**
    YES if the receiver currently has a non-zero selection.
    
    @property {Boolean}
  */
  hasSelection: function() {
    var sel = this.get('selection');
    return !! sel && (sel.get('length') > 0);
  }.property('selection').cacheable(),

  // ..........................................................
  // METHODS
  // 
  /**
    Selects the passed objects in your content.  If you set "extend" to YES,
    then this will attempt to extend your selection as well.
  
    @param {SC.Enumerable} objects objects to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObjects: function(objects, extend) {

    // handle passing an empty array
    if (!objects || objects.get('length') === 0) {
      if (!extend) this.set('selection', SC.SelectionSet.EMPTY);
      return this;
    }

    var sel = this.get('selection');
    if (extend && sel) sel = sel.copy();
    else sel = SC.SelectionSet.create();

    sel.addObjects(objects).freeze();
    this.set('selection', sel);
    return this;
  },

  /**
    Selects a single passed object in your content.  If you set "extend" to 
    YES then this will attempt to extend your selection as well.
    
    @param {Object} object object to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObject: function(object, extend) {
    if (object === null) {
      if (!extend) this.set('selection', null);
      return this;

    } else return this.selectObjects([object], extend);
  },

  /**
    Deselects the passed objects in your content.
    
    @param {SC.Enumerable} objects objects to select
    @returns {Object} receiver
  */
  deselectObjects: function(objects) {

    if (!objects || objects.get('length') === 0) return this; // nothing to do
    var sel = this.get('selection');
    if (!sel || sel.get('length') === 0) return this; // nothing to do
    // find index for each and remove it
    sel = sel.copy().removeObjects(objects).freeze();
    this.set('selection', sel.freeze());
    return this;
  },

  /**
    Deselects the passed object in your content.
    
    @param {SC.Object} object single object to select
    @returns {Object} receiver
  */
  deselectObject: function(object) {
    if (!object) return this; // nothing to do
    else return this.deselectObjects([object]);
  },

  /**
    Call this method whenever your source content changes to ensure the 
    selection always remains up-to-date and valid.
    
    @returns {Object}
  */
  updateSelectionAfterContentChange: function() {
    var arrangedObjects = this.get('arrangedObjects');
    var selectionSet = this.get('selection');
    var allowsEmptySelection = this.get('allowsEmptySelection');
    var indexSet; // Selection index set for arranged objects

    // If we don't have any selection, there's nothing to update
    if (!selectionSet) return this;
    // Remove any selection set objects that are no longer in the content
    indexSet = selectionSet.indexSetForSource(arrangedObjects);
    if ((indexSet && (indexSet.get('length') !== selectionSet.get('length'))) || (!indexSet && (selectionSet.get('length') > 0))) { // then the selection content has changed
      selectionSet = selectionSet.copy().constrain(arrangedObjects).freeze();
      this.set('selection', selectionSet);
    }
    
    // Reselect an object if required (if content length > 0)
    if ((selectionSet.get('length') === 0) && arrangedObjects && (arrangedObjects.get('length') > 0) && !allowsEmptySelection) {
      this.selectObject(this.get('firstSelectableObject'), NO);
    }

    return this;
  }

};

/* >>>>>>>>>> BEGIN source/controllers/array.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('controllers/controller');
sc_require('mixins/selection_support');

/**
  @class

  An ArrayController provides a way for you to publish an array of objects
  for CollectionView or other controllers to work with.  To work with an 
  ArrayController, set the content property to the array you want the 
  controller to manage.  Then work directly with the controller object as if
  it were the array itself.
  
  When you want to display an array of objects in a CollectionView, bind the
  "arrangedObjects" of the array controller to the CollectionView's "content"
  property.  This will automatically display the array in the collection view.

  @extends SC.Controller
  @extends SC.Array
  @extends SC.SelectionSupport
  @author Charles Jolley
  @since SproutCore 1.0
*/
SC.ArrayController = SC.Controller.extend(SC.Array, SC.SelectionSupport,
/** @scope SC.ArrayController.prototype */ {

  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    The content array managed by this controller.  
    
    You can set the content of the ArrayController to any object that 
    implements SC.Array or SC.Enumerable.  If you set the content to an object
    that implements SC.Enumerable only, you must also set the orderBy property
    so that the ArrayController can order the enumerable for you.
    
    If you set the content to a non-enumerable and non-array object, then the
    ArrayController will wrap the item in an array in an attempt to normalize
    the result.
    
    @property {SC.Array}
  */
  content: null,

  /**
    Makes the array editable or not.  If this is set to NO, then any attempts
    at changing the array content itself will throw an exception.
    
    @property {Boolean}
  */
  isEditable: YES,
  
  /**
    Used to sort the array.
    
    If you set this property to a key name, array of key names, or a function,
    then then ArrayController will automatically reorder your content array
    to match the sort order.  (If you set a function, the function will be
    used to sort).

    Normally, you should only use this property if you set the content of the
    controller to an unordered enumerable such as SC.Set or SC.SelectionSet.
    In this case the orderBy property is required in order for the controller
    to property order the content for display.
    
    If you set the content to an array, it is usually best to maintain the 
    array in the proper order that you want to display things rather than 
    using this method to order the array since it requires an extra processing
    step.  You can use this orderBy property, however, for displaying smaller 
    arrays of content.
    
    Note that you can only to use addObject() to insert new objects into an
    array that is ordered.  You cannot manually reorder or insert new objects
    into specific locations because the order is managed by this property 
    instead.
    
    If you pass a function, it should be suitable for use in compare().
    
    @property {String|Array|Function}
  */
  orderBy: null,
    
  /**
    Set to YES if you want the controller to wrap non-enumerable content    
    in an array and publish it.  Otherwise, it will treat single content like 
    null content.
    
    @property {Boolean}
  */
  allowsSingleContent: YES,
  
  /**
    Set to YES if you want objects removed from the array to also be
    deleted.  This is a convenient way to manage lists of items owned
    by a parent record object.
    
    Note that even if this is set to NO, calling destroyObject() instead of
    removeObject() will still destroy the object in question as well as 
    removing it from the parent array.
    
    @property {Boolean}
  */
  destroyOnRemoval: NO,

  /**
    Returns an SC.Array object suitable for use in a CollectionView.  
    Depending on how you have your ArrayController configured, this property
    may be one of several different values.  
    
    @property {SC.Array}
  */
  arrangedObjects: function() {
    return this;
  }.property().cacheable(),
  
  /**
    Computed property indicates whether or not the array controller can 
    remove content.  You can delete content only if the content is not single
    content and isEditable is YES.
    
    @property {Boolean}
  */
  canRemoveContent: function() {
    var content = this.get('content'), ret;
    ret = !!content && this.get('isEditable') && this.get('hasContent');
    if (ret) {
      return !content.isEnumerable || 
             (SC.typeOf(content.removeObject) === SC.T_FUNCTION);
    } else return NO ;
  }.property('content', 'isEditable', 'hasContent'),
  
  /**
    Computed property indicates whether you can reorder content.  You can
    reorder content as long a the controller isEditable and the content is a
    real SC.Array-like object.  You cannot reorder content when orderBy is
    non-null.
    
    @property {Boolean}
  */
  canReorderContent: function() {
    var content = this.get('content'), ret;
    ret = !!content && this.get('isEditable') && !this.get('orderBy');
    return ret && !!content.isSCArray;
  }.property('content', 'isEditable', 'orderBy'),
  
  /**
    Computed property insides whether you can add content.  You can add 
    content as long as the controller isEditable and the content is not a 
    single object.
    
    Note that the only way to simply add object to an ArrayController is to
    use the addObject() or pushObject() methods.  All other methods imply 
    reordering and will fail.
    
    @property {Boolean}
  */
  canAddContent: function() {
    var content = this.get('content'), ret ;
    ret = content && this.get('isEditable') && content.isEnumerable;
    if (ret) {
      return (SC.typeOf(content.addObject) === SC.T_FUNCTION) || 
             (SC.typeOf(content.pushObject) === SC.T_FUNCTION); 
    } else return NO ;
  }.property('content', 'isEditable'),
  
  /**
    Set to YES if the controller has valid content that can be displayed,
    even an empty array.  Returns NO if the content is null or not enumerable
    and allowsSingleContent is NO.
    
    @property {Boolean}
  */
  hasContent: function() {
    var content = this.get('content');
    return !!content && 
           (!!content.isEnumerable || !!this.get('allowsSingleContent'));
  }.property('content', 'allowSingleContent'),

  /**
    Returns the current status property for the content.  If the content does
    not have a status property, returns SC.Record.READY.
    
    @property {Number}
  */
  status: function() {
    var content = this.get('content'),
        ret = content ? content.get('status') : null;
    return ret ? ret : SC.Record.READY;
  }.property().cacheable(),
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Adds an object to the array.  If the content is ordered, this will add the 
    object to the end of the content array.  The content is not ordered, the
    location depends on the implementation of the content.
    
    If the source content does not support adding an object, then this method 
    will throw an exception.
    
    @param {Object} object the object to add
    @returns {SC.ArrayController} receiver
  */
  addObject: function(object) {
    if (!this.get('canAddContent')) throw "%@ cannot add content".fmt(this);
    
    var content = this.get('content');
    if (content.isSCArray) content.pushObject(object);
    else if (content.addObject) content.addObject(object);
    else throw "%@.content does not support addObject".fmt(this);
    
    return this;
  },
  
  /**
    Removes the passed object from the array.  If the underyling content 
    is a single object, then this simply sets the content to null.  Otherwise
    it will call removeObject() on the content.
    
    Also, if destroyOnRemoval is YES, this will actually destroy the object.
    
    @param {Object} object the object to remove
    @returns {SC.ArrayController} receiver
  */
  removeObject: function(object) {
    if (!this.get('canRemoveContent')) {
      throw "%@ cannot remove content".fmt(this);
    }
    
    var content = this.get('content');
    if (content.isEnumerable) content.removeObject(object);
    else {
      this.set('content', null);
    }
    
    if (this.get('destroyOnRemoval') && object.destroy) object.destroy();
    return this; 
  },
  
  // ..........................................................
  // SC.ARRAY SUPPORT
  // 

  /**
    Compute the length of the array based on the observable content
    
    @property {Number}
  */
  length: function() {
    var content = this._scac_observableContent();
    return content ? content.get('length') : 0;
  }.property().cacheable(),

  /** @private
    Returns the object at the specified index based on the observable content
  */
  objectAt: function(idx) {
    var content = this._scac_observableContent();
    return content ? content.objectAt(idx) : undefined ;    
  },
  
  /** @private
    Forwards a replace on to the content, but only if reordering is allowed.
  */
  replace: function(start, amt, objects) {
    // check for various conditions before a replace is allowed
    if (!objects || objects.get('length')===0) {
      if (!this.get('canRemoveContent')) {
        throw "%@ cannot remove objects from the current content".fmt(this);
      }
    } else if (!this.get('canReorderContent')) {
      throw "%@ cannot add or reorder the current content".fmt(this);
    }    
    
    // if we can do this, then just forward the change.  This should fire
    // updates back up the stack, updating rangeObservers, etc.
    var content = this.get('content'); // note: use content, not observable
    var objsToDestroy = [], i, objsLen;
    if (this.get('destroyOnRemoval')){
      for(i=0; i<amt; i++){
        objsToDestroy.push(content.objectAt(i+start));
      }
    }
    
    if (content) content.replace(start, amt, objects);
    for(i=0, objsLen = objsToDestroy.length; i<objsLen; i++){
      
      objsToDestroy[i].destroy();
    }
    objsToDestroy = null;
    
    return this; 
  },

  indexOf: function(object, startAt) {
    var content = this._scac_observableContent();
    return content ? content.indexOf(object, startAt) : -1;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._scac_contentDidChange();
  },
  
  /** @private
    Cached observable content property.  Set to NO to indicate cache is 
    invalid.
  */
  _scac_cached: NO,
  
  /**
    @private
    
    Returns the current array this controller is actually managing.  Usually
    this should be the same as the content property, but sometimes we need to
    generate something different because the content is not a regular array.
    
    Passing YES to the force parameter will force this value to be recomputed.
  
    @returns {SC.Array} observable or null
  */
  _scac_observableContent: function() {
    var ret = this._scac_cached;
    if (ret !== NO) return ret;
    
    var content = this.get('content'),
        orderBy, func, t, len;
    
    // empty content
    if (SC.none(content)) return this._scac_cached = [];

    // wrap non-enumerables
    if (!content.isEnumerable) {
      ret = this.get('allowsSingleContent') ? [content] : [];
      return (this._scac_cached = ret);
    } 
    
    // no-wrap
    orderBy = this.get('orderBy');
    if (!orderBy) {
      if (content.isSCArray) return (this._scac_cached = content) ;
      else throw "%@.orderBy is required for unordered content".fmt(this);     
    }
    
    // all remaining enumerables must be sorted.
    
    // build array - then sort it
    switch(SC.typeOf(orderBy)) {
    case SC.T_STRING:
      orderBy = [orderBy];
      break;
    case SC.T_FUNCTION:
      func = orderBy ;
      break;
    case SC.T_ARRAY:
      break;
    default:
      throw "%@.orderBy must be Array, String, or Function".fmt(this);
    }
        
    // generate comparison function if needed - use orderBy
    if (!func) {  
      len = orderBy.get('length');
      func = function(a,b) {
        var idx=0, status=0, key, aValue, bValue, descending;
        for(idx=0;(idx<len)&&(status===0);idx++) {
          key = orderBy.objectAt(idx);
          descending = NO;
          
          if (key.indexOf('ASC') > -1) {
            key = key.split('ASC ')[1];
          } else if (key.indexOf('DESC') > -1) {
            key = key.split('DESC ')[1];
            descending = YES;
          }
        
          if (!a) aValue = a ;
          else if (a.isObservable) aValue = a.get(key);
          else aValue = a[key];

          if (!b) bValue = b ;
          else if (b.isObservable) bValue = b.get(key);
          else bValue = b[key];
        
          status = SC.compare(aValue, bValue);
          if (descending) status = (-1) * status;
        }
        return status ;
      };
    }

    ret = [];
    content.forEach(function(o) { ret.push(o); });
    ret.sort(func);
    
    func = null ; // avoid memory leaks
    return (this._scac_cached = ret) ;
  },
  
  /** @private
    Whenever content changes, setup and teardown observers on the content
    as needed.
  */
  _scac_contentDidChange: function() {

    this._scac_cached = NO; // invalidate observable content
    
    var cur    = this.get('content'),
        orders = !!this.get('orderBy'),
        last   = this._scac_content,
        oldlen = this._scac_length || 0,
        ro     = this._scac_rangeObserver,
        func   = this._scac_rangeDidChange,
        efunc  = this._scac_enumerableDidChange,
        sfunc  = this._scac_contentStatusDidChange,
        newlen;
        
    if (last === cur) return this; // nothing to do

    // teardown old observer
    if (last) {
      if (ro && last.isSCArray) last.removeRangeObserver(ro);
      else if (last.isEnumerable) last.removeObserver('[]', this, efunc);
      last.removeObserver('status', this, sfunc);
    }
    
    ro = null;
    
    // save new cached values 
    this._scac_cached = NO;
    this._scac_content = cur ;
    
    // setup new observers
    // also, calculate new length.  do it manually instead of using 
    // get(length) because we want to avoid computed an ordered array.
    if (cur) {
      if (!orders && cur.isSCArray) ro = cur.addRangeObserver(null,this,func);
      else if (cur.isEnumerable) cur.addObserver('[]', this, efunc);
      newlen = cur.isEnumerable ? cur.get('length') : 1; 
      cur.addObserver('status', this, sfunc);
      
    } else newlen = SC.none(cur) ? 0 : 1;

    this._scac_rangeObserver = ro;
    

    // finally, notify enumerable content has changed.
    this._scac_length = newlen;
    this._scac_contentStatusDidChange();
    this.enumerableContentDidChange(0, newlen, newlen - oldlen);
    this.updateSelectionAfterContentChange();
  }.observes('content'),
  
  /** @private
    Whenever enumerable content changes, need to regenerate the 
    observableContent and notify that the range has changed.  
    
    This is called whenever the content enumerable changes or whenever orderBy
    changes.
  */
  _scac_enumerableDidChange: function() {
    var content = this.get('content'), // use content directly
        newlen  = content ? content.get('length') : 0,
        oldlen  = this._scac_length;
        
    this._scac_length = newlen;
    this.beginPropertyChanges();
    this._scac_cached = NO; // invalidate
    this.enumerableContentDidChange(0, newlen, newlen-oldlen);
    this.endPropertyChanges();
    this.updateSelectionAfterContentChange();
  }.observes('orderBy'),
  
  /** @private
    Whenever array content changes, need to simply forward notification.
    
    Assumes that content is not null and is SC.Array.
  */
  _scac_rangeDidChange: function(array, objects, key, indexes) {
    if (key !== '[]') return ; // nothing to do
    
    var content = this.get('content');
    this._scac_length = content.get('length');
    this._scac_cached = NO; // invalidate
    
    // if array length has changed, just notify every index from min up
    if (indexes) {
      this.beginPropertyChanges();
      indexes.forEachRange(function(start, length) {
        this.enumerableContentDidChange(start, length, 0);
      }, this);
      this.endPropertyChanges();
      this.updateSelectionAfterContentChange();
    }
  },
  
  /** @private
    Whenver the content "status" property changes, relay out.
  */
  _scac_contentStatusDidChange: function() {
    this.notifyPropertyChange('status');
  }
  
});

/* >>>>>>>>>> BEGIN source/controllers/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('controllers/controller') ;

/** @class

  An ObjectController gives you a simple way to manage the editing state of
  an object.  You can use an ObjectController instance as a "proxy" for your
  model objects.
  
  Any properties you get or set on the object controller, will be passed 
  through to its content object.  This allows you to setup bindings to your
  object controller one time for all of your views and then swap out the 
  content as needed.
  
  h2. Working with Arrays
  
  An ObjectController can accept both arrays and single objects as content.  
  If the content is an array, the ObjectController will do its best to treat 
  the array as a single object.  For example, if you set the content of an
  ObjectController to an array of Contact records and then call:
  
    contactController.get('name');
    
  The controller will check the name property of each Contact in the array.  
  If the value of the property for each Contact is the same, that value will 
  be returned.  If the any values are different, then an array will be 
  returned with the values from each Contact in them. 
  
  Most SproutCore views can work with both arrays and single content, which 
  means that most of the time, you can simply hook up your views and this will
  work.
  
  If you would prefer to make sure that your ObjectController is always 
  working with a single object and you are using bindings, you can always 
  setup your bindings so that they will convert the content to a single object 
  like so:
  
    contentBinding: SC.Binding.single('MyApp.listController.selection') ;

  This will ensure that your content property is always a single object 
  instead of an array.
  
  @extends SC.Controller
  @since SproutCore 1.0
*/
SC.ObjectController = SC.Controller.extend(
/** @scope SC.ObjectController.prototype */ {

  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Set to the object you want this controller to manage.  The object should
    usually be a single value; not an array or enumerable.  If you do supply
    an array or enumerable with a single item in it, the ObjectController
    will manage that single item.

    Usually your content object should implement the SC.Observable mixin, but
    this is not required.  All SC.Object-based objects support SC.Observable
    
    @property {Object}
  */
  content: null,

  /**
    If YES, then setting the content to an enumerable or an array with more 
    than one item will cause the Controller to attempt to treat the array as
    a single object.  Use of get(), for example, will get every property on
    the enumerable and return it.  set() will set the property on every item
    in the enumerable. 
    
    If NO, then setting content to an enumerable with multiple items will be
    treated like setting a null value.  hasContent will be NO.
    
    @property {Boolean}
  */
  allowsMultipleContent: NO,

  /**
    Becomes YES whenever this object is managing content.  Usually this means
    the content property contains a single object or an array or enumerable
    with a single item.  Array's or enumerables with multiple items will 
    normally make this property NO unless allowsMultipleContent is YES.
    
    @property {Boolean}
  */
  hasContent: function() {
    return !SC.none(this.get('observableContent'));
  }.property('observableContent'),
  
  /**
    Makes a controller editable or not editable.  The SC.Controller class 
    itself does not do anything with this property but subclasses will 
    respect it when modifying content.
    
    @property {Boolean}
  */
  isEditable: YES,
  
  /**
    Primarily for internal use.  Normally you should not access this property 
    directly.  
    
    Returns the actual observable object proxied by this controller.  Usually 
    this property will mirror the content property.  In some cases - notably 
    when setting content to an enumerable, this may return a different object.
    
    Note that if you set the content to an enumerable which itself contains
    enumerables and allowsMultipleContent is NO, this will become null.
    
    @property {Object}
  */
  observableContent: function() {
    var content = this.get('content'),
        len, allowsMultiple;
        
    // if enumerable, extract the first item or possibly become null
    if (content && content.isEnumerable) {
      len = content.get('length');
      allowsMultiple = this.get('allowsMultipleContent');
      
      if (len === 1) content = content.firstObject();
      else if (len===0 || !allowsMultiple) content = null;
      
      // if we got some new content, it better not be enum also...
      if (content && !allowsMultiple && content.isEnumerable) content=null;
    }
    
    return content;
  }.property('content', 'allowsMultipleContent').cacheable(),

  // ..........................................................
  // METHODS
  // 

  /**
    Override this method to destroy the selected object.
    
    The default just passes this call onto the content object if it supports
    it, and then sets the content to null.  
    
    Unlike most calls to destroy() this will not actually destroy the 
    controller itself; only the the content.  You continue to use the 
    controller by setting the content to a new value.
    
    @returns {SC.ObjectController} receiver
  */
  destroy: function() {
    var content = this.get('observableContent') ;
    if (content && SC.typeOf(content.destroy) === SC.T_FUNCTION) {
      content.destroy();
    } 
    this.set('content', null) ;  
    return this;
  },
  
  /**
    Invoked whenever any property on the content object changes.  

    The default implementation will simply notify any observers that the 
    property has changed.  You can override this method if you need to do 
    some custom work when the content property changes.
    
    If you have set the content property to an enumerable with multiple 
    objects and you set allowsMultipleContent to YES, this method will be 
    called anytime any property in the set changes.

    If all properties have changed on the content or if the content itself 
    has changed, this method will be called with a key of "*".
    
    @param {Object} target the content object
    @param {String} key the property that changes
    @returns {void}
  */
  contentPropertyDidChange: function(target, key) {
    if (key === '*') this.allPropertiesDidChange();
    else this.notifyPropertyChange(key);
  },
  
  /**
    Called whenver you try to get/set an unknown property.  The default 
    implementation will pass through to the underlying content object but 
    you can override this method to do some other kind of processing if 
    needed.
    
    @property {String} key key being retrieved
    @property {Object} value value to set or undefined if reading only
    @returns {Object} property value
  */
  unknownProperty: function(key,value) {
    
    // avoid circular references
    if (key==='content') {
      if (value !== undefined) this.content = value;
      return this.content;
    }
    
    // for all other keys, just pass through to the observable object if 
    // there is one.  Use getEach() and setEach() on enumerable objects.
    var content = this.get('observableContent'), loc, cur, isSame;
    if (content===null || content===undefined) return undefined; // empty

    // getter...
    if (value === undefined) {
      if (content.isEnumerable) {
        value = content.getEach(key);

        // iterate over array to see if all values are the same. if so, then
        // just return that value
        loc = value.get('length');
        if (loc>0) {
          isSame = YES;
          cur = value.objectAt(0);
          while((--loc > 0) && isSame) {
            if (cur !== value.objectAt(loc)) isSame = NO ;
          }
          if (isSame) value = cur;
        } else value = undefined; // empty array.

      } else value = (content.isObservable) ? content.get(key) : content[key];
      
    // setter
    } else {
      if (!this.get('isEditable')) {
        throw "%@.%@ is not editable".fmt(this,key);
      }
      
      if (content.isEnumerable) content.setEach(key, value);
      else if (content.isObservable) content.set(key, value);
      else content[key] = value;
    }
    
    return value;
  },
  
  // ...............................
  // INTERNAL SUPPORT
  //

  /** @private - setup observer on init if needed. */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    if (this.get('content')) this._scoc_contentDidChange();
    if (this.get('observableContent')) this._scoc_observableContentDidChange();
  },

  _scoc_contentDidChange: function () {
    var last = this._scoc_content,
        cur  = this.get('content');
        
    if (last !== cur) {
      this._scoc_content = cur;
      var func = this._scoc_enumerableContentDidChange;
      if (last && last.isEnumerable) {
        //console.log('no longer observing [] on last');
        last.removeObserver('[]', this, func);
      }
      if (cur && cur.isEnumerable) {
        //console.log('observing [] on cur');
        cur.addObserver('[]', this, func);
      }
    }
  }.observes("content"),
  
  /**  @private
    
    Called whenever the observable content property changes.  This will setup
    observers on the content if needed.
  */
  _scoc_observableContentDidChange: function() {
    var last = this._scoc_observableContent,
        cur  = this.get('observableContent'),
        func = this.contentPropertyDidChange,
        efunc= this._scoc_enumerableContentDidChange;

    if (last === cur) return this; // nothing to do
    //console.log('observableContentDidChange');
    
    this._scoc_observableContent = cur; // save old content
    
    // stop observing last item -- if enumerable stop observing set
    if (last) {
      if (last.isEnumerable) last.removeObserver('[]', this, efunc);
      else if (last.isObservable) last.removeObserver('*', this, func);
    }
    
    if (cur) {
      if (cur.isEnumerable) cur.addObserver('[]', this, efunc);
      else if (cur.isObservable) cur.addObserver('*', this, func);
    }

    // notify!
    if ((last && last.isEnumerable) || (cur && cur.isEnumerable)) {
      this._scoc_enumerableContentDidChange();
    } else this.contentPropertyDidChange(cur, '*');

  }.observes("observableContent"),
  
  /** @private
    Called when observed enumerable content has changed.  This will teardown
    and setup observers on the enumerable content items and then calls 
    contentPropertyDidChange().  This method may be called even if the new
    'cur' is not enumerable but the last content was enumerable.
  */
  _scoc_enumerableContentDidChange: function() {
    var cur  = this.get('observableContent'),
        set  = this._scoc_observableContentItems,
        func = this.contentPropertyDidChange;
    
    // stop observing each old item
    if (set) {
      set.forEach(function(item) {
        if (item.isObservable) item.removeObserver('*', this, func);
      }, this);
      set.clear();
    }
    
    // start observing new items if needed
    if (cur && cur.isEnumerable) {
      if (!set) set = SC.Set.create();
      cur.forEach(function(item) {
        if (set.contains(item)) return ; // nothing to do
        set.add(item);
        if (item.isObservable) item.addObserver('*', this, func);
      }, this); 
    } else set = null;
    
    this._scoc_observableContentItems = set; // save for later cleanup
  
    // notify
    this.contentPropertyDidChange(cur, '*');
    return this ;
  }
        
}) ;

/* >>>>>>>>>> BEGIN source/mixins/tree_item_content.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  A tree item is a model object that acts as a node in a tree-like data 
  structure such as a hierarchy of folders or outline of items.  This mixin 
  can be applied to tree item model objects to customize the way the tree
  information is extracted from the object.

  h2. Basic Implementation
  
  If you add this mixin, you must implement the treeItemChildren property so
  that it returns the current array of child tree items for the receiver.  If
  you do not implement this property the tree item will not function.
  
  h2. Optimizing Branches
  
  The most common use of this mixin is to override the treeItemBranchIndexes
  property to return an index set of child items that are themselves branches
  in the tree.  Normally the TreeController will need to walk every item in
  your list to determine these branch items.  However by implementing this 
  method yourself, you can provide a result faster.
  
  If none of your child items are branches, override this property to return
  null or an empty index set.
  
  @since SproutCore 1.0
*/
SC.TreeItemContent = {

  /** 
    Walk like a duck. 
    
    @property {Boolean}
  */
  isTreeItemContent: YES,
  
  /**
    Property returns the children for this tree item.  The default simply 
    returns null.  If you implement this mixin, you MUST implement this 
    property to return the actual tree item children for the item.
   
    @property {SC.Array}
  */
  treeItemChildren: null,

  /**
    The default property used to determine if the tree item is expanded.  You
    can implement you model object to update this property or you can override
    treeItemDisclosureState() to compute the disclosure state however you 
    want.
    
    @property {Boolean}
  */
  treeItemIsExpanded: YES,
  
  /**
    Indicates whether the tree item should be rendered as a group or not. 
    This property is only useful on the root item in your tree.  Setting it to
    YES on any other item will be ignored.
    
    @property {Boolean}
  */
  treeItemIsGrouped: NO,
  
  /**
    Returns the disclosure state for the tree item, which appears at the 
    index of the parent's treeItemChildren array.  The response must be one of 
    SC.BRANCH_OPEN, SC.BRANCH_CLOSED or SC.LEAF_NODE.
     
    If the parent parameter is null, then this item is part of the root 
    children array.
    
    This method will only be called for tree items that have children.  Tree
    items with no children are assumed to be leaf nodes.

    The default implementation uses the treeItemIsExpanded property to 
    determine if the item should be open or closed.
    
    @param {Object} parent the parent item containing this item
    @param {Number} idx the index of the item in the parent
    @returns {Number} branch state
  */
  treeItemDisclosureState: function(parent, idx) {
    return this.get('treeItemIsExpanded') ? SC.BRANCH_OPEN : SC.BRANCH_CLOSED;
  },
  
  /**
    Collapse the tree item.  The default implementation will change the 
    treeItemIsExpanded property, but you can override this method to handle
    collapsing anyway you like.
    
    @param {Object} parent the parent item containing this item
    @param {Number} idx the index of the item in the parent
    @returns {void}
  */
  treeItemCollapse: function(parent, idx) {
    this.setIfChanged('treeItemIsExpanded', NO);    
  },

  /**
    Expand the tree item.  The default implementation will change the 
    treeItemIsExpanded property, but you can override this method to handle
    collapsing anyway you like.
    
    @param {Object} parent the parent item containing this item
    @param {Number} idx the index of the item in the parent
    @returns {void}
  */
  treeItemExpand: function(parent, idx) {
    this.setIfChanged('treeItemIsExpanded', YES);    
  },
  
  /**
    Returns an index set containing the child indexes of the item that are 
    themselves branches.  This will only be called on tree items with a branch
    disclosure state.

    If the passed parent and index are both null, then the receiver is the 
    root node in the tree.
    
    The default implementation iterates over the item's children to get the
    disclosure state of each one.  Child items with a branch disclosure state
    will have their index added to the return index set.  
    
    You may want to override this method to provide a more efficient 
    implementation if you are working with large data sets and can infer which
    children are branches without iterating over each one.

    If you know for sure that all of the child items for this item are leaf
    nodes and not branches, simply override this method to return null.
    
    @param {Object} parent the parent item containing this item
    @param {Number} index the index of the item in the parent
    @returns {SC.IndexSet} branch indexes
  */
  treeItemBranchIndexes: function(parent, index) {
    var children = this.get('treeItemChildren'),
        ret, lim, idx, item;
        
    if (!children) return null ; // nothing to do
    
    ret = SC.IndexSet.create();
    lim = children.get('length');
    for(idx=0;idx<lim;idx++) {
      if (!(item = children.objectAt(idx))) continue;
      if (!item.get('treeItemChildren')) continue;
      if (item.treeItemDisclosureState(this,idx)!==SC.LEAF_NODE) ret.add(idx);
    }

    return ret.get('length')>0 ? ret : null;
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/collection_content.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  Used for contentIndexDisclosureState().  Indicates open branch node.
  
  @property {Number}
*/
SC.BRANCH_OPEN = 0x0011;

/**
  Used for contentIndexDisclosureState().  Indicates closed branch node.
  
  @property {Number}
*/
SC.BRANCH_CLOSED = 0x0012;

/**
  Used for contentIndexDisclosureState().  Indicates leaf node.
  
  @property {Number}
*/
SC.LEAF_NODE = 0x0020;

/**
  @namespace

  This mixin provides standard methods used by a CollectionView to provide
  additional meta-data about content in a collection view such as selection
  or enabled state.
  
  You can apply this mixin to a class that you set as a delegate or to the
  object you set as content.
  
  @since SproutCore 1.0
*/
SC.CollectionContent = {

  /**
    Used to detect the mixin by SC.CollectionView

    @property {Boolean}
  */
  isCollectionContent: YES,
  
  /**
    Return YES if the content index should be selected.  Default behavior 
    looks at the selection property on the view.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexIsSelected: function(view, content, idx) {
    var sel = view.get('selection');
    return sel ? sel.contains(content, idx) : NO ;
  },
  
  /**
    Returns YES if the content index should be enabled.  Default looks at the
    isEnabled state of the collection view.
    looks at the selection property on the view.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexIsEnabled: function(view, content, idx) {
    return view.get('isEnabled');
  },
  
  // ..........................................................
  // GROUPING
  // 
  
  /**
    Optionally return an index set containing the indexes that may be group
    views.  For each group view, the delegate will actually be asked to 
    confirm the view is a group using the contentIndexIsGroup() method.
    
    If grouping is not enabled, return null.
    
    @param {SC.CollectionView} view the calling view
    @param {SC.Array} content the content object
    @return {SC.IndexSet} 
  */
  contentGroupIndexes: function(view, content) {
    return null;
  },
  
  /**
    Returns YES if the item at the specified content index should be rendered
    using the groupExampleView instead of the regular exampleView.  Note that
    a group view is different from a branch/leaf view.  Group views often 
    appear with different layout and a different look and feel.

    Default always returns NO.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexIsGroup: function(view, content, idx) {
    return NO ;
  },
  
  // ..........................................................
  // OUTLINE VIEWS
  // 
  
  /**
    Returns the outline level for the item at the specified index.  Can be 
    used to display hierarchical lists.
    
    Default always returns -1 (no outline).
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexOutlineLevel: function(view, content, idx) {
    return -1;
  },
  
  /**
    Returns a constant indicating the disclosure state of the item.  Must be
    one of SC.BRANCH_OPEN, SC.BRANCH_CLOSED, SC.LEAF_NODE.  If you return one
    of the BRANCH options then the item may be rendered with a disclosure 
    triangle open or closed.  If you return SC.LEAF_NODe then the item will 
    be rendered as a leaf node.  

    Default returns SC.LEAF_NODE.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexDisclosureState: function(view, content, idx) {
    return SC.LEAF_NODE;    
  },
  
  /**
    Called to expand a content index item if it is currently in a closed 
    disclosure state.  The default implementation does nothing.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {void}
  */
  contentIndexExpand: function(view, content, idx) {
    console.log('contentIndexExpand(%@, %@, %@)'.fmt(view,content,idx));
  },
  
  /**
    Called to collapse a content index item if it is currently in an open 
    disclosure state.  The default implementation does nothing.  
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {void}
  */
  contentIndexCollapse: function(view, content, idx) {
    console.log('contentIndexCollapse(%@, %@, %@)'.fmt(view,content,idx));
  }
    
};

/* >>>>>>>>>> BEGIN source/private/tree_item_observer.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/tree_item_content');
sc_require('mixins/collection_content');

/** 
  @ignore
  @class
  
  A TreeNode is an internal class that will manage a single item in a tree
  when trying to display the item in a hierarchy. 
  
  When displaying a tree of objects, a tree item object will be nested to 
  cover every object that might have child views.
  
  TreeNode stores an array which contains either a number pointing to the 
  next place in the array there is a child item or it contains a child item.
  
  @extends SC.Object
  @extends SC.Array
  @extends SC.CollectionContent
  @since SproutCore 1.0
*/
SC.TreeItemObserver = SC.Object.extend(SC.Array, SC.CollectionContent, {

  /**
    The node in the tree this observer will manage.  Set when creating the
    object.  If you are creating an observer manually, you must set this to
    a non-null value.
  */
  item: null,

  /**
    The controller delegate.  If the item does not implement the 
    TreeItemContent method, delegate properties will be used to determine how
    to access the content.  Set automatically when a tree item is created.
    
    If you are creating an observer manually, you must set this to a non-null
    value.
  */
  delegate: null,
  
  // ..........................................................
  // FOR NESTED OBSERVERS
  // 
  
  /**
    The parent TreeItemObserver for this observer.  Must be set on create.
  */
  parentObserver: null,

  /**
    The parent item for the observer item.  Computed automatically from the 
    parent.  If the value of this is null, then this is the root of the tree.
  */
  parentItem: function() {
    var p = this.get('parentObserver');
    return p ? p.get('item') : null;
  }.property('parentObserver').cacheable(),
  
  /**
    Index location in parent's children array.  If this is the root item
    in the tree, should be null.
  */
  index: null,
  
  outlineLevel: 0, 
  
  // ..........................................................
  // EXTRACTED FROM ITEM
  // 
  
  /**
    Array of child tree items.  Extracted from the item automatically on init.
  */
  children: null,
  
  /**
    Disclosure state of this item.  Must be SC.BRANCH_OPEN or SC.BRANCH_CLOSED
    If this is the root of a item tree, the observer will have children but
    no parent or parent item.  IN this case the disclosure state is always
    SC.BRANCH_OPEN.
    
    @property
    @type Number
  */
  disclosureState: SC.BRANCH_OPEN,

  /**
    IndexSet of children with branches.  This will ask the delegate to name 
    these indexes.  The default implementation will iterate over the children
    of the item but a more optimized version could avoid touching each item.
    
    @property
    @type SC.IndexSet
  */
  branchIndexes: function() {
    var item = this.get('item'), 
        len, pitem, idx, children, ret;
    
    // no item - no branches
    if (!item) return SC.IndexSet.EMPTY;
    
    // if item is treeItemContent then ask it directly
    else if (item.isTreeItemContent) {
      pitem  = this.get('parentItem');
      idx    = this.get('index') ;
      return item.treeItemBranchIndexes(pitem, idx);
      
    // otherwise, loop over children and determine disclosure state for each
    } else {
      children = this.get('children');
      if (!children) return null; // no children - no branches
      ret = SC.IndexSet.create();
      len = children.get('length');
      pitem = item ; // save parent
      
      for(idx=0;idx<len;idx++) {
        if (!(item = children.objectAt(idx))) continue ;
        if (!this._computeChildren(item, pitem, idx)) continue; // no chil'en
        if (this._computeDisclosureState(item, pitem, idx) !== SC.LEAF_NODE) {
          ret.add(idx);
        }
      }

      return ret.get('length')>0 ? ret : null;
    }
  }.property('children').cacheable(),
  
  /**
    Returns YES if the item itself should be shown, NO if only its children
    should be shown.  Normally returns YES unless the parentObject is null.
  */
  isHeaderVisible: function() {
    return !!this.get('parentObserver');
  }.property('parentObserver').cacheable(),
  
  /**
    Get the current length of the tree item including any of its children.
  */
  length: 0,
  
  // ..........................................................
  // SC.ARRAY SUPPORT
  // 
  
  /**
    Get the object at the specified index.  This will talk the tree info
    to determine the proper place.  The offset should be relative to the 
    start of this tree item.  Calls recursively down the tree.
    
    This should only be called with an index you know is in the range of item
    or its children based on looking at the length.
  */
  objectAt: function(index) {
    var len   = this.get('length'),
        item  = this.get('item'), 
        cache = this._objectAtCache,
        cur   = index,
        loc   = 0,
        indexes, children;
     
    if (index >= len) return undefined;
    if (this.get('isHeaderVisible')) {
      if (index === 0) return item;
      else cur--;
    }
    item = null; 

    if (!cache) cache = this._objectAtCache = [];
    if ((item = cache[index]) !== undefined) return item ;

    children = this.get('children');
    if (!children) return undefined; // no children - nothing to get
    
    // loop through branch indexes, reducing the offset until it matches 
    // something we might actually return.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (item || (i > cur)) return ; // past end - nothing to do

        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; // nothing to do

        // if cur lands inside of this observer's length, use objectAt to get
        // otherwise, just remove len from cur.
        len = observer.get('length') ;
        if (i+len > cur) {
          item = observer.objectAt(cur-i);
          cur  = -1;
        } else cur -= len-1 ;
        
      },this);
    }
    
    if (cur>=0) item = children.objectAt(cur); // get internal if needed
    cache[index] = item ; // save in cache 
    
    return item ;
  },

  /**
    Implements SC.Array.replace() primitive.  For this method to succeed, the
    range you replace must lie entirely within the same parent item, otherwise
    this will raise an exception.
    
    h3. The Operation Parameter
    
    Note that this replace method accepts an additional parameter "operation"
    which is used when you try to insert an item on a boundary between 
    branches whether it should be inserted at the end of the previous group
    after the group.  If you don't pass operation, the default is 
    SC.DROP_BEFORE, which is the expected behavior.
    
    Even if the operation is SC.DROP_AFTER, you should still pass the actual
    index where you expect the item to be inserted.  For example, if you want
    to insert AFTER the last index of an 3-item array, you would still call:
    
    {{{
      observer.replace(3, 0, [object1 .. objectN], SC.DROP_AFTER)
    }}}
    
    The operation is simply used to disambiguate whether the insertion is
    intended to be AFTER the previous item or BEFORE the items you are
    replacing.
    
    @param {Number} start the starting index
    @param {Number} amt the number of items to replace
    @param {SC.Array} objects array of objects to insert
    @param {Number} operation either SC.DROP_BEFORE or SC.DROP_AFTER
    @returns {SC.TreeItemObserver} receiver
  */
  replace: function(start, amt, objects, operation) {

    var cur      = start,
        observer = null,
        indexes, len, max;
        
    if (operation === undefined) operation = SC.DROP_BEFORE;
    
    // adjust the start location based on branches, possibly passing on to an
    // observer.
    if (this.get('isHeaderVisible')) cur--; // exclude my own header item 
    if (cur < 0) throw "Tree Item cannot replace itself";

    // remove branch lengths.  If the adjusted start location lands inside of
    // another branch, then just let that observer handle it.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (observer || (i>=cur)) return ; // nothing to do
        if (!(observer = this.branchObserverAt(i))) return; // nothing to do
        len = observer.get('length');
        
        // if this branch range is before the start loc, just remove it and 
        // go on.  If cur is somewhere inside of the range, then save to pass
        // on.  Note use of operation to determine the abiguous end op.
        if ((i+len === cur) && operation === SC.DROP_AFTER) cur -= i;
        else if (i+len > cur) cur -= i; // put inside of nested range
        else {
          cur -= len-1; observer = null ;
        }
      }, this);      
    }
      
    // if an observer was saved, pass on call.
    if (observer) {
      observer.replace(cur, amt, objects, operation);
      return this;
    }
    
    // no observer was saved, which means cur points to an index inside of
    // our own range.  Now amt just needs to be adjusted to remove any
    // visible branches as well.
    max = cur + amt;
    if (amt>1 && indexes) { // if amt is 1 no need...
      indexes.forEachIn(cur, indexes.get('max')-cur, function(i) {
        if (i > max) return; // nothing to do
        if (!(observer = this.branchObserverAt(i))) return; // nothing to do
        len = observer.get('length');
        max -= len-1;
      }, this);
    }
    
    // get amt back out.  if amt is negative, it means that the range passed
    // was not cleanly inside of this range.  raise an exception.
    amt = max-cur; 
    
    // ok, now that we are adjusted, get the children and forward the replace
    // call on.  if there are no children, bad news...
    var children = this.get('children');
    if (!children) throw "cannot replace() tree item with no children";

    if ((amt < 0) || (max>children.get('length'))) {
      throw "replace() range must lie within a single tree item";
    }

    children.replace(cur, amt, objects, operation);
    
    // don't call enumerableContentDidChange() here because, as an observer,
    // we should be notified by the children array itself.
    
    return this;
  },
  
  /**
    Called whenever the content for the passed observer has changed.  Default
    version notifies the parent if it exists and updates the length.
    
    The start, amt and delta params should reflect changes to the children
    array, not to the expanded range for the wrapper.
  */
  observerContentDidChange: function(start, amt, delta) {
    
    // clear caches
    this.invalidateBranchObserversAt(start);
    this._objectAtCache = this._outlineLevelCache = null;
    this._disclosureStateCache = null;
    this._contentGroupIndexes = NO;
    this.notifyPropertyChange('branchIndexes');
    
    var oldlen = this.get('length'),
        newlen = this._computeLength(),
        parent = this.get('parentObserver'), set;
    
    // update length if needed
    if (oldlen !== newlen) this.set('length', newlen);
    
    // if we have a parent, notify that parent that we have changed.
    if (!this._notifyParent) return this; // nothing more to do
    
    if (parent) {
      set = SC.IndexSet.create(this.get('index'));
      parent._childrenRangeDidChange(parent.get('children'), null, '[]', set);
      
    // otherwise, note the enumerable content has changed.  note that we need
    // to convert the passed change to reflect the computed range
    } else {
      if (oldlen === newlen) {
        amt = this.expandChildIndex(start+amt);
        start = this.expandChildIndex(start);
        amt = amt - start ;
        delta = 0 ;
        
      } else {
        start = this.expandChildIndex(start);
        amt   = newlen - start;
        delta = newlen - oldlen ;
      }

      this.enumerableContentDidChange(start, amt, delta);
    }
  },

  /**
    Accepts a child index and expands it to reflect any nested groups.
  */
  expandChildIndex: function(index) {
    
    var ret = index;
    if (this.get('isHeaderVisible')) index++;

    // fast path
    var branches = this.get('branchIndexes');
    if (!branches || branches.get('length')===0) return ret;
    
    // we have branches, adjust for their length
    branches.forEachIn(0, index, function(idx) {
      ret += this.branchObserverAt(idx).get('length')-1;
    }, this);
    
    return ret; // add 1 for item header
  },
  
  // ..........................................................
  // SC.COLLECTION CONTENT SUPPORT
  // 

  _contentGroupIndexes: NO,
  
  /**
    Called by the collection view to return any group indexes.  The default 
    implementation will compute the indexes one time based on the delegate 
    treeItemIsGrouped
  */
  contentGroupIndexes: function(view, content) {
    if (content !== this) return null; // only care about receiver

    var ret = this._contentGroupIndexes;
    if (ret !== NO) return ret ;
    
    // if this is not the root item, never do grouping
    if (this.get('parentObserver')) return null;
    
    var item = this.get('item'), group, indexes, len, cur, loc, children;
    
    if (item && item.isTreeItemContent) group = item.get('treeItemIsGrouped');
    else group = !!this.delegate.get('treeItemIsGrouped');
    
    // if grouping is enabled, build an index set with all of our local 
    // groups.
    if (group) {
      ret      = SC.IndexSet.create();
      indexes  = this.get('branchIndexes');
      children = this.get('children');
      len      = children ? children.get('length') : 0;
      cur = loc = 0;
      
      if (indexes) {
        indexes.forEach(function(i) {
          ret.add(cur, (i+1)-loc); // add loc -> i to set
          cur += (i+1)-loc;
          loc = i+1 ;
          
          var observer = this.branchObserverAt(i);
          if (observer) cur += observer.get('length')-1;
        }, this);
      }

      if (loc<len) ret.add(cur, len-loc);
    } else ret = null;
    
    this._contentGroupIndexes = ret ;
    return ret;
  },
  
  contentIndexIsGroup: function(view, content, idx) {
    var indexes = this.contentGroupIndexes(view, content);
    return indexes ? indexes.contains(idx) : NO ;
  },
  
  /**
    Returns the outline level for the specified index.
  */
  contentIndexOutlineLevel: function(view, content, index) {
    if (content !== this) return -1; // only care about us
    
    var cache = this._outlineLevelCache;
    if (cache && (cache[index] !== undefined)) return cache[index];
    if (!cache) cache = this._outlineLevelCache = [];
    
    var len   = this.get('length'),
        cur   = index,
        loc   = 0,
        ret   = null,
        indexes, children, observer;
    
    if (index >= len) return -1;
     
    if (this.get('isHeaderVisible')) {
      if (index === 0) return cache[0] = this.get('outlineLevel')-1;
      else cur--;
    }

    // loop through branch indexes, reducing the offset until it matches 
    // something we might actually return.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if ((ret!==null) || (i > cur)) return ; // past end - nothing to do

        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; // nothing to do

        // if cur lands inside of this observer's length, use objectAt to get
        // otherwise, just remove len from cur.
        len = observer.get('length') ;
        if (i+len > cur) {
          ret  = observer.contentIndexOutlineLevel(view, observer, cur-i);
          cur  = -1;
        } else cur -= len-1 ;
        
      },this);
    }
    
    if (cur>=0) ret = this.get('outlineLevel'); // get internal if needed
    cache[index] = ret ; // save in cache 
    return ret ;
  },

  /**
    Returns the disclosure state for the specified index.
  */
  contentIndexDisclosureState: function(view, content, index) {
    if (content !== this) return -1; // only care about us
    
    var cache = this._disclosureStateCache;
    if (cache && (cache[index] !== undefined)) return cache[index];
    if (!cache) cache = this._disclosureStateCache = [];
    
    var len   = this.get('length'),
        cur   = index,
        loc   = 0,
        ret   = null,
        indexes, children, observer;
    
    if (index >= len) return SC.LEAF_NODE;
     
    if (this.get('isHeaderVisible')) {
      if (index === 0) return cache[0] = this.get('disclosureState');
      else cur--;
    }

    // loop through branch indexes, reducing the offset until it matches 
    // something we might actually return.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if ((ret!==null) || (i > cur)) return ; // past end - nothing to do

        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; // nothing to do

        // if cur lands inside of this observer's length, use objectAt to get
        // otherwise, just remove len from cur.
        len = observer.get('length') ;
        if (i+len > cur) {
          ret  = observer.contentIndexDisclosureState(view, observer, cur-i);
          cur  = -1;
        } else cur -= len-1 ;
        
      },this);
    }
    
    if (cur>=0) ret = SC.LEAF_NODE; // otherwise its a leaf node
    cache[index] = ret ; // save in cache 
    return ret ;
  },

  /**
    Expands the specified content index.  This will search down until it finds
    the branchObserver responsible for this item and then calls _collapse on
    it.
  */
  contentIndexExpand: function(view, content, idx) {

    var indexes, cur = idx, children, item;
    
    if (content !== this) return; // only care about us
    if (this.get('isHeaderVisible')) {
      if (idx===0) {
        this._expand(this.get('item'));
        return;
      } else cur--;
    } 
    
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (i >= cur) return; // past end - nothing to do
        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; 
        
        len = observer.get('length');
        if (i+len > cur) {
          observer.contentIndexExpand(view, observer, cur-i);
          cur = -1 ; //done
        } else cur -= len-1;
        
      }, this);  
    }
    
    // if we are still inside of the range then maybe pass on to a child item
    if (cur>=0) {
      children = this.get('children');  
      item     = children ? children.objectAt(cur) : null;
      if (item) this._expand(item, this.get('item'), cur);
    }
  },
  
  /**
    Called to collapse a content index item if it is currently in an open 
    disclosure state.  The default implementation does nothing.  
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {void}
  */
  contentIndexCollapse: function(view, content, idx) {

    var indexes, children, item, cur = idx;
        
    if (content !== this) return; // only care about us
    if (this.get('isHeaderVisible')) {
      if (idx===0) {
        this._collapse(this.get('item'));
        return;
      } else cur--;
    } 
    
    
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (i >= cur) return; // past end - nothing to do
        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; 
        
        len = observer.get('length');
        if (i+len > cur) {
          observer.contentIndexCollapse(view, observer, cur-i);
          cur = -1 ; //done
        } else cur -= len-1;
        
      }, this);  
    }

    // if we are still inside of the range then maybe pass on to a child item
    if (cur>=0) {
      children = this.get('children');  
      item     = children ? children.objectAt(cur) : null;
      if (item) this._collapse(item, this.get('item'), cur);
    }
  },
  
  // ..........................................................
  // BRANCH NODES
  //   

  /**
    Returns the branch item for the specified index.  If none exists yet, it
    will be created.
  */
  branchObserverAt: function(index) {
    var byIndex = this._branchObserversByIndex,
        indexes = this._branchObserverIndexes,
        ret, parent, pitem, item, children, guid, del ;
        
    if (!byIndex) byIndex = this._branchObserversByIndex = [];
    if (!indexes) {
      indexes = this._branchObserverIndexes = SC.IndexSet.create();
    }

    if (ret = byIndex[index]) return ret ; // use cache

    // no observer for this content exists, create one
    children = this.get('children');
    item   = children ? children.objectAt(index) : null ;
    if (!item) return null ; // can't create an observer for a null item
    
    byIndex[index] = ret = SC.TreeItemObserver.create({
      item:     item,
      delegate: this.get('delegate'),
      parentObserver:   this,
      index:  index,
      outlineLevel: this.get('outlineLevel')+1
    });

    indexes.add(index); // save for later invalidation
    return ret ;
  },
  
  /**
    Invalidates any branch observers on or after the specified index range.
  */
  invalidateBranchObserversAt: function(index) {
    var byIndex = this._branchObserversByIndex,
        indexes = this._branchObserverIndexes;

    if (!byIndex || byIndex.length<=index) return this ; // nothing to do
    if (index < 0) index = 0 ;
    
    // destroy any observer on or after the range
    indexes.forEachIn(index, indexes.get('max')-index, function(i) {
      var observer = byIndex[i];
      if (observer) observer.destroy();
    }, this);
    
    byIndex.length = index; // truncate to dump extra indexes
    
    return this;
  },
  
  // ..........................................................
  // INTERNAL METHODS
  // 
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    // begin all properties on item if there is one.  This will allow us to
    // track important property changes.
    var item = this.get('item');
    if (!item) throw "SC.TreeItemObserver.item cannot be null";
    
    item.addObserver('*', this, this._itemPropertyDidChange);
    this._itemPropertyDidChange(item, '*');
    this._notifyParent = YES ; // avoid infinite loops
  },
  
  /**
    Called just before a branch observer is removed.  Should stop any 
    observering and invalidate any child observers.
  */
  destroy: function() {
    this.invalidateBranchObserversAt(0);
    this._objectAtCache = null ;
    
    // cleanup observing
    var item = this.get('item');
    if (item) item.removeObserver('*', this, this._itemPropertyDidChange);
    
    var children = this._children,
        ro = this._childrenRangeObserver;
    if (children && ro) children.removeRangeObserver(ro);
    
    arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Called whenever a property changes on the item.  Determines if either the
    children array or the disclosure state has changed and then notifies as 
    necessary..
  */
  _itemPropertyDidChange: function(target, key) {
    var children = this.get('children'),
        state    = this.get('disclosureState'),
        item     = this.get('item'),
        next ;
        
    this.beginPropertyChanges();
    
    next = this._computeDisclosureState(item);
    if (state !== next) this.set('disclosureState', next);
    
    next = this._computeChildren(item);
    if (children !== next) this.set('children', next);
    
    this.endPropertyChanges();
  },
  
  /**
    Called whenever the children or disclosure state changes.  Begins or ends
    observing on the children array so that changes can propogate outward.
  */
  _childrenDidChange: function() {
    var state = this.get('disclosureState'),
        cur   = state === SC.BRANCH_OPEN ? this.get('children') : null,
        last  = this._children,
        ro    = this._childrenRangeObserver;
        
    if (last === cur) return this; //nothing to do
    if (ro) last.removeRangeObserver(ro);
    if (cur) {
      this._childrenRangeObserver = 
          cur.addRangeObserver(null, this, this._childrenRangeDidChange);
    } else this._childrenRangeObserver = null;
    
    this._children = cur ;
    this._childrenRangeDidChange(cur, null, '[]', null);
    
  }.observes("children", "disclosureState"),

  /**
    Called anytime the actual content of the children has changed.  If this 
    changes the length property, then notifies the parent that the content
    might have changed.
  */
  _childrenRangeDidChange: function(array, objects, key, indexes) {
    var children = this.get('children'),
        len = children ? children.get('length') : 0,
        min = indexes ? indexes.get('min') : 0,
        max = indexes ? indexes.get('max') : len,
        old = this._childrenLen || 0;
        
    this._childrenLen = len; // save for future calls
    this.observerContentDidChange(min, max-min, len-old);
  },
  
  /**
    Computes the current disclosure state of the item by asking the item or 
    the delegate.  If no pitem or index is passed, the parentItem and idex 
    will be used.
  */
  _computeDisclosureState: function(item, pitem, index) {
    var key, del;

    // no item - assume leaf node
    if (!item || !this._computeChildren(item)) return SC.LEAF_NODE;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) {
      if (pitem === undefined) pitem = this.get('parentItem');
      if (index === undefined) index = this.get('index');
      return item.treeItemDisclosureState(pitem, index);
      
    // otherwise get treeItemDisclosureStateKey from delegate
    } else {
      key = this._treeItemIsExpandedKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemIsExpandedKey') : 'treeItemIsExpanded';
        this._treeItemIsExpandedKey = key ;
      }
      return item.get(key) ? SC.BRANCH_OPEN : SC.BRANCH_CLOSED;
    }
  },
  
  /**
    Collapse the item at the specified index.  This will either directly 
    modify the property on the item or call the treeItemCollapse() method.
  */
  _collapse: function(item, pitem, index) {
    var key, del;

    // no item - assume leaf node
    if (!item || !this._computeChildren(item)) return this;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) {
      if (pitem === undefined) pitem = this.get('parentItem');
      if (index === undefined) index = this.get('index');
      item.treeItemCollapse(pitem, index);
      
    // otherwise get treeItemDisclosureStateKey from delegate
    } else {
      key = this._treeItemIsExpandedKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemIsExpandedKey') : 'treeItemIsExpanded';
        this._treeItemIsExpandedKey = key ;
      }
      item.setIfChanged(key, NO);
    }
    
    return this ;
  },

  /**
    Expand the item at the specified index.  This will either directly 
    modify the property on the item or call the treeItemExpand() method.
  */
  _expand: function(item, pitem, index) {
    var key, del;

    // no item - assume leaf node
    if (!item || !this._computeChildren(item)) return this;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) {
      if (pitem === undefined) pitem = this.get('parentItem');
      if (index === undefined) index = this.get('index');
      item.treeItemExpand(pitem, index);
      
    // otherwise get treeItemDisclosureStateKey from delegate
    } else {
      key = this._treeItemIsExpandedKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemIsExpandedKey') : 'treeItemIsExpanded';
        this._treeItemIsExpandedKey = key ;
      }
      item.setIfChanged(key, YES);
    }
    
    return this ;
  },
  
  /**
    Computes the children for the passed item.
  */
  _computeChildren: function(item) {
    var del, key;
    
    // no item - no children
    if (!item) return null;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) return item.get('treeItemChildren');
          
    // otherwise get treeItemChildrenKey from delegate
    else {
      key = this._treeItemChildrenKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemChildrenKey') : 'treeItemChildren';
        this._treeItemChildrenKey = key ;
      }
      return item.get(key);
    }
  },
  
  /**
    Computes the length of the array by looking at children.
  */
  _computeLength: function() {
    var ret = this.get('isHeaderVisible') ? 1 : 0,
        state = this.get('disclosureState'),
        children = this.get('children'),
        indexes ;

    // if disclosure is open, add children count + length of branch observers.
    if ((state === SC.BRANCH_OPEN) && children) {
      ret += children.get('length');
      if (indexes = this.get('branchIndexes')) {
        indexes.forEach(function(idx) {
          var observer = this.branchObserverAt(idx);
          ret += observer.get('length')-1;
        }, this);
      }
    } 
    return ret ;
  }
    
});


/* >>>>>>>>>> BEGIN source/controllers/tree.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('controllers/object');
sc_require('mixins/selection_support');
sc_require('private/tree_item_observer');

/**
  @class

  A TreeController manages a tree of model objects that you might want to 
  display in the UI using a collection view.  For the most part, you should
  work with a TreeController much like you would an ObjectController, except
  that the TreeController will also provide an arrangedObjects property that 
  can be used as the content of a CollectionView.
  
  TODO: Document More

  @extends SC.ObjectController
  @extends SC.SelectionSupport
  @since SproutCore 1.0
*/
SC.TreeController = SC.ObjectController.extend(SC.SelectionSupport,
/** @scope SC.TreeController.prototype */ {

  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Set to YES if you want the top-level items in the tree to be displayed as
    group items in the collection view.
    
    @property {Boolean}
  */
  treeItemIsGrouped: NO,
  
  /**
    If your content support expanding and collapsing of content, then set this
    property to the name of the key on your model that should be used to 
    determine the expansion state of the item.  The default is 
    "treeItemIsExpanded"
    
    @property {String}
  */
  treeItemIsExpandedKey: "treeItemIsExpanded",
  
  /**
    Set to the name of the property on your content object that holds the 
    children array for each tree node.  The default is "treeItemChildren".
    
    @property {String}
  */
  treeItemChildrenKey: "treeItemChildren",
  
  /**
    Returns an SC.Array object that actually will represent the tree as a 
    flat array suitable for use by a CollectionView.  Other than binding this
    property as the content of a CollectionView, you generally should not 
    use this property directly.  Instead, work on the tree content using the
    TreeController like you would any other ObjectController.
  
    @property {SC.Array}
  */
  arrangedObjects: function() {
    var ret, content = this.get('content');
    if (content) {
      ret = SC.TreeItemObserver.create({ item: content, delegate: this });
    } else ret = null; // empty!
    this._sctc_arrangedObjects = ret ;
    
    return ret ;
  }.property().cacheable(),

  // ..........................................................
  // PRIVATE
  // 
  
  /**
    @private
    
    Manually invalidate the arrangedObjects cache so that we can teardown
    any existing value.  We do it via an observer so that this will fire 
    immediately instead of waiting on some other component to get 
    arrangedObjects again.
  */
  _sctc_invalidateArrangedObjects: function() {
    this.propertyWillChange('arrangedObjects');
    
    var ret = this._sctc_arrangedObjects;
    if (ret) ret.destroy();
    this._sctc_arrangedObjects = null;
    
    this.propertyDidChange('arrangedObjects');
  }.observes('content', 'treeItemIsExpandedKey', 'treeItemChildrenKey', 'treeItemIsGrouped'),
  
  _sctc_arrangedObjectsContentDidChange: function() {
    this.updateSelectionAfterContentChange();
  }.observes('*arrangedObjects.[]'),
  
  /**
    @private
    
    Returns the first item in arrangeObjects that is not a group.  This uses
    a brute force approach right now; we assume you probably don't have a lot
    of groups up front.
  */
  firstSelectableObject: function() {
    var objects = this.get('arrangedObjects'),
        indexes, len, idx     = 0;
        
    if (!objects) return null; // fast track
    
    indexes = objects.contentGroupIndexes(null, objects);
    len = objects.get('length');
    while(indexes.contains(idx) && (idx<len)) idx++;
    return idx>=len ? null : objects.objectAt(idx);
  }.property()
  
});


/* >>>>>>>>>> BEGIN source/system/browser.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** Detects the current browser type. Borrowed from jQuery + prototype */
SC.mixin(SC.browser, (function() {
  var viewport  = window.innerWidth,
      browser = SC.browser,
      standalone = navigator.standalone;
  
  // Add more SC-like descriptions...
  SC.extend(browser, /** @scope SC.browser */ {
    
    isOpera: !!browser.opera,
    isIe: !!browser.msie,
    isIE: !!browser.msie,
    isSafari: !!browser.safari,
    isMobileSafari: (!!browser.mobileSafari || !!browser.standalone),
    isMozilla: !!browser.mozilla,
    isWindows: !!browser.windows,
    isMac: !!browser.mac,
    isiPhone: ((!!browser.mobileSafari || !!browser.standalone) && (viewport == 320 || viewport == 480)),

    /**
      The current browser name.  This is useful for switch statements. */
    current: browser.msie ? 'msie' : browser.mozilla ? 'mozilla' : browser.safari ? 'safari' : browser.opera ? 'opera' : 'unknown',
    
    /**
      Pass any number of arguments, and this will check them against the browser
      version split on ".".  If any of them are not equal, return the inequality.
      If as many arguments as were passed in are equal, return 0.  If something
      is NaN, return 0. */
    compareVersion: function () {
      if (this._versionSplit === undefined) {
        var coerce = function (part) {
          return Number(part.match(/^[0-9]+/));
        };
        this._versionSplit = SC.A(this.version.split('.')).map(coerce);
      }

      var tests = SC.A(arguments).map(Number);
      for (var i = 0; i < tests.length; i++) {
        var check = this._versionSplit[i] - tests[i];
        if (isNaN(check)) return 0;
        if (check !== 0) return check;
      }
      
      return 0;
    }
    
  }) ;
  
  return browser ;

})() );


/* >>>>>>>>>> BEGIN source/system/builder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  The Builder class makes it easy to create new chained-builder API's such as
  those provided by CoreQuery or jQuery.  Usually you will not create a new
  builder yourself, but you will often use instances of the Builder object to
  configure parts of the UI such as menus and views.
  
  h1. Anatomy of a Builder
  
  You can create a new Builder much like you would any other class in 
  SproutCore.  For example, you could create a new CoreQuery-type object with
  the following:
  
  {{{
    SC.$ = SC.Builder.create({
      // methods you can call go here.
    });
  }}}
  
  Unlike most classes in SproutCore, Builder objects are actually functions 
  that you can call to create new instances.  In the example above, to use 
  the builder, you must call it like a function:
  
  {{{
    buildit = SC.$();
  }}}
  
  If you define an init() method on a builder, it will be invoked wheneve the
  builder is called as a function, including any passed params.  Your init()
  method MUST return this, unlike regular SC objects.  i.e.
  
  {{{
    SC.$ = SC.Builder.create({
      init: function(args) { 
        this.args = SC.A(args);
        return this;
      }
    });
    
    buildit = SC.$('a', 'b');
    buildit.args => ['a','b']
  }}}
  
  In addition to defining a function like this, all builder objects also have
  an 'fn' property that contains a hash of all of the helper methods defined
  on the builder function.  Once a builder has been created, you can add 
  addition "plugins" for the builder by simply adding new methods to the
  fn property.
  
  h1. Writing Builder Functions
  
  All builders share a few things in comming:
  
  - when a new builder is created, it's init() method will be called.  The default version of this method simply copies the passed parameters into the builder as content, but you can override this with anything you want.
  
  - the content the builder works on is stored as indexed properties (i.e. 0,1,2,3, like an array).  The builder should also have a length property if you want it treated like an array.
    
  - Builders also maintain a stack of previous builder instances which you can pop off at any time.
    
  To get content back out of a builder once you are ready with it, you can
  call the method done().  This will return an array or a single object, if 
  the builder only works on a single item.
  
  You should write your methods using the getEach() iterator to work on your
  member objects.  All builders implement SC.Enumerable in the fn() method.

  CoreQuery = SC.Builder.create({
    ...
  }) ;
  
  CoreQuery = new SC.Builder(properties) {
    
  } ;

  CoreQuery2 = CoreQuery.extend() {
  }
  
  @constructor
*/
SC.Builder = function (props) { return SC.Builder.create(props); };

/** 
  Create a new builder object, applying the passed properties to the 
  builder's fn property hash.
  
  @param {Hash} properties
  @returns {SC.Builder}
*/
SC.Builder.create = function create(props) { 
  
  // generate new fn with built-in properties and copy props
  var fn = SC.mixin(SC.beget(this.fn), props||{}) ;
  if (props.hasOwnProperty('toString')) fn.toString = props.toString;
  
  // generate new constructor and hook in the fn
  var construct = function() {
    var ret = SC.beget(fn); // NOTE: using closure here...
    
    // the defaultClass is usually this for this constructor. 
    // e.g. SC.View.build() -> this = SC.View
    ret.defaultClass = this ;
    ret.constructor = construct ;

    // now init the builder object.
    return ret.init.apply(ret, arguments) ;
  } ;
  construct.fn = construct.prototype = fn ;

  // the create() method can be used to extend a new builder.
  // eg. SC.View.buildCustom = SC.View.build.extend({ ...props... })
  construct.extend = SC.Builder.create ;
  construct.mixin = SC.Builder.mixin ;
  
  return construct; // return new constructor
} ;

SC.Builder.mixin = function() {
  var len = arguments.length, idx;
  for(idx=0;idx<len;idx++) SC.mixin(this, arguments[idx]);
  return this ;
};

/** This is the default set of helper methods defined for new builders. */
SC.Builder.fn = {

  /** 
    Default init method for builders.  This method accepts either a single
    content object or an array of content objects and copies them onto the 
    receiver.  You can override this to provide any kind of init behavior 
    that you want.  Any parameters passed to the builder method will be 
    forwarded to your init method.
    
    @returns {SC.Builder} receiver
  */
  init: function(content) {
    if (content !== undefined) {
      if (SC.typeOf(content) === SC.T_ARRAY) {
        var loc=content.length;
        while(--loc >= 0) {
          this[loc] = content.objectAt ? content.objectAt(loc) : content[loc];
        }
        this.length = content.length ;
      } else {
        this[0] = content; this.length=1;
      }
    }
    return this ;
  },
  
  /** Return the number of elements in the matched set. */
  size: function() { return this.length; },
  
  /** 
    Take an array of elements and push it onto the stack (making it the
    new matched set.)  The receiver will be saved so it can be popped later.
    
    @param {Object|Array} content
    @returns {SC.Builder} new isntance
  */
  pushStack: function() {
    // Build a new CoreQuery matched element set
    var ret = this.constructor.apply(this,arguments);

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    // Return the newly-formed element set
    return ret;
  },

  /**
    Returns the previous object on the stack so you can continue with that
    transform.  If there is no previous item on the stack, an empty set will
    be returned.
  */
  end: function() { 
    return this.prevObject || this.constructor(); 
  },
  
  // toString describes the builder
  toString: function() { 
    return "%@$(%@)".fmt(this.defaultClass.toString(), 
      SC.A(this).invoke('toString').join(',')); 
  },
  
  /** You can enhance the fn using this mixin method. */
  mixin: SC.Builder.mixin
  
};

// Apply SC.Enumerable.  Whenever possible we want to use the Array version
// because it might be native code.
(function() {
  var enumerable = SC.Enumerable, fn = SC.Builder.fn, key, value ;
  for(key in enumerable) {
    if (!enumerable.hasOwnProperty(key)) continue ;
    value = Array.prototype[key] || enumerable[key];
    fn[key] = value ;
  }
})();




/* >>>>>>>>>> BEGIN source/system/core_query.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CQ add*/

require('system/builder') ;

/**
  CoreQuery is a simplified DOM manipulation library used internally by 
  SproutCore to find and edit DOM elements.  Outside of SproutCore, you 
  should generally use a more full-featured DOM library such as Prototype
  or jQuery.
  
  CoreQuery itself is a subset of jQuery with some additional plugins.  If
  you have jQuery already loaded when SproutCore loads, in fact, it will 
  replace CoreQuery with the full jQuery library and install any CoreQuery
  plugins, including support for the SC.Enumerable mixin.
  
  Much of this code is adapted from jQuery 1.2.6, which is available under an
  MIT license just like SproutCore.
  
  h1. Using CoreQuery
  
  You can work with CoreQuery much like you would work with jQuery.  The core
  manipulation object is exposed as SC.$.  To find some elements on the page
  you just pass in a selector like this:
  
  {{{
    var cq = SC.$('p');
  }}}
  
  The object returned from this call is a CoreQuery object that implements 
  SC.Enumerable as well as a number of other useful manipulation methods.  
  Often times we call this object the "matched set", because it usually an
  array of elements matching the selector key you passed.
  
  To work with the matched set, just call the various helper methods on it.
  Here are some of the more useful ones:
  
  {{{
    // change all of the text red
    cq.css('color','red');
    
    // hide/show the set
    cq.hide();  cq.show();
    
    // set the text content of the set
    cq.text("Hello World!");
    
  }}}
  
  Of course, you can also chain these methods, just like jQuery.  Here is 
  how you might find all of the headings in your page, change their text and
  color:
  
  {{{
    SC.$('h1').text('Hello World!').css('color','red');
  }}}
  
  h1. Using CoreQuery with Views
  
  Usually you will not want to just blindly edit the HTML content in your
  application.  Instead, you will use CoreQuery to update the portion of the
  page managed by your SC.View instances.  Every SC.View instance has a $()
  property just like SC.$().  The difference is that this function will start
  searching from the root of the view.  For example, you could use the 
  following code in your updateDisplay method to set your content and color:
  
  {{{
    updateDisplay: function() {
      this.$().text(this.get('value')).css('color','red');
    }
  }}}
  
  You could also work on content within your view, for example this will 
  change the title on your view held in the span.title element:
  
  {{{
    updateDisplay: function() {
      this.$('span.title').text('Hello World');
      this.$().setClassName('sc-enabled', YES) ;
    }
  }}}

  @class
  @extends SC.Builder.fn
*/
SC.CoreQuery = (function() {
  // Define CoreQuery inside of its own scope to support some jQuery idioms.
  
  // A simple way to check for HTML strings or ID strings
  // (both of which we optimize for)
  var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
  // Is it a simple selector
  isSimple = /^.[^:#\[\.]*$/;
  
  // Regular expressions
  var CQHtmlRegEx =/ CQ\d+="(?:\d+|null)"/g,
  tagSearchRegEx = /(<(\w+)[^>]*?)\/>/g,
  xmlTagsRegEx = /^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i,
  checkforSpaceRegEx = /\s+/,
  trimWhiteSpaceRegEx = /^\s+/,
  bodyHTMLOffsetRegEx = /^body|html$/i,
  specialAttributesRegEx = /href|src|style/,
  tagsWithTabIndexRegEx = /(button|input|object|select|textarea)/i,
  alphaDetectRegEx = /alpha\([^)]*\)/,
  alphaReplaceRegEx = /opacity=([^)]*)/;

  var styleFloat = SC.browser.msie ? "styleFloat" : "cssFloat";

  // used for the find() method.
  var chars = (SC.browser.safari && parseInt(SC.browser.version,0) < 417) ?
      "(?:[\\w*_-]|\\\\.)" :
      "(?:[\\w\u0128-\uFFFF*_-]|\\\\.)" ;
  var quickID = new RegExp("^(" + chars + "+)(#)(" + chars + "+)") ;
  var singleClass = new RegExp("^([#.]?)(" + chars + "*)");
  var quickSplit = new RegExp("([#.]?)(" + chars + "*)",'g');

  // Constants used in CQ.css()
  var LEFT_RIGHT = ["Left", "Right"];
  var TOP_BOTTOM = ["Top", "Bottom"];
  var CSS_DISPLAY_PROPS = {  
    position: "absolute", visibility: "hidden", display:"block" 
  } ;

  var getWH = function getWH(elem, name, which) {
    var val = name === "width" ? elem.offsetWidth : elem.offsetHeight;
    var padding = 0, border = 0, loc=which.length, dim;
    while(--loc>=0) {
      dim = which[loc];
      padding += parseFloat(CQ.curCSS( elem, "padding" + dim, true)) || 0;
      border += parseFloat(CQ.curCSS( elem, "border" + dim + "Width", true)) ||0;   
    }
    val -= Math.round(padding + border);
    return val;
  } ;

  var expando = SC.guidKey, uuid = 0, windowData = {},
    // exclude the following css properties to add px
    exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
    // cache defaultView
    defaultView = document.defaultView || {};

  // A helper method for determining if an element's values are broken
  var styleIsBorked = function styleIsBorked( elem ) {
    if ( !SC.browser.safari ) return false;

    // defaultView is cached
    var ret = defaultView.getComputedStyle( elem, null );
    return !ret || ret.getPropertyValue("color") === "";
  } ;

  

  // Helper function used by the dimensions and offset modules
  function num(elem, prop) {
    return elem[0] && parseInt( CQ.curCSS(elem[0], prop, true), 10 ) || 0;
  }

  var CoreQuery, CQ ;
  
  // implement core methods here from jQuery that we want available all the
  // time.  Use this area to implement jQuery-compatible methods ONLY.
  // New methods should be added at the bottom of the file, where they will
  // be installed as plugins on CoreQuery or jQuery. 
  CQ = CoreQuery = SC.Builder.create( /** @scope SC.CoreQuery.fn */ {
    
    /** Indicates that this is a jQuery-like object. */
    jquery: 'SC.CoreQuery',
    
    /** 
      Called on a new CoreQuery instance when it is first created.  You
      can pass a variety of options to the CoreQuery constructor function 
      including:
      
      - a simple selector: this will find the element and return it
      - element or array of elements - this will return a query with them
      - html-string: this will convert to DOM.
      
      @returns {CoreQuery} CoreQuery instance
    */
    init: function( selector, context ) {
      
      // Make sure that a selection was provided
      selector = selector || document;

      // Handle $(DOMElement)
      if ( selector.nodeType ) {
        this[0] = selector;
        this.length = 1;
        return this ;

      // Handle HTML strings
      } else if ( typeof selector === "string" ) {
        // Are we dealing with HTML string or an ID?
        var match = quickExpr.exec( selector );

        // Verify a match, and that no context was specified for #id
        if ( match && (match[1] || !context) ) {

          // HANDLE: $(html) -> $(array)
          if ( match[1] ) {
            selector = CQ.clean( [ match[1] ], context );
          }
          // HANDLE: $("#id")
          else {
            var elem = document.getElementById( match[3] );

            // Make sure an element was located
            if ( elem ){
              // Handle the case where IE and Opera return items
              // by name instead of ID
              if ( elem.id != match[3] ) return CQ().find( selector );

              // Otherwise, we inject the element directly into the jQuery object
              return CQ( elem );
            }
            selector = [];
          }

        // HANDLE: $(expr, [context])
        // (which is just equivalent to: $(content).find(expr)
        } else return CQ( context ).find( selector );

      // HANDLE: $(function)
      // Shortcut for document ready
      } else if (SC.typeOf(selector) === SC.T_FUNCTION) {
        return SC.ready(selector);
      }

      return this.setArray(CQ.makeArray(selector));
    },

    /** Return the number of elements in the matched set. */
    size: function() { return this.length; },

    /** Return the nth element of the working array OR return a clean array
      with the result set, if no number is passed.
      
      @param {Number} num (Optional)
      @returns {Object|Array}
    */
    get: function( num ) {
      return num === undefined ? CQ.makeArray(this) : this[num];
    },

    /** 
      Find subelements matching the passed selector.  Note that CoreQuery
      supports only a very simplified selector search method.  See 
      CoreQuery.find() for more information.
      
      @param {String} selector
      @returns {CoreQuery} new instance with match
    */
    find: function( selector ) {
      var elems = CQ.map(this, function(elem){
        return CQ.find( selector, elem );
      });

      return this.pushStack(elems);
    },

    /**
      Filters the matching set to include only those matching the passed 
      selector.  Note that CoreQuery supports only a simplified selector 
      search method.  See CoreQuery.find() for more information.
      
      Also note that CoreQuery implements SC.Enumerable, which means you can
      also call this method with a callback and target and the callback will
      be executed on every element in the matching set to return a result.
    
      @param {String} selector
      @returns {CoreQuery}
    */
    filter: function( selector ) {
      return this.pushStack(
        (SC.typeOf(selector) === SC.T_FUNCTION) &&
        CQ.grep(this, function(elem, i){
          return selector.call( elem, i );
        }) || CQ.multiFilter( selector, this ) );
    },

    /**
      Returns the results not matching the passed selector.  This is the 
      opposite of filter.
      
      
      @param {String} selector
      @returns {CoreQuery}
    */
    not: function( selector ) {
      if ( typeof selector === "string" ) {
        // test special case where just one selector is passed in
        if ( isSimple.test( selector ) ) {
          return this.pushStack( CQ.multiFilter( selector, this, true ) );
        }else {
          selector = CQ.multiFilter( selector, this );
        }
      }

      var isArrayLike = selector.length && selector[selector.length - 1] !== undefined && !selector.nodeType;
      return this.filter(function() {
        return isArrayLike ? CQ.inArray( this, selector ) < 0 : this != selector;
      });
    },
    
    /**    
      Force the current matched set of elements to become the specified array 
      of elements (destroying the stack in the process) You should use 
      pushStack() in order to do this, but maintain the stack.
      
      This method is mostly used internally.  You will not need to use it 
      yourself very often.
      
      @param {Array} elems
      @returns {CoreQuery} receiver
    */
    setArray: function( elems ) {
      // Resetting the length to 0, then using the native Array push
      // is a super-fast way to populate an object with array-like properties
      this.length = 0;
      Array.prototype.push.apply( this, elems );
      return this;
    },
    
    /** 
      Executes the passed function on every element in the CoreQuery object.
      Returns an array with the return values.  Note that null values will
      be omitted from the resulting set.  This differs from SC.Enumerable and
      the JavaScript standard. 
      
      The callback must have the signature:
      
      {{{
        function(currentElement, currentIndex) { return mappedValue; }
      }}}
      
      Note that "this" on the function will also be the currentElement.
      
      @param {Function} callback
      @returns {CoreQuery} results
    */
    map: function( callback ) {
      return this.pushStack( CQ.map(this, function(elem, i){
        return callback.call( elem, i, elem );
      }));
    },
    
    /**    
      Execute a callback for every element in the matched set. (You can seed 
      the arguments with an array of args, but this is only used internally.)
      
      @param {Function} callback
      @param {Object} args
      @returns {CoreQuery} receiver
    */
    each: function( callback, args ) {
      return CQ.each( this, callback, args );
    },

    /** 
      Determine the position of an element within a matched set of elements.
      jQuery-compatible name for indexOf().
      
      @param {Element} elem
      @returns {Number} location
    */
    index: function( elem ) {
      if (elem && elem.jquery) elem = elem[0];
      return Array.prototype.indexOf.call(this, elem);
    },

    /**
      Returns a new CoreQuery object that contains just the matching item.
      
      @param {Number} i
      @returns {CoreQuery}
    */
    eq: function( i ) {
      return this.slice( i, +i + 1 );
    },

    /** 
      Slice the CoreQuery result set just like you might slice and array.
      Returns a new CoreQuery object with the result set.

      @returns {CoreQuery}
    */
    slice: function() {
      return this.pushStack( Array.prototype.slice.apply( this, arguments ) );
    },

    /** Adds the relevant elements to the existing matching set. */
    add: function( selector ) {
      return this.pushStack( CQ.merge(
        this.get(),
        typeof selector === 'string' ?
          CQ( selector ) :
          CQ.makeArray( selector )
      ).uniq()) ;
    },
    
    /** 
      Get to set the named attribute value on the element.  You can either
      pass in the name of an attribute you would like to read from the first
      matched element, a single attribute/value pair to set on all elements
      or a hash of attribute/value pairs to set on all elements.
      
      @param {String} name attribute name
      @param {Object} value attribute value
      @param {String} type ?
      @returns {CoreQuery} receiver
    */
    attr: function( name, value, type ) {
      var options = name;

      // Look for the case where we're accessing a style value
      if ( typeof name === "string" ) {
        if ( value === undefined ) {
          return this[0] && CQ[ type || "attr" ]( this[0], name );
        }
        else {
          options = {};
          options[ name ] = value;
        }
      }
      // Check to see if we're setting style values
      return this.each(function(i){
        // Set all the styles
        for ( name in options ) {
          CQ.attr(
            (type)?this.style:this,
            name, CQ.prop( this, options[ name ], type, i, name ));
        }
      });
    },
    
    html: function( value ) {
      return value === undefined ?
      			(this[0] ?
      				this[0].innerHTML.replace(CQHtmlRegEx, "") :
      				null) :
      			this.empty().append( value );
    },

    andSelf: function() { return this.add( this.prevObject ); },

    /** 
      Returns YES if every element in the matching set matches the passed
      selector.  Remember that only simple selectors are supported in 
      CoreQuery.
      
      @param {String} selector
      @return {Boolean} 
    */
    is: function( selector ) {
      return !!selector && CQ.multiFilter( selector, this ).length > 0;
    },

    /**
      Returns YES if every element in the matching set has the named CSS
      class.
      
      @param {String} className
      @returns {Boolean}
    */
    hasClass: function( className ) {
      return Array.prototype.every.call(this, function(elem) {
        return (elem.nodeType===1) && CQ.className.has(elem, className) ;
      });
    },

    /** 
      Provides a standardized, cross-browser method to get and set the 
      value attribute of a form element.  Optionally pass a value to set or
      no value to get.
      
      @param {Object} value
      @return {Object|CoreQuery}
    */
    val: function( value ) {
      
      // get the value
      if ( value === undefined ) {     
        var elem = this[0];
        if (elem) {
          if(CQ.nodeName(elem, 'option')) {
            return (elem.attributes.value || {}).specified ? elem.value : elem.text;
          }
          // We need to handle select boxes special
          if ( CQ.nodeName( elem, "select" ) ) {
            var index = elem.selectedIndex,
              values = [],
              options = elem.options,
              one = elem.type === "select-one",
              option;

            // Nothing was selected
            if ( index < 0 ) return null;

            // Loop through all the selected options
            var i, max = one ? index+1:options.length;
            for (i = one ? index : 0; i < max; i++ ) {
              option = options[ i ];
              if ( option.selected ) {
                value = CQ(option).val(); // get value
                if (one) return value; // We don't need an array for one
                values.push( value ); // Multi-Selects return an array
              }
            }

            return values;        
          }

          // Everything else, we just grab the value
          return (elem.value || "").replace(/\r/g, "");
        }
        return undefined;
        
      // otherwise set the value
      } else {
        if( typeof value === "number" ) value += ''; // force to string
        this.each(function(){
          if ( this.nodeType !== 1 ) return;
          
          // handle radio/checkbox.  set the checked value
          if (SC.typeOf(value) === SC.T_ARRAY && (/radio|checkbox/).test(this.type)) {
            this.checked = (CQ.inArray(this.value, value) >= 0 ||
              CQ.inArray(this.name, value) >= 0);
              
          // handle selects
          } else if ( CQ.nodeName( this, "select" ) ) {
            var values = CQ.makeArray(value);
            CQ( "option", this ).each(function(){
              this.selected = (CQ.inArray( this.value, values ) >= 0 ||
                CQ.inArray( this.text, values ) >= 0);
            });

            if (!values.length) this.selectedIndex = -1;

          // otherwise, just set the value property
          } else this.value = value;
        });       
      }
      return this ;
    },

    /** 
      Returns a clone of the matching set of elements.  Note that this will
      NOT clone event handlers like the jQuery version does becaue CoreQuery
      does not deal with events.
    */
    clone: function() {
      // Do the clone
      var ret = this.map(function(){
        if ( SC.browser.msie && !CQ.isXMLDoc(this) ) {
          // IE copies events bound via attachEvent when
          // using cloneNode. Calling detachEvent on the
          // clone will also remove the events from the orignal
          // In order to get around this, we use innerHTML.
          // Unfortunately, this means some modifications to
          // attributes in IE that are actually only stored
          // as properties will not be copied (such as the
          // the name attribute on an input).
          var clone = this.cloneNode(true),
            container = document.createElement("div");
          container.appendChild(clone);
          return CQ.clean([container.innerHTML])[0];
        } else return this.cloneNode(true);
      });

      // Need to set the expando to null on the cloned set if it exists
      // removeData doesn't work here, IE removes it from the original as well
      // this is primarily for IE but the data expando shouldn't be copied 
      // over in any browser
      var clone = ret.find("*").andSelf().each(function(){
        if ( this[ SC.guidKey ] !== undefined ) {
          this[ SC.guidKey ] = null;
        }
      });

      // Return the cloned set
      return ret;
    },

    /** 
      Set or retrieve the specified CSS value.  Pass only a key to get the
      current value, pass a key and value to change it.
      
      @param {String} key
      @param {Object} value
      @returns {Object|CoreQuery}
    */
    css: function( key, value ) {
      // ignore negative width and height values
      if ((key === 'width' || key === 'height') && parseFloat(value,0) < 0 ) {
        value = undefined;
      }
      return this.attr( key, value, "curCSS" );
    },

    /**
      Set or retrieve the text content of an element.  Pass a text element to
      update or set to end it.
      
      @param {String} text
      @returns {String|CoreQuery}
    */
    text: function( text ) {
      if ( text !== undefined && typeof text !== "object" && text != null ) {
        return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
      }
      var ret = "";

      CQ.each( text || this, function(){
        CQ.each( this.childNodes, function(){
          if ( this.nodeType !== 8 ){
            ret += this.nodeType !== 1 ?
              this.nodeValue : CQ.fn.text( [ this ] );
          }
        });
      });

      return ret;
    },

    /** Simple method to show elements without animation. */
    show: function() {
      var isVisible = SC.$.isVisible;
      this.each(function() {
        if (!isVisible(this)) {
          
          // try to restore to natural layout as defined by CSS
          this.style.display = this.oldblock || '';
          
          // handle edge case where the CSS style is none so we can't detect
          // the natural display state.
          if (CQ.css(this,'display') === 'none') {
            var elem = CQ('<' + this.tagName + '/>');
            CQ('body').append(elem);
            this.style.display = elem.css('display');
            // edge case where we still can't get the display
            if (this.style.display === 'none') this.style.display = 'block';
            elem.remove(); elem = null;
          }
        }
      }) ;
      return this ;
    },

    /** Simple method to hide elements without animation. */
    hide: function() {
      var isVisible = SC.$.isVisible;
      this.each(function() {
        if (isVisible(this)) {
          this.oldblock = this.oldblock || CQ.css(this,'display');
          this.style.display = 'none';
        }
      }) ;
      return this ;
    },
    
    /** 
      Low-level dom manipulation method used by append(), before(), after()
      among others.  Unlike the jQuery version, this version does not execute
      <script> tags.  That is generally not a good way to input scripts.
    */
    domManip: function( args, table, reverse, callback ) {
      var clone = this.length > 1, elems;

      return this.each(function(){
        if ( !elems ) {
          elems = CQ.clean( args, this.ownerDocument );
          if (reverse) elems.reverse();
        }

        var obj = this;
        if ( table && CQ.nodeName( this, "table" ) && CQ.nodeName( elems[0], "tr" ) ) {
          obj = this.getElementsByTagName("tbody")[0] || this.appendChild( this.ownerDocument.createElement("tbody") );
        }

        CQ.each(elems, function(){
          var elem = clone ? CQ( this ).clone( true )[0] : this;
          // Inject the elements into the document
          callback.call( obj, elem );
        });
      });
    },
    
    append: function() {
      return this.domManip(arguments, true, false, function(elem){
        if (this.nodeType === 1) this.appendChild( elem );
      });
    },

    prepend: function() {
      return this.domManip(arguments, true, true, function(elem){
        if (this.nodeType === 1) this.insertBefore( elem, this.firstChild );
      });
    },

    before: function() {
      return this.domManip(arguments, false, false, function(elem){
        this.parentNode.insertBefore( elem, this );
      });
    },

    after: function() {
      return this.domManip(arguments, false, true, function(elem){
        this.parentNode.insertBefore( elem, this.nextSibling );
      });
    },

    replaceWith: function( value ) {
      return this.after( value ).remove();
    },

    removeData: function( key ){
      return this.each(function(){ SC.removeData( this, key ); });
    }

  }) ;
  
  // add useful helper methods to CoreQuery
  CoreQuery.mixin(/** @scope SC.CoreQuery */ {
    
    nodeName: function( elem, name ) {
      return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
    },
    
    /**
      Execute the passed callback on the elems array, returning an array with
      the mapped values.  Note that null return values are left out of the
      resulting mapping array.  This differs from the standard map() function
      defined by SC.Enumerable and the JavaScript standard.
      
      The callback must have the signature:
      
      {{{
        function(currentElement, currentIndex) { return mappedValue; }
      }}}
      
      Note that "this" on the function will also be the currentElement.
      
      @param {Array} elems
      @param {Function} callback
      @returns {Array} mapped elements
    */
    map: function( elems, callback ) {
      var ret = [], value, i, length;

      // Go through the array, translating each of the items to their
      // new value (or values).
      for ( i = 0, length = elems.length; i < length; i++ ) {
        value = callback( elems[ i ], i );

        if ( value != null ) ret[ ret.length ] = value;
      }
      
      return ret.concat.apply([],ret) ;
    },

    /** 
      Executes the passed callback on each item in the iterable object
      passed.  This deviates from the standard getEach() method defined in
      SC.Enumerable and in the JavaScript standards.
      
      @param {Array} object
      @param {Function} callback
      @param {Object} args internal use only
      @returns {Object} object
    */
    each: function( object, callback, args ) {
      var name, i = 0, length = object.length;

      if ( args ) {
        if ( length === undefined ) {
          for ( name in object ) {
            if ( callback.apply( object[ name ], args ) === false ) break;
          }
        } else {
          for ( ; i < length; ) {
            if ( callback.apply( object[ i++ ], args ) === false ) break;
          }
        }
      // A special, fast, case for the most common use of each
      } else {
        if ( length === undefined ) {
          for ( name in object ) {
            if ( callback.call( object[ name ], name, object[ name ] ) === false ) break;
          }
        } else {
          for ( var value = object[0];
            i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
          }
      }

      return object;
    },
    
    isXMLDoc: function( elem ) {
      return elem.documentElement && !elem.body ||
        elem.tagName && elem.ownerDocument && !elem.ownerDocument.body;
    },
    
    clean: function( elems, context ) {
      var ret = [];
      context = context || document;
      // !context.createElement fails in IE with an error but returns typeof 'object'
      if (typeof context.createElement == 'undefined') {
        context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
      }

      CQ.each(elems, function(i, elem){
        if ( typeof elem === 'number' ) elem += '';
        if ( !elem ) return;

        // Convert html string into DOM nodes
        if ( typeof elem === "string" ) {
          // Fix "XHTML"-style tags in all browsers
          elem = elem.replace(tagSearchRegEx, function(all, front, tag){
            return tag.match(xmlTagsRegEx) ?
              all :
              front + "></" + tag + ">";
          });

          // Trim whitespace, otherwise indexOf won't work as expected
          var tags = elem.replace(trimWhiteSpaceRegEx, "").substring(0, 10).toLowerCase(), 
              div = context.createElement("div");

          var wrap =
            // option or optgroup
            !tags.indexOf("<opt") &&
            [ 1, "<select multiple='multiple'>", "</select>" ] ||

            !tags.indexOf("<leg") &&
            [ 1, "<fieldset>", "</fieldset>" ] ||

            tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&
            [ 1, "<table>", "</table>" ] ||

            !tags.indexOf("<tr") &&
            [ 2, "<table><tbody>", "</tbody></table>" ] ||

            // <thead> matched above
            (!tags.indexOf("<td") || !tags.indexOf("<th")) &&
            [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||

            !tags.indexOf("<col") &&
            [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||

            // IE can't serialize <link> and <script> tags normally
            SC.browser.msie &&
            [ 1, "div<div>", "</div>" ] ||

            [ 0, "", "" ];

          // Go to html and back, then peel off extra wrappers
          div.innerHTML = wrap[1] + elem + wrap[2];

          // Move to the right depth
          while ( wrap[0]-- ) div = div.lastChild;

          // Remove IE's autoinserted <tbody> from table fragments
          if ( SC.browser.msie ) {

            // String was a <table>, *may* have spurious <tbody>
            var tbody = !tags.indexOf("<table") && tags.indexOf("<tbody") < 0 ?
              div.firstChild && div.firstChild.childNodes :

              // String was a bare <thead> or <tfoot>
              wrap[1] === "<table>" && tags.indexOf("<tbody") < 0 ?
                div.childNodes :
                [];

            for ( var j = tbody.length - 1; j >= 0 ; --j ) {
              if ( CQ.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
                tbody[ j ].parentNode.removeChild( tbody[ j ] );
              }
            }
            // IE completely kills leading whitespace when innerHTML is used
            if ( /^\s/.test( elem ) ) {
              div.insertBefore( context.createTextNode( elem.match(/^\s*/)[0] ), div.firstChild );
            }
          }

          elem = CQ.makeArray( div.childNodes );
        }

        if (elem.length === 0 && (!CQ.nodeName( elem, "form" ) && !CQ.nodeName( elem, "select" ))) return;

        if (elem[0] === undefined || CQ.nodeName( elem, "form" ) || elem.options) ret.push( elem );

        else ret = CQ.merge( ret, elem );

      });

      return ret;
    },
    
    /** 
      Core element finder function in SC.CoreQuery.  CoreQuery supports only
      a very simple set of finders.  Namely, you can specify the following
      simple types of selectors:
      
      - .class-name: this will find all elements with the matching class name
      - #id: this will find all elements matching the ID
      - tagname: this will find all elements with the matching tags.
      
      You can also do some basic joined expressions like:
      
      {{{
        tagname.class-name and tagname#id
      }}}
      
      Finally, you can do simple compound searches like
      
      {{{
        tagname .class-name tagname#id
      }}}
      
      You can also pass multiple selectors separated by commas.  The return
      set will be the OR of all the result set.
      
      {{{
        #item1,#item2,#item3
      }}}
      
      You cannot do any child searches, psuedo-selectors or other complex 
      searches.  These are only the kinds of selectors that can be parsed
      quickly and use built-in methods on the browser.
      
      @param {String} t selector
      @param {Element} context
      @returns {Array} matched elements
    */
    find: function( t, context ) {
      var ret;
      
      // Quickly handle non-string expressions
      if ( typeof t !== "string" ) return [ t ];

      // if the selector contains commas, then we actually want to search
      // multiple selectors.
      if (t.indexOf(',')>=0) {
        ret = t.split(',').map(function(sel) {
          return CQ.find(sel,context);
        });

        // flatten arrays
        return ret.concat.apply([],ret).uniq() ;
      }
      
      // check to make sure context is a DOM element or a document
      if ( context && context.nodeType !== 1 && context.nodeType !== 9) {
        return [];
      }

      // Set the correct context (if none is provided)
      context = context || document;

      // Initialize the search.  split the selector into pieces
      ret = [context];
      var nodeName, inFindMode = YES,
          parts = t.match(quickSplit), len = parts.length, m ;
      
      // loop through each part and either find or filter as needed
      for(var idx=0;idx<len;idx++) {
        t = parts[idx]; // the current selector to parse
        
        // handle space separators.  this just resets to find mode
        if (t === ' ' || t === '') {
          inFindMode = YES ;
          
        // if we are in find mode, then use the current selector to
        // find new elements that are children. at the end, leave findMode.
        } else if (inFindMode) {

          // split into parts to test result
          m = singleClass.exec(t);
          
          // handle special case where we get a tag name followed by an ID.
          // in this case, just swap the two and proceed.
          if ((m[1] === '') && (idx<(len-1)) && (parts[idx+1].charAt(0)==='#')) {
            t = parts[idx+1]; parts[idx+1] = parts[idx]; // swap
            m = singleClass.exec(t); // reparse
          }

          // now loop through and find elements based on tag
          var next = [], retlen = ret.length, retidx, cur, val = m[2], found;
          for(retidx=0;retidx<retlen;retidx++) {
            cur = ret[retidx]; 
            switch(m[1]) {
            case '': // tag
              if (!val) val = '*';
              // Handle IE7 being really dumb about <object>s
              if ( val === "*" && cur.nodeName.toLowerCase() === "object" ) {
                val = "param";
              }
              
              next = CQ.merge(next, cur.getElementsByTagName(val));
              break;
              
            case '#': // id
              // handle special case where we are searching the document
              if (cur === document) {
                found = document.getElementById(val) ;
                
                // if this is IE, verify that it didn't search by name
                if (SC.browser.msie && found && found.getAttribute('id')!==val){
                  found = NO; // clear
                } else {
                  if (found) next.push(found) ;
                  found = YES ; // do not do slow search
                }
              } else found = NO;
              
              // Otherwise, we have to do a slow search
              if (!found) {
                // the return value of getElementsByTagName is not an Array
                // so we need to fake it.
                found = cur.getElementsByTagName('*') ;
                found = Array.prototype.find.call(found, function(el){
                  return el.getAttribute && (el.getAttribute('id')===val);
                }) ;
                if (found) next.push(found) ;
              }
              break ;
              
            case '.': // class
              if (cur.getElementsByClassName) {
                next = CQ.merge(next, cur.getElementsByClassName(val));
              } else {
                next = CQ.merge(next, 
                  CQ.classFilter(cur.getElementsByTagName('*'),val));
              }
              break;
            default:
              // do nothing
            }
          }
          delete ret; 
          ret = next ; // swap array
          inFindMode = NO;
          
        // if we are not in findMode then simply filter the results.
        } else ret = CQ.filter(t, ret) ;
      }
      
      // remove original context if still there
      if (ret && ret[0] == context) ret.shift();
      return ret.uniq() ; // make sure no duplicated are returned
    },

    classFilter: function(r,m,not){
      m = " " + m + " ";
      var tmp = [], pass;
      for ( var i = 0; r[i]; i++ ) {
        pass = (" " + r[i].className + " ").indexOf( m ) >= 0;
        if ( !not && pass || not && !pass ) {
          tmp.push( r[i] );
        }
      }
      return tmp;
    },
    
    /** 
      Filters a set of elements according to those matching the passed
      selector.  The selector can contain only tag, class, and id options.
      
      The CoreQuery filter function is only capable of handling simple querys
      such as a tag, class or ID.  You cannot combine them.  Instead call
      filter several times.
      
      @param {String} t the selector to filter by
      @param {Array} r the element to filter
      @param {Boolean} not invert filter
      @returns {Array} filtered array
    */
    filter: function(t,r,not) {
      // split into parts to test result
      var m = singleClass.exec(t), val = m[2], kind = m[1], filter ;
      if (kind === '.') { // special case class
        return CQ.classFilter(CQ.makeArray(r), val, not) ;
      } else {
        if (kind === '#') { // id
          filter = function(el) {
            var ret=el && el.getAttribute && (el.getAttribute('id') === val);
            return (not) ? !ret : ret ;
          } ;
          
        } else { // tag
          filter = function(el) {
            var ret= CQ.nodeName(el, val);
            return (not) ? !ret : ret ;
          } ;
        }
        
        // the return value may not be a real instance of Array, so fake it.
        return Array.prototype.filter.call(CQ.makeArray(r), filter) ;
      }
    },

    /** @private Accepts filters separated by commas. */
    multiFilter: function( expr, elems, not ) {
      expr = expr.indexOf(',') ? expr.split(',') : [expr];
      var loc=expr.length,cur,ret=[];
      while(--loc >= 0) { // unit tests expect reverse iteration
        cur = CQ.filter(expr[loc].trim(), elems, not) ;
        ret = not ? elems = cur : CQ.merge(cur,ret);
      }
      return ret ;
    },

    /** 
      Merge two result sets together.  This method knows how to handle 
      the special iterables returned by IE as well.  Used internally.
    */
    merge: function(first, second) {
      // We have to loop this way because IE & Opera overwrite the length
      // expando of getElementsByTagName
      var i = 0, elem, pos = first.length;
      // Also, we need to make sure that the correct elements are being 
      // returned (IE returns comment nodes in a '*' query)
      if ( SC.browser.msie ) {
        while ( elem = second[ i++ ] ) {
          if ( elem.nodeType !== 8 ) first[ pos++ ] = elem;
        }

      } else {
        while ( elem = second[ i++ ] ) first[ pos++ ] = elem;
      }

      return first;
    },
    
    // makeArray is the CoreQuery version of $A().
    makeArray: function(array) {
      var ret = [];

      if( !SC.none(array) ){
        var i = array.length;
        // The window, strings (and functions) also have 'length'
        if( i == null || typeof array === 'string' || array.setInterval ) {
          ret[0] = array;
        }
        else {
          while( i ) ret[--i] = array[i];
        }
      }

      return ret;
    },

    inArray: function(elem,array) {
      return array.indexOf ? array.indexOf(elem) : Array.prototype.indexOf.call(array, elem);
    },
    
    // Check to see if the W3C box model is being used
    boxModel: !SC.browser.msie || document.compatMode === "CSS1Compat",

    props: {
      "for": "htmlFor",
      "class": "className",
      "float": styleFloat,
      cssFloat: styleFloat,
      styleFloat: styleFloat,
      readonly: "readOnly",
      maxlength: "maxLength",
      cellspacing: "cellSpacing",
      rowspan: "rowSpan"
    },
    
    /** @private Prepares a property string for insertion. */
    prop: function( elem, value, type, i, name ) {
      // Handle executable functions
      if (SC.typeOf(value) === SC.T_FUNCTION) value = value.call(elem, i);

      // Handle passing in a number to a CSS property
      return value && (typeof value === "number") && type === "curCSS" && !exclude.test( name ) ? value + "px" : value;
    },
    
    
    grep: function( elems, callback, inv ) {
      var ret = [];

      // Go through the array, only saving the items
      // that pass the validator function
      for ( var i = 0, length = elems.length; i < length; i++ ) {
        if ( !inv != !callback( elems[ i ], i ) ) ret.push( elems[ i ] );
      }
      return ret;
    },
    
    /** @private internal use only */
    className: {

      // internal only, use addClass("class")
      add: function( elem, classNames ) {
        var has = CQ.className.has ;
        CQ.each((classNames || "").split(checkforSpaceRegEx), function(i, className){
          if ( elem.nodeType === 1 && !has( elem.className, className ) ) {
            elem.className += (elem.className ? " " : "") + className;
          }
        });
      },

      // internal only, use removeClass("class")
      remove: function( elem, classNames ) {
        if (elem.nodeType === 1) {
          elem.className = classNames !== undefined ?
            CQ.grep(elem.className.split(checkforSpaceRegEx), function(className){
              return !CQ.className.has( classNames, className );
            }).join(" ") : "";
        }
      },

      // internal only, use hasClass("class")
      has: function( elem, className ) {
        return elem && CQ.inArray( className, (elem.className || elem).toString().split(checkforSpaceRegEx) ) > -1;
      }
    },
    
    /** @private A method for quickly swapping in/out CSS properties to get 
      correct calculations */
    swap: function( elem, options, callback, direction, arg ) {
      var old = {}, name;
      // Remember the old values, and insert the new ones
      for ( name in options ) {
        old[ name ] = elem.style[ name ];
        elem.style[ name ] = options[ name ];
      }

      var ret = callback(elem, direction, arg );

      // Revert the old values
      for ( name in options ) elem.style[ name ] = old[ name ];
      return ret ;
    },
    
    /** returns a normalized value for the specified style name. */
    css: function( elem, name, force ) {
      // handle special case for width/height
      if ( name === "width" || name === "height" ) {
        var val, which = (name === "width") ? LEFT_RIGHT : TOP_BOTTOM,
        props = CSS_DISPLAY_PROPS;

        val = SC.$.isVisible(elem) ? getWH(elem,name,which) : CQ.swap(elem,props,getWH,name,which) ;

        return Math.max(0, val);
      }

      return CQ.curCSS( elem, name, force );
    },

    /** @private internal method to retrieve current CSS. */
    curCSS: function( elem, name, force ) {
      var ret, style = elem.style;

      // We need to handle opacity special in IE
      if ( name === "opacity" && SC.browser.msie ) {
        ret = CQ.attr( style, "opacity" );
        return ret === "" ? "1" : ret;
      }
      
      // Opera sometimes will give the wrong display answer, this fixes it, 
      // see #2037
      if ( SC.browser.opera && name === "display" ) {
        var save = style.outline;
        style.outline = "0 solid black";
        style.outline = save;
      }

      // Make sure we're using the right name for getting the float value
      var isFloat = name.match(/float/i); 
      if (isFloat) name = styleFloat;

      // simple case to collect the value
      if ( !force && style && style[ name ] ) {
        ret = style[ name ];

      // otherwise try to use cached computed value
      } else if ( defaultView.getComputedStyle ) {

        // Only "float" is needed here
        if (isFloat) name = "float";

        name = name.replace( /([A-Z])/g, "-$1" ).toLowerCase();

        // get the computed style and verify its not broken.
        var computedStyle = defaultView.getComputedStyle( elem, null );
        if ( computedStyle && !styleIsBorked(elem, defaultView) ) {
          ret = computedStyle.getPropertyValue( name );

        // If the element isn't reporting its values properly in Safari
        // then some display: none elements are involved
        } else {
          var swap = [], stack = [], a = elem, i = 0, swLen, stLen;

          // Locate all of the parent display: none elements
          for ( ; a && styleIsBorked(a); a = a.parentNode ) stack.unshift(a);

          // Go through and make them visible, but in reverse
          // (It would be better if we knew the exact display type that they 
          // had)
          for (stLen = stack.length ; i < stLen; i++ ) {
            var stackTmp =stack[i];
            if (stackTmp && stackTmp.style && styleIsBorked(stackTmp)) {
              swap[i] = stackTmp.style.display;
              stackTmp.style.display = "block";
            }
          }

          // Since we flip the display style, we have to handle that
          // one special, otherwise get the value
          ret = (name === "display" && swap[stack.length-1]!==null) ? "none" :
            (computedStyle && computedStyle.getPropertyValue(name)) || "";

          // Finally, revert the display styles back
          for ( i = 0, swLen = swap.length; i < swLen; i++ ) {
            if (swap[i]!==null) stack[i].style.display = swap[i];
          }
        }

        // We should always get a number back from opacity
        if (name === "opacity" && ret === "") ret = "1";

      } else if (elem.currentStyle) {
        // var camelCase = name.camelize();

        ret = elem.currentStyle[ name ] || elem.currentStyle[ name.camelize() ];

        // From the awesome hack by Dean Edwards
        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
        // If we're not dealing with a regular pixel number
        // but a number that has a weird ending, we need to convert it to 
        // pixels
        if (!(/^\d+(px)?$/i).test(ret) && (/^\d/).test(ret)) {
          // Remember the original values
          var left = style.left, rsLeft = elem.runtimeStyle.left;

          // Put in the new values to get a computed value out
          elem.runtimeStyle.left = elem.currentStyle.left;
          style.left = ret || 0;
          ret = style.pixelLeft + "px";

          // Revert the changed values
          style.left = left;
          elem.runtimeStyle.left = rsLeft;
        }
      }

      return ret;
    },

    /** @private
      returns all of the actual nodes (excluding whitespace, comments, etc) in 
      the passed element.
    */
    dir: function( elem, dir ){
      var matched = [], cur = elem[dir];
      while ( cur && cur != document ) {
        if ( cur.nodeType === 1 ) matched.push( cur );
        cur = cur[dir];
      }
      return matched;
    },

    /** @private
      Returns the nth actual node (not whitespace, comment, etc) in the passed
      element.
    */
    nth: function(cur,result,dir,elem){
      result = result || 1;
      var num = 0;
      for ( ; cur; cur = cur[dir] ) {
        if ( cur.nodeType === 1 && ++num == result ) break;
      }
      return cur;
    },

    /** @private Finds the regular element-style siblings. */
    sibling: function( n, elem ) {
      var r = [];
      for ( ; n; n = n.nextSibling ) {
        if ( n.nodeType === 1 && n != elem ) r.push( n );
      }
      return r;
    },
    
    /** Primitive helper can read or update an attribute on an element. */
    attr: function( elem, name, value ) {
      // don't set attributes on text and comment nodes
      if (!elem || elem.nodeType === 3 || elem.nodeType === 8) return undefined;

      var notxml = !CQ.isXMLDoc( elem ),
        set = value !== undefined,
        msie = SC.browser.msie;

      // Try to normalize/fix the name
      name = notxml && CQ.props[ name ] || name;

      // Only do all the following if this is a node (faster for style)
      // IE elem.getAttribute passes even for style
      if ( elem.tagName ) {

        // These attributes require special treatment
        var special = specialAttributesRegEx.test( name );

        // Safari mis-reports the default selected property of a hidden option
        // Accessing the parent's selectedIndex property fixes it
        if ( name === "selected" && elem.parentNode ) {
          elem.parentNode.selectedIndex;
        }

        // If applicable, access the attribute via the DOM 0 way
        if ( name in elem && notxml && !special ) {
          if ( set ){
            // We can't allow the type property to be changed (since it causes 
            // problems in IE)
            if ( name === "type" && CQ.nodeName( elem, "input" ) && elem.parentNode ) {
              throw "type property can't be changed";
            }

            elem[ name ] = value;
          }

          // browsers index elements by id/name on forms, give priority to 
          // attributes.
          if( CQ.nodeName( elem, "form" ) && elem.getAttributeNode(name) ) {
            return elem.getAttributeNode( name ).nodeValue;
          }
          
          // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
          // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
          if ( name === "tabIndex" ) {
          	var attributeNode = elem.getAttributeNode( "tabIndex" );
          	return attributeNode && attributeNode.specified
          				? attributeNode.value
          				: elem.nodeName.match(tagsWithTabIndexRegEx)
          					? 0
          					: elem.nodeName.match(/^(a|area)$/i) && elem.href
          						? 0
          						: undefined;
          }

          return elem[ name ];
        }

        if ( msie && notxml &&  name === "style" ) {
          return CQ.attr( elem.style, "cssText", value );
        }
        // convert the value to a string (all browsers do this but IE) see 
        // #1070 (jQuery)
        if ( set ) elem.setAttribute( name, "" + value );

        // Some attributes require a special call on IE
        var attr = (msie && notxml && special)
            ? elem.getAttribute( name, 2 )
            : elem.getAttribute( name );

        // Non-existent attributes return null, we normalize to undefined
        return attr === null ? undefined : attr;
      }

      // elem is actually elem.style ... set the style

      // IE uses filters for opacity
      if ( msie && name === "opacity" ) {
        if ( set ) {
          // IE has trouble with opacity if it does not have layout
          // Force it by setting the zoom level
          elem.zoom = 1;

          // Set the alpha filter to set the opacity
          elem.filter = (elem.filter || "").replace( alphaDetectRegEx, "" ) +
            (parseInt(value,0) + '' == "NaN" ? "" : "alpha(opacity=" + value * 100 + ")");
        }

        return elem.filter && elem.filter.indexOf("opacity=") >= 0 ?
          (parseFloat( elem.filter.match(alphaReplaceRegEx)[1] ) / 100) + '':
          "";
      }

      name = name.camelize();
      if ( set ) elem[ name ] = value;

      return elem[ name ];
    }
        
  }) ;
  
  CQ.fn.init.prototype = CQ.fn;
  
  // Create a new generic handlers. 
  CQ.each({
    parent: function(elem){return elem.parentNode;},

    parents: function(elem){return CQ.dir(elem,"parentNode");},

    next: function(elem){return CQ.nth(elem,2,"nextSibling");},

    prev: function(elem){return CQ.nth(elem,2,"previousSibling");},
    
    nextAll: function(elem){
      return CQ.dir(elem,"nextSibling");
    },
    
    prevAll: function(elem){
      return CQ.dir(elem,"previousSibling");
    },
    
    siblings: function(elem){
      return CQ.sibling(elem.parentNode.firstChild,elem);
    },
    
    children: function(elem){return CQ.sibling(elem.firstChild);},
    
    contents: function(elem){
      return CQ.nodeName(elem,"iframe") ?
      elem.contentDocument||elem.contentWindow.document :
      CQ.makeArray(elem.childNodes);
    }
    
  }, function(name, fn){
    CQ.fn[ name ] = function( selector ) {
      var ret = CQ.map( this, fn );

      if ( selector && typeof selector === "string" ) {
        ret = CQ.multiFilter( selector, ret );
      }
      return this.pushStack(ret.uniq());
    };
  });
  
  CQ.each({
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replaceWith"
  }, function(name, original){
    CQ.fn[ name ] = function() {
      var args = arguments;

      return this.each(function(){
        for ( var i = 0, length = args.length; i < length; i++ ) {
          CQ( args[ i ] )[ original ]( this );
        }
      });
    };
  });
  
  CQ.each({
    removeAttr: function( name ) {
      CQ.attr( this, name, "" );
      if (this.nodeType === 1) this.removeAttribute( name );
    },

    addClass: function( classNames ) {
      CQ.className.add( this, classNames );
    },

    removeClass: function( classNames ) {
      CQ.className.remove( this, classNames );
    },

    toggleClass: function( classNames ) {
      CQ.className[ CQ.className.has( this, classNames ) ? "remove" : "add" ]( this, classNames );
    },

    /**  
      Removes either all elements or elements matching the selector.  Note
      that this does NOT account for event handling, since events are not
      managed by CoreQuery, unlike jQuery.
    */
    remove: function( selector ) {
      if ( !selector || CQ.filter( selector, [ this ] ).length ) {
        if (this.parentNode) this.parentNode.removeChild( this );
      }
    },

    /** 
      Removes the contents of the receiver, leaving it empty.  Note that this
      does NOT deal with Event handling since that is not managed by 
      CoreQuery.
    */
    empty: function() {
      while ( this.firstChild ) this.removeChild( this.firstChild );
    }
    
  }, function(name, fn){
    CQ.fn[name] = function(){ return this.each(fn, arguments); };
  });
  
  // Setup width and height functions
  CQ.each([ "Height", "Width" ], function(i, name){
    var type = name.toLowerCase(), ret;

    CQ.fn[ type ] = function( size ) {
      
      // Get window width or height
      if(this[0] === window) {
        
        // Opera reports document.body.client[Width/Height] properly in both 
        // quirks and standards
        if (SC.browser.opera) {
          ret = document.body["client" + name];

        // Safari reports inner[Width/Height] just fine (Mozilla and Opera 
        // include scroll bar widths)
        } else if (SC.browser.safari) {
          ret = window["inner" + name] ;

        // Everyone else use document.documentElement or document.body 
        // depending on Quirks vs Standards mode
        } else if (document.compatMode) {
          ret = documentElement['client' + name];
        } else ret = document.body['client' + name];
        
      // get document width or height
      } else if (this[0] === document) {
        // Either scroll[Width/Height] or offset[Width/Height], whichever is 
        // greater
        ret = Math.max(
          Math.max(document.body["scroll" + name], document.documentElement["scroll" + name]),
          Math.max(document.body["offset" + name], document.documentElement["offset" + name])) ;        
          
      // get/set element width/or height
      } else {
        if (size === undefined) {
          return this.length ? CQ.css(this[0], type) : null ;

          // Set the width or height on the element (default to pixels if value is unitless)
        } else {
          return this.css(type, (typeof size === "string") ? size : size+"px");
        }
      }
      return ret ;
    };
    
    var tl = i ? "Left"  : "Top",  // top or left
      br = i ? "Right" : "Bottom"; // bottom or right

    // innerHeight and innerWidth
    CQ.fn["inner" + name] = function(){
      return this[ name.toLowerCase() ]() +
        num(this, "padding" + tl) +
        num(this, "padding" + br);
    };

    // outerHeight and outerWidth
    CQ.fn["outer" + name] = function(margin) {
      return this["inner" + name]() +
        num(this, "border" + tl + "Width") +
        num(this, "border" + br + "Width") +
        (margin ? num(this, "margin" + tl) + num(this, "margin" + br) : 0);
    };
    
  });
    
  // The Offset Method
  // Originally By Brandon Aaron, part of the Dimension Plugin
  // http://jquery.com/plugins/project/dimensions
  
  /** Calculates the offset for the first passed element. */
  CoreQuery.fn.offset = function() {
    var left = 0, top = 0, elem = this[0], br = SC.browser, results;
    if (!elem) return undefined; 

    function border(elem) {
      add( CQ.curCSS(elem, "borderLeftWidth", true), CQ.curCSS(elem, "borderTopWidth", true) );
    }

    function add(l, t) {
      left += parseInt(l, 10) || 0;
      top += parseInt(t, 10) || 0;
    }

    var parent       = elem.parentNode,
        offsetChild  = elem,
        offsetParent = elem.offsetParent,
        doc          = elem.ownerDocument,
        safari2      = br.safari && parseInt(br.version,0) < 522 && !(/adobeair/i).test(br.userAgent),
        css          = CQ.curCSS,
        fixed        = CQ.css(elem, "position") === "fixed";

    // Use getBoundingClientRect if available
    if (!(br.mozilla && elem==document.body) && elem.getBoundingClientRect){
      var box = elem.getBoundingClientRect();

      // Add the document scroll offsets
      add(box.left + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
        box.top  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));

      // IE adds the HTML element's border, by default it is medium which is 
      // 2px IE 6 and 7 quirks mode the border width is overwritable by the 
      // following css html { border: 0; } IE 7 standards mode, the border is 
      // always 2px This border/offset is typically represented by the 
      // clientLeft and clientTop properties
      // However, in IE6 and 7 quirks mode the clientLeft and clientTop 
      // properties are not updated when overwriting it via CSS
      // Therefore this method will be off by 2px in IE while in quirksmode
      add( -doc.documentElement.clientLeft, -doc.documentElement.clientTop );

    // Otherwise loop through the offsetParents and parentNodes
    } else {

      // Initial element offsets
      add( elem.offsetLeft, elem.offsetTop );

      // Get parent offsets
      while ( offsetParent ) {
        // Add offsetParent offsets
        add( offsetParent.offsetLeft, offsetParent.offsetTop );

        // Mozilla and Safari > 2 does not include the border on offset parents
        // However Mozilla adds the border for table or table cells
        if ( br.mozilla && !(/^t(able|d|h)$/i).test(offsetParent.tagName) || br.safari && !safari2 ) border( offsetParent );

        // Add the document scroll offsets if position is fixed on any 
        // offsetParent
        if (!fixed && css(offsetParent, "position") === "fixed") fixed = true;

        // Set offsetChild to previous offsetParent unless it is the body 
        // element
        offsetChild  = (/^body$/i).test(offsetParent.tagName) ? offsetChild : offsetParent;
        // Get next offsetParent
        offsetParent = offsetParent.offsetParent;
      }

      // Get parent scroll offsets
      while ( parent && parent.tagName && !(bodyHTMLOffsetRegEx).test(parent.tagName)) {
        
        // Remove parent scroll UNLESS that parent is inline or a table to 
        // work around Opera inline/table scrollLeft/Top bug
        if ( !(/^inline|table.*$/i).test(css(parent, "display")) ) {
          // Subtract parent scroll offsets
          add( -parent.scrollLeft, -parent.scrollTop );
        }

        // Mozilla does not add the border for a parent that has overflow != 
        // visible
        if ( br.mozilla && css(parent, "overflow") !== "visible" ) border(parent);

        // Get next parent
        parent = parent.parentNode;
      }

      // Safari <= 2 doubles body offsets with a fixed position 
      // element/offsetParent or absolutely positioned offsetChild
      // Mozilla doubles body offsets with a non-absolutely positioned 
      // offsetChild
      if ((safari2 && (fixed || css(offsetChild, "position") === "absolute"))||
        (br.mozilla && css(offsetChild, "position") !== "absolute") ) {
          add( -doc.body.offsetLeft, -doc.body.offsetTop );
        }

      // Add the document scroll offsets if position is fixed
      if ( fixed ) {
        add(Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
          Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));
      }
    }

    // Return an object with top and left properties
    results = { top: top, left: left };

    return results;
  };

  CoreQuery.fn.mixin({
    position: function() {
      var left = 0, top = 0, results;

      if ( this[0] ) {
        // Get *real* offsetParent
        var offsetParent = this.offsetParent(),

        // Get correct offsets
        offset       = this.offset(),
        parentOffset = bodyHTMLOffsetRegEx.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft 
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top  -= num( this, 'marginTop' );
        offset.left -= num( this, 'marginLeft' );

        // Add offsetParent borders
        parentOffset.top  += num( offsetParent, 'borderTopWidth' );
        parentOffset.left += num( offsetParent, 'borderLeftWidth' );

        // Subtract the two offsets
        results = {
          top:  offset.top  - parentOffset.top,
          left: offset.left - parentOffset.left
        };
      }

      return results;
    },

    offsetParent: function() {
      var offsetParent = this[0].offsetParent || document.body;
      while ( offsetParent && (!(bodyHTMLOffsetRegEx).test(offsetParent.tagName) && CQ.css(offsetParent, 'position') === 'static') ) {
        offsetParent = offsetParent.offsetParent;
      }
      return CQ(offsetParent);
    }
  }) ;


  // Create scrollLeft and scrollTop methods
  CQ.each( ['Left', 'Top'], function(i, name) {
    var method = 'scroll' + name;

    CQ.fn[ method ] = function(val) {
      if (!this[0]) return;

      return val !== undefined ?

        // Set the scroll offset
        this.each(function() {
          this == window || this == document ?
            window.scrollTo(
              !i ? val : CQ(window).scrollLeft(),
               i ? val : CQ(window).scrollTop()
            ) :
            this[ method ] = val;
        }) :

        // Return the scroll offset
        this[0] == window || this[0] == document ?
          self[ i ? 'pageYOffset' : 'pageXOffset' ] ||
            CQ.boxModel && document.documentElement[ method ] ||
            document.body[ method ] : this[0][ method ];
    };
  });
  
  
  return CoreQuery ;
}()) ;

// Install CoreQuery or jQuery, depending on what is available, as SC.$().
SC.$ = (typeof jQuery == "undefined") ? SC.CoreQuery : jQuery ;

// Add some plugins to CoreQuery.  If jQuery is installed, it will get these
// also. -- test in system/core_query/additions
SC.mixin(SC.$.fn, /** @scope SC.CoreQuery.prototype */ {
  
  isCoreQuery: YES, // walk like a duck
  
  /** @private - better loggin */
  toString: function() {
    var values = [],
        len = this.length, idx=0;
    for(idx=0;idx<len;idx++) {
      values[idx] = '%@: %@'.fmt(idx, this[idx] ? this[idx].toString() : '(null)');
    }
    return "<$:%@>(%@)".fmt(SC.guidFor(this),values.join(' , '));  
  },
  
  /** 
    Returns YES if all member elements are visible.  This is provided as a
    common test since CoreQuery does not support filtering by 
    psuedo-selector.
  */
  isVisible: function() {
    return Array.prototype.every.call(this, function(elem){
      return SC.$.isVisible(elem);
    });
  },
    
  /** Returns a new CQ object with only the first item in the object. */
  first: function() {
    return this.pushStack([this[0]]);
  },
  
  /** Returns a new CQ object with only the last item in the set. */
  last: function() {
    return this.pushStack([this[this.length-1]]);
  },
  
  /** 
    Attempts to find the views managing the passed DOM elements and returns
    them.   This will start with the matched element and walk up the DOM until
    it finds an element managed by a view.
    
    @returns {Array} array of views or null.
  */
  view: function() {
    return this.map(function() { 
      var ret=null, guidKey = SC.viewKey, dom = this, value;
      while(!ret && dom && (dom !== document)) {
        if (dom.nodeType===1 && (value = dom.getAttribute('id'))) ret = SC.View.views[value] ;
        dom = dom.parentNode;
      }
      dom = null;
      return ret ;
    });
  },
  
  /**
    You can either pass a single class name and a boolean indicating whether
    the value should be added or removed, or you can pass a hash with all
    the class names you want to add or remove with a boolean indicating 
    whether they should be there or not.
    
    This is far more efficient than using addClass/removeClass.
    
    @param {String|Hash} className class name or hash of classNames + bools
    @param {Boolean} shouldAdd for class name if a string was passed
    @returns {SC.CoreQuery} receiver
  */
  setClass: function(className, shouldAdd) {
    if (SC.none(className)) return this; //nothing to do
    var isHash = SC.typeOf(className) !== SC.T_STRING,
        fix = this._fixupClass, key;
    this.each(function() {
      if (this.nodeType !== 1) return; // nothing to do
      
      // collect the class name from the element and build an array
      var classNames = this.className.split(/\s+/), didChange = NO;
      
      // loop through hash or just fix single className
      if (isHash) {
        for(var key in className) {
          if (!className.hasOwnProperty(key)) continue ;
          didChange = fix(classNames, key, className[key]) || didChange;
        } 
      } else didChange = fix(classNames, className, shouldAdd);

      // if classNames were changed, join them and set...
      if (didChange) this.className = classNames.join(' ');
    });
    return this ;
  },

  /** @private used by setClass */
  _fixupClass: function(classNames, name, shouldAdd) {
    var indexOf = classNames.indexOf(name);
    // if should add, add class...
    if (shouldAdd) {
      if (indexOf < 0) { classNames.push(name); return YES ; }
      
    // otherwise, null out class name (this will leave some extra spaces)
    } else if (indexOf >= 0) { classNames[indexOf]=null; return YES; }
    return NO ;
  },
  
  /**
    Returns YES if any of the matched elements have the passed element or CQ object as a child element.
  */
  within: function(el) {
    el = SC.$(el); // make into CQ object
    var ret, elCur, myCur, idx, len = el.length,
        loc = this.length;
    while(!ret && (--loc >= 0)) {
      myCur = this[loc];
      for(idx=0; !ret && (idx<len); idx++) {
        elCur = el[idx];
        while(elCur && (elCur !== myCur)) elCur = elCur.parentNode;
        ret = elCur === myCur ;
      }
    }
    myCur = elCur = null ; // clear memory
    return ret ;
  }
  
});

/** 
  Make CoreQuery enumerable.  Since some methods need to be disambiguated,
  we will implement some wrapper functions here. 
  
  Note that SC.Enumerable is implemented on SC.Builder, which means the
  CoreQuery object inherits this automatically.  jQuery does not extend from
  SC.Builder though, so we reapply SC.Enumerable just to be safe.
*/
(function() {
  var original = {},
      wrappers = {
    
    // if you call find with a selector, then use the jQuery way.  If you 
    // call with a function/target, use Enumerable way
    find: function(callback,target) {
      return (target !== undefined) ? SC.Enumerable.find.call(this, callback, target) : original.find.call(this, callback) ;
    },

    // ditto for filter - execute SC.Enumerable style if a target is passed.
    filter: function(callback,target) {
      return (target !== undefined) ? 
        this.pushStack(SC.Enumerable.filter.call(this, callback, target)) : 
        original.filter.call(this, callback) ;
    },
    
    // filterProperty is an SC.Enumerable thing, but it needs to be wrapped
    // in a CoreQuery object.
    filterProperty: function(key, value) {
      return this.pushStack(
        SC.Enumerable.filterProperty.call(this,key,value));
    },
    
    // indexOf() is best implemented using the jQuery index()
    indexOf: SC.$.index,
    
    // map() is a little tricky because jQuery is non-standard.  If you pass
    // a context object, we will treat it like SC.Enumerable.  Otherwise use
    // jQuery.
    map: function(callback, target) {
      return (target !== undefined) ?  
        SC.Enumerable.map.call(this, callback, target) : 
        original.map.call(this, callback);
    }
  };

  // loop through an update some enumerable methods.  If this is CoreQuery,
  // we just need to patch up the wrapped methods.  If this is jQuery, we
  // need to go through the entire set of SC.Enumerable.
  var isCoreQuery = SC.$.jquery === 'SC.CoreQuery',
      fn = SC.$.fn, enumerable = isCoreQuery ? wrappers : SC.Enumerable ,
      value;
  for(var key in enumerable) {
    if (!enumerable.hasOwnProperty(key)) continue ;
    value = enumerable[key];
    if (key in wrappers) {
      original[key] = fn[key]; value = wrappers[key];
    }
    fn[key] = value;
  }
})();

// Add some global helper methods.
SC.mixin(SC.$, {
  
  /** @private helper method to determine if an element is visible.  Exposed
   for use in testing. */
  isVisible: function(elem) {
    var CQ = SC.$;
    return ("hidden"!=elem.type) && (CQ.css(elem,"display")!="none") && (CQ.css(elem,"visibility")!="hidden");
  }
  
}) ;



/* >>>>>>>>>> BEGIN source/system/event.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/core_query') ;

/**
  The event class provides a simple cross-platform library for capturing and
  delivering events on DOM elements and other objects.  While this library
  is based on code from both jQuery and Prototype.js, it includes a number of
  additional features including support for handler objects and event 
  delegation.

  Since native events are implemented very unevenly across browsers,
  SproutCore will convert all native events into a standardized instance of
  this special event class.  
  
  SproutCore events implement the standard W3C event API as well as some 
  additional helper methods.

  @constructor
  @param {Event} originalEvent
  @returns {SC.Event} event instance
  
  @since SproutCore 1.0
*/
SC.Event = function(originalEvent) { 

  // copy properties from original event, if passed in.
  if (originalEvent) {
    this.originalEvent = originalEvent ;
    var props = SC.Event._props, len = props.length, idx = len , key;
    while(--idx >= 0) {
      key = props[idx] ;
      this[key] = originalEvent[key] ;
    }
  }

  // Fix timeStamp
  this.timeStamp = this.timeStamp || Date.now();

  // Fix target property, if necessary
  // Fixes #1925 where srcElement might not be defined either
  if (!this.target) this.target = this.srcElement || document; 

  // check if target is a textnode (safari)
  if (this.target.nodeType === 3 ) this.target = this.target.parentNode;

  // Add relatedTarget, if necessary
  if (!this.relatedTarget && this.fromElement) {
    this.relatedTarget = (this.fromElement === this.target) ? this.toElement : this.fromElement;
  }

  // Calculate pageX/Y if missing and clientX/Y available
  if (SC.none(this.pageX) && !SC.none(this.clientX)) {
    var doc = document.documentElement, body = document.body;
    this.pageX = this.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
    this.pageY = this.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
  }

  // Add which for key events
  if (!this.which && ((this.charCode || originalEvent.charCode === 0) ? this.charCode : this.keyCode)) {
    this.which = this.charCode || this.keyCode;
  }

  // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
  if (!this.metaKey && this.ctrlKey) this.metaKey = this.ctrlKey;

  // Add which for click: 1 == left; 2 == middle; 3 == right
  // Note: button is not normalized, so don't use it
  if (!this.which && this.button) {
    this.which = ((this.button & 1) ? 1 : ((this.button & 2) ? 3 : ( (this.button & 4) ? 2 : 0 ) ));
  }
  
  // Normalize wheel delta values for mousewheel events
  if (this.type === 'mousewheel' || this.type === 'DOMMouseScroll') {
    var deltaMultiplier = 1,
        version = parseFloat(SC.browser.version);

    // normalize wheelDelta, wheelDeltaX, & wheelDeltaY for Safari
    if (SC.browser.safari && originalEvent.wheelDelta!==undefined) {
      this.wheelDelta = 0-(originalEvent.wheelDeltaY || originalEvent.wheelDeltaX);
      this.wheelDeltaY = 0-(originalEvent.wheelDeltaY||0);
      this.wheelDeltaX = 0-(originalEvent.wheelDeltaX||0);

      // Scrolling in Safari 5.0.1, which is huge for some reason
      if (version === 533.17) {
        deltaMultiplier = 0.004;

      // Scrolling in Safari 5.0
      } else if (version < 533 || version >= 534) {
        deltaMultiplier = 40;
      }

    // normalize wheelDelta for Firefox
    // note that we multiple the delta on FF to make it's acceleration more 
    // natural.
    } else if (!SC.none(originalEvent.detail)) {
      deltaMultiplier = 10;
      if (originalEvent.axis && (originalEvent.axis === originalEvent.HORIZONTAL_AXIS)) {
        this.wheelDeltaX = originalEvent.detail;
        this.wheelDeltaY = this.wheelDelta = 0;
      } else {
        this.wheelDeltaY = this.wheelDelta = originalEvent.detail ;
        this.wheelDeltaX = 0 ;
      }

    // handle all other legacy browser
    } else {
      this.wheelDelta = this.wheelDeltaY = SC.browser.msie ? 0-originalEvent.wheelDelta : originalEvent.wheelDelta ;
      this.wheelDeltaX = 0 ;
    }

    this.wheelDelta *= deltaMultiplier;
    this.wheelDeltaX *= deltaMultiplier;
    this.wheelDeltaY *= deltaMultiplier;
  }

  return this; 
} ;

SC.mixin(SC.Event, /** @scope SC.Event */ {

  /** 
    Standard method to create a new event.  Pass the native browser event you
    wish to wrap if needed.
  */
  create: function(e) { return new SC.Event(e); },

  // the code below was borrowed from jQuery, Dean Edwards, and Prototype.js
  
  /**
    Bind an event to an element.

    This method will cause the passed handler to be executed whenever a
    relevant event occurs on the named element.  This method supports a
    variety of handler types, depending on the kind of support you need.
    
    h2. Simple Function Handlers
    
      SC.Event.add(anElement, "click", myClickHandler) ;
      
    The most basic type of handler you can pass is a function.  This function
    will be executed everytime an event of the type you specify occurs on the
    named element.  You can optionally pass an additional context object which
    will be included on the event in the event.data property.
    
    When your handler function is called the, the function's "this" property
    will point to the element the event occurred on.
    
    The click handler for this method must have a method signature like:
    
      function(event) { return YES|NO; }
      
    h2. Method Invocations
    
      SC.Event.add(anElement, "click", myObject, myObject.aMethod) ;
      
    Optionally you can specify a target object and a method on the object to 
    be invoked when the event occurs.  This will invoke the method function
    with the target object you pass as "this".  The method should have a 
    signature like:
    
      function(event, targetElement) { return YES|NO; }
      
    Like function handlers, you can pass an additional context data paramater
    that will be included on the event in the event.data property.
      
    h2. Handler Return Values
    
    Both handler functions should return YES if you want the event to 
    continue to propagate and NO if you want it to stop.  Returning NO will
    both stop bubbling of the event and will prevent any default action 
    taken by the browser.  You can also control these two behaviors separately
    by calling the stopPropagation() or preventDefault() methods on the event
    itself, returning YES from your method.
    
    h2. Limitations
    
    Although SproutCore's event implementation is based on jQuery, it is 
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.
    
    If you need more advanced event handling, consider the SC.ClassicResponder 
    functionality provided by SproutCore or use your favorite DOM library.

    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type you want to respond to
    @param {Object} target The target object for a method call or a function.
    @param {Object} method optional method or method name if target passed
    @param {Object} context optional context to pass to the handler as event.data
    @returns {Object} receiver
  */
  add: function(elem, eventType, target, method, context) {

    // if a CQ object is passed in, either call add on each item in the 
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) { 
          this.add(e, eventType, target, method, context);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do
    
    // cannot register events on text nodes, etc.
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SC.Event;

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.msie && elem.setInterval) elem = window;

    // if target is a function, treat it as the method, with optional context
    if (SC.typeOf(target) === SC.T_FUNCTION) {
      context = method; method = target; target = null;
      
    // handle case where passed method is a key on the target.
    } else if (target && SC.typeOf(method) === SC.T_STRING) {
      method = target[method] ;
    }

    // Get the handlers queue for this element/eventType.  If the queue does
    // not exist yet, create it and also setup the shared listener for this
    // eventType.
    var events = SC.data(elem, "events") || SC.data(elem, "events", {}) ,
        handlers = events[eventType]; 
    if (!handlers) {
      handlers = events[eventType] = {} ;
      this._addEventListener(elem, eventType) ;
    }
    
    // Build the handler array and add to queue
    handlers[SC.hashFor(target, method)] = [target, method, context];
    SC.Event._global[eventType] = YES ; // optimization for global triggers

    // Nullify elem to prevent memory leaks in IE
    elem = events = handlers = null ;
    return this ;
  },

  /**
    Removes a specific handler or all handlers for an event or event+type.

    To remove a specific handler, you must pass in the same function or the
    same target and method as you passed into SC.Event.add().  See that method
    for full documentation on the parameters you can pass in.
    
    If you omit a specific handler but provide both an element and eventType,
    then all handlers for that element will be removed.  If you provide only
    and element, then all handlers for all events on that element will be
    removed.
    
    h2. Limitations
    
    Although SproutCore's event implementation is based on jQuery, it is 
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.
    
    If you need more advanced event handling, consider the SC.ClassicResponder 
    functionality provided by SproutCore or use your favorite DOM library.
    
    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type to remove
    @param {Object} target The target object for a method call.  Or a function.
    @param {Object} method optional name of method
    @returns {Object} receiver
  */
  remove: function(elem, eventType, target, method) {

    // if a CQ object is passed in, either call add on each item in the 
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) { 
          this.remove(e, eventType, target, method);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do
    
    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SC.Event;

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.msie && elem.setInterval) elem = window;

    var handlers, key, events = SC.data(elem, "events") ;
    if (!events) return this ; // nothing to do if no events are registered

    // if no type is provided, remove all types for this element.
    if (eventType === undefined) {
      for(eventType in events) this.remove(elem, eventType) ;

    // otherwise, remove the handler for this specific eventType if found
    } else if (handlers = events[eventType]) {

      var cleanupHandlers = NO ;
      
      // if a target/method is provided, remove only that one
      if (target || method) {
        
        // normalize the target/method
        if (SC.typeOf(target) === SC.T_FUNCTION) {
          method = target; target = null ;
        } else if (SC.typeOf(method) === SC.T_STRING) {
          method = target[method] ;
        }
        
        delete handlers[SC.hashFor(target, method)];
        
        // check to see if there are handlers left on this event/eventType.
        // if not, then cleanup the handlers.
        key = null ;
        for(key in handlers) break ;
        if (key===null) cleanupHandlers = YES ;

      // otherwise, just cleanup all handlers
      } else cleanupHandlers = YES ;
      
      // If there are no more handlers left on this event type, remove 
      // eventType hash from queue.
      if (cleanupHandlers) {
        delete events[eventType] ;
        this._removeEventListener(elem, eventType) ;
      }
      
      // verify that there are still events registered on this element.  If 
      // there aren't, cleanup the element completely to avoid memory leaks.
      key = null ;
      for(key in events) break;
      if(!key) {
        SC.removeData(elem, "events") ;
        delete this._elements[SC.guidFor(elem)]; // important to avoid leaks
      }
      
    }
    
    elem = events = handlers = null ; // avoid memory leaks
    return this ;
  },

  NO_BUBBLE: ['blur', 'focus', 'change'],
  
  /**
    Generates a simulated event object.  This is mostly useful for unit 
    testing.  You can pass the return value of this property into the 
    trigger() method to actually send the event.
    
    @param {Element} elem the element the event targets
    @param {String} eventType event type.  mousedown, mouseup, etc
    @param {Hash} attrs optional additonal attributes to apply to event.
    @returns {Hash} simulated event object
  */
  simulateEvent: function(elem, eventType, attrs) {
    var ret = SC.Event.create({
      type: eventType,
      target: elem,
      preventDefault: function(){ this.cancelled = YES; },
      stopPropagation: function(){ this.bubbles = NO; },
      allowDefault: function() { this.hasCustomEventHandling = YES; },
      timeStamp: Date.now(),
      bubbles: (this.NO_BUBBLE.indexOf(eventType)<0),
      cancelled: NO,
      normalized: YES
    });
    if (attrs) SC.mixin(ret, attrs) ;
    return ret ;
  },
  
  /**
    Trigger an event execution immediately.  You can use this method to 
    simulate arbitrary events on arbitary elements.

    h2. Limitations
    
    Note that although this is based on the jQuery implementation, it is 
    much simpler.  Notably namespaced events are not supported and you cannot
    trigger events globally.
    
    If you need more advanced event handling, consider the SC.Responder 
    functionality provided by SproutCore or use your favorite DOM library.

    h2. Example
    
    {{{
      SC.Event.trigger(view.get('layer'), 'mousedown');
    }}}
    
    @param elem {Element} the target element
    @param eventType {String} the event type
    @param args {Array} optional argument or arguments to pass to handler.
    @param donative ??
    @returns {Boolean} Return value of trigger or undefined if not fired
  */
  trigger: function(elem, eventType, args, donative) {

    // if a CQ object is passed in, either call add on each item in the 
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) { 
          this.trigger(e, eventType, args, donative);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return undefined;
    
    // Normalize to an array
    args = SC.A(args) ;

    var ret, fn = SC.typeOf(elem[eventType] || null) === SC.T_FUNCTION , 
        event, current, onfoo, isClick;

    // Get the event to pass, creating a fake one if necessary
    event = args[0];
    if (!event || !event.preventDefault) {
      event = this.simulateEvent(elem, eventType) ;
      args.unshift(event) ;
    }
    
    event.type = eventType ;
    
    // Trigger the event - bubble if enabled
    current = elem;
    do {
      ret = SC.Event.handle.apply(current, args);
      current = (current===document) ? null : (current.parentNode || document);
    } while(!ret && event.bubbles && current);    
    current = null ;

    // Handle triggering native .onfoo handlers
    onfoo = elem["on" + eventType] ;
    isClick = SC.CoreQuery.nodeName(elem, 'a') && eventType === 'click';
    if ((!fn || isClick) && onfoo && onfoo.apply(elem, args) === NO) ret = NO;

    // Trigger the native events (except for clicks on links)
    if (fn && donative !== NO && ret !== NO && !isClick) {
      this.triggered = YES;
      try {
        elem[ eventType ]();
      // prevent IE from throwing an error for some hidden elements
      } catch (e) {}
    }
    
    this.triggered = NO;

    return ret;
  },

  /**
    This method will handle the passed event, finding any registered listeners
    and executing them.  If you have an event you want handled, you can 
    manually invoke this method.  This function expects it's "this" value to
    be the element the event occurred on, so you should always call this 
    method like:
    
      SC.Event.handle.call(element, event) ;
      
    Note that like other parts of this library, the handle function does not
    support namespaces.
    
    @param event {Event} the event to handle
    @returns {Boolean}
  */
  handle: function(event) {

    // ignore events triggered after window is unloaded or if double-called
    // from within a trigger.
    if ((typeof SC === "undefined") || SC.Event.triggered) return YES ;
    
    // returned undefined or NO
    var val, ret, namespace, all, handlers, args, key, handler, method, target;

    // normalize event across browsers.  The new event will actually wrap the
    // real event with a normalized API.
    args = SC.A(arguments);
    args[0] = event = SC.Event.normalizeEvent(event || window.event);

    // get the handlers for this event type
    handlers = (SC.data(this, "events") || {})[event.type];
    if (!handlers) return NO ; // nothing to do
    
    // invoke all handlers
    for (key in handlers ) {
      handler = handlers[key];
      method = handler[1] ;

      // Pass in a reference to the handler function itself
      // So that we can later remove it
      event.handler = method;
      event.data = event.context = handler[2];

      target = handler[0] || this ;
      ret = method.apply( target, args );
      
      if (val !== NO) val = ret;

      // if method returned NO, do not continue.  Stop propogation and
      // return default.  Note that we test explicitly for NO since 
      // if the handler returns no specific value, we do not want to stop.
      if ( ret === NO ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    return val;
  },

  /**
    This method is called just before the window unloads to unhook all 
    registered events.
  */
  unload: function() {
    var key, elements = this._elements ;
    for(key in elements) this.remove(elements[key]) ;
    
    // just in case some book-keeping was screwed up.  avoid memory leaks
    for(key in elements) delete elements[key] ;
    delete this._elements ; 
  },
  
  /**
    This hash contains handlers for special or custom events.  You can add
    your own handlers for custom events here by simply naming the event and
    including a hash with the following properties:
    
     - setup: this function should setup the handler or return NO
     - teardown: this function should remove the event listener
     
  */
  special: {
    
    ready: {
      setup: function() {
        // Make sure the ready event is setup
        SC._bindReady() ;
        return;
      },

      teardown: function() { return; }

    },

    /** @private
        Implement support for mouseenter on browsers other than IE */
    mouseenter: {
      setup: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.add(this, 'mouseover', SC.Event.special.mouseenter.handler);
        return YES;
      },

      teardown: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.remove(this, 'mouseover', SC.Event.special.mouseenter.handler);
        return YES;
      },

      handler: function(event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.Event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseenter
        event.type = "mouseenter";
        return SC.Event.handle.apply(this, arguments);
      }
    },

    /** @private
        Implement support for mouseleave on browsers other than IE */
    mouseleave: {
      setup: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.add(this, "mouseout", SC.Event.special.mouseleave.handler);
        return YES;
      },

      teardown: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.remove(this, "mouseout", SC.Event.special.mouseleave.handler);
        return YES;
      },

      handler: function(event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.Event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseleave
        event.type = "mouseleave";
        return SC.Event.handle.apply(this, arguments);
      }
    }
  },

  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,
    
  _withinElement: function(event, elem) {
    // Check if mouse(over|out) are still within the same parent element
    var parent = event.relatedTarget;
    
    // Traverse up the tree
    while ( parent && parent != elem ) {
      try { parent = parent.parentNode; } catch(error) { parent = elem; }
    }

    // Return YES if we actually just moused on to a sub-element
    return parent === elem;
  },
  
  /** @private
    Adds the primary event listener for the named type on the element.
    
    If the event type has a special handler defined in SC.Event.special, 
    then that handler will be used.  Otherwise the normal browser method will
    be used.
    
    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _addEventListener: function(elem, eventType) {
    var listener, special = this.special[eventType] ;

    // Check for a special event handler
    // Only use addEventListener/attachEvent if the special
    // events handler returns NO
    if ( !special || special.setup.call(elem)===NO) {
      
      // Save element in cache.  This must be removed later to avoid 
      // memory leaks.
      var guid = SC.guidFor(elem) ;
      this._elements[guid] = elem;
      
      listener = SC.data(elem, "listener") || SC.data(elem, "listener", 
       function() {
         return SC.Event.handle.apply(SC.Event._elements[guid], arguments); 
      }) ;
      
      // Bind the global event handler to the element
      if (elem.addEventListener) {
        elem.addEventListener(eventType, listener, NO);
      } else if (elem.attachEvent) {
        // attachEvent is not working for IE8 and xhr objects
        // there is currently a hack in request , but it needs to fixed here.
        elem.attachEvent("on" + eventType, listener);
      }
      //  
      // else {
      //         elem.onreadystatechange = listener;
      //       }
    }
    
    elem = special = listener = null ; // avoid memory leak
  },

  /** @private
    Removes the primary event listener for the named type on the element.
    
    If the event type has a special handler defined in SC.Event.special, 
    then that handler will be used.  Otherwise the normal browser method will
    be used.
    
    Note that this will not clear the _elements hash from the element.  You
    must call SC.Event.unload() on unload to make sure that is cleared.
    
    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _removeEventListener: function(elem, eventType) {
    var listener, special = SC.Event.special[eventType] ;
    if (!special || (special.teardown.call(elem)===NO)) {
      listener = SC.data(elem, "listener") ;
      if (listener) {
        if (elem.removeEventListener) {
          elem.removeEventListener(eventType, listener, NO);
        } else if (elem.detachEvent) {
          elem.detachEvent("on" + eventType, listener);
        }
      }
    }
    
    elem = special = listener = null ;
  },

  _elements: {},
  
  // implement preventDefault() in a cross platform way
  
  /** @private Take an incoming event and convert it to a normalized event. */
  normalizeEvent: function(event) {
    if (event === window.event) {
      // IE can't do event.normalized on an Event object
      return SC.Event.create(event) ; 
    } else {
      return event.normalized ? event : SC.Event.create(event) ;
    }
  },
  
  _global: {},

  /** @private properties to copy from native event onto the event */
  _props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target timeStamp toElement type view which touches targetTouches changedTouches animationName elapsedTime".split(" ")
  
}) ;

SC.Event.prototype = {

  /**
    Set to YES if you have called either preventDefault() or stopPropagation().  This allows a generic event handler to notice if you want to provide detailed control over how the browser handles the real event.
  */
  hasCustomEventHandling: NO,
  
  /**
    Returns the touches owned by the supplied view.
  */
  touchesForView: function(view) {
    if (this.touchContext) return this.touchContext.touchesForView(view);
  },
  
  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the supplied view.
  */
  averagedTouchesForView: function(view) {
    if (this.touchContext) return this.touchContext.averagedTouchesForView(view);
    return null;
  },
  
  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.
    
    @returns {SC.Event} receiver
  */
  allowDefault: function() {
    this.hasCustomEventHandling = YES ;
    return this ;  
  },
  
  /** 
    Implements W3C standard.  Will prevent the browser from performing its
    default action on this event.
    
    @returns {SC.Event} receiver
  */
  preventDefault: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.preventDefault) evt.preventDefault() ;
      evt.returnValue = NO ; // IE
    }
    this.hasCustomEventHandling = YES ;
    return this ;
  },

  /**
    Implements W3C standard.  Prevents further bubbling of the event.
    
    @returns {SC.Event} receiver
  */
  stopPropagation: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.stopPropagation) evt.stopPropagation() ;
      evt.cancelBubble = YES ; // IE
    }
    this.hasCustomEventHandling = YES ; 
    return this ;
  },

  /** 
    Stops both the default action and further propogation.  This is more 
    convenient than calling both.
    
    @returns {SC.Event} receiver
  */
  stop: function() {
    return this.preventDefault().stopPropagation();
  },
  
  /** Always YES to indicate the event was normalized. */
  normalized: YES,

  /** Returns the pressed character (found in this.which) as a string. */
  getCharString: function() {
      if(SC.browser.msie){
        if(this.keyCode == 8 || this.keyCode == 9 || (this.keyCode>=37 && this.keyCode<=40)){
          return String.fromCharCode(0);
        }else{
          return (this.keyCode>0) ? String.fromCharCode(this.keyCode) : null;  
        }
      }else{
        return (this.charCode>0) ? String.fromCharCode(this.charCode) : null;
      }
  },
  
  /** Returns character codes for the event.  The first value is the normalized code string, with any shift or ctrl characters added to the begining.  The second value is the char string by itself.
  
    @returns {Array}
  */
  commandCodes: function() {
    var code=this.keyCode, ret=null, key=null, modifiers='', lowercase ;
    
    // handle function keys.
    if (code) {
      ret = SC.FUNCTION_KEYS[code] ;
      if (!ret && (this.altKey || this.ctrlKey || this.metaKey)) {
        ret = SC.PRINTABLE_KEYS[code];
      }
      
      if (ret) {
        if (this.altKey) modifiers += 'alt_' ;
        if (this.ctrlKey || this.metaKey) modifiers += 'ctrl_' ;
        if (this.shiftKey) modifiers += 'shift_' ;
      }
    }

    // otherwise just go get the right key.
    if (!ret) {
      code = this.which ;
      key = ret = String.fromCharCode(code) ;
      lowercase = ret.toLowerCase() ;
      if (this.metaKey) {
        modifiers = 'meta_' ;
        ret = lowercase;
        
      } else ret = null ;
    }

    if (ret) ret = modifiers + ret ;
    return [ret, key] ;
  }
    
} ;

// Also provide a Prototype-like API so that people can use either one.

/** Alias for add() method.  This provides a Prototype-like API. */
SC.Event.observe = SC.Event.add ;

/** Alias for remove() method.  This provides a Prototype-like API */
SC.Event.stopObserving = SC.Event.remove ;

/** Alias for trigger() method.  This provides a Prototype-like API */
SC.Event.fire = SC.Event.trigger;

// Register unload handler to eliminate any registered handlers
// This avoids leaks in IE and issues with mouseout or other handlers on 
// other browsers.

if(SC.browser.msie) SC.Event.add(window, 'unload', SC.Event.prototype, SC.Event.unload) ;

SC.MODIFIER_KEYS = {
  16:'shift', 17:'ctrl', 18: 'alt'
};

SC.FUNCTION_KEYS = {
  8: 'backspace',  9: 'tab',  13: 'return',  19: 'pause',  27: 'escape',  
  33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 
  37: 'left', 38: 'up', 39: 'right', 40: 'down', 44: 'printscreen', 
  45: 'insert', 46: 'delete', 112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 
  116: 'f5', 117: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 
  123: 'f12', 144: 'numlock', 145: 'scrolllock'
} ;

SC.PRINTABLE_KEYS = {
  32: ' ', 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7",
  56:"8", 57:"9", 59:";", 61:"=", 65:"a", 66:"b", 67:"c", 68:"d", 69:"e",
  70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n",
  79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w",
  88:"x", 89:"y", 90:"z", 107:"+", 109:"-", 110:".", 188:",", 190:".",
  191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"\""
} ;

/* >>>>>>>>>> BEGIN source/system/cursor.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// standard browser cursor definitions
SC.SYSTEM_CURSOR = 'default' ;
SC.AUTO_CURSOR = SC.DEFAULT_CURSOR = 'auto' ;
SC.CROSSHAIR_CURSOR = 'crosshair' ;
SC.HAND_CURSOR = SC.POINTER_CURSOR = 'pointer' ;
SC.MOVE_CURSOR = 'move' ;
SC.E_RESIZE_CURSOR = 'e-resize' ;
SC.NE_RESIZE_CURSOR = 'ne-resize' ;
SC.NW_RESIZE_CURSOR = 'nw-resize' ;
SC.N_RESIZE_CURSOR = 'n-resize' ;
SC.SE_RESIZE_CURSOR = 'se-resize' ;
SC.SW_RESIZE_CURSOR = 'sw-resize' ;
SC.S_RESIZE_CURSOR = 's-resize' ;
SC.W_RESIZE_CURSOR = 'w-resize' ;
SC.IBEAM_CURSOR = SC.TEXT_CURSOR = 'text' ;
SC.WAIT_CURSOR = 'wait' ;
SC.HELP_CURSOR = 'help' ;

/**
  @class SC.Cursor

  A Cursor object is used to sychronize the cursor used by multiple views at 
  the same time. For example, thumb views within a split view acquire a cursor
  instance from the split view and set it as their cursor. The split view is 
  able to update its cursor object to reflect the state of the split view.
  Because cursor objects are implemented internally with CSS, this is a very 
  efficient way to update the same cursor for a group of view objects.
  
  Note: This object creates an anonymous CSS class to represent the cursor. 
  The anonymous CSS class is automatically added by SproutCore to views that
  have the cursor object set as "their" cursor. Thus, all objects attached to 
  the same cursor object will have their cursors updated simultaneously with a
  single DOM call.
  
  @extends SC.Object
*/
SC.Cursor = SC.Object.extend(
/** @scope SC.Cursor.prototype */ {
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    
    // create a unique style rule and add it to the shared cursor style sheet
    var cursorStyle = this.get('cursorStyle') || SC.DEFAULT_CURSOR ,
        ss = this.constructor.sharedStyleSheet(),
        guid = SC.guidFor(this);
    
    if (ss.insertRule) { // WC3
      ss.insertRule(
        '.'+guid+' {cursor: '+cursorStyle+';}',
        ss.cssRules ? ss.cssRules.length : 0
      ) ;
    } else if (ss.addRule) { // IE
      ss.addRule('.'+guid, 'cursor: '+cursorStyle) ;
    }
    
    this.cursorStyle = cursorStyle ;
    this.className = guid ; // used by cursor clients...
    return this ;
  },
  
  /**
    This property is the connection between cursors and views. The default
    SC.View behavior is to add this className to a view's layer if it has
    its cursor property defined.
    
    @readOnly
    @property {String} the css class name updated by this cursor
  */
  className: null,
  
  /**
    @property {String} the cursor value, can be 'url("path/to/cursor")'
  */
  cursorStyle: SC.DEFAULT_CURSOR,
  
  /** @private */
  cursorStyleDidChange: function() {
    var cursorStyle, rule, selector, ss, rules, idx, len;
    cursorStyle = this.get('cursorStyle') || SC.DEFAULT_CURSOR;
    rule = this._rule;
    if (rule) {
      rule.style.cursor = cursorStyle ; // fast path
      return ;
    }
    
    // slow path, taken only once
    selector = '.'+this.get('className') ;
    ss = this.constructor.sharedStyleSheet() ;
    rules = (ss.cssRules ? ss.cssRules : ss.rules) || [] ;
    
    // find our rule, cache it, and update the cursor style property
    for (idx=0, len = rules.length; idx<len; ++idx) {
      rule = rules[idx] ;
      if (rule.selectorText === selector) {
        this._rule = rule ; // cache for next time
        rule.style.cursor = cursorStyle ; // update the cursor
        break ;
      }
    }
  }.observes('cursorStyle')
  
  // TODO implement destroy
  
});

/** @private */
SC.Cursor.sharedStyleSheet = function() {
  var head, ss = this._styleSheet ;
  if (!ss) {
    // create the stylesheet object the hard way (works everywhere)
    ss = document.createElement('style') ;
    ss.type = 'text/css' ;
    head = document.getElementsByTagName('head')[0] ;
    if (!head) head = document.documentElement ; // fix for Opera
    head.appendChild(ss) ;
    
    // get the actual stylesheet object, not the DOM element
    ss = document.styleSheets[document.styleSheets.length-1] ;
    this._styleSheet = ss ;
  }
  return ss ;
};

/* >>>>>>>>>> BEGIN source/system/responder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Provides common methods for sending events down a responder chain.
  Responder chains are used most often to deliver events to user interface
  elements in your application, but you can also use them to deliver generic
  events to any part of your application, including controllers.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Responder = SC.Object.extend( /** SC.Responder.prototype */ {

  isResponder: YES,
  
  /** @property
    The pane this responder belongs to.  This is used to determine where you 
    belong to in the responder chain.  Normally you should leave this property
    set to null.
  */
  pane: null,
  
  /** @property
    The app this responder belongs to.  For non-user-interface responder 
    chains, this is used to determine the context.  Usually this
    is the property you will want to work with.
  */
  responderContext: null,
  
  /** @property
    This is the nextResponder in the responder chain.  If the receiver does 
    not implement a particular event handler, it will bubble to the next 
    responder.
    
    This can point to an object directly or it can be a string, in which case
    the path will be resolved from the responderContext root.
  */
  nextResponder: null,
  
  /** @property 
    YES if the view is currently first responder.  This property is always 
    edited by the pane during its makeFirstResponder() method.
  */
  isFirstResponder: NO,
  
  /** @property
  
    YES the responder is somewhere in the responder chain.  This currently
    only works when used with a ResponderContext.
    
    @type {Boolean}
  */
  hasFirstResponder: NO,    
  
  /** @property
    Set to YES if your view is willing to accept first responder status.  This is used when calculcating key responder loop.
  */
  acceptsFirstResponder: YES,
  
  becomingFirstResponder: NO,
  
  /** 
    Call this method on your view or responder to make it become first 
    responder.
    
    @returns {SC.Responder} receiver
  */
  becomeFirstResponder: function() {  
    var pane = this.get('pane') || this.get('responderContext') ||
              this.pane();
    if (pane && this.get('acceptsFirstResponder')) {
      if (pane.get('firstResponder') !== this) pane.makeFirstResponder(this);
    } 
    return this ;
  },
  
  /**
    Call this method on your view or responder to resign your first responder 
    status. Normally this is not necessary since you will lose first responder 
    status automatically when another view becomes first responder.
    
    @param {Event} the original event that caused this method to be called
    @returns {SC.Responder} receiver
  */
  resignFirstResponder: function(evt) {
    var pane = this.get('pane') || this.get('responderContext');
    if (pane && (pane.get('firstResponder') === this)) {
      pane.makeFirstResponder(null, evt);
    }
    return YES;  
  },

  /**
    Called just before the responder or any of its subresponder's are about to
    lose their first responder status.  The passed responder is the responder
    that is about to lose its status. 
    
    Override this method to provide any standard teardown when the first 
    responder changes.
    
    @param {SC.Responder} responder the responder that is about to change
    @returns {void}
  */
  willLoseFirstResponder: function(responder) {},
  
  /**
    Called just after the responder or any of its subresponder's becomes a 
    first responder.  
    
    Override this method to provide any standard setup when the first 
    responder changes.
    
    @param {SC.Responder} responder the responder that changed
    @returns {void}
  */
  didBecomeFirstResponder: function(responder) {}

});

/* >>>>>>>>>> BEGIN source/mixins/string.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');

// These are basic enhancements to the string class used throughout 
// SproutCore.
/** @private */
SC.STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);
SC.STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
SC.STRING_DASHERIZE_REGEXP = (/[ _]/g);
SC.STRING_HUMANIZE_REGEXP = (/[\-_]/g);
SC.STRING_TRIM_REGEXP = (/^\s+|\s+$/g);
SC.STRING_TRIM_LEFT_REGEXP = (/^\s+/g);
SC.STRING_TRIM_RIGHT_REGEXP = (/\s+$/g);
SC.STRING_REGEXP_ESCAPED_REGEXP = (/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g);

// Since there are many strings that are commonly dasherized(), we'll maintain
// a cache.  Moreover, we'll pre-add some common ones.
SC.STRING_DASHERIZE_CACHE = {
  top:      'top',
  left:     'left',
  right:    'right',
  bottom:   'bottom',
  width:    'width',
  height:   'height',
  minWidth: 'min-width',
  maxWidth: 'max-width'
};

// Active Support style inflection constants
SC.INFLECTION_CONSTANTS = {
  PLURAL: [
      [/(quiz)$/i,               "$1zes"  ],
      [/^(ox)$/i,                "$1en"   ],
      [/([m|l])ouse$/i,          "$1ice"  ],
      [/(matr|vert|ind)ix|ex$/i, "$1ices" ],
      [/(x|ch|ss|sh)$/i,         "$1es"   ],
      [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
      [/(hive)$/i,               "$1s"    ],
      [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
      [/sis$/i,                  "ses"    ],
      [/([ti])um$/i,             "$1a"    ],
      [/(buffal|tomat)o$/i,      "$1oes"  ],
      [/(bu)s$/i,                "$1ses"  ],
      [/(alias|status)$/i,       "$1es"   ],
      [/(octop|vir)us$/i,        "$1i"    ],
      [/(ax|test)is$/i,          "$1es"   ],
      [/s$/i,                    "s"      ],
      [/$/,                      "s"      ]
  ],

  SINGULAR: [
      [/(quiz)zes$/i,                                                    "$1"     ],
      [/(matr)ices$/i,                                                   "$1ix"   ],
      [/(vert|ind)ices$/i,                                               "$1ex"   ],
      [/^(ox)en/i,                                                       "$1"     ],
      [/(alias|status)es$/i,                                             "$1"     ],
      [/(octop|vir)i$/i,                                                 "$1us"   ],
      [/(cris|ax|test)es$/i,                                             "$1is"   ],
      [/(shoe)s$/i,                                                      "$1"     ],
      [/(o)es$/i,                                                        "$1"     ],
      [/(bus)es$/i,                                                      "$1"     ],
      [/([m|l])ice$/i,                                                   "$1ouse" ],
      [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
      [/(m)ovies$/i,                                                     "$1ovie" ],
      [/(s)eries$/i,                                                     "$1eries"],
      [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
      [/([lr])ves$/i,                                                    "$1f"    ],
      [/(tive)s$/i,                                                      "$1"     ],
      [/(hive)s$/i,                                                      "$1"     ],
      [/([^f])ves$/i,                                                    "$1fe"   ],
      [/(^analy)ses$/i,                                                  "$1sis"  ],
      [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
      [/([ti])a$/i,                                                      "$1um"   ],
      [/(n)ews$/i,                                                       "$1ews"  ],
      [/s$/i,                                                            ""       ]
  ],

  IRREGULAR: [
      ['move',   'moves'   ],
      ['sex',    'sexes'   ],
      ['child',  'children'],
      ['man',    'men'     ],
      ['person', 'people'  ]
  ],

  UNCOUNTABLE: [
      "sheep",
      "fish",
      "series",
      "species",
      "money",
      "rice",
      "information",
			"info",
      "equipment"
  ]					
};


/**
  @namespace
  
  SproutCore implements a variety of enhancements to the built-in String 
  object that make it easy to perform common substitutions and conversions.
  
  Most of the utility methods defined here mirror those found in Prototype
  1.6.
  
  @since SproutCore 1.0
*/
SC.String = {

  /**
    Localizes the string.  This will look up the reciever string as a key 
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.
    
    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
  loc: function() {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    if(!SC.Locale.currentLocale) SC.Locale.createCurrentLocale();
    var str = SC.Locale.currentLocale.locWithDefault(this);
    if (SC.typeOf(str) !== SC.T_STRING) str = this;
    return str.fmt.apply(str,arguments) ;
  },

  /**
    Works just like loc() except that it will return the passed default 
    string if a matching key is not found.
    
    @param {String} def the default to return
    @param {Object...} args optional formatting arguments
    @returns {String} localized and formatted string
  */
  locWithDefault: function(def) {
    if(!SC.Locale.currentLocale) SC.Locale.createCurrentLocale();
    var str = SC.Locale.currentLocale.locWithDefault(this, def);
    if (SC.typeOf(str) !== SC.T_STRING) str = this;
    var args = SC.$A(arguments); args.shift(); // remove def param
    return str.fmt.apply(str,args) ;
  },
  
  /** 
    Capitalizes a string.

    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | My favorite items |
    | css-class-name | Css-class-name |
    | action_name | Action_name |
    | innerHTML | InnerHTML |

    @return {String} capitalized string
  */
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.slice(1) ;
  },
  
  /**
    Capitalizes every word in a string.  Unlike titleize, spaces or dashes 
    will remain in-tact.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | My Favorite Items |
    | css-class-name | Css-Class-Name |
    | action_name | Action_Name |
    | innerHTML | InnerHTML |

    @returns {String} capitalized string
  */
  capitalizeEach: function() {
    return this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,sep,character) { 
        return (character) ? (sep + character.toUpperCase()) : sep;
      }).capitalize() ;
  },

  /**
    Converts a string to a title.  This will decamelize the string, convert
    separators to spaces and capitalize every word.

    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | My Favorite Items |
    | css-class-name | Css Class Name |
    | action_name | Action Name |
    | innerHTML | Inner HTML |

    @return {String} titleized string.
  */
  titleize: function() {
    var ret = this.replace(SC.STRING_DECAMELIZE_REGEXP,'$1_$2'); // decamelize
    return ret.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? (' ' + character.toUpperCase()) : ' ';
      }).capitalize() ;
  },
  
  /**
    Camelizes a string.  This will take any words separated by spaces, dashes
    or underscores and convert them into camelCase.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | myFavoriteItems |
    | css-class-name | cssClassName |
    | action_name | actionName |
    | innerHTML | innerHTML |

    @returns {String} camelized string
  */
  camelize: function() {
    var ret = this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? character.toUpperCase() : '' ;
      }) ;
    var first = ret.charAt(0), lower = first.toLowerCase() ;
    return (first !== lower) ? (lower + ret.slice(1)) : ret ;
  },
  
  /**
    Converts the string into a class name.  This method will camelize your 
    string and then capitalize the first letter.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | MyFavoriteItems |
    | css-class-name | CssClassName |
    | action_name | ActionName |
    | innerHTML | InnerHtml |

    @returns {String}
  */
  classify: function() {
    var ret = this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? character.toUpperCase() : '' ;
      }) ;
    var first = ret.charAt(0), upper = first.toUpperCase() ;
    return (first !== upper) ? (upper + ret.slice(1)) : ret ;
  },
  
  /**
    Converts a camelized string into all lower case separated by underscores.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | my favorite items |
    | css-class-name | css-class-name |
    | action_name | action_name |
    | innerHTML | inner_html |

    @returns {String} the decamelized string.
  */
  decamelize: function() { 
    return this.replace(SC.STRING_DECAMELIZE_REGEXP,'$1_$2').toLowerCase();
  },

  /**
    Converts a camelized string or a string with spaces or underscores into
    a string with components separated by dashes.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | my-favorite-items |
    | css-class-name | css-class-name |
    | action_name | action-name |
    | innerHTML | inner-html |

    @returns {String} the dasherized string.
  */
  dasherize: function() {
    // Do we have the item in our cache?
    var cache = SC.STRING_DASHERIZE_CACHE,
        ret   = cache[this];

    if (ret) {
      return ret;
    }
    else {
      ret = this.decamelize().replace(SC.STRING_DASHERIZE_REGEXP,'-') ;

      // Add the item to our cache.
      cache[this] = ret;
    }

    return ret;
  },
  
  /**
    Converts a camelized string or a string with dashes or underscores into
    a string with components separated by spaces.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | my favorite items |
    | css-class-name | css class name |
    | action_name | action name |
    | innerHTML | inner html |

    @returns {String} the humanized string.
  */
  humanize: function() {
    return this.decamelize().replace(SC.STRING_HUMANIZE_REGEXP,' ') ;
  },
  
  /**
    Will escape a string so it can be securely used in a regular expression.
    
    Useful when you need to use user input in a regular expression without
    having to worry about it breaking code if any reserved regular expression 
    characters are used.
    
    @returns {String} the string properly escaped for use in a regexp.
  */
  escapeForRegExp: function() {
    return this.replace(SC.STRING_REGEXP_ESCAPED_REGEXP, "\\$1");
  },
  
  /**
    Removes any standard diacritic characters from the string. So, for
    example, all instances of 'Á' will become 'A'.

    @returns {String} the modified string
  */
  removeDiacritics: function() {
    // Lazily create the SC.diacriticMappingTable object.
    var diacriticMappingTable = SC.diacriticMappingTable;
    if (!diacriticMappingTable) {
      SC.diacriticMappingTable = {
       'À':'A', 'Á':'A', 'Â':'A', 'Ã':'A', 'Ä':'A', 'Å':'A', 'Ā':'A', 'Ă':'A',
       'Ą':'A', 'Ǎ':'A', 'Ǟ':'A', 'Ǡ':'A', 'Ǻ':'A', 'Ȁ':'A', 'Ȃ':'A', 'Ȧ':'A',
       'Ḁ':'A', 'Ạ':'A', 'Ả':'A', 'Ấ':'A', 'Ầ':'A', 'Ẩ':'A', 'Ẫ':'A', 'Ậ':'A',
       'Ắ':'A', 'Ằ':'A', 'Ẳ':'A', 'Ẵ':'A', 'Ặ':'A', 'Å':'A', 'Ḃ':'B', 'Ḅ':'B',
       'Ḇ':'B', 'Ç':'C', 'Ć':'C', 'Ĉ':'C', 'Ċ':'C', 'Č':'C', 'Ḉ':'C', 'Ď':'D',
       'Ḋ':'D', 'Ḍ':'D', 'Ḏ':'D', 'Ḑ':'D', 'Ḓ':'D', 'È':'E', 'É':'E', 'Ê':'E',
       'Ë':'E', 'Ē':'E', 'Ĕ':'E', 'Ė':'E', 'Ę':'E', 'Ě':'E', 'Ȅ':'E', 'Ȇ':'E',
       'Ȩ':'E', 'Ḕ':'E', 'Ḗ':'E', 'Ḙ':'E', 'Ḛ':'E', 'Ḝ':'E', 'Ẹ':'E', 'Ẻ':'E',
       'Ẽ':'E', 'Ế':'E', 'Ề':'E', 'Ể':'E', 'Ễ':'E', 'Ệ':'E', 'Ḟ':'F', 'Ĝ':'G',
       'Ğ':'G', 'Ġ':'G', 'Ģ':'G', 'Ǧ':'G', 'Ǵ':'G', 'Ḡ':'G', 'Ĥ':'H', 'Ȟ':'H',
       'Ḣ':'H', 'Ḥ':'H', 'Ḧ':'H', 'Ḩ':'H', 'Ḫ':'H', 'Ì':'I', 'Í':'I', 'Î':'I',
       'Ï':'I', 'Ĩ':'I', 'Ī':'I', 'Ĭ':'I', 'Į':'I', 'İ':'I', 'Ǐ':'I', 'Ȉ':'I',
       'Ȋ':'I', 'Ḭ':'I', 'Ḯ':'I', 'Ỉ':'I', 'Ị':'I', 'Ĵ':'J', 'Ķ':'K', 'Ǩ':'K',
       'Ḱ':'K', 'Ḳ':'K', 'Ḵ':'K', 'Ĺ':'L', 'Ļ':'L', 'Ľ':'L', 'Ḷ':'L', 'Ḹ':'L',
       'Ḻ':'L', 'Ḽ':'L', 'Ḿ':'M', 'Ṁ':'M', 'Ṃ':'M', 'Ñ':'N', 'Ń':'N', 'Ņ':'N',
       'Ň':'N', 'Ǹ':'N', 'Ṅ':'N', 'Ṇ':'N', 'Ṉ':'N', 'Ṋ':'N', 'Ò':'O', 'Ó':'O',
       'Ô':'O', 'Õ':'O', 'Ö':'O', 'Ō':'O', 'Ŏ':'O', 'Ő':'O', 'Ơ':'O', 'Ǒ':'O',
       'Ǫ':'O', 'Ǭ':'O', 'Ȍ':'O', 'Ȏ':'O', 'Ȫ':'O', 'Ȭ':'O', 'Ȯ':'O', 'Ȱ':'O',
       'Ṍ':'O', 'Ṏ':'O', 'Ṑ':'O', 'Ṓ':'O', 'Ọ':'O', 'Ỏ':'O', 'Ố':'O', 'Ồ':'O',
       'Ổ':'O', 'Ỗ':'O', 'Ộ':'O', 'Ớ':'O', 'Ờ':'O', 'Ở':'O', 'Ỡ':'O', 'Ợ':'O',
       'Ṕ':'P', 'Ṗ':'P', 'Ŕ':'R', 'Ŗ':'R', 'Ř':'R', 'Ȑ':'R', 'Ȓ':'R', 'Ṙ':'R',
       'Ṛ':'R', 'Ṝ':'R', 'Ṟ':'R', 'Ś':'S', 'Ŝ':'S', 'Ş':'S', 'Š':'S', 'Ș':'S',
       'Ṡ':'S', 'Ṣ':'S', 'Ṥ':'S', 'Ṧ':'S', 'Ṩ':'S', 'Ţ':'T', 'Ť':'T', 'Ț':'T',
       'Ṫ':'T', 'Ṭ':'T', 'Ṯ':'T', 'Ṱ':'T', 'Ù':'U', 'Ú':'U', 'Û':'U', 'Ü':'U',
       'Ũ':'U', 'Ū':'U', 'Ŭ':'U', 'Ů':'U', 'Ű':'U', 'Ų':'U', 'Ư':'U', 'Ǔ':'U',
       'Ǖ':'U', 'Ǘ':'U', 'Ǚ':'U', 'Ǜ':'U', 'Ȕ':'U', 'Ȗ':'U', 'Ṳ':'U', 'Ṵ':'U',
       'Ṷ':'U', 'Ṹ':'U', 'Ṻ':'U', 'Ụ':'U', 'Ủ':'U', 'Ứ':'U', 'Ừ':'U', 'Ử':'U',
       'Ữ':'U', 'Ự':'U', 'Ṽ':'V', 'Ṿ':'V', 'Ŵ':'W', 'Ẁ':'W', 'Ẃ':'W', 'Ẅ':'W',
       'Ẇ':'W', 'Ẉ':'W', 'Ẋ':'X', 'Ẍ':'X', 'Ý':'Y', 'Ŷ':'Y', 'Ÿ':'Y', 'Ȳ':'Y',
       'Ẏ':'Y', 'Ỳ':'Y', 'Ỵ':'Y', 'Ỷ':'Y', 'Ỹ':'Y', 'Ź':'Z', 'Ż':'Z', 'Ž':'Z',
       'Ẑ':'Z', 'Ẓ':'Z', 'Ẕ':'Z',
       '`': '`',
       'à':'a', 'á':'a', 'â':'a', 'ã':'a', 'ä':'a', 'å':'a', 'ā':'a', 'ă':'a',
       'ą':'a', 'ǎ':'a', 'ǟ':'a', 'ǡ':'a', 'ǻ':'a', 'ȁ':'a', 'ȃ':'a', 'ȧ':'a',
       'ḁ':'a', 'ạ':'a', 'ả':'a', 'ấ':'a', 'ầ':'a', 'ẩ':'a', 'ẫ':'a', 'ậ':'a',
       'ắ':'a', 'ằ':'a', 'ẳ':'a', 'ẵ':'a', 'ặ':'a', 'ḃ':'b', 'ḅ':'b', 'ḇ':'b',
       'ç':'c', 'ć':'c', 'ĉ':'c', 'ċ':'c', 'č':'c', 'ḉ':'c', 'ď':'d', 'ḋ':'d',
       'ḍ':'d', 'ḏ':'d', 'ḑ':'d', 'ḓ':'d', 'è':'e', 'é':'e', 'ê':'e', 'ë':'e',
       'ē':'e', 'ĕ':'e', 'ė':'e', 'ę':'e', 'ě':'e', 'ȅ':'e', 'ȇ':'e', 'ȩ':'e',
       'ḕ':'e', 'ḗ':'e', 'ḙ':'e', 'ḛ':'e', 'ḝ':'e', 'ẹ':'e', 'ẻ':'e', 'ẽ':'e',
       'ế':'e', 'ề':'e', 'ể':'e', 'ễ':'e', 'ệ':'e', 'ḟ':'f', 'ĝ':'g', 'ğ':'g',
       'ġ':'g', 'ģ':'g', 'ǧ':'g', 'ǵ':'g', 'ḡ':'g', 'ĥ':'h', 'ȟ':'h', 'ḣ':'h',
       'ḥ':'h', 'ḧ':'h', 'ḩ':'h', 'ḫ':'h', 'ẖ':'h', 'ì':'i', 'í':'i', 'î':'i',
       'ï':'i', 'ĩ':'i', 'ī':'i', 'ĭ':'i', 'į':'i', 'ǐ':'i', 'ȉ':'i', 'ȋ':'i',
       'ḭ':'i', 'ḯ':'i', 'ỉ':'i', 'ị':'i', 'ĵ':'j', 'ǰ':'j', 'ķ':'k', 'ǩ':'k',
       'ḱ':'k', 'ḳ':'k', 'ḵ':'k', 'ĺ':'l', 'ļ':'l', 'ľ':'l', 'ḷ':'l', 'ḹ':'l',
       'ḻ':'l', 'ḽ':'l', 'ḿ':'m', 'ṁ':'m', 'ṃ':'m', 'ñ':'n', 'ń':'n', 'ņ':'n',
       'ň':'n', 'ǹ':'n', 'ṅ':'n', 'ṇ':'n', 'ṉ':'n', 'ṋ':'n', 'ò':'o', 'ó':'o',
       'ô':'o', 'õ':'o', 'ö':'o', 'ō':'o', 'ŏ':'o', 'ő':'o', 'ơ':'o', 'ǒ':'o',
       'ǫ':'o', 'ǭ':'o', 'ȍ':'o', 'ȏ':'o', 'ȫ':'o', 'ȭ':'o', 'ȯ':'o', 'ȱ':'o',
       'ṍ':'o', 'ṏ':'o', 'ṑ':'o', 'ṓ':'o', 'ọ':'o', 'ỏ':'o', 'ố':'o', 'ồ':'o',
       'ổ':'o', 'ỗ':'o', 'ộ':'o', 'ớ':'o', 'ờ':'o', 'ở':'o', 'ỡ':'o', 'ợ':'o',
       'ṕ':'p', 'ṗ':'p', 'ŕ':'r', 'ŗ':'r', 'ř':'r', 'ȑ':'r', 'ȓ':'r', 'ṙ':'r',
       'ṛ':'r', 'ṝ':'r', 'ṟ':'r', 'ś':'s', 'ŝ':'s', 'ş':'s', 'š':'s', 'ș':'s',
       'ṡ':'s', 'ṣ':'s', 'ṥ':'s', 'ṧ':'s', 'ṩ':'s', 'ţ':'t', 'ť':'t', 'ț':'t',
       'ṫ':'t', 'ṭ':'t', 'ṯ':'t', 'ṱ':'t', 'ẗ':'t', 'ù':'u', 'ú':'u', 'û':'u',
       'ü':'u', 'ũ':'u', 'ū':'u', 'ŭ':'u', 'ů':'u', 'ű':'u', 'ų':'u', 'ư':'u',
       'ǔ':'u', 'ǖ':'u', 'ǘ':'u', 'ǚ':'u', 'ǜ':'u', 'ȕ':'u', 'ȗ':'u', 'ṳ':'u',
       'ṵ':'u', 'ṷ':'u', 'ṹ':'u', 'ṻ':'u', 'ụ':'u', 'ủ':'u', 'ứ':'u', 'ừ':'u',
       'ử':'u', 'ữ':'u', 'ự':'u', 'ṽ':'v', 'ṿ':'v', 'ŵ':'w', 'ẁ':'w', 'ẃ':'w',
       'ẅ':'w', 'ẇ':'w', 'ẉ':'w', 'ẘ':'w', 'ẋ':'x', 'ẍ':'x', 'ý':'y', 'ÿ':'y',
       'ŷ':'y', 'ȳ':'y', 'ẏ':'y', 'ẙ':'y', 'ỳ':'y', 'ỵ':'y', 'ỷ':'y', 'ỹ':'y',
       'ź':'z', 'ż':'z', 'ž':'z', 'ẑ':'z', 'ẓ':'z', 'ẕ':'z'
      };
      diacriticMappingTable = SC.diacriticMappingTable;
    }
    
    var original, replacement, ret = "",
        length = this.length;
    for (var i = 0; i <= length; ++i) {
      original = this.charAt(i);
      replacement = diacriticMappingTable[original];
      if (replacement) {
        ret += replacement;
      }
      else {
        ret += original;
      }
    }
    return ret;
  },
  
  /**
    Removes any extra whitespace from the edges of the string. This method is 
    also aliased as strip().
    
    @returns {String} the trimmed string
  */
  trim: function () {
    return this.replace(SC.STRING_TRIM_REGEXP,"");
  },
  
  /**
    Removes any extra whitespace from the left edge of the string.
    
    @returns {String} the trimmed string
  */
  trimLeft: function () {
    return this.replace(SC.STRING_TRIM_LEFT_REGEXP,"");
  },
  
  /**
    Removes any extra whitespace from the right edge of the string.
    
    @returns {String} the trimmed string
  */
  trimRight: function () {
    return this.replace(SC.STRING_TRIM_RIGHT_REGEXP,"");
  },

  /**
    Converts a word into its plural form. 
    
    @returns {String} the plural form of the string
  */
  pluralize: function() {
			var idx, len,
			 		compare = this.split(/\s/).pop(), //check only the last word of a string
					restOfString = this.replace(compare,''),
					isCapitalized = compare.charAt(0).match(/[A-Z]/) ? true : false;									

			compare = compare.toLowerCase();
      for (idx=0, len=SC.INFLECTION_CONSTANTS.UNCOUNTABLE.length; idx < len; idx++) {
          var uncountable = SC.INFLECTION_CONSTANTS.UNCOUNTABLE[idx];
          if (compare == uncountable) {	
              return this.toString();
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.IRREGULAR.length; idx < len; idx++) {
          var singular = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][0],
							plural   = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][1];
          if ((compare == singular) || (compare == plural)) {
							if(isCapitalized) plural = plural.capitalize();
              return restOfString + plural;
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.PLURAL.length; idx < len; idx++) {
          var regex          = SC.INFLECTION_CONSTANTS.PLURAL[idx][0],
							replace_string = SC.INFLECTION_CONSTANTS.PLURAL[idx][1];
          if (regex.test(compare)) {
              return this.replace(regex, replace_string);
          }
      }
  },

  /**
    Converts a word into its singular form. 
    
    @returns {String} the singular form of the string
  */
  singularize: function() {
			var idx, len,
					compare = this.split(/\s/).pop(), //check only the last word of a string								
					restOfString = this.replace(compare,''),	
					isCapitalized = compare.charAt(0).match(/[A-Z]/) ? true : false;

			compare = compare.toLowerCase();
      for (idx=0, len=SC.INFLECTION_CONSTANTS.UNCOUNTABLE.length; idx < len; idx++) {
          var uncountable = SC.INFLECTION_CONSTANTS.UNCOUNTABLE[idx];
          if (compare == uncountable) {
              return this.toString();
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.IRREGULAR.length; idx < len; idx++) {
          var singular = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][0],
							plural   = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][1];
          if ((compare == singular) || (compare == plural)) {
							if(isCapitalized) singular = singular.capitalize();
              return restOfString + singular;
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.SINGULAR.length; idx < len; idx++) {
          var regex          = SC.INFLECTION_CONSTANTS.SINGULAR[idx][0],
							replace_string = SC.INFLECTION_CONSTANTS.SINGULAR[idx][1];
          if (regex.test(compare)) {
              return this.replace(regex, replace_string);
          }
      }
  }    
};

/** @private */
SC.String.strip = SC.String.trim; // convenience alias.

// Apply SC.String mixin to built-in String object
SC.supplement(String.prototype, SC.String) ;

/** @private */
String.prototype.loc = SC.String.loc; // Two places define it, and we want the version at SC.String.loc

/** @private */
SC.String.fmt = String.prototype.fmt; // copy from runtime


/* >>>>>>>>>> BEGIN source/views/view.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/browser');
sc_require('system/event');
sc_require('system/cursor');
sc_require('system/responder') ;

sc_require('mixins/string') ;

SC.viewKey = SC.guidKey + "_view" ;

/** Select a horizontal layout for various views.*/
SC.LAYOUT_HORIZONTAL = 'sc-layout-horizontal';

/** Select a vertical layout for various views.*/
SC.LAYOUT_VERTICAL = 'sc-layout-vertical';

/** @private */
SC._VIEW_DEFAULT_DIMS = 'marginTop marginLeft'.w();

/**
  Layout properties needed to anchor a view to the top.
*/
SC.ANCHOR_TOP = { top: 0 };

/**
  Layout properties needed to anchor a view to the left.
*/
SC.ANCHOR_LEFT = { left: 0 };

/*
  Layout properties to anchor a view to the top left 
*/
SC.ANCHOR_TOP_LEFT = { top: 0, left: 0 };

/**
  Layout properties to anchoe view to the bottom.
*/
SC.ANCHOR_BOTTOM = { bottom: 0 };

/**
  Layout properties to anchor a view to the right.
*/
SC.ANCHOR_RIGHT = { right: 0 } ;

/**
  Layout properties to anchor a view to the bottom right.
*/
SC.ANCHOR_BOTTOM_RIGHT = { bottom: 0, right: 0 };

/**
  Layout properties to take up the full width of a parent view.
*/
SC.FULL_WIDTH = { left: 0, right: 0 };

/**
  Layout properties to take up the full height of a parent view.
*/
SC.FULL_HEIGHT = { top: 0, bottom: 0 };

/**
  Layout properties to center.  Note that you must also specify a width and
  height for this to work.
*/
SC.ANCHOR_CENTER = { centerX: 0, centerY: 0 };

/**
  Layout property for width, height
*/

SC.LAYOUT_AUTO = 'auto';

/**
  Default property to disable or enable by default the contextMenu
*/
SC.CONTEXT_MENU_ENABLED = YES;

/**
  Default property to disable or enable if the focus can jump to the address
  bar or not.
*/
SC.TABBING_ONLY_INSIDE_DOCUMENT = YES;

/** @private - custom array used for child views */
SC.EMPTY_CHILD_VIEWS_ARRAY = [];
SC.EMPTY_CHILD_VIEWS_ARRAY.needsClone = YES;

/** 
  @class
  
  Base class for managing a view.  Views provide two functions:
  
  1. They translate state and events into drawing instructions for the 
     web browser and
  
  2. They act as first responders for incoming keyboard, mouse, and 
     touch events.
  
  h2. View Initialization
  
  When a view is setup, there are several methods you can override that 
  will be called at different times depending on how your view is created.
  Here is a guide to which method you want to override and when:
  
  - *init:* override this method for any general object setup (such as 
    observers, starting timers and animations, etc) that you need to happen 
    everytime the view is created, regardless of whether or not its layer 
    exists yet.
    
  - *render:* override this method to generate or update your HTML to reflect
    the current state of your view.  This method is called both when your view
    is first created and later anytime it needs to be updated.

  - *didCreateLayer:* the render() method is used to generate new HTML.  
    Override this method to perform any additional setup on the DOM you might
    need to do after creating the view.  For example, if you need to listen
    for events.
    
  - *willDestroyLayer:* if you implement didCreateLayer() to setup event 
    listeners, you should implement this method as well to remove the same 
    just before the DOM for your view is destroyed.
    
  - *updateLayer:* Normally, when a view needs to update its content, it will
    re-render the view using the render() method.  If you would like to 
    override this behavior with your own custom updating code, you can 
    replace updateLayer() with your own implementation instead.
    
  - *didAppendToDocument:* in theory all DOM setup could be done
    in didCreateLayer() as you already have a DOM element instantiated. 
    However there is cases where the element has to be first appended to the
    Document because there is either a bug on the browser or you are using 
    plugins which objects are not instantiated until you actually append the
    element to the DOM. This will allow you to do things like registering 
    DOM events on flash or quicktime objects.
  
  @extends SC.Responder
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.View = SC.Responder.extend(SC.DelegateSupport,
/** @scope SC.View.prototype */ {
  
  concatenatedProperties: 'outlets displayProperties layoutProperties classNames renderMixin didCreateLayerMixin willDestroyLayerMixin'.w(),
  
  /** 
    The current pane. 
    @property {SC.Pane}
  */
  pane: function() {
    var view = this ;
    while (view && !view.isPane) view = view.get('parentView') ;
    return view ;
  }.property('parentView').cacheable(),
  
  /**
    The page this view was instantiated from.  This is set by the page object
    during instantiation.
    
    @property {SC.Page}
  */
  page: null,
    
  /** 
    The current split view this view is embedded in (may be null). 
    @property {SC.SplitView}
  */
  splitView: function() {
    var view = this ;
    while (view && !view.isSplitView) view = view.get('parentView') ;
    return view ;
  }.property('parentView').cacheable(),
  
  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.
  */
  parentView: null,
  
  /**
    Optional background color.  Will be applied to the view's element if 
    set.  This property is intended for one-off views that need a background
    element.  If you plan to create many view instances it is probably better
    to use CSS.
  
    @property {String}
  */
  backgroundColor: null,
  
  /**
    Activates use of brower's static layout.  You can apply this mixin and
    still use absolute positioning.  To activate static positioning, set this
    property to YES.

    @property {Boolean}
  */
  useStaticLayout: NO,  
  
  // ..........................................................
  // IS ENABLED SUPPORT
  // 
  
  /** 
    Set to true when the item is enabled.   Note that changing this value
    will also alter the isVisibleInWindow property for this view and any
    child views.
    
    Note that if you apply the SC.Control mixin, changing this property will
    also automatically add or remove a 'disabled' CSS class name as well.
    
    This property is observable and bindable.
    
    @property {Boolean}
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    Computed property returns YES if the view and all of its parent views
    are enabled in the pane.  You should use this property when deciding 
    whether to respond to an incoming event or not.
    
    This property is not observable.
    
    @property {Boolean}
  */
  isEnabledInPane: function() {
    var ret = this.get('isEnabled'), pv ;
    if (ret && (pv = this.get('parentView'))) ret = pv.get('isEnabledInPane');
    return ret ;
  }.property('parentView', 'isEnabled'),

  /** @private
    Observes the isEnabled property and resigns first responder if set to NO.
    This will avoid cases where, for example, a disabled text field retains
    its focus rings.

    @observes isEnabled
  */
  _sc_view_isEnabledDidChange: function(){
    if(!this.get('isEnabled') && this.get('isFirstResponder')){
      this.resignFirstResponder();
    }
  }.observes('isEnabled'),

  // ..........................................................
  // IS VISIBLE IN WINDOW SUPPORT
  // 
  
  /**
    The isVisible property determines if the view is shown in the view 
    hierarchy it is a part of. A view can have isVisible == YES and still have
    isVisibleInWindow == NO. This occurs, for instance, when a parent view has
    isVisible == NO. Default is YES.
    
    The isVisible property is considered part of the layout and so changing it
    will trigger a layout update.
    
    @property {Boolean}
  */
  isVisible: YES,
  isVisibleBindingDefault: SC.Binding.bool(),
  
  /**
    YES only if the view and all of its parent views are currently visible
    in the window.  This property is used to optimize certain behaviors in
    the view.  For example, updates to the view layer are not performed 
    if the view until the view becomes visible in the window.
  */
  isVisibleInWindow: NO,
  
  /**
   By default we don't disable the context menu. Overriding this property
   can enable/disable the context menu per view.
  */
  isContextMenuEnabled: function() {
    return SC.CONTEXT_MENU_ENABLED;
  }.property(),
  
  /**
    Recomputes the isVisibleInWindow property based on the visibility of the 
    view and its parent.  If the recomputed value differs from the current 
    isVisibleInWindow state, this method will also call 
    recomputIsVisibleInWindow() on its child views as well.  As an optional 
    optimization, you can pass the isVisibleInWindow state of the parentView 
    if you already know it.
    
    You will not generally need to call or override this method yourself. It 
    is used by the SC.View hierarchy to relay window visibility changes up 
    and down the chain.
    
    @property {Boolean} parentViewIsVisible
    @returns {SC.View} receiver 
  */
  recomputeIsVisibleInWindow: function(parentViewIsVisible) {
    var previous = this.get('isVisibleInWindow'),
        current  = this.get('isVisible'),
        parentView;
    
    // isVisibleInWindow = isVisible && parentView.isVisibleInWindow
    // this approach only goes up to the parentView if necessary.
    if (current) {
      // If we weren't passed in 'parentViewIsVisible' (we generally aren't;
      // it's an optimization), then calculate it.
      if (parentViewIsVisible === undefined) {
        parentView = this.get('parentView');
        parentViewIsVisible = parentView ? parentView.get('isVisibleInWindow') : NO;
      }
      current = current && parentViewIsVisible;
    }

    // If our visibility has changed, then set the new value and notify our
    // child views to update their value.
    if (previous !== current) {
      this.set('isVisibleInWindow', current);

      var childViews = this.get('childViews'), len = childViews.length, idx;
      for(idx=0;idx<len;idx++) {
        childViews[idx].recomputeIsVisibleInWindow(current);
      }

      // For historical reasons, we'll also layout the child views if
      // necessary.
      if (current) {
        if (this.get('childViewsNeedLayout')) this.invokeOnce(this.layoutChildViewsIfNeeded);
      }
      else {
        // Also, if we were previously visible and were the first responder,
        // resign it.  This more appropriately belongs in a
        // 'isVisibleInWindow' observer or some such helper method because
        // this work is not strictly related to computing the visibility, but
        // view performance is critical, so avoiding the extra observer is
        // worthwhile.
        if (this.get('isFirstResponder')) this.resignFirstResponder();
      }
    }

    // If we're in this function, then that means one of our ancestor views
    // changed, or changed its 'isVisibleInWindow' value.  That means that if
    // we are out of sync with the layer, then we need to update our state
    // now.
    //
    // For example, say we're isVisible=NO, but we have not yet added the
    // 'hidden' class to the layer because of the "don't update the layer if
    // we're not visible in the window" check.  If any of our parent views
    // became visible, our layer would incorrectly be shown!
    this.updateLayerIfNeeded(YES);

    return this;
  },


  /** @private
    Whenever the view’s visibility changes, we need to recompute whether it is
    actually visible inside the window (a view is only visible in the window
    if it is marked as visibile and its parent view is as well), in addition
    to updating the layer accordingly.
  */
  _sc_isVisibleDidChange: function() {
    // 'isVisible' is effectively a displayProperty, but we'll call
    // displayDidChange() manually here instead of declaring it as a
    // displayProperty because that avoids having two observers on
    // 'isVisible'.  A single observer is:
    //   a.  More efficient
    //   b.  More correct, because we can guarantee the order of operations
    this.displayDidChange();

    this.recomputeIsVisibleInWindow();
  }.observes('isVisible'),


  
  // ..........................................................
  // CHILD VIEW SUPPORT
  // 
  
  /** 
    Array of child views.  You should never edit this array directly unless
    you are implementing createChildViews().  Most of the time, you should
    use the accessor methods such as appendChild(), insertBefore() and 
    removeChild().
    
    @property {Array} 
  */
  childViews: SC.EMPTY_CHILD_VIEWS_ARRAY,
  
  /**
    Insert the view into the the receiver's childNodes array.
    
    The view will be added to the childNodes array before the beforeView.  If 
    beforeView is null, then the view will be added to the end of the array.  
    This will also add the view's rootElement DOM node to the receivers 
    containerElement DOM node as a child.
    
    If the specified view already belongs to another parent, it will be 
    removed from that view first.
    
    @param {SC.View} view
    @param {SC.View} beforeView
    @returns {SC.View} the receiver
  */
  insertBefore: function(view, beforeView) { 
    view.beginPropertyChanges(); // limit notifications
    
    // remove view from old parent if needed.  Also notify views.
    if (view.get('parentView')) view.removeFromParent() ;
    if (this.willAddChild) this.willAddChild(view, beforeView) ;
    if (view.willAddToParent) view.willAddToParent(this, beforeView) ;
    
    // set parentView of child
    view.set('parentView', this);
    
    // add to childView's array.
    var idx, childViews = this.get('childViews') ;
    if (childViews.needsClone) this.set(childViews = []);
    idx = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
    if (idx<0) idx = childViews.length ;
    childViews.insertAt(idx, view) ;
    
    // The DOM will need some fixing up, note this on the view.
    view.parentViewDidChange() ;
    view.layoutDidChange() ;
    var pane = view.get('pane');
    if(pane && pane.get('isPaneAttached')) {
      view._notifyDidAppendToDocument();
    }
    
    // notify views
    if (this.didAddChild) this.didAddChild(view, beforeView) ;
    if (view.didAddToParent) view.didAddToParent(this, beforeView) ;
    
    view.endPropertyChanges();
    
    return this ;
  },
  
  /**
    Removes the child view from the parent view.  
    
    @param {SC.View} view
    @returns {SC.View} receiver
  */
  removeChild: function(view) {
    if (!view) return this; // nothing to do
    if (view.parentView !== this) {
      throw "%@.removeChild(%@) must belong to parent".fmt(this,view);
    }
    // notify views
    if (view.willRemoveFromParent) view.willRemoveFromParent() ;
    if (this.willRemoveChild) this.willRemoveChild(view) ;
    
    // update parent node
    view.set('parentView', null) ;
    
    // remove view from childViews array.
    var childViews = this.get('childViews'),
        idx = childViews.indexOf(view) ;
    if (idx>=0) childViews.removeAt(idx);
    
    // The DOM will need some fixing up, note this on the view.
    view.parentViewDidChange() ;
    
    // notify views
    if (this.didRemoveChild) this.didRemoveChild(view);
    if (view.didRemoveFromParent) view.didRemoveFromParent(this) ;
    
    return this ;
  },
  
  /**
    Removes all children from the parentView.
    
    @returns {SC.View} receiver 
  */
  removeAllChildren: function() {
    var childViews = this.get('childViews'), view ;
    while (view = childViews.objectAt(childViews.get('length')-1)) {
      this.removeChild(view) ;
    }
    return this ;
  },
  
  /** 
    Removes the view from its parentView, if one is found.  Otherwise
    does nothing.
    
    @returns {SC.View} receiver
  */
  removeFromParent: function() {
    var parent = this.get('parentView') ;
    if (parent) parent.removeChild(this) ;
    return this ;
  },
  
  /**
    Replace the oldView with the specified view in the receivers childNodes 
    array. This will also replace the DOM node of the oldView with the DOM 
    node of the new view in the receivers DOM.
    
    If the specified view already belongs to another parent, it will be 
    removed from that view first.
    
    @param view {SC.View} the view to insert in the DOM
    @param view {SC.View} the view to remove from the DOM.
    @returns {SC.View} the receiver
  */
  replaceChild: function(view, oldView) {
    // suspend notifications
    view.beginPropertyChanges();
    oldView.beginPropertyChanges();
    this.beginPropertyChanges();
    
    this.insertBefore(view,oldView).removeChild(oldView) ;
    
    // resume notifications
    this.endPropertyChanges();
    oldView.endPropertyChanges();
    view.endPropertyChanges(); 
    
    return this;
  },
  
  /**
    Replaces the current array of child views with the new array of child 
    views.
    
    @param {Array} views views you want to add
    @returns {SC.View} receiver
  */
  replaceAllChildren: function(views) {
    var len = views.get('length'), idx;
    
    this.beginPropertyChanges();
    this.destroyLayer().removeAllChildren();
    for(idx=0;idx<len;idx++) this.appendChild(views.objectAt(idx));
    this.replaceLayer();
    this.endPropertyChanges();
    
    return this ;
  },
  
  /**
    Appends the specified view to the end of the receivers childViews array.  
    This is equivalent to calling insertBefore(view, null);
    
    @param view {SC.View} the view to insert
    @returns {SC.View} the receiver 
  */
  appendChild: function(view) {
    return this.insertBefore(view, null);
  },
  
  /** 
    This method is called whenever the receiver's parentView has changed.  
    The default implementation of this method marks the view's display 
    location as dirty so that it will update at the end of the run loop.
    
    You will not usually need to override or call this method yourself, though
    if you manually patch the parentView hierarchy for some reason, you should
    call this method to notify the view that it's parentView has changed.
    
    @returns {SC.View} receiver
  */
  parentViewDidChange: function() {
    this.recomputeIsVisibleInWindow() ;
    
    this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocationIfNeeded) ;
    
    // We also need to iterate down through the view hierarchy and invalidate
    // all our child view's caches for 'pane', since it could have changed.
    //
    // Note:  In theory we could try to avoid this invalidation if we
    //        do this only in cases where we "know" the 'pane' value might
    //        have changed, but those cases are few and far between.
    
    this._invalidatePaneCacheForSelfAndAllChildViews();
    
    return this ;
  },
  
  /** @private
    We want to cache the 'pane' property, but it's impossible for us to
    declare a dependence on all properties that can affect the value.  (For
    example, if our grandparent gets attached to a new pane, our pane will
    have changed.)  So when there's the potential for the pane changing, we
    need to invalidate the caches for all our child views, and their child
    views, and so on.
  */
  _invalidatePaneCacheForSelfAndAllChildViews: function () {
    var childView, childViews = this.get('childViews'),
        len = childViews.length, idx ;
        
    this.notifyPropertyChange('pane');
    
    for (idx=0; idx<len; ++idx) {
      childView = childViews[idx];
      if (childView._invalidatePaneCacheForSelfAndAllChildViews) {
        childView._invalidatePaneCacheForSelfAndAllChildViews();
      } 
    }
  },
  
  // ..........................................................
  // LAYER SUPPORT
  // 
  
  /**
    Returns the current layer for the view.  The layer for a view is only 
    generated when the view first becomes visible in the window and even 
    then it will not be computed until you request this layer property.
    
    If the layer is not actually set on the view itself, then the layer will
    be found by calling this.findLayerInParentLayer().
    
    You can also set the layer by calling set on this property.
    
    @property {DOMElement} the layer
  */
  layer: function(key, value) {
    if (value !== undefined) {
      this._view_layer = value ;
      
    // no layer...attempt to discover it...  
    } else {
      value = this._view_layer;
      if (!value) {
        var parent = this.get('parentView');
        if (parent) parent = parent.get('layer');
        if (parent) {
          this._view_layer = value = this.findLayerInParentLayer(parent);
        }
        parent = null ; // avoid memory leak
      }
    }
    return value ;
  }.property('isVisibleInWindow').cacheable(),
  
  /**
    Get a CoreQuery object for this view's layer, or pass in a selector string
    to get a CoreQuery object for a DOM node nested within this layer.
    
    @param {String} sel a CoreQuery-compatible selector string
    @returns {SC.CoreQuery} the CoreQuery object for the DOM node
  */
  $: function(sel) {
    var ret, layer = this.get('layer') ;
    // note: SC.$([]) returns an empty CoreQuery object.  SC.$() would 
    // return an object selecting the document.
    ret = !layer ? SC.$([]) : (sel === undefined) ? SC.$(layer) : SC.$(sel, layer) ;
    layer = null ; // avoid memory leak
    return ret ;
  },
  
  /**
    Returns the DOM element that should be used to hold child views when they
    are added/remove via DOM manipulation.  The default implementation simply
    returns the layer itself.  You can override this to return a DOM element
    within the layer.
    
    @property {DOMElement} the container layer
  */
  containerLayer: function() {
    return this.get('layer') ;
  }.property('layer').cacheable(), 
  
  /**
    The ID to use when trying to locate the layer in the DOM.  If you do not
    set the layerId explicitly, then the view's GUID will be used instead.
    This ID must be set at the time the view is created.
    
    @property {String}
    @readOnly
  */
  layerId: function(key, value) {
    if (value) this._layerId = value;
    if (this._layerId) return this._layerId;
    return SC.guidFor(this) ;
  }.property().cacheable(),
  
  _lastLayerId: null,

  /**
    Handles changes in the layer id.
  */
  layerIdDidChange: function() {
    var layer  = this.get("layer"),
        lid    = this.get("layerId"),
        lastId = this._lastLayerId;
    if (lid !== lastId) {
      // if we had an earlier one, remove from view hash.
      if (lastId && SC.View.views[lastId] === this) {
        delete SC.View.views[lastId];
      }
      
      // set the current one as the new old one
      this._lastLayerId = lid;
      
      // and add the new one
      SC.View.views[lid] = this;
      
      // and finally, set the actual layer id.
      if (layer) layer.id = lid;
    }
  }.observes("layerId"),
  
  /**
    Attempts to discover the layer in the parent layer.  The default 
    implementation looks for an element with an ID of layerId (or the view's
    guid if layerId is null).  You can override this method to provide your
    own form of lookup.  For example, if you want to discover your layer using
    a CSS class name instead of an ID.
    
    @param {DOMElement} parentLayer the parent's DOM layer
    @returns {DOMElement} the discovered layer
  */
  findLayerInParentLayer: function(parentLayer) {
    var layerId = this.get('layerId'),
        node, i, ilen, childNodes, elem, usedQuerySelector;
    
    // first, let's try the fast path...
    elem = document.getElementById(layerId) ;
    
    // TODO: use code generation to only really do this check on IE
    if (SC.browser.msie && elem && elem.id !== layerId) elem = null;
    
    // if no element was found the fast way, search down the parentLayer for
    // the element.  This code should not be invoked very often.  Usually a
    // DOM element will be discovered by the first method above.
    // This code uses a BFS algorithm as is expected to find the layer right 
    // below the parent.
    if (!elem) {
      elem = parentLayer.firstChild ;
      var q = [];
      q.push(parentLayer);
      while (q.length !==0) {
        node = q.shift();
        if (node.id===layerId) {
          return node;
        }
        childNodes = node.childNodes;
        for (i=0, ilen=childNodes.length;  i < ilen;  ++i) {
          q.push(childNodes[i]);
        }
      }
      elem = null;  
    }
    
    return elem;
  },
  
  /**
    Returns YES if the receiver is a subview of a given view or if it’s 
    identical to that view. Otherwise, it returns NO.
    
    @property {SC.View} view
  */
  isDescendantOf: function(view) {
    var parentView = this.get('parentView');
    
    if(this===view) return YES;
    else if(parentView) return parentView.isDescendantOf(view);
    else return NO;
  },
  
  /**
    This method is invoked whenever a display property changes.  It will set 
    the layerNeedsUpdate method to YES.  If you need to perform additional
    setup whenever the display changes, you can override this method as well.
    
    @returns {SC.View} receiver
  */
  displayDidChange: function() {
    this.set('layerNeedsUpdate', YES) ;
    return this;
  },
  
  /**
    Setting this property to YES will cause the updateLayerIfNeeded method to 
    be invoked at the end of the runloop.  You can also force a view to update
    sooner by calling updateLayerIfNeeded() directly.  The method will update 
    the layer only if this property is YES.
    
    @property {Boolean}
    @test in updateLayer
  */
  layerNeedsUpdate: NO,
  
  /** @private
    Schedules the updateLayerIfNeeded method to run at the end of the runloop
    if layerNeedsUpdate is set to YES.
  */  
  _view_layerNeedsUpdateDidChange: function() {
    if (this.get('layerNeedsUpdate')) {
      this.invokeOnce(this.updateLayerIfNeeded) ;
    }
  }.observes('layerNeedsUpdate'),
  
  /**
    Updates the layer only if the view is visible onscreen and if 
    layerNeedsUpdate is set to YES.  Normally you will not invoke this method
    directly.  Instead you set the layerNeedsUpdate property to YES and this
    method will be called once at the end of the runloop.
    
    If you need to update view's layer sooner than the end of the runloop, you
    can call this method directly.  If your view is not visible in the window
    but you want it to update anyway, then call this method, passing YES for
    the 'skipIsVisibleInWindowCheck' parameter.
    
    You should not override this method.  Instead override updateLayer() or
    render().
    
    @returns {SC.View} receiver
    @test in updateLayer
  */
  updateLayerIfNeeded: function(skipIsVisibleInWindowCheck) {
    var needsUpdate  = this.get('layerNeedsUpdate'),
        shouldUpdate = needsUpdate  &&  (skipIsVisibleInWindowCheck || this.get('isVisibleInWindow'));
    if (shouldUpdate) {
      // only update a layer if it already exists
      if (this.get('layer')) {
        this.beginPropertyChanges() ;
        this.set('layerNeedsUpdate', NO) ;
        this.updateLayer() ;
        this.endPropertyChanges() ;
      }
    }

    return this ;
  },
  
  /**
    This is the core method invoked to update a view layer whenever it has 
    changed.  This method simply creates a render context focused on the 
    layer element and then calls your render() method.
    
    You will not usually call or override this method directly.  Instead you
    should set the layerNeedsUpdate property to YES to cause this method to
    run at the end of the run loop, or you can call updateLayerIfNeeded()
    to force the layer to update immediately.  
    
    Instead of overriding this method, consider overidding the render() method
    instead, which is called both when creating and updating a layer.  If you
    do not want your render() method called when updating a layer, then you
    should override this method instead.
    
    @returns {SC.View} receiver 
  */
  updateLayer: function() {
    var context = this.renderContext(this.get('layer')) ;
    this.prepareContext(context, NO) ;
    context.update() ;
    if (context._innerHTMLReplaced) {
      var pane = this.get('pane');
      if(pane && pane.get('isPaneAttached')) {
        this._notifyDidAppendToDocument();
      }
    }

    // If this view uses static layout, then notify that the frame (likely)
    // changed.
    if (this.useStaticLayout) this.viewDidResize();

    if (this.didUpdateLayer) this.didUpdateLayer(); // call to update DOM
    if(this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
    return this ;
  },
  
  /**
    Creates a new renderContext with the passed tagName or element.  You
    can override this method to provide further customization to the context
    if needed.  Normally you will not need to call or override this method.
    
    @returns {SC.RenderContext}
  */
  renderContext: function(tagNameOrElement) {
    return SC.RenderContext(tagNameOrElement) ;
  },
  
  /**
    Creates the layer by creating a renderContext and invoking the view's
    render() method.  This will only create the layer if the layer does not
    already exist.
    
    When you create a layer, it is expected that your render() method will
    also render the HTML for all child views as well.  This method will 
    notify the view along with any of its childViews that its layer has been
    created.
    
    @returns {SC.View} receiver
  */
  createLayer: function() {
    if (this.get('layer')) return this ; // nothing to do
    
    var context = this.renderContext(this.get('tagName')) ;
    
    // now prepare the content like normal.
    this.prepareContext(context, YES) ;
    this.set('layer', context.element()) ;
    
    // now notify the view and its child views..
    this._notifyDidCreateLayer() ;
    
    return this ;
  },
  
  /** @private - 
    Invokes the receivers didCreateLayer() method if it exists and then
    invokes the same on all child views.
  */
  _notifyDidCreateLayer: function() {
    if (this.didCreateLayer) this.didCreateLayer() ;
    var mixins = this.didCreateLayerMixin, len, idx,
        childViews = this.get('childViews'),
        childView;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) mixins[idx].call(this) ;
    }
    
    len = childViews.length ;
    for (idx=0; idx<len; ++idx) {
      childView = childViews[idx];
      if (!childView) continue;

      // A parent view creating a layer might result in the creation of a
      // child view's DOM node being created via a render context without
      // createLayer() being invoked on the child.  In such cases, if anyone
      // had requested 'layer' and it was cached as null, we need to
      // invalidate it.
      childView.notifyPropertyChange('layer');

      childView._notifyDidCreateLayer() ;
    }
  },
  
  /**
    Destroys any existing layer along with the layer for any child views as 
    well.  If the view does not currently have a layer, then this method will
    do nothing.
    
    If you implement willDestroyLayer() on your view or if any mixins 
    implement willDestroLayerMixin(), then this method will be invoked on your
    view before your layer is destroyed to give you a chance to clean up any
    event handlers, etc.
    
    If you write a willDestroyLayer() handler, you can assume that your 
    didCreateLayer() handler was called earlier for the same layer.
    
    Normally you will not call or override this method yourself, but you may
    want to implement the above callbacks when it is run.
    
    @returns {SC.View} receiver
  */
  destroyLayer: function() {
    var layer = this.get('layer') ;
    if (layer) {
      // Now notify the view and its child views.  It will also set the
      // layer property to null.
      this._notifyWillDestroyLayer() ;
      
      // do final cleanup
      if (layer.parentNode) layer.parentNode.removeChild(layer) ;
      layer = null ;
    }
    return this ;
  },
  
  /**
    Destroys and recreates the current layer.  This can be more efficient than
    modifying individual child views.
    
    @returns {SC.View} receiver
  */
  replaceLayer: function() {
    this.destroyLayer();
    this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocationIfNeeded) ;
  },
    
  /** @private - 
    Invokes willDestroyLayer() on view and child views.  Then sets layer to
    null for receiver.
  */
  _notifyWillDestroyLayer: function() {
    if (this.willDestroyLayer) this.willDestroyLayer() ;
    var mixins = this.willDestroyLayerMixin, len, idx,
        childViews = this.get('childViews') ;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) mixins[idx].call(this) ;
    }
    
    len = childViews.length ;
    for (idx=0; idx<len; ++idx) childViews[idx]._notifyWillDestroyLayer() ;
    
    this.set('layer', null) ;
  },
  
  /**
    Invoked by createLayer() and updateLayer() to actually render a context.
    This method calls the render() method on your view along with any 
    renderMixin() methods supplied by mixins you might have added.
    
    You should not override this method directly.  However, you might call
    this method if you choose to override updateLayer() or createLayer().
    
    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @returns {void}
  */
  prepareContext: function(context, firstTime) {
    var mixins, len, idx, layerId, bgcolor, cursor, classNames;
  
    // do some initial setup only needed at create time.
    if (firstTime) {
      // TODO: seems like things will break later if SC.guidFor(this) is used
  
      layerId = this.layerId ? this.get('layerId') : SC.guidFor(this) ;
      context.id(layerId).classNames(this.get('classNames'), YES) ;
      this.renderLayout(context, firstTime) ;
    }else{
      context.resetClassNames();
      context.classNames(this.get('classNames'), YES);  
    }
  
    // do some standard setup...
    classNames = [];
    if (this.get('isTextSelectable')) classNames.push('allow-select') ;
    if (!this.get('isEnabled')) classNames.push('disabled') ;
    if (!this.get('isVisible')) classNames.push('hidden') ;
    if (this.get('isFirstResponder')) classNames.push('focus');
    if (this.get('useStaticLayout')) classNames.push('sc-static-layout');
  
    bgcolor = this.get('backgroundColor');
    if (bgcolor) context.addStyle('backgroundColor', bgcolor);
  
    // Sets cursor class, if present.
    cursor = this.get('cursor');
    if (!cursor && this.get('shouldInheritCursor')) {
      // If this view has no cursor and should inherit it from the parent, 
      // then it sets its own cursor view.  This sets the cursor rather than 
      // simply using the parent's cursor object so that its cursorless 
      // childViews can also inherit it.
      cursor = this.getPath('parentView.cursor');
    }

    if (SC.typeOf(cursor) === SC.T_STRING) {
      cursor = SC.objectForPropertyPath(cursor);
    }
    
    if (cursor instanceof SC.Cursor) {
      classNames.push(cursor.get('className')) ;
    }
    
    // Doing a single call to 'addClass' is faster than multiple.
    context.addClass(classNames);
  
    this.beginPropertyChanges() ;
    this.set('layerNeedsUpdate', NO) ;
    this.render(context, firstTime) ;
    if (mixins = this.renderMixin) {
      len = mixins.length;
      for(idx=0; idx<len; ++idx) mixins[idx].call(this, context, firstTime) ;
    }
    this.endPropertyChanges() ;
  },
  
  /**
    Your render method should invoke this method to render any child views,
    especially if this is the first time the view will be rendered.  This will
    walk down the childView chain, rendering all of the children in a nested
    way.
    
    @param {SC.RenderContext} context the context
    @param {Boolean} firstName true if the layer is being created
    @returns {SC.RenderContext} the render context
    @test in render
  */
  renderChildViews: function(context, firstTime) {
    var cv = this.get('childViews'), len = cv.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = cv[idx] ;
      if (!view) continue;
      context = context.begin(view.get('tagName')) ;
      view.prepareContext(context, firstTime) ;
      context = context.end() ;
    }
    return context ;  
  },
  
  /**
    Invoked whenever your view needs to be rendered, including when the view's
    layer is first created and any time in the future when it needs to be 
    updated.
    
    You will normally override this method in your subclassed views to 
    provide whatever drawing functionality you will need in order to 
    render your content.
    
    You can use the passed firstTime property to determine whether or not 
    you need to completely re-render the view or only update the surrounding
    HTML.  
    
    The default implementation of this method simply calls renderChildViews()
    if this is the first time you are rendering, or null otherwise.
    
    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @returns {void}
  */
  render: function(context, firstTime) {
    if (firstTime) this.renderChildViews(context, firstTime) ;
  },
  
  
  /** @private - 
    Invokes the receivers didAppendLayerToDocument() method if it exists and
    then invokes the same on all child views. 
  */
  
  _notifyDidAppendToDocument: function() {
    if (this.didAppendToDocument) this.didAppendToDocument();

    var i=0, child, childLen, children = this.get('childViews');
    for(i=0, childLen=children.length; i<childLen; i++) {
      child = children[i];
      if(child._notifyDidAppendToDocument){
        child._notifyDidAppendToDocument();
      }
    }
  },
  
  childViewsObserver: function(){
    var childViews = this.get('childViews'), i, iLen, child;
    for(i=0, iLen = childViews.length; i<iLen; i++){
      child = childViews[i];
      if(child._notifyDidAppendToDocument){
        child._notifyDidAppendToDocument();
      }
    }    
  }.observes('childViews'),
  
  // ..........................................................
  // STANDARD RENDER PROPERTIES
  // 
  
  /** 
    Tag name for the view's outer element.  The tag name is only used when
    a layer is first created.  If you change the tagName for an element, you
    must destroy and recreate the view layer.
    
    @property {String}
  */
  tagName: 'div',
  
  /**
    Standard CSS class names to apply to the view's outer element.  This 
    property automatically inherits any class names defined by the view's
    superclasses as well.  
    
    @property {Array}
  */
  classNames: ['sc-view'],
  
  /**
    Tool tip property that will be set to the title attribute on the HTML 
    rendered element.
    
    @property {String}
  */
  toolTip: null,

  /**
    Determines if the user can select text within the view.  Normally this is
    set to NO to disable text selection.  You should set this to YES if you
    are creating a view that includes editable text.  Otherwise, settings this
    to YES will probably make your controls harder to use and it is not 
    recommended.
    
    @property {Boolean}
    @readOnly
  */
  isTextSelectable: NO,
  
  /** 
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.

    Implementation note:  'isVisible' is also effectively a display property,
    but it is not declared as such because the same effect is implemented
    inside _sc_isVisibleDidChange().  This avoids having two observers on
    'isVisible', which is:
      a.  More efficient
      b.  More correct, because we can guarantee the order of operations

    @property {Array}
    @readOnly
  */
  displayProperties: ['isFirstResponder'],
  
  /**
    You can set this to an SC.Cursor instance; its class name will 
    automatically be added to the layer's classNames, allowing you
    to efficiently change the cursor for a large group of views with
    just one change to the SC.Cursor object.  The cursor property
    is only used when the layer is created, so if you need to change
    it to a different cursor object, you will have to destroy and
    recreate the view layer.  (In this case you might investigate
    setting cursors using CSS directly instead of SC.Cursor.)
    
    @property {SC.Cursor String}
  */
  cursor: null,
  
  /**
    A child view without a cursor of its own inherits its parent's cursor by
    default.  Set this to NO to prevent this behavior.
    
    @property {Boolean}
  */
  shouldInheritCursor: YES,
  
  // ..........................................................
  // LAYER LOCATION
  // 
  
  /**
    Set to YES when the view's layer location is dirty.  You can call 
    updateLayerLocationIfNeeded() to clear this flag if it is set.
    
    @property {Boolean}
  */
  layerLocationNeedsUpdate: NO,
  
  /**
    Calls updateLayerLocation(), but only if the view's layer location
    currently needs to be updated.  This method is called automatically at 
    the end of a run loop if you have called parentViewDidChange() at some
    point.
    
    @property {Boolean} force This property is ignored.
    @returns {SC.View} receiver 
    @test in updateLayerLocation
  */
  updateLayerLocationIfNeeded: function(force) {
    if (this.get('layerLocationNeedsUpdate')) {
      this.updateLayerLocation() ;
    }
    return this ;
  },
  
  /**
    This method is called when a view changes its location in the view 
    hierarchy.  This method will update the underlying DOM-location of the 
    layer so that it reflects the new location.
    
    @returns {SC.View} receiver
  */
  updateLayerLocation: function() {
    // collect some useful value
    // if there is no node for some reason, just exit
    var node = this.get('layer'),
        parentView = this.get('parentView'),
        parentNode = parentView ? parentView.get('containerLayer') : null ;
    
    // remove node from current parentNode if the node does not match the new 
    // parent node.
    if (node && node.parentNode && node.parentNode !== parentNode) {
      node.parentNode.removeChild(node);
    }
    
    // CASE 1: no new parentView.  just remove from parent (above).
    if (!parentView) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
      
    // CASE 2: parentView has no layer, view has layer.  destroy layer
    // CASE 3: parentView has no layer, view has no layer, nothing to do
    } else if (!parentNode) {
      if (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
        this.destroyLayer();
      }
      
    // CASE 4: parentView has layer, view has no layer.  create layer & add
    // CASE 5: parentView has layer, view has layer.  move layer
    } else {
      if (!node) {
        this.createLayer() ;
        node = this.get('layer') ;
        if (!node) return; // can't do anything without a node.
      }
      
      var siblings = parentView.get('childViews'),
          nextView = siblings.objectAt(siblings.indexOf(this)+1),
          nextNode = (nextView) ? nextView.get('layer') : null ;
      
      // before we add to parent node, make sure that the nextNode exists...
      if (nextView && (!nextNode || nextNode.parentNode!==parentNode)) {
        nextView.updateLayerLocationIfNeeded() ;
        nextNode = nextView.get('layer') ;
      }
      
      // add to parentNode if needed.
      if ((node.parentNode!==parentNode) || (node.nextSibling!==nextNode)) {
        parentNode.insertBefore(node, nextNode) ;
      }
    }
    
    parentNode = parentView = node = nextNode = null ; // avoid memory leaks

    this.set('layerLocationNeedsUpdate', NO) ;

    return this ; 
  },
  
  // .......................................................
  // SC.RESPONDER SUPPORT
  //
  
  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function() {
    return this.get('parentView') ;
  }.property('parentView').cacheable(),

  
  /** @property
    Set to YES if your view is willing to accept first responder status.  This 
    is used when calculcating key responder loop.
  */
  acceptsFirstResponder: NO,

  // ..........................................................
  // KEY RESPONDER
  // 
  
  /** @property
    YES if the view is currently first responder and the pane the view belongs 
    to is also key pane.  While this property is set, you should expect to 
    receive keyboard events.
  */
  isKeyResponder: NO,

  /**
    This method is invoked just before you lost the key responder status.  
    The passed view is the view that is about to gain keyResponder status.  
    This gives you a chance to do any early setup. Remember that you can 
    gain/lose key responder status either because another view in the same 
    pane is becoming first responder or because another pane is about to 
    become key.
    
    @param {SC.Responder} responder
  */
  willLoseKeyResponderTo: function(responder) {},
  
  /**
    This method is invoked just before you become the key responder.  The 
    passed view is the view that is about to lose keyResponder status.  You 
    can use this to do any setup before the view changes.
    Remember that you can gain/lose key responder status either because 
    another view in the same pane is becoming first responder or because 
    another pane is about to become key.
    
    @param {SC.Responder} responder
  */
  willBecomeKeyResponderFrom: function(responder) {},
  
  /**
    Invokved just after the responder loses key responder status.
  */
  didLoseKeyResponderTo: function(responder) {},
  
  /**
    Invoked just after the responder gains key responder status.
  */
  didBecomeKeyResponderFrom: function(responder) {},
    
  /**
    This method will process a key input event, attempting to convert it to 
    an appropriate action method and sending it up the responder chain.  The 
    event is converted using the SC.KEY_BINDINGS hash, which maps key events 
    into method names.  If no key binding is found, then the key event will 
    be passed along using an insertText() method.
    
    @param {SC.Event} event
    @returns {Object} object that handled event, if any
  */
  interpretKeyEvents: function(event) {
    var codes = event.commandCodes(), cmd = codes[0], chr = codes[1], ret;

    if (!cmd && !chr) return null ;  //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd) {
      var methodName = SC.MODIFIED_KEY_BINDINGS[cmd] || SC.BASE_KEY_BINDINGS[cmd.match(/[^_]+$/)[0]];
      if (methodName) {
        var target = this, pane = this.get('pane'), handler = null;
        while(target && !(handler = target.tryToPerform(methodName, event))){
          target = (target===pane)? null: target.get('nextResponder') ;
        }
        return handler ;
      }
    } 

    if (chr && this.respondsTo('insertText')) {
      // if we haven't returned yet and there is plain text, then do an insert 
      // of the text.  Since this is not an action, do not send it up the 
      // responder chain.
      ret = this.insertText(chr, event);
      return ret ? (ret===YES ? this : ret) : null ; // map YES|NO => this|nil
    }

    return null ; //nothing to do.
  },
  
  /**
    This method is invoked by interpretKeyEvents() when you receive a key 
    event matching some plain text.  You can use this to actually insert the 
    text into your application, if needed.
    
    @param {SC.Event} event
    @returns {Object} receiver or object that handled event
  */
  insertText: function(chr) {
    return NO ;
  },
    
  /**
    Recursively travels down the view hierarchy looking for a view that 
    implements the key equivalent (returning to YES to indicate it handled 
    the event).  You can override this method to handle specific key 
    equivalents yourself.
    
    The keystring is a string description of the key combination pressed.
    The evt is the event itself. If you handle the equivalent, return YES.
    Otherwise, you should just return sc_super.
    
    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    var ret = NO,
        childViews = this.get('childViews'),
        len = childViews.length,
        idx = -1 ;
    while (!ret && (++idx < len)) {
      ret = childViews[idx].performKeyEquivalent(keystring, evt) ;
    }
    return ret ;
  },
  
  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next child.
  */
  nextKeyView: null,
  
  /**
    Computes the next valid key view, possibly returning the receiver or null.
    This is the next key view that acceptsFirstResponder.
    
    @property
    @type SC.View
  */
  nextValidKeyView: function() {
    var seen = [], 
        rootView = this.get('pane'), ret = this.get('nextKeyView');
    
    if(!ret) ret = rootView._computeNextValidKeyView(this, seen);
    
    if(SC.TABBING_ONLY_INSIDE_DOCUMENT && !ret) {
      ret = rootView._computeNextValidKeyView(rootView, seen);
    }
    
    return ret ;
  }.property('nextKeyView'),
  
  _computeNextValidKeyView: function(currentView, seen) {
    var ret = this.get('nextKeyView'),
        children, i, childLen, child;
    if(this !== currentView && seen.indexOf(currentView)!=-1 && 
      this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')){
      return this;
    }
    seen.push(this); // avoid cycles
    
    // find next sibling
    if (!ret) {
      children = this.get('childViews');
      for(i=0, childLen = children.length; i<childLen; i++){
        child = children[i];
        if(child.get('isVisibleInWindow') && child.get('isVisible')){
          ret = child._computeNextValidKeyView(currentView, seen);
        }
        if (ret) return ret;
      }
      ret = null;
    }
    return ret ;
  },
  
  /**
    Optionally points to the previous key view that should gain focus when
    tabbing through the interface. If this is not set then the previous 
    key view will be set automatically to the previous child.
  */
  previousKeyView: null,

  /**
    Computes the previous valid key view, possibly returning the receiver or 
    null.  This is the previous key view that acceptsFirstResponder.
    
    @property
    @type SC.View
  */
  previousValidKeyView: function() {
    var seen = [],
        rootView = this.pane(), ret = this.get('previousKeyView'); 
    if(!ret) ret = rootView._computePreviousValidKeyView(this, seen);
    return ret ;
  }.property('previousKeyView'),
  
  _computePreviousValidKeyView: function(currentView, seen) {  
    var ret = this.get('previousKeyView'),
        children, i, child;
        
    if(this !== currentView && seen.indexOf(currentView)!=-1 && 
      this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')){
      return this;
    }
    seen.push(this); // avoid cycles

    // find next sibling
    if (!ret) {
      children = this.get('childViews');
      for(i=children.length-1; 0<=i; i--){
        child = children[i];
        if(child.get('isVisibleInWindow') && child.get('isVisible')){
          ret = child._computePreviousValidKeyView(currentView, seen);
        }
        if (ret) return ret;
      }
      ret = null;
    }
    return ret ;
  },

  // .......................................................
  // CORE DISPLAY METHODS
  //
  
  /** @private 
    Setup a view, but do not finish waking it up. 
    - configure childViews
    - generate DOM + plug in outlets/childViews unless rootElement is defined
    - register the view with the global views hash, which is used for mgmt
  */
  init: function() {
    var parentView, path, root, idx, len, lp, dp ;
    
    arguments.callee.base.apply(this,arguments) ;

    // Register this view for event handling
    SC.View.views[this.get('layerId')] = this ;

    var childViews = this.get('childViews');
    
    // setup child views.  be sure to clone the child views array first
    this.childViews = childViews ? childViews.slice() : [] ;
    this.createChildViews() ; // setup child Views
    
    // register display property observers ..
    // TODO: Optimize into class setup 
    dp = this.get('displayProperties') ; 
    idx = dp.length ;
    while (--idx >= 0) {
      this.addObserver(dp[idx], this, this.displayDidChange) ;
    }
    
    // register for drags
    if (this.get('isDropTarget')) SC.Drag.addDropTarget(this) ;
    
    // register scroll views for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.addScrollableView(this) ;
  },
  
  /**
    Wakes up the view. The default implementation immediately syncs any 
    bindings, which may cause the view to need its display updated. You 
    can override this method to perform any additional setup. Be sure to 
    call sc_super to setup bindings and to call awake on childViews.
    
    It is best to awake a view before you add it to the DOM.  This way when
    the DOM is generated, it will have the correct initial values and will
    not require any additional setup.
    
    @returns {void}
  */
  awake: function() {
    arguments.callee.base.apply(this,arguments);
    var childViews = this.get('childViews'), len = childViews.length, idx ;
    for (idx=0; idx<len; ++idx) {
      if (!childViews[idx]) continue ;
      childViews[idx].awake() ;
    } 
  },
    
  /** 
    You must call this method on a view to destroy the view (and all of its 
    child views). This will remove the view from any parent node, then make 
    sure that the DOM element managed by the view can be released by the 
    memory manager.
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
    
    this._destroy(); // core destroy method
    
    // remove from parent if found
    this.removeFromParent() ;
    
    // unregister for drags
    if (this.get('isDropTarget')) SC.Drag.removeDropTarget(this) ;
    
    // unregister for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.removeScrollableView(this) ;
    
    //Do generic destroy. It takes care of mixins and sets isDestroyed to YES.
    arguments.callee.base.apply(this,arguments);
    return this; // done with cleanup
  },
  
  _destroy: function() {
    if (this.get('isDestroyed')) return this ; // nothing to do
    
    // destroy the layer -- this will avoid each child view destroying 
    // the layer over and over again...
    this.destroyLayer() ; 
    
    // first destroy any children.
    var childViews = this.get('childViews'), len = childViews.length, idx ;
    if (len) {
      childViews = childViews.slice() ;
      for (idx=0; idx<len; ++idx) childViews[idx].destroy() ;
    }
    
    // next remove view from global hash
    delete SC.View.views[this.get('layerId')] ;
    delete this._CQ ; 
    delete this.page ;
    
    return this ;
  },
  
  /** 
    This method is called when your view is first created to setup any  child 
    views that are already defined on your class.  If any are found, it will 
    instantiate them for you.
    
    The default implementation of this method simply steps through your 
    childViews array, which is expects to either be empty or to contain View 
    designs that can be instantiated
    
    Alternatively, you can implement this method yourself in your own 
    subclasses to look for views defined on specific properties and then build
     a childViews array yourself.
    
    Note that when you implement this method yourself, you should never 
    instantiate views directly.  Instead, you should use 
    this.createChildView() method instead.  This method can be much faster in 
    a production environment than creating views yourself.
    
    @returns {SC.View} receiver
  */
  createChildViews: function() {
    var childViews = this.get('childViews'), 
        len        = childViews.length, 
        idx, key, views, view ;
    
    this.beginPropertyChanges() ;
    
    // swap the array
    for (idx=0; idx<len; ++idx) {
      if (key = (view = childViews[idx])) {

        // is this is a key name, lookup view class
        if (typeof key === SC.T_STRING) {
          view = this[key];
        } else key = null ;
        
        if (!view) {
          console.error ("No view with name "+key+" has been found in "+this.toString());
          // skip this one.
          continue;
        }
        
        if (view.isClass) {
          view = this.createChildView(view) ; // instantiate if needed
          if (key) this[key] = view ; // save on key name if passed
        } 
      }
      childViews[idx] = view;
    }
    
    this.endPropertyChanges() ;
    return this ;
  },
  
  /**
    Instantiates a view to be added to the childViews array during view 
    initialization. You generally will not call this method directly unless 
    you are overriding createChildViews(). Note that this method will 
    automatically configure the correct settings on the new view instance to 
    act as a child of the parent.
    
    @param {Class} viewClass
    @param {Hash} attrs optional attributes to add
    @returns {SC.View} new instance
    @test in createChildViews
  */
  createChildView: function(view, attrs) {
    // attrs should always exist...
    if (!attrs) attrs = {} ;
    attrs.owner = attrs.parentView = this ;
    attrs.isVisibleInWindow = this.get('isVisibleInWindow');
    if (!attrs.page) attrs.page = this.page ;
    
    // Now add this to the attributes and create.
    view = view.create(attrs) ;
    return view ;
  },
  
  // ...........................................
  // LAYOUT
  //

  /**
    The 'frame' property depends on the 'layout' property as well as the
    parent view’s frame.  In order to properly invalidate any cached values,
    we need to invalidate the cache whenever 'layout' changes.  However,
    observing 'layout' does not guarantee that; the observer might not be run
    immediately.
    
    In order to avoid any window of opportunity where the cached frame could
    be invalid, we need to force layoutDidChange() to always immediately run
    whenever 'layout' is set.
  */
  propertyDidChange: function(key, value, _keepCache) {
    // If the key is 'layout', we need to call layoutDidChange() immediately
    // so that if the frame has changed any cached values (for both this view
    // and any child views) can be appropriately invalidated.
    
    // To allow layout to be a computed property, we check if any property has 
    // changed and if layout is dependent on the property. 
    // If it is we call layoutDidChange. 
    var layoutChange=false;
    if(typeof this.layout === "function" && this._kvo_dependents) {
      var dependents = this._kvo_dependents[key];
      if(dependents && dependents.indexOf('layout')!=-1) layoutChange = true;
    }
    if(key==='layout' || layoutChange) this.layoutDidChange();
    // Resume notification as usual.
    arguments.callee.base.apply(this,arguments);
  },


  /** 
    This convenience method will take the current layout, apply any changes
    you pass and set it again.  It is more convenient than having to do this
    yourself sometimes.
    
    You can pass just a key/value pair or a hash with several pairs.  You can
    also pass a null value to delete a property.
    
    This method will avoid actually setting the layout if the value you pass
    does not edit the layout.
    
    @param {String|Hash} key
    @param {Object} value
    @returns {SC.View} receiver
  */
  adjust: function(key, value) {
    var layout = SC.clone(this.get('layout')), didChange = NO, cur ;
    
    if (key === undefined) return this ; // nothing to do.
    
    // handle string case
    if (SC.typeOf(key) === SC.T_STRING) {
      cur = layout[key] ;
      if (SC.none(value)) {
        if (cur !== undefined) didChange = YES ;
        delete layout[key] ;
      } else {
        if (cur !== value) didChange = YES ;
        layout[key] = value ;
      }
      
    // handle hash -- do it this way to avoid creating memory unless needed
    } else {
      var hash = key;
      for(key in hash) {
        if (!hash.hasOwnProperty(key)) continue;
        value = hash[key] ;
        cur = layout[key] ;
        
        if (value === null) {
          if (cur !== undefined) didChange = YES ;
          delete layout[key] ;
        } else if (value !== undefined) {
          if (cur !== value) didChange = YES ;
          layout[key] = value ;
        }
      }
    }
    // now set adjusted layout
    if (didChange) this.set('layout', layout) ;
    
    return this ;
  },
  
  /** 
    The layout describes how you want your view to be positions on the 
    screen.  You can define the following properties:
    
    - left: the left edge
    - top: the top edge
    - right: the right edge
    - bottom: the bottom edge
    - height: the height
    - width: the width
    - centerX: an offset from center X 
    - centerY: an offset from center Y
    - minWidth: a minimum width
    - minHeight: a minimum height
    - maxWidth: a maximum width
    - maxHeight: a maximum height
    
    Note that you can only use certain combinations to set layout.  For 
    example, you may set left/right or left/width, but not left/width/right,
    since that combination doesn't make sense.
    
    Likewise, you may set a minWidth/minHeight, or maxWidth/maxHeight, but
    if you also set the width/height explicitly, then those constraints won't
    matter as much.
    
    Layout is designed to maximize reliance on the browser's rendering 
    engine to keep your app up to date.
    
    @test in layoutStyle
  */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },
  
  /**
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.
    
    Note that the context of a view's frame is the view's parent frame.  In
    other words, if you want to convert the frame of your view to the global
    frame, then you should do:
    
    {{{
      var pv = this.get('parentView'), frame = this.get('frame');
      var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;
    }}}
    
    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameToView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;
    
    // walk up this side
    while (view) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = view.get('layoutView') ; 
    }
    
    // walk up other size
    if (targetView) {
      view = targetView ;
      while (view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('layoutView') ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x + myX - targetX ;
    myY = frame.y + myY - targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },
  
  /**
    Converts a frame offset in the coordinates of another view system to the 
    receiver's view.
    
    Note that the convext of a view's frame is relative to the view's 
    parentFrame.  For example, if you want to convert the frame of view that
    belongs to another view to the receiver's frame you would do:
    
    {{{
      var frame = view.get('frame');
      var newFrame = this.convertFrameFromView(frame, view.get('parentView'));
    }}}
    
    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameFromView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;
    
    // walk up this side
    //Note: Intentional assignment of variable f
    while (view && (f = view.get('frame'))) {
      myX += f.x; myY += f.y ;
      view = view.get('parentView') ; 
    }
    
    // walk up other size
    if (targetView) {
      view = targetView ;
      while(view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('parentView') ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x - myX + targetX ;
    myY = frame.y - myY + targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },
  
  /**
    Attempt to scroll the view to visible.  This will walk up the parent
    view hierarchy looking looking for a scrollable view.  It will then 
    call scrollToVisible() on it.
    
    Returns YES if an actual scroll took place, no otherwise.
    
    @returns {Boolean} 
  */
  scrollToVisible: function() {
    var pv = this.get('parentView');
    while(pv && !pv.get('isScrollable')) pv = pv.get('parentView');
    
    // found view, first make it scroll itself visible then scroll this.
    if (pv) {
      pv.scrollToVisible();
      return pv.scrollToVisible(this);
    } else return NO ;
  },
  
  /**
    Frame describes the current bounding rect for your view.  This is always
    measured from the top-left corner of the parent view.
    
    @property {Rect}
    @test in layoutStyle
  */
  frame: function() {
    return this.computeFrameWithParentFrame(null) ;
  }.property('useStaticLayout').cacheable(),    // We depend on the layout, but layoutDidChange will call viewDidChange to check the frame for us
  
  /**
    Computes what the frame of this view would be if the parent were resized
    to the passed dimensions.  You can use this method to project the size of
    a frame based on the resize behavior of the parent.
    
    This method is used especially by the scroll view to automatically 
    calculate when scrollviews should be visible.
  
    Passing null for the parent dimensions will use the actual current 
    parent dimensions.  This is the same method used to calculate the current
    frame when it changes.
    
    @param {Rect} pdim the projected parent dimensions
    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function(pdim) {
    var layout = this.get('layout'),
        f = {} , error, layer, AUTO = SC.LAYOUT_AUTO,
        stLayout = this.get('useStaticLayout'),
        pv = this.get('parentView'),
        dH, dW, //shortHand for parentDimensions
        borderTop, borderLeft,
        lR = layout.right, 
        lL = layout.left, 
        lT = layout.top, 
        lB = layout.bottom, 
        lW = layout.width, 
        lH = layout.height, 
        lcX = layout.centerX, 
        lcY = layout.centerY;

    if (lW !== undefined &&
        lW === SC.LAYOUT_AUTO &&
        stLayout !== undefined && !stLayout) {
      error = SC.Error.desc(("%@.layout() cannot use width:auto if "+
                "staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
      console.error(error.toString()) ;
      throw error ;
    }
    
    if (lH !== undefined &&
        lH === SC.LAYOUT_AUTO &&
        stLayout !== undefined && !stLayout) {
       error = SC.Error.desc(("%@.layout() cannot use height:auto if "+
                "staticLayout is disabled").fmt(this),"%@".fmt(this), -1);
       console.error(error.toString())  ;
      throw error ;
    }
    
    if (stLayout) {
      // need layer to be able to compute rect
      if (layer = this.get('layer')) {
        f = SC.viewportOffset(layer); // x,y
        if (pv) f = pv.convertFrameFromView(f, null);
        
        /*
          TODO Can probably have some better width/height values - CC
        */
        f.width = layer.offsetWidth;
        f.height = layer.offsetHeight;
        return f;
      }
      return null; // can't compute
    }
    

    if (!pdim) pdim = this.computeParentDimensions(layout) ;
    dH = pdim.height;
    dW = pdim.width;
    
    
    // handle left aligned and left/right 
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)){
        f.x = dW*lL;
      }else{
        f.x = lL ;
      }
      if (lW !== undefined) {
        if(lW === AUTO) f.width = AUTO ;
        else if(SC.isPercentage(lW)) f.width = dW*lW ;
        else f.width = lW ;
      } else { // better have lR!
        f.width = dW - f.x ;
        if(lR && SC.isPercentage(lR)) f.width = f.width - (lR*dW) ;
        else f.width = f.width - (lR || 0) ;
      }
    // handle right aligned
    } else if (!SC.none(lR)) {
      if (SC.none(lW)) {
        if (SC.isPercentage(lR)) {
          f.width = dW - (dW*lR) ;
        }
        else f.width = dW - lR ;
        f.x = 0 ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        else if(SC.isPercentage(lW)) f.width = dW*lW ;
        else f.width = (lW || 0) ;
        if (SC.isPercentage(lW)) f.x = dW - (lR*dW) - f.width ;
        else f.x = dW - lR - f.width ;
      }
      
    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW === AUTO) f.width = AUTO ;
      else if (SC.isPercentage(lW)) f.width = lW*dW ;
      else f.width = (lW || 0) ;
      if(SC.isPercentage(lcX)) f.x = (dW - f.width)/2 + (lcX*dW) ;
      else f.x = (dW - f.width)/2 + lcX ;
    } else {
      f.x = 0 ; // fallback
      if (SC.none(lW)) {
        f.width = dW ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        if (SC.isPercentage(lW)) f.width = lW*dW ;
        else f.width = (lW || 0) ;
      }
    }
    
    // handle top aligned and top/bottom 
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) f.y = lT*dH ;
      else f.y = lT ;
      if (lH !== undefined) {
        if(lH === AUTO) f.height = AUTO ;
        else if(SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH ;
      } else { // better have lB!
        if(lB && SC.isPercentage(lB)) f.height = dH - f.y - (lB*dH) ;
        else f.height = dH - f.y - (lB || 0) ;
      }
      
    // handle bottom aligned
    } else if (!SC.none(lB)) {
      if (SC.none(lH)) {
        if (SC.isPercentage(lB)) f.height = dH - (lB*dH) ;
        else f.height = dH - lB ;
        f.y = 0 ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = (lH || 0) ;
        if (SC.isPercentage(lB)) f.y = dH - (lB*dH) - f.height ;
        else f.y = dH - lB - f.height ;
      }
      
    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH === AUTO) f.height = AUTO ;
      if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
      else f.height = (lH || 0) ;
      if (SC.isPercentage(lcY)) f.y = (dH - f.height)/2 + (lcY*dH) ;
      else f.y = (dH - f.height)/2 + lcY ;
      
    // fallback
    } else {
      f.y = 0 ; // fallback
      if (SC.none(lH)) {
        f.height = dH ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH || 0 ;
      }
    }
    
    f.x = Math.floor(f.x);
    f.y = Math.floor(f.y);
    if(f.height !== AUTO) f.height = Math.floor(f.height);
    if(f.width !== AUTO) f.width = Math.floor(f.width);
    
    // if width or height were set to auto and we have a layer, try lookup
    if (f.height === AUTO || f.width === AUTO) {
      layer = this.get('layer');
      if (f.height === AUTO) f.height = layer ? layer.clientHeight : 0;
      if (f.width === AUTO) f.width = layer ? layer.clientWidth : 0;
    }
    
    // views with SC.Border mixin applied applied
    if (this.get('hasBorder')) {
      borderTop = this.get('borderTop');
      borderLeft = this.get('borderLeft');
      f.height -= borderTop+this.get('borderBottom');
      f.y += borderTop;
      f.width -= borderLeft+this.get('borderRight');
      f.x += borderLeft;
    }

    // Account for special cases inside ScrollView, where we adjust the
    // element's scrollTop/scrollLeft property for performance reasons.
    if (pv && pv.isScrollContainer) {
      pv = pv.get('parentView');
      f.x -= pv.get('horizontalScrollOffset');
      f.y -= pv.get('verticalScrollOffset');
    }

    // make sure the width/height fix min/max...
    if (!SC.none(layout.maxHeight) && (f.height > layout.maxHeight)) {
      f.height = layout.maxHeight ;
    }

    if (!SC.none(layout.minHeight) && (f.height < layout.minHeight)) {
      f.height = layout.minHeight ;
    }

    if (!SC.none(layout.maxWidth) && (f.width > layout.maxWidth)) {
      f.width = layout.maxWidth ;
    }
    
    if (!SC.none(layout.minWidth) && (f.width < layout.minWidth)) {
      f.width = layout.minWidth ;
    }
    
    // make sure width/height are never < 0
    if (f.height < 0) f.height = 0 ;
    if (f.width < 0) f.width = 0 ;
    
    return f;
  },
  
  computeParentDimensions: function(frame) {
    var ret, pv = this.get('parentView'), pf = (pv) ? pv.get('frame') : null ;
    
    if (pf) {
      ret = { width: pf.width, height: pf.height };
    } else {
      var f = frame ;
      ret = {
        width: (f.left || 0) + (f.width || 0) + (f.right || 0),
        height: (f.top || 0) + (f.height || 0) + (f.bottom || 0)
      };
    }
    return ret ;
  },
  
  /**
    The clipping frame returns the visible portion of the view, taking into
    account the contentClippingFrame of the parent view.  Keep in mind that 
    the clippingFrame is in the context of the view itself, not it's parent 
    view.
    
    Normally this will be calculated based on the intersection of your own 
    clippingFrame and your parentView's contentClippingFrame.  

    @property {Rect}
  */
  clippingFrame: function() {
    var f = this.get('frame'),
        ret = f,
        pv, cf;
    
    if (!f) return null;
    pv = this.get('parentView');
    if (pv) {
      cf = pv.get('contentClippingFrame');
      if (!cf) return f;
      ret = SC.intersectRects(cf, f);
    } 
    ret.x -= f.x;
    ret.y -= f.y;
    
    return ret;
  }.property('parentView', 'frame').cacheable(),
  
  /**
    The clipping frame child views should intersect with.  Normally this is 
    the same as the regular clippingFrame.  However, you may override this 
    method if you want the child views to actually draw more or less content
    than is actually visible for some reason.
    
    Usually this is only used by the ScrollView to optimize drawing on touch
    devices.
    
    @property {Rect}
  */
  contentClippingFrame: function() {
    return this.get('clippingFrame');
  }.property('clippingFrame').cacheable(),

  /** @private
    This method is invoked whenever the clippingFrame changes, notifying
    each child view that its clippingFrame has also changed.
  */
  _sc_view_clippingFrameDidChange: function() {
    var cvs = this.get('childViews'), len = cvs.length, idx, cv ;
    for (idx=0; idx<len; ++idx) {
      cv = cvs[idx] ;
      
      // In SC 1.0 views with static layout did not receive notifications 
      // of frame changes because they didn't support frames.  In SC 1.1 they
      // do support frames, so they should receive notifications.  Also in
      // SC 1.1 SC.StaticLayout is merged into SC.View.  The mixin is only 
      // for compatibility.  This property is defined on the mixin. 
      //
      // frame changes should be sent all the time unless this property is 
      // present to indicate that we want the old 1.0 API behavior instead.
      // 
      if (!cv.hasStaticLayout) {
        cv.notifyPropertyChange('clippingFrame') ;
        cv._sc_view_clippingFrameDidChange();
      }
    }
  },
    
  /** 
    This method may be called on your view whenever the parent view resizes.
    
    The default version of this method will reset the frame and then call 
    viewDidResize().  You will not usually override this method, but you may
    override the viewDidResize() method.
    
    @returns {void}
    @test in viewDidResize
  */
  parentViewDidResize: function() {
    var frameMayHaveChanged, layout, isFixed, isPercentageFunc, isPercentage;

    // If this view uses static layout, our "do we think the frame changed?"
    // logic is not applicable and we simply have to assume that the frame may
    // have changed.
    if (this.useStaticLayout) {
      frameMayHaveChanged = YES;
    }
    else {
      layout = this.get('layout');
    
      // only resizes if the layout does something other than left/top - fixed
      // size.
      isFixed = (
        (layout.left !== undefined) && (layout.top !== undefined) &&
        (layout.width !== undefined) && (layout.height !== undefined)
      );


      // If it's fixed, our frame still could have changed if it's fixed to a
      // percentage of the parent.
      if (isFixed) {
        isPercentageFunc = SC.isPercentage;
        isPercentage = (isPercentageFunc(layout.left) || 
                        isPercentageFunc(layout.top) ||
                        isPercentageFunc(layout.width) || 
                        isPercentageFunc(layout.right) ||
                        isPercentageFunc(layout.centerX) || 
                        isPercentageFunc(layout.centerY));
      }

      frameMayHaveChanged = (!isFixed || isPercentage);
    }

    // Do we think there's a chance our frame will have changed as a result?
    if (frameMayHaveChanged) {
      // There's a chance our frame changed.  Invoke viewDidResize(), which
      // will notify about our change to 'frame' (if it actually changed) and
      // appropriately notify our child views.
      this.viewDidResize();
    }
  },



  /**
    This method is invoked on your view when the view resizes due to a layout
    change or potentially due to the parent view resizing (if your view’s size
    depends on the size of your parent view).  You can override this method
    to implement your own layout if you like, such as performing a grid 
    layout.
    
    The default implementation simply notifies about the change to 'frame' and
    then calls parentViewDidResize on all of your children.
    
    @returns {void}
  */
  viewDidResize: function() {
    this._viewFrameDidChange();

    // Also notify our children.
    var cv = this.childViews, len = cv.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = cv[idx];
      view.parentViewDidResize();
    }
  },

  /** @private
    Invoked by other views to notify this view that its frame has changed.

    This notifies the view that its frame property has changed,
    then propagates those changes to its child views.
  */
  _viewFrameDidChange: function() {
    this.notifyPropertyChange('frame');
    this._sc_view_clippingFrameDidChange();
  },

  // Implementation note: As a general rule, paired method calls, such as 
  // beginLiveResize/endLiveResize that are called recursively on the tree
  // should reverse the order when doing the final half of the call. This 
  // ensures that the calls are propertly nested for any cleanup routines.
  //
  // -> View A.beginXXX()
  //   -> View B.beginXXX()
  //     -> View C.begitXXX()
  //   -> View D.beginXXX()
  //
  // ...later on, endXXX methods are called in reverse order of beginXXX...
  //
  //   <- View D.endXXX()
  //     <- View C.endXXX()
  //   <- View B.endXXX()
  // <- View A.endXXX()
  //
  // See the two methods below for an example implementation.
  
  /**
    Call this method when you plan to begin a live resize.  This will 
    notify the receiver view and any of its children that are interested
    that the resize is about to begin.
    
    @returns {SC.View} receiver
    @test in viewDidResize
  */
  beginLiveResize: function() {
    // call before children have been notified...
    if (this.willBeginLiveResize) this.willBeginLiveResize() ;
    
    // notify children in order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = ary[idx] ;
      if (view.beginLiveResize) view.beginLiveResize();
    }
    return this ;
  },
  
  /**
    Call this method when you are finished with a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the live resize has ended.
    
    @returns {SC.View} receiver
    @test in viewDidResize
  */
  endLiveResize: function() {
    // notify children in *reverse* order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=len-1; idx>=0; --idx) { // loop backwards
      view = ary[idx] ;
      if (view.endLiveResize) view.endLiveResize() ;
    }
    
    // call *after* all children have been notified...
    if (this.didEndLiveResize) this.didEndLiveResize() ;
    return this ;
  },

  /**
    Setting wantsAcceleratedLayer to YES will use 3d transforms to move the
    layer when available.
  */
  wantsAcceleratedLayer: NO,

  /**
    Specifies whether 3d transforms can be used to move the layer.
  */
  hasAcceleratedLayer: function(){
    return this.get('wantsAcceleratedLayer') && SC.platform.supportsAcceleratedLayers;
  }.property('wantsAcceleratedLayer').cacheable(),


  /**
    layoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.
    
    Computes the layout style settings needed for the current anchor.
    
    @property {Hash}
    @readOnly
  */
  
  
  layoutStyle: function() {
    var layout = this.get('layout'), ret = {}, pdim = null, error, 
        AUTO = SC.LAYOUT_AUTO,
        dims = SC._VIEW_DEFAULT_DIMS, loc = dims.length, x, value, key,
        stLayout = this.get('useStaticLayout'),
        lR = layout.right, 
        lL = layout.left, 
        lT = layout.top, 
        lB = layout.bottom, 
        lW = layout.width, 
        lH = layout.height,
        lMW = layout.maxWidth,
        lMH = layout.maxHeight,
        lcX = layout.centerX, 
        lcY = layout.centerY,
        hasAcceleratedLayer = this.get('hasAcceleratedLayer'),
        translateTop = 0,
        translateLeft = 0;
    if (lW !== undefined && lW === SC.LAYOUT_AUTO && !stLayout) {
      error= SC.Error.desc("%@.layout() you cannot use width:auto if "+
              "staticLayout is disabled".fmt(this),"%@".fmt(this),-1);
      console.error(error.toString()) ;
      throw error ;
    }
    
    if (lH !== undefined && lH === SC.LAYOUT_AUTO && !stLayout) {
      error = SC.Error.desc("%@.layout() you cannot use height:auto if "+
                "staticLayout is disabled".fmt(this),"%@".fmt(this),-1);  
      console.error(error.toString()) ;
      throw error ;
    }

    // X DIRECTION
    
    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)) {
        ret.left = (lL*100)+"%";  //percentage left
      } else if (hasAcceleratedLayer && !SC.empty(lW)) {
        translateLeft = Math.floor(lL);
        ret.left = 0;
      } else {
        ret.left = Math.floor(lL); //px left
      }
      ret.marginLeft = 0 ;
      
      if (lW !== undefined) {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lW)) ret.width = (lW*100)+"%"; //percentage width
        else ret.width = Math.floor(lW) ; //px width
        ret.right = null ;
      } else {
        ret.width = null ;
        if(lR && SC.isPercentage(lR)) ret.right = (lR*100)+"%"; //percentage right
        else ret.right = Math.floor(lR || 0) ; //px right
      }
      
    // handle right aligned
    } else if (!SC.none(lR)) {
      if(SC.isPercentage(lR)) {
        ret.right = Math.floor(lR*100)+"%";  //percentage left
      }else{
        ret.right = Math.floor(lR) ;
      }
      ret.marginLeft = 0 ;
      
      if (SC.none(lW)) {
        if (SC.none(lMW)) ret.left = 0;
        ret.width = null;
      } else {
        ret.left = null ;
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(lW && SC.isPercentage(lW)) ret.width = (lW*100)+"%" ; //percentage width
        else ret.width = Math.floor(lW || 0) ; //px width
      }
      
    // handle centered
    } else if (!SC.none(lcX)) {
      ret.left = "50%";
      if(lW && SC.isPercentage(lW)) ret.width = (lW*100)+"%" ; //percentage width
      else ret.width = Math.floor(lW || 0) ;
      if(lW && SC.isPercentage(lW) && (SC.isPercentage(lcX) || SC.isPercentage(lcX*-1))){
        ret.marginLeft = Math.floor((lcX - lW/2)*100)+"%" ;
      }else if(lW && lW >= 1 && !SC.isPercentage(lcX)){
        ret.marginLeft = Math.floor(lcX - ret.width/2) ;
      }else {
        // This error message happens whenever width is not set.
        console.warn("You have to set width and centerX usign both percentages or pixels");
        ret.marginLeft = "50%";
      }
      ret.right = null ;
    
    // if width defined, assume top/left of zero
    } else if (!SC.none(lW)) {
      ret.left =  0;
      ret.right = null;
      if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
      else if(SC.isPercentage(lW)) ret.width = (lW*100)+"%";
      else ret.width = Math.floor(lW);
      ret.marginLeft = 0;
      
    // fallback, full width.
    } else {
      ret.left = 0;
      ret.right = 0;
      ret.width = null ;
      ret.marginLeft= 0;
    }
    
    
    // handle min/max
    ret.minWidth = (layout.minWidth === undefined) ? null : layout.minWidth ;
    ret.maxWidth = (layout.maxWidth === undefined) ? null : layout.maxWidth ;
    
    // Y DIRECTION
    
    // handle top aligned and left/right
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) {
        ret.top = (lT*100)+"%";
      } else if (hasAcceleratedLayer && !SC.empty(lH)) {
        translateTop = Math.floor(lT);
        ret.top = 0;
      } else {
        ret.top = Math.floor(lT);
      }
      if (lH !== undefined) {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lH)) ret.height = (lH*100)+"%" ;
        else ret.height = Math.floor(lH) ;
        ret.bottom = null ;
      } else {
        ret.height = null ;
        if(lB && SC.isPercentage(lB)) ret.bottom = (lB*100)+"%" ;
        else ret.bottom = Math.floor(lB || 0) ;
      }
      ret.marginTop = 0 ;
      
    // handle bottom aligned
    } else if (!SC.none(lB)) {
      ret.marginTop = 0 ;
      if(SC.isPercentage(lB)) ret.bottom = (lB*100)+"%";
      else ret.bottom = Math.floor(lB) ;
      if (SC.none(lH)) {
        if (SC.none(lMH)) ret.top = 0;
        ret.height = null ;
      } else {
        ret.top = null ;
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if(lH && SC.isPercentage(lH)) ret.height = (lH*100)+"%" ;
        else ret.height = Math.floor(lH || 0) ;
      }
      
    // handle centered
    } else if (!SC.none(lcY)) {
      ret.top = "50%";
      ret.bottom = null ;
      
      if(lH && SC.isPercentage(lH)) ret.height = (lH*100)+ "%" ;
      else ret.height = Math.floor(lH || 0) ;
      
      if(lH && SC.isPercentage(lH) && (SC.isPercentage(lcY) || SC.isPercentage(lcY*-1))){ //height is percentage and lcy too
        ret.marginTop = Math.floor((lcY - lH/2)*100)+"%" ;
      }else if(lH && lH >= 1 && !SC.isPercentage(lcY)){
        ret.marginTop = Math.floor(lcY - ret.height/2) ;
      }else {
        console.warn("You have to set height and centerY to use both percentages or pixels");
        ret.marginTop = "50%";
      }
    } else if (!SC.none(lH)) {
      ret.top = 0;
      ret.bottom = null;
      if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
      else if(lH && SC.isPercentage(lH)) ret.height = (lH*100)+"%" ;
      else ret.height = Math.floor(lH || 0) ;
      ret.marginTop = 0;
      
    // fallback, full width.
    } else {
      ret.top = 0;
      ret.bottom = 0;
      ret.height = null ;
      ret.marginTop= 0;
    }
    
    // handle min/max
    ret.minHeight = (layout.minHeight === undefined) ?
      null :
      layout.minHeight ;
    ret.maxHeight = (layout.maxHeight === undefined) ?
      null :
      layout.maxHeight ;
    
    // if zIndex is set, use it.  otherwise let default shine through
    ret.zIndex = SC.none(layout.zIndex) ? null : layout.zIndex.toString();
    
    // if backgroundPosition is set, use it.
    // otherwise let default shine through
    ret.backgroundPosition = SC.none(layout.backgroundPosition) ?
      null :
      layout.backgroundPosition.toString() ;
    
    // set default values to null to allow built-in CSS to shine through
    // currently applies only to marginLeft & marginTop
    while(--loc >=0) {
      x = dims[loc];
      if (ret[x]===0) ret[x]=null;
    }

    if (hasAcceleratedLayer) {
      var transform = 'translateX('+translateLeft+'px) translateY('+translateTop+'px)';
      if (SC.platform.supportsCSS3DTransforms) transform += ' translateZ(0px)'
      ret[SC.platform.domCSSPrefix+'Transform'] = transform;
    }

    // convert any numbers into a number + "px".
    for(key in ret) {
      value = ret[key];
      if (typeof value === SC.T_NUMBER) ret[key] = (value + "px");
    }
    return ret ;
  }.property().cacheable(),
  
  /**
    The view responsible for laying out this view.  The default version 
    returns the current parent view.
  */
  layoutView: function() {
    return this.get('parentView') ;
  }.property('parentView').cacheable(),
  
  /**
    This method is called whenever a property changes that invalidates the 
    layout of the view.  Changing the layout will do this automatically, but 
    you can add others if you want.

    Implementation Note:  In a traditional setup, we would simply observe
    'layout' here, but as described above in the documentation for our custom
    implementation of propertyDidChange(), this method must always run
    immediately after 'layout' is updated to avoid the potential for stale
    (incorrect) cached 'frame' values.
    
    @returns {SC.View} receiver
  */
  layoutDidChange: function() {
    // Did our layout change in a way that could cause us to be resized?  If
    // not, then there's no need to invalidate the frames of our child views.
    var previousLayout = this._previousLayout,
        currentLayout  = this.get('layout'),
        didResize      = YES,
        previousWidth, previousHeight, currentWidth, currentHeight;

    if (previousLayout  &&  previousLayout !== currentLayout) {
      // This is a simple check to see whether we think the view may have
      // resized.  We could look for a number of cases, but for now we'll
      // handle only one simple case:  if the width and height are both
      // specified, and they have not changed.
      previousWidth = previousLayout.width;
      if (previousWidth !== undefined) {
        currentWidth = currentLayout.width;
        if (previousWidth === currentWidth) {
          previousHeight = previousLayout.height;
          if (previousLayout !== undefined) {
            currentHeight = currentLayout.height;
            if (previousHeight === currentHeight) didResize = NO;
          }
        }
      }
    }

    this.beginPropertyChanges() ;
    this.notifyPropertyChange('layoutStyle') ;
    if (didResize) {
      this.viewDidResize();
    }
    else {
      // Even if we didn't resize, our frame might have changed.
      // viewDidResize() handles this in the other case.
      this._viewFrameDidChange();
    }
    this.endPropertyChanges() ;
    
    // notify layoutView...
    var layoutView = this.get('layoutView');
    if (layoutView) {
      layoutView.set('childViewsNeedLayout', YES);
      layoutView.layoutDidChangeFor(this) ;
      if (layoutView.get('childViewsNeedLayout')) {
        layoutView.invokeOnce(layoutView.layoutChildViewsIfNeeded);
      }
    }
    
    return this ;
  },
  
  /**
    This this property to YES whenever the view needs to layout its child
    views.  Normally this property is set automatically whenever the layout
    property for a child view changes.
    
    @property {Boolean}
  */
  childViewsNeedLayout: NO,
  
  /**
    One of two methods that are invoked whenever one of your childViews 
    layout changes.  This method is invoked everytime a child view's layout
    changes to give you a chance to record the information about the view.
      
    Since this method may be called many times during a single run loop, you
    should keep this method pretty short.  The other method called when layout
    changes, layoutChildViews(), is invoked only once at the end of 
    the run loop.  You should do any expensive operations (including changing
    a childView's actual layer) in this other method.
    
    Note that if as a result of running this method you decide that you do not
    need your layoutChildViews() method run later, you can set the 
    childViewsNeedsLayout property to NO from this method and the layout 
    method will not be called layer.
     
    @param {SC.View} childView the view whose layout has changed.
    @returns {void}
  */
  layoutDidChangeFor: function(childView) {
    var set = this._needLayoutViews ;
    if (!set) set = this._needLayoutViews = SC.CoreSet.create();
    set.add(childView);
  },
  
  /**
    Called your layout method if the view currently needs to layout some
    child views.
    
    @param {Boolean} isVisible if true assume view is visible even if it is not.
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  layoutChildViewsIfNeeded: function(isVisible) {
    if (!isVisible) isVisible = this.get('isVisibleInWindow');
    if (isVisible && this.get('childViewsNeedLayout')) {
      this.set('childViewsNeedLayout', NO);
      this.layoutChildViews();
    }
    return this ;
  },
  
  /**
    Applies the current layout to the layer.  This method is usually only
    called once per runloop.  You can override this method to provide your 
    own layout updating method if you want, though usually the better option
    is to override the layout method from the parent view.
    
    The default implementation of this method simply calls the renderLayout()
    method on the views that need layout.
    
    @returns {void}
  */
  layoutChildViews: function() {
    var set = this._needLayoutViews,
        len = set ? set.length : 0,
        i;
    for (i = 0; i < len; ++i) {
      set[i].updateLayout();
    }
    set.clear(); // reset & reuse
  },
  
  /**
    Invoked by the layoutChildViews method to update the layout on a 
    particular view.  This method creates a render context and calls the 
    renderLayout() method, which is probably what you want to override instead 
    of this.
    
    You will not usually override this method, but you may call it if you 
    implement layoutChildViews() in a view yourself.
    
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  updateLayout: function() {
    var layer = this.get('layer'), context;
    if (layer) {
      context = this.renderContext(layer);
      this.renderLayout(context);
      context.update();

      // If this view uses static layout, then notify if the frame changed.
      // (viewDidResize will do a comparison)
      if (this.useStaticLayout) this.viewDidResize();
    }
    layer = null ;
    return this ;
  },
  
  /**
    Default method called by the layout view to actually apply the current
    layout to the layer.  The default implementation simply assigns the 
    current layoutStyle to the layer.  This method is also called whenever
    the layer is first created.
    
    @param {SC.RenderContext} the render context
    @returns {void}
    @test in layoutChildViews
  */
  renderLayout: function(context, firstTime) {
    context.addStyle(this.get('layoutStyle'));
  },
  
  /** walk like a duck */
  isView: YES,
  
  /**
    Default method called when a selectstart event is triggered. This event is 
    only supported by IE. Used in sproutcore to disable text selection and 
    IE8 accelerators. The accelerators will be enabled only in 
    text selectable views. In FF and Safari we use the css style 'allow-select'.
    
    If you want to enable text selection in certain controls is recommended
    to override this function to always return YES , instead of setting 
    isTextSelectable to true. 
    
    For example in textfield you dont want to enable textSelection on the text
    hint only on the actual text you are entering. You can achieve that by
    only overriding this method.
    
    @param evt {SC.Event} the selectstart event
    @returns YES if selectable
  */
  selectStart: function(evt) {
    return this.get('isTextSelectable');
  },
  
  /**
    Used to block the contextMenu per view.
   
    @param evt {SC.Event} the contextmenu event
    @returns YES if the contextmenu can show up
  */
  contextMenu: function(evt) {
    if(!this.get('isContextMenuEnabled')) evt.stop();
    return true;
  },
  
  /**
    A boundary set of distances outside which the touch will not be considered "inside" the view anymore.
    
    By default, up to 50px on each side.
  */
  touchBoundary: { left: 50, right: 50, top: 50, bottom: 50 },
  
  /**
    @private
    A computed property based on frame.
  */
  _touchBoundaryFrame: function (){
    return this.get("parentView").convertFrameToView(this.get('frame'), null);
  }.property("frame", "parentView").cacheable(),
  
  /**
    Returns YES if the provided touch is within the boundary.
  */
  touchIsInBoundary: function(touch) {
    var f = this.get("_touchBoundaryFrame"), maxX = 0, maxY = 0, boundary = this.get("touchBoundary");
    var x = touch.pageX, y = touch.pageY;
    
    if (x < f.x) {
      x = f.x - x;
      maxX = boundary.left;
    } else if (x > f.x + f.width) {
      x = x - (f.x + f.width);
      maxX = boundary.right;
    } else {
      x = 0;
      maxX = 1;
    }
    
    if (y < f.y) {
      y = f.y - y;
      maxY = boundary.top;
    } else if (y > f.y + f.height) {
      y = y - (f.y + f.height);
      maxY = boundary.bottom;
    } else {
      y = 0;
      maxY = 1;
    }
    
    if (x > 100 || y > 100) return NO;
    return YES;
  }
});

SC.View.mixin(/** @scope SC.View */ {
  
  /** @private walk like a duck -- used by SC.Page */
  isViewClass: YES,
  
  /**
    This method works just like extend() except that it will also preserve
    the passed attributes in case you want to use a view builder later, if 
    needed.
    
    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.View subclass to create
    @function
  */ 
  design: function() {
    if (this.isDesign) return this; // only run design one time
    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES ;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret ;
  },
  
  /**
    Helper applies the layout to the prototype. 
  */
  layout: function(layout) {
    this.prototype.layout = layout ;
    return this ;
  },
  
  /**
    Convert any layout to a Top, Left, Width, Height layout
  */
  convertLayoutToAnchoredLayout: function(layout, parentFrame){
    var ret = {top: 0, left: 0, width: parentFrame.width, height: parentFrame.height},
        pFW = parentFrame.width, pFH = parentFrame.height, //shortHand for parentDimensions
        lR = layout.right, 
        lL = layout.left, 
        lT = layout.top, 
        lB = layout.bottom, 
        lW = layout.width, 
        lH = layout.height, 
        lcX = layout.centerX, 
        lcY = layout.centerY;
    
    // X Conversion
    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)) ret.left = lL*pFW;
      else ret.left = lL;
      if (lW !== undefined) {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lW)) ret.width = lW*pFW ;
        else ret.width = lW ;
      } else {
        if (lR && SC.isPercentage(lR)) ret.width = pFW - ret.left - (lR*pFW);
        else ret.width = pFW - ret.left - (lR || 0);
      }

    // handle right aligned
    } else if (!SC.none(lR)) {
      
      // if no width, calculate it from the parent frame
      if (SC.none(lW)) {
        ret.left = 0;
        if(lR && SC.isPercentage(lR)) ret.width = pFW - (lR*pFW);
        else ret.width = pFW - (lR || 0);
      
      // If has width, calculate the left anchor from the width and right and parent frame
      } else {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else { 
          if (SC.isPercentage(lW)) ret.width = lW*pFW;
          else ret.width = lW;
          if (SC.isPercentage(lR)) ret.left = pFW - (ret.width + lR);
          else ret.left = pFW - (ret.width + lR); 
        }
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW && SC.isPercentage(lW)) ret.width = (lW*pFW) ;
      else ret.width = (lW || 0) ;
      ret.left = ((pFW - ret.width)/2);
      if (SC.isPercentage(lcX)) ret.left = ret.left + lcX*pFW;
      else ret.left = ret.left + lcX;
    
    // if width defined, assume left of zero
    } else if (!SC.none(lW)) {
      ret.left =  0;
      if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
      else {
        if(SC.isPercentage(lW)) ret.width = lW*pFW;
        else ret.width = lW;
      }

    // fallback, full width.
    } else {
      ret.left = 0;
      ret.width = 0;
    }

    // handle min/max
    if (layout.minWidth !== undefined) ret.minWidth = layout.minWidth ;
    if (layout.maxWidth !== undefined) ret.maxWidth = layout.maxWidth ; 
    
    // Y Conversion
    // handle left aligned and top/bottom
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) ret.top = lT*pFH;
      else ret.top = lT;
      if (lH !== undefined) {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if (SC.isPercentage(lH)) ret.height = lH*pFH;
        else ret.height = lH ;
      } else {
        ret.height = pFH - ret.top;
        if(lB && SC.isPercentage(lB)) ret.height = ret.height - (lB*pFH);
        else ret.height = ret.height - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      
      // if no height, calculate it from the parent frame
      if (SC.none(lH)) {
        ret.top = 0;
        if (lB && SC.isPercentage(lB)) ret.height = pFH - (lB*pFH);
        else ret.height = pFH - (lB || 0);
      
      // If has height, calculate the top anchor from the height and bottom and parent frame
      } else {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else { 
          if (SC.isPercentage(lH)) ret.height = lH*pFH;
          else ret.height = lH;
          ret.top = pFH - ret.height;
          if (SC.isPercentage(lB)) ret.top = ret.top - (lB*pFH);
          else ret.top = ret.top - lB; 
        }
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH && SC.isPercentage(lH)) ret.height = (lH*pFH) ;
      else ret.height = (lH || 0) ;
      ret.top = ((pFH - ret.height)/2);
      if(SC.isPercentage(lcY)) ret.top = ret.top + lcY*pFH;
      else ret.top = ret.top + lcY;
    
    // if height defined, assume top of zero
    } else if (!SC.none(lH)) {
      ret.top =  0;
      if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
      else if (SC.isPercentage(lH)) ret.height = lH*pFH;
      else ret.height = lH;

    // fallback, full height.
    } else {
      ret.top = 0;
      ret.height = 0;
    }
    
    if(ret.top) ret.top = Math.floor(ret.top);
    if(ret.bottom) ret.bottom = Math.floor(ret.bottom);
    if(ret.left) ret.left = Math.floor(ret.left);
    if(ret.right) ret.right = Math.floor(ret.right);
    if(ret.width !== SC.LAYOUT_AUTO) ret.width = Math.floor(ret.width);
    if(ret.height !== SC.LAYOUT_AUTO) ret.height = Math.floor(ret.height);

    // handle min/max
    if (layout.minHeight !== undefined) ret.minHeight = layout.minHeight ;
    if (layout.maxHeight !== undefined) ret.maxHeight = layout.maxHeight ;
    
    return ret;
  },
  
  /**
    For now can only convert Top/Left/Width/Height to a Custom Layout
  */
  convertLayoutToCustomLayout: function(layout, layoutParams, parentFrame){
    // TODO: [EG] Create Top/Left/Width/Height to a Custom Layout conversion
  },
  
  /**
    Helper applies the classNames to the prototype
  */
  classNames: function(sc) {
    sc = (this.prototype.classNames || []).concat(sc);
    this.prototype.classNames = sc;
    return this ;
  },
  
  /**
    Help applies the tagName
  */
  tagName: function(tg) {
    this.prototype.tagName = tg;
    return this ;
  },
  
  /**
    Helper adds the childView
  */
  childView: function(cv) {
    var childViews = this.prototype.childViews || [];
    if (childViews === this.superclass.prototype.childViews) {
      childViews = childViews.slice();
    }
    childViews.push(cv) ;
    this.prototype.childViews = childViews;
    return this ;
  },
  
  /**
    Helper adds a binding to a design
  */
  bind: function(keyName, path) {
    var p = this.prototype, s = this.superclass.prototype;
    var bindings = p._bindings ;
    if (!bindings || bindings === s._bindings) {
      bindings = p._bindings = (bindings || []).slice() ;
    }  
    
    keyName = keyName + "Binding";
    p[keyName] = path ;
    bindings.push(keyName);
    
    return this ;
  },

  /**
    Helper sets a generic property on a design.
  */
  prop: function(keyName, value) {
    this.prototype[keyName] = value;
    return this ;
  },
  
  /**
    Used to construct a localization for a view.  The default implementation
    will simply return the passed attributes.
  */
  localization: function(attrs, rootElement) { 
    // add rootElement
    if (rootElement) attrs.rootElement = SC.$(rootElement)[0];
    return attrs; 
  },
  
  /**
    Creates a view instance, first finding the DOM element you name and then
    using that as the root element.  You should not use this method very 
    often, but it is sometimes useful if you want to attach to already 
    existing HTML.
    
    @param {String|Element} element
    @param {Hash} attrs
    @returns {SC.View} instance
  */
  viewFor: function(element, attrs) {
    var args = SC.$A(arguments); // prepare to edit
    if (SC.none(element)) {
      args.shift(); // remove if no element passed
    } else args[0] = { rootElement: SC.$(element)[0] } ;
    var ret = this.create.apply(this, arguments) ;
    args = args[0] = null;
    return ret ;
  },
    
  /**
    Create a new view with the passed attributes hash.  If you have the 
    Designer module loaded, this will also create a peer designer if needed.
  */
  create: function() {
    var C=this, ret = new C(arguments); 
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didCreateView(ret, SC.$A(arguments));
    }
    return ret ; 
  },
  
  /**
    Applies the passed localization hash to the component views.  Call this
    method before you call create().  Returns the receiver.  Typically you
    will do something like this:
    
    view = SC.View.design({...}).loc(localizationHash).create();
    
    @param {Hash} loc 
    @param rootElement {String} optional rootElement with prepped HTML
    @returns {SC.View} receiver
  */
  loc: function(loc) {
    var childLocs = loc.childViews;
    delete loc.childViews; // clear out child views before applying to attrs
    
    this.applyLocalizedAttributes(loc) ;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadLocalization(this, SC.$A(arguments));
    }
    
    // apply localization recursively to childViews
    var childViews = this.prototype.childViews, idx = childViews.length,
      viewClass;
    while(--idx>=0) {
      viewClass = childViews[idx];
      loc = childLocs[idx];
      if (loc && viewClass && viewClass.loc) viewClass.loc(loc) ;
    }
    
    return this; // done!
  },
  
  /**
    Internal method actually updates the localizated attributes on the view
    class.  This is overloaded in design mode to also save the attributes.
  */
  applyLocalizedAttributes: function(loc) {
    SC.mixin(this.prototype, loc) ;
  },
  
  views: {}
    
}) ;

// .......................................................
// OUTLET BUILDER
//

/** 
  Generates a computed property that will look up the passed property path
  the first time you try to get the value.  Use this whenever you want to 
  define an outlet that points to another view or object.  The root object
  used for the path will be the receiver.
*/
SC.outlet = function(path, root) {
  return function(key) {
    return (this[key] = SC.objectForPropertyPath(path, (root !== undefined) ? root : this)) ;
  }.property();
};

/** @private on unload clear cached divs. */
SC.View.unload = function() {
  // delete view items this way to ensure the views are cleared.  The hash
  // itself may be owned by multiple view subclasses.
  var views = SC.View.views;
  if (views) {
   for(var key in views) {
     if (!views.hasOwnProperty(key)) continue ;
     delete views[key];
   }
  }   
} ;

//unload views for IE, trying to collect memory.
if(SC.browser.msie) SC.Event.add(window, 'unload', SC.View, SC.View.unload) ;

/* >>>>>>>>>> BEGIN source/mixins/responder_context.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/responder');

/** @namespace

  The root object for a responder chain.  A responder context can dispatch
  actions directly to a first responder; walking up the responder chain until
  it finds a responder that can handle the action.  
  
  If no responder can be found to handle the action, it will attempt to send
  the action to the defaultResponder.
  
  You can have as many ResponderContext's as you want within your application.
  Every SC.Pane and SC.Application automatically implements this mixin.
  
  Note that to implement this, you should mix SC.ResponderContext into an
  SC.Responder or SC.Responder subclass.

  @since SproutCore 1.0
*/
SC.ResponderContext = {

  // ..........................................................
  // PROPERTIES
  // 
  
  isResponderContext: YES,
  
  /** @property
  
    When set to YES, logs tracing information about all actions sent and 
    responder changes.
  */
  trace: NO,
  
  /** @property
    The default responder.  Set this to point to a responder object that can 
    respond to events when no other view in the hierarchy handles them.
    
    @type SC.Responder
  */
  defaultResponder: null,
  
  /** @property
    The next responder for an app is always its defaultResponder.
  */
  nextResponder: function() {
    return this.get('defaultResponder');
  }.property('defaultResponder').cacheable(),
  
  /** @property
    The first responder.  This is the first responder that should receive 
    actions.
  */
  firstResponder: null,

  // ..........................................................
  // METHODS
  // 

  /**
    Finds the next responder for the passed responder based on the responder's
    nextResponder property.  If the property is a string, then lookup the path
    in the receiver.
  */
  nextResponderFor: function(responder) {
    var next = responder.get('nextResponder');
    if (typeof next === SC.T_STRING) {
      next = SC.objectForPropertyPath(next, this);
    } else if (!next && (responder !== this)) next = this ;
    return next ;  
  },

  /**
    Finds the responder name by searching the responders one time.
  */
  responderNameFor: function(responder) {
    if (!responder) return "(No Responder)";
    else if (responder._scrc_name) return responder._scrc_name;
    
    // none found, let's go hunting...look three levels deep
    var n = this.NAMESPACE;
    this._findResponderNamesFor(this, 3, n ? [this.NAMESPACE] : []);
    
    return responder._scrc_name || responder.toString(); // try again
  },
  
  _findResponderNamesFor: function(responder, level, path) {
    var key, value;
    
    for(key in responder) {
      if (key === 'nextResponder') continue ;
      value = responder[key];
      if (value && value.isResponder) {
        if (value._scrc_name) continue ;
        path.push(key);
        value._scrc_name = path.join('.');
        if (level>0) this._findResponderNamesFor(value, level-1, path);
        path.pop();
      }
    }
  },
  
  /**
    Makes the passed responder into the new firstResponder for this 
    responder context.  This will cause the current first responder to lose 
    its responder status and possibly keyResponder status as well.
    
    When you change the first responder, this will send callbacks to 
    responders up the chain until you reach a shared responder, at which point
    it will stop notifying.
    
    @param {SC.Responder} responder
    @param {Event} evt that cause this to become first responder
    @returns {SC.ResponderContext} receiver
  */
  makeFirstResponder: function(responder, evt) {
    var current = this.get('firstResponder'), 
        last    = this.get('nextResponder'),
        trace   = this.get('trace'),
        common ;

    if (this._locked) {
      if (trace) {
        console.log('%@: AFTER ACTION: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
      }

      this._pendingResponder = responder;
      return ;
    }
    
    if (trace) {
      console.log('%@: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
    }
    
    if (responder) responder.set("becomingFirstResponder", YES);
    
    this._locked = YES;
    this._pendingResponder = null;
    
    // Find the nearest common responder in the responder chain for the new
    // responder.  If there are no common responders, use last responder.
    // Note: start at the responder itself: it could be the common responder.
    common = responder ? responder : null;
    while (common) {
      if (common.get('hasFirstResponder')) break;
      common = (common===last) ? null : this.nextResponderFor(common);
    }
    if (!common) common = last;
    
    // Cleanup old first responder
    this._notifyWillLoseFirstResponder(current, current, common, evt);
    if (current) current.set('isFirstResponder', NO);

    // Set new first responder.  If new firstResponder does not have its 
    // responderContext property set, then set it.
    
    // but, don't tell anyone until we have _also_ updated the hasFirstResponder state.
    this.beginPropertyChanges();
    
    this.set('firstResponder', responder) ;
    if (responder) responder.set('isFirstResponder', YES);
    
    this._notifyDidBecomeFirstResponder(responder, responder, common);
    
    // now, tell everyone the good news!
    this.endPropertyChanges();
    
    this._locked = NO ;
    if (this._pendingResponder) {
      this.makeFirstResponder(this._pendingResponder);
      this._pendingResponder = null;
    }
    
    if (responder) responder.set("becomingFirstResponder", NO);
    
    return this ;
  },

  _notifyWillLoseFirstResponder: function(responder, cur, root, evt) {
    if (cur === root) return ; // nothing to do

    cur.willLoseFirstResponder(responder, evt);  
    cur.set('hasFirstResponder', NO);

    var next = this.nextResponderFor(cur);
    if (next) this._notifyWillLoseFirstResponder(responder, next, root);
  },
  
  _notifyDidBecomeFirstResponder: function(responder, cur, root) {
    if (cur === root) return ; // nothing to do

    var next = this.nextResponderFor(cur);
    if (next) this._notifyDidBecomeFirstResponder(responder, next, root);
    
    cur.set('hasFirstResponder', YES);
    cur.didBecomeFirstResponder(responder);  
  },
  
  /**
    Re-enters the current responder (calling willLoseFirstResponder and didBecomeFirstResponder).
  */
  resetFirstResponder: function() {
    var current = this.get('firstResponder');
    if (!current) return;
    current.willLoseFirstResponder();
    current.didBecomeFirstResponder();
  },
  
  /**
    Send the passed action down the responder chain, starting with the 
    current first responder.  This will look for the first responder that 
    actually implements the action method and returns YES or no value when 
    called.
    
    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} context optional additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendAction: function(action, sender, context) {
    var working = this.get('firstResponder'),
        last    = this.get('nextResponder'),
        trace   = this.get('trace'),
        handled = NO,
        responder;

    this._locked = YES;
    if (trace) {
      console.log("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }

    if (!handled && !working && this.tryToPerform) {
      handled = this.tryToPerform(action, sender, context);
    }

    while (!handled && working) {
      if (working.tryToPerform) {
        handled = working.tryToPerform(action, sender, context);
      }

      if (!handled) {
        working = (working===last) ? null : this.nextResponderFor(working);
      }
    }

    if (trace) {
      if (!handled) console.log("%@:  action '%@' NOT HANDLED".fmt(this,action));
      else console.log("%@: action '%@' handled by %@".fmt(this, action, this.responderNameFor(working)));
    }
    
    this._locked = NO ;
    
    if (responder = this._pendingResponder) {
      this._pendingResponder= null ;
      this.makeFirstResponder(responder);
    }
    
    
    return working ;
  }

};

/* >>>>>>>>>> BEGIN source/panes/pane.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view');
sc_require('mixins/responder_context');

/** @class
  A Pane is like a regular view except that it does not need to live within a 
  parent view.  You usually use a Pane to form the root of a view hierarchy in 
  your application, such as your main application view or for floating 
  palettes, popups, menus, etc.
  
  Usually you will not work directly with the SC.Pane class, but with one of 
  its subclasses such as SC.MainPane, SC.Panel, or SC.PopupPane.

  h1. Showing a Pane
  
  To make a pane visible, you need to add it to your HTML document.  The 
  simplest way to do this is to call the append() method:
  
  {{{
     myPane = SC.Pane.create();
     myPane.append(); // adds the pane to the document
  }}}
  
  This will insert your pane into the end of your HTML document body, causing 
  it to display on screen.  It will also register your pane with the 
  SC.RootResponder for the document so you can start to receive keyboard, 
  mouse, and touch events.
  
  If you need more specific control for where you pane appears in the 
  document, you can use several other insertion methods such as appendTo(), 
  prependTo(), before() and after().  These methods all take a an element to 
  indicate where in your HTML document you would like you pane to be inserted.
  
  Once a pane is inserted into the document, it will be sized and positioned 
  according to the layout you have specified.  It will then automatically 
  resize with the window if needed, relaying resize notifications to children 
  as well.
  
  h1. Hiding a Pane
  
  When you are finished with a pane, you can hide the pane by calling the 
  remove() method.  This method will actually remove the Pane from the 
  document body, as well as deregistering it from the RootResponder so that it 
  no longer receives events.
  
  The isVisibleInWindow method will also change to NO for the Pane and all of 
  its childViews and the views will no longer have their updateDisplay methods 
  called.  
  
  You can readd a pane to the document again any time in the future by using 
  any of the insertion methods defined in the previous section.
  
  h1. Receiving Events
  
  Your pane and its child views will automatically receive any mouse or touch 
  events as long as it is on the screen.  To receive keyboard events, however, 
  you must focus the keyboard on your pane by calling makeKeyPane() on the 
  pane itself.  This will cause the RootResponder to route keyboard events to 
  your pane.  The pane, in turn, will route those events to its current 
  keyView, if there is any.
  
  Note that all SC.Views (anything that implements SC.ClassicResponder, 
  really) will be notified when it is about or gain or lose keyboard focus.  
  These notifications are sent both when the view is made keyView of a 
  particular pane and when the pane is made keyPane for the entire 
  application.
  
  You can prevent your Pane from becoming key by setting the acceptsKeyPane 
  to NO on the pane.  This is useful when creating palettes and other popups 
  that should not steal keyboard control from another view.

  @extends SC.View
  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Pane = SC.View.extend(SC.ResponderContext,
/** @scope SC.Pane.prototype */ {

  /** 
    Returns YES for easy detection of when you reached the pane. 
    @property {Boolean}
  */
  isPane: YES,
  
  /** 
    Set to the current page when the pane is instantiated from a page object.
    @property {SC.Page}
  */
  page: null,
  
  // .......................................................
  // ROOT RESPONDER SUPPORT
  //

  /**
    The rootResponder for this pane.  Whenever you add a pane to a document, 
    this property will be set to the rootResponder that is now forwarding 
    events to the pane.
    
    @property {SC.Responder}
  */
  rootResponder: null,  
  
  /** 
    Last known window size. 
    
    @property {Rect}
  */
  currentWindowSize: null,
  
  /** 
    The parent dimensions are always the last known window size. 
    
    @returns {Rect} current window size 
  */
  computeParentDimensions: function(frame) {
    if(this.get('designer') && SC.suppressMain) return arguments.callee.base.apply(this,arguments);
    
    var wframe = this.get('currentWindowSize'),
        wDim = {x: 0, y: 0, width: 1000, height: 1000},
        layout = this.get('layout');

    if (wframe){
      wDim.width = wframe.width;
      wDim.height = wframe.height;
    }
    // Call the RootResponder instance...
    else if (SC.RootResponder.responder) {
      var wSize = SC.RootResponder.responder.get('currentWindowSize');
      if (wSize){
        wDim.width = wSize.width;
        wDim.height = wSize.height;
      }
    }
    // If all else fails then we need to Calculate it from the window size and DOM
    else {
      var size, body, docElement;
      if(!this._bod || !this._docElement){
        body = document.body;
        docElement = document.documentElement;
        this._body=body;
        this._docElement=docElement;
      }else{
        body = this._body;
        docElement = this._docElement;
      }
      
      if (window.innerHeight) {
        wDim.width = window.innerWidth;
        wDim.height = window.innerHeight;
      } else if (docElement && docElement.clientHeight) {
        wDim.width = docElement.clientWidth;
        wDim.height = docElement.clientHeight; 
      } else if (body) {
        wDim.width = body.clientWidth;
        wDim.height = body.clientHeight;
      }
      this.windowSizeDidChange(null, wDim);
    }


    // If there is a minWidth or minHeight set on the pane, take that
    // into account when calculating dimensions.
  
    if (layout.minHeight || layout.minWidth) {
      if (layout.minHeight) {
        wDim.height = Math.max(wDim.height, layout.minHeight);
      }
      if (layout.minWidth) {
        wDim.width = Math.max(wDim.width, layout.minWidth);
      }
    }
    return wDim;
  },
    
  /** @private Disable caching due to an known bug in SC. */
  frame: function() {
    if(this.get('designer') && SC.suppressMain) return arguments.callee.base.apply(this,arguments);    
    return this.computeFrameWithParentFrame(null) ;
  }.property(),
  
  /** 
    Invoked by the root responder whenever the window resizes.  This should
    simply begin the process of notifying children that the view size has
    changed, if needed.
    
    @param {Rect} oldSize the old window size
    @param {Rect} newSize the new window size
    @returns {SC.Pane} receiver
  */
  windowSizeDidChange: function(oldSize, newSize) {
    this.set('currentWindowSize', newSize) ;
    this.parentViewDidResize(); // start notifications.
    return this ;
  },

  /** @private */
  paneLayoutDidChange: function() {
    this.invokeOnce(this.updateLayout);
  }.observes('layout'),
  
  /**
    Attempts to send the event down the responder chain for this pane.  If you 
    pass a target, this method will begin with the target and work up the 
    responder chain.  Otherwise, it will begin with the current rr 
    and walk up the chain looking for any responder that implements a handler 
    for the passed method and returns YES when executed.

    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event
  */
  sendEvent: function(action, evt, target) {
    var handler ;
    
    // walk up the responder chain looking for a method to handle the event
    if (!target) target = this.get('firstResponder') ;
    while(target && !target.tryToPerform(action, evt)) {

      // even if someone tries to fill in the nextResponder on the pane, stop
      // searching when we hit the pane.
      target = (target === this) ? null : target.get('nextResponder') ;
    }
    
    // if no handler was found in the responder chain, try the default
    if (!target && (target = this.get('defaultResponder'))) {
      if (typeof target === SC.T_STRING) {
        target = SC.objectForPropertyPath(target);
      }

      if (!target) target = null;
      else target = target.tryToPerform(action, evt) ? target : null ;
    }

    // if we don't have a default responder or no responders in the responder
    // chain handled the event, see if the pane itself implements the event
    else if (!target && !(target = this.get('defaultResponder'))) {
      target = this.tryToPerform(action, evt) ? this : null ;
    }

    return evt.mouseHandler || target ;
  },

  performKeyEquivalent: function(keystring, evt) {
    var ret = arguments.callee.base.apply(this,arguments) ; // try normal view behavior first
    if (!ret) {
      var defaultResponder = this.get('defaultResponder') ;
      if (defaultResponder) {
        // try default responder's own performKeyEquivalent method,
        // if it has one...
        if (defaultResponder.performKeyEquivalent) {
          ret = defaultResponder.performKeyEquivalent(keystring, evt) ;
        }
        
        // even if it does have one, if it doesn't handle the event, give
        // methodName-style key equivalent handling a try
        if (!ret && defaultResponder.tryToPerform) {
          ret = defaultResponder.tryToPerform(keystring, evt) ;
        }
      }
    }
    return ret ;
  },

  // .......................................................
  // RESPONDER CONTEXT
  //

  /**
    Pane's never have a next responder.

    @property {SC.Responder}
    @readOnly
  */
  nextResponder: function() {
    return null;
  }.property().cacheable(),

  /**
    The first responder.  This is the first view that should receive action 
    events.  Whenever you click on a view, it will usually become 
    firstResponder. 
    
    @property {SC.Responder}
  */
  firstResponder: null,
  
  /** 
    If YES, this pane can become the key pane.  You may want to set this to NO 
    for certain types of panes.  For example, a palette may never want to 
    become key.  The default value is YES.
    
    @property {Boolean}
  */
  acceptsKeyPane: YES,
  
  /**
    This is set to YES when your pane is currently the target of key events. 
    
    @property {Boolean}
  */
  isKeyPane: NO,

  /**
    Make the pane receive key events.  Until you call this method, the 
    keyView set for this pane will not receive key events. 
  
    @returns {SC.Pane} receiver
  */
  becomeKeyPane: function() {
    if (this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(this) ;
    return this ;
  },
  
  /**
    Remove the pane view status from the pane.  This will simply set the 
    keyPane on the rootResponder to null.
    
    @returns {SC.Pane} receiver
  */
  resignKeyPane: function() {
    if (!this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(null);
    return this ;
  },
  
  /**
    Makes the passed view (or any object that implements SC.Responder) into 
    the new firstResponder for this pane.  This will cause the current first
    responder to lose its responder status and possibly keyResponder status as
    well.
    
    @param {SC.View} view
    @param {Event} evt that cause this to become first responder
    @returns {SC.Pane} receiver
  */
  makeFirstResponder: function(view, evt) {
    var current=this.get('firstResponder'), isKeyPane=this.get('isKeyPane');
    if (current === view) return this ; // nothing to do
    if (SC.platform.touch && view && view.kindOf(SC.TextFieldView) && !view.get('focused')) return this;
    
    // notify current of firstResponder change
    if (current) current.willLoseFirstResponder(current, evt);
    
    // if we are currently key pane, then notify key views of change also
    if (isKeyPane) {
      if (current) current.willLoseKeyResponderTo(view) ;
      if (view) view.willBecomeKeyResponderFrom(current) ;
    }
    
    // change setting
    if (current) {
      current.beginPropertyChanges()
        .set('isFirstResponder', NO).set('isKeyResponder', NO)
      .endPropertyChanges();
    }

    this.set('firstResponder', view) ;
    
    if (view) {
      view.beginPropertyChanges()
        .set('isFirstResponder', YES).set('isKeyResponder', isKeyPane)
      .endPropertyChanges();
    }
    
    // and notify again if needed.
    if (isKeyPane) {
      if (view) view.didBecomeKeyResponderFrom(current) ; 
      if (current) current.didLoseKeyResponderTo(view) ;
    }
    
    if (view) view.didBecomeFirstResponder(view);
    return this ;
  },

  /** @private
    If the user presses the tab key and the pane does not have a first
    responder, try to give it to the next eligible responder.

    If the keyDown event reaches the pane, we can assume that no responders in
    the responder chain, nor the default responder, handled the event.
  */
  keyDown: function(evt) {
    var nextValidKeyView;

    // Handle tab key presses if we don't have a first responder already
    if (evt.which === 9 && !this.get('firstResponder')) {
      // Cycle forwards by default, backwards if the shift key is held
      if (evt.shiftKey) {
        nextValidKeyView = this.get('previousValidKeyView');
      } else {
        nextValidKeyView = this.get('nextValidKeyView');
      }

      if (nextValidKeyView) {
        this.makeFirstResponder(nextValidKeyView);
        return YES;
      }
    }

    return NO;
  },

  /** @private method forwards status changes in a generic way. */
  _forwardKeyChange: function(shouldForward, methodName, pane, isKey) {
    var keyView, responder, newKeyView;
    if (shouldForward && (responder = this.get('firstResponder'))) {
      newKeyView = (pane) ? pane.get('firstResponder') : null ;
      keyView = this.get('firstResponder') ;
      if (keyView) keyView[methodName](newKeyView);
      
      if ((isKey !== undefined) && responder) {
        responder.set('isKeyResponder', isKey);
      }
    } 
  },
  
  /**
    Called just before the pane loses it's keyPane status.  This will notify 
    the current keyView, if there is one, that it is about to lose focus, 
    giving it one last opportunity to save its state. 
    
    @param {SC.Pane} pane
    @returns {SC.Pane} reciever
  */
  willLoseKeyPaneTo: function(pane) {
    this._forwardKeyChange(this.get('isKeyPane'), 'willLoseKeyResponderTo', pane, NO);
    return this ;
  },
  
  /**
    Called just before the pane becomes keyPane.  Notifies the current keyView 
    that it is about to gain focus.  The keyView can use this opportunity to 
    prepare itself, possibly stealing any value it might need to steal from 
    the current key view.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  willBecomeKeyPaneFrom: function(pane) {
    this._forwardKeyChange(!this.get('isKeyPane'), 'willBecomeKeyResponderFrom', pane, YES);
    return this ;
  },


  /**
    Called just after the pane has lost its keyPane status.  Notifies the 
    current keyView of the change.  The keyView can use this method to do any 
    final cleanup and changes its own display value if needed.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} reciever
  */
  didLoseKeyPaneTo: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', NO);
    this._forwardKeyChange(isKeyPane, 'didLoseKeyResponderTo', pane);
    return this ;
  },
  
  /**
    Called just after the keyPane focus has changed to the receiver.  Notifies 
    the keyView of its new status.  The keyView should use this method to 
    update its display and actually set focus on itself at the browser level 
    if needed.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} receiver

  */
  didBecomeKeyPaneFrom: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', YES);
    this._forwardKeyChange(!isKeyPane, 'didBecomeKeyResponderFrom', pane, YES);
    return this ;
  },
  
  // .......................................................
  // MAIN PANE SUPPORT
  //
  
  /**
    Returns YES whenever the pane has been set as the main pane for the 
    application.
    
    @property {Boolean}
  */
  isMainPane: NO,
  
  /**
    Invoked when the pane is about to become the focused pane.  Override to
    implement your own custom handling.
    
    @param {SC.Pane} pane the pane that currently have focus
    @returns {void}
  */
  focusFrom: function(pane) {},
  
  /**
    Invoked when the the pane is about to lose its focused pane status.  
    Override to implement your own custom handling
    
    @param {SC.Pane} pane the pane that will receive focus next
    @returns {void}
  */
  blurTo: function(pane) {},
  
  /**
    Invoked when the view is about to lose its mainPane status.  The default 
    implementation will also remove the pane from the document since you can't 
    have more than one mainPane in the document at a time.
    
    @param {SC.Pane} pane
    @returns {void}
  */
  blurMainTo: function(pane) {
    this.set('isMainPane', NO) ;
  },
  
  /** 
    Invokes when the view is about to become the new mainPane.  The default 
    implementation simply updates the isMainPane property.  In your subclass, 
    you should make sure your pane has been added to the document before 
    trying to make it the mainPane.  See SC.MainPane for more information.
    
    @param {SC.Pane} pane
    @returns {void}
  */
  focusMainFrom: function(pane) {
    this.set('isMainPane', YES);
  },
  
  // .......................................................
  // ADDING/REMOVE PANES TO SCREEN
  //  
  
  /**
    Inserts the pane at the end of the document.  This will also add the pane 
    to the rootResponder.
    
    @param {SC.RootResponder} rootResponder
    @returns {SC.Pane} receiver
  */
  append: function() {   
    return this.appendTo(document.body) ;
  },
  
  /**
    Removes the pane from the document.  This will remove the
    DOM node and deregister you from the document window.
    
    @returns {SC.Pane} receiver
  */
  remove: function() {
    if (!this.get('isVisibleInWindow')) return this ; // nothing to do
    if (!this.get('isPaneAttached')) return this ; // nothing to do
    
    // remove layer...
    var dom = this.get('layer') ;
    if (dom && dom.parentNode) dom.parentNode.removeChild(dom) ;
    dom = null ;
    
    // remove intercept
    this._removeIntercept();
    
    // resign keyPane status, if we had it
    this.resignKeyPane();
    
    // remove the pane
    var rootResponder = this.rootResponder ;
    if (this.get('isMainPane')) rootResponder.makeMainPane(null) ;
    rootResponder.panes.remove(this) ;
    this.rootResponder = null ;
    
    // clean up some of my own properties
    this.set('isPaneAttached', NO) ;
    this.parentViewDidChange();
    return this ;
  },
  
  /**
    Inserts the pane into the DOM as the last child of the passed DOM element. 
    You can pass in either a CoreQuery object or a selector, which will be 
    converted to a CQ object.  You can optionally pass in the rootResponder 
    to use for this operation.  Normally you will not need to pass this as 
    the default responder is suitable.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  appendTo: function(elem) {
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer'); 
    
    if (this.get('isPaneAttached') && (layer.parentNode === elem)) {
      return this; // nothing to do
    }
    
    elem.insertBefore(layer, null); // add to DOM
    elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the top of the passed DOM element.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  prependTo: function(elem) {
    if (this.get('isPaneAttached')) return this;
    
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer'); 
    
    if (this.get('isPaneAttached') && (layer.parentNode === elem)) {
      return this; // nothing to do
    }
    
    elem.insertBefore(layer, elem.firstChild); // add to DOM
    elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the hierarchy before the passed 
    element.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  before: function(elem) {
    if (this.get('isPaneAttached')) return this;
    
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer');
    
    var parent = elem.parentNode ; 

    if (this.get('isPaneAttached') && (layer.parentNode === parent)) {
      return this; // nothing to do
    }
    
    parent.insertBefore(layer, elem); // add to DOM
    parent = elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the hierarchy after the passed 
    element.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  after: function(elem) {
    
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer'); 
    
    var parent = elem.parentNode ;
  
    if (this.get('isPaneAttached') && (layer.parentNode === parent)) {
      return this; // nothing to do
    }
    
    parent.insertBefore(layer, elem.nextSibling); // add to DOM
    parent = elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },
  
  /**
    This method has no effect in the pane.  Instead use remove().
    
    @returns {void}
  */
  removeFromParent: function() { },
  
  /** @private
    Called when the pane is attached to a DOM element in a window, this will 
    change the view status to be visible in the window and also register 
    with the rootResponder.
  */
  paneDidAttach: function() {

    // hook into root responder
    var responder = (this.rootResponder = SC.RootResponder.responder);
    responder.panes.add(this);
  
    // set currentWindowSize
    this.set('currentWindowSize', responder.computeWindowSize()) ;
    
    // update my own location
    this.set('isPaneAttached', YES) ;
    this.parentViewDidChange() ;
    
    //notify that the layers have been appended to the document
    this._notifyDidAppendToDocument();
    
    // handle intercept if needed
    this._addIntercept();
    return this ;
  },
  
  /**
    YES when the pane is currently attached to a document DOM.  Read only.
    
    @property {Boolean}
    @readOnly
  */
  isPaneAttached: NO,
  
  /**
    If YES, a touch itnercept pane will be added above this pane.
  */
  hasTouchIntercept: NO,
  
  /**
    The Z-Index of the pane. Currently, you have to match this in CSS.
    TODO: ALLOW THIS TO AUTOMATICALLY SET THE Z-INDEX OF THE PANE (as an option).
  */
  zIndex: 0,
  
  /**
    The amount over the pane's z-index that the touch intercept should be.
  */
  touchZ: 99,

  _addIntercept: function() {
    if (this.get("hasTouchIntercept") && SC.platform.touch) {
      this.set("usingTouchIntercept", YES);
      var div = document.createElement("div");
      var divStyle = div.style;
      divStyle.position = "absolute";
      divStyle.left = "0px";
      divStyle.top = "0px";
      divStyle.right = "0px";
      divStyle.bottom = "0px";
      divStyle.webkitTransform = "translateZ(0px)";
      divStyle.zIndex = this.get("zIndex") + this.get("touchZ");
      div.className = "touch-intercept";
      div.id = "touch-intercept-" + SC.guidFor(this);
      this._touchIntercept = div;
      document.body.appendChild(div);
    }
  },
  
  _removeIntercept: function() {
    if (this._touchIntercept) {
      document.body.removeChild(this._touchIntercept);
      this._touchIntercept = null;
    }
  },
  
  hideTouchIntercept: function() {
    if (this._touchIntercept) this._touchIntercept.style.display = "none";
  },
  
  showTouchIntercept: function() {
    if (this._touchIntercept) this._touchIntercept.style.display = "block";
  },

  /**
    Updates the isVisibleInWindow state on the pane and its childViews if 
    necessary.  This works much like SC.View's default implementation, but it
    does not need a parentView to function.
    
    @returns {SC.Pane} receiver
  */
  recomputeIsVisibleInWindow: function() {
    if (this.get('designer') && SC.suppressMain) return arguments.callee.base.apply(this,arguments);
    var previous = this.get('isVisibleInWindow'),
        current  = this.get('isVisible') && this.get("isPaneAttached");

    // If our visibility has changed, then set the new value and notify our
    // child views to update their value.
    if (previous !== current) {
      this.set('isVisibleInWindow', current);
      
      var childViews = this.get('childViews'), len = childViews.length, idx;
      for(idx=0;idx<len;idx++) {
        childViews[idx].recomputeIsVisibleInWindow(current);
      }


      // For historical reasons, we'll also layout the child views if
      // necessary.
      if (current) {
        if (this.get('childViewsNeedLayout')) this.invokeOnce(this.layoutChildViewsIfNeeded);
      }
      else {
        // Also, if we were previously visible and were the key pane, resign
        // it.  This more appropriately belongs in a 'isVisibleInWindow'
        // observer or some such helper method because this work is not
        // strictly related to computing the visibility, but view performance
        // is critical, so avoiding the extra observer is worthwhile.
        if (this.get('isKeyPane')) this.resignKeyPane();
      }
    }

    // If we're in this function, then that means one of our ancestor views
    // changed, or changed its 'isVisibleInWindow' value.  That means that if
    // we are out of sync with the layer, then we need to update our state
    // now.
    //
    // For example, say we're isVisible=NO, but we have not yet added the
    // 'hidden' class to the layer because of the "don't update the layer if
    // we're not visible in the window" check.  If any of our parent views
    // became visible, our layer would incorrectly be shown!
    this.updateLayerIfNeeded(YES);

    return this;
  },
  
  /** @private */
  updateLayerLocation: function() {
    if(this.get('designer') && SC.suppressMain) return arguments.callee.base.apply(this,arguments);
    // note: the normal code here to update node location is removed 
    // because we don't need it for panes.
    return this ; 
  },

  /** @private */
  init: function() {
    // if a layer was set manually then we will just attach to existing 
    // HTML.
    var hasLayer = !!this.get('layer') ;
    arguments.callee.base.apply(this,arguments) ;
    if (hasLayer) this.paneDidAttach();
  },

  /** @private */
  classNames: 'sc-pane'.w()
  
}) ;


/* >>>>>>>>>> BEGIN source/debug/control_test_pane.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/pane');

/*global test */

// TODO: IMPROVE CODE QUALITY.  This code was put together quickly in order to
// test the SproutCore framework.  It does not match up to the project's 
// normal documentation, design and coding standards.  Do not rely on this 
// code as an example of how to build your own applications.

/** @class
  Generates a pane that will display vertically stacked views for testing.
  You can use this class in test mode to easily create a palette with views
  configured in different ways.
  
  h1. Example
  
  {{{
    var pane = SC.ControlTestPane.design()
      .add('basic', SC.CheckboxView.design({ title: "Hello World" }))
      .add('disabled', SC.CheckboxView.design({
        title: "Hello World", isEnabled: NO
      }));
      
    module("CheckboxView UI", pane);
    
    test("basic", function() {
      var view = pane.view('basic');
      ok(view.get('isEnabled'), 'should be enabled');
    });
  }}}
  
  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.ControlTestPane = SC.Pane.extend(
/** @scope SC.ControlTestPane.prototype */ {
  
  classNames: ['sc-control-test-pane'],
  layout: { right: 20, width: 350, top: 65, bottom: 5 },

  /**
    The starting top location for the first row.  This will increment as 
    views are added to the pane.
  */
  top:       0,
  
  /**
    The default height of each row.  This will be used for a view unless you
    manually specify a height in the view's layout.
  */
  height:    20,
  
  /**
    The default padding added to the edges and between each row.
  */
  padding:   4,

  /**
    Retrieves the test sample view that was added with the passed key name.
    
    @param {String} keyName the key used to register the view.
    @returns {SC.View} view instance
  */
  view: function(keyName) { 
    var idx = this._views[keyName];
    if (!idx) throw "SC.ControlTestPane does not have a view named %@".fmt(keyName);
    return this.childViews[idx].childViews[0]; 
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    if (!this._views) this._views = {};
    this.append(); // auto-add to screen
    
    // Also adjust unit test results to make space
    // use setTimeout to avoid screwing with the RunLoop which we might be 
    // testing.
    var l = this.get('layout'), w = l.right + l.width;
    setTimeout(function() {
      if (!Q$) return ; // nothing to do
      Q$('.core-test > .detail').css('marginRight', w);
    }, 100);
  }
});

/**
  Adds a test view to the control pane design.  The passed label will be used
  as the key which you can use to find the view layer.  You can either pass
  a view that is already designed or pass an array of attributes that will be
  used to create a design on the view.
  
  @param {String} label the view key name
  @param {SC.View} view a view class or view design
  @param {Hash} attrs optional attrs to use when designing the view
  @returns {SC.ControlTestPane} receiver
*/
SC.ControlTestPane.add = function(label, view, attrs) {
  if (attrs === undefined) attrs = {};
  if (!view.isDesign) view = view.design(attrs);

  // compute layout.
  var padding = this.prototype.padding, height = this.prototype.height;
  var top = this.prototype.top + padding*2, layout;
  var labelHeight =14;
  if (top === padding*2) top = padding; // reduce padding @ top
  
  // if the passed in view has a layout property and the layout has an 
  // explicit, numerical height, then use that instead.
  if (view.prototype.layout && (typeof view.prototype.layout.height === SC.T_NUMBER)) height = view.prototype.layout.height;
  
  this.prototype.top = top + height+labelHeight+(padding*2); // make room
  
  // calculate labelView and add it
  layout = { left: padding, width: 150, top: top, height: 20 };
  var labelView = SC.LabelView.design({
    value: label + ':', 
    layout: { left: 0, right: 0, top: 0, height: labelHeight }, 
   // textAlign: SC.ALIGN_RIGHT, 
    fontWeight: SC.BOLD_WEIGHT 
  });

  // wrap label in parent view in order to center text vertically
  labelView = SC.View.design().layout(layout).childView(labelView);
  this.childView(labelView);
  
  // now layout view itself...
  var wrapper = SC.View.design({
    classNames: ['wrapper'],
    layout: { left: padding, top: top+labelHeight+padding, right: padding, height: height },
    childViews: [view]
  });
  var idx = this.prototype.childViews.length ;
  this.childView(wrapper);
  
  var views = this.prototype._views;
  if (!views) views = this.prototype._views = {};
  views[label] = idx ;
  
  return this;
};

/**
  Returns a standard setup/teardown object for use by the module() method.
*/
SC.ControlTestPane.standardSetup = function() {
  var pane = this ;
  return {
    setup: function() { 
      SC.RunLoop.begin();
      pane._pane = pane.create(); 
      SC.RunLoop.end();
    },
    
    teardown: function() {
      SC.RunLoop.begin();
      if (pane._pane) pane._pane.remove();
      SC.RunLoop.end();
      
      pane._pane = null ;
    }
  } ;
};

/**
  Convenience method.  Returns the view with the given name on the current
  pane instance if there is one.
*/
SC.ControlTestPane.view = function(viewKey) {
  var pane = this._pane || this._showPane ;
  if (!pane) throw "view() cannot be called on a class";
  return pane.view(viewKey);
};

/**
  Registers a final test that will instantiate the control test pane and 
  display it.  This allows the developer to interact with the controls once
  the test has completed.
*/
SC.ControlTestPane.show = function() {
  var pane = this ;
  test("show control test pane", function() { 
    SC.RunLoop.begin();
    pane._showPane = pane.create(); 
    SC.RunLoop.end();
  });
};

/* >>>>>>>>>> BEGIN source/ext/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Extensions to the core SC.Object class
SC.mixin(SC.Object.prototype, /** @scope SC.Object.prototype */ {
  
  /**
    Invokes the named method after the specified period of time.
    
    This is a convenience method that will create a single run timer to
    invoke a method after a period of time.  The method should have the
    signature:
    
    {{{
      methodName: function(timer)
    }}}
    
    If you would prefer to pass your own parameters instead, you can instead
    call invokeLater() directly on the function object itself.
    
    @param methodName {String} method name to perform.
    @param interval {Number} period from current time to schedule.
    @returns {SC.Timer} scheduled timer.
  */
  invokeLater: function(methodName, interval) {
    if (interval === undefined) interval = 1 ;
    var f = methodName, args, func;
    
    // if extra arguments were passed - build a function binding.
    if (arguments.length > 2) {
      args = SC.$A(arguments).slice(2);
      if (SC.typeOf(f) === SC.T_STRING) f = this[methodName] ;
      func = f ;
      f = function() { return func.apply(this, args); } ;
    }

    // schedule the timer
    return SC.Timer.schedule({ target: this, action: f, interval: interval });
  },
  
  /**
    Lookup the named property path and then invoke the passed function, 
    passing the resulting value to the function.
    
    This method is a useful way to handle deferred loading of properties.  
    If you want to defer loading a property, you can override this method.
    When the method is called, passing a deferred property, you can load the
    property before invoking the callback method.
    
    You can even swap out the receiver object.  
    
    The callback method should have the signature:
    
    function callback(objectAtPath, sourceObject) { ... }
    
    You may pass either a function itself or a target/method pair.
    
    @param {String} pathName
    @param {Object} target target or method
    @param {Function|String} method
    @returns {SC.Object} receiver
  */
  invokeWith: function(pathName, target, method) {
    // normalize target/method
    if (method === undefined) {
      method = target; target = this;
    }
    if (!target) target = this ;
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    
    // get value
    var v = this.getPath(pathName);
    
    // invoke method
    method.call(target, v, this);
    return this ;
  }
  
});

/* >>>>>>>>>> BEGIN source/ext/run_loop.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Create anonymous subclass of SC.RunLoop to add support for processing 
// view queues and Timers.
SC.RunLoop = SC.RunLoop.extend(
/** @scope SC.RunLoop.prototype */ {

  /**
    The time the current run loop began executing.
    
    All timers scheduled during this run loop will begin executing as if 
    they were scheduled at this time.
  
    @property {Number}
  */
  startTime: function() {
    if (!this._start) this._start = Date.now();
    return this._start ;  
  }.property(),
  
  /* 
  
    Override to fire and reschedule timers once per run loop.
    
    Note that timers should fire only once per run loop to avoid the 
    situation where a timer might cause an infinite loop by constantly 
    rescheduling itself everytime it is fired.
  */
  endRunLoop: function() {
    this.fireExpiredTimers(); // fire them timers!
    var ret = arguments.callee.base.apply(this,arguments); // do everything else
    this.scheduleNextTimeout(); // schedule a timout if timers remain
    return ret; 
  },
  
  // ..........................................................
  // TIMER SUPPORT
  // 
  
  /**
    Schedules a timer to execute at the specified runTime.  You will not 
    usually call this method directly.  Instead you should work with SC.Timer,
    which will manage both creating the timer and scheduling it.
    
    Calling this method on a timer that is already scheduled will remove it 
    from the existing schedule and reschedule it.
    
    @param {SC.Timer} timer the timer to schedule
    @param {Time} runTime the time offset when you want this to run
    @returns {SC.RunLoop} receiver
  */
  scheduleTimer: function(timer, runTime) {
    // if the timer is already in the schedule, remove it.
    this._timerQueue = timer.removeFromTimerQueue(this._timerQueue);
    
    // now, add the timer ot the timeout queue.  This will walk down the 
    // chain of timers to find the right place to insert it.
    this._timerQueue = timer.scheduleInTimerQueue(this._timerQueue, runTime);
    return this ;
  },
  
  /**
    Removes the named timer from the timeout queue.  If the timer is not 
    currently scheduled, this method will have no effect.
    
    @param {SC.Timer} timer the timer to schedule
    @returns {SC.RunLoop} receiver
  */
  cancelTimer: function(timer) {
    this._timerQueue = timer.removeFromTimerQueue(this._timerQueue) ;
    return this ;
  },

  /** @private - shared array used by fireExpiredTimers to avoid memory */
  TIMER_ARRAY: [],
  
  /**
    Invokes any timers that have expired since this method was last called.
    Usually you will not call this method directly, but it will be invoked 
    automatically at the end of the run loop.
    
    @returns {Boolean} YES if timers were fired, NO otherwise
  */
  fireExpiredTimers: function() {
    if (!this._timerQueue || this._firing) return NO; // nothing to do

    // max time we are allowed to run timers
    var now = this.get('startTime'),
        timers = this.TIMER_ARRAY,
        idx, len, didFire;
    
    // avoid recursive calls
    this._firing = YES;
    
    // collect timers to fire.  we do this one time up front to avoid infinite 
    // loops where firing a timer causes it to schedule itself again, causing 
    // it to fire again, etc.
    this._timerQueue = this._timerQueue.collectExpiredTimers(timers, now);

    // now step through timers and fire them.
    len = timers.length;
    for(idx=0;idx<len;idx++) timers[idx].fire();
    
    // cleanup
    didFire = timers.length > 0 ;
    timers.length = 0 ; // reset for later use...
    this._firing = NO ;
    return didFire; 
  },
  
  /** @private
    Invoked at the end of a runloop, if there are pending timers, a timeout
    will be scheduled to fire when the next timer expires.  You will not 
    usually call this method yourself.  It is invoked automatically at the
    end of a run loop.
    
    @returns {Boolean} YES if a timeout was scheduled
  */
  scheduleNextTimeout: function() {
    var timer = this._timerQueue ;
    
    var ret = NO ;
    // if no timer, and there is an existing timeout, cancel it
    if (!timer) {
      if (this._timeout) clearTimeout(this._timeout);
      
    // otherwise, determine if the timeout needs to be rescheduled.
    } else {
      var nextTimeoutAt = timer._timerQueueRunTime ;
      if (this._timeoutAt !== nextTimeoutAt) { // need to reschedule
        if (this._timeout) clearTimeout(this._timeout); // clear existing...
        // reschedule
        var delay = Math.max(0, nextTimeoutAt - Date.now());
        this._timeout = setTimeout(this._timeoutDidFire, delay);
        this._timeoutAt = nextTimeoutAt ;
      }
      ret = YES ;
    }
    
    return ret ;
  },

  /** @private
    Invoked when a timeout actually fires.  Simply cleanup, then begin and end 
    a runloop. This will fire any expired timers and reschedule.  Note that
    this function will be called with 'this' set to the global context, 
    hence the need to lookup the current run loop.
  */
  _timeoutDidFire: function() {
    var rl = SC.RunLoop.currentRunLoop;
    rl._timeout = rl._timeoutAt = null ; // cleanup
    SC.run();  // begin/end runloop to trigger timers.
  }
  
});

SC.RunLoop.currentRunLoop = SC.RunLoop.create();

/* >>>>>>>>>> BEGIN source/license.js */
/*! @license

Portions of this software are copyright Yahoo, Inc, used under the following license:

Software License Agreement (BSD License)
Copyright (c) 2009, Yahoo! Inc.
All rights reserved.
Redistribution and use of this software in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the
following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of Yahoo! Inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission of Yahoo! Inc.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Sources of Intellectual Property Included in the YUI Library
Where not otherwise indicated, all YUI content is authored by Yahoo! engineers and consists of Yahoo!-owned intellectual property. YUI is issued by Yahoo! under the BSD license above. In some specific instances, YUI will incorporate work done by developers outside of Yahoo! with their express permission.

*/

/*! @license
  jQuery 1.2.6 - New Wave Javascript

  Copyright (c) 2008 John Resig (jquery.com)
  Dual licensed under the MIT (MIT-LICENSE.txt)
  and GPL (GPL-LICENSE.txt) licenses.
  
  $Date: 2008-05-24 14:22:17 -0400 (Sat, 24 May 2008) $
  $Rev: 5685 $
*/
/* >>>>>>>>>> BEGIN source/mixins/button.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace

  This mixin implements many of the basic state-handling attributes for 
  button-like views, including an auto-updated title, and mapping the current
  value to an isSelected state.
  
  Usually you will not work with this mixin directly.  Instead, you should use
  a class that incorporates the mixin such as SC.ButtonView, SC.CheckboxView
  or SC.RadioView.
  
  This mixin assumes you have already applied the SC.Control and 
  SC.DelegateSupport mixins as well.
  
  @since SproutCore 1.0  
*/
SC.Button = {
  
  // ..........................................................
  // VALUE PROPERTIES
  // 
  
  /**
    Used to automatically update the state of the button view for toggle style
    buttons.

    for toggle style buttons, you can set the value and it will be used to
    update the isSelected state of the button view.  The value will also
    change as the user selects or deselects.  You can control which values
    the button will treat as isSelected by setting the toggleOnValue and 
    toggleOffValue.  Alternatively, if you leave these properties set to
    YES or NO, the button will do its best to convert a value to an 
    appropriate state:
  
    - null, false, 0  -> isSelected = false
    - any other single value -> isSelected = true
    - array -> if all values are the same state: that state.  otherwise MIXED.
    
    @property {Object}
  */  
  value: null,
  
  /**
    Value of a selected toggle button.
  
    for a toggle button, set this to any object value you want.  The button
    will be selected if the value property equals the targetValue.  If the
    value is an array of multiple items that contains the targetValue, then
    the button will be set to a mixed state.

    default is YES
    
    @property {Object}
  */
  toggleOnValue: YES,

  /**
    Value of an unselected toggle button.
  
    For a toggle button, set this to any object value you want.  When the
    user toggle's the button off, the value of the button will be set to this
    value.
  
    default is NO 
  
    @property {Object}
  */
  toggleOffValue: NO,
  
  // ..........................................................
  // TITLE 
  // 
  
  /**
    If YES, then the title will be localized.
    
    @property {Boolean}
  */
  localize: NO,
  
  /** @private */
  localizeBindingDefault: SC.Binding.bool(),

  /**
    The button title.  If localize is YES, then this should be the localization key to display.  Otherwise, this will be the actual string displayed in the title.  This property is observable and bindable.
    
    @property {String}
  */  
  title: '',

  /**
    If you set this property, the title property will be updated automatically
    from the content using the key you specify.
    
    @property {String}
  */
  contentTitleKey: null,
  
  /**
    The button icon.  Set this to either a URL or a CSS class name (for 
    spriting).  Note that if you pass a URL, it must contain at 
    least one slash to be detected as such.
    
    @property {String}
  */
  icon: null,

  /**
    If you set this property, the icon will be updated automatically from the
    content using the key you specify.
    
    @property {String}
  */
  contentIconKey: null,

  /**
    If YES, button will attempt to display an ellipsis if the title cannot 
    fit inside of the visible area.  This feature is not available on all
    browsers.
    
    @property {Boolean}
  */
  needsEllipsis: YES,
  
  /**
    The computed display title.  This is generated by localizing the title 
    property if necessary.
    
    @property {String}
  */
  displayTitle: function() {
    var ret = this.get('title');
    return (ret && this.get('localize')) ? ret.loc() : (ret || '');
  }.property('title','localize').cacheable(),
  
  /**
    The key equivalent that should trigger this button on the page.
    
    @property {String}
  */
  keyEquivalent: null,
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Classes that include this mixin can invoke this method from their 
    render method to render the proper title HTML.  This will include an 
    icon if necessary along with any other standard markup.
    
    @param {SC.RenderContext} context the context to render
    @param {Boolean} firstTime YES if first time rendering
    @returns {SC.RenderContext} the context
  */
  renderTitle: function(context, firstTime) {
    var icon = this.get('icon'),
        image = '' ,
        title = this.get('displayTitle') ,
        needsTitle = (!SC.none(title) && title.length>0),
        elem, htmlNode, imgTitle;
        if(this.get('escapeHTML')) title = SC.RenderContext.escapeHTML(title) ;
        
    // get the icon.  If there is an icon, then get the image and update it.
    // if there is no image element yet, create it and insert it just before
    // title.
    
    if (icon) {
      var blank = SC.BLANK_IMAGE_URL;

      if (icon.indexOf('/') >= 0) {
        image = '<img src="'+icon+'" alt="" class="icon" />';
      } else {
        image = '<img src="'+blank+'" alt="" class="'+icon+'" />';
      }
      needsTitle = YES ;
    }
    imgTitle = image + title;
    if(firstTime){
      if(this.get('needsEllipsis')){
        context.push('<label class="sc-button-label ellipsis">'+imgTitle+'</label>'); 
      }else{
          context.push('<label class="sc-button-label">'+imgTitle+'</label>'); 
      }  
      this._ImageTitleCached = imgTitle;
    }else{
      elem = this.$('label');  
      if ( (htmlNode = elem[0])){
        if(needsTitle) { 
          elem.setClass('ellipsis', this.get('needsEllipsis'));
          if(this._ImageTitleCached !== imgTitle) {
            this._ImageTitleCached = imgTitle; // Update the cache
            htmlNode.innerHTML = imgTitle;
          } 
        }
        else { htmlNode.innerHTML = ''; } 
      }
    }  
    return context ;
  },

  /**
    Updates the value, title, and icon keys based on the content object, if 
    set.
    
    @property {Object} target the target of the object that changed
    @property {String} key name of property that changed
    @returns {SC.Button} receiver
  */
  contentPropertyDidChange: function(target, key) {
    var del = this.get('displayDelegate'), 
        content = this.get('content'), value ;

    var valueKey = this.getDelegateProperty('contentValueKey', del) ;
    if (valueKey && (key === valueKey || key === '*')) {
      this.set('value', content ? (content.get ? content.get(valueKey) : content[valueKey]) : null) ;
    }

    var titleKey = this.getDelegateProperty('contentTitleKey', del) ;
    if (titleKey && (key === titleKey || key === '*')) {
      this.set('title', content ? (content.get ? content.get(titleKey) : content[titleKey]) : null) ;
    }

    var iconKey = this.getDelegateProperty('contentIconKey', del);
    if (iconKey && (key === iconKey || key === '*')) {
      this.set('icon', content ? (content.get ? content.get(iconKey) : content[iconKey]) : null) ;
    }
    
    return this ;
  },

  /** @private - when title changes, dirty display. */
  _button_displayObserver: function() {
    this.displayDidChange();
  }.observes('title', 'icon', 'value'),

  /**
    Handle a key equivalent if set.  Trigger the default action for the 
    button.  Depending on the implementation this may vary.
    
    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}  YES if handled, NO otherwise
  */
  performKeyEquivalent: function(keystring, evt) {
    //If this is not visible
    if (!this.get('isVisibleInWindow')) return NO;

    if (!this.get('isEnabled')) return NO;
    var equiv = this.get('keyEquivalent');

    // button has defined a keyEquivalent and it matches!
    // if triggering succeeded, true will be returned and the operation will 
    // be handeled (i.e performKeyEquivalent will cease crawling the view 
    // tree)
    if (equiv) {
      if (equiv === keystring) return this.triggerAction(evt);
    
    // should fire if isDefault OR isCancel.  This way if isDefault AND 
    // isCancel, responds to both return and escape
    } else if ((this.get('isDefault') && (keystring === 'return')) ||
        (this.get('isCancel') && (keystring === 'escape'))) {
          return this.triggerAction(evt);
    }

    return NO; // did not handle it; keep searching
  },

  /**
    Your class should implement this method to perform the default action on
    the button.  This is used to implement keyboard control.  Your button
    may make this change in its own way also.
    
    @property {SC.Event} evt the event
    @returns {void}
  */
  triggerAction: function(evt) {
    throw "SC.Button.triggerAction() is not defined in %@".fmt(this);
  },

  // ..........................................................
  // VALUE <-> isSelected STATE MANAGEMNT
  // 

  /**
    This is the standard logic to compute a proposed isSelected state for a
    new value.  This takes into account the toggleOnValue/toggleOffValue 
    properties, among other things.  It may return YES, NO, or SC.MIXED_STATE.
    
    @param {Object} value
    @returns {Boolean} return state
  */
  computeIsSelectedForValue: function(value) {
    var targetValue = this.get('toggleOnValue'), state, next ;
    
    if (SC.typeOf(value) === SC.T_ARRAY) {

      // treat a single item array like a single value
      if (value.length === 1) {
        state = (value[0] == targetValue) ;
        
      // for a multiple item array, check the states of all items.
      } else {
        state = null;
        value.find(function(x) {
          next = (x == targetValue) ;
          if (state === null) {
            state = next ;
          } else if (next !== state) state = SC.MIXED_STATE ;
          return state === SC.MIXED_STATE ; // stop when we hit a mixed state.
        });
      }
      
    // for single values, just compare to the toggleOnValue...use truthiness
    } else {
      if(value === SC.MIXED_STATE) state = SC.MIXED_STATE;
      else state = (value === targetValue) ;
    }
    return state ;
  },
  
  /** @ignore */
  initMixin: function() {
    // if value is not null, update isSelected to match value.  If value is
    // null, we assume you may be using isSelected only.  
    if (!SC.none(this.get('value'))) this._button_valueDidChange();  
  },
  
  /** @private
    Whenever the button value changes, update the selected state to match.
  */
  _button_valueDidChange: function() {
    var value = this.get('value'),
        state = this.computeIsSelectedForValue(value);
    this.set('isSelected', state) ; // set new state...
  }.observes('value'),
  
  /** @private
    Whenever the selected state is changed, make sure the button value is also updated.  Note that this may be called because the value has just changed.  In that case this should do nothing.
  */
  _button_isSelectedDidChange: function() {
    var newState = this.get('isSelected'),
        curState = this.computeIsSelectedForValue(this.get('value'));
    
    // fix up the value, but only if computed state does not match.
    // never fix up value if isSelected is set to MIXED_STATE since this can
    // only come from the value.
    if ((newState !== SC.MIXED_STATE) && (curState !== newState)) {
      var valueKey = (newState) ? 'toggleOnValue' : 'toggleOffValue' ;
      this.set('value', this.get(valueKey));
    }
  }.observes('isSelected')
  
} ;

/* >>>>>>>>>> BEGIN source/mixins/content_display.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  The SC.ContentDisplay mixin makes it easy to automatically update your view
  display whenever relevant properties on a content object change.  To use
  this mixin, include it in your view and then add the names of the 
  properties on the content object you want to trigger a displayDidChange() 
  method on your view. Your updateDisplay() method will then be called at the 
  end of the run loop.
  
  h2. Example
  
  {{{
    MyApp.MyViewClass = SC.View.extend(SC.ContentDisplay, { 
      contentDisplayProperties: 'title isEnabled hasChildren'.w(),
      ...
    });
  }}}
  
  @since SproutCore 1.0
*/
SC.ContentDisplay = {
  
  /** @private */
  concatenatedProperties: 'contentDisplayProperties',

  /** @private */
  displayProperties: ['content'],
  
  /** 
    Add an array with the names of any property on the content object that
    should trigger an update of the display for your view.  Changes to the
    content object will only invoke your display method once per runloop.
    
    @property {Array}
  */
  contentDisplayProperties: [],

  /** @private
    Setup observers on the content object when initializing the mixin.
  */
  initMixin: function() {
    this._display_contentDidChange();
  },

  /** @private */
  _display_contentDidChange: function(target, key, value) {
    // handle changes to the content...
    if ((value = this.get('content')) != this._display_content) {

      // get the handler method
      var f = this._display_contentPropertyDidChange ;
      
      // stop listening to old content.
      var content = this._display_content;
      if (content) {
        if (SC.isArray(content)) {
          content.invoke('removeObserver', '*', this, f) ;
        } else if (content.removeObserver) {
          content.removeObserver('*', this, f) ;
        }
      }
      
      // start listening for changes on the new content object.
      content = this._display_content = value ; 
      if (content) {
        if (SC.isArray(content)) {
          content.invoke('addObserver', '*', this, f) ;
        } else if (content.addObserver) {
          content.addObserver('*', this, f) ;
        }
      }

      this.displayDidChange();
    }
  }.observes('content', 'contentDisplayProperties'),
  
  /** @private Invoked when properties on the content object change. */
  _display_contentPropertyDidChange: function(target, key, value, propertyRevision) {
    if (key === '*') {
      this.displayDidChange() ;
    } else {
      // only update if a displayProperty actually changed...s
      var ary = this.get('contentDisplayProperties') ;
      if (ary && ary.indexOf(key)>=0) this.displayDidChange();
    }
  }
  
} ;

/* >>>>>>>>>> BEGIN source/mixins/control.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/string');

/** 
  Indicates a value has a mixed state of both on and off. 
  
  @property {String}
*/
SC.MIXED_STATE = '__MIXED__' ;

/** 
  Option for HUGE control size.
  
  @property {String}
*/
SC.HUGE_CONTROL_SIZE = 'sc-huge-size' ;

/** 
  Option for large control size.
  
  @property {String}
*/
SC.LARGE_CONTROL_SIZE = 'sc-large-size' ;

/** 
  Option for standard control size.
  
  @property {String}
*/
SC.REGULAR_CONTROL_SIZE = 'sc-regular-size' ;

/** 
  Option for small control size.
  
  @property {String}
*/
SC.SMALL_CONTROL_SIZE = 'sc-small-size' ;

/** 
  Option for tiny control size
  
  @property {String}
*/
SC.TINY_CONTROL_SIZE = 'sc-tiny-size' ;

/**
  @namespace
  
  A Control is a view that also implements some basic state functionality.
  Apply this mixin to any view that you want to have standard control
  functionality including showing a selected state, enabled state, focus
  state, etc.
  
  h2. About Values and Content
  
  Controls typically are used to represent a single value, such as a number,
  boolean or string.  The value a control is managing is typically stored in
  a "value" property.  You will typically use the value property when working
  with controls such as buttons and text fields in a form.
  
  An alternative way of working with a control is to use it to manage some
  specific aspect of a content object.  For example, you might use a label
  view control to display the "name" property of a Contact record.  This 
  approach is often necessary when using the control as part of a collection
  view.
  
  You can use the content-approach to work with a control by setting the 
  "content" and "contentValueKey" properties of the control.  The 
  "content" property is the content object you want to manage, while the 
  "contentValueKey" is the name of the property on the content object 
  you want the control to display.
  
  The default implementation of the Control mixin will essentially map the
  contentValueKey of a content object to the value property of the 
  control.  Thus if you are writing a custom control yourself, you can simply
  work with the value property and the content object support will come for
  free.  Just write an observer for the value property and update your 
  view accordingly.
  
  If you are working with a control that needs to display multiple aspects
  of a single content object (for example showing an icon and label), then
  you can override the contentValueDidChange() method instead of observing
  the value property.  This method will be called anytime _any_ property 
  on the content object changes.  You should use this method to check the
  properties you care about on the content object and update your view if 
  anything you care about has changed.
  
  h2. Delegate Support
  
  Controls can optionally get the contentDisplayProperty from a 
  displayDelegate, if it is set.  The displayDelegate is often used to 
  delegate common display-related configurations such as which content value
  to show.  Anytime your control is shown as part of a collection view, the
  collection view will be automatically set as its displayDelegate.
  
  @since SproutCore 1.0
*/
SC.Control = {
  
  /** @private */
  initMixin: function() {
    this._control_contentDidChange() ; // setup content observing if needed.
  },
  
  /** 
    The selected state of this control.  Possible options are YES, NO or 
    SC.MIXED_STATE.
    
    @property {Boolean}
  */
  isSelected: NO,
  
  /** @private */
  isSelectedBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    Set to YES when the item is currently active.  Usually this means the 
    mouse is current pressed and hovering over the control, however the 
    specific implementation my vary depending on the control.
    
    Changing this property value by default will cause the Control mixin to
    add/remove an 'active' class name to the root element.
    
    @property {Boolean}
  */
  isActive: NO,
  
  /** @private */
  isActiveBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    The value represented by this control.
    
    Most controls represent a value of some type, such as a number, string
    or image URL.  This property should hold that value.  It is bindable
    and observable.  Changing this value will immediately change the
    appearance of the control.  Likewise, editing the control 
    will immediately change this value.
    
    If instead of setting a single value on a control, you would like to 
    set a content object and have the control display a single property
    of that control, then you should use the content property instead.

    @property {Object}
  */
  value: null,
  
  /**
    The content object represented by this control.
    
    Often you need to use a control to display some single aspect of an 
    object, especially if you are using the control as an item view in a
    collection view.
    
    In those cases, you can set the content and contentValueKey for the
    control.  This will cause the control to observe the content object for
    changes to the value property and then set the value of that property 
    on the "value" property of this object.
    
    Note that unless you are using this control as part of a form or 
    collection view, then it would be better to instead bind the value of
    the control directly to a controller property.
    
    @property {SC.Object}
  */
  content: null,
  
  /**
    The property on the content object that would want to represent the 
    value of this control.  This property should only be set before the
    content object is first set.  If you have a displayDelegate, then
    you can also use the contentValueKey of the displayDelegate.
    
    @property {String}
  */
  contentValueKey: null,
  
  /**
    Invoked whenever any property on the content object changes.  
    
    The default implementation will update the value property of the view
    if the contentValueKey property has changed.  You can override this
    method to implement whatever additional changes you would like.
    
    The key will typically contain the name of the property that changed or 
    '*' if the content object itself has changed.  You should generally do
    a total reset of '*' is changed.
    
    @param {Object} target the content object
    @param {String} key the property that changes
    @returns {void}
    @test in content
  */
  contentPropertyDidChange: function(target, key) {
    return this.updatePropertyFromContent('value', key, 'contentValueKey');
  },
  
  /**
    Helper method you can use from your own implementation of 
    contentPropertyDidChange().  This method will look up the content key to
    extract a property and then update the property if needed.  If you do
    not pass the content key or the content object, they will be computed 
    for you.  It is more efficient, however, for you to compute these values
    yourself if you expect this method to be called frequently.
    
    @param {String} prop local property to update
    @param {String} key the contentproperty that changed
    @param {String} contentKey the local property that contains the key
    @param {Object} content
    @returns {SC.Control} receiver
  */
  updatePropertyFromContent: function(prop, key, contentKey, content) {
    var all = key === '*';
    if (contentKey === undefined) {
      contentKey = "content"+prop.capitalize()+"Key";
    }
    if (content === undefined) content = this.get('content');
    
    // get actual content key
    contentKey = this[contentKey] ?
      this.get(contentKey) :
      this.getDelegateProperty(contentKey, this.displayDelegate) ;
    
    if (contentKey && (all || key === contentKey)) {
      var v = (content) ?
        (content.get ? content.get(contentKey) : content[contentKey]) :
        null ;
      this.set(prop, v) ;
    }
    return this ;
  },
  
  /**
    Relays changes to the value back to the content object if you are using
    a content object.
    
    This observer is triggered whenever the value changes.  It will only do
    something if it finds you are using the content property and
    contentValueKey and the new value does not match the old value of the
    content object.  
    
    If you are using contentValueKey in some other way than typically
    implemented by this mixin, then you may want to override this method as
    well.
    
    @returns {void}
  */
  updateContentWithValueObserver: function() {
    var key = this.contentValueKey ?
      this.get('contentValueKey') :
      this.getDelegateProperty('contentValueKey', this.displayDelegate),
      content = this.get('content') ;
    if (!key || !content) return ; // do nothing if disabled
    
    // get value -- set on content if changed
    var value = this.get('value');
    if (typeof content.setIfChanged === SC.T_FUNCTION) {
      content.setIfChanged(key, value);
    } else {
      // avoid re-writing inherited props
      if (content[key] !== value) content[key] = value ;
    }
  }.observes('value'),
  
  /**
    The name of the property this control should display if it is part of an
    SC.FormView.
    
    If you add a control as part of an SC.FormView, then the form view will 
    automatically bind the value to the property key you name here on the 
    content object.
    
    @property {String}
  */
  fieldKey: null,
  
  /**
    The human readable label you want shown for errors.  May be a loc string.
    
    If your field fails validation, then this is the name that will be shown
    in the error explanation.  If you do not set this property, then the 
    fieldKey or the class name will be used to generate a human readable name.
    
    @property {String}
  */
  fieldLabel: null,
  
  /**
    The human readable label for this control for use in error strings.  This
    property is computed dynamically using the following rules:
    
    If the fieldLabel is defined, that property is localized and returned.
    Otherwise, if the keyField is defined, try to localize using the string 
    "ErrorLabel.{fieldKeyName}".  If a localized name cannot be found, use a
    humanized form of the fieldKey.
    
    Try to localize using the string "ErrorLabel.{ClassName}". Return a 
    humanized form of the class name.
    
    @property {String}
  */
  errorLabel: function() {
    var ret, fk, def ;
    if (ret = this.get('fieldLabel')) return ret ;
    
    // if field label is not provided, compute something...
    fk = this.get('fieldKey') || this.constructor.toString() ;
    def = (fk || '').humanize().capitalize() ;
    return "ErrorLabel."+fk
      .locWithDefault(("FieldKey."+fk).locWithDefault(def)) ;
      
  }.property('fieldLabel','fieldKey').cacheable(),

  /**
    The control size.  This will set a CSS style on the element that can be 
    used by the current theme to vary the appearance of the control.
    
    @property {String}
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,
  
  /** @private */
  displayProperties: 'isEnabled isSelected isActive controlSize'.w(),
  
  /** @private */
  _CONTROL_TMP_CLASSNAMES: {},
  
  /** @private
    Invoke this method in your updateDisplay() method to update any basic 
    control CSS classes.
  */
  renderMixin: function(context, firstTime) {
    var sel = this.get('isSelected'), disabled = !this.get('isEnabled'),
    // update the CSS classes for the control.  note we reuse the same hash
    // to avoid consuming more memory
        names = this._CONTROL_TMP_CLASSNAMES ; // temporary object
    names.mixed = sel === SC.MIXED_STATE;
    names.sel = sel && (sel !== SC.MIXED_STATE) ;
    names.active = this.get('isActive') ;
    context.setClass(names).addClass(this.get('controlSize'));
  },
  
  /** @private
    This should be null so that if content is also null, the
    _contentDidChange won't do anything on init.
  */
  _control_content: null,
  
  /** @private
    Observes when a content object has changed and handles notifying 
    changes to the value of the content object.
  */
  _control_contentDidChange: function() {
    var content = this.get('content') ;
    if (this._control_content === content) return; // nothing changed
    
    var f = this.contentPropertyDidChange,
    // remove an observer from the old content if necessary
        old = this._control_content ;
    if (old && old.removeObserver) old.removeObserver('*', this, f) ;
    
    // add observer to new content if necessary.
    this._control_content = content ;
    if (content && content.addObserver) content.addObserver('*', this, f) ;
    
    // notify that value did change.
    this.contentPropertyDidChange(content, '*') ;
    
  }.observes('content')
  
};

/* >>>>>>>>>> BEGIN source/mixins/editable.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  The Editable mixin is a standard protocol used to activate keyboard editing 
  on views that are editable such as text fields, label views and item views.
  
  You should apply this mixin, or implement the methods, if you are
  designing an item view for a collection and you want to automatically
  trigger editing.
  
  h2. Using Editable Views
  
  To use a view that includes the Editable mixin, you simply call three
  methods on the view:
  
  - To begin editing, call beginEditing().  This will make the view first responder and allow the user to make changes to it.  If the view cannot begin editing for some reason, it will return NO.
  
  - If you want to cancel editing, you should try calling discardEditing().  This will cause the editor to discard its changed value and resign first responder.  Some editors do not support cancelling editing and will return NO.  If this is the case, you may optionally try calling commitEditing() instead to force the view to resign first responder, even though this will commit the changes.
  
  - If you want to end editing, while saving any changes that were made, try calling commitEditing().  This will cause the editor to validate and apply its changed value and resign first responder.  If the editor cannot validate its contents for some reason, it will return NO.  In this case you may optionally try calling discardEditing() instead to force the view to resign first responder, even though this will discard the changes.
  
  
  h2. Implementing an Editable View
  
  To implement a new view that is editable, you should implement the three
  methods defined below: beginEditing(), discardEditing(), and
  commitEditing().  If you already allow editing when your view becomes first
  responder and commit your changes when the view loses first responder status
  then you can simply apply this mixin and not override any methods.
  
  
  @since SproutCore 1.0
  
*/
SC.Editable = {  

  /**
    Indicates whether a view is editable or not.  You can optionally 
    implement the methods in this mixin to disallow editing is isEditable is
    NO.
    
    @property {Boolean}
  */
  isEditable: NO,
  
  /**
    Indicates whether editing is currently in progress.  The methods you
    implement should generally up this property as appropriate when you 
    begin and end editing.
    
    @property {Boolean}
  */
  isEditing: NO,
  
  /**
    Begins editing on the view.
    
    This method is called by other views when they want you to begin editing.
    You should write this method to become first responder, perform any 
    additional setup needed to begin editing and then return YES.
    
    If for some reason you do not want to allow editing right now, you can
    also return NO.  If your view is already editing, then you should not
    restart editing again but just return YES.

    The default implementation checks to see if editing is allowed, then
    becomes first responder and updates the isEditing property if appropriate.
    Generally you will want to replace this method with your own 
    implementation and not call the default.
    
    @returns {Boolean} YES if editing began or is in progress, NO otherwise
  */
  beginEditing: function() {
    if (!this.get('isEditable')) return NO ;
    if (this.get('isEditing')) return YES ;
    
    // begin editing
    this.beginPropertyChanges();
    this.set('isEditing', YES) ;
    this.becomeFirstResponder() ;
    this.endPropertyChanges();
    return YES ;
  },
  
  /**
    Ends editing on the view, discarding any changes that were made to the
    view value in the meantime.
    
    This method is called by other views when they want to cancel editing
    that began earlier.  When this method is called you should resign first
    responder, restore the original value of the view and return YES.
    
    If your view cannot revert back to its original state before editing began
    then you can implement this method to simply return NO.  A properly
    implemented client may try to call commitEditing() instead to force your
    view to end editing anyway.
    
    If this method is called on a view that is not currently editing, you
    should always just return YES.
    
    The default implementation does not support discarding changes and always
    returns NO.
    
    @returns {Boolean} YES if changes were discarded and editing ended.
  */
  discardEditing: function() {
    // if we are not editing, return YES, otherwise NO.
    return !this.get('isEditing') ;
  },
  
  /**
    Ends editing on the view, committing any changes that were made to the 
    view value in the meantime.
    
    This method is called by other views when they want to end editing, 
    saving any changes that were made to the view in the meantime.  When this
    method is called you should resign first responder, save the latest
    value of the view and return YES.
    
    If your view cannot save the current state of the view for some reason 
    (for example if validation fails), then you should return NO.  Properly
    implemented clients may then try to call discardEditing() to force your
    view to resign first responder anyway.
    
    Some views apply changes to their value immediately during an edit instead
    of waiting for the view to end editing.  If this is the case, you should
    still implement commitEditing but you simply may not save any value 
    changes.
  
    If this method is called on a view that is not currently editing, you
    should always just reutrn YES.
    
    The default implementation sets isEditing to NO, resigns first responder
    and returns YES.
    
    @returns {Boolean} YES if changes were discarded and editing ended.
  */
  commitEditing: function() {
    if (!this.get('isEditing')) return YES;
    this.set('isEditing', NO) ;
    this.resignFirstResponder() ;
    return YES ;
  }

} ;

/* >>>>>>>>>> BEGIN source/mixins/validatable.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  Views that include the Validatable mixin can be used with validators to 
  ensure their values are valid.  
  
*/
SC.Validatable = {
  
  /** @private */
  initMixin: function() {
    this._validatable_validatorDidChange() ;
  },
  
  /**
    The validator for this field.  
  
    Set to a validator class or instance.  If this points to a class, it will 
    be instantiated when the validator is first used.
    
    @property {SC.Validator}
  */
  validator: null,

  /**
    This property must return the human readable name you want used when 
    describing an error condition.  For example, if set this property to
    "Your Email", then the returned error string might be something like
    "Your Email is not valid".
    
    You can return a loc string here if you like.  It will be localized when
    it is placed into the error string.
    
    @property {String}
  */
  errorLabel: null,

  /**
    YES if the receiver is currently valid.
    
    This property watches the value property by default.  You can override
    this property if you want to use some other method to calculate the
    current valid state.
    
    @property {Boolean}
  */
  isValid: function() { 
    return SC.typeOf(this.get('value')) !== SC.T_ERROR; 
  }.property('value'),
  
  /**
    The form that the view belongs to.  May be null if the view does not 
    belong to a form.  This property is usually set automatically by an 
    owner form view.
    
    @property {SC.View}
  */
  ownerForm: null,
  
  /**
    Attempts to validate the receiver. 
    
    Runs the validator and returns SC.VALIDATE_OK, SC.VALIDATE_NO_CHANGE,
    or an error object.  If no validator is installed, this method will
    always return SC.VALIDATE_OK.

    @param {Boolean} partialChange YES if this is a partial edit.
    @returns {String} SC.VALIDATE_OK, error, or SC.VALIDATE_NO_CHANGE
  */
  performValidate: function(partialChange) {
    var ret = SC.VALIDATE_OK ;

    if (this._validator) {
      var form = this.get('ownerForm') ;
      if (partialChange) {
        ret = this._validator.validatePartial(form,this) ;

        // if the partial returned NO_CHANGE, then check to see if the 
        // field is valid anyway.  If it is not valid, then don't update the
        // value.  This way the user can have partially constructed values 
        // without the validator trying to convert it to an object.
        if ((ret == SC.VALIDATE_NO_CHANGE) && (this._validator.validateChange(form, this) == SC.VALIDATE_OK)) {
          ret = SC.VALIDATE_OK; 
        }
      } else ret = this._validator.validateChange(form, this) ;
    }
    return ret ;
  },

  /**
    Runs validateSubmit.  You should use this in your implementation of 
    validateSubmit.  If no validator is installed, this always returns
    SC.VALIDATE_OK
    
    @returns {String}
  */
  performValidateSubmit: function() {
    return this._validator ? this._validator.validateSubmit(this.get('ownerForm'), this) : SC.VALIDATE_OK;
  },
  
  /**
    Runs a keypress validation.  Returns YES if the keypress should be 
    allowed, NO otherwise.  If no validator is defined, always returns YES.
    
    @param {String} charStr the key string
    @returns {Boolean}
  */
  performValidateKeyDown: function(evt) {
    // ignore anything with ctrl or meta key press
    var charStr = evt.getCharString();
    if (!charStr) return YES ;
    return this._validator ? this._validator.validateKeyDown(this.get('ownerForm'), this, charStr) : YES;
  },
  
  /**
    Returns the validator object, if one has been created.
    
    @property {SC.Validator}
  */
  validatorObject: function() {
    return this._validator;
  }.property(),
  
  /**
    Invoked by the owner form just before submission.  Override with your 
    own method to commit any final changes after you perform validation. 
    
    The default implementation simply calls performValidateSubmit() and 
    returns that value.
    
    @property {Boolean}
  */
  validateSubmit: function() { return this.performValidateSubmit(); },
  
  /**
    Convert the field value string into an object.
    
    This method will call the validators objectForFieldValue if it exists.
    
    @param {Object} fieldValue the raw value from the field.
    @param {Boolean} partialChange
    @returns {Object}
  */
  objectForFieldValue: function(fieldValue, partialChange) {
    return this._validator ? this._validator.objectForFieldValue(fieldValue, this.get('ownerForm'), this) : fieldValue ;
  },
  
  /**
    Convert the object into a field value.
    
    This method will call the validator's fieldValueForObject if it exists.
    
    @param object {Object} the objec to convert
    @returns {Object}
  */
  fieldValueForObject: function(object) {
    return this._validator ? this._validator.fieldValueForObject(object, this.get('ownerForm'), this) : object ;
  },
  
  _validatable_displayObserver: function() {
    this.displayDidChange();
  }.observes('isValid'),

  /** @private */
  renderMixin: function(context) {
    context.setClass('invalid', !this.get('isValid'));
  },

  // invoked whenever the attached validator changes.
  _validatable_validatorDidChange: function() {
    var form = this.get('ownerForm') ;
    var val = SC.Validator.findFor(form, this, this.get('validator')) ;
    if (val != this._validator) {
      this.propertyWillChange('validatorObject');
      if (this._validator) this._validator.detachFrom(form, this) ;
      this._validator = val;
      if (this._validator) this._validator.attachTo(form, this) ;
      this.propertyDidChange('validatorObject');
    }  
  }.observes('validator', 'ownerForm')
      
};

/* >>>>>>>>>> BEGIN source/views/field.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;
sc_require('mixins/control') ;
sc_require('mixins/validatable') ;

/** @class

  Base view for managing a view backed by an input element.  Since the web
  browser provides native support for editing input elements, this view
  provides basic support for listening to changes on these input elements and
  responding to them.
  
  Generally you will not work with a FieldView directly.  Instead, you should
  use one of the subclasses implemented by your target platform such as 
  SC.CheckboxView, SC.RadioView, SC.TextFieldView, and so on.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Validatable
  @since SproutCore 1.0
*/
SC.FieldView = SC.View.extend(SC.Control, SC.Validatable,
/** @scope SC.FieldView.prototype */ {
  
  /**
     If YES then we use textarea instead of input. 
     WARNING: Use only with textField** Juan
  */
  isTextArea: NO,

  _field_isMouseDown: NO,

  /**
    The raw value of the field itself.  This is computed from the 'value'
    property by passing it through any validator you might have set.  This is 
    the value that will be set on the field itself when the view is updated.
    
    @property {String}
  */  
  fieldValue: function() {
    var value = this.get('value');
    if (SC.typeOf(value) === SC.T_ERROR) value = value.get('errorValue');
    return this.fieldValueForObject(value);
  }.property('value', 'validator').cacheable(),

  // ..........................................................
  // PRIMITIVES
  // 
  
  /**
    Override to return an CoreQuery object that selects the input elements
    for the view.  If this method is defined, the field view will 
    automatically edit the attrbutes of the input element to reflect the 
    current isEnabled state among other things.
  */
  $input: function() { 
    if(this.get('isTextArea')){
      return this.$('textarea').andSelf().filter('textarea'); 
    }else{
      return this.$('input').andSelf().filter('input');
    }
  },
  
  /**
    Override to set the actual value of the field.
    
    The default implementation will simple copy the newValue to the value
    attribute of any input tags in the receiver view.  You can override this
    method to provide specific functionality needed by your view.
    
    @param {Object} newValue the value to display.
    @returns {SC.FieldView} receiver
  */
  setFieldValue: function(newValue) {
    if (SC.none(newValue)) newValue = '' ;
    var input = this.$input();
    
    // Don't needlessly set the element if it already has the value, because
    // doing so moves the cursor to the end in some browsers.
    if (input.val() !== newValue) {
      input.val(newValue);
    }
    return this ;
  },
  
  /**
    Override to retrieve the actual value of the field.
    
    The default implementation will simply retrieve the value attribute from
    the first input tag in the receiver view.
    
    @returns {String} value
  */
  getFieldValue: function() {
    return this.$input().val();
  },
  
  _field_fieldValueDidChange: function(evt) {
    SC.run(function() {
      this.fieldValueDidChange(NO);      
    }, this);
  },
  
  /**
    Your class should call this method anytime you think the value of the 
    input element may have changed.  This will retrieve the value and update
    the value property of the view accordingly.
    
    If this is a partial change (i.e. the user is still editing the field and
    you expect the value to change further), then be sure to pass YES for the
    partialChange parameter.  This will change the kind of validation done on
    the value.  Otherwise, the validator may mark the field as having an error
    when the user is still in mid-edit.
  
    @param partialChange (optional) YES if this is a partial change.
    @returns {Boolean|SC.Error} result of validation.
  */
  fieldValueDidChange: function(partialChange) {
    // collect the field value and convert it back to a value
    var fieldValue = this.getFieldValue();
    var value = this.objectForFieldValue(fieldValue, partialChange);
    this.setIfChanged('value', value);


    // ======= [Old code -- left here for concept reminders. Basic validation
    // API works without it] =======

    // validate value if needed...
    
    // this.notifyPropertyChange('fieldValue');
    // 
    // // get the field value and set it.
    // // if ret is an error, use that instead of the field value.
    // var ret = this.performValidate ? this.performValidate(partialChange) : YES;
    // if (ret === SC.VALIDATE_NO_CHANGE) return ret ;
    // 
    // this.propertyWillChange('fieldValue');
    // 
    // // if the validator says everything is OK, then in addition to posting
    // // out the value, go ahead and pass the value back through itself.
    // // This way if you have a formatter applied, it will reformat.
    // //
    // // Do this BEFORE we set the value so that the valueObserver will not
    // // overreact.
    // //
    // var ok = SC.$ok(ret);
    // var value = ok ? this._field_getFieldValue() : ret ;
    // if (!partialChange && ok) this._field_setFieldValue(value) ;
    // this.set('value',value) ;
    // 
    // this.propertyDidChange('fieldValue');
    // 
    // return ret ;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    invoked when the value property changes.  Sets the field value...
  */
  _field_valueDidChange: function() {
    this.setFieldValue(this.get('fieldValue'));
  }.observes('fieldValue'),

  /** @private
    after the layer is created, set the field value and observe events
  */
  didCreateLayer: function() {
    this.setFieldValue(this.get('fieldValue'));
    SC.Event.add(this.$input(), 'change', this, this._field_fieldValueDidChange) ;
  },

  /** @private
    after the layer is append to the doc, set the field value and observe events
    only for textarea.
  */
  didAppendToDocument: function() {
    if (this.get('isTextArea')) {
      this.setFieldValue(this.get('fieldValue'));
      SC.Event.add(this.$input(), 'change', this, this._field_fieldValueDidChange) ;
    }
  },
  
  willDestroyLayer: function() {
    SC.Event.remove(this.$input(), 'change', this, this._field_fieldValueDidChange); 
  },
  
  // ACTIONS
  // You generally do not need to override these but they may be used.

  /**
    Called to perform validation on the field just before the form 
    is submitted.  If you have a validator attached, this will get the
    validators.
  */  
  // validateSubmit: function() {
  //   var ret = this.performValidateSubmit ? this.performValidateSubmit() : YES;
  //   // save the value if needed
  //   var value = SC.$ok(ret) ? this._field_getFieldValue() : ret ;
  //   if (value != this.get('value')) this.set('value', value) ;
  //   return ret ;
  // },
  
  // OVERRIDE IN YOUR SUBCLASS
  // Override these primitives in your subclass as required.
  
  /**
    Allow the browser to do its normal event handling for the mouse down
    event.  But first, set isActive to YES.
  */
  mouseDown: function(evt) {  
    this._field_isMouseDown = YES;
    evt.allowDefault(); 
    return YES; 
  },
  
  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseOut: function(evt) {
    if (this._field_isMouseDown) this.set('isActive', NO);
    evt.allowDefault();
    return YES;
  },
  
  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseOver: function(evt) {
    this.set('isActive', this._field_isMouseDown);
    evt.allowDefault();
    return YES;
  },
  
  /** @private
    on mouse up, remove the isActive class and then allow the browser to do
    its normal thing.
  */  
  mouseUp: function(evt) {
    // track independently in case isEnabled has changed
    if (this._field_isMouseDown) this.set('isActive', NO); 
    this._field_isMouseDown = NO;
    evt.allowDefault();
    return YES ;
  },
  
  /** @private
    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) {

    // handle tab key
    if (evt.which === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if (view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }
    
    // validate keyDown...
    if (this.performValidateKeyDown(evt)) {
      this._isKeyDown = YES ;
      evt.allowDefault(); 
    } else {
      evt.stop();
    }
    
    return YES; 
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  willBecomeKeyResponderFrom: function(keyView) {
    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$input()[0].focus();
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    if (this._isFocused) this._isFocused = NO ;
  },
    
  // these methods use the validator to convert the raw field value returned
  // by your subclass into an object and visa versa.
  _field_setFieldValue: function(newValue) {
    this.propertyWillChange('fieldValue');
    if (this.fieldValueForObject) {
      newValue = this.fieldValueForObject(newValue) ;
    }
    var ret = this.setFieldValue(newValue) ;
    this.propertyDidChange('fieldValue');
    return ret ;
  },
  
  _field_getFieldValue: function() {
    var ret = this.getFieldValue() ;
    if (this.objectForFieldValue) ret = this.objectForFieldValue(ret);
    return ret ;
  }
  
});


/* >>>>>>>>>> BEGIN source/system/text_selection.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  A simple object representing the selection inside a text field.  Each
  object is frozen and contains exactly three properties:
  
    *  start
    *  end
    *  length
  
  Important note:  In Internet Explorer, newlines in textara elements are
  considered two characters.  SproutCore does not currently try to hide this from you.
  
  @extends SC.Object
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/

SC.TextSelection = SC.Object.extend(SC.Copyable, SC.Freezable,
/** @scope SC.TextSelection.prototype */ {  

  /**
    The number of characters appearing to the left of the beginning of the
    selection, starting at 0.
    
    @type {Number}
  */
  start: -1,
  
  
  /**
    The number of characters appearing to the left of the end of the
    selection.

    This will have the same value as 'start' if there is no selection and
    instead there is only a caret.
    
    @type {Number}
  */
  end: -1,
 
   
  /**
    The length of the selection.  This is equivalent to (end - start) and
    exists mainly as a convenience.
    
    @property {Number}
  */
  length: function() {
    var start = this.get('start') ;
    var end   = this.get('end') ;
    if ((start) === -1  ||  (end === -1)) {
      return -1 ;
    }
    else {
      return end - start ;
    }
  }.property('start', 'end').cacheable(),
  
  
  
  // ..........................................................
  // INTERNAL SUPPORT
  //
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.freeze();
  },
  
  
  copy: function() {
    return SC.TextSelection.create({
      start: this.get('start'),
      end:   this.get('end')
    });
  },
  
  
  toString: function() {
    var length = this.get('length');
    if (length  &&  length > 0) {
      if (length === 1) {
        return "[%@ character selected: {%@, %@}]".fmt(length, this.get('start'), this.get('end'));
      }
      else {
        return "[%@ characters selected: {%@, %@}]".fmt(length, this.get('start'), this.get('end'));
      }
    }
    else {
      return "[no text selected; caret at %@]".fmt(this.get('start'));
    }
  }

}) ;

/* >>>>>>>>>> BEGIN source/mixins/static_layout.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 

  __NOTE:__ SC.StaticLayout is now built in to SC.View.  You do not need to 
  apply this mixin to use static layout.  Just set useStaticLayout to YES.
  
  Normally, SproutCore views use absolute positioning to display themselves
  on the screen.  While this is both the fastest and most efficient way to 
  display content in the web browser, sometimes your user interface might need
  to take advantage of the more advanced "flow" layout offered by the browser
  when you use static and relative positioning.
  
  This mixin can be added to a view class to enable the use of any kind of 
  static and relative browser positionining.  In exchange for using static
  layout, you will lose a few features that are normally available on a view
  class such as the 'frame' and 'clippingFrame' properties as well as 
  notifications when your view or parentView are resized.
  
  Normally, if you are allowing the browser to manage the size and positioning
  of your view, these feature will not be useful to your code anyway.
  
  h2. Using StaticLayout
  
  To enable static layout on your view, just include this mixin on the view.
  SproutCore's builtin views that are capable of being used in static 
  layouts already incorporate this mixin.  Then set the "useStaticLayout" 
  property on your view class to YES.
  
  You can then use CSS or the render() method on your view to setup the 
  positioning on your view using any browser layout mechanism you want.
  
  h2. Example
  
  {{{
    
    // JavaScript
    
    MyApp.CommentView = SC.View.extend(SC.StaticLayout, {
    
      classNames: ['comment-view'],
      
      useStaticLayout: YES,

      ...
    });
    
    // CSS
    
    .comment-view {
      display: block;
      position: relative;
    }
    
  }}}
  
  @deprecated
  @since SproutCore 1.0
*/
SC.StaticLayout = {
  
  /**
    Walk like a duck.  Used to determine that this mixin has been applied.  
    Note that a view that hasStaticLayout still may not actually use static
    layout unless useStaticLayout is also set to YES.
    
    @property {Boolean}
  */
  hasStaticLayout: YES
  
};

/* >>>>>>>>>> BEGIN source/views/text_field.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/field') ;
sc_require('system/text_selection') ;
sc_require('mixins/static_layout') ;
sc_require('mixins/editable');

/**
  @class

  A text field is an input element with type "text".  This view adds support
  for hinted values, etc.

  @extends SC.FieldView
  @extends SC.Editable
  @author Charles Jolley
*/
SC.TextFieldView = SC.FieldView.extend(SC.StaticLayout, SC.Editable,
/** @scope SC.TextFieldView.prototype */ {

  tagName: 'label',
  classNames: ['sc-text-field-view'],
  isTextField: YES,

  // ..........................................................
  // PROPERTIES
  //

  applyImmediately: YES,

  /**
    If YES, the field will hide its text from display. The default value is NO.
  */
  isPassword: NO,

  /**
    If YES then allow multi-line input.  This will also change the default
    tag type from "input" to "textarea".  Otherwise, pressing return will
    trigger the default insertion handler.
  */
  isTextArea: NO,

  /**
    The hint to display while the field is not active.  Can be a loc key.
  */
  hint: '',

  /**
    If YES then the text field is currently editing.
  */
  isEditing: NO,
  
  hintON:YES,
  
  /**
    If you set this property to false the tab key won't trigger its default 
    behavior (tabbing to the next field).
  */
  defaultTabbingEnabled:YES,
  
  /**
    Enabled context menu for textfields.
  */
  isContextMenuEnabled: YES,

  /**
    An optional view instance, or view class reference, which will be visible
    on the left side of the text field.  Visually the accessory view will look
    to be inside the field but the text editing will not overlap the accessory
    view.

    The view will be rooted to the top-left of the text field.  You should use
    a layout with 'left' and/or 'top' specified if you would like to adjust
    the offset from the top-left.

    One example use would be for a web site's icon, found to the left of the
    URL field, in many popular web browsers.

    Note:  If you set a left accessory view, the left padding of the text
    field (really, the left offset of the padding element) will automatically
    be set to the width of the accessory view, overriding any CSS you may have
    defined on the "padding" element.  If you would like to customize the
    amount of left padding used when the accessory view is visible, make the
    accessory view wider, with empty space on the right.
  */
  leftAccessoryView: null,

  /**
    An optional view instance, or view class reference, which will be visible
    on the right side of the text field.  Visually the accessory view will
    look to be inside the field but the text editing will not overlap the
    accessory view.

    The view will be rooted to the top-right of the text field.  You should
    use a layout with 'right' and/or 'top' specified if you would like to
    adjust the offset from the top-right.  If 'left' is specified in the
    layout it will be cleared.

    One example use would be for a button to clear the contents of the text
    field.

    Note:  If you set a right accessory view, the right padding of the text
    field (really, the right offset of the padding element) will automatically
    be set to the width of the accessory view, overriding any CSS you may have
    defined on the "padding" element.  If you would like to customize the
    amount of right padding used when the accessory view is visible, make the
    accessory view wider, with empty space on the left.
  */
  rightAccessoryView: null,
  
  
  /**
    This property will enable disable HTML5 spell checking if available on the 
    browser. As of today Safari 4+, Chrome 3+ and Firefox 3+ support it  
  */
    
  spellCheckEnabled: YES,
  
  maxLength: 5096,
  
  
  _isFocused: NO,
  
  
  init:function(){
    var hintStatus = this.get('hintON'),
        val = this.get('value');
    if(!val || val && val.length===0) this.set('hintON', YES);
    else this.set('hintON', NO);
    return arguments.callee.base.apply(this,arguments);
  },

  /** isEditable maps to isEnabled with a TextField. */
  isEditable: function() {
    return this.get('isEnabled') ;
  }.property('isEnabled').cacheable(),

  /**
    The current selection of the text field, returned as an SC.TextSelection
    object.

    Note that if the selection changes a new object will be returned -- it is
    not the case that a previously-returned SC.TextSelection object will
    simply have its properties mutated.

    @property {SC.TextSelection}
  */
  selection: function(key, value) {
    var element = this.$input()[0],
        range, start, end;

    // Are we being asked to set the value, or return the current value?
    if (value === undefined) {
      // The client is retrieving the value.
      if (element) {
        start = null;
        end = null;

        if (!element.value) {
          start = end = 0 ;
        }
        else {
          // In IE8, input elements don't have hasOwnProperty() defined.
          if ('selectionStart' in element) {
            start = element.selectionStart ;
          }
          if ('selectionEnd' in element) {
            end = element.selectionEnd ;
          }

          // Support Internet Explorer.
          if (start === null  ||  end === null ) {
            var selection = document.selection ;
            if (selection) {
              var type = selection.type ;
              if (type  &&  (type === 'None'  ||  type === 'Text')) {
                range = selection.createRange() ;

                if (!this.get('isTextArea')) {
                  // Input tag support.  Figure out the starting position by
                  // moving the range's start position as far left as possible
                  // and seeing how many characters it actually moved over.
                  var length = range.text.length ;
                  start = Math.abs(range.moveStart('character', 0 - (element.value.length + 1))) ;
                  end = start + length ;
                }
                else {
                  // Textarea support.  Unfortunately, this case is a bit more
                  // complicated than the input tag case.  We need to create a
                  // "dummy" range to help in the calculations.
                  var dummyRange = range.duplicate() ;
                  dummyRange.moveToElementText(element) ;
                  dummyRange.setEndPoint('EndToStart', range) ;
                  start = dummyRange.text.length ;
                  end = start + range.text.length ;
                }
              }
            }
          }
        }
        return SC.TextSelection.create({ start:start, end:end }) ;
      }
      else {
        return null;
      }
    }
    else {
      // The client is setting the value.  Make sure the new value is a text
      // selection object.
      if (!value  ||  !value.kindOf  ||  !value.kindOf(SC.TextSelection)) {
        throw "When setting the selection, you must specify an SC.TextSelection instance.";
      }

      if (element) {
        if (element.setSelectionRange) {
          element.setSelectionRange(value.get('start'), value.get('end')) ;
        }
        else {
          // Support Internet Explorer.
          range = element.createTextRange() ;
          start = value.get('start') ;
          range.move('character', start) ;
          range.moveEnd('character', value.get('end') - start) ;
          range.select() ;
        }
      }
      return value;
    }

    // Implementation note:
    // There are certain ways users can add/remove text that we can't identify
    // via our key/mouse down/up handlers (such as the user choosing Paste
    // from a menu).  So that's why we need to update our 'selection' property
    // whenever the field's value changes.
  }.property('fieldValue').cacheable(),

  // ..........................................................
  // INTERNAL SUPPORT
  //

  displayProperties: 'hint fieldValue isEditing leftAccessoryView rightAccessoryView isTextArea'.w(),

  createChildViews: function() {
    arguments.callee.base.apply(this,arguments);
    this.accessoryViewObserver();
  },

  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),

  accessoryViewObserver: function() {
    var classNames,
        viewProperties = ['leftAccessoryView', 'rightAccessoryView'],
        len = viewProperties.length , i, viewProperty, previousView, 
        accessoryView;
        
    for (i=0; i<len; i++) {
      viewProperty = viewProperties[i] ;

      // Is there an accessory view specified?
      previousView = this['_'+viewProperty] ;
      accessoryView = this.get(viewProperty) ;

      // If the view is the same, there's nothing to do.  Otherwise, remove
      // the old one (if any) and add the new one.
      if (! (previousView
             &&  accessoryView
             &&  (previousView === accessoryView) ) ) {

        // If there was a previous previous accessory view, remove it now.
        if (previousView) {
          // Remove the "sc-text-field-accessory-view" class name that we had
          // added earlier.
          classNames = previousView.get('classNames') ;
          classNames = classNames.without('sc-text-field-accessory-view') ;
          previousView.set('classNames', classNames) ;
          this.removeChild(previousView) ;
          previousView = null ;
          this['_'+viewProperty] = null ;
        }

        // If there's a new accessory view to add, do so now.
        if (accessoryView) {
          // If the user passed in a class rather than an instance, create an
          // instance now.
          if (accessoryView.isClass) {
            accessoryView = accessoryView.create({
              layoutView: this
            }) ;
          }

          // Add in the "sc-text-field-accessory-view" class name so that the
          // z-index gets set correctly.
          classNames = accessoryView.get('classNames') ;
          var className = 'sc-text-field-accessory-view' ;
          if (classNames.indexOf(className) < 0) {
            classNames = SC.clone(classNames);
            classNames.push(className) ;
            accessoryView.set('classNames', classNames);
          }

          // Actually add the view to our hierarchy and cache a reference.
          this.appendChild(accessoryView) ;
          this['_'+viewProperty] = accessoryView ;
        }
      }
    }
  }.observes('leftAccessoryView', 'rightAccessoryView'),

  layoutChildViewsIfNeeded: function(isVisible) {
    // For the right accessory view, adjust the positioning such that the view
    // is right-justified, unless 'right' is specified.
    if (!isVisible) isVisible = this.get('isVisibleInWindow') ;
    if (isVisible && this.get('childViewsNeedLayout')) {
      var rightAccessoryView = this.get('rightAccessoryView') ;
      if (rightAccessoryView  &&  rightAccessoryView.get) {
        var layout = rightAccessoryView.get('layout') ;
        if (layout) {
          // Clear out any 'left' value.
          layout.left = null;

          // Unless the user specified a 'right' value, specify a default to
          // right-justify the view.
          if (!layout.right) layout.right = 0 ;

          rightAccessoryView.adjust({ layout: layout }) ;
        }
      }
    }
    arguments.callee.base.apply(this,arguments) ;
  },

  render: function(context, firstTime) {
    arguments.callee.base.apply(this,arguments) ;
    var v, accessoryViewWidths, leftAdjustment, rightAdjustment;

    // always have at least an empty string
    v = this.get('fieldValue');
    if (SC.none(v)) v = '';
    v = String(v);

    // update layer classes always
    context.setClass('not-empty', v.length > 0);

    // If we have accessory views, we'll want to update the padding on the
    // hint to compensate for the width of the accessory view.  (It'd be nice
    // if we could add in the original padding, too, but there's no efficient
    // way to do that without first rendering the element somewhere on/off-
    // screen, and we don't want to take the performance hit.)
    accessoryViewWidths = this._getAccessoryViewWidths() ;
    leftAdjustment  = accessoryViewWidths['left'] ;
    rightAdjustment = accessoryViewWidths['right'] ;

    if (leftAdjustment)  leftAdjustment  += 'px' ;
    if (rightAdjustment) rightAdjustment += 'px' ;

   this._renderField(context, firstTime, v, leftAdjustment, rightAdjustment) ;
    if(SC.browser.mozilla) this.invokeLast(this._applyFirefoxCursorFix);
  },

  /**
    If isTextArea is changed (this might happen in inlineeditor constantly)
    force the field render to render like the firsttime to avoid writing extra
    code. This can be useful also 
  */
  _forceRenderFirstTime: NO,
    
  _renderFieldLikeFirstTime: function(){
    this.set('_forceRenderFirstTime', YES);
  }.observes('isTextArea'),
  
  _renderField: function(context, firstTime, value, leftAdjustment, rightAdjustment) {
    // TODO:  The cleanest thing might be to create a sub- rendering context
    //        here, but currently SC.RenderContext will render sibling
    //        contexts as parent/child.

    var hint = this.get('hint'), disabled, name, adjustmentStyle, type, 
        hintElements, element, paddingElementStyle, fieldClassNames,
        spellCheckEnabled=this.get('spellCheckEnabled'), spellCheckString,
        maxLength = this.get('maxLength'), isOldSafari;
        
    context.setClass('text-area', this.get('isTextArea'));
    
    //Adding this to differentiate between older and newer versions of safari
    //since the internal default field padding changed 
    isOldSafari= (parseInt(SC.browser.safari,0)<532);
    context.setClass('oldWebKitFieldPadding', isOldSafari);
    
    spellCheckString = spellCheckEnabled ? ' spellcheck="true"' : ' spellcheck="false"';
    if (firstTime || this._forceRenderFirstTime) {
      this._forceRenderFirstTime = NO;
      disabled = this.get('isEnabled') ? '' : 'disabled="disabled"' ;
      name = this.get('layerId');
      
      context.push('<span class="border"></span>');

      // Render the padding element, with any necessary positioning
      // adjustments to accommodate accessory views.
      adjustmentStyle = '' ;
      if (leftAdjustment  ||  rightAdjustment) {
        adjustmentStyle = 'style="' ;
        if (leftAdjustment)  adjustmentStyle += 'left: '  + leftAdjustment  + '; ' ;
        if (rightAdjustment) adjustmentStyle += 'right: ' + rightAdjustment + ';' ;
        adjustmentStyle += '"' ;
      }
      context.push('<span class="padding" '+adjustmentStyle+'>');
                  
      value = this.get('escapeHTML')?SC.RenderContext.escapeHTML(value):value;
      if(!this.get('_supportsPlaceHolder') && (!value || (value && value.length===0))) {
        value = this.get('hint');
        context.setClass('sc-hint', YES);
      } 
      
      //for gecko pre 1.9 vertical aligment is completely broken so we need
      //different styling.
      fieldClassNames = (SC.browser.mozilla &&
                          (parseFloat(SC.browser.mozilla)<1.9 || 
                          SC.browser.mozilla.match(/1\.9\.0|1\.9\.1/))) ?
                          "field oldGecko": "field";
      
      // Render the input/textarea field itself, and close off the padding.
      if (this.get('isTextArea')) {
        context.push('<textarea class="',fieldClassNames,'" name="', name, 
                      '" ', disabled, ' placeholder="',hint, '"',
                      spellCheckString,' maxlength="', maxLength, '">', 
                      value, '</textarea></span>') ;
      }
      else {
        type = this.get('isPassword') ? 'password' : 'text' ;
        context.push('<input class="',fieldClassNames,'" type="', type,
                      '" name="', name, '" ', disabled, ' value="', value,
                      '" placeholder="',hint,'"', spellCheckString, 
                      ' maxlength="', maxLength, '" /></span>') ;
      }

    }
    else {
      var input= this.$input();
      if(!this.get('_supportsPlaceHolder')){
        var val = this.get('value');
        if((!val || (val && val.length===0))){
          if(this.get('hintON') && !this.get('isFirstResponder')){
            //console.log('hint on render');
            context.setClass('sc-hint', YES);
            input.val(hint);
          }else{
            // console.log('removing hint on render');
            context.setClass('sc-hint', NO);
            input.val('');
          }
        }
      }else{
        input.attr('placeholder', hint);
      }
      
      // Enable/disable the actual input/textarea as appropriate.
      element = input[0];
      if (element) {
        if (!this.get('isEnabled')) {
          element.disabled = 'true' ;
        }
        else {
          element.disabled = null ;
        }

        // Adjust the padding element to accommodate any accessory views.
        paddingElementStyle = element.parentNode.style;
        if (leftAdjustment) {
          if (paddingElementStyle.left !== leftAdjustment) {
            paddingElementStyle.left = leftAdjustment ;
          }
        }
        else {
          paddingElementStyle.left = null ;
        }

        if (rightAdjustment) {
          if (paddingElementStyle.right !== rightAdjustment) {
            paddingElementStyle.right = rightAdjustment ;
          }
        }
        else {
          paddingElementStyle.right = null ;
        }
      }
    }
  },

  _getAccessoryViewWidths: function() {
    var widths = {},
        accessoryViewPositions = ['left', 'right'],
        numberOfAccessoryViewPositions = accessoryViewPositions.length, i,
        position, accessoryView, frames, width, layout, offset, frame;
    for (i = 0;  i < numberOfAccessoryViewPositions;  i++) {
      position = accessoryViewPositions[i];
      accessoryView = this.get(position + 'AccessoryView');
      if (accessoryView) {
        // need acessoryView as an instance, not class...
        if (accessoryView.isClass) {
          accessoryView = accessoryView.create({
            layoutView: this
          });
        }
        // sanity check
        if (accessoryView.get) {
          frame = accessoryView.get('frame');
          if (frame) {
            width = frame.width;
            if (width) {
              // Also account for the accessory view's inset.
              layout = accessoryView.get('layout');
              if (layout) {
                offset = layout[position];
                width += offset;
              }
              widths[position] = width;
            }
          }
        }
      }
    }
    return widths;
  },

  // ..........................................................
  // HANDLE NATIVE CONTROL EVENTS
  //

  didCreateLayer: function() {
    arguments.callee.base.apply(this,arguments); 
    // For some strange reason if we add focus/blur events to textarea
    // inmediately they won't work. However if I add them at the end of the
    // runLoop it works fine.
    if(!this.get('_supportsPlaceHolder') && this.get('hintON')){
      var currentValue = this.$input().val();
      if(!currentValue || (currentValue && currentValue.length===0)){
        // console.log('hint on didcreatelayer');
        this.$input().val(this.get('hint'));
      }
    }
    if(this.get('isTextArea')) {
      this.invokeLast(this._addTextAreaEvents);
    }
    else {
      this._addTextAreaEvents();
      
      // In Firefox, for input fields only (that is, not textarea elements),
      // if the cursor is at the end of the field, the "down" key will not
      // result in a "keypress" event for the document (only for the input
      // element), although it will be bubbled up in other contexts.  Since
      // SproutCore's event dispatching requires the document to see the
      // event, we'll manually forward the event along.
      if (SC.browser.mozilla) {
        var input = this.$input();
        SC.Event.add(input, 'keypress', this, this._firefox_dispatch_keypress);
      }
    }
  },
  
  
  /** 
    Adds all the textarea events. This functions is called by didCreateLayer
    at different moments depending if it is a textarea or not. Appending 
    events to text areas is not reliable unless the element is already added 
    to the DOM.
    
  */
  _addTextAreaEvents: function() {
    var input = this.$input();
    SC.Event.add(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.add(input, 'blur',  this, this._textField_fieldDidBlur);
    
    // There are certain ways users can select text that we can't identify via
    // our key/mouse down/up handlers (such as the user choosing Select All
    // from a menu).
    SC.Event.add(input, 'select', this, this._textField_selectionDidChange);
        
    if(SC.browser.mozilla){
      // cache references to layer items to improve firefox hack perf
      this._cacheInputElement = this.$input();
      this._cachePaddingElement = this.$('.padding');
    }
  },


  /**
    Removes all the events attached to the textfield
  */
  
  willDestroyLayer: function() {
    arguments.callee.base.apply(this,arguments);

    var input = this.$input();
    SC.Event.remove(input, 'focus',  this, this._textField_fieldDidFocus);
    SC.Event.remove(input, 'blur',   this, this._textField_fieldDidBlur);
    SC.Event.remove(input, 'select', this, this._textField_selectionDidChange);
    SC.Event.remove(input, 'focus',  this, this._firefox_dispatch_keypress);
  },
  
  /**
    This function is called by the event when the textfield gets focus
  */

  _textField_fieldDidFocus: function(evt) {
    SC.run(function() {
      this.set('focused',YES);
      this.fieldDidFocus(evt);
      var val = this.get('value');
      if(!this.get('_supportsPlaceHolder') && ((!val) || (val && val.length===0))){
        // console.log('turn off hint');
        this.set('hintON', NO);
      }
    }, this);
  },

  /**
    This function is called by the event when the textfield blurs
  */

  _textField_fieldDidBlur: function(evt) {
    SC.run(function() {
      this.set('focused',NO);
      // passing the original event here instead that was potentially set from
      // loosing the responder on the inline text editor so that we can
      // use it for the delegate to end editing
      this.fieldDidBlur(this._origEvent);
      var val = this.get('value');
      if(!this.get('_supportsPlaceHolder') && ((!val) || (val && val.length===0))){
        // console.log('turn on hint');
        this.set('hintON', YES);
      }
    }, this);
  },
  
  fieldDidFocus: function(evt) {
    this.beginEditing(evt);
    
    // We have to hide the intercept pane, as it blocks the events. 
    // However, show any that we previously hid, first just in case something wacky happened.
    if (this._didHideInterceptForPane) {
      this._didHideInterceptForPane.showTouchIntercept();
      this._didHideInterceptForPane = null;
    }
    
    // now, hide the intercept on this pane if it has one
    var pane = this.get('pane');
    if (pane && pane.get("usingTouchIntercept")) {
      // hide
      pane.hideTouchIntercept();
      
      // and set our internal one so we can unhide it (even if the pane somehow changes)
      this._didHideInterceptForPane = this.get("pane");
    }
  },
  
  fieldDidBlur: function(evt) {
    this.commitEditing(evt);
    
    // get the pane we hid intercept pane for (if any)
    var touchPane = this._didHideInterceptForPane;
    if (touchPane) {
      touchPane.showTouchIntercept();
      touchPane = null;
    }
  },
  
  _field_fieldValueDidChange: function(evt) {
    if(this.get('focused')){
      SC.run(function() {
        this.fieldValueDidChange(NO);        
      }, this);
    }
  },

  /**
    Move magic number out so it can be over-written later in inline editor
  */
  _topOffsetForFirefoxCursorFix: 3,


  /**
    Mozilla had this bug until firefox 3.5 or gecko 1.8 They rewrote input text
    and textareas and now they work better. But we have to keep this for older
    versions.
  */
  _applyFirefoxCursorFix: function() {
    // Be extremely careful changing this code.  !!!!!!!! 
    // Contact me if you need to change or improve the code. After several 
    // iterations the new way to apply the fix seems to be the most 
    // consistent.
    // This fixes: selection visibility, cursor visibility, and the ability 
    // to fix the cursor at any position. As of FF 3.5.3 mozilla hasn't fixed this 
    // bug, even though related bugs that I've found on their database appear
    // as fixed.  
    
    // UPDATE: Things seem to be working on FF3.6 therefore we are disabling the
    // hack for the latest versions of FF.
    // 
    // Juan Pinzon
    
    if (parseFloat(SC.browser.mozilla)<1.9 && !this.get('useStaticLayout')) {
      var top, left, width, height, p, layer, element, textfield;
      
      // I'm caching in didCreateLayer this elements to improve perf
      element = this._cacheInputElement;
      textfield = this._cachePaddingElement;
      if(textfield && textfield[0]){
        layer = textfield[0];
        p = SC.$(layer).offset() ;
      
        // this is to take into account an styling issue.
        // this is counterproductive in FF >= 3.6
        if(SC.browser.compareVersion(1,9,2) < 0 && 
           element[0].tagName.toLowerCase()==="input") {
          top = p.top+this._topOffsetForFirefoxCursorFix; 
        }
        else top = p.top;
        left = p.left;
        width = layer.offsetWidth;
        height = layer.offsetHeight ;
      
        var style = 'position: fixed; top: %@px; left: %@px; width: %@px; height: %@px;'.fmt(top, left, width, height) ;
        // if the style is the same don't re-apply
        if(!this._prevStyle || this._prevStyle!=style) element.attr('style', style) ;
        this._prevStyle = style;
      }
    }
    return this ;
  },
  
  
  /**
    In Firefox, as of 3.6 -- including 3.0 and 3.5 -- for input fields only
    (that is, not textarea elements), if the cursor is at the end of the
    field, the "down" key will not result in a "keypress" event for the
    document (only for the input element), although it will be bubbled up in
    other contexts.  Since SproutCore's event dispatching requires the
    document to see the event, we'll manually forward the event along.
  */
  _firefox_dispatch_keypress: function(evt) {
    var selection = this.get('selection'),
        value     = this.get('value'),
        valueLen  = value ? value.length : 0,
        responder;
    
    if (!selection  ||  ((selection.get('length') === 0  &&  (selection.get('start') === 0)  ||  selection.get('end') === valueLen))) {
      responder = SC.RootResponder.responder;
      responder.keypress.call(responder, evt);
      evt.stopPropagation();
    }
  },
  
  
  _textField_selectionDidChange: function() {
    this.notifyPropertyChange('selection');
  },

  // ..........................................................
  // FIRST RESPONDER SUPPORT
  //
  // When we become first responder, make sure the field gets focus and
  // the hint value is hidden if needed.

  // when we become first responder, focus the text field if needed and
  // hide the hint text.
  /** @private */
  willBecomeKeyResponderFrom: function(keyView) {
    if(this.get('isVisibleInWindow')) {
      var inp = this.$input()[0];
      try{ 
        if(inp) inp.focus(); 
      } 
      catch(e){}
      if(!this._txtFieldMouseDown){
        this.invokeLast(this._selectRootElement) ;
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    //if (this._isFocused) this._isFocused = NO ;
  },

  // In IE, you can't modify functions on DOM elements so we need to wrap the
  // call to select() like this.
  _selectRootElement: function() {
    // make sure input element still exists, as a redraw could have remove it
    // already
    var inputElem = this.$input()[0];
    if(inputElem) inputElem.select() ;
    else this._textField_selectionDidChange();
  },

  // when we lose first responder, blur the text field if needed and show
  // the hint text if needed.
  /** @private */
  didLoseKeyResponderTo: function(keyView) {
    var el = this.$input()[0];
    if (el) el.blur();
    
    this.invokeLater("scrollToOriginIfNeeded", 100);
  },
  
  /**
    @private
    Scrolls to origin if necessary (if the pane's current firstResponder is not a text field).
  */
  scrollToOriginIfNeeded: function() {
    var pane = this.get("pane");
    if (!pane) return;
    
    var first = pane.get("firstResponder");
    if (!first || !first.get("isTextField")) {
      document.body.scrollTop = document.body.scrollLeft = 0;
    }
  },

  parentViewDidResize: function() {
    if (SC.browser.mozilla) {
      this.invokeLast(this._applyFirefoxCursorFix);
    }
    arguments.callee.base.apply(this,arguments);
  },

  /** @private
    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) {
    // Handle return and escape.  this way they can be passed on to the
    // responder chain.
    // If the event is triggered by a return while entering IME input,
    // don't got through this path.
    var which = evt.which, maxLengthReached = false;
    if ((which === 13 && !evt.isIMEInput) && !this.get('isTextArea')) return NO ;
    if (which === 27) return NO ;

    // handle tab key
    if (which === 9 && this.get('defaultTabbingEnabled')) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if (view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }
    // maxlength for textareas
    if(!SC.browser.safari && this.get('isTextArea')){
      var val = this.get('value');
      if(val && evt.which>47 && (val.length >= this.get('maxLength'))) {
        maxLengthReached = true;
      }
    }
    // validate keyDown...
    // do not validate on touch, as it prevents return.
    if ((this.performValidateKeyDown(evt) || SC.platform.touch) && !maxLengthReached) {
      this._isKeyDown = YES ;
      evt.allowDefault();
    } else {
      evt.stop();
    }
    
    if (this.get('applyImmediately')) {
      // We need this invokeLater as we need to get the value of the field
      // once the event has been processed. I tried with invokeLast , but
      // I guess the field doesn't repaint until js execution finishes and 
      // therefore the field value doesn't update if we don't give it a break.
      this.invokeLater(this.fieldValueDidChange,1); // notify change
    }
    return YES;
  },

  keyUp: function(evt) {
    if(SC.browser.mozilla && evt.keyCode===13) this.fieldValueDidChange(); 
    // The caret/selection could have moved.  In some browsers, though, the
    // element's values won't be updated until after this event is finished
    // processing.
    this.notifyPropertyChange('selection');
    this._isKeyDown = NO;
    evt.allowDefault();
    return YES;
  },

  mouseDown: function(evt) {
    var fieldValue = this.get('fieldValue'); // use 'fieldValue' since we want actual text
    this._txtFieldMouseDown=YES;
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else {
      return arguments.callee.base.apply(this,arguments);
    }
  },

  mouseUp: function(evt) {
    this._txtFieldMouseDown=NO;
    // The caret/selection could have moved.  In some browsers, though, the
    // element's values won't be updated until after this event is finished
    // processing.
    this.notifyPropertyChange('selection');
    
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } 
    return arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Adds mouse wheel support for textareas.
  */
  mouseWheel: function(evt) {
    evt.allowDefault();
    return YES;
  },

  /*
    Allows text selection in IE. We block the IE only event selectStart to 
    block text selection in all other views.
  */
  selectStart: function(evt) {
    return YES;
  },
  
  /**
    This function is to notify if the browser supports the placeholder attribute
    or not. Currently is disabled as in webkit there is a bug where the color 
    of the placeholder doesn't refresh all the time.
  */
  _supportsPlaceHolder: function(){
    return SC.browser.safari && !this.get('isTextArea');
  }.property('isTextArea').cacheable(),
  
  
  valueObserver: function(){
    // console.log('value observer');
    var val = this.get('value');
    if (val && val.length>0) this.set('hintON', NO);
    else this.set('hintON', YES);
  }.observes('value')
  
});

/* >>>>>>>>>> BEGIN source/mixins/inline_text_field.js */
// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

sc_require('views/text_field') ;

/**
  @class
  
  The inline text editor is used to display an editable area for controls 
  that are not always editable such as label views and source list views.
  
  You generally will not use the inline editor directly but instead will
  invoke beginEditing() and endEditing() on the views you are 
  editing. If you would like to use the inline editor for your own views, 
  you can do that also by using the editing API described here.
  
  h2. Using the Inline Editor in Your Own Views

  If you need to use the inline editor with custom views you have written,
  you will need to work with the class methods to begin, commit, and discard
  editing changes.
  
  h3. Starting the Editor
  
  The inline editor works by positioning itself over the top of your view 
  with the same offset, width, and font information.  As the user types, the
  field will automatically resize vertically to make room for the user's text.
  
  To activate the inline editor you must call beginEdition() with at least 
  the target view you want the editor to position itself on top of:
  
  {{{
    SC.InlineTextFieldView.beginEditing({
      target: view, validator: validator
    }) ;
  }}}

  You can pass a variety of options to this method to configure the inline
  editor behavior, including:

  - *frame* The editors initial frame in viewport coordinates. (REQ)
  - *delegate* Delegate to receive update notices. (REQ)
  - *value* Initial value of the edit field.
  - *exampleElement* A DOM element to use when copying styles.
  - *multiline* If YES then the hitting return will add to the value instead of exiting the inline editor.
  - *selectedRange* The range of text that should be selected.  If omitted, then the insertion point will be placed at the end of the value.
  - *commitOnBlur* If YES then blurring will commit the value, otherwise it will discard the current value.  Defaults to YES.
  - *validator* Validator to be attached to the field.
  
  If the inline editor is currently in use elsewhere, it will automatically
  close itself over there and begin editing for your view instead.  The 
  editor expects your source view to implement the InlineTextFieldViewDelegate
  protocol.

  h2. Committing or Discarding Changes
  
  Normally the editor will automatically commit or discard its changes 
  whenever the user exits the edit mode.  If you need to force the editor to
  end editing, you can do so by calling commitEditing() or discardEditing():
  
  {{{
    SC.InlineTextFieldView.commitEditing();
    SC.InlineTextFieldView.discardEditing();
  }}}
  
  Both methods will try to end the editing context and will call the 
  relevant delegate methods on the delegate you passed to beginEditing().
  
  Note that it is possible an editor may not be able to commit editing 
  changes because either the delegate disallowed it or because its validator
  failed.  In this case commitEditing() will return NO.  If you want to
  end editing anyway, you can discard the editing changes instead by calling
  discardEditing().  This method will generally succeed unless your delegate
  refuses it as well.
  
  @extends SC.TextFieldView
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.InlineTextFieldView = SC.TextFieldView.extend(SC.DelegateSupport,
/** @scope SC.InlineTextFieldView.prototype */ {

  /**
    Over-write magic number from SC.TextFieldView
  */
  _topOffsetForFirefoxCursorFix: 0,

  /**
    Invoked by the class method to begin editing on an inline editor.
    
    You generally should call the class method beginEditing() instead of
    this one since it will make sure to create and use the shared editor
    instance.

    @params options {Hash} hash of options for editing
    @returns {SC.InlineTextFieldView|Boolean} this if editor began editing, 
      NO if it failed.
  */
  beginEditing: function(options) {

    // options are required
    //@if(debug)
    if (!options) throw "InlineTextField.beginEditing() requires options";
    //@end

    // can't begin editing again if already editing
    if (this.get('isEditing')) return NO ;
    
    var layout={}, pane, delLayout, paneElem, del;

    del = this._delegate = options.delegate ;
    this.set('delegate', del);
    
    // continue only if the delegate allows it
    if (!this.invokeDelegateMethod(del, 'inlineEditorShouldBeginEditing', this)) {
      //@if(debug)
      SC.Logger.warn('InlineTextField.beginEditing() cannot begin without inlineEditorShouldBeginEditing() on the delegate.');
      //@end
      return NO;
    }
    this.beginPropertyChanges();
    
    this.set('isEditing', YES) ;
    this.set('escapeHTML', options.escapeHTML) ;
    
    this._optframe = options.frame ;
    this._optIsCollection = options.isCollection;
    this._exampleElement = options.exampleElement ;

    if (!this._optframe || !del) {
      throw "At least frame and delegate options are required for inline editor";
    }
    
    this._originalValue = options.value;
    if (SC.none(this._originalValue))
      this._originalValue = "";
    this._multiline = (options.multiline !== undefined) ? options.multiline : NO ;
    if (this._multiline) {
      this.set('isTextArea', YES);
    } else {
      this.set('isTextArea', NO);
    }
    this._commitOnBlur =  (options.commitOnBlur !== undefined) ? options.commitOnBlur : YES ;

    // set field values
    this.set('validator', options.validator) ;
    this.set('value', this._originalValue) ;
    //this.set('selectedRange', options.selectedRange || { start: this._originalValue.length, length: 0 }) ;
    
    // add to window.
    
    pane = del.get('pane');

    layout.height = this._optframe.height;
    layout.width=this._optframe.width;
    delLayout = this._delegate.get('layout');
    paneElem = pane.$()[0];
    if (this._optIsCollection && delLayout.left) {
      layout.left=this._optframe.x-delLayout.left-paneElem.offsetLeft-1;
      if(SC.browser.msie==7) layout.left--;
    } else {
      layout.left=this._optframe.x-paneElem.offsetLeft-1;
      if(SC.browser.msie==7) layout.left--;
    }
    
    if (this._optIsCollection && delLayout.top) {
      layout.top=this._optframe.y-delLayout.top-paneElem.offsetTop;
      if(SC.browser.msie==7) layout.top=layout.top-2;
    } else {
      layout.top=this._optframe.y-paneElem.offsetTop;
      if(SC.browser.msie==7) layout.top=layout.top-2;  
    }

    this.set('layout', layout);
  
    this.set('parentNode', pane);
    // get style for view.
   
    pane.appendChild(this);
    
    this._className = this.getDelegateProperty(del,"inlineEditorClassName");
    if(this._className && !this.hasClassName(this._className)) {
      this.setClassName(this._className,true);
    }
    
    this.invokeDelegateMethod(del, 'inlineEditorWillBeginEditing', this) ;
    // this.resizeToFit(this.getFieldValue()) ;

    this._previousFirstResponder = pane ? pane.get('firstResponder') : null;
    this.becomeFirstResponder();
    this.endPropertyChanges() ;
    
    // TODO: remove? if(SC.browser.mozilla)this.invokeOnce(this.becomeFirstResponder) ;
      
    // Become first responder and notify the delegate after run loop completes
    this.invokeLast(function() {
      this.invokeDelegateMethod(del, 'inlineEditorDidBeginEditing', this);
    });
    
    return this;
  },
  
  
  /**
    Tries to commit the current value of the field and end editing.  
    
    Do not use this method, use the class method instead.
    
    @param {Event} evt that triggered the commit to happen
    @returns {Boolean}
  */
  commitEditing: function(evt) {
    // try to validate field.  If it fails, return false.  
    if (!SC.$ok(this.validateSubmit())) return NO ;
    return this._endEditing(this.get('value'), evt) ;
  },
  
  /**
    Tries to discard the current value of the field and end editing.
    
    Do not use this method, use the class method instead.

    @returns {Boolean}
  */
  discardEditing: function() {
    return this._endEditing(this._originalValue, null, YES) ;
  },
  
  /**
    Invoked whenever the editor loses (or should lose) first responder 
    status to commit or discard editing.
    
    @returns {Boolean}
  */
  blurEditor: function(evt) {
    if (!this.get('isEditing')) return YES ;
    return this._commitOnBlur ? this.commitEditing(evt) : this.discardEditing(evt);  
  },
  
  /** @private
    Called by commitEditing and discardEditing to actually end editing.
    
    @param {String} finalValue that will be set as value
    @param {Event} evt that triggered the end editing to occur
    @param {Boolean} didDiscard if called from discardEditing
    @returns {Boolean} NO if editing did not exit
  */
  _endEditing: function(finalValue, evt, didDiscard) {
    if (!this.get('isEditing')) return YES ;
    
    // get permission from the delegate.
    var del = this._delegate ;
    if (!this.invokeDelegateMethod(del, 'inlineEditorShouldEndEditing', this, finalValue, evt, didDiscard)) {
      //@if(debug)
      SC.Logger.warn('InlineTextField._endEditing() cannot end without inlineEditorShouldEndEditing() on the delegate.');
      //@end
      return NO;
    }
    // OK, we are allowed to end editing.  Notify delegate of final value
    // and clean up.
    this.invokeDelegateMethod(del, 'inlineEditorDidEndEditing', this, finalValue, evt, didDiscard) ;

    // If the delegate set a class name, let's clean it up:
    if(this._className) this.setClassName(this._className, false);
    
    // cleanup cached values
    this._originalValue = this._delegate = this._exampleElement =  this._optframe = this._className = null ;
    this.set('isEditing', NO) ;

    // resign first responder if not done already.  This may call us in a 
    // loop but since isEditing is already NO, nothing will happen.
    if (this.get('isFirstResponder')) {
      var pane = this.get('pane');
      if (pane && this._previousFirstResponder) {
        pane.makeFirstResponder(this._previousFirstResponder);
      } else this.resignFirstResponder();
    }
    this._previousFirstResponder = null ; // clearout no matter what
    
    if (this.get('parentNode')) this.removeFromParent() ;  
    
    return YES ;
  },
  
  /**
    YES if the editor is currently visible and editing.
  
    @property {Boolean}
  */
  isEditing: NO,
  
  // TODO: make this function work for 1.0
  // /**
  //   Resizes the visible textarea to fix the actual text in the text area.
  //   
  //   This method works by keeping a div positioned immediately beneath the 
  //   text area with an opacity of 0 that contains the same text as the 
  //   input text field itself.  This is then used to calculate the required 
  //   size for the text area.
  // */
  // resizeToFit: function(newValue)
  // {
  //   
  // 
  // 
  // var sizer  = this.outlet('sizer');
  //     var field  = this.outlet('field');
  //     
  //     // XSS attack waiting to happen... escape the form input;
  //     var text = (newValue || '').escapeHTML();
  // 
  //     // convert the textarea's newlines into something comparable for the sizer 
  //     // div appending a space to give a line with no text a visible height.
  //     text = text.replace((/ {2}/g), "&nbsp; ").replace(/\n/g, "<br />&nbsp;");
  //     
  //     // get the text size
  //     sizer.set('innerHTML', text || "&nbsp;");
  //     sizer.recacheFrames() ;
  //     var h = sizer.get('frame').height;
  //     this.set('frame', { height: h }) ;
  // },
  
  /** @private */
  mouseDown: function(e) {
    arguments.callee.base.call(this, e) ;
    return this.get('isEditing');
  },
  
  touchStart: function(e){
    this.mouseDown(e);
  },
  
  /** @private */
  keyDown: function(evt) {
    var ret = this.interpretKeyEvents(evt) ;
    this.fieldValueDidChange(true);
    return !ret ? NO : ret ;
  },
  
  /** @private */
  insertText: null,
  
  //keyUp: function() { return true; },

  _scitf_blurInput: function() {
    var el = this.$input()[0];
    if (el) el.blur();
    el = null;
  },

  // [Safari] if you don't take key focus away from an element before you 
  // remove it from the DOM key events are no longer sent to the browser.
  /** @private */
  willRemoveFromParent: function() {
    return this._scitf_blurInput();
  },
  
  // ask owner to end editing.
  /** @private */
  willLoseFirstResponder: function(responder, evt) {
    if (responder !== this) return;

    // if we're about to lose first responder for any reason other than
    // ending editing, make sure we clear the previous first responder so 
    // isn't cached
    this._previousFirstResponder = null;
    
    // store the original event that caused this to loose focus so that
    // it can be passed to the delegate
    this._origEvent = evt;
    
    // should have been covered by willRemoveFromParent, but this was needed 
    // too.
    this._scitf_blurInput();
    return this.blurEditor(evt) ;
  },
  
  /**
    invoked when the user presses escape.  Returns true to ignore keystroke
    
    @returns {Boolean}
  */
  cancel: function() { 
    this.discardEditing(); 
    return YES;
  },
  
  // do it here instead of waiting on the binding to make sure the UI
  // updates immediately.
  /** @private */
  fieldValueDidChange: function(partialChange) {
    arguments.callee.base.call(this, partialChange) ;
    //this.resizeToFit(this.getFieldValue()) ;
  },
  
  // invoked when the user presses return.  If this is a multi-line field,
  // then allow the newine to proceed.  Otherwise, try to commit the 
  // edit.
  /** @private */
  insertNewline: function(evt) { 
    if (this._multiline) {
      evt.allowDefault();
      return arguments.callee.base.call(this, evt) ;
    } else {
      // TODO : this is a work around. There is a bug where the 
      // last character would get dropped 
      // if the editing was completed by pressing return
      // needs to be fixed
      if (this.get('value') != this.$input().val()) {
        this.set('value', this.$input().val());
      }
      
      
      this.commitEditing() ;
      return YES ;
    }
  },
  
  // Tries to find the next key view when tabbing.  If the next view is 
  // editable, begins editing.
  /** @private */
  insertTab: function(evt) {
    var delegate = this._delegate; // removed by commitEditing()
    this.resignFirstResponder();
    this.commitEditing() ;
    if(delegate){
      var next = delegate.get('nextValidKeyView');
      if(next && next.beginEditing) next.beginEditing();
    }
    return YES ;
  },

  /** @private */
  insertBacktab: function(evt) {
    var delegate = this._delegate; // removed by commitEditing()
    this.resignFirstResponder();
    this.commitEditing() ;
    if(delegate){
      var prev = delegate.get('previousValidKeyView');
      if(prev && prev.beginEditing) prev.beginEditing();
    }
    return YES ;
  },
  
  /** @private */
  deleteForward: function(evt) {
    evt.allowDefault();
    return YES;
  },
  
  /** @private */
  deleteBackward: function(evt) {
    evt.allowDefault();
    return YES ;
  }
  
});


SC.InlineTextFieldView.mixin(
/** @scope SC.InlineTextFieldView */ {
  
  /** Call this method to make the inline editor begin editing for your view.
      
      If the inline editor is already being used for another value it will
      try to dismiss itself from the other editor and attach itself to the
      new view instead.  If this process fails for some reason (for example
      if the other view did not allow the view to end editing) then this
      method will return false.

      You should pass a set of options that at least includes the target
      view.  See class definition for options.
      
      @params options {Hash} hash of options for editing
      @returns {Boolean} YES if editor began editing, NO if it failed.
  */
  beginEditing: function(options) {
    this._exampleElement = options.exampleElement ;
    
    // If exampleInlineTextFieldView is set, load this class otherwise use
    // the default, this.
    var klass = options.exampleInlineTextFieldView 
              ? options.exampleInlineTextFieldView : this,
        layout = options.delegate.get('layout'),
        s = this.updateViewStyle(),
        p = this.updateViewPaddingStyle();
    
    var str= ".inline-editor input{"+s+"} ";
    str= str+".inline-editor textarea{"+s+"} .inline-editor .padding{"+p+"}";
    var pa= document.getElementsByTagName('head')[0],
    el= document.createElement('style');
    el.type= 'text/css';
    el.media= 'screen';
    if(el.styleSheet) el.styleSheet.cssText= str;// IE method
    else el.appendChild(document.createTextNode(str));// others
    pa.appendChild(el);
    
    this.editor = klass.create({ classNames: 'inline-editor', layout: layout}) ;
    return this.editor.beginEditing(options) ;
    
  },
  
  /** Save the current value of the inline editor and exit edit mode.
  
    If the inline editor is being used it will try to end the editing and
    close.  If the inline editor could not end for some reason (for example
    if the delegate did not allow the editing to end) then this method will
    return NO.
    
    @returns {Boolean} YES if the inline editor ended or no edit was in 
      progress.
  */
  commitEditing: function() {
    return this.editor ? this.editor.commitEditing() : YES ;
  },

  /** Discard the current value of the inline editor and exit edit mode.
  
    If the inline editor is in use, this method will try to end the editing,
    restoring the original value of the target view.  If the inline editor
    could not end for some reason (for example if the delegate did not 
    allow editing to end) then this method will return NO.
    
    @returns {Boolean} YES if the inline editor ended or no edit was in progress.
  */
  discardEditing: function() {
    return this.editor ? this.editor.discardEditing() : YES ;  
  },
  
  /** @private */
  updateViewStyle: function() {
    var el = this._exampleElement[0],
        styles = '',
        s=SC.getStyle(el,'font-size');
    if(s && s.length>0) styles = styles + "font-size: "+ s + " !important; ";
    s=SC.getStyle(el,'font-family');
    if(s && s.length>0) styles = styles + "font-family: " + s + " !important; ";
    s=SC.getStyle(el,'font-weight');
    if(s && s.length>0) styles = styles + "font-weight: " + s + " !important; ";
    s=SC.getStyle(el,'z-index');
    if(s && s.length>0) styles = styles + "z-index: " + s + " !important; ";
    s=SC.getStyle(el,'line-height');
    if(s && s.length>0) styles = styles + "line-height: " + s + " !important; ";
    s=SC.getStyle(el,'text-align');
    if(s && s.length>0) styles = styles + "text-align: " + s + " !important; ";
    s=SC.getStyle(el,'top-margin');
    if(s && s.length>0) styles = styles + "top-margin: " + s + " !important; ";
    s=SC.getStyle(el,'bottom-margin');
    if(s && s.length>0) styles = styles + "bottom-margin: " + s + " !important; ";
    s=SC.getStyle(el,'left-margin');
    if(s && s.length>0) styles = styles + "left-margin: " + s + " !important; ";
    s=SC.getStyle(el,'right-margin');
    if(s && s.length>0) styles = styles + "right-margin: " + s + " !important; ";
    
    return styles;
  },

  /** @private */
  updateViewPaddingStyle: function() {
    var el = this._exampleElement[0] ;   
    var styles = '';
    var s=SC.getStyle(el,'padding-top');
    if(s && s.length>0) styles = styles + "top: "+ s + " !important; ";
    s=SC.getStyle(el,'padding-bottom');
    if(s && s.length>0) styles = styles + "bottom: " + s + " !important; ";
    s=SC.getStyle(el,'padding-left');
    if(s && s.length>0) styles = styles + "left: " + s + " !important; ";
    s=SC.getStyle(el,'padding-right');
    if(s && s.length>0) styles = styles + "right: " + s + " !important; ";
    
    return styles;
  },

  
  /**
    The current shared inline editor.  This property will often remain NULL
    until you actually begin editing for the first time.
    
    @property {SC.InlineTextFieldView}
  */
  editor: null
  
}) ;
/* >>>>>>>>>> BEGIN source/protocols/inline_editor_delegate.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  The inline editor delegate receives notifications from the inline text
  editor before, during, and after the user completes inline editing.
  
  The inline editor delegate is used by views that work with the inline
  editor.  You may need to implement this protocol if you want to
  use the inline editor in your own custom views.
  
  @since SproutCore 1.0
*/
SC.InlineEditorDelegate = {
  
    /**
     This is a  classname you can apply to the inline editor field
     to configure it's styling, in addition to the the editor's 
     default style-cloning behavior.
      
      @property inlineEditorClassName {String} A class name to use with the inline editor.
    */
    inlineEditorClassName: "",
  
  
    /**
      Called just before the inline edit displays itself but after it has been 
      configured for display.  
      
      You can use this method to make last minute changes to the display of 
      the inline editor or to collect its value.
      
      @param inlineEditor {SC.InlineTextFieldView} The inline editor.
      @returns {void}
    */
    inlineEditorWillBeginEditing: function(inlineEditor) {},

    /**
      Called just after an inline editor displays itself.
      
      You can use this method to perform any hiding or other view changes
      you need to perform on your own view to make room for the new editor.
      
      Note tht editors are placed over the top of views in the page, not 
      inside of them from a DOM perspective.
      
      @param inlineEditor {SC.InlineTextFieldView} The inline editor.
      @returns {void}
    */
    inlineEditorDidBeginEditing: function(inlineEditor) {},
    
    /**
      Called just before an inline editor tries to end editing and hide 
      itself.
      
      You can use this method to control whether the inline editor will
      actually be allowed to end editing.  For example, you might disallow
      the editor to end editing if the new value fails validation.
      
      @param inlineEditor {SC.InlineTextFieldView} the inline editor
      @param finalValue {Object} the final value
      @returns {Boolean} YES to allow the editor to end editing.
    */
    inlineEditorShouldEndEditing: function(inlineEditor, finalValue) {
      return YES ;
    },
    
    /**
      Called just after the inline editor has ended editing. You can use this 
      method to save the final value of the inline editor and to perform any 
      other cleanup you need to do.
      
      @param inlineEditor {SC.InlineTextFieldView} the inline editor
      @param finalValue {Object} the final value
      @returns {void}
    */
    inlineEditorDidEndEditing: function(inlineEditor, finalValue) {}
};

/* >>>>>>>>>> BEGIN source/system/application.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/responder_context');

/** @class

  The root object for a SproutCore application.  Usually you will create a 
  single SC.Application instance as your root namespace.  SC.Application is
  required if you intend to use SC.Responder to route events.
  
  h2. Example
  
  {{{
    Contacts = SC.Application.create({
      store: SC.Store.create(SC.Record.fixtures),
      
      // add other useful properties here
    });
  }}}

  h2. Sending Events
  
  You can send actions and events down an application-level responder chain
  by 
  
  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Application = SC.Responder.extend(SC.ResponderContext,
/** SC.Application.prototype */ {

});

/* >>>>>>>>>> BEGIN source/system/benchmark.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals $A*/

sc_require('core') ;
 
/** @namespace

  This bit of meta-programming magic can install a benchmark handler on any
  object method.  When a benchmark is installed, the time required to execute
  the method will be printed to the console log everytime the method is 
  called.

  This class can be used to implement benchmarking.  To use this object, just
  call start() with a key name and end() with a keyname.  The benchmark will 
  be logged.  If you set verbose = true, then benchmark will log everytime it 
  saves a bench.  Otherwise, it just keeps stats.  You can get the stats by
  calling report().

  Benchmark does not require anything other than the date.js class.  It also
  does not rely on SC.Object so that you can benchmark code in that area as
  well.
  
  The benchmark has three types of reports.
  
  report(): Returns an abbreviated list with just the durations of the bench. 
            Also, it averages multiple runs. Everything is reported on the top
            level only.
            
  timelineReport(): Returns an list of benchmarks and sub-benchmarks. If the
                    the globalStartTime is set, then it will show relative
                    time from that time.
  
  timelineChart(): Displays a chart of all the benchmarks (not sub-benchmarks)
                   relative to the first time capture or to the globalStartTime.
                   Hide this by calling hideChart()
*/
SC.Benchmark = {

  /**
    If true, then benchmarks will be logged to the console as they are 
    recorded.
  
    @property {Boolean}
  */
  verbose: NO,
  
  /**
    If false, benchmarking will be disabled.  You might want to disable this
    during production to maximize performance.
  
    @property {Boolean}
  */
  enabled: YES,
  
  /** 
     This hash stores collected stats.  It contains key value pairs.  The value
     will be a hash with the following properties:
   
    * * *runs*: the number of times this stat has run
    * * *amt*: the total time consumed by this (divide by runs to get avg)
    * * *name*: an optional longer name you assigned to the stat key.  Set this  using name().
    * * *_starts*: this array is used internally.
    * * *_times*: this array is used internally.
    
    @property {Object}
  */
  stats: {},

  /**
    If set, one can tell when the benchmark is started relatively to the global start time.
  
    @property {Number}
  */
  globalStartTime: null,

   /**
    Call this method at the start of whatever you want to collect.
    If a parentKey is passed, then you will attach the stat to the parent, 
    otherwise it will be on the top level. If topLevelOnly is passed, then 
    recursive calls to the start will be ignored and only the top level call 
    will be benchmarked.
    
    @param {String} key 
      A unique key that identifies this benchmark.  All calls to start/end 
      with the same key will be groups together.
    
    @param {String} parentKey
      A unique key that identifies the parent benchmark.  All calls to 
      start/end with the same key will be groups together.
    
    @param {Boolean} topLevelOnly
      If true then recursive calls to this method with the same key will be 
      ignored.  
    
    @param {Number} time
      Only pass if you want to explicitly set the start time.  Otherwise the 
      start time is now.
      
    @returns {String} the passed key
  */
  start: function(key, parentKey, time, topLevelOnly) {
    if (!this.enabled) return ;

    var start = (time || Date.now()), stat;

    if (parentKey) stat = this._subStatFor(key, parentKey) ;
    else stat = this._statFor(key) ;
    
    if (topLevelOnly && stat._starts.length > 0) stat._starts.push('ignore');
    else stat._starts.push(start) ;

    stat._times.push({start: start, _subStats: {}});
    return key;
  },

  /**
    Call this method at the end of whatever you want to collect.  This will
    save the collected benchmark.
    
    @param {String} key
      The benchmark key you used when you called start()
    
    @param {String} parentKey
      The benchmark parent key you used when you called start()
    
    @param {Number} time
      Only pass if you want to explicitly set the end time.  Otherwise start 
      time is now.
  */
  end: function(key, parentKey, time) {
    var stat;
    if (!this.enabled) return ;
    if(parentKey)
    {
      stat = this._subStatFor(key, parentKey) ;
    }
    else
    {
      stat = this._statFor(key) ;
    }
    var start = stat._starts.pop() ;
    if (!start) {
      console.log('SC.Benchmark "%@" ended without a matching start.  No information was saved.'.fmt(key));
      return ;
    }

    // top level only.
    if (start == 'ignore') return ; 
    
    var end = (time || Date.now()) ;
    var dur = end - start;

    stat._times[stat._times.length-1].end = end;
    stat._times[stat._times.length-1].dur = dur;

    stat.amt += dur ;
    stat.runs++ ;
    
    if (this.verbose) this.log(key) ;
  },
  
  /* 
    Set the inital global start time.
  */
  setGlobalStartTime: function(time)
  {
    this.globalStartTime = time;
  },

  /**
    This is a simple way to benchmark a function.  The function will be 
    run with the name you provide the number of times you indicate.  Only the
    function is a required param.
  */  
  bench: function(func, key, reps) {
    if (!key) key = "bench%@".fmt(this._benchCount++) ;
    if (!reps) reps = 1 ;
    var ret ;
    
    while(--reps >= 0) {
      var timeKey = SC.Benchmark.start(key) ;
      ret = func();
      SC.Benchmark.end(timeKey) ; 
    }
    
    return ret ;
  },
  
  /**  
    This bit of metaprogramming magic install a wrapper around a method and
    benchmark it whenever it is run.
  */  
  install: function(object,method, topLevelOnly) {
    
    // vae the original method.
    object['b__' + method] = object[method] ;
    var __func = object['b__' + method];
    
    // replace with this helper.
    object[method] = function() {
      var key = '%@(%@)'.fmt(method, $A(arguments).join(', ')) ;
      SC.Benchmark.start(key, topLevelOnly) ;
      var ret = __func.apply(this, arguments) ;
      SC.Benchmark.end(key) ;
      return ret ;
    } ;
  },
  
  /**
    Restore the original method, deactivating the benchmark.
  
    @param {object} object the object to change
    @param {string} method the method name as a string.
  
  */  
  restore: function(object,method) {
    object[method] = object['b__' + method] ;
  },
  
  /**
    This method will return a string containing a report of the stats
    collected so far.  If you pass a key, only the stats for that key will
    be returned.  Otherwise, all keys will be used.
  */
  report: function(key) {
    if (key) return this._genReport(key) ;
    var ret = [] ;
    for(var k in this.stats) {
      if (!this.stats.hasOwnProperty(k)) continue ;
      ret.push(this._genReport(k)) ;
    }
    return ret.join("\n") ;
  },

  /**
    Generate a human readable benchmark report. Pass in appName if you desire.

    @param {string} application name.
  */
  timelineReport: function(appName) 
  {
    appName = (appName) ? 'SproutCore Application' : appName;
    var ret = [appName, 'User-Agent: %@'.fmt(navigator.userAgent), 'Report Generated: %@ (%@)'.fmt(new Date().toString(), Date.now()), ''] ;

    var chart = this._compileChartData(true);
    for(var i=0; i<chart.length; i++)
    {
      if(chart[i][4])
      {
        ret.push(this._timelineGenSubReport(chart[i]));
      }
      else
      {
        ret.push(this._timelineGenReport(chart[i]));
      }
    }
    return ret.join("\n") ;
  },

  /**
    Generate a human readable benchmark chart. Pass in appName if you desire.

  */
  timelineChart: function(appName) {
    var i=0;
    // Hide the chart if there is an existing one.
    this.hideChart();
    
    // Compile the data.
    var chart = this._compileChartData(false);
    var chartLen = chart.length;
    
    // Return if there is nothing to draw.
    if(chartLen === 0) return;
    
    // Get the global start of the graph.
    var gStart = this.globalStartTime ? this.globalStartTime : chart[0][1];
    var maxDur = chart[chartLen-1][2]-gStart;
    var maxHeight = 50+chartLen*30;
    var incr = Math.ceil(maxDur/200)+1;
    var maxWidth = incr*50;
    
    // Create the basic graph element.
    var graph = document.createElement('div');
    graph.className = 'sc-benchmark-graph';
    document.body.appendChild(graph);

    // Set the title.
    var title = document.createElement('div');
    title.innerHTML = ((appName) ? appName : 'SproutCore Application') + (' - Total Captured Time: ' + maxDur +' ms - Points Captured: ' + chartLen) + ' [<a href="javascript:SC.Benchmark.hideChart();">Hide Chart</a>]';
    title.className = 'sc-benchmark-title'; 
    graph.appendChild(title);


    var topBox = document.createElement('div');
    topBox.className = 'sc-benchmark-top'; 
    topBox.style.width = maxWidth + 'px';
    graph.appendChild(topBox);

    // Draw the tick marks.
    for(i=0;i<incr; i++)
    {
      var tick = document.createElement('div');
      tick.className = 'sc-benchmark-tick';
      tick.style.left = (i*50)+'px';
      tick.style.height = maxHeight+'px';
      var tickLabel = document.createElement('div');
      tickLabel.className = 'sc-benchmark-tick-label';
      tickLabel.style.left = (i*50)+'px';
      tickLabel.innerHTML = i*200+" ms";
      graph.appendChild(tick);
      graph.appendChild(tickLabel);
    }
    
    // For each item in the chart, print it out on the screen.
    for(i=0;i<chartLen; i++)
    {
    	var row = document.createElement('div');
    	row.style.top = (75+(i*30))+'px';
    	row.style.width = maxWidth+'px';
    	row.className = (i%2===0) ? 'sc-benchmark-row even' : 'sc-benchmark-row';
    	graph.appendChild(row);

      var div = document.createElement('div');
      var start = chart[i][1];
      var end = chart[i][2];
      var duration = chart[i][3];
      
      div.innerHTML = '&nbsp;' + (chart[i][0] + " <span class='sc-benchmark-emphasis'>" + duration + 'ms</span>');
      
      div.className = 'sc-benchmark-bar';
      div.style.cssText = 'left:'+ (((start-gStart)/4))+'px; width: '+((duration/4))+
                          'px; top: '+(53+(i*30))+'px;';
      div.title = "start: " + (start-gStart) + " ms, end: " + (end-gStart) + ' ms, duration: ' + duration + ' ms';
      graph.appendChild(div);
    }

    // Save the graph.
    this._graph = graph;
  },
  
  /*
    Hide chart.
    
  */
  hideChart: function()
  {
    if(this._graph) {
      try{ 
        document.body.removeChild(this._graph);
      }catch(e){}
    }
  },
  

  /**
    This method is just like report() except that it will log the results to
    the console.
  */  
  log: function(key) {
    // log each line to make this easier to read on an iPad
    var lines = this.report(key).split('\n'),
        len   = lines.length, idx;
    for(idx=0;idx<len;idx++) console.log(lines[idx]);
  },
  
  /**
    This will activate profiling if you have Firebug installed.  Otherwise
    does nothing.
  */
  startProfile: function(key) {
    if (!this.enabled) return ;
    if (console && console.profile) console.profile(key) ;
  },
  
  endProfile: function(key) {
    if (!this.enabled) return ;
    if (console && console.profileEnd) console.profileEnd(key) ;
  },
  
  // PRIVATE METHODS

  // @private
  
  // Generates, sorts, and returns the array of all the data that has been captured.
  _compileChartData: function(showSub)
  {
    var chart = [], dispKey;
    for(var key in this.stats) 
    {
      var stat = this.stats[key];
      for(var i=0; i<stat._times.length; i++)
      {
        var st = stat._times[i];
        dispKey = (stat._times.length > 1) ? (i+1)+' - '+key : key;
        chart.push([dispKey, st.start, st.end, st.dur, false]);
        if(showSub)
        {
          var subStats = st._subStats;
          for(var k in subStats) 
          {
           
            var subStat = subStats[k];
            for(var j=0; j<subStat._times.length; j++)
            {
              var s = subStat._times[j];
              dispKey = (subStat._times.length > 1) ? (j+1)+' - '+k : k;
              chart.push([dispKey, s.start, s.end, s.dur, true]);
         
            }
          }
        }
      }
    }
    
    chart.sort(function(a,b)
    {
      if(a[1] < b[1]) 
      {
        return -1;
      }
      else if(a[1] == b[1])
      {
        if(a[3] && !b[3]) return -1;
        if(!a[3] && b[3]) return 1;
        return 0;
      }
      return 1;
    });

    return chart;
  },
  
  // Generate the traditional report show multiple runs averaged.
  _genReport: function(key) {
    var stat = this._statFor(key) ;
    var avg = (stat.runs > 0) ? (Math.floor(stat.amt * 1000 / stat.runs) / 1000) : 0 ;
     
    return 'BENCH %@ msec: %@ (%@x)'.fmt(avg, (stat.name || key), stat.runs) ;  
  },

  // Generate the report in the form of at time line. This returns the parent.
  _timelineGenReport: function(val) 
  {
    if(this.globalStartTime)
    {
      return 'BENCH start: %@ msec, duration: %@ msec,  %@'.fmt((val[1]-this.globalStartTime), val[3], val[0]) ;  
    } 
    else
    {
      return 'BENCH duration: %@ msec, %@'.fmt( val[3],  val[0]) ;  
    }
  },
  
  // Generate the report in the form of at time line. This returns the children.
  _timelineGenSubReport: function(val) 
  {
    if(this.globalStartTime)
    {
      return '   CHECKPOINT BENCH start: %@ msec, duration: %@ msec,  %@'.fmt((val[1]-this.globalStartTime), val[3], val[0]) ;  
    } 
    else
    {
      return '   CHECKPOINT BENCH duration: %@ msec, %@'.fmt( val[3], val[0]) ;  
    }
  },
  
  // returns a stats hash for the named key and parent key.  If the hash does not exist yet,
  // creates it.
  _subStatFor: function(key, parentKey) {
    var parentTimeLen = this.stats[parentKey]._times.length;
    if(parentTimeLen === 0) return;
    var parentSubStats = this.stats[parentKey]._times[this.stats[parentKey]._times.length-1]._subStats;
    var ret = parentSubStats[key] ;
    if (!ret) {
      parentSubStats[key] = {
        runs: 0, amt: 0, name: key, _starts: [], _times: []      
      };
      ret = parentSubStats[key];
    }
    return ret ;
  },

  // returns a stats hash for the named key.  If the hash does not exist yet,
  // creates it.
  _statFor: function(key) {
    var ret = this.stats[key] ;
    if (!ret) {
      ret = this.stats[key] = {
        runs: 0, amt: 0, name: key, _starts: [], _times: []      
      };
      ret = this.stats[key];
    }
    return ret ;
  },
  
  reset: function() { this.stats = {} ; },
  
  // This is private, but it is used in some places, so we are keeping this for
  // compatibility.
  _bench: function(func, name) {
    SC.Benchmark.bench(func, name, 1) ;
  },
  
  _benchCount: 1
  
} ;

SC.Benchmark = SC.Benchmark;

/* >>>>>>>>>> BEGIN source/system/bundle.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  The global bundle methods. See also: lib/boostrap.rhtml
*/
SC.mixin(/** @scope SC */ {
  
  
  /**
    @property
    @default NO
    @type {Boolean}
    
    If YES, log bundle loading.
  */
  logBundleLoading: NO,
  
  /**
    Returns YES is bundleName is loaded; NO if bundleName is not loaded or
    no information is available.
    
    @param bundleName {String}
    @returns {Boolean}
  */
  bundleIsLoaded: function(bundleName) {
    var bundleInfo = SC.BUNDLE_INFO[bundleName] ;
    return bundleInfo ? !!bundleInfo.loaded : NO ;
  },
  
  /**
    @private
    
    Execute callback function.
  */
  _scb_bundleDidLoad: function(bundleName, target, method, args) {
    var m = method, t = target ;

    if(SC.typeOf(target) === SC.T_STRING) {
      t = SC.objectForPropertyPath(target);
    }

    if(SC.typeOf(method) === SC.T_STRING) {
      m = SC.objectForPropertyPath(method, t);
    }
    
    if(!m) {

      if(SC.LAZY_INSTANTIATION[bundleName]) {
        var lazyInfo = SC.LAZY_INSTANTIATION[bundleName];

      if (SC.logBundleLoading) console.log("SC.loadBundle(): Bundle '%@' is marked for lazy instantiation, instantiating it now…".fmt(bundleName));            
        
        for(var i=0, iLen = lazyInfo.length; i<iLen; i++) {
          try { 
            lazyInfo[i]();
          }catch(e) {
            console.error("SC.loadBundle(): Failted to lazily instatiate entry for  '%@'".fmt(bundleName));  
          }
        }
        delete SC.LAZY_INSTANTIATION[bundleName];

        if(SC.typeOf(target) === SC.T_STRING) {
          t = SC.objectForPropertyPath(target);
        }
        if(SC.typeOf(method) === SC.T_STRING) {
          m = SC.objectForPropertyPath(method, t);
        }

        if(!method) {
          throw "SC.loadBundle(): could not find callback for lazily instantiated bundle '%@'".fmt(bundleName);

        }
      } else {
        throw "SC.loadBundle(): could not find callback for '%@'".fmt(bundleName);
      }
    }

    if(!args) {
      args = [];
    }

    args.push(bundleName);
    
    var needsRunLoop = !!SC.RunLoop.currentRunLoop;
    if (needsRunLoop) {
      SC.run(function() {
        m.apply(t, args) ;
      });
    } else {
      m.apply(t, args) ;
    }    
  },
  
  tryToLoadBundle: function(bundleName, target, method, args) {
    var m, t;
    
    // First see if it is already defined.
    if(SC.typeOf(target) === SC.T_STRING) {
      t = SC.objectForPropertyPath(target);
    }
    if(SC.typeOf(method) === SC.T_STRING) {
      m = SC.objectForPropertyPath(method, t);
    }

    // If the method exists, try to call it. It could have been loaded 
    // through other means but the SC.BUNDLE_INFO entry doesn't exist.
    if(m || SC.LAZY_INSTANTIATION[bundleName]) {
      if(SC.logBundleLoading) console.log("SC.loadBundle(): Bundle '%@' found through other means, will attempt to load…".fmt(bundleName));
      SC.BUNDLE_INFO[bundleName] = {loaded: YES};
      return SC.BUNDLE_INFO[bundleName]; 
    }
    return NO;
  },
    
  /**
    Dynamically load bundleName if not already loaded. Call the target and 
    method with any given arguments.
    
    @param bundleName {String}
    @param target {Function} 
    @param method {Function}
  */
  loadBundle: function(bundleName, target, method) {
    var idx, len;
    if(method === undefined && SC.typeOf(target) === SC.T_FUNCTION) {
      method = target;
      target = null;
    }

    var bundleInfo = SC.BUNDLE_INFO[bundleName], callbacks, targets,
        args       = SC.A(arguments).slice(3),
        log        = SC.logBundleLoading;

    if (log) {
      console.log("SC.loadBundle(): Attempting to load '%@'".fmt(bundleName));
    }
    
    if (!bundleInfo) {
      if (log) console.log("SC.loadBundle(): Attemping to load %@ without SC.BUNDLE_INFO entry… could be loaded through other means.".fmt(bundleName));
      bundleInfo = this.tryToLoadBundle(bundleName, target, method, args);
    }
    

    if (!bundleInfo) {        
      throw "SC.loadBundle(): could not find bundle '%@'".fmt(bundleName) ;
    } else if (bundleInfo.loaded) {

      if (log) console.log("SC.loadBundle(): Bundle '%@' already loaded, skipping.".fmt(bundleName));

      if(method) {
        // call callback immediately if we're already loaded and SC.isReady
        if (SC.isReady) {
          SC._scb_bundleDidLoad(bundleName, target, method, args);
        } else {
          // queue callback for when SC is ready
          SC.ready(SC, function() {
            SC._scb_bundleDidLoad(bundleName, target, method, args);        
          });
        }
      }
    } else {

      if (log) console.log("SC.loadBundle(): Bundle '%@' is not loaded, loading now.".fmt(bundleName));

      // queue callback for later
      callbacks = bundleInfo.callbacks || [] ;

      if (method) {
        callbacks.push(function() {
          SC._scb_bundleDidLoad(bundleName, target, method, args);        
        });
        bundleInfo.callbacks = callbacks ;
      }

      if (!bundleInfo.loading) {
        // load bundle's dependencies first
        var requires = bundleInfo.requires || [] ;
        var dependenciesMet = YES ;
        for (idx=0, len=requires.length; idx<len; ++idx) {
          var targetName = requires[idx] ;
          var targetInfo = SC.BUNDLE_INFO[targetName] ;
          if (!targetInfo) {
            throw "SC.loadBundle(): could not find required bundle '%@' for bundle '%@'".fmt(targetName, bundleName) ;
          } else {
            if (targetInfo.loading) {
              dependenciesMet = NO ;
              break ;
            } else if (targetInfo.loaded) {
              continue ;
            } else {
              dependenciesMet = NO ;
              
              // register ourself as a dependent bundle (used by 
              // SC.bundleDidLoad()...)
              var dependents = targetInfo.dependents;
              if(!dependents) targetInfo.dependents = dependents = [];

              dependents.push(bundleName) ;

              if (log) console.log("SC.loadBundle(): '%@' depends on '%@', loading dependency…".fmt(bundleName, targetName));
              
              // recursively load targetName so it's own dependencies are
              // loaded first.
              SC.loadBundle(targetName) ;
              break ;
            }
          }
        }
        
        if (dependenciesMet) {
          // add <script> and <link> tags to DOM for bundle's resources
          var styles, scripts, url, el, head, body;
          head = document.getElementsByTagName('head')[0] ;
          if (!head) head = document.documentElement ; // fix for Opera
          styles = bundleInfo.styles || [] ;
          for (idx=0, len=styles.length; idx<len; ++idx) {
            url = styles[idx] ;
            if (url.length > 0) {
              el = document.createElement('link') ;
              el.setAttribute('href', url) ;
              el.setAttribute('rel', "stylesheet") ;
              el.setAttribute('type', "text/css") ;
              head.appendChild(el) ;
            }
          }

          // Push the URLs on the the queue and then start the loading.
          var jsBundleLoadQueue = this._jsBundleLoadQueue;
          if(!jsBundleLoadQueue) this._jsBundleLoadQueue = jsBundleLoadQueue = {};
          jsBundleLoadQueue[bundleName] = [];
          var q = jsBundleLoadQueue[bundleName] ;
          scripts = bundleInfo.scripts || [] ;
          
          for (idx=0, len=scripts.length; idx<len; ++idx) {
            url = scripts[idx] ;
            if (url.length > 0) {
              q.push(url);
            }
          }
          
          // and remember that we're loading
          bundleInfo.loading = YES ;
          
          // Start the load process.
          this.scriptDidLoad(bundleName);
        }
      }
    }
  },

  /**
    Load the next script in the queue now that the caller of this function
    is complete.
    
    @param {String} bundleName The name of the bundle.
  */
  scriptDidLoad: function(bundleName) {
    var jsBundleLoadQueue = this._jsBundleLoadQueue;
    if(jsBundleLoadQueue) {
      var q = jsBundleLoadQueue[bundleName];
      if(q) {
        var url = q.shift();
        
        if (SC.logBundleLoading) console.log("SC.scriptDidLoad(): Loading next file in '%@' -> '%@'".fmt(bundleName, url));

        var el = document.createElement('script') ;
        el.setAttribute('type', "text/javascript") ;
        el.setAttribute('src', url) ;
        document.body.appendChild(el) ;
      }
    }
  },
  
  /** @private
    Called by bundle_loaded.js immediately after a framework/bundle is loaded.
    Any pending callbacks are called (if SC.isReady), and any dependent 
    bundles which were waiting for this bundle to load are notified so they 
    can continue loading.
    
    @param bundleName {String} the name of the bundle that just loaded
  */
  bundleDidLoad: function(bundleName) {
    var bundleInfo = SC.BUNDLE_INFO[bundleName], 
        log        = SC.logBundleLoading,
        callbacks, targets ;
    if (!bundleInfo) {
      bundleInfo = SC.BUNDLE_INFO[bundleName] = { loaded: YES} ;
      return;
    }
    if (bundleInfo.loaded && log) {
      console.log("SC.bundleDidLoad() called more than once for bundle '%@'. Skipping.".fmt(bundleName));
      return ;
    }
    
    // remember that we're loaded
    delete bundleInfo.loading ;
    bundleInfo.loaded = YES ;
    
    // call our callbacks (if SC.isReady), otherwise queue them for later
    if (SC.isReady) {
      SC._invokeCallbacksForBundle(bundleName) ;
    } else {
      SC.ready(SC, function() {
        SC._invokeCallbacksForBundle(bundleName) ;
      });
    }
    
    // for each dependent bundle, try and load them again...
    var dependents = bundleInfo.dependents || [] ;
    for (var idx=0, len=dependents.length; idx<len; ++idx) {
      if (log) console.log("SC.loadBundle(): Bundle '%@' has completed loading, loading '%@' that depended on it.".fmt(bundleName, dependents[idx]));
      SC.loadBundle(dependents[idx]) ;
    }
  },
  
  /** @private Invoke queued callbacks for bundleName. */
  _invokeCallbacksForBundle: function(bundleName) {
    var bundleInfo = SC.BUNDLE_INFO[bundleName], callbacks ;
    if (!bundleInfo) return ; // shouldn't happen, but recover anyway
    
    if (SC.logBundleLoading) console.log("SC.loadBundle(): Bundle '%@' has completed loading, invoking callbacks.".fmt(bundleName));

    callbacks = bundleInfo.callbacks || [] ;
    
    SC.RunLoop.begin() ;
    for (var idx=0, len=callbacks.length; idx<len; ++idx) {
      callbacks[idx]() ;
    }
    SC.RunLoop.end() ;
  }
  
});

/* >>>>>>>>>> BEGIN source/system/datetime.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Standard error thrown by SC.Scanner when it runs out of bounds
  
  @property {Error}
*/
SC.SCANNER_OUT_OF_BOUNDS_ERROR = new Error("Out of bounds.");

/**
  Standard error thrown by SC.Scanner when  you pass a value not an integer.
  
  @property {Error}
*/
SC.SCANNER_INT_ERROR = new Error("Not an int.");

/**
  Standard error thrown by SC.SCanner when it cannot find a string to skip.
  
  @property {Error}
*/
SC.SCANNER_SKIP_ERROR = new Error("Did not find the string to skip.");

/** 
  Standard error thrown by SC.Scanner when it can any kind a string in the 
  matching array.
*/
SC.SCANNER_SCAN_ARRAY_ERROR = new Error("Did not find any string of the given array to scan.");

/**
  Standard error thrown when trying to compare two dates in different 
  timezones.
  
  @property {Error}
*/
SC.DATETIME_COMPAREDATE_TIMEZONE_ERROR = new Error("Can't compare the dates of two DateTimes that don't have the same timezone.");

/**
  Standard ISO8601 date format
  
  @property {String}
*/
SC.DATETIME_ISO8601 = '%Y-%m-%dT%H:%M:%S%Z';


/** @class

  A Scanner reads a string and interprets the characters into numbers. You
  assign the scanner's string on initialization and the scanner progresses
  through the characters of that string from beginning to end as you request
  items.
  
  Scanners are used by DateTime to convert strings into DateTime objects.
  
  @extends SC.Object
  @since SproutCore 1.0
  @author Martin Ottenwaelter
*/
SC.Scanner = SC.Object.extend(
/** @scope SC.Scanner.prototype */ {
  
  /**
    The string to scan. You usually pass it to the create method:
    
    {{{
      SC.Scanner.create({string: 'May, 8th'});
    }}}
    
    @property
    @type {String}
  */
  string: null,
  
  /**
    The current scan location. It is incremented by the scanner as the
    characters are processed.
    The default is 0: the beginning of the string.
    
    @property
    @type {integer}
  */
  scanLocation: 0,
  
  /**
    Reads some characters from the string, and increments the scan location
    accordingly. 
    
    @param {integer} len the amount of characters to read
    @throws {SC.SCANNER_OUT_OF_BOUNDS_ERROR} if asked to read too many characters
    @returns {String} the characters
  */
  scan: function(len) {
    if (this.scanLocation + len > this.length) throw SC.SCANNER_OUT_OF_BOUNDS_ERROR;
    var str = this.string.substr(this.scanLocation, len);
    this.scanLocation += len;
    return str;
  },
  
  /**
    Reads some characters from the string and interprets it as an integer.
    
    @param {integer} min_len the minimum amount of characters to read
    @param {integer} max_len optionally the maximum amount of characters to read (defaults to the minimum)
    @throws {SC.SCANNER_INT_ERROR} if asked to read non numeric characters
    @returns {integer} the scanned integer
  */
  scanInt: function(min_len, max_len) {
    if (max_len === undefined) max_len = min_len;
    var str = this.scan(max_len);
    var re = new RegExp("^\\d{" + min_len + "," + max_len + "}");
    var match = str.match(re);
    if (!match) throw SC.SCANNER_INT_ERROR;
    if (match[0].length < max_len) {
      this.scanLocation += match[0].length - max_len;
    }
    return parseInt(match[0], 10);
  },
  
  /**
    Attempts to skip a given string.
    
    @param {String} str the string to skip
    @throws {SC.SCANNER_SKIP_ERROR} if the given string could not be scanned
    @returns {Boolean} YES if the given string was successfully scanned
  */
  skipString: function(str) {
    if (this.scan(str.length) !== str) throw SC.SCANNER_SKIP_ERROR;
    return YES;
  },
  
  /**
    Attempts to scan any string in a given array.
    
    @param {Array} ary the array of strings to scan
    @throws {SC.SCANNER_SCAN_ARRAY_ERROR} if no string of the given array is found
    @returns {integer} the index of the scanned string of the given array
  */
  scanArray: function(ary) {
    for (var i = 0, len = ary.length; i < len; i++) {
      if (this.scan(ary[i].length) === ary[i]) {
        return i;
      }
      this.scanLocation -= ary[i].length;
    }
    throw SC.SCANNER_SCAN_ARRAY_ERROR;
  }
  
});


/** @class

  A class representation of a date and time. It's basically a wrapper around
  the Date javascript object, KVO friendly and with common date/time
  manipulation methods.

  This object differs from the standard JS Date object, however, in that it
  supports time zones other than UTC and that local to the machine on which
  it is running.  Any time zone can be specified when creating an SC.DateTime
  object, e.g

    // Creates a DateTime representing 5am in Washington, DC and 10am in London
    var d = SC.DateTime.create({ hour: 5, timezone: 300 }); // -5 hours from UTC
    var e = SC.DateTime.create({ hour: 10, timezone: 0 }); // same time, specified in UTC
    
    and it is true that d.isEqual(e).

  The time zone specified upon creation is permanent, and any calls to get() on that
  instance will return values expressed in that time zone.  So,
  
    d.get('hour') returns 5.
    e.get('hour') returns 10.
    
    but
    
    d.get('milliseconds') === e.get('milliseconds') is true, since they are technically the same position in time.
  
  @extends SC.Object
  @extends SC.Freezable
  @extends SC.Copyable
  @author Martin Ottenwaelter
  @author Jonathan Lewis
  @author Josh Holt
  @since SproutCore 1.0
*/
SC.DateTime = SC.Object.extend(SC.Freezable, SC.Copyable,
  /** @scope SC.DateTime.prototype */ {
  
  /** @private
    Internal representation of a date: the number of milliseconds
    since January, 1st 1970 00:00:00.0 UTC.
    
    @property
    @type {Integer}
  */
  _ms: 0,
  
  /** @read-only
    The offset, in minutes, between UTC and the object's timezone.
    All calls to get() will use this time zone to translate date/time
    values into the zone specified here.
    
    @property
    @type {Integer}
  */
  timezone: 0,
  
  /**
    A DateTime instance is frozen by default for better performance.
    
    @property
    @type {Boolean}
  */
  isFrozen: YES,
  
  /**
    Returns a new DateTime object where one or more of the elements have been
    changed according to the options parameter. The time options (hour,
    minute, sec, usec) reset cascadingly, so if only the hour is passed, then
    minute, sec, and usec is set to 0. If the hour and minute is passed, then
    sec and usec is set to 0.
    
    (Parts copied from the Ruby On Rails documentation)
    
    If a time zone is passed in the options hash, all dates and times are assumed
    to be local to it, and the returned DateTime instance has that time zone.  If
    none is passed, it defaults to SC.DateTime.timezone.

    Note that passing only a time zone does not affect the actual milliseconds since
    Jan 1, 1970, only the time zone in which it is expressed when displayed.
    
    @see SC.DateTime#create for the list of options you can pass
    @returns {DateTime} copy of receiver
  */
  adjust: function(options, resetCascadingly) {
    var timezone;
    
    options = options ? SC.clone(options) : {};
    timezone = (options.timezone !== undefined) ? options.timezone : (this.timezone !== undefined) ? this.timezone : 0;
    
    return this.constructor._adjust(options, this._ms, timezone, resetCascadingly)._createFromCurrentState();
  },
  
  /**
    Returns a new DateTime object advanced according the the given parameters.
    Don't use floating point values, it might give unpredicatble results.
    
    @see SC.DateTime#create for the list of options you can pass
    @param {Hash} options the amount of date/time to advance the receiver
    @returns {DateTime} copy of the receiver
  */
  advance: function(options) {
    return this.constructor._advance(options, this._ms, this.timezone)._createFromCurrentState();
  },
  
  /**
    Generic getter.
    
    The properties you can get are:
      - 'year'
      - 'month' (January is 1, contrary to JavaScript Dates for which January is 0)
      - 'day'
      - 'dayOfWeek' (Sunday is 0)
      - 'hour'
      - 'minute'
      - 'second'
      - 'millisecond'
      - 'milliseconds', the number of milliseconds since
        January, 1st 1970 00:00:00.0 UTC
      - 'isLeapYear', a boolean value indicating whether the receiver's year
        is a leap year
      - 'daysInMonth', the number of days of the receiver's current month
      - 'dayOfYear', January 1st is 1, December 31th is 365 for a common year
      - 'week' or 'week1', the week number of the current year, starting with
        the first Sunday as the first day of the first week (00..53)
      - 'week0', the week number of the current year, starting with
        the first Monday as the first day of the first week (00..53)
      - 'lastMonday', 'lastTuesday', etc., 'nextMonday', 'nextTuesday', etc.,
        the date of the last or next weekday in comparison to the receiver.
    
    @param {String} key the property name to get
    @return the value asked for
  */
  unknownProperty: function(key) {
    return this.constructor._get(key, this._ms, this.timezone);
  },
  
  /**
    Formats the receiver according to the given format string. Should behave
    like the C strftime function.
  
    The format parameter can contain the following characters:
      - %a - The abbreviated weekday name (``Sun'')
      - %A - The full weekday name (``Sunday'')
      - %b - The abbreviated month name (``Jan'')
      - %B - The full month name (``January'')
      - %c - The preferred local date and time representation
      - %d - Day of the month (01..31)
      - %h - Hour of the day, 24-hour clock (0..23)
      - %H - Hour of the day, 24-hour clock (00..23)
      - %i - Hour of the day, 12-hour clock (1..12)
      - %I - Hour of the day, 12-hour clock (01..12)
      - %j - Day of the year (001..366)
      - %m - Month of the year (01..12)
      - %M - Minute of the hour (00..59)
      - %p - Meridian indicator (``AM'' or ``PM'')
      - %S - Second of the minute (00..60)
      - %U - Week number of the current year,
          starting with the first Sunday as the first
          day of the first week (00..53)
      - %W - Week number of the current year,
          starting with the first Monday as the first 
          day of the first week (00..53)
      - %w - Day of the week (Sunday is 0, 0..6)
      - %x - Preferred representation for the date alone, no time
      - %X - Preferred representation for the time alone, no date
      - %y - Year without a century (00..99)
      - %Y - Year with century
      - %Z - Time zone (ISO 8601 formatted)
      - %% - Literal ``%'' character
    
    @param {String} format the format string
    @return {String} the formatted string
  */
  toFormattedString: function(fmt) {
    return this.constructor._toFormattedString(fmt, this._ms, this.timezone);
  },
  
  /**
    Formats the receiver according ISO 8601 standard. It is equivalent to
    calling toFormattedString with the '%Y-%m-%dT%H:%M:%S%Z' format string.
    
    @return {String} the formatted string
  */
  toISO8601: function(){
    return this.constructor._toFormattedString(SC.DATETIME_ISO8601, this._ms, this.timezone);
  },
  
  /** @private
    Creates a string representation of the receiver.
    (Debuggers call all the time the toString method. Because of the way
    DateTime is designed, calling SC.DateTime._toFormattedString would
    have a nasty side effect. We shouldn't therefore call any of SC.DateTime's
    methods from toString)
    
    @returns {String}
  */
  toString: function() {
    return "UTC: " +
           new Date(this._ms).toUTCString() +
           ", timezone: " +
           this.timezone;
  },
  
  /**
    Returns YES if the passed DateTime is equal to the receiver, ie: if their
    number of milliseconds since January, 1st 1970 00:00:00.0 UTC are equal.
    This is the preferred method for testing equality.
  
    @see SC.DateTime#compare
    @param {SC.DateTime} aDateTime the DateTime to compare to
    @returns {Boolean}
  */
  isEqual: function(aDateTime) {
    return SC.DateTime.compare(this, aDateTime) === 0;
  },
  
  /**
    Returns a copy of the receiver. Because of the way DateTime is designed,
    it just returns the receiver.
    
    @returns {DateTime}
  */
  copy: function() {
    return this;
  },
  
  /**
    Returns a copy of the receiver with the timezone set to the passed
    timezone. The returned value is equal to the receiver (ie SC.Compare
    returns 0), it is just the timezone representation that changes.
    
    If you don't pass any argument, the target timezone is assumed to be 0,
    ie UTC.

    Note that this method does not change the underlying position in time,
    but only the time zone in which it is displayed.  In other words, the underlying
    number of milliseconds since Jan 1, 1970 does not change.
    
    @return {DateTime}
  */
  toTimezone: function(timezone) {
    if (timezone === undefined) timezone = 0;
    return this.advance({ timezone: timezone - this.timezone });
  }
  
});

// Class Methods
SC.DateTime.mixin(SC.Comparable,
  /** @scope SC.DateTime */ {
  
  /**
    The default format (ISO 8601) in which DateTimes are stored in a record.
    Change this value if your backend sends and receives dates in another
    format.
    
    This value can also be customized on a per-attribute basis with the format
    property. For example:
      SC.Record.attr(SC.DateTime, { format: '%d/%m/%Y %H:%M:%S' })
    
    @property
    @type {String}
  */
  recordFormat: SC.DATETIME_ISO8601,
  
  /**
    The localized day names. Add the key '_SC.DateTime.dayNames' and its value
    to your strings.js file to add support for another language than English.

    @property
    @type {Array}
  */
  dayNames: '_SC.DateTime.dayNames'.loc().w(),
  
  /** @private
    The English day names used for the 'lastMonday',
    'nextTuesday', etc., getters.

    @property
    @type {Array}
  */
  _englishDayNames: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.w(),
  
  /**
    The localized abbreviated day names. Add the key
    '_SC.DateTime.abbreviatedDayNames' and its value to your strings.js
    file to add support for another language than English.

    @property
    @type {Array}
  */
  abbreviatedDayNames: '_SC.DateTime.abbreviatedDayNames'.loc().w(),

  /**
    The localized month names. Add the key '_SC.DateTime.monthNames' and its
    value to your strings.js file to add support for another language than
    English.

    @property
    @type {Array}
  */
  monthNames: '_SC.DateTime.monthNames'.loc().w(),

  /**
    The localized abbreviated month names. Add the key
    '_SC.DateTime.abbreviatedMonthNames' and its value to your strings.js
    file to add support for another language than English.

    @property
    @type {Array}
  */
  abbreviatedMonthNames: '_SC.DateTime.abbreviatedMonthNames'.loc().w(),
  
  /** @private
    The unique internal Date object used to make computations. Better
    performance is obtained by having only one Date object for the whole
    application and manipulating it with setTime() and getTime().
    
    Note that since this is used for internal calculations across many
    DateTime instances, it is not guaranteed to store the date/time that
    any one DateTime instance represents.  So it might be that
      
      this._date.getTime() !== this._ms

    Be sure to set it before using for internal calculations if necessary.

    @property
    @type {Date}
  */
  _date: new Date(),
  
  /** @private
    The offset, in minutes, between UTC and the currently manipulated
    DateTime instance.
    
    @property
    @type {Integer}
  */
  _tz: 0,
  
  /**
    The offset, in minutes, between UTC and the local system time. This
    property is computed at loading time and should never be changed.
    
    @property
    @type {Integer}
  */
  timezone: new Date().getTimezoneOffset(),
  
  /** @private
    A cache of SC.DateTime instances. If you attempt to create a SC.DateTime
    instance that has already been created, then it will return the cached
    value.

    @property
    @type {Array}
  */
  _dt_cache: {},
  
  /** @private
    The index of the lastest cached value. Used with _DT_CACHE_MAX_LENGTH to
    limit the size of the cache.

    @property
    @type {Integer}
  */
  _dt_cache_index: -1,
  
  /** @private
    The maximum length of _dt_cache. If this limit is reached, then the cache
    is overwritten, starting with the oldest element.

    @property
    @type {Integer}
  */
  _DT_CACHE_MAX_LENGTH: 1000,
  
  /** @private
    Both args are optional, but will only overwrite _date and _tz if defined.
    This method does not affect the DateTime instance's actual time, but simply
    initializes the one _date instance to a time relevant for a calculation.
    (this._date is just a resource optimization)

    This is mainly used as a way to store a recursion starting state during
    internal calculations.

    'milliseconds' is time since Jan 1, 1970.
    'timezone' is the current time zone we want to be working in internally.

    Returns a hash of the previous milliseconds and time zone in case they
    are wanted for later restoration.
  */
  _setCalcState: function(ms, timezone) {
    var previous = {
      milliseconds: this._date.getTime(),
      timezone: this._tz
    };

    if (ms !== undefined) this._date.setTime(ms);
    if (timezone !== undefined) this._tz = timezone;

    return previous;
  },

  /**
    By this time, any time zone setting on 'hash' will be ignored.
    'timezone' will be used, or the last this._tz.
  */
  _setCalcStateFromHash: function(hash, timezone) {
    var tz = (timezone !== undefined) ? timezone : this._tz; // use the last-known time zone if necessary
    var ms = this._toMilliseconds(hash, this._ms, tz); // convert the hash (local to specified time zone) to milliseconds (in UTC)
    return this._setCalcState(ms, tz); // now call the one we really wanted
  },

  /** @private
    @see SC.DateTime#unknownProperty
  */
  _get: function(key, start, timezone) {
    var ms, tz, doy, m, y, firstDayOfWeek, dayOfWeek, dayOfYear, prefix, suffix;
    var currentWeekday, targetWeekday;
    var d = this._date;
    var originalTime, v = null;

    // Set up an absolute date/time using the given milliseconds since Jan 1, 1970.
    // Only do it if we're given a time value, though, otherwise we want to use the
    // last one we had because this _get() method is recursive.
    //
    // Note that because these private time calc methods are recursive, and because all DateTime instances
    // share an internal this._date and this._tz state for doing calculations, methods
    // that modify this._date or this._tz should restore the last state before exiting
    // to avoid obscure calculation bugs.  So we save the original state here, and restore
    // it before returning at the end.
    originalTime = this._setCalcState(start, timezone); // save so we can restore it to how it was before we got here

    // Check this first because it is an absolute value -- no tweaks necessary when calling for milliseconds
    if (key === 'milliseconds') {
      v = d.getTime();
    }
    else if (key === 'timezone') {
      v = this._tz;
    }
    
    // 'nextWeekday' or 'lastWeekday'.
    // We want to do this calculation in local time, before shifting UTC below.
    if (v === null) {
      prefix = key.slice(0, 4);
      suffix = key.slice(4);
      if (prefix === 'last' || prefix === 'next') {
        currentWeekday = this._get('dayOfWeek', start, timezone);
        targetWeekday = this._englishDayNames.indexOf(suffix);    
        if (targetWeekday >= 0) {
          var delta = targetWeekday - currentWeekday;
          if (prefix === 'last' && delta >= 0) delta -= 7;
          if (prefix === 'next' && delta <  0) delta += 7;
          this._advance({ day: delta }, start, timezone);
          v = this._createFromCurrentState();
        }
      }
    }
    
    if (v === null) {
      // need to adjust for alternate display time zone.
      // Before calculating, we need to get everything into a common time zone to
      // negate the effects of local machine time (so we can use all the 'getUTC...() methods on Date).
      if (timezone !== undefined) {
        this._setCalcState(d.getTime() - (timezone * 60000), 0); // make this instance's time zone the new UTC temporarily
      }
    
      // simple keys
      switch (key) {
        case 'year':
          v = d.getUTCFullYear(); //TODO: investigate why some libraries do getFullYear().toString() or getFullYear()+""
          break;
        case 'month':
          v = d.getUTCMonth()+1; // January is 0 in JavaScript
          break;
        case 'day':
          v = d.getUTCDate();
          break;
        case 'dayOfWeek':
          v = d.getUTCDay();
          break;
        case 'hour':
          v = d.getUTCHours();
          break;
        case 'minute':
          v = d.getUTCMinutes();
          break;
        case 'second':
          v = d.getUTCSeconds();
          break;
        case 'millisecond':
          v = d.getUTCMilliseconds();
          break;
      }
      
      // isLeapYear
      if ((v === null) && (key === 'isLeapYear')) {
        y = this._get('year');
        v = (y%4 === 0 && y%100 !== 0) || y%400 === 0;
      }

      // daysInMonth
      if ((v === null) && (key === 'daysInMonth')) {
        switch (this._get('month')) {
          case 4:
          case 6:
          case 9:
          case 11:
            v = 30;
            break;
          case 2:
            v = this._get('isLeapYear') ? 29 : 28;
            break;
          default:
            v = 31;
            break;
        }
      }
    
      // dayOfYear
      if ((v === null) && (key === 'dayOfYear')) {
        ms = d.getTime(); // save time
        doy = this._get('day');
        this._setCalcStateFromHash({ day: 1 });
        for (m = this._get('month') - 1; m > 0; m--) {
          this._setCalcStateFromHash({ month: m });
          doy += this._get('daysInMonth');
        }
        d.setTime(ms); // restore time
        v = doy;
      }

      // week, week0 or week1
      if ((v === null) && (key.slice(0, 4) === 'week')) {
        // firstDayOfWeek should be 0 (Sunday) or 1 (Monday)
        firstDayOfWeek = key.length === 4 ? 1 : parseInt(key.slice('4'), 10);
        dayOfWeek = this._get('dayOfWeek');
        dayOfYear = this._get('dayOfYear') - 1;
        if (firstDayOfWeek === 0) {
          v = parseInt((dayOfYear - dayOfWeek + 7) / 7, 10);
        }
        else {
          v = parseInt((dayOfYear - (dayOfWeek - 1 + 7) % 7 + 7) / 7, 10);
        }
      }
    }

    // restore the internal calculation state in case someone else was in the
    // middle of a calculation (we might be recursing).
    this._setCalcState(originalTime.milliseconds, originalTime.timezone);

    return v;
  },

  /**
    Sets the internal calculation state to something specified.
  */
  _adjust: function(options, start, timezone, resetCascadingly) {
    var opts = options ? SC.clone(options) : {};
    var ms = this._toMilliseconds(options, start, timezone, resetCascadingly);
    this._setCalcState(ms, timezone);
    return this; // for chaining
  },
  
  /** @private
    @see SC.DateTime#advance
  */
  _advance: function(options, start, timezone) {
    var opts = options ? SC.clone(options) : {};
    var tz;

    for (var key in opts) {
      opts[key] += this._get(key, start, timezone);
    }
    
    // The time zone can be advanced by a delta as well, so try to use the
    // new value if there is one.
    tz = (opts.timezone !== undefined) ? opts.timezone : timezone; // watch out for zero, which is acceptable as a time zone

    return this._adjust(opts, start, tz, NO);
  },
  
  /* @private
    Converts a standard date/time options hash to an integer representing that position
    in time relative to Jan 1, 1970
  */
  _toMilliseconds: function(options, start, timezone, resetCascadingly) {
    var opts = options ? SC.clone(options) : {};
    var d = this._date;
    var previousMilliseconds = d.getTime(); // rather than create a new Date object, we'll reuse the instance we have for calculations, then restore it
    var ms, tz;

    // Initialize our internal for-calculations Date object to our current date/time.
    // Note that this object was created in the local machine time zone, so when we set
    // its params later, it will be assuming these values to be in the same time zone as it is.
    // It's ok for start to be null, in which case we'll just keep whatever we had in 'd' before.
    if (!SC.none(start)) {
      d.setTime(start); // using milliseconds here specifies an absolute location in time, regardless of time zone, so that's nice
    }
    
    // We have to get all time expressions, both in 'options' (assume to be in time zone 'timezone')
    // and in 'd', to the same time zone before we can any calculations correctly.  So because the Date object provides
    // a suite of UTC getters and setters, we'll temporarily redefine 'timezone' as our new
    // 'UTC', so we don't have to worry about local machine time.  We do this by subtracting
    // milliseconds for the time zone offset.  Then we'll do all our calculations, then convert
    // it back to real UTC.
    
    // (Zero time zone is considered a valid value.)
    tz = (timezone !== undefined) ? timezone : (this.timezone !== undefined) ? this.timezone : 0;
    d.setTime(d.getTime() - (tz * 60000)); // redefine 'UTC' to establish a new local absolute so we can use all the 'getUTC...()' Date methods
    
    // the time options (hour, minute, sec, millisecond)
    // reset cascadingly (see documentation)
    if (resetCascadingly === undefined || resetCascadingly === YES) {
      if ( !SC.none(opts.hour) && SC.none(opts.minute)) {
        opts.minute = 0;
      }
      if (!(SC.none(opts.hour) && SC.none(opts.minute))
          && SC.none(opts.second)) {
        opts.second = 0;
      }
      if (!(SC.none(opts.hour) && SC.none(opts.minute) && SC.none(opts.second))
          && SC.none(opts.millisecond)) {
        opts.millisecond = 0;
      }
    }
    
    // Get the current values for any not provided in the options hash.
    // Since everything is in 'UTC' now, use the UTC accessors.  We do this because,
    // according to javascript Date spec, you have to set year, month, and day together
    // if you're setting any one of them.  So we'll use the provided Date.UTC() method
    // to get milliseconds, and we need to get any missing values first...
    if (SC.none(opts.year))        opts.year = d.getUTCFullYear();
    if (SC.none(opts.month))       opts.month = d.getUTCMonth() + 1; // January is 0 in JavaScript
    if (SC.none(opts.day))         opts.day = d.getUTCDate();
    if (SC.none(opts.hour))        opts.hour = d.getUTCHours();
    if (SC.none(opts.minute))      opts.minute = d.getUTCMinutes();
    if (SC.none(opts.second))      opts.second = d.getUTCSeconds();
    if (SC.none(opts.millisecond)) opts.millisecond = d.getUTCMilliseconds();

    // Ask the JS Date to calculate milliseconds for us (still in redefined UTC).  It
    // is best to set them all together because, for example, a day value means different things
    // to the JS Date object depending on which month or year it is.  It can now handle that stuff
    // internally as it's made to do.
    ms = Date.UTC(opts.year, opts.month - 1, opts.day, opts.hour, opts.minute, opts.second, opts.millisecond);

    // Now that we've done all our calculations in a common time zone, add back the offset
    // to move back to real UTC.
    d.setTime(ms + (tz * 60000));
    ms = d.getTime(); // now get the corrected milliseconds value
    
    // Restore what was there previously before leaving in case someone called this method
    // in the middle of another calculation.
    d.setTime(previousMilliseconds);

    return ms;
  },
  
  /**
    Returns a new DateTime object advanced according the the given parameters.
    The parameters can be:
    - none, to create a DateTime instance initialized to the current
      date and time in the local timezone,
    - a integer, the number of milliseconds since
      January, 1st 1970 00:00:00.0 UTC
    - a options hash that can contain any of the following properties: year,
      month, day, hour, minute, second, millisecond, timezone
      
    Note that if you attempt to create a SC.DateTime instance that has already
    been created, then, for performance reasons, a cached value may be
    returned.
    
    The timezone option is the offset, in minutes, between UTC and local time.
    If you don't pass a timezone option, the date object is created in the
    local timezone. If you want to create a UTC+2 (CEST) date, for example,
    then you should pass a timezone of -120.
    
    @param options one of the three kind of parameters descibed above
    @returns {DateTime} the DateTime instance that corresponds to the
      passed parameters, possibly fetched from cache
  */
  create: function() {
    var arg = arguments.length === 0 ? {} : arguments[0];
    var timezone;
    
    // if simply milliseconds since Jan 1, 1970 are given, just use those
    if (SC.typeOf(arg) === SC.T_NUMBER) {
      arg = { milliseconds: arg };
    }

    // Default to local machine time zone if none is given
    timezone = (arg.timezone !== undefined) ? arg.timezone : this.timezone;
    if (timezone === undefined) timezone = 0;

    // Desired case: create with milliseconds if we have them.
    // If we don't, convert what we have to milliseconds and recurse.
    if (!SC.none(arg.milliseconds)) {

      // quick implementation of a FIFO set for the cache
      var key = 'nu' + arg.milliseconds + timezone, cache = this._dt_cache;
      var ret = cache[key];
      if (!ret) {
        var previousKey, idx = this._dt_cache_index, C = this;
        ret = cache[key] = new C([{ _ms: arg.milliseconds, timezone: timezone }]);
        idx = this._dt_cache_index = (idx + 1) % this._DT_CACHE_MAX_LENGTH;
        previousKey = cache[idx];
        if (previousKey !== undefined && cache[previousKey]) delete cache[previousKey];
        cache[idx] = key;
      }
      return ret;
    }
    // otherwise, convert what we have to milliseconds and try again
    else {
      var now = new Date();

      return this.create({ // recursive call with new arguments
        milliseconds: this._toMilliseconds(arg, now.getTime(), timezone, arg.resetCascadingly),
        timezone: timezone
      });
    }
  },
  
  /** @private
    Calls the create() method with the current internal _date value.
    
    @return {DateTime} the DateTime instance returned by create()
  */
  _createFromCurrentState: function() {
    return this.create({
      milliseconds: this._date.getTime(),
      timezone: this._tz
    });
  },
  
  /**
    Returns a DateTime object created from a given string parsed with a given
    format. Returns null if the parsing fails.

    @see SC.DateTime#toFormattedString for a description of the format parameter
    @param {String} str the string to parse
    @param {String} fmt the format to parse the string with
    @returns {DateTime} the DateTime corresponding to the string parameter
  */
  parse: function(str, fmt) {
    // Declared as an object not a literal since in some browsers the literal
    // retains state across function calls
    var re = new RegExp('(?:%([aAbBcdHIjmMpSUWwxXyYZ%])|(.))', "g");
    var d, parts, opts = {}, check = {}, scanner = SC.Scanner.create({string: str});
    
    if (SC.none(fmt)) fmt = SC.DATETIME_ISO8601;
    
    try {
      while ((parts = re.exec(fmt)) !== null) {
        switch(parts[1]) {
          case 'a': check.dayOfWeek = scanner.scanArray(this.abbreviatedDayNames); break;
          case 'A': check.dayOfWeek = scanner.scanArray(this.dayNames); break;
          case 'b': opts.month = scanner.scanArray(this.abbreviatedMonthNames) + 1; break;
          case 'B': opts.month = scanner.scanArray(this.monthNames) + 1; break;
          case 'c': throw "%c is not implemented";
          case 'd': opts.day = scanner.scanInt(1, 2); break;
          case 'H': opts.hour = scanner.scanInt(1, 2); break;
          case 'I': opts.hour = scanner.scanInt(1, 2); break;
          case 'j': throw "%j is not implemented";
          case 'm': opts.month = scanner.scanInt(1, 2); break;
          case 'M': opts.minute = scanner.scanInt(1, 2); break;
          case 'p': opts.meridian = scanner.scanArray(['AM', 'PM']); break;
          case 'S': opts.second = scanner.scanInt(1, 2); break;
          case 'U': throw "%U is not implemented";
          case 'W': throw "%W is not implemented";
          case 'w': throw "%w is not implemented";
          case 'x': throw "%x is not implemented";
          case 'X': throw "%X is not implemented";
          case 'y': opts.year = scanner.scanInt(2); opts.year += (opts.year > 70 ? 1900 : 2000); break;
          case 'Y': opts.year = scanner.scanInt(4); break;
          case 'Z':
            var modifier = scanner.scan(1);
            if (modifier === 'Z') {
              opts.timezone = 0;
            } else if (modifier === '+' || modifier === '-' ) {
              var h = scanner.scanInt(2);
              if (scanner.scan(1) !== ':') scanner.scan(-1);
              var m = scanner.scanInt(2);
              opts.timezone = (modifier === '+' ? -1 : 1) * (h*60 + m);
            }
            break;
          case '%': scanner.skipString('%'); break;
          default:  scanner.skipString(parts[0]); break;
        }
      }
    } catch (e) {
      console.log('SC.DateTime.createFromString ' + e.toString());
      return null;
    }
    
    if (!SC.none(opts.meridian) && !SC.none(opts.hour)) {
      if (opts.meridian === 1) opts.hour = (opts.hour + 12) % 24;
      delete opts.meridian;
    }
    
    d = SC.DateTime.create(opts);
    
    if (!SC.none(check.dayOfWeek) && d.get('dayOfWeek') !== check.dayOfWeek) {
      return null;
    }
    
    return d;
  },
  
  /** @private
    Converts the x parameter into a string padded with 0s so that the string’s
    length is at least equal to the len parameter.
    
    @param x the object to convert to a string
    @param {Integer} the minimum length of the returned string
    @returns {String} the padded string
  */
  _pad: function(x, len) {
  	var str = '' + x;
  	if (len === undefined) len = 2;
    while (str.length < len) str = '0' + str;
    return str;
  },
  
  /** @private
    @see SC.DateTime#_toFormattedString
  */
  __toFormattedString: function(part, start, timezone) {
    var hour, offset;

    // Note: all calls to _get() here should include only one
    // argument, since _get() is built for recursion and behaves differently
    // if arguments 2 and 3 are included.
    //
    // This method is simply a helper for this._toFormattedString() (one underscore);
    // this is only called from there, and _toFormattedString() has already
    // set up the appropriate internal date/time/timezone state for it.
    
    switch(part[1]) {
      case 'a': return this.abbreviatedDayNames[this._get('dayOfWeek')];
      case 'A': return this.dayNames[this._get('dayOfWeek')];
      case 'b': return this.abbreviatedMonthNames[this._get('month')-1];
      case 'B': return this.monthNames[this._get('month')-1];
      case 'c': return this._date.toString();
      case 'd': return this._pad(this._get('day'));
      case 'D': return this._get('day');
      case 'h': return this._get('hour');
      case 'H': return this._pad(this._get('hour'));
      case 'i':
        hour = this._get('hour');
        return (hour === 12 || hour === 0) ? 12 : (hour + 12) % 12;
      case 'I': 
        hour = this._get('hour');
        return this._pad((hour === 12 || hour === 0) ? 12 : (hour + 12) % 12);
      case 'j': return this._pad(this._get('dayOfYear'), 3);
      case 'm': return this._pad(this._get('month'));
      case 'M': return this._pad(this._get('minute'));
      case 'p': return this._get('hour') > 11 ? 'PM' : 'AM';
      case 'S': return this._pad(this._get('second'));
      case 'u': return this._pad(this._get('utc')); //utc
      case 'U': return this._pad(this._get('week0'));
      case 'W': return this._pad(this._get('week1'));
      case 'w': return this._get('dayOfWeek');
      case 'x': return this._date.toDateString();
      case 'X': return this._date.toTimeString();
      case 'y': return this._pad(this._get('year') % 100);
      case 'Y': return this._get('year');
      case 'Z':
        offset = -1 * timezone;
        return (offset >= 0 ? '+' : '-')
               + this._pad(parseInt(Math.abs(offset)/60, 10))
               + ':'
               + this._pad(Math.abs(offset)%60);
      case '%': return '%';
    }
  },
  
  /** @private
    @see SC.DateTime#toFormattedString
  */
  _toFormattedString: function(format, start, timezone) {
    var that = this;
    var tz = (timezone !== undefined) ? timezone : (this.timezone !== undefined) ? this.timezone : 0;

    // need to move into local time zone for these calculations
    this._setCalcState(start - (timezone * 60000), 0); // so simulate a shifted 'UTC' time

    return format.replace(/\%([aAbBcdDHiIjmMpSUWwxXyYZ\%])/g, function() {
      var v = that.__toFormattedString.call(that, arguments, start, timezone);
      return v;
    });
  },
  
  /**
    This will tell you which of the two passed DateTime is greater than the
    other, by comparing if their number of milliseconds since
    January, 1st 1970 00:00:00.0 UTC.
 
    @param {SC.DateTime} a the first DateTime instance
    @param {SC.DateTime} b the second DateTime instance
    @returns {Integer} -1 if a < b, 
                       +1 if a > b,
                       0 if a == b
  */
  compare: function(a, b) {
    var ma = a.get('milliseconds');
    var mb = b.get('milliseconds');
    return ma < mb ? -1 : ma === mb ? 0 : 1;
  },
  
  /**
    This will tell you which of the two passed DateTime is greater than the
    other, by only comparing the date parts of the passed objects. Only dates
    with the same timezone can be compared.
 
    @param {SC.DateTime} a the first DateTime instance
    @param {SC.DateTime} b the second DateTime instance
    @returns {Integer} -1 if a < b,
                       +1 if a > b,
                       0 if a == b
    @throws {SC.DATETIME_COMPAREDATE_TIMEZONE_ERROR} if the passed arguments
      don't have the same timezone
  */
  compareDate: function(a, b) {
    if (a.get('timezone') !== b.get('timezone')) throw SC.DATETIME_COMPAREDATE_TIMEZONE_ERROR;
    var ma = a.adjust({hour: 0}).get('milliseconds');
    var mb = b.adjust({hour: 0}).get('milliseconds');
    return ma < mb ? -1 : ma === mb ? 0 : 1;
  }
  
});

/**
  Adds a transform to format the DateTime value to a String value according
  to the passed format string. 
  
  {{
    valueBinding: SC.Binding.dateTime('%Y-%m-%d %H:%M:%S')
                  .from('MyApp.myController.myDateTime');
  }}

  @param {String} format format string
  @returns {SC.Binding} this
*/
SC.Binding.dateTime = function(format) {
  return this.transform(function(value, binding) {
    return value ? value.toFormattedString(format) : null;
  });
};

if (SC.RecordAttribute && !SC.RecordAttribute.transforms[SC.guidFor(SC.DateTime)]) {

  /**
    Registers a transform to allow SC.DateTime to be used as a record attribute,
    ie SC.Record.attr(SC.DateTime);

    Because SC.RecordAttribute is in the datastore framework and SC.DateTime in
    the foundation framework, and we don't know which framework is being loaded
    first, this chunck of code is duplicated in both frameworks.

    IF YOU EDIT THIS CODE MAKE SURE YOU COPY YOUR CHANGES to record_attribute.js. 
  */
  SC.RecordAttribute.registerTransform(SC.DateTime, {
  
    /** @private
      Convert a String to a DateTime
    */
    to: function(str, attr) {
      if (SC.none(str) || SC.instanceOf(str, SC.DateTime)) return str;
      var format = attr.get('format');
      return SC.DateTime.parse(str, format ? format : SC.DateTime.recordFormat);
    },
  
    /** @private
      Convert a DateTime to a String
    */
    from: function(dt, attr) {
      if (SC.none(dt)) return dt;
      var format = attr.get('format');
      return dt.toFormattedString(format ? format : SC.DateTime.recordFormat);
    }
  });
  
}

/* >>>>>>>>>> BEGIN source/system/ready.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global main */

SC.BENCHMARK_LOG_READY = YES;

sc_require('system/event') ;

SC.mixin({
  _isReadyBound: NO,
  
  /** @private configures the ready event handler if needed */
  _bindReady: function() {
    if (this._isReadyBound) return;
    this._isReadyBound = YES ;

    // Mozilla, Opera (see further below for it) and webkit nightlies 
    // currently support this event.  Use the handy event callback
    if ( document.addEventListener && !SC.browser.opera) {
      document.addEventListener( "DOMContentLoaded", SC._didBecomeReady, NO );
    }

    // If IE is used and is not in a frame
    // Continually check to see if the document is ready
    if (SC.browser.msie && (window === top)) {
      (function() {
        if (SC.isReady) return;
        try {
          // If IE is used, use the trick by Diego Perini
          // http://javascript.nwbox.com/IEContentLoaded/
          document.documentElement.doScroll("left");
        } catch( error ) {
          setTimeout( arguments.callee, 0 );
          return;
        }
        // and execute any waiting functions
        SC._didBecomeReady();
      })();
    }

    if ( SC.browser.opera ) {
      document.addEventListener( "DOMContentLoaded", function () {
        if (SC.isReady) return;
        for (var i = 0; i < document.styleSheets.length; i++) {
          if (document.styleSheets[i].disabled) {
            setTimeout( arguments.callee, 0 );
            return;
          }
        }
        // and execute any waiting functions
        SC._didBecomeReady();
      }, NO);
    }

    if (SC.browser.safari && SC.browser.safari < 530.0 ) {
      console.error("ready() is not yet supported on Safari 3.1 and earlier");
      // TODO: implement ready() in < Safari 4 
      // var numStyles;
      // (function(){
      //   if (SC.isReady) return;
      //   if ( document.readyState != "loaded" && document.readyState != "complete" ) {
      //     setTimeout( arguments.callee, 0 );
      //     return;
      //   }
      //   if ( numStyles === undefined ) numStyles = 0 ;
      //     //numStyles = SC.$("style, link[rel=stylesheet]").length;
      //   if ( document.styleSheets.length != numStyles ) {
      //     setTimeout( arguments.callee, 0 );
      //     return;
      //   }
      //   // and execute any waiting functions
      //   SC._didBecomeReady();
      // })();
    }

    // A fallback to window.onload, that will always work
    SC.Event.add( window, "load", SC._didBecomeReady);
  },

  /** @private handlers scheduled to execute on ready. */
  _readyQueue: [],
  
  _afterReadyQueue: [],

  isReady: NO,
  
  /** @private invoked when the document becomes ready. */
  _didBecomeReady: function() {
    // Only call once
    if (SC.isReady) return ;
    if (typeof SC.mapDisplayNames === SC.T_FUNCTION) SC.mapDisplayNames();
    if (typeof SC.addInvokeOnceLastDebuggingInfo === SC.T_FUNCTION) SC.addInvokeOnceLastDebuggingInfo();
     
    // setup locale
    SC.Locale.createCurrentLocale();
    
    // if there is a body tag on the document, set the language
    if (document && document.getElementsByTagName) {
      var body = document.getElementsByTagName('body')[0];
      if (body) {
        var className = body.className ;
        var language = SC.Locale.currentLanguage.toLowerCase() ;
        body.className = (className && className.length>0) ? [className, language].join(' ') : language ;
      }
    }

    SC.Benchmark.start('ready') ;
    
    // Begin runloop
    SC.run(function() {
      var handler, ary, idx, len ;

      // correctly handle queueing new SC.ready() calls
      do {
        ary = SC._readyQueue ;
        SC._readyQueue = [] ; // reset
        for (idx=0, len=ary.length; idx<len; idx++) {
          handler = ary[idx] ;
          var target = handler[0] || document ;
          var method = handler[1] ;
          if (method) method.call(target) ;
        }
      } while (SC._readyQueue.length > 0) ;

      // okay, now we're ready (any SC.ready() calls will now be called immediately)
      SC.isReady = YES ;

      // clear the queue
      SC._readyQueue = null ;

      // trigger any bound ready events
      SC.Event.trigger(document, "ready", null, NO);

      // Remove any loading div
      if (SC.removeLoading) SC.$('#loading').remove();

      // Now execute main, if defined and SC.UserDefaults is ready
      if(SC.userDefaults.get('ready')){
        if ((SC.mode === SC.APP_MODE) && (typeof main != "undefined") && (main instanceof Function) && !SC.suppressMain) main();
      } 
      else {
        SC.userDefaults.readyCallback(window, main);
      }
    }, this);
    
    SC.Benchmark.end('ready') ;
    if (SC.BENCHMARK_LOG_READY) SC.Benchmark.log();
  },
  
  /** 
    Add the passed target and method to the queue of methods to invoke when
    the document is ready.  These methods will be called after the document
    has loaded and parsed, but before the main() function is called.
    
    Methods are called in the order they are added.
  
    If you add a ready handler when the main document is already ready, then
    your handler will be called immediately.
    
    @param target {Object} optional target object
    @param method {Function} method name or function to execute
    @returns {SC}
  */
  ready: function(target, method) {
    var queue = this._readyQueue;
    
    // normalize
    if (method === undefined) {
      method = target; target = null ;
    } else if (SC.typeOf(method) === SC.T_STRING) {
      method = target[method] ;
    }
    
    if (!method) return this; // nothing to do.
    
    // if isReady, execute now.
    if (this.isReady) return method.call(target || document) ;
    
    // otherwise, add to queue.
    queue.push([target, method]) ;
    return this ; 
  }
  
}) ;

SC._bindReady() ;
SC.removeLoading = YES;

// default to app mode.  When loading unit tests, this will run in test mode
SC.APP_MODE = "APP_MODE";
SC.TEST_MODE = "TEST_MODE";
SC.mode = SC.APP_MODE;

/* >>>>>>>>>> BEGIN source/system/root_responder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/ready');

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/** @class

  The RootResponder captures events coming from a web browser and routes them
  to the correct view in the view hierarchy.  Usually you do not work with a
  RootResponder directly.  Instead you will work with Pane objects, which
  register themselves with the RootResponder as needed to receive events.

  h1. RootResponder and Platforms

  RootResponder contains core functionality common among the different web
  platforms. You will likely be working with a subclass of RootResponder that
  implements functionality unique to that platform.

  The correct instance of RootResponder is detected at runtime and loaded
  transparently.

  h1. Event Types

  RootResponders can route four types of events:

  - Direct events, such as mouse and touch events.  These are routed to the
    nearest view managing the target DOM elment. RootResponder also handles
    multitouch events so that they are delegated to the correct views.
  - Keyboard events. These are sent to the keyPane, which will then send the
    event to the current firstResponder and up the responder chain.
  - Resize events. When the viewport resizes, these events will be sent to all
    panes.
  - Keyboard shortcuts. Shortcuts are sent to the keyPane first, which
    will go down its view hierarchy. Then they go to the mainPane, which will
    go down its view hierarchy.
  - Actions. Actions are generic messages that your application can send in
    response to user action or other events. You can either specify an
    explicit target, or allow the action to traverse the hierarchy until a
    view is found that handles it.
*/
SC.RootResponder = SC.Object.extend({

  /**
    Contains a list of all panes currently visible on screen.  Everytime a
    pane attaches or detaches, it will update itself in this array.
  */
  panes: null,
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.panes = SC.Set.create();
  },

  // .......................................................
  // MAIN PANE
  //

  /** @property
    The main pane.  This pane receives shortcuts and actions if the
    focusedPane does not respond to them.  There can be only one main pane.
    You can swap main panes by calling makeMainPane() here.

    Usually you will not need to edit the main pane directly.  Instead, you
    should use a MainPane subclass, which will automatically make itself main
    when you append it to the document.
  */
  mainPane: null,

  /**
    Swaps the main pane.  If the current main pane is also the key pane, then
    the new main pane will also be made key view automatically.  In addition
    to simply updating the mainPane property, this method will also notify the
    panes themselves that they will lose/gain their mainView status.

    Note that this method does not actually change the Pane's place in the
    document body.  That will be handled by the Pane itself.

    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMainPane: function(pane) {
    var currentMain = this.get('mainPane') ;
    if (currentMain === pane) return this ; // nothing to do

    this.beginPropertyChanges() ;

    // change key focus if needed.
    if (this.get('keyPane') === currentMain) this.makeKeyPane(pane) ;

    // change setting
    this.set('mainPane', pane) ;

    // notify panes.  This will allow them to remove themselves.
    if (currentMain) currentMain.blurMainTo(pane) ;
    if (pane) pane.focusMainFrom(currentMain) ;

    this.endPropertyChanges() ;
    return this ;
  },

  // ..........................................................
  // MENU PANE
  //

  /**
    The current menu pane. This pane receives keyboard events before all other
    panes, but tends to be transient, as it is only set when a pane is open.

    @type SC.MenuPane
  */
  menuPane: null,

  /**
    Sets a pane as the menu pane. All key events will be directed to this
    pane, but the current key pane will not lose focus.

    Usually you would not call this method directly, but allow instances of
    SC.MenuPane to manage the menu pane for you. If your pane does need to
    become menu pane, you should relinquish control by calling this method
    with a null parameter. Otherwise, key events will always be delivered to
    that pane.

    @param {SC.MenuPane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMenuPane: function(pane) {
    // Does the specified pane accept being the menu pane?  If not, there's
    // nothing to do.
    if (pane  &&  !pane.get('acceptsMenuPane')) {
      return this;
    } else {
      var currentMenu = this.get('menuPane');
      if (currentMenu === pane) return this; // nothing to do

      this.set('menuPane', pane);
    }

    return this;
  },

  // .......................................................
  // KEY PANE
  //

  /**
    The current key pane. This pane receives keyboard events, shortcuts, and
    actions first, unless a menu is open. This pane is usually the highest
    ordered pane or the mainPane.

    @type SC.Pane
  */
  keyPane: null,

  /** @property
    A stack of the previous key panes.

    *IMPORTANT: Property is not observable*
  */
  previousKeyPanes: [],

  /**
    Makes the passed pane the new key pane.  If you pass null or if the pane
    does not accept key focus, then key focus will transfer to the previous
    key pane (if it is still attached), and so on down the stack.  This will
    notify both the old pane and the new root View that key focus has changed.

    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeKeyPane: function(pane) {
    // Was a pane specified?
    var newKeyPane, previousKeyPane, previousKeyPanes ;

    if (pane) {
      // Does the specified pane accept being the key pane?  If not, there's
      // nothing to do.
      if (!pane.get('acceptsKeyPane')) {
        return this ;
      }
      else {
        // It does accept key pane status?  Then push the current keyPane to
        // the top of the stack and make the specified pane the new keyPane.
        // First, though, do a sanity-check to make sure it's not already the
        // key pane, in which case we have nothing to do.
        previousKeyPane = this.get('keyPane') ;
        if (previousKeyPane === pane) {
          return this ;
        }
        else {
          if (previousKeyPane) {
            previousKeyPanes = this.get('previousKeyPanes') ;
            previousKeyPanes.push(previousKeyPane) ;
          }

          newKeyPane = pane ;
        }
      }
    }
    else {
      // No pane was specified?  Then pop the previous key pane off the top of
      // the stack and make it the new key pane, assuming that it's still
      // attached and accepts key pane (its value for acceptsKeyPane might
      // have changed in the meantime).  Otherwise, we'll keep going up the
      // stack.
      previousKeyPane = this.get('keyPane') ;
      previousKeyPanes = this.get('previousKeyPanes') ;

      newKeyPane = null ;
      while (previousKeyPanes.length > 0) {
        var candidate = previousKeyPanes.pop();
        if (candidate.get('isPaneAttached')  &&  candidate.get('acceptsKeyPane')) {
          newKeyPane = candidate ;
          break ;
        }
      }
    }


    // If we found an appropriate candidate, make it the new key pane.
    // Otherwise, make the main pane the key pane (if it accepts it).
    if (!newKeyPane) {
      var mainPane = this.get('mainPane') ;
      if (mainPane && mainPane.get('acceptsKeyPane')) newKeyPane = mainPane ;
    }

    // now notify old and new key views of change after edit
    if (previousKeyPane) previousKeyPane.willLoseKeyPaneTo(newKeyPane) ;
    if (newKeyPane) newKeyPane.willBecomeKeyPaneFrom(previousKeyPane) ;

    this.set('keyPane', newKeyPane) ;

    if (newKeyPane) newKeyPane.didBecomeKeyPaneFrom(previousKeyPane) ;
    if (previousKeyPane) previousKeyPane.didLoseKeyPaneTo(newKeyPane) ;

    return this ;
  },

  // ..........................................................
  // VIEWPORT STATE
  //

  /**
    The last known window size.
    @type Rect
    @isReadOnly
  */
  currentWindowSize: null,

  /**
    Computes the window size from the DOM.

    @returns Rect
  */
    computeWindowSize: function() {
      var size, bod, docElement;
      if(!this._bod || !this._docElement){
        bod = document.body;
        docElement = document.documentElement;
        this._bod=bod;
        this._docElement=docElement;
      }else{
        bod = this._bod;
        docElement = this._docElement;
      }
      if (window.innerHeight) {
        size = {
          width: window.innerWidth,
          height: window.innerHeight
        } ;
      } else if (docElement && docElement.clientHeight) {
        size = {
          width: docElement.clientWidth,
          height: docElement.clientHeight
        };
      } else if (bod) {
        size = {
          width: bod.clientWidth,
          height: bod.clientHeight
        } ;
      }
      return size;
    },

  /**
    On window resize, notifies panes of the change.

    @returns {Boolean}
  */
  resize: function() {
    this._resize();
    //this.invokeLater(this._resize, 10);
    return YES; //always allow normal processing to continue.
  },

  _resize: function() {
    // calculate new window size...
    var newSize = this.computeWindowSize(), oldSize = this.get('currentWindowSize');
    this.set('currentWindowSize', newSize); // update size
    
    if (!SC.rectsEqual(newSize, oldSize)) {
      //Notify orientation change. This is faster than waiting for the orientation
      //change event.
      if(SC.platform.touch){
        var body = SC.$(document.body);    
        if(newSize.height>= newSize.width) {
          SC.device.set('orientation', 'portrait');
        }
        else {
          SC.device.set('orientation', 'landscape');
        }
      }
      // notify panes
      if (this.panes) {
        SC.run(function() {
          this.panes.invoke('windowSizeDidChange', oldSize, newSize) ;
        }, this);
      }
    }
  },

  /**
    Indicates whether or not the window currently has focus.  If you need
    to do something based on whether or not the window is in focus, you can
    setup a binding or observer to this property.  Note that the SproutCore
    automatically adds an sc-focus or sc-blur CSS class to the body tag as
    appropriate.  If you only care about changing the appearance of your
    controls, you should use those classes in your CSS rules instead.
  */
  hasFocus: NO,

  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class
    (removing sc-blur).  Also notify panes.
  */
  focus: function() { 
    if (!this.get('hasFocus')) {
      SC.$('body').addClass('sc-focus').removeClass('sc-blur');

      SC.run(function() {
        this.set('hasFocus', YES);
      }, this);
    }
    return YES ; // allow default
  },
  
  /**
    Handle window focus event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you inmediately get a blur 
    event (Only on IE of course ;)
  */
  focusin: function() {
    this.focus();
  },
  
  /**
    Handle window blur event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you inmediately get a blur 
    event (Only on IE of course ;)
  */
  focusout: function() {
    this.blur();
  },


  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class (removing
    sc-blur).  Also notify panes.
  */
  blur: function() {
    if (this.get('hasFocus')) {
      SC.$('body').addClass('sc-blur').removeClass('sc-focus');

      SC.run(function() {
        this.set('hasFocus', NO);
      }, this);
    }
    return YES ; // allow default
  },

  dragDidStart: function(drag) {
    this._mouseDownView = drag ;
    this._drag = drag ;
  },

  // .......................................................
  // ACTIONS
  //

  /**
    Set this to a delegate object that can respond to actions as they are sent
    down the responder chain.

    @type SC.Object
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder.  This method will
    walk the responder chain, attempting to find a responder that implements
    the action name you pass to this method.  Set 'target' to null to search
    the responder chain.

    IMPORTANT: This method's API and implementation will likely change
    significantly after SproutCore 1.0 to match the version found in
    SC.ResponderContext.

    You generally should not call or override this method in your own
    applications.

    @param {String} action The action to perform - this is a method name.
    @param {SC.Responder} target object to set method to (can be null)
    @param {Object} sender The sender of the action
    @param {SC.Pane} pane optional pane to start search with
    @param {Object} context optional. only passed to ResponderContexts
    @returns {Boolean} YES if action was performed, NO otherwise
    @test in targetForAction
  */
  sendAction: function( action, target, sender, pane, context) {
    target = this.targetForAction(action, target, sender, pane) ;

    // HACK: If the target is a ResponderContext, forward the action.
    if (target && target.isResponderContext) {
      return !!target.sendAction(action, sender, context);
    } else return target && target.tryToPerform(action, sender);
  },

  _responderFor: function(target, methodName) {
    var defaultResponder = target ? target.get('defaultResponder') : null;

    if (target) {
      target = target.get('firstResponder') || target;
      do {
        if (target.respondsTo(methodName)) return target ;
      } while ((target = target.get('nextResponder'))) ;
    }

    // HACK: Eventually we need to normalize the sendAction() method between
    // this and the ResponderContext, but for the moment just look for a
    // ResponderContext as the defaultResponder and return it if present.
    if (typeof defaultResponder === SC.T_STRING) {
      defaultResponder = SC.objectForPropertyPath(defaultResponder);
    }

    if (!defaultResponder) return null;
    else if (defaultResponder.isResponderContext) return defaultResponder;
    else if (defaultResponder.respondsTo(methodName)) return defaultResponder;
    else return null;
  },

  /**
    Attempts to determine the initial target for a given action/target/sender
    tuple.  This is the method used by sendAction() to try to determine the
    correct target starting point for an action before trickling up the
    responder chain.

    You send actions for user interface events and for menu actions.

    This method returns an object if a starting target was found or null if no
    object could be found that responds to the target action.

    Passing an explicit target or pane constrains the target lookup to just
    them; the defaultResponder and other panes are *not* searched.

    @param {Object|String} target or null if no target is specified
    @param {String} method name for target
    @param {Object} sender optional sender
    @param {SC.Pane} optional pane
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender, pane) {

    // 1. no action, no target...
    if (!methodName || (SC.typeOf(methodName) !== SC.T_STRING)) {
      return null ;
    }

    // 2. an explicit target was passed...
    if (target) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target =  SC.objectForPropertyPath(target) || 
                  SC.objectForPropertyPath(target, sender);
      }

      if (target && !target.isResponderContext) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }

      return target ;
    }

    // 3. an explicit pane was passed...
    if (pane) {
      return this._responderFor(pane, methodName) ;
    }

    // 4. no target or pane passed... try to find target in the active panes
    // and the defaultResponder
    var keyPane = this.get('keyPane'), mainPane = this.get('mainPane') ;

    // ...check key and main panes first
    if (keyPane && (keyPane !== pane)) {
      target = this._responderFor(keyPane, methodName) ;
    }
    if (!target && mainPane && (mainPane !== keyPane)) {
      target = this._responderFor(mainPane, methodName) ;
    }

    // ...still no target? check the defaultResponder...
    if (!target && (target = this.get('defaultResponder'))) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
        if (target) this.set('defaultResponder', target) ; // cache if found
      }
      if (target) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }
    }

    return target ;
  },

  /**
    Finds the view that appears to be targeted by the passed event.  This only
    works on events with a valid target property.

    @param {SC.Event} evt
    @returns {SC.View} view instance or null
  */
  targetViewForEvent: function(evt) {
    return evt.target ? SC.$(evt.target).view()[0] : null ;
  },

  /**
    Attempts to send an event down the responder chain.  This method will
    invoke the sendEvent() method on either the keyPane or on the pane owning
    the target view you pass in.  It will also automatically begin and end
    a new run loop.

    If you want to trap additional events, you should use this method to
    send the event down the responder chain.

    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event or null if not handled
  */
  sendEvent: function(action, evt, target) {
    var pane, ret ;

    SC.run(function() {
      // get the target pane
      if (target) pane = target.get('pane') ;
      else pane = this.get('menuPane') || this.get('keyPane') || this.get('mainPane') ;

      // if we found a valid pane, send the event to it
      ret = (pane) ? pane.sendEvent(action, evt, target) : null ;
    }, this);

    return ret ;
  },

  // .......................................................
  // EVENT LISTENER SETUP
  //

  /**
    Default method to add an event listener for the named event.  If you simply
    need to add listeners for a type of event, you can use this method as
    shorthand.  Pass an array of event types to listen for and the element to
    listen in.  A listener will only be added if a handler is actually installed
    on the RootResponder (or receiver) of the same name.

    @param {Array} keyNames
    @param {Element} target
    @param {Object} receiver - optional if you don't want 'this'
    @returns {SC.RootResponder} receiver
  */
  listenFor: function(keyNames, target, receiver) {
    receiver = receiver ? receiver : this;
    keyNames.forEach( function(keyName) {
      var method = receiver[keyName] ;
      if (method) SC.Event.add(target, keyName, receiver, method) ;
    },this) ;
    target = null ;
    return receiver ;
  },

  /**
    Called when the document is ready to begin handling events.  Setup event
    listeners in this method that you are interested in observing for your
    particular platform.  Be sure to call arguments.callee.base.apply(this,arguments).

    @returns {void}
  */
  setup: function() {
    // handle touch events
    this.listenFor('touchstart touchmove touchend touchcancel'.w(), document);

    // handle basic events
    this.listenFor('keydown keyup beforedeactivate mousedown mouseup click dblclick mouseout mouseover mousemove selectstart contextmenu'.w(), document)
        .listenFor('resize'.w(), window);
        
    if(SC.browser.msie) this.listenFor('focusin focusout'.w(), document);
    else this.listenFor('focus blur'.w(), window);

    // handle animation events
    this.listenFor('webkitAnimationStart webkitAnimationIteration webkitAnimationEnd'.w(), document);
    
    // handle special case for keypress- you can't use normal listener to block the backspace key on Mozilla
    if (this.keypress) {
      if (SC.CAPTURE_BACKSPACE_KEY && SC.browser.mozilla) {
        var responder = this ;
        document.onkeypress = function(e) {
          e = SC.Event.normalizeEvent(e);
          return responder.keypress.call(responder, e);
        };

        // SC.Event.add(window, 'unload', this, function() { document.onkeypress = null; }); // be sure to cleanup memory leaks

      // Otherwise, just add a normal event handler.
      } else SC.Event.add(document, 'keypress', this, this.keypress);
    }

    // handle these two events specially in IE
    'drag selectstart'.w().forEach(function(keyName) {
      var method = this[keyName] ;
      if (method) {
        if (SC.browser.msie) {
          var responder = this ;
          document.body['on' + keyName] = function(e) {
            // return method.call(responder, SC.Event.normalizeEvent(e));
            return method.call(responder, SC.Event.normalizeEvent(event || window.event)); // this is IE :(
          };

          // be sure to cleanup memory leaks
           SC.Event.add(window, 'unload', this, function() {
            document.body['on' + keyName] = null;
          });

        } else {
          SC.Event.add(document, keyName, this, method);
        }
      }
    }, this);

    // handle mousewheel specifically for FireFox
    var mousewheel = SC.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel';
    SC.Event.add(document, mousewheel, this, this.mousewheel);



    // If the browser is identifying itself as a touch-enabled browser, but
    // touch events are not present, assume this is a desktop browser doing
    // user agent spoofing and simulate touch events automatically.
    if (SC.browser && SC.platform && SC.browser.mobileSafari && !SC.platform.touch) {
      SC.platform.simulateTouchEvents();
    }

    // do some initial set
    this.set('currentWindowSize', this.computeWindowSize()) ;
    this.focus(); // assume the window is focused when you load.

    if (SC.browser.mobileSafari) {
      // Monkey patch RunLoop if we're in MobileSafari
      var f = SC.RunLoop.prototype.endRunLoop, patch;

      patch = function() {
        // Call original endRunLoop implementation.
        if (f) f.apply(this, arguments);

        // This is a workaround for a bug in MobileSafari.
        // Specifically, if the target of a touchstart event is removed from the DOM,
        // you will not receive future touchmove or touchend events. What we do is, at the
        // end of every runloop, check to see if the target of any touches has been removed
        // from the DOM. If so, we re-append it to the DOM and hide it. We then mark the target
        // as having been moved, and it is de-allocated in the corresponding touchend event.
        var touches = SC.RootResponder.responder._touches, touch, elem, target, textNode, view, found = NO;
        if (touches) {
          // Iterate through the touches we're currently tracking
          for (touch in touches) {
            if (touches[touch]._rescuedElement) continue; // only do once
            
            target = elem = touches[touch].target;

            // Travel up the hierarchy looking for the document body
            while (elem && (elem = elem.parentNode) && !found) {
              found = (elem === document.body);
            }

            // If we aren't part of the body, move the element back
            // but make sure we hide it from display.
            if (!found && target) {

              // Actually clone this node and replace it in the original
              // layer if needed
              if (target.parentNode && target.cloneNode) {
                var clone = target.cloneNode(true);  
                target.parentNode.replaceChild(clone, target);
                target.swapNode = clone; // save for restore later
              }
              
              // Create a holding pen if needed for these views...
              var pen = SC.touchHoldingPen;
              if (!pen) {
                pen = SC.touchHoldingPen = document.createElement('div');
                pen.style.display = 'none';
                document.body.appendChild(pen);
              }

              // move element back into document...
              pen.appendChild(target);

              // // In MobileSafari, our target can sometimes
              // // be a text node, so make sure we handle that case.
              // textNode = (target.nodeType === 3);
              // 
              // if (textNode && target.parentElement) {
              //   // Hide the text node's parent element if it has one
              //   target = target.parentElement;
              //   target.style.display = 'none';
              // } else if (textNode) {
              //   // We have a text node with no containing element,
              //   // so just erase its text content.
              //   target.nodeValue = '';
              // } else {
              //   // Standard Element, just toggle its display off.
              //   target.style.display = 'none';
              // }
              // 
              // // Now move the captured and hidden element back to the DOM.
              // document.body.appendChild(target);
              
              // ...and save the element to be garbage collected on
              // touchEnd.
              touches[touch]._rescuedElement = target;
            }
          }
        }
      };
      SC.RunLoop.prototype.endRunLoop = patch;
    }
    
    // Orientation changes are not being reliably reported with iPhone 0S 3
    // We do this initialization to double check the right orientation.
    // This happens if the orientation has changed from the moment the app 
    // started loading until the app is set until isReady
    if(SC.platform.touch){
      var newSize = this.computeWindowSize(),
          body = SC.$(document.body);
    
      if(newSize.height>= newSize.width) {
        SC.device.set('orientation', 'portrait');
      }
      else {
        SC.device.set('orientation', 'landscape');
      }
    }
  },

  // ................................................................................
  // TOUCH SUPPORT
  //
  /*
    This touch support is written to meet the following specifications. They are actually
    simple, but I decided to write out in great detail all of the rules so there would
    be no confusion.

    There are three events: touchStart, touchEnd, touchDragged. touchStart and End are called
    individually for each touch. touchDragged events are sent to whatever view owns the touch
    event
  */

  /**
    @private
    A map from views to internal touch entries.

    Note: the touch entries themselves also reference the views.
  */
  _touchedViews: {},

  /**
    @private
    A map from internal touch ids to the touch entries themselves.

    The touch entry ids currently come from the touch event's identifier.
  */
  _touches: {},

  /**
    Returns the touches that are registered to the specified view; undefined if none.

    When views receive a touch event, they have the option to subscribe to it.
    They are then mapped to touch events and vice-versa. This returns touches mapped to the view.
  */
  touchesForView: function(view) {
    if (this._touchedViews[SC.guidFor(view)]) {
      return this._touchedViews[SC.guidFor(view)].touches;
    }
  },

  /**
    Computes a hash with x, y, and d (distance) properties, containing the average position
    of all touches, and the average distance of all touches from that average.

    This is useful for implementing scaling.
  */
  averagedTouchesForView: function(view, added) {
    var t = this.touchesForView(view);
    if ((!t || t.length === 0) && !added) return {x: 0, y: 0, d: 0, touchCount: 0};

    // make array of touches
    var touches;
    if (t) touches = t.toArray();
    else touches = [];

    // add added if needed
    if (added) touches.push(added);

    // prepare variables for looping
    var idx, len = touches.length, touch,
        ax = 0, ay = 0, dx, dy, ad = 0;

    // first, add
    for (idx = 0; idx < len; idx++) {
      touch = touches[idx];
      ax += touch.pageX; ay += touch.pageY;
    }

    // now, average
    ax /= len;
    ay /= len;

    // distance
    for (idx = 0; idx < len; idx++) {
      touch = touches[idx];

      // get distance from average
      dx = Math.abs(touch.pageX - ax);
      dy = Math.abs(touch.pageY - ay);

      // Pythagoras was clever...
      ad += Math.pow(dx * dx + dy * dy, 0.5);
    }

    // average
    ad /= len;

    // return
    return {
      x: ax,
      y: ay,
      d: ad,
      touchCount: len
    };
  },

  assignTouch: function(touch, view) {
    // sanity-check
    if (touch.hasEnded) throw "Attemt to assign a touch that is already finished.";
    
    // unassign from old view if necessary
    if (touch.view === view) return;
    if (touch.view) {
      this.unassignTouch(touch);
    }
    
    // create view entry if needed
    if (!this._touchedViews[SC.guidFor(view)]) {
      this._touchedViews[SC.guidFor(view)] = {
        view: view,
        touches: SC.CoreSet.create([]),
        touchCount: 0
      };
      view.set("hasTouch", YES);
    }

    // add touch
    touch.view = view;
    this._touchedViews[SC.guidFor(view)].touches.add(touch);
    this._touchedViews[SC.guidFor(view)].touchCount++;
  },

  unassignTouch: function(touch) {
    // find view entry
    var view, viewEntry;

    // get view
    if (!touch.view) return; // touch.view should===touch.touchResponder eventually :)
    view = touch.view;

    // get view entry
    viewEntry = this._touchedViews[SC.guidFor(view)];
    viewEntry.touches.remove(touch);
    viewEntry.touchCount--;

    // remove view entry if needed
    if (viewEntry.touchCount < 1) {
      view.set("hasTouch", NO);
      viewEntry.view = null;
      delete this._touchedViews[SC.guidFor(view)];
    }

    // clear view
    touch.view = undefined;
  },

  /**
    The touch responder for any given touch is the view which will receive touch events
    for that touch. Quite simple.

    makeTouchResponder takes a potential responder as an argument, and, by calling touchStart on each
    nextResponder, finds the actual responder. As a side-effect of how it does this, touchStart is called
    on the new responder before touchCancelled is called on the old one (touchStart has to accept the touch
    before it can be considered cancelled).

    You usually don't have to think about this at all. However, if you don't want your view to,
    for instance, prevent scrolling in a ScrollView, you need to make sure to transfer control
    back to the previous responder:

    if (Math.abs(touch.pageY - touch.startY) > this.MAX_SWIPE) touch.restoreLastTouchResponder();

    You don't call makeTouchResponder on RootResponder directly. Instead, it gets called for you
    when you return YES to captureTouch or touchStart.

    You do, however, use a form of makeTouchResponder to return to a previous touch responder. Consider
    a button view inside a ScrollView: if the touch moves too much, the button should give control back
    to the scroll view.

    if (Math.abs(touch.pageX - touch.startX) > 4) {
      if (touch.nextTouchResponder) touch.makeTouchResponder(touch.nextTouchResponder);
    }

    This will give control back to the containing view. Maybe you only want to do it if it is a ScrollView?

    if (Math.abs(touch.pageX - touch.startX) > 4 && touch.nextTouchResponder && touch.nextTouchResponder.isScrollable)
      touch.makeTouchResponder(touch.nextTouchResponder);

    Possible gotcha: while you can do touch.nextTouchResponder, the responders are not chained in a linked list like
    normal responders, because each touch has its own responder stack. To navigate through the stack (or, though
    it is not recommended, change it), use touch.touchResponders (the raw stack array).

    makeTouchResponder is called with an event object. However, it usually triggers custom touchStart/touchCancelled
    events on the views. The event object is passed so that functions such as stopPropagation may be called.
  */
  makeTouchResponder: function(touch, responder, shouldStack, upViewChain) {
    var stack = touch.touchResponders, touchesForView;

    // find the actual responder (if any, I suppose)
    // note that the pane's sendEvent function is slightly clever:
    // if the target is already touch responder, it will just return it without calling touchStart
    // we must do the same.
    if (touch.touchResponder === responder) return;

    // send touchStart
    // get the target pane
    var pane;
    if (responder) pane = responder.get('pane') ;
    else pane = this.get('keyPane') || this.get('mainPane') ;

    // if the responder is not already in the stack...
    
    if (stack.indexOf(responder) < 0) {
      // if we need to go up the view chain, do so
      if (upViewChain) {
        // if we found a valid pane, send the event to it
        try {
          responder = (pane) ? pane.sendEvent("touchStart", touch, responder) : null ;
        } catch (e) {
          SC.Logger.error("Error in touchStart: " + e);
          responder = null;
        }
      } else {
        
        if ((responder.get ? responder.get("acceptsMultitouch") : responder.acceptsMultitouch) || !responder.hasTouch) {
          if (!responder.touchStart(touch)) responder = null;
        } else {
          // do nothing; the responder is the responder, and may stay the responder, and all will be fine
        }
      }
    }

    // if the item is in the stack, we will go to it (whether shouldStack is true or not)
    // as it is already stacked
    if (!shouldStack || (stack.indexOf(responder) > -1 && stack[stack.length - 1] !== responder)) {
      // first, we should unassign the touch. Note that we only do this IF WE ARE removing
      // the current touch responder. Otherwise we cause all sorts of headaches; why? Because,
      // if we are not (suppose, for instance, that it is stacked), then the touch does not
      // get passed back to the touch responder-- even while it continues to get events because
      // the touchResponder is still set!
      this.unassignTouch(touch);
      
      // pop all other items
      var idx = stack.length - 1, last = stack[idx];
      while (last && last !== responder) {
        // unassign the touch
        touchesForView = this.touchesForView(last); // won't even exist if there are no touches

        // send touchCancelled (or, don't, if the view doesn't accept multitouch and it is not the last touch)
        if ((last.get ? last.get("acceptsMultitouch") : last.acceptsMultitouch) || !touchesForView) {
          if (last.touchCancelled) last.touchCancelled(touch);
        }

        // go to next (if < 0, it will be undefined, so lovely)
        idx--;
        last = stack[idx];

        // update responders (for consistency)
        stack.pop();

        touch.touchResponder = stack[idx];
        touch.nextTouchResponder = stack[idx - 1];
      }

    }

    // now that we've popped off, we can push on
    if (responder) {
      this.assignTouch(touch, responder);

      // keep in mind, it could be one we popped off _to_ above...
      if (responder !== touch.touchResponder) {
        stack.push(responder);

        // update responder helpers
        touch.touchResponder = responder;
        touch.nextTouchResponder = stack[stack.length - 2];
      }
    }
  },

  /**
    captureTouch is used to find the view to handle a touch. It starts at the starting point and works down
    to the touch's target, looking for a view which captures the touch. If no view is found, it uses the target
    view.

    Then, it triggers a touchStart event starting at whatever the found view was; this propagates up the view chain
    until a view responds YES. This view becomes the touch's owner.

    You usually do not call captureTouch, and if you do call it, you'd call it on the touch itself:
    touch.captureTouch(startingPoint, shouldStack)

    If shouldStack is YES, the previous responder will be kept so that it may be returned to later.
  */
  captureTouch: function(touch, startingPoint, shouldStack) {
    if (!startingPoint) startingPoint = this;

    var target = touch.targetView, view = target,
        chain = [], idx, len;

    if (SC.LOG_TOUCH_EVENTS) {
      SC.Logger.info('  -- Received one touch on %@'.fmt(target.toString()));
    }
    // work up the chain until we get the root
    while (view && (view !== startingPoint)) {
      chain.unshift(view);
      view = view.get('nextResponder');
    }

    // work down the chain
    for (len = chain.length, idx = 0; idx < len; idx++) {
      view = chain[idx];
      if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('  -- Checking %@ for captureTouch response…'.fmt(view.toString()));

      // see if it captured the touch
      if (view.tryToPerform('captureTouch', touch)) {
        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('   -- Making %@ touch responder because it returns YES to captureTouch'.fmt(view.toString()));

        // if so, make it the touch's responder
        this.makeTouchResponder(touch, view, shouldStack, YES); // triggers touchStart/Cancel/etc. event.
        return; // and that's all we need
      }
    }

    if (SC.LOG_TOUCH_EVENTS) SC.Logger.info("   -- Didn't find a view that returned YES to captureTouch, so we're calling touchStart");
    // if we did not capture the touch (obviously we didn't)
    // we need to figure out what view _will_
    // Thankfully, makeTouchResponder does exactly that: starts at the view it is supplied and keeps calling startTouch
    this.makeTouchResponder(touch, target, shouldStack, YES);
  },
  
  /** @private
    Artificially calls endTouch for any touch which is no longer present. This is necessary because
    _sometimes_, WebKit ends up not sending endtouch.
  */
  endMissingTouches: function(presentTouches) {
    var idx, len = presentTouches.length, map = {}, end = [];
    
    // make a map of what touches _are_ present
    for (idx = 0; idx < len; idx++) {
      map[presentTouches[idx].identifier] = YES;
    }
    
    // check if any of the touches we have recorded are NOT present
    for (idx in this._touches) {
      var id = this._touches[idx].identifier;
      if (!map[id]) end.push(this._touches[idx]);
    }
    
    // end said touches
    for (idx = 0, len = end.length; idx < len; idx++) {
      this.endTouch(end[idx]);
      this.finishTouch(end[idx]);
    }
  },
  
  _touchCount: 0,
  /** @private
    Ends a specific touch (for a bit, at least). This does not "finish" a touch; it merely calls
    touchEnd, touchCancelled, etc. A re-dispatch (through recapture or makeTouchResponder) will terminate
    the process; it would have to be restarted separately, through touch.end().
  */
  endTouch: function(touchEntry, action, evt) {
    if (!action) action = "touchEnd";
    
    var responderIdx, responders, responder, originalResponder;
    
    // unassign
    this.unassignTouch(touchEntry);

    // call end for all items in chain
    if (touchEntry.touchResponder) {
      originalResponder = touchEntry.touchResponder;
      
      responders = touchEntry.touchResponders;
      responderIdx = responders.length - 1;
      responder = responders[responderIdx];
      while (responder) {
        // tell it
        try { // keep in mind that it might only _be_ here because it crashed...
          if (responder[action]) responder[action](touchEntry, evt);
        } catch(e) {
          console.error('crashed on endTouch');
        }
        
        // check to see if the responder changed, and stop immediately if so.
        if (touchEntry.touchResponder !== originalResponder) break;

        // next
        responderIdx--;
        responder = responders[responderIdx];
        action = "touchCancelled"; // any further ones receive cancelled
      }
    }
  },
  
  /**
    @private
    "Finishes" a touch. That is, it eradicates it from our touch entries and removes all responder, etc. properties.
  */
  finishTouch: function(touch) {
    var elem;
    
    // ensure the touch is indeed unassigned.
    this.unassignTouch(touch);
    
    // If we rescued this touch's initial element, we should remove it 
    // from the DOM and garbage collect now. See setup() for an 
    // explanation of this bug/workaround.
    if (elem = touch._rescuedElement) {
      if (elem.swapNode && elem.swapNode.parentNode) {
        elem.swapNode.parentNode.replaceChild(elem, elem.swapNode);
      } else if (elem.parentNode === SC.touchHoldingPen) {
        SC.touchHoldingPen.removeChild(elem);
      }
      delete touch._rescuedElement;
      elem.swapNode = null;
      elem = null;
    }
    
    
    // clear responders (just to be thorough)
    touch.touchResponders = null;
    touch.touchResponder = null;
    touch.nextTouchResponder = null;
    touch.hasEnded = YES;

    // and remove from our set
    if (this._touches[touch.identifier]) delete this._touches[touch.identifier];
  },

  /** @private
    Called when the user touches their finger to the screen. This method
    dispatches the touchstart event to the appropriate view.

    We may receive a touchstart event for each touch, or we may receive a
    single touchstart event with multiple touches, so we may have to dispatch
    events to multiple views.

    @param {Event} evt the event
    @returns {Boolean}
  */
  touchstart: function(evt) {
    var hidingTouchIntercept = NO;

    SC.run(function() {
      // sometimes WebKit is a bit... iffy:
      this.endMissingTouches(evt.touches);

      // as you were...    
      // loop through changed touches, calling touchStart, etc.
      var idx, touches = evt.changedTouches, len = touches.length,
          target, view, touch, touchEntry;

      // prepare event for touch mapping.
      evt.touchContext = this;

      // Loop through each touch we received in this event
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // Create an SC.Touch instance for every touch.
        touchEntry = SC.Touch.create(touch, this);

        // skip the touch if there was no target
        if (!touchEntry.targetView) continue;

        // account for hidden touch intercept (passing through touches, etc.)
        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // set timestamp
        touchEntry.timeStamp = evt.timeStamp;

        // Store the SC.Touch object. We use the identifier property (provided
        // by the browser) to disambiguate between touches. These will be used
        // later to determine if the touches have changed.
        this._touches[touch.identifier] = touchEntry;

        // set the event (so default action, etc. can be stopped)
        touchEntry.event = evt; // will be unset momentarily

        // send out event thing: creates a chain, goes up it, then down it,
        // with startTouch and cancelTouch. in this case, only startTouch, as
        // there are no existing touch responders. We send the touchEntry
        // because it is cached (we add the helpers only once)
        this.captureTouch(touchEntry, this);

        // Unset the reference to the original event so we can garbage collect.
        touchEntry.event = null;
      }
    }, this);

    
    // hack for text fields
    if (hidingTouchIntercept) {
      return YES;
    }
    
    return evt.hasCustomEventHandling;
  },

  /**
    @private
    used to keep track of when a specific type of touch event was last handled, to see if it needs to be re-handled
  */
  touchmove: function(evt) {
    SC.run(function() {
      // pretty much all we gotta do is update touches, and figure out which views need updating.
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length, view, changedTouches, viewTouches, firstTouch,
          changedViews = {}, loc, guid, hidingTouchIntercept = NO;

      if (this._drag) {
        touch = SC.Touch.create(evt.changedTouches[0], this);
        this._drag.tryToPerform('mouseDragged', touch);
      }

      // figure out what views had touches changed, and update our internal touch objects
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // get our touch
        touchEntry = this._touches[touch.identifier];

        // we may have no touch entry; this can happen if somehow the touch came to a non-SC area.
        if (!touchEntry) {
          continue;
        }

        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // update touch
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.event = evt;

        // if the touch entry has a view
        if (touchEntry.touchResponder) {
          view = touchEntry.touchResponder;

          guid = SC.guidFor(view);
          // create a view entry
          if (!changedViews[guid]) changedViews[guid] = { "view": view, "touches": [] };

          // add touch
          changedViews[guid].touches.push(touchEntry);
        }
      }

      // HACK: DISABLE OTHER TOUCH DRAGS WHILE MESSING WITH TEXT FIELDS
      if (hidingTouchIntercept) {
        evt.allowDefault();
        return YES;
      }

      // loop through changed views and send events
      for (idx in changedViews) {
        // get info
        view = changedViews[idx].view;
        changedTouches = changedViews[idx].touches;

        // prepare event; note that views often won't use this method anyway (they'll call touchesForView instead)
        evt.viewChangedTouches = changedTouches;

        // the first VIEW touch should be the touch info sent
        viewTouches = this.touchesForView(view);
        firstTouch = viewTouches.firstObject();
        evt.pageX = firstTouch.pageX;
        evt.pageY = firstTouch.pageY;
        evt.touchContext = this; // so it can call touchesForView

        // and go
        view.tryToPerform("touchesDragged", evt, viewTouches);
      }

      // clear references to event
      touches = evt.changedTouches;
      len = touches.length;
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];
        touchEntry = this._touches[touch.identifier];
        touchEntry.event = null;
      }
    }, this);

    return evt.hasCustomEventHandling;
  },

  touchend: function(evt) {
    var hidesTouchIntercept = NO;

    SC.run(function() {
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length,
          view, elem,
          action = evt.isCancel ? "touchCancelled" : "touchEnd", a,
          responderIdx, responders, responder;

      for (idx = 0; idx < len; idx++) {
        //get touch+entry
        touch = touches[idx];
        touch.type = 'touchend';
        touchEntry = this._touches[touch.identifier];

        // check if there is an entry
        if (!touchEntry) continue;

        // continue work
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.type = 'touchend';
        touchEntry.event = evt;

        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('-- Received touch end');
        if (touchEntry.hidesTouchIntercept) {
          touchEntry.unhideTouchIntercept();
          hidesTouchIntercept = YES;
        }

        if (this._drag) {
          this._drag.tryToPerform('mouseUp', touch) ;
          this._drag = null ;
        }

        // unassign
        this.endTouch(touchEntry, action, evt);
        this.finishTouch(touchEntry);
      }
    }, this);

    
    // for text fields
    if (hidesTouchIntercept) {
      return YES;
    }
    
    return evt.hasCustomEventHandling;
  },

  /** @private
    Handle touch cancel event.  Works just like cancelling a touch for any other reason.
    touchend handles it as a special case (sending cancel instead of end if needed).
  */
  touchcancel: function(evt) {
    evt.isCancel = YES;
    this.touchend(evt);
  },

  // ..........................................................
  // KEYBOARD HANDLING
  //


  /**
    Invoked on a keyDown event that is not handled by any actual value.  This
    will get the key equivalent string and then walk down the keyPane, then
    the focusedPane, then the mainPane, looking for someone to handle it.
    Note that this will walk DOWN the view hierarchy, not up it like most.

    @returns {Object} Object that handled evet or null
  */
  attemptKeyEquivalent: function(evt) {
    var ret = null ;

    // keystring is a method name representing the keys pressed (i.e
    // 'alt_shift_escape')
    var keystring = evt.commandCodes()[0];

    // couldn't build a keystring for this key event, nothing to do
    if (!keystring) return NO;

    var menuPane = this.get('menuPane'),
        keyPane  = this.get('keyPane'),
        mainPane = this.get('mainPane');

    if (menuPane) {
      ret = menuPane.performKeyEquivalent(keystring, evt) ;
      if (ret) return ret;
    }

    // Try the keyPane.  If it's modal, then try the equivalent there but on
    // nobody else.
    if (keyPane) {
      ret = keyPane.performKeyEquivalent(keystring, evt) ;
      if (ret || keyPane.get('isModal')) return ret ;
    }

    // if not, then try the main pane
    if (!ret && mainPane && (mainPane!==keyPane)) {
      ret = mainPane.performKeyEquivalent(keystring, evt);
      if (ret || mainPane.get('isModal')) return ret ;
    }

    return ret ;
  },

  _lastModifiers: null,

  /** @private
    Modifier key changes are notified with a keydown event in most browsers.
    We turn this into a flagsChanged keyboard event.  Normally this does not
    stop the normal browser behavior.
  */
  _handleModifierChanges: function(evt) {
    // if the modifier keys have changed, then notify the first responder.
    var m;
    m = this._lastModifiers = (this._lastModifiers || { alt: false, ctrl: false, shift: false });

    var changed = false;
    if (evt.altKey !== m.alt) { m.alt = evt.altKey; changed=true; }
    if (evt.ctrlKey !== m.ctrl) { m.ctrl = evt.ctrlKey; changed=true; }
    if (evt.shiftKey !== m.shift) { m.shift = evt.shiftKey; changed=true;}
    evt.modifiers = m; // save on event

    return (changed) ? (this.sendEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },

  /** @private
    Determines if the keyDown event is a nonprintable or function key. These
    kinds of events are processed as keyboard shortcuts.  If no shortcut
    handles the event, then it will be sent as a regular keyDown event.
  */
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey || ((evt.charCode !== evt.which) && SC.FUNCTION_KEYS[evt.which]));
  },

  /** @private
    Determines if the event simply reflects a modifier key change.  These
    events may generate a flagsChanged event, but are otherwise ignored.
  */
  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.charCode];
  },

  /** @private
    The keydown event occurs whenever the physically depressed key changes.
    This event is used to deliver the flagsChanged event and to with function
    keys and keyboard shortcuts.

    All actions that might cause an actual insertion of text are handled in
    the keypress event.
  */
  keydown: function(evt) {
    if (SC.none(evt)) return YES;

    var keyCode = evt.keyCode;

    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (keyCode===229){
      this._IMEInputON = YES;
      return this.sendEvent('keyDown', evt);
    }

    // If user presses the escape key while we are in the middle of a
    // drag operation, cancel the drag operation and handle the event.
    if (keyCode === 27 && this._drag) {
      this._drag.cancelDrag();
      this._drag = null;
      this._mouseDownView = null;
      return YES;
    }

    // Firefox does NOT handle delete here...
    if (SC.browser.mozilla && (evt.which === 8)) return true ;

    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this
    // is only a modifier change
    var ret = this._handleModifierChanges(evt),
        target = evt.target || evt.srcElement,
        forceBlock = (evt.which === 8) && !SC.allowsBackspaceToPreviousPage && (target === document.body);

    if (this._isModifierKey(evt)) return (forceBlock ? NO : ret);

    // if this is a function or non-printable key, try to use this as a key
    // equivalent.  Otherwise, send as a keyDown event so that the focused
    // responder can do something useful with the event.
    ret = YES ;
    if (this._isFunctionOrNonPrintableKey(evt)) {
      // otherwise, send as keyDown event.  If no one was interested in this
      // keyDown event (probably the case), just let the browser do its own
      // processing.

      // Arrow keys are handled in keypress for firefox
      if (keyCode>=37 && keyCode<=40 && SC.browser.mozilla) return YES;


      ret = this.sendEvent('keyDown', evt) ;

      // attempt key equivalent if key not handled
      if (!ret) {
        ret = !this.attemptKeyEquivalent(evt) ;
      } else {
        ret = evt.hasCustomEventHandling ;
        if (ret) forceBlock = NO ; // code asked explicitly to let delete go
      }
    }

    return forceBlock ? NO : ret ;
  },

  /** @private
    The keypress event occurs after the user has typed something useful that
    the browser would like to insert.  Unlike keydown, the input codes here
    have been processed to reflect that actual text you might want to insert.

    Normally ignore any function or non-printable key events.  Otherwise, just
    trigger a keyDown.
  */
  keypress: function(evt) {
    var ret,
        keyCode   = evt.keyCode,
        isFirefox = !!SC.browser.mozilla;

    // delete is handled in keydown() for most browsers
    if (isFirefox && (evt.which === 8)) {
      //get the keycode and set it for which.
      evt.which = keyCode;
      ret = this.sendEvent('keyDown', evt);
      return ret ? (SC.allowsBackspaceToPreviousPage || evt.hasCustomEventHandling) : YES ;

    // normal processing.  send keyDown for printable keys...
    //there is a special case for arrow key repeating of events in FF.
    } else {
      var isFirefoxArrowKeys = (keyCode >= 37 && keyCode <= 40 && isFirefox),
          charCode           = evt.charCode;
      if ((charCode !== undefined && charCode === 0) && !isFirefoxArrowKeys) return YES;
      if (isFirefoxArrowKeys) evt.which = keyCode;
      return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;
    }
  },

  keyup: function(evt) {
    // to end the simulation of keypress in firefox set the _ffevt to null
    if(this._ffevt) this._ffevt=null;
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (this._IMEInputON && evt.keyCode===13){
      evt.isIMEInput = YES;
      this.sendEvent('keyDown', evt);
      this._IMEInputON = NO;
    }
    return this.sendEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  },

  /**
    IE's default behavior to blur textfields and other controls can only be
    blocked by returning NO to this event. However we don't want to block
    its default behavior otherwise textfields won't loose focus by clicking on 
    an empty area as it's expected. If you want to block IE from bluring another 
    control set blockIEDeactivate to true on the especific view in which you 
    want to avoid this. Think of an autocomplete menu, you want to click on 
    the menu but don't loose focus. 
  */
  beforedeactivate: function(evt) {
    var toElement = evt.toElement;
    if (toElement && toElement.tagName && toElement.tagName!=="IFRAME") {
      var view = SC.$(toElement).view()[0];
      //The following line is neccesary to allow/block text selection for IE,
      // in combination with the selectstart event.
      if (view && view.get('blocksIEDeactivate')) return NO;
    }
    return YES;
  },

  // ..........................................................
  // MOUSE HANDLING
  //

  mousedown: function(evt) {
    if (SC.platform.touch) {
      evt.allowDefault();
      return YES;
    }
    
    if(!SC.browser.msie) window.focus();
    
    // First, save the click count. The click count resets if the mouse down
    // event occurs more than 200 ms later than the mouse up event or more
    // than 8 pixels away from the mouse down event.
    this._clickCount += 1 ;
    if (!this._lastMouseUpAt || ((Date.now()-this._lastMouseUpAt) > 200)) {
      this._clickCount = 1 ;
    } else {
      var deltaX = this._lastMouseDownX - evt.clientX,
          deltaY = this._lastMouseDownY - evt.clientY,
          distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY) ;
      if (distance > 8.0) this._clickCount = 1 ;
    }
    evt.clickCount = this._clickCount ;

    this._lastMouseDownX = evt.clientX ;
    this._lastMouseDownY = evt.clientY ;

    var fr, view = this.targetViewForEvent(evt) ;

    // InlineTextField needs to loose firstResponder whenever you click outside
    // the view. This is a special case as textfields are not supposed to loose
    // focus unless you click on a list, another textfield or an special
    // view/control.

    if(view) fr=view.getPath('pane.firstResponder');

    if(fr && fr.kindOf(SC.InlineTextFieldView) && fr!==view){
      fr.resignFirstResponder();
    }

    view = this._mouseDownView = this.sendEvent('mouseDown', evt, view) ;
    if (view && view.respondsTo('mouseDragged')) this._mouseCanDrag = YES ;
  

    return view ? evt.hasCustomEventHandling : YES;
  },

  /**
    mouseUp only gets delivered to the view that handled the mouseDown evt.
    we also handle click and double click notifications through here to
    ensure consistant delivery.  Note that if mouseDownView is not
    implemented, then no mouseUp event will be sent, but a click will be
    sent.
  */
  mouseup: function(evt) {
    if (SC.platform.touch) {
      evt.allowDefault();
      return YES;
    }
    
    this.targetViewForEvent(evt);
    
    if (this._drag) {
      this._drag.tryToPerform('mouseUp', evt) ;
      this._drag = null ;
    }

    var handler = null, view = this._mouseDownView,
        targetView = this.targetViewForEvent(evt);
    this._lastMouseUpAt = Date.now() ;

    // record click count.
    evt.clickCount = this._clickCount ;

    // attempt the mouseup call only if there's a target.
    // don't want a mouseup going to anyone unless they handled the mousedown...
    if (view) {
      handler = this.sendEvent('mouseUp', evt, view) ;

      // try doubleClick
      if (!handler && (this._clickCount === 2)) {
        handler = this.sendEvent('doubleClick', evt, view) ;
      }

      // try single click
      if (!handler) {
        handler = this.sendEvent('click', evt, view) ;
      }
    }

    // try whoever's under the mouse if we haven't handle the mouse up yet
    if (!handler) {

      // try doubleClick
      if (this._clickCount === 2) {
        handler = this.sendEvent('doubleClick', evt, targetView);
      }

      // try singleClick
      if (!handler) {
        handler = this.sendEvent('click', evt, targetView) ;
      }
    }

    // cleanup
    this._mouseCanDrag = NO; this._mouseDownView = null ;
  
    return (handler) ? evt.hasCustomEventHandling : YES ;
  },

  dblclick: function(evt){
    if (SC.browser.isIE) {
      this._clickCount = 2;
      // this._onmouseup(evt);
      this.mouseup(evt);
    }
  },

  mousewheel: function(evt) {
    var view = this.targetViewForEvent(evt) ,
        handler = this.sendEvent('mouseWheel', evt, view) ;
  
    return (handler) ? evt.hasCustomEventHandling : YES ;
  },

  _lastHovered: null,

  /**
   This will send mouseEntered, mouseExited, mousedDragged and mouseMoved
   to the views you hover over.  To receive these events, you must implement
   the method. If any subviews implement them and return true, then you won't
   receive any notices.

   If there is a target mouseDown view, then mouse moved events will also
   trigger calls to mouseDragged.
  */
  mousemove: function(evt) {
    if (SC.platform.touch) {
      evt.allowDefault();
      return YES;
    }
    
    if (SC.browser.msie) {
      if (this._lastMoveX === evt.clientX && this._lastMoveY === evt.clientY) return;
    }

    // We'll record the last positions in all browsers, in case a special pane
    // or some such UI absolutely needs this information.
    this._lastMoveX = evt.clientX;
    this._lastMoveY = evt.clientY;

    SC.run(function() {
       // make sure the view gets focus no matter what.  FF is inconsistant
       // about this.
      // this.focus();
       // only do mouse[Moved|Entered|Exited|Dragged] if not in a drag session
       // drags send their own events, e.g. drag[Moved|Entered|Exited]
       if (this._drag) {
         //IE triggers mousemove at the same time as mousedown
         if(SC.browser.msie){
           if (this._lastMouseDownX !== evt.clientX || this._lastMouseDownY !== evt.clientY) {
             this._drag.tryToPerform('mouseDragged', evt);
           }
         }
         else {
           this._drag.tryToPerform('mouseDragged', evt);
         }
       } else {
         var lh = this._lastHovered || [] , nh = [] , exited, loc, len,
             view = this.targetViewForEvent(evt) ;
         
         // first collect all the responding view starting with the 
         // target view from the given mouse move event
         while (view && (view !== this)) {
           nh.push(view);
           view = view.get('nextResponder');
         }
        
         // next exit views that are no longer part of the 
         // responding chain
         for (loc=0, len=lh.length; loc < len; loc++) {
           view = lh[loc] ;
           exited = view.respondsTo('mouseExited');
           if (exited && nh.indexOf(view) === -1) {
             view.tryToPerform('mouseExited', evt);
           }
         }
         
         // finally, either perform mouse moved or mouse entered depending on
         // whether a responding view was or was not part of the last
         // hovered views
         for (loc=0, len=nh.length; loc < len; loc++) {
           view = nh[loc];
           if (lh.indexOf(view) !== -1) {
             view.tryToPerform('mouseMoved', evt);
           } else {
             view.tryToPerform('mouseEntered', evt);
           }
         }

         // Keep track of the view that were last hovered
         this._lastHovered = nh;

         // also, if a mouseDownView exists, call the mouseDragged action, if
         // it exists.
         if (this._mouseDownView) {
           if(SC.browser.msie){
             if (this._lastMouseDownX !== evt.clientX && this._lastMouseDownY !== evt.clientY) {
               this._mouseDownView.tryToPerform('mouseDragged', evt);
             }
           }
           else {
             this._mouseDownView.tryToPerform('mouseDragged', evt);
           }
         }
       }
    }, this);
  },

  // these methods are used to prevent unnecessary text-selection in IE,
  // there could be some more work to improve this behavior and make it
  // a bit more useful; right now it's just to prevent bugs when dragging
  // and dropping.

  _mouseCanDrag: YES,

  selectstart: function(evt) {
    var targetView = this.targetViewForEvent(evt),
        result = this.sendEvent('selectStart', evt, targetView);

    // If the target view implements mouseDragged, then we want to ignore the
    // 'selectstart' event.
    if (targetView && targetView.respondsTo('mouseDragged')) {
      return (result !==null ? YES: NO) && !this._mouseCanDrag;
    }
    else {
      return (result !==null ? YES: NO);
    }
  },

  drag: function() { return false; },

  contextmenu: function(evt) {
    var view = this.targetViewForEvent(evt) ;
    return this.sendEvent('contextMenu', evt, view);
  },

  // ..........................................................
  // ANIMATION HANDLING
  //
  webkitAnimationStart: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ;
      this.sendEvent('animationDidStart', evt, view) ;
    } catch (e) {
      console.warn('Exception during animationDidStart: %@'.fmt(e)) ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  },

  webkitAnimationIteration: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ;
      this.sendEvent('animationDidIterate', evt, view) ;
    } catch (e) {
      console.warn('Exception during animationDidIterate: %@'.fmt(e)) ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  },

  webkitAnimationEnd: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ;
      this.sendEvent('animationDidEnd', evt, view) ;
    } catch (e) {
      console.warn('Exception during animationDidEnd: %@'.fmt(e)) ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  }

});

/**
  @class SC.Touch
  Represents a touch.

  Views receive touchStart and touchEnd.
*/
SC.Touch = function(touch, touchContext) {
  // get the raw target view (we'll refine later)
  this.touchContext = touchContext;
  this.identifier = touch.identifier; // for now, our internal id is WebKit's id.
  
  var target = touch.target, targetView;
  if (target && SC.$(target).hasClass("touch-intercept")) {
    touch.target.style.webkitTransform = "translate3d(0px,-5000px,0px)";
    target = document.elementFromPoint(touch.pageX, touch.pageY);
    if (target) targetView = SC.$(target).view()[0];
    
    this.hidesTouchIntercept = NO;
    if (target.tagName === "INPUT") {
      this.hidesTouchIntercept = touch.target;
    } else {
      touch.target.style.webkitTransform = "translate3d(0px,0px,0px)";
    }
  } else {
    targetView = touch.target ? SC.$(touch.target).view()[0] : null;
  }
  this.targetView = targetView;
  this.target = target;
  this.hasEnded = NO;
  this.type = touch.type;
  this.clickCount = 1;

  this.view = undefined;
  this.touchResponder = this.nextTouchResponder = undefined;
  this.touchResponders = [];

  this.startX = this.pageX = touch.pageX;
  this.startY = this.pageY = touch.pageY;
};

SC.Touch.prototype = {
  /**@scope SC.Touch.prototype*/

  unhideTouchIntercept: function() {
    var intercept = this.hidesTouchIntercept;
    if (intercept) {
      setTimeout(function() { intercept.style.webkitTransform = "translate3d(0px,0px,0px)"; }, 500);
    }
  },

  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.
  */
  allowDefault: function() {
    if (this.event) this.event.hasCustomEventHandling = YES ;
  },

  /**
    If the touch is associated with an event, prevents default action on the event.
  */
  preventDefault: function() {
    if (this.event) this.event.preventDefault();
  },

  stopPropagation: function() {
    if (this.event) this.event.stopPropagation();
  },

  stop: function() {
    if (this.event) this.event.stop();
  },

  /**
    Removes from and calls touchEnd on the touch responder.
  */
  end: function() {
    this.touchContext.endTouch(this);
  },

  /**
    Changes the touch responder for the touch. If shouldStack === YES,
    the current responder will be saved so that the next responder may
    return to it.
  */
  makeTouchResponder: function(responder, shouldStack, upViewChain) {
    this.touchContext.makeTouchResponder(this, responder, shouldStack, upViewChain);
  },


  /**
    Captures, or recaptures, the touch. This works from the touch's raw target view
    up to the startingPoint, and finds either a view that returns YES to captureTouch() or
    touchStart().
  */
  captureTouch: function(startingPoint, shouldStack) {
    this.touchContext.captureTouch(this, startingPoint, shouldStack);
  },

  /**
    Returns all touches for a specified view. Put as a convenience on the touch itself; this method
    is also available on the event.
  */
  touchesForView: function(view) {
    return this.touchContext.touchesForView(view);
  },
  
  /**
    Same as touchesForView, but sounds better for responders.
  */
  touchesForResponder: function(responder) {
    return this.touchContext.touchesForView(responder);
  },

  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the supplied view.

    addSelf adds this touch to the set being considered. This is useful from touchStart. If
    you use it from anywhere else, it will make this touch be used twice--so use caution.
  */
  averagedTouchesForView: function(view, addSelf) {
    return this.touchContext.averagedTouchesForView(view, (addSelf ? this : null));
  }
};

SC.mixin(SC.Touch, {
  create: function(touch, touchContext) {
    return new SC.Touch(touch, touchContext);
  }
});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function() {
  var r;
  r = SC.RootResponder.responder = SC.RootResponder.create() ;
  r.setup() ;
});

/* >>>>>>>>>> BEGIN source/system/platform.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  This platform object allows you to conditionally support certain HTML5
  features.

  Rather than relying on the user agent, it detects whether the given elements
  and events are supported by the browser, allowing you to create much more
  robust apps.
*/

SC.platform = {
  /**
    YES if the current device supports touch events, NO otherwise.

    You can simulate touch events in environments that don't support them by
    calling SC.platform.simulateTouchEvents() from your browser's console.

    @property {Boolean}
  */
  touch: ('createTouch' in document) && !navigator.userAgent.match('Chrome/9'), // Ugly hack for Chrome 9 issue
  
  bounceOnScroll: (/iPhone|iPad|iPod/).test(navigator.platform),
  pinchToZoom: (/iPhone|iPad|iPod/).test(navigator.platform),

  /**
    A hash that contains properties that indicate support for new HTML5
    input attributes.

    For example, to test to see if the placeholder attribute is supported,
    you would verify that SC.platform.input.placeholder is YES.
  */
  input: function(attributes) {
    var ret = {},
        len = attributes.length,
        elem = document.createElement('input'),
        attr, idx;

    for (idx=0; idx < len; idx++) {
      attr = attributes[idx];

      ret[attr] = !!(attr in elem);
    }

    return ret;
  }(('autocomplete readonly list size required multiple maxlength '
    +'pattern min max step placeholder').w()),

  /**
    YES if the application is currently running as a standalone application.

    For example, if the user has saved your web application to their home
    screen on an iPhone OS-based device, this property will be true.
    @property {Boolean}
  */
  standalone: !!navigator.standalone,


  /**
    Prefix for browser specific CSS attributes. Calculated later.
  */
  cssPrefix: null,

  /**
    Prefix for browsew specific CSS attributes when used in the DOM. Calculated later.
  */
  domCSSPrefix: null,

  /**
    Call this method to swap out the default mouse handlers with proxy methods
    that will translate mouse events to touch events.

    This is useful if you are debugging touch functionality on the desktop.
  */
  simulateTouchEvents: function() {
    // Touch events are supported natively, no need for this.
    if (this.touch) {
      //@ if (debug)
      SC.Logger.info("Can't simulate touch events in an environment that supports them.");
      //@ endif
      return;
    }

    // Tell the app that we now "speak" touch
    SC.platform.touch = YES;

    // CSS selectors may depend on the touch class name being present
    document.body.className = document.body.className + ' touch';

    // Initialize a counter, which we will use to generate unique ids for each
    // fake touch.
    this._simtouch_counter = 1;

    // Remove events that don't exist in touch environments
    this.removeEvents('click dblclick mouseout mouseover mousewheel'.w());

    // Replace mouse events with our translation methods
    this.replaceEvent('mousemove', this._simtouch_mousemove);
    this.replaceEvent('mousedown', this._simtouch_mousedown);
    this.replaceEvent('mouseup', this._simtouch_mouseup);
  },

  /** @private
    Removes event listeners from the document.

    @param {Array} events Array of strings representing the events to remove
  */
  removeEvents: function(events) {
    var idx, len = events.length, key;
    for (idx = 0; idx < len; idx++) {
      key = events[idx];
      SC.Event.remove(document, key, SC.RootResponder.responder, SC.RootResponder.responder[key]);
    }
  },

  /** @private
    Replaces an event listener with another.

    @param {String} evt The event to replace
    @param {Function} replacement The method that should be called instead
  */
  replaceEvent: function(evt, replacement) {
    SC.Event.remove(document, evt, SC.RootResponder.responder, SC.RootResponder.responder[evt]);
    SC.Event.add(document, evt, this, replacement);
  },

  /** @private
    When simulating touch events, this method is called when mousemove events
    are received.
  */
  _simtouch_mousemove: function(evt) {
    if (!this._mousedown) return NO;

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchmove');
    return SC.RootResponder.responder.touchmove(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mousedown events
    are received.
  */
  _simtouch_mousedown: function(evt) {
    this._mousedown = YES;

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchstart');
    return SC.RootResponder.responder.touchstart(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mouseup events
    are received.
  */
  _simtouch_mouseup: function(evt) {
    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchend'),
        ret = SC.RootResponder.responder.touchend(manufacturedEvt);

    this._mousedown = NO;
    this._simtouch_counter++;
    return ret;
  },

  /** @private
    Converts a mouse-style event to a touch-style event.

    Note that this method edits the passed event in place, and returns
    that same instance instead of a new, modified version.

    @param {Event} evt the mouse event to modify
    @param {String} type the type of event (e.g., touchstart)
    @returns {Event} the mouse event with an added changedTouches array
  */
  manufactureTouchEvent: function(evt, type) {
    var touch, touchIdentifier = this._simtouch_counter;

    touch = {
      type: type,
      target: evt.target,
      identifier: touchIdentifier,
      pageX: evt.pageX,
      pageY: evt.pageY,
      screenX: evt.screenX,
      screenY: evt.screenY,
      clientX: evt.clientX,
      clientY: evt.clientY
    };

    evt.changedTouches = evt.touches = [ touch ];
    return evt;
  },

  /**
    Whether the browser supports CSS transitions. Calculated later.
  */
  supportsCSSTransitions: NO,

  /**
    Whether the browser supports 2D CSS transforms. Calculated later.
  */
  supportsCSSTransforms: NO,

  /**
    Whether the browser understands 3D CSS transforms.
    This does not guarantee that the browser properly handles them.
    Calculated later.
  */
  understandsCSS3DTransforms: NO,

  /**
    Whether the browser can properly handle 3D CSS transforms. Calculated later.
  */
  supportsCSS3DTransforms: NO,
  
  /**
    Whether the browser can handle accelerated layers. While supports3DTransforms tells us if they will
    work in principle, sometimes accelerated layers interfere with things like getBoundingClientRect.
    Then everything breaks.
  */
  supportsAcceleratedLayers: NO,
  
  /**
    Wether the browser supports the hashchange event.
  */
  supportsHashChange: function() {
    // Code copied from Modernizr which copied code from YUI (MIT licenses)
    // documentMode logic from YUI to filter out IE8 Compat Mode which false positives
    return ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode > 7);
  }()
};

/* Calculate CSS Prefixes */

(function(){
  var userAgent = navigator.userAgent.toLowerCase();
  if ((/webkit/).test(userAgent)) {
    SC.platform.cssPrefix = 'webkit';
    SC.platform.domCSSPrefix = 'Webkit';
  } else if((/opera/).test( userAgent )) {
    SC.platform.cssPrefix = 'opera';
    SC.platform.domCSSPrefix = 'O';
  } else if((/msie/).test( userAgent ) && !(/opera/).test( userAgent )) {
    SC.platform.cssPrefix = 'ms';
    SC.platform.domCSSPrefix = 'ms';
  } else if((/mozilla/).test( userAgent ) && !(/(compatible|webkit)/).test( userAgent )) {
    SC.platform.cssPrefix = 'moz';
    SC.platform.domCSSPrefix = 'Moz';
  }
})();

/* Calculate transform support */

(function(){
  // a test element
  var el = document.createElement("div");

  // the css and javascript to test
  var css_browsers = ["-moz-", "-moz-", "-o-", "-ms-", "-webkit-"];
  var test_browsers = ["moz", "Moz", "o", "ms", "webkit"];

  // prepare css
  var css = "", i = null;
  for (i = 0; i < css_browsers.length; i++) {
    css += css_browsers[i] + "transition:all 1s linear;";
    css += css_browsers[i] + "transform: translate(1px, 1px);";
    css += css_browsers[i] + "perspective: 500px;";
  }

  // set css text
  el.style.cssText = css;

  // test
  for (i = 0; i < test_browsers.length; i++)
  {
    if (el.style[test_browsers[i] + "TransitionProperty"] !== undefined) SC.platform.supportsCSSTransitions = YES;
    if (el.style[test_browsers[i] + "Transform"] !== undefined) SC.platform.supportsCSSTransforms = YES;
    if (el.style[test_browsers[i] + "Perspective"] !== undefined || el.style[test_browsers[i] + "PerspectiveProperty"] !== undefined) {
      SC.platform.understandsCSS3DTransforms = YES;
      SC.platform.supportsCSS3DTransforms = YES;
    }
  }

  // unfortunately, we need a bit more to know FOR SURE that 3D is allowed
  if (window.media && window.media.matchMedium) {
    if (!window.media.matchMedium('(-webkit-transform-3d)')) SC.platform.supportsCSS3DTransforms = NO;
  } else if(window.styleMedia && window.styleMedia.matchMedium) {
    if (!window.styleMedia.matchMedium('(-webkit-transform-3d)')) SC.platform.supportsCSS3DTransforms = NO;    
  }
  
  // Unfortunately, this has to be manual, as I can't think of a good way to test it
  // webkit-only for now.
  if (SC.platform.supportsCSSTransforms && SC.platform.cssPrefix === "webkit") {
    SC.platform.supportsAcceleratedLayers = YES;
  }
})();

/* >>>>>>>>>> BEGIN source/system/device.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/ready');
require('system/root_responder');
require('system/platform');

/**
  The device object allows you to check device specific properties such as 
  orientation and if the device is offline, as well as observe when they change 
  state.
  
  h1. Orientation
  When a touch device changes orientation, the orientation property will be
  set accordingly which you can observe
  
  h1. Offline support
  In order to build a good offline-capable web application, you need to know 
  when your app has gone offline so you can for instance queue your server 
  requests for a later time or provide a specific UI/message.
  
  Similarly, you also need to know when your application has returned to an 
  'online' state again, so that you can re-synchronize with the server or do 
  anything else that might be needed.
  
  By observing the 'isOffline' property you can be notified when this state
  changes. Note that this property is only connected to the navigator.onLine
  property, which is available on most modern browsers.
  
*/
SC.device = SC.Object.create({
  
  /**
    Sets the orientation for touch devices, either 'landscape' or 'portrait'. 
    Will be 'desktop' in the case of non-touch devices.
  
    @property {String}
    @default 'desktop'
  */
  orientation: 'desktop',
  
  /**
    Indicates whether the device is currently online or offline. For browsers
    that do not support this feature, the default value is NO.
    
    Is currently inverse of the navigator.onLine property. Most modern browsers
    will update this property when switching to or from the browser's Offline 
    mode, and when losing/regaining network connectivity.
    
    @property {Boolean}
    @default NO
  */
  isOffline: NO,

  /**
    Returns a Point containing the last known X and Y coordinates of the
    mouse, if present.

    @property {Point}
  */
  mouseLocation: function() {
    var responder = SC.RootResponder.responder,
        lastX = responder._lastMoveX,
        lastY = responder._lastMoveY;

    if (SC.empty(lastX) || SC.empty(lastY)) {
      return null;
    }

    return { x: lastX, y: lastY };
  }.property(),

  /**
    Initialize the object with some properties up front
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    if(SC.platform.touch) this.orientationchange();
    
    if(navigator && navigator.onLine===false) {
      this.set('isOffline', YES);
    }
    
    this.panes = SC.Set.create();
  },
  
  /**
    As soon as the DOM is up and running, make sure we attach necessary
    event handlers
  */
  setup: function() {
    var responder = SC.RootResponder.responder;
    responder.listenFor('orientationchange'.w(), window, this);
    responder.listenFor('online offline'.w(), document, this);
  },
  
  // ..........................................................
  // EVENT HANDLING
  //
  
  orientationchange: function(evt) {
    if(window.orientation===0 || window.orientation===180) {
      this.set('orientation', 'portrait');
    }
    else {
      this.set('orientation', 'landscape');
    }
  },
  
  orientationObserver: function(){
    var body = SC.$(document.body),
        or = this.get('orientation');
    if(or === "portrait") {
      body.setClass('portrait', YES);
      body.setClass('landscape', NO);
    }
    if( or === "landscape" ) {
      body.setClass('portrait', NO);
      body.setClass('landscape', YES);
    }
  }.observes('orientation'),
  
  online: function(evt) {
    this.set('isOffline', NO);
  },
  
  offline: function(evt) {
    this.set('isOffline', YES);
  }

});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(function() {
  SC.device.setup() ;
});
/* >>>>>>>>>> BEGIN source/system/exception_handler.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  If an exception is thrown during execution of your SproutCore app, this
  object will be given the opportunity to handle it.

  By default, a simple error message is displayed prompting the user to
  reload. You could override the handleException method to, for example, send
  an XHR to your servers so you can collect information about crashes in your
  application.

  Since the application is in an unknown state when an exception is thrown, we
  rely on JavaScript and DOM manipulation to generate the error instead of
  using SproutCore views.

  @since SproutCore 1.5
*/

SC.ExceptionHandler = {
  /**
    Called when an exception is encountered by code executed using SC.run().

    By default, this will display an error dialog to the user. If you
    want more sophisticated behavior, override this method.

    @param {Exception} exception the exception thrown during execution
  */
  handleException: function(exception) {
    if (this.isShowingErrorDialog) return;

    this._displayErrorDialog(exception);
  },

  /** @private
    Creates the error dialog and appends it to the DOM.

    @param {Exception} exception the exception to display
  */
  _displayErrorDialog: function(exception) {
    var html = this._errorDialogHTMLForException(exception),
        node = document.createElement('div');

    node.style.cssText = "left: 0px; right: 0px; top: 0px; bottom: 0px; position: absolute; background-color: white; background-color: rgba(255,255,255,0.6); z-index:100;";
    node.innerHTML = html;

    document.body.appendChild(node);

    this.isShowingErrorDialog = YES;
  },

  /** @private
    Given an exception, returns the HTML for the error dialog.

    @param {Exception} exception the exception to display
    @returns {String}
  */
  _errorDialogHTMLForException: function(exception) {
    var html;

    html = [
'<div id="sc-error-dialog" style="position: absolute; width: 500px; left: 50%; top: 50%; margin-left: -250px; background-color: white; border: 1px solid black; font-family: Monaco, monospace; font-size: 9px; letter-spacing: 1px; padding: 10px">',
  'An error has occurred which prevents the application from running:',
  '<br><br>',
  exception.message,
  '<div id="sc-error-dialog-reload-button" onclick="window.location.reload();" style="float: right; font-family: Monaco, monospace; font-size: 9px; letter-spacing: 1px; border: 1px solid black; padding: 3px; clear: both; margin-top: 20px; cursor: pointer;">',
  'Reload',
  '</div>',
'</div>'
    ];

    return html.join('');
  },

  /**
    YES if an exception was thrown and the error dialog is visible.

    @property {Boolean}
  */
  isShowingErrorDialog: NO
};
/* >>>>>>>>>> BEGIN source/system/image_cache.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');

SC.IMAGE_ABORTED_ERROR = SC.$error("SC.Image.AbortedError", "Image", -100) ;

SC.IMAGE_FAILED_ERROR = SC.$error("SC.Image.FailedError", "Image", -101) ;

/**
  @class
  
  The image cache can be used to control the order of loading images into the
   browser cache.
  
  Images queues are necessary because browsers impose strict limits on the 
  number of concurrent connections that can be open at any one time to any one 
  host. By controlling the order and timing of your loads using this image 
  queue, you can improve the percieved performance of your application by 
  ensuring the images you need most load first.
  
  Note that if you use the SC.ImageView class, it will use this image cache 
  for you automatically.
  
  h1. Loading Images
  
  When you need to display an image, simply call the loadImage() method with 
  the URL of the image, along with a target/method callback. The signature of 
  your callback should be:
  
  {{{
    imageDidLoad: function(imageUrl, imageOrError) {
      //...
    }
  }}}

  The "imageOrError" parameter will contain either an image object or an error 
  object if the image could not be loaded for some reason.  If you receive an 
  error object, it will be one of SC.IMAGE_ABORTED_ERROR or 
  SC.IMAGE_FAILED_ERROR.
  
  You can also optionally specify that the image should be loaded in the 
  background.  Background images are loaded with a lower priority than 
  foreground images.
  
  h1. Aborting Image Loads
  
  If you request an image load but then no longer require the image for some 
  reason, you should notify the imageCache by calling the releaseImage() 
  method.  Pass the URL, target and method that you included in your original 
  loadImage() request.  
  
  If you have requested an image before, you should always call releaseImage() 
  when you are finished with it, even if the image has already loaded.  This 
  will allow the imageCache to properly manage its own internal resources.
  
  This method may remove the image from the queue of images that need or load 
  or it may abort an image load in progress to make room for other images.  If 
  the image is already loaded, this method will have no effect.
  
  h1. Reloading an Image
  
  If you have already loaded an image, the imageCache will avoid loading the 
  image again.  However, if you need to force the imageCache to reload the 
  image for some reason, you can do so by calling reloadImage(), passing the 
  URL. 
  
  This will cause the image cache to attempt to load the image again the next 
  time you call loadImage on it.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.imageCache = SC.Object.create(/** @scope SC.imageCache.prototype */ {

  /**
    The maximum number of images that can load from a single hostname at any
    one time.  For most browsers 4 is a reasonable number, though you may 
    tweak this on a browser-by-browser basis.
  */
  loadLimit: 4,
  
  /**
    The number of currently active requests on the cache. 
  */
  activeRequests: 0,
  
  /**
    Loads an image from the server, calling your target/method when complete.
    
    You should always pass at least a URL and optionally a target/method.  If 
    you do not pass the target/method, the image will be loaded in background 
    priority.  Usually, however, you will want to pass a callback to be 
    notified when the image has loaded.  Your callback should have a signature 
    like:

    {{{
      imageDidLoad: function(imageUrl, imageOrError) { .. }
    }}}
    
    If you do pass a target/method you can optionally also choose to load the 
    image either in the foreground or in the background.  The image cache 
    prioritizes foreground images over background images.  This does not impact 
    how many images load at one time.
    
    @param {String} url
    @param {Object} target
    @param {String|Function} method
    @param {Boolean} isBackgroundFlag
    @returns {SC.imageCache} receiver
  */
  loadImage: function(url, target, method, isBackgroundFlag) {
    // normalize params
    var type = SC.typeOf(target);
    if (SC.none(method) && SC.typeOf(target)===SC.T_FUNCTION) {
      target = null; method = target ;
    }
    if (SC.typeOf(method) === SC.T_STRING) {
      method = target[method];      
    }
    // if no callback is passed, assume background image.  otherwise, assume
    // foreground image.
    if (SC.none(isBackgroundFlag)) {
      isBackgroundFlag = SC.none(target) && SC.none(method);
    }
    
    // get image entry in cache.  If entry is loaded, just invoke callback
    // and quit.
    var entry = this._imageEntryFor(url) ;
    if (entry.status === this.IMAGE_LOADED) {
      if (method) method.call(target || entry.image, entry.url, entry.image);
      
    // otherwise, add to list of callbacks and queue image.
    } else {
      if (target || method) this._addCallback(entry, target, method);
      entry.retainCount++; // increment retain count, regardless of callback
      this._scheduleImageEntry(entry, isBackgroundFlag);
    }
  },
  
  /**
    Invoke this method when you are finished with an image URL.  If you 
    passed a target/method, you should also pass it here to remove it from
    the list of callbacks.
    
    @param {String} url
    @param {Object} target
    @param {String|Function} method
    @returns {SC.imageCache} receiver
  */
  releaseImage: function(url, target, method) {
    
    // get entry.  if there is no entry, just return as there is nothing to 
    // do.
    var entry = this._imageEntryFor(url, NO) ;
    if (!entry) return this ;
    
    // there is an entry, decrement the retain count.  If <=0, delete!
    if (--entry.retainCount <= 0) {
      this._deleteEntry(entry); 
    
    // if >0, just remove target/method if passed
    } else if (target || method) {
      // normalize
      var type = SC.typeOf(target);
      if (SC.none(method) && SC.typeOf(target)===SC.T_FUNCTION) {
        target = null; method = target ;
      }
      if (SC.typeOf(method) === SC.T_STRING) {
        method = target[method];      
      }

      // and remove
      this._removeCallback(entry, target, method) ;
    }
  },

  /** 
    Forces the image to reload the next time you try to load it.
  */
  reloadImage: function(url) {
    var entry = this._imageEntryFor(url, NO); 
    if (entry && entry.status===this.IMAGE_LOADED) {
      entry.status = this.IMAGE_WAITING;
    }
  },
  
  /**
    Initiates a load of the next image in the image queue.  Normally you will
    not need to call this method yourself as it will be initiated 
    automatically when the queue becomes active.
  */
  loadNextImage: function() {
    var entry = null, queue;

    // only run if we don't have too many active request...
    if (this.get('activeRequests')>=this.get('loadLimit')) return; 
    
    // first look in foreground queue
    queue = this._foregroundQueue ;
    while(queue.length>0 && !entry) entry = queue.shift();
    
    // then look in background queue
    if (!entry) {
      queue = this._backgroundQueue ;
      while(queue.length>0 && !entry) entry = queue.shift();
    }
    this.set('isLoading', !!entry); // update isLoading...
    
    // if we have an entry, then initiate an image load with the proper 
    // callbacks.
    if (entry) {
      // var img = (entry.image = new Image()) ;
      var img = entry.image ;
      img.onabort = this._imageDidAbort ;
      img.onerror = this._imageDidError ;
      img.onload = this._imageDidLoad ;
      img.src = entry.url ;

      // add to loading queue.
      this._loading.push(entry) ;
    
      // increment active requests and start next request until queue is empty
      // or until load limit is reached.
      this.incrementProperty('activeRequests');
      this.loadNextImage();
    } 
  },
  
  // ..........................................................
  // SUPPORT METHODS
  // 

  /** @private Find or create an entry for the URL. */
  _imageEntryFor: function(url, createIfNeeded) {
    if (createIfNeeded === undefined) createIfNeeded = YES;
    var entry = this._images[url] ;
    if (!entry && createIfNeeded) {
      var img = new Image() ;
      entry = this._images[url] = { 
        url: url, status: this.IMAGE_WAITING, callbacks: [], retainCount: 0, image: img
      };
      img.entry = entry ; // provide a link back to the image
    }
    return entry ;
  },
  
  /** @private deletes an entry from the image queue, descheduling also */
  _deleteEntry: function(entry) {
    this._unscheduleImageEntry(entry) ;
    delete this._images[entry.url];    
  },
  
  /** @private 
    Add a callback to the image entry.  First search the callbacks to make
    sure this is only added once.
  */
  _addCallback: function(entry, target, method) {
    var callbacks = entry.callbacks;

    // try to find in existing array
    var handler = callbacks.find(function(x) {
      return x[0]===target && x[1]===method;
    }, this);
    
    // not found, add...
    if (!handler) callbacks.push([target, method]);
    callbacks = null; // avoid memory leaks
    return this ;
  },
  
  /** @private
    Removes a callback from the image entry.  Removing a callback just nulls
    out that position in the array.  It will be skipped when executing.
  */
  _removeCallback: function(entry, target, method) {
    var callbacks = entry.callbacks ;
    callbacks.forEach(function(x, idx) {
      if (x[0]===target && x[1]===method) callbacks[idx] = null;
    }, this);
    callbacks = null; // avoid memory leaks
    return this ;
  },
  
  /** @private 
    Adds an entry to the foreground or background queue to load.  If the 
    loader is not already running, start it as well.  If the entry is in the
    queue, but it is in the background queue, possibly move it to the
    foreground queue.
  */
  _scheduleImageEntry: function(entry, isBackgroundFlag) {

    var background = this._backgroundQueue ;
    var foreground = this._foregroundQueue ;
    
    // if entry is loaded, nothing to do...
    if (entry.status === this.IMAGE_LOADED) return this;

    // if image is already in background queue, but now needs to be
    // foreground, simply remove from background queue....
    if ((entry.status===this.IMAGE_QUEUED) && !isBackgroundFlag && entry.isBackground) {
      background[background.indexOf(entry)] = null ;
      entry.status = this.IMAGE_WAITING ;
    }
    
    // if image is not in queue already, add to queue.
    if (entry.status!==this.IMAGE_QUEUED) {
      var queue = (isBackgroundFlag) ? background : foreground ;
      queue.push(entry);
      entry.status = this.IMAGE_QUEUED ;
      entry.isBackground = isBackgroundFlag ;
    }
    
    // if the image loader is not already running, start it...
    if (!this.isLoading) this.invokeLater(this.loadNextImage, 100);
    this.set('isLoading', YES);
    
    return this ; // done!
  },
  
  /** @private
    Removes an entry from the foreground or background queue.  
  */
  _unscheduleImageEntry: function(entry) {
    // if entry is not queued, do nothing
    if (entry.status !== this.IMAGE_QUEUED) return this ;
    
    var queue = entry.isBackground ? this._backgroundQueue : this._foregroundQueue ;
    queue[queue.indexOf(entry)] = null; 
    
    // if entry is loading, abort it also.  Call local abort method in-case
    // browser decides not to follow up.
    if (this._loading.indexOf(entry) >= 0) {
      queue.image.abort();
      this.imageStatusDidChange(entry, this.ABORTED);
    }
    
    return this ;
  },
  
  /** @private invoked by Image().  Note that this is the image instance */
  _imageDidAbort: function() {
    SC.run(function() {
      SC.imageCache.imageStatusDidChange(this.entry, SC.imageCache.ABORTED);
    }, this);
  },
  
  _imageDidError: function() {
    SC.run(function() {
      SC.imageCache.imageStatusDidChange(this.entry, SC.imageCache.ERROR);
    }, this);
  },
  
  _imageDidLoad: function() {
    SC.run(function() {
      SC.imageCache.imageStatusDidChange(this.entry, SC.imageCache.LOADED);
    }, this);
  },

  /** @private called whenever the image loading status changes.  Notifies
    items in the queue and then cleans up the entry.
  */
  imageStatusDidChange: function(entry, status) {
    if (!entry) return; // nothing to do...
    
    var url = entry.url ;
    
    // notify handlers.
    var value ;
    switch(status) {
      case this.LOADED:
        value = entry.image;
        break;
      case this.ABORTED:
        value = SC.IMAGE_ABORTED_ERROR;
        break;
      case this.ERROR:
        value = SC.IMAGE_FAILED_ERROR ;
        break;
      default:
        value = SC.IMAGE_FAILED_ERROR ;
        break;
    }
    entry.callbacks.forEach(function(x){
      var target = x[0], method = x[1];
      method.call(target, url, value);
    },this);
    
    // now clear callbacks so they aren't called again.
    entry.callbacks = [];
    
    // finally, if the image loaded OK, then set the status.  Otherwise
    // set it to waiting so that further attempts will load again
    entry.status = (status === this.LOADED) ? this.IMAGE_LOADED : this.IMAGE_WAITING ;
    
    // now cleanup image...
    var image = entry.image ;
    if (image) {
      image.onload = image.onerror = image.onabort = null ; // no more notices
      if (status !== this.LOADED) entry.image = null;
    }

    // remove from loading queue and periodically compact
    this._loading[this._loading.indexOf(entry)]=null;
    if (this._loading.length > this.loadLimit*2) {
      this._loading = this._loading.compact();
    }
    
    this.decrementProperty('activeRequests');
    this.loadNextImage() ;
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._images = {};
    this._loading = [] ;
    this._foregroundQueue = [];
    this._backgroundQueue = [];
  },
  
  IMAGE_LOADED: "loaded",
  IMAGE_QUEUED: "queued",
  IMAGE_WAITING: "waiting",
  
  ABORTED: 'aborted',
  ERROR: 'error',
  LOADED: 'loaded'
});

/* >>>>>>>>>> BEGIN source/system/json.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.json = {
  
  /**
    Encodes an object graph to a JSON output.  Beware that JSON cannot deal
    with circular references.  If you try to encode an object graph with
    references it could hang your browser.
    
    @param {Object} root object graph
    @returns {String} encode JSON
  */
  encode: function(root) {
    return JSON.stringify(root) ;
  },
  
  /**
    Decodes a JSON file in a safe way, returning the generated object graph.
  
    @param {String} encoded JSON
    @returns {Object} object graph or Error if there was a problem.
  */
  decode: function(root) {
    return JSON.parse(root) ;
  }

} ;

/*
    http://www.JSON.org/json2.js
    2010-03-20

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/* >>>>>>>>>> BEGIN source/system/math.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  Implements some enhancements to the built-in Number object that makes it
  easier to handle rounding and display of numbers.
  
  @since SproutCore 1.0
  @author Colin Campbell
*/
SC.Math = SC.Object.create({
  
  /**
    Checks to see if the number is near the supplied parameter to a certain lambda.
    
    @param {Number} n1 First number in comparison.
    @param {Number} n2 Number to compare against the first.
    @param {Number} lambda The closeness sufficient for a positive result. Default 0.00001
    @returns {Boolean}
  */
  near: function(n1, n2, lambda) {
    if (!lambda) lambda = 0.00001;
    return Math.abs(n1 - n2) <= lambda;
  },
  
  /**
    Rounds a number to a given decimal place. If a negative decimalPlace
    parameter is provided, the number will be rounded outward (ie. providing
    -3 will round to the thousands).
    
    Function is insufficient for high negative values of decimalPlace parameter.
    For example, (123456.789).round(-5) should evaluate to 100000 but instead
    evaluates to 99999.999... 
    
    @param {Number} n The number to round
    @param {Integer} decimalPlace
    @returns {Number}
  */
  round: function(n, decimalPlace) {
    if (!decimalPlace) decimalPlace = 0;
    var factor = Math.pow(10, decimalPlace);
    if (decimalPlace < 0) {
       // stop rounding errors from hurting the factor...
      var s = factor.toString();
      factor = s.substring(0, s.indexOf("1")+1);
    }
    n = n.valueOf();
    return Math.round(n * factor) / factor;
  }
  
}) ;

/* >>>>>>>>>> BEGIN source/system/page.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class SC.Page

  A Page object is used to store a set of views that can be lazily configured
  as needed.  The page object works by overloading the get() method.  The
  first time you try to get the page
  
  @extends SC.Object
*/
SC.Page = SC.Object.extend(
/** @scope SC.Page.prototype */ {
  
  /**
    When you create a page, you can set it's "owner" property to an
    object outside the page definition. This allows views in the page
    to use the owner object as a target, (as well as other objects
    accessible through the owner object). E.g.
    
    {{{
      myButton: SC.ButtonView.design({
        title: 'Click me',
        target: SC.outlet('page.owner'),
        action: 'buttonClicked'
      })
    }}}
    
    Usually, you'll set 'owner' to the object defined in core.js.
  */
  owner: null,
  
  get: function(key) {
    var value = this[key] ;
    if (value && value.isClass) {
      this[key] = value = value.create({ page: this }) ;
      if (!this.get('inDesignMode')) value.awake() ;
      return value ;
    } else return arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Finds all views defined on this page instances and builds them.  This is 
    a quick, brute force way to wake up all of the views in a page object.  It
    is not generally recommended. Instead, you should use get() or getPath() 
    to retrieve views and rely on the lazy creation process to set them up.
    
    @return {SC.Page} receiver
  */
  awake: function() {
    // step through all views and build them
    var value, key;
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      value = this[key] ;
      if (value && value.isViewClass) {
        this[key] = value = value.create({ page: this }) ;
      }
    }
    return this;
  },

  /**
    Returns the named property unless the property is a view that has not yet
    been configured.  In that case it will return undefined.  You can use this
    method to safely get a view without waking it up.
  */
  getIfConfigured: function(key) {
    var ret = this[key] ;
    return (ret && ret.isViewClass) ? null : this.get(key);
  },

  /**
    Applies a localization to every view builder defined on the page.  You must call this before you construct a view to apply the localization.
  */
  loc: function(locs) {
    var view, key;
    for(key in locs) {
      if (!locs.hasOwnProperty(key)) continue ;
      view = this[key] ;
      if (!view || !view.isViewClass) continue ;
      view.loc(locs[key]);
    }
    return this ;
  }

  //needsDesigner: YES,
  
  //inDesignMode: YES
    
}) ;

// ..........................................................
// SUPPORT FOR LOADING PAGE DESIGNS
// 

/** Calling design() on a page is the same as calling create() */
SC.Page.design = SC.Page.create ;

/** Calling localization returns passed attrs. */
SC.Page.localization = function(attrs) { return attrs; };



/* >>>>>>>>>> BEGIN source/system/render_context.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/builder');

/** set update mode on context to replace content (preferred) */
SC.MODE_REPLACE = 'replace';

/** set update mode on context to append content */
SC.MODE_APPEND = 'append';

/** set update mode on context to prepend content */
SC.MODE_PREPEND = 'prepend';

/**
  @namespace
  
  A RenderContext is a builder that can be used to generate HTML for views or
  to update an existing element.  Rather than making changes to an element
  directly, you use a RenderContext to queue up changes to the element, 
  finally applying those changes or rendering the new element when you are
  finished.
  
  You will not usually create a render context yourself but you will be passed
  a render context as the first parameter of your render() method on custom
  views.
  
  Render contexts are essentially arrays of strings.  You can add a string to
  the context by calling push().  You can retrieve the entire array as a 
  single string using join().  This is basically the way the context is used 
  for views.  You are passed a render context and expected to add strings of
  HTML to the context like a normal array.  Later, the context will be joined
  into a single string and converted into real HTML for display on screen.
  
  In addition to the core push and join methods, the render context also 
  supports some extra methods that make it easy to build tags.  
  
  context.begin() <-- begins a new tag context
  context.end() <-- ends the tag context...
*/
SC.RenderContext = SC.Builder.create(/** SC.RenderContext.fn */ {
  
  SELF_CLOSING: SC.CoreSet.create().addEach('area base basefront br hr input img link meta'.w()),
  
  /** 
    When you create a context you should pass either a tag name or an element
    that should be used as the basis for building the context.  If you pass
    an element, then the element will be inspected for class names, styles
    and other attributes.  You can also call update() or replace() to 
    modify the element with you context contents.
    
    If you do not pass any parameters, then we assume the tag name is 'div'.
    
    A second parameter, parentContext, is used internally for chaining.  You
    should never pass a second argument.
    
    @param {String|DOMElement} tagNameOrElement 
    @returns {SC.RenderContext} receiver
  */
  init: function(tagNameOrElement, prevContext) {
    var strings, tagNameOrElementIsString;
    
    // if a prevContext was passed, setup with that first...
    if (prevContext) {
      this.prevObject = prevContext ;
      this.strings    = prevContext.strings ;
      this.offset     = prevContext.length + prevContext.offset ;
    } 

    if (!this.strings) this.strings = [] ;

    // if tagName is string, just setup for rendering new tagName
    if (tagNameOrElement === undefined) {
      tagNameOrElement = 'div' ;
      tagNameOrElementIsString = YES ;
    }
    else if (tagNameOrElement === 'div'  ||  tagNameOrElement === 'label'  ||  tagNameOrElement === 'a') {
      // Fast path for common tags.
      tagNameOrElementIsString = YES ;
    }
    else if (SC.typeOf(tagNameOrElement) === SC.T_STRING) {
      tagNameOrElement = tagNameOrElement.toLowerCase() ;
      tagNameOrElementIsString = YES ;
    }
    
    if (tagNameOrElementIsString) {
      this._tagName     = tagNameOrElement ;
      this._needsTag    = YES ; // used to determine if end() needs to wrap tag
      this.needsContent = YES ;
      
      // increase length of all contexts to leave space for opening tag
      var c = this;
      while(c) { c.length++; c = c.prevObject; }
      
      this.strings.push(null);
      this._selfClosing = this.SELF_CLOSING.contains(tagNameOrElement);
    }
    else {
      this._elem        = tagNameOrElement ;
      this._needsTag    = NO ;
      this.length       = 0 ;
      this.needsContent = NO ;
    }
    return this ;
  },
  
  // ..........................................................
  // PROPERTIES
  // 
  
  // NOTE: We store this as an actual array of strings so that browsers that
  // support dense arrays will use them.
  /** 
    The current working array of strings.
    
    @property {Array}
  */
  strings: null,
  
  /** 
    this initial offset into the strings array where this context instance
    has its opening tag.
    
    @property {Number}
  */
  offset: 0,
  
  /**  
    the current number of strings owned by the context, including the opening
    tag.
    
    @property {Number}
  */
  length: 0,
  
  /**
    Specify the method that should be used to update content on the element.
    In almost all cases you want to replace the content.  Very carefully 
    managed code (such as in CollectionView) can append or prepend content
    instead.
    
    You probably do not want to change this propery unless you know what you
    are doing.
    
    @property {String}
  */
  updateMode: SC.MODE_REPLACE,

  /**
    YES if the context needs its content filled in, not just its outer 
    attributes edited.  This will be set to YES anytime you push strings into
    the context or if you don't create it with an element to start with.
  */
  needsContent: NO,
  
  // ..........................................................
  // CORE STRING API
  // 
  
  /**
    Returns the string at the designated index.  If you do not pass anything
    returns the string array.  This index is an offset from the start of the
    strings owned by this context.
    
    @param {Number} idx the index
    @returns {String|Array}
  */
  get: function(idx) {
    var strings = this.strings || [];
    return (idx === undefined) ? strings.slice(this.offset, this.length) : strings[idx+this.offset];
  },
  
  /**
    Adds a string to the render context for later joining.  Note that you can
    pass multiple arguments to this method and each item will be pushed.
    
    @param {String} line the liene to add to the string.
    @returns {SC.RenderContext} receiver
  */
  push: function(line) {
    var strings = this.strings, len = arguments.length;
    if (!strings) this.strings = strings = []; // create array lazily
    
    if (len > 1) {
      strings.push.apply(strings, arguments) ;
    } else strings.push(line);
    
    // adjust string length for context and all parents...
    var c = this;
    while(c) { c.length += len; c = c.prevObject; }
    
    this.needsContent = YES; 
    
    return this;
  },
  
  /**
    Pushes the passed string onto the array, but first escapes the string
    to ensure that no user-entered HTML is processed as HTML.
    
    @param {String} line one or mroe lines of text to add
    @returns {SC.RenderContext} receiver
  */
  text: function(line) {
    var len = arguments.length, idx=0;
    for(idx=0;idx<len;idx++) {
      this.push(SC.RenderContext.escapeHTML(arguments[idx]));
    }
    return this ;
  },
  
  /**
    Joins the strings together, returning the result.  But first, this will
    end any open tags.
    
    @param {String} joinChar optional string to use in joins. def empty string
    @returns {String} joined string
  */
  join: function(joinChar) {
    // generate tag if needed...
    if (this._needsTag) this.end();
    
    var strings = this.strings;
    return strings ? strings.join(joinChar || '') : '' ;
  },
  
  // ..........................................................
  // GENERATING
  // 
  
  /**
    Begins a new render context based on the passed tagName or element.
    Generate said context using end().
    
    @returns {SC.RenderContext} new context
  */
  begin: function(tagNameOrElement) {
    // console.log('%@.begin(%@) called'.fmt(this, tagNameOrElement));
    return SC.RenderContext(tagNameOrElement, this);
  },
  
  /**
    If the current context targets an element, this method returns the 
    element.  If the context does not target an element, this method will 
    render the context into an offscreen element and return it.
    
    @returns {DOMElement} the element
  */
  element: function() {  
    if (this._elem) return this._elem;

    // create factory div if needed
    var K       = SC.RenderContext,
        factory = K.factory,
        ret, child;

    if (!factory) {
      factory = K.factory = document.createElement('div');
    }
    factory.innerHTML = this.join();
    
    // In IE something weird happens when reusing the same element.
    // After setting innerHTML, the innerHTML of the element in the previous
    // view turns blank.  It seems that there is something weird with their
    // garbage  collection algorithm. I tried just removing the nodes after
    // keeping a  reference to the first child, but it didn't work.  I ended
    // up cloning the first child.
    if (SC.browser.msie) {
      if (factory.innerHTML.length > 0) {
        child = factory.firstChild.cloneNode(true);
        factory.innerHTML = '';
      }
      else {
        child = null;
      }
    }
    else {
      // Faster path (avoiding the unnecessary node clone) for non-IE
      // browsers.
      child = factory.firstChild;
    }

    return child ;
  },
  
  /**
    Removes an element with the passed id in the currently managed element.
  */
  remove: function(elementId) {
    // console.log('remove('+elementId+')');
    if (!elementId) return ;
    
    var el, elem = this._elem ;
    if (!elem || !elem.removeChild) return ;
    
    el = document.getElementById(elementId) ;
    if (el) {
      el = elem.removeChild(el) ;
      el = null;
    }
  },
  
  /**
    If an element was set on this context when it was created, this method 
    will actually apply any changes to the element itself.  If you have not
    written any inner html into the context, then the innerHTML of the 
    element will not be changed, otherwise it will be replaced with the new
    innerHTML.
    
    Also, any attributes, id, classNames or styles you've set will be 
    updated as well.  This also ends the editing context session and cleans
    up.
    
    @returns {SC.RenderContext} previous context or null if top 
  */
  update: function() {
    var elem = this._elem, 
        mode = this.updateMode,
        cq, key, value, attr, styles, factory, cur, next, before;
        
    this._innerHTMLReplaced = NO;
    
    if (!elem) {
      // throw "Cannot update context because there is no source element";
      return ;
    }

    cq = SC.$(elem);
    
    // console.log('%@#update() called'.fmt(this));
    // if (this.length>0) console.log(this.join());
    // else console.log('<no length>');
    
    // replace innerHTML
    if (this.length>0) {
      this._innerHTMLReplaced = YES;
      if (mode === SC.MODE_REPLACE) {
        elem.innerHTML = this.join();
      } else {
        factory = elem.cloneNode(false);
        factory.innerHTML = this.join() ;
        before = (mode === SC.MODE_APPEND) ? null : elem.firstChild;
        cur = factory.firstChild ;
        while(cur) {
          next = cur.nextSibling ;
          elem.insertBefore(cur, next);
          cur = next ;
        }
        cur = next = factory = before = null ; // cleanup 
      }
    }
    
    // note: each of the items below only apply if the private variable has
    // been set to something other than null (indicating they were used at
    // some point during the build)
    
    // if we have attrs, apply them
    if (this._attrsDidChange && (value = this._attrs)) {
      for(key in value) {
        if (!value.hasOwnProperty(key)) continue;
        attr = value[key];
        if (attr === null) { // remove empty attrs
          elem.removeAttribute(key);
        } else {
          cq.attr(key, attr);
        }
      }
    }
    
    // class="foo bar"
    if (this._classNamesDidChange && (value = this._classNames)) {
      cq.attr('class', value.join(' '));
    }
    
    // id="foo"
    if (this._idDidChange && (value = this._id)) {
      cq.attr('id', value);
    }
    
    // style="a:b; c:d;"
    if (this._stylesDidChange && (styles = this._styles)) {
      var pair = this._STYLE_PAIR_ARRAY, joined = this._JOIN_ARRAY;
      for(key in styles) {
        if (!styles.hasOwnProperty(key)) continue ;
        value = styles[key];
        if (value === null) continue; // skip empty styles
        if (typeof value === SC.T_NUMBER && key !== "zIndex") value += "px";
        pair[0] = this._dasherizeStyleName(key);
        pair[1] = value;
        joined.push(pair.join(': '));
      }
      
      cq.attr('style', joined.join('; '));
      joined.length = 0; // reset temporary object
    }
    
    // now cleanup element...
    elem = this._elem = null ;
    return this.prevObject || this ; 
  },
  
  // these are temporary objects are reused by end() to avoid memory allocs.
  _DEFAULT_ATTRS: {},
  _TAG_ARRAY: [],
  _JOIN_ARRAY: [],
  _STYLE_PAIR_ARRAY: [],
  
  /**
    Ends the current tag editing context.  This will generate the tag string
    including any attributes you might have set along with a closing tag.
    
    The generated HTML will be added to the render context strings.  This will
    also return the previous context if there is one or the receiver.
    
    If you do not have a current tag, this does nothing.
     
    @returns {SC.RenderContext} 
  */
  end: function() {
    // console.log('%@.end() called'.fmt(this));
    // NOTE: If you modify this method, be careful to consider memory usage
    // and performance here.  This method is called frequently during renders
    // and we want it to be as fast as possible.

    // generate opening tag.
    
    // get attributes first.  Copy in className + styles...
    var tag = this._TAG_ARRAY, pair, joined, key , value,
        attrs = this._attrs, className = this._classNames,
        id = this._id, styles = this._styles;
    
    // add tag to tag array
    tag[0] = '<';  tag[1] = this._tagName ;
    
    // add any attributes...
    if (attrs || className || styles || id) {
      if (!attrs) attrs = this._DEFAULT_ATTRS ;
      if (id) attrs.id = id ;
      if (className) attrs['class'] = className.join(' ');
    
      // add in styles.  note how we avoid memory allocs here to keep things 
      // fast...
      if (styles) {
        joined = this._JOIN_ARRAY ;
        pair = this._STYLE_PAIR_ARRAY;
        for(key in styles) {
          if(!styles.hasOwnProperty(key)) continue ;
          value = styles[key];
          if (value === null) continue; // skip empty styles
          if (!isNaN(value) && key !== "zIndex") value += "px";

          pair[0] = this._dasherizeStyleName(key);
          pair[1] = value;
          joined.push(pair.join(': '));
        }
        attrs.style = joined.join('; ') ;
      
        // reset temporary object.  pair does not need to be reset since it 
        // is always overwritten
        joined.length = 0;
      }
      
      // now convert attrs hash to tag array...
      tag.push(' '); // add space for joining0
      for(key in attrs) {
        if (!attrs.hasOwnProperty(key)) continue ;
        value = attrs[key];
        if (value === null) continue ; // skip empty attrs
        tag.push(key, '="', value, '" ');
      }
      
      // if we are using the DEFAULT_ATTRS temporary object, make sure we 
      // reset.
      if (attrs === this._DEFAULT_ATTRS) {
        delete attrs.style;  delete attrs['class']; delete attrs.id;
      }
      
    }
    
    // this is self closing if there is no content in between and selfClosing
    // is not set to false.
    var strings = this.strings;
    var selfClosing = (this._selfClosing === NO) ? NO : (this.length === 1) ;
    tag.push(selfClosing ? ' />' : '>') ;
    
    // console.log('selfClosing == %@'.fmt(selfClosing));
    
    strings[this.offset] = tag.join('');
    tag.length = 0 ; // reset temporary object
    
    // now generate closing tag if needed...
    if (!selfClosing) {
      tag[0] = '</' ;
      tag[1] = this._tagName;
      tag[2] = '>';
      strings.push(tag.join(''));
      
      // increase length of receiver and all parents
      var c = this;
      while(c) { c.length++; c = c.prevObject; }
      tag.length = 0; // reset temporary object again
    }
    
    // if there was a source element, cleanup to avoid memory leaks
    this._elem = null;
    return this.prevObject || this ;
  },
  
  /**
    Generates a tag with the passed options.  Like calling context.begin().end().
    
    @param {String} tagName optional tag name.  default 'div'
    @param {Hash} opts optional tag options.  defaults to empty options.
    @returns {SC.RenderContext} receiver 
  */
  tag: function(tagName, opts) {
    return this.begin(tagName, opts).end();
  },
    
  // ..........................................................
  // BASIC HELPERS
  // 
  
  /**
    Reads outer tagName if no param is passed, sets tagName otherwise.
    
    @param {String} tagName pass to set tag name.
    @returns {String|SC.RenderContext} tag name or receiver
  */
  tagName: function(tagName) {
    if (tagName === undefined) {
      if (!this._tagName && this._elem) this._tagName = this._elem.tagName;
      return this._tagName;
    } else {
      this._tagName = tagName;
      this._tagNameDidChange = YES;
      return this ;
    }
  },
  
  /**
    Reads the outer tag id if no param is passed, sets the id otherwise.
    
    @param {String} idName the id or set
    @returns {String|SC.RenderContext} id or receiver
  */
  id: function(idName) {
    if (idName === undefined) {
      if (!this._id && this._elem) this._id = this._elem.id;
      return this._id ;
    } else {
      this._id = idName;
      this._idDidChange = YES;
      return this;
    }
  },
  
  // ..........................................................
  // CSS CLASS NAMES SUPPORT
  // 
  
  /**
    Reads the current classNames array or sets the array if a param is passed.
    Note that if you get the classNames array and then modify it, you MUST 
    call this method again to set the array or else it may not be copied to
    the element.

    If you do pass a classNames array, you can also pass YES for the 
    cloneOnModify param.  This will cause the context to clone the class names
    before making any further edits.  This is useful is you have a shared 
    array of class names you want to start with but edits should not change
    the shared array.
    
    @param {Array} classNames array 
    @param {Boolean} cloneOnModify
    @returns {Array|SC.RenderContext} classNames array or receiver
  */
  classNames: function(classNames, cloneOnModify) {
    if (classNames === undefined) {
      if (!this._classNames && this._elem) {
        this._classNames = (SC.$(this._elem).attr('class')||'').split(' ');
      }
      
      if (this._cloneClassNames) {
        this._classNames = (this._classNames || []).slice();
        this._cloneClassNames = NO ;
      }

      // if there are no class names, create an empty array but don't modify.
      if (!this._classNames) this._classNames = [];
      
      return this._classNames ;
    } else {
      this._classNames = classNames ;
      this._cloneClassNames = cloneOnModify || NO ;
      this._classNamesDidChange = YES ;
      return this ;
    }
  },
  
  /**
    Returns YES if the outer tag current has the passed class name, NO 
    otherwise.
    
    @param {String} className the class name
    @returns {Boolean}
  */
  hasClass: function(className) {
    return this.classNames().indexOf(className) >= 0;  
  },
  
  /**
    Adds the specified className to the current tag, if it does not already
    exist.  This method has no effect if there is no open tag.
    
    @param {String|Array} nameOrClasses the class name or an array of classes
    @returns {SC.RenderContext} receiver
  */
  addClass: function(nameOrClasses) {
    if(nameOrClasses === undefined || nameOrClasses === null) {
      console.warn('You are adding an undefined or empty class'+ this.toString());
      return this;
    }
    
    var classNames = this.classNames() ; // handles cloning ,etc.
    if(SC.typeOf(nameOrClasses) === SC.T_STRING){
      if (classNames.indexOf(nameOrClasses)<0) {
        classNames.push(nameOrClasses);
        this._classNamesDidChange = YES ;
      }
    } else {
      for(var i = 0, iLen= nameOrClasses.length; i<iLen; i++){
        var cl = nameOrClasses[i];
        if (classNames.indexOf(cl)<0) {
          classNames.push(cl);
          this._classNamesDidChange = YES ;
        }
      }
    }
    
    return this;
  },
  
  /**
    Removes the specified className from the current tag.  This method has 
    no effect if there is not an open tag.
    
    @param {String} className the class to add
    @returns {SC.RenderContext} receiver
  */
  removeClass: function(className) {
    var classNames = this._classNames, idx;
    if (!classNames && this._elem) {
      classNames = this._classNames = 
        (SC.$(this._elem).attr('class')||'').split(' ');
    }

    if (classNames && (idx=classNames.indexOf(className))>=0) {
      if (this._cloneClassNames) {
        classNames = this._classNames = classNames.slice();
        this._cloneClassNames = NO ;
      }

      // if className is found, just null it out.  This will end up adding an
      // extra space to the generated HTML but it is faster than trying to 
      // recompact the array.
      classNames[idx] = null;
      this._classNamesDidChange = YES ;
    }
    
    return this;
  },
  
  /**
    Removes all classnames from the currentContext.  
    
    @returns {SC.RenderContext} receiver
  */
  resetClassNames: function() {
    this._classNames = [];
    this._classNamesDidChange = YES ;
    return this;
  },
  
  /**
    You can either pass a single class name and a boolean indicating whether
    the value should be added or removed, or you can pass a hash with all
    the class names you want to add or remove with a boolean indicating 
    whether they should be there or not.
    
    This is far more efficient than using addClass/removeClass.
    
    @param {String|Hash} className class name or hash of classNames + bools
    @param {Boolean} shouldAdd for class name if a string was passed
    @returns {SC.RenderContext} receiver
  */
  setClass: function(className, shouldAdd) {
    var classNames, idx, key, didChange;
    
    // simple form
    if (shouldAdd !== undefined) {
      return shouldAdd ? this.addClass(className) : this.removeClass(className);
      
    // bulk form
    } else {
      
      classNames = this._classNames ;
      if (!classNames && this._elem) {
        classNames = this._classNames = 
          (SC.$(this._elem).attr('class')||'').split(' ');
      }
      if (!classNames) classNames = this._classNames = [];
    
      if (this._cloneClassNames) {
        classNames = this._classNames = classNames.slice();
        this._cloneClassNames = NO ;
      }

      didChange = NO;
      for(key in className) {
        if (!className.hasOwnProperty(key)) continue ;
        idx = classNames.indexOf(key);
        if (className[key]) {
          if (idx<0) { classNames.push(key); didChange = YES; }
        } else {
          if (idx>=0) { classNames[idx] = null; didChange = YES; }
        }
      }
      if (didChange) this._classNamesDidChange = YES;
    }
    
    return this ;
  },
  
  // ..........................................................
  // CSS Styles Support
  // 
    
  _STYLE_REGEX: /-?\s*([^:\s]+)\s*:\s*([^;]+)\s*;?/g,
  
  /**
    Retrieves or sets the current styles for the outer tag.  If you retrieve
    the styles hash to edit it, you must set the hash again in order for it 
    to be applied to the element on rendering.
    
    Optionally you can also pass YES to the cloneOnModify param to cause the
    styles has to be cloned before it is edited.  This is useful if you want
    to start with a shared style hash and then optionally modify it for each
    context.
    
    @param {Hash} styles styles hash
    @param {Boolean} cloneOnModify
    @returns {Hash|SC.RenderContext} styles hash or receiver
  */
  styles: function(styles, cloneOnModify) {
    var attr, regex, match;
    if (styles === undefined) {
      
      // no styles are defined yet but we do have a source element.  Lazily
      // extract styles from element.
      if (!this._styles && this._elem) {
        // parse style...
        attr = SC.$(this._elem).attr('style');
        
        if (attr && (attr = attr.toString()).length>0) {
          if(SC.browser.msie){ 
            attr = attr.toLowerCase();
          }
          styles = {};
          
          regex = this._STYLE_REGEX ;
          regex.lastIndex = 0;
          
          while(match = regex.exec(attr)) styles[this._camelizeStyleName(match[1])] = match[2];
          
          this._styles = styles;
          this._cloneStyles = NO;
          
        } else {
          this._styles = {};
        }
        
      // if there is no element or we do have styles, possibly clone them
      // before returning.
      } else {
        if (!this._styles) {
          this._styles = {};
        } else {
          if (this._cloneStyles) {
            this._styles = SC.beget(this._styles);
            this._cloneStyles = NO ;
          }
        }
      }
      
      return this._styles ;
      
    // set the styles if passed.
    } else {
      this._styles = styles ;
      this._cloneStyles = cloneOnModify || NO ;
      this._stylesDidChange = YES ;
      return this ;
    }
  },
  
  /**
    Apply the passed styles to the tag.  You can pass either a single key
    value pair or a hash of styles.  Note that if you set a style on an 
    existing element, it will replace any existing styles on the element.
    
    @param {String|Hash} nameOrStyles the style name or a hash of styles
    @param {String|Number} value style value if string name was passed
    @returns {SC.RenderContext} receiver
  */
  addStyle: function(nameOrStyles, value) {
    
    // get the current hash of styles.  This will extract the styles and 
    // clone them if needed.  This will get the actual styles hash so we can
    // edit it directly.
    var key, didChange = NO, styles = this.styles();
    
    // simple form
    if (typeof nameOrStyles === SC.T_STRING) {
      if (value === undefined) { // reader
        return styles[nameOrStyles];
      } else { // writer
        if (styles[nameOrStyles] !== value) {
          styles[nameOrStyles] = value ;
          this._stylesDidChange = YES ;
        }
      }
      
    // bulk form
    } else {
      for(key in nameOrStyles) {
        if (!nameOrStyles.hasOwnProperty(key)) continue ;
        value = nameOrStyles[key];
        if (styles[key] !== value) {
          styles[key] = value;
          didChange = YES;
        }
      }
      if (didChange) this._stylesDidChange = YES ;
    }
    
    return this ;
  },
  
  /**
    Removes the named style from the style hash.
    
    Note that if you delete a style, the style will not actually be removed
    from the style hash.  Instead, its value will be set to null.
    
    @param {String} styleName
    @returns {SC.RenderContext} receiver
  */
  removeStyle: function(styleName) {
    // avoid case where no styles have been defined
    if (!this._styles && !this._elem) return this;
    
    // get styles hash.  this will clone if needed.
    var styles = this.styles();
    if (styles[styleName]) {
      styles[styleName] = null;
      this._stylesDidChange = YES ;
    }
  },
  
  // ..........................................................
  // ARBITRARY ATTRIBUTES SUPPORT
  // 
  
  /**
    Sets the named attribute on the tag.  Note that if you set the 'class'
    attribute or the 'styles' attribute, it will be ignored.  Use the 
    relevant class name and style methods instead.
    
    @param {String|Hash} nameOrAttrs the attr name or hash of attrs.
    @param {String} value attribute value if attribute name was passed
    @returns {SC.RenderContext} receiver
  */
  attr: function(nameOrAttrs, value) {
    var key, attrs = this._attrs, didChange = NO ;
    if (!attrs) this._attrs = attrs = {} ;
    
    // simple form
    if (typeof nameOrAttrs === SC.T_STRING) {
      if (value === undefined) { // getter
        return attrs[nameOrAttrs];
      } else { // setter
        if (attrs[nameOrAttrs] !== value) {
          attrs[nameOrAttrs] = value ;
          this._attrsDidChange = YES ;
        }
      }
      
    // bulk form
    } else {
      for(key in nameOrAttrs) {
        if (!nameOrAttrs.hasOwnProperty(key)) continue ;
        value = nameOrAttrs[key];
        if (attrs[key] !== value) {
          attrs[key] = value ;
          didChange = YES ;
        }
      }
      if (didChange) this._attrsDidChange = YES ;
    }
    
    return this ;
  },

  /** @private
  */
  _camelizeStyleName: function(name) {
    // IE wants the first letter lowercase so we can allow normal behavior
    var needsCap = name.match(/^-(webkit|moz|o)-/),
        camelized = name.camelize();

    if (needsCap) {
      return camelized.substr(0,1).toUpperCase() + camelized.substr(1);
    } else {
      return camelized;
    }
  },

  /** @private
    Converts camelCased style names to dasherized forms
  */
  _dasherizeStyleName: function(name) {
    var dasherized = name.dasherize();
    if (dasherized.match(/^(webkit|moz|ms|o)-/)) dasherized = '-'+dasherized;
    return dasherized;
  }
  
});

/**
  html is an alias for push().  Makes thie object more CoreQuery like
*/
SC.RenderContext.fn.html = SC.RenderContext.fn.push;

/**
  css is an alias for addStyle().  This this object more CoreQuery like.
*/
SC.RenderContext.fn.css = SC.RenderContext.fn.addStyle;

/** 
  Helper method escapes the passed string to ensure HTML is displayed as 
  plain text.  You should make sure you pass all user-entered data through
  this method to avoid errors.  You can also do this with the text() helper
  method on a render context.
*/


if (!SC.browser.isSafari || parseInt(SC.browser.version, 10) < 526) {
  SC.RenderContext._safari3 = YES;
}

SC.RenderContext.escapeHTML = function(text) {
  var elem, node, ret ;
  
  if (SC.none(text)) return text; // ignore empty
  
  elem = this.escapeHTMLElement;
  if (!elem) elem = this.escapeHTMLElement = document.createElement('div');
  
  node = this.escapeTextNode;
  if (!node) {
    node = this.escapeTextNode = document.createTextNode('');
    elem.appendChild(node);
  }
  
  node.data = text ;
  ret = elem.innerHTML ;
  
  // Safari 3 does not escape the '>' character
  if (SC.RenderContext._safari3) { ret = ret.replace(/>/g, '&gt;'); }

  node = elem = null;
  return ret ;
};

/* >>>>>>>>>> BEGIN source/system/response.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global ActiveXObject */

/**
  A response represents a single response from a server request.  An instance
  of this class is returned whenever you call SC.Request.send().
  
  TODO: Add more info
  
  @extend SC.Object
  @since SproutCore 1.0
*/
SC.Response = SC.Object.extend(
/** @scope SC.Response.prototype */ {
  
  /**
    Becomes true if there was a failure.  Makes this into an error object.
    
    @property {Boolean}
  */
  isError: NO,
  
  /**
    Always the current response
    
    @property {SC.Response}
  */
  errorValue: function() {
    return this;
  }.property().cacheable(),
  
  /**
    The error object generated when this becomes an error
    
    @property {SC.Error}
  */
  errorObject: null,
  
  /** 
    Request used to generate this response.  This is a copy of the original
    request object as you may have modified the original request object since
    then.
   
    To retrieve the original request object use originalRequest.
    
    @property {SC.Request}
  */
  request: null,
  
  /**
    The request object that originated this request series.  Mostly this is
    useful if you are looking for a reference to the original request.  To
    inspect actual properties you should use request instead.
    
    @property {SC.Request}
  */
  originalRequest: function() {
    var ret = this.get('request');
    while (ret.get('source')) ret = ret.get('source');
    return ret ;
  }.property('request').cacheable(),

  /** 
    Type of request.  Must be an HTTP method.  Based on the request
  
    @property {String}
  */
  type: function() {
    return this.getPath('request.type');
  }.property('request').cacheable(),
  
  /**
    URL of request. 
    
    @property {String}
  */
  address: function() {
    return this.getPath('request.address');
  }.property('request').cacheable(),
  
  /**
    If set then will attempt to automatically parse response as JSON 
    regardless of headers.
    
    @property {Boolean}
  */
  isJSON: function() {
    return this.getPath('request.isJSON') || NO;
  }.property('request').cacheable(),

  /**
    If set, then will attempt to automatically parse response as XML
    regarldess of headers.
    
    @property {Boolean}
  */
  isXML: function() {
    return this.getPath('request.isXML') || NO ;
  }.property('request').cacheable(),
  
  /** 
    Returns the hash of listeners set on the request.
    
    @property {Hash}
  */
  listeners: function() {
    return this.getPath('request.listeners');
  }.property('request').cacheable(),
  
  /**
    The response status code.
    
    @property {Number}
  */
  status: -100, // READY

  /**
    Headers from the response.  Computed on-demand
    
    @property {Hash}
  */
  headers: null,
  
  /**
    Response body. If isJSON was set, will be parsed automatically.
    
    @response {Hash|String|SC.Error} the response body or the parsed JSON.
      Returns a SC.Error instance if there is a JSON parsing error.
  */
  body: function() {
    // TODO: support XML
    var ret = this.get('encodedBody');
    if (ret && this.get('isJSON')) {
      try {
        ret = SC.json.decode(ret);
      } catch(e) {
        return SC.Error.create({
          message: e.name + ': ' + e.message,
          label: 'Response',
          errorValue: this });
      }
    }
    return ret;
  }.property('encodedBody').cacheable(),
  
  /** 
    @private
    @deprecated
  
    Alias for body.  Provides compatibility with older code.
    
    @property {Hash|String}
  */
  response: function() {
    return this.get('body');
  }.property('body').cacheable(),
  
  /**
    Set to YES if response is cancelled
  */
  isCancelled: NO,
  
  /**
    Set to YES if the request timed out.  Set to NO if the request has
    completed before the timeout value.  Set to null if the timeout timer is
    still ticking.
  */
  timedOut: null,
  
  /**
    The timer tracking the timeout
  */
  timeoutTimer: null,
  
  // ..........................................................
  // METHODS
  // 

  /**
    Called by the request manager when its time to actually run.  This will
    invoke any callbacks on the source request then invoke transport() to 
    begin the actual request.
  */
  fire: function() {
    var req = this.get('request'),
        source = req ? req.get('source') : null;
    
    
    // first give the source a chance to fixup the request and response
    // then freeze req so no more changes can happen.
    if (source && source.willSend) source.willSend(req, this);
    req.freeze();

    // if the source did not cancel the request, then invoke the transport
    // to actually trigger the request.  This might receive a response 
    // immediately if it is synchronous.
    if (!this.get('isCancelled')) this.invokeTransport();


    // If the request specified a timeout value, then set a timer for it now.
    var timeout = req.get('timeout');
    if (timeout) {
      var timer = SC.Timer.schedule({
        target:   this, 
        action:   'timeoutReached', 
        interval: timeout,
        repeats:  NO
      });
      this.set('timeoutTimer', timer);
    }


    // if the transport did not cancel the request for some reason, let the
    // source know that the request was sent
    if (!this.get('isCancelled') && source && source.didSend) {
      source.didSend(req, this);
    }
  },

  invokeTransport: function() {
    this.receive(function(proceed) { this.set('status', 200); }, this);
  },
  
  /**
    Invoked by the transport when it receives a response.  The passed-in
    callback will be invoked to actually process the response.  If cancelled
    we will pass NO.  You should clean up instead.
    
    Invokes callbacks on the source request also.
    
    @param {Function} callback the function to receive
    @param {Object} context context to execute the callback in
    @returns {SC.Response} receiver
  */
  receive: function(callback, context) {
    // If we timed out, we should ignore this response.
    if (!this.get('timedOut')) {
      // If we had a timeout timer scheduled, invalidate it now.
      var timer = this.get('timeoutTimer');
      if (timer) timer.invalidate();
      this.set('timedOut', NO);
    
      var req = this.get('request');
      var source = req ? req.get('source') : null;
    
      SC.run(function() {
        // invoke the source, giving a chance to fixup the reponse or (more 
        // likely) cancel the request.
        if (source && source.willReceive) source.willReceive(req, this);

        // invoke the callback.  note if the response was cancelled or not
        callback.call(context, !this.get('isCancelled'));

        // if we weren't cancelled, then give the source first crack at handling
        // the response.  if the source doesn't want listeners to be notified,
        // it will cancel the response.
        if (!this.get('isCancelled') && source && source.didReceive) {
          source.didReceive(req, this);
        }

        // notify listeners if we weren't cancelled.
        if (!this.get('isCancelled')) this.notify();
      }, this);
    }
    
    // no matter what, remove from inflight queue
    SC.Request.manager.transportDidClose(this) ;
    return this;
  },
  
  /**
    Default method just closes the connection.  It will also mark the request
    as cancelled, which will not call any listeners.
  */
  cancel: function() {
    if (!this.get('isCancelled')) {
      this.set('isCancelled', YES) ;
      this.cancelTransport() ;
      SC.Request.manager.transportDidClose(this) ;
    }
  },
  
  /**
    Default method just closes the connection.
  */
  timeoutReached: function() {
    // If we already received a response yet the timer still fired for some
    // reason, do nothing.
    if (this.get('timedOut') === null) {
      this.set('timedOut', YES);
      this.cancelTransport();
      SC.Request.manager.transportDidClose(this);
      
      // Set our value to an error.
      var error = SC.$error("HTTP Request timed out", "Request", 408) ;
      error.set("errorValue", this) ;
      this.set('isError', YES);
      this.set('errorObject', error);
      
      // Invoke the didTimeout callback.
      var req = this.get('request');
      var source = req ? req.get('source') : null;
      if (!this.get('isCancelled') && source && source.didTimeout) {
        source.didTimeout(req, this);
      }
    }
  },
  
  /**
    Override with concrete implementation to actually cancel the transport.
  */
  cancelTransport: function() {},
  
  
  /** @private
    Will notify each listener.
  */
  _notifyListener: function(listeners, status) {
    var info = listeners[status], params, target, action;
    if (!info) return NO ;
    
    params = (info.params || []).copy();
    params.unshift(this);
    
    target = info.target;
    action = info.action;
    if (SC.typeOf(action) === SC.T_STRING) action = target[action];
    
    return action.apply(target, params);
  },
  
  /**
    Notifies any saved target/action.  Call whenever you cancel, or end.
    
    @returns {SC.Response} receiver
  */
  notify: function() {
    var listeners = this.get('listeners'), 
        status    = this.get('status'),
        baseStat  = Math.floor(status / 100) * 100,
        handled   = NO ;
        
    if (!listeners) return this ; // nothing to do
    
    handled = this._notifyListener(listeners, status);
    if (!handled) handled = this._notifyListener(listeners, baseStat);
    if (!handled) handled = this._notifyListener(listeners, 0);
    
    return this ;
  },
  
  /**
    String representation of the response object
  */
  toString: function() {
    var ret = arguments.callee.base.apply(this,arguments);
    return "%@<%@ %@, status=%@".fmt(ret, this.get('type'), this.get('address'), this.get('status'));
  }
  
});

/**
  Concrete implementation of SC.Response that implements support for using 
  XHR requests.
  
  @extends SC.Response
  @since SproutCore 1.0
*/
SC.XHRResponse = SC.Response.extend({

  /**
    Implement transport-specific support for fetching all headers
  */
  headers: function() {
    var xhr = this.get('rawRequest'),
        str = xhr ? xhr.getAllResponseHeaders() : null,
        ret = {};
        
    if (!str) return ret;
    
    str.split("\n").forEach(function(header) {
      var idx = header.indexOf(':'),
          key, value;
      if (idx>=0) {
        key = header.slice(0,idx);
        value = header.slice(idx+1).trim();
        ret[key] = value ;
      }
    }, this);
    
    return ret ;
  }.property('status').cacheable(),
  
  // returns a header value if found...
  header: function(key) {
    var xhr = this.get('rawRequest');
    return xhr ? xhr.getResponseHeader(key) : null;    
  },
  
  /**
    Implement transport-specific support for fetching tasks
  */
  encodedBody: function() {
    var xhr = this.get('rawRequest'), ret ;
    if (!xhr) ret = null;
    else if (this.get('isXML')) ret = xhr.responseXML;
    else ret = xhr.responseText;
    return ret ;
  }.property('status').cacheable(),
  

  cancelTransport: function() {
    var rawRequest = this.get('rawRequest');
    if (rawRequest) rawRequest.abort();
    this.set('rawRequest', null);
  },
  
  invokeTransport: function() {
    
    var rawRequest, transport, handleReadyStateChange, async, headers;
    
    // Get an XHR object
    function tryThese() {
      for (var i=0; i < arguments.length; i++) {
        try {
          var item = arguments[i]() ;
          return item ;
        } catch (e) {}
      }
      return NO;
    }
    
    rawRequest = tryThese(
      function() { return new XMLHttpRequest(); },
      function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
      function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
    );
    
    // save it 
    this.set('rawRequest', rawRequest);
    
    // configure async callback - differs per browser...
    async = !!this.getPath('request.isAsynchronous') ;
    if (async) {
      if (!SC.browser.msie && !SC.browser.opera ) {
        SC.Event.add(rawRequest, 'readystatechange', this, 
                     this.finishRequest, rawRequest) ;
      } else {
        transport=this;
        handleReadyStateChange = function() {
          if (!transport) return null ;
          var ret = transport.finishRequest();
          if (ret) transport = null ; // cleanup memory
          return ret ;
        };
        rawRequest.onreadystatechange = handleReadyStateChange;
      }
    }
    
    // initiate request.  
    rawRequest.open(this.get('type'), this.get('address'), async ) ;
    
    // headers need to be set *after* the open call.
    headers = this.getPath('request.headers') ;
    for (var headerKey in headers) {
      rawRequest.setRequestHeader(headerKey, headers[headerKey]) ;
    }

    // now send the actual request body - for sync requests browser will
    // block here
    rawRequest.send(this.getPath('request.encodedBody')) ;
    if (!async) this.finishRequest() ; // not async
    
    return rawRequest ;
  },
  
  /**  @private
  
    Called by the XHR when it responds with some final results.
    
    @param {XMLHttpRequest} rawRequest the actual request
    @returns {SC.XHRRequestTransport} receiver
  */
  finishRequest: function(evt) {
    var rawRequest = this.get('rawRequest'),
        readyState = rawRequest.readyState,
        error, status, msg;

    if (readyState === 4) {
      this.receive(function(proceed) {

        if (!proceed) return ; // skip receiving...
      
        // collect the status and decide if we're in an error state or not
        status = -1 ;
        try {
          status = rawRequest.status || 0;
        } catch (e) {}

        // if there was an error - setup error and save it
        if ((status < 200) || (status >= 300)) {
          
          try {
            msg = rawRequest.statusText || '';
          } catch(e2) {
            msg = '';
          }
          
          error = SC.$error(msg || "HTTP Request failed", "Request", status) ;
          error.set("errorValue", this) ;
          this.set('isError', YES);
          this.set('errorObject', error);
        }

        // set the status - this will trigger changes on relatedp properties
        this.set('status', status);
      
      }, this);

      // Avoid memory leaks
      if (!SC.browser.msie) {
        SC.Event.remove(rawRequest, 'readystatechange', this, this.finishRequest);	  
      } else {
        rawRequest.onreadystatechange = null;
      }

      return YES;
    }
    return NO; 
  }

  
});

/* >>>>>>>>>> BEGIN source/system/request.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/response');

/**
  @class
  
  Implements support for Ajax requests using XHR and other prototcols.
  
  SC.Request is much like an inverted version of the request/response objects
  you receive when implementing HTTP servers.  
  
  To send a request, you just need to create your request object, configure
  your options, and call send() to initiate the request.
  
  @extends SC.Object
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/

SC.Request = SC.Object.extend(SC.Copyable, SC.Freezable,
  /** @scope SC.Request.prototype */ {
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Sends the request asynchronously instead of blocking the browser.  You
    should almost always make requests asynchronous.  You can change this 
    options with the async() helper option (or simply set it directly).
    
    Defaults to YES. 
    
    @property {Boolean}
  */
  isAsynchronous: YES,

  /**
    Processes the request and response as JSON if possible.  You can change
    this option with the json() helper method.

    Defaults to NO 
    
    @property {Boolean}
  */
  isJSON: NO,

  /**
    Process the request and response as XML if possible.  You can change this
    option with the xml() helper method.
    
    Defaults to NO
  
    @property {Boolean}
  */
  isXML: NO,
  
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.header('X-Requested-With', 'XMLHttpRequest');
    //TODO: we need to have the SC version in a SC variable.
    //For now I'm harcoding the variable.
    this.header('X-SproutCore-Version', '1.4');
  },
  
  /**
    Current set of headers for the request
  */
  headers: function() {
    var ret = this._headers ;
    if (!ret) ret = this._headers = {} ;
    return ret ;  
  }.property().cacheable(),

  /**
    Underlying response class to actually handle this request.  Currently the
    only supported option is SC.XHRResponse which uses a traditional
    XHR transport.
    
    @property {SC.Response}
  */
  responseClass: SC.XHRResponse,

  /**
    The original request for copied requests.
    
    @property {SC.Request}
  */
  source: null,
  
  /**
    The URL this request to go to.
    
    @param {String}
  */
  address: null,
  
  /**
    The HTTP method to use.
    
    @param {String}
  */
  type: 'GET',
  
  /**
    An optional timeout value of the request, in milliseconds.  The timer
    begins when SC.Response#fire is actually invoked by the request manager
    and not necessarily when SC.Request#send is invoked.  If this timeout is
    reached before a response is received, the equivalent of
    SC.Request.manager#cancel() will be invoked on the SC.Response instance
    and the didTimeout() callback will be called.
    
    An exception will be thrown if you try to invoke send() on a request that
    has both a timeout and isAsyncronous set to NO.
    
    @property {Number}
  */
  timeout: null,
  
  /**
    The body of the request.  May be an object is isJSON or isXML is set,
    otherwise should be a string.
  */
  body: null,
  
  /**
    The body, encoded as JSON or XML if needed.
  */
  encodedBody: function() {
    // TODO: support XML
    var ret = this.get('body');
    if (ret && this.get('isJSON')) ret = SC.json.encode(ret);
    return ret ;
  }.property('isJSON', 'isXML', 'body').cacheable(),

  // ..........................................................
  // CALLBACKS
  // 
  
  /**
    Invoked on the original request object just before a copied request is 
    frozen and then sent to the server.  This gives you one last change to 
    fixup the request; possibly adding headers and other options.
    
    If you do not want the request to actually send, call cancel().
    
    @param {SC.Request} request a copy of the request, not frozen
    @returns {void}
  */
  willSend: function(request, response) {},
  
  /**
    Invoked on the original request object just after the request is sent to
    the server.  You might use this callback to update some state in your 
    application.
    
    The passed request is a frozen copy of the request, indicating the 
    options set at the time of the request.
    
    @param {SC.Request} request a copy of the request, frozen
    @param {SC.Response} response the object that will carry the response
    @returns {void}
  */
  didSend: function(request, response) {},
  
  /**
    Invoked when a response has been received but not yet processed.  This is
    your chance to fix up the response based on the results.  If you don't
    want to continue processing the response call response.cancel().

    @param {SC.Response} response the response
    @returns {void}
  */
  willReceive: function(request, response) {},
  
  /**
    Invoked after a response has been processed but before any listeners are
    notified.  You can do any standard processing on the request at this 
    point.  If you don't want to allow notifications to continue, call
    response.cancel()
    
    @param {SC.Response} response reponse
    @returns {void}
  */
  didReceive: function(request, response) {},
  
  /**
    Invoked when a request times out before a response has been received, as
    determined by the 'timeout' property.  Note that if a request times out,
    neither willReceive() nor didReceive() will be called.

    @param {SC.Response} response the response
    @returns {void}
  */
  didTimeout: function(request, response) {},
  
  // ..........................................................
  // HELPER METHODS
  // 

  COPY_KEYS: 'isAsynchronous isJSON isXML address type timeout body responseClass willSend didSend willReceive didReceive'.w(),
  
  /**
    Returns a copy of the current request.  This will only copy certain
    properties so if you want to add additional properties to the copy you
    will need to override copy() in a subclass.
    
    @returns {SC.Request} new request
  */
  copy: function() {
    var ret = {},
        keys = this.COPY_KEYS,
        loc  = keys.length, 
        key, listeners, headers;
        
    while(--loc>=0) {
      key = keys[loc];
      if (this.hasOwnProperty(key)) ret[key] = this.get(key);
    }
    
    if (this.hasOwnProperty('listeners')) {
      ret.listeners = SC.copy(this.get('listeners'));
    }
    
    if (this.hasOwnProperty('_headers')) {
      ret._headers = SC.copy(this._headers);
    }
    
    ret.source = this.get('source') || this ;
    
    return this.constructor.create(ret);
  },
  
  /**
    To set headers on the request object.  Pass either a single key/value 
    pair or a hash of key/value pairs.  If you pass only a header name, this
    will return the current value of the header.
    
    @param {String|Hash} key
    @param {String} value
    @returns {SC.Request|Object} receiver
  */
  header: function(key, value) {
    var headers;
    
    if (SC.typeOf(key) === SC.T_STRING) {
      headers = this._headers ;
      if (arguments.length===1) {
        return headers ? headers[key] : null;
      } else {
        this.propertyWillChange('headers');
        if (!headers) headers = this._headers = {};
        headers[key] = value;
        this.propertyDidChange('headers');
        return this;
      }
    
    // handle parsing hash of parameters
    } else if (value === undefined) {
      headers = key;
      this.beginPropertyChanges();
      for(key in headers) {
        if (!headers.hasOwnProperty(key)) continue ;
        this.header(key, headers[key]);
      }
      this.endPropertyChanges();
      return this;
    }

    return this ;
  },

  /**
    Converts the current request to be asynchronous.

    @property {Boolean} flag YES to make asynchronous, NO or undefined
    @returns {SC.Request} receiver
  */
  async: function(flag) {
    if (flag === undefined) flag = YES;
    return this.set('isAsynchronous', flag);
  },
  
  /**
    Converts the current request to use JSON.
    
    @property {Boolean} flag YES to make JSON, NO or undefined
    @returns {SC.Request} receiver
  */
  json: function(flag) {
    if (flag === undefined) flag = YES;
    if (flag) this.set('isXML', NO);
    return this.set('isJSON', flag);
  },
  
  /**
    Converts the current request to use XML.
    
    @property {Boolean} flag YES to make XML, NO or undefined
    @returns {SC.Request} recevier
  */
  xml: function(flag) {
    if (flag === undefined) flag = YES ;
    if (flag) this.set('isJSON', NO);
    return this.set('isXML', flag);
  },
  
  /** 
    Called just before a request is enqueued.  This will encode the body 
    into JSON if it is not already encoded.
  */
  _prep: function() {
    var hasContentType = !!this.header('Content-Type');
    if (this.get('isJSON') && !hasContentType) {
      this.header('Content-Type', 'application/json');
    } else if (this.get('isXML') && !hasContentType) {
      this.header('Content-Type', 'text/xml');
    }
    return this ;
  },
  
  /**
    Will fire the actual request.  If you have set the request to use JSON 
    mode then you can pass any object that can be converted to JSON as the 
    body.  Otherwise you should pass a string body.
    
    @param {String|Object} body (optional)
    @returns {SC.Response} new response object
  */  
  send: function(body) {
    // Sanity-check:  Be sure a timeout value was not specified if the request
    // is synchronous (because it wouldn't work).
    var timeout = this.get('timeout');
    if (timeout) {
      if (!this.get('isAsynchronous')) throw "Timeout values cannot be used with synchronous requests";
    }
    else if (timeout === 0) {
      throw "The timeout value must either not be specified or must be greater than 0";
    }
    
    if (body) this.set('body', body);
    return SC.Request.manager.sendRequest(this.copy()._prep());
  },

  /**
    Resends the current request.  This is more efficient than calling send()
    for requests that have already been used in a send.  Otherwise acts just
    like send().  Does not take a body argument.
    
    @returns {SC.Response} new response object
  */
  resend: function() {
    var req = this.get('source') ? this : this.copy()._prep();
    return SC.Request.manager.sendRequest(req);
  },
  
  /**
    Configures a callback to execute when a request completes.  You must pass
    at least a target and action/method to this and optionally a status code.
    You may also pass additional parameters which will be passed along to your
    callback.
    
    h2. Scoping With Status Codes
    
    If you pass a status code as the first option to this method, then your 
    notification callback will only be called if the response status matches
    the code.  For example, if you pass 201 (or SC.Request.CREATED) then 
    your method will only be called if the response status from the server
    is 201.
    
    You can also pass "generic" status codes such as 200, 300, or 400, which
    will be invoked anytime the status code is the range if a more specific 
    notifier was not registered first and returned YES.  
    
    Finally, passing a status code of 0 or no status at all will cause your
    method to be executed no matter what the resulting status is unless a 
    more specific notifier was registered and returned YES.
    
    h2. Callback Format
    
    Your notification callback should expect to receive the Response object
    as the first parameter plus any additional parameters that you pass.  
    
    @param {Number} status
    @param {Object} target
    @param {String|function} action
    @param {Hash} params
    @returns {SC.Request} receiver
  */
  notify: function(status, target, action, params) {
    
    // normalize status
    var hasStatus = YES ;
    if (SC.typeOf(status) !== SC.T_NUMBER) {
      params = SC.A(arguments).slice(2);
      action = target;
      target = status;
      status = 0 ;
      hasStatus = NO ;
    } else params = SC.A(arguments).slice(3);
    
    var listeners = this.get('listeners');
    if (!listeners) this.set('listeners', listeners = {});
    listeners[status] = { target: target, action: action, params: params };

    return this;
  }
    
});

SC.Request.mixin(/** @scope SC.Request */ {
  
  /**
    Helper method for quickly setting up a GET request.

    @param {String} address url of request
    @returns {SC.Request} receiver
  */
  getUrl: function(address) {
    return this.create().set('address', address).set('type', 'GET');
  },

  /**
    Helper method for quickly setting up a POST request.

    @param {String} address url of request
    @param {String} body
    @returns {SC.Request} receiver
  */
  postUrl: function(address, body) {
    var req = this.create().set('address', address).set('type', 'POST');
    if(body) req.set('body', body) ;
    return req ;
  },

  /**
    Helper method for quickly setting up a DELETE request.

    @param {String} address url of request
    @returns {SC.Request} receiver
  */
  deleteUrl: function(address) {
    return this.create().set('address', address).set('type', 'DELETE');
  },

  /**
    Helper method for quickly setting up a PUT request.

    @param {String} address url of request
    @param {String} body
    @returns {SC.Request} receiver
  */
  putUrl: function(address, body) {
    var req = this.create().set('address', address).set('type', 'PUT');
    if(body) req.set('body', body) ;
    return req ;
  }
  
});



/**
  The request manager coordinates all of the active XHR requests.  It will
  only allow a certain number of requests to be active at a time; queuing 
  any others.  This allows you more precise control over which requests load
  in which order.
*/
SC.Request.manager = SC.Object.create( SC.DelegateSupport, {

  /**
    Maximum number of concurrent requests allowed.  6 for all browsers.
    
    @property {Number}
  */
  maxRequests: 6,

  /**
    Current requests that are inflight.
    
    @property {Array}
  */
  inflight: [],
  
  /**
    Requests that are pending and have not been started yet.
  
    @property {Array}
  */
  pending: [],

  // ..........................................................
  // METHODS
  // 
  
  /**
    Invoked by the send() method on a request.  This will create a new low-
    level transport object and queue it if needed.
    
    @param {SC.Request} request the request to send
    @returns {SC.Object} response object
  */
  sendRequest: function(request) {
    if (!request) return null ;
    
    // create low-level transport.  copy all critical data for request over
    // so that if the request has been reconfigured the transport will still
    // work.
    var response = request.get('responseClass').create({ request: request });

    // add to pending queue
    this.get('pending').pushObject(response);
    this.fireRequestIfNeeded();
    
    return response ;
  },

  /** 
    Cancels a specific request.  If the request is pending it will simply
    be removed.  Otherwise it will actually be cancelled.
    
    @param {Object} response a response object
    @returns {Boolean} YES if cancelled
  */
  cancel: function(response) {

    var pending = this.get('pending'),
        inflight = this.get('inflight'),
        idx ;

    if (pending.indexOf(response) >= 0) {
      this.propertyWillChange('pending');
      pending.removeObject(response);
      this.propertyDidChange('pending');
      return YES;
      
    } else if (inflight.indexOf(response) >= 0) {
      
      response.cancel();
      
      inflight.removeObject(response);
      this.fireRequestIfNeeded();
      return YES;

    } else return NO ;
  },  

  /**
    Cancels all inflight and pending requests.  
    
    @returns {Boolean} YES if any items were cancelled.
  */
  cancelAll: function() {
    if (this.get('pending').length || this.get('inflight').length) {
      this.set('pending', []);
      this.get('inflight').forEach(function(r) { r.cancel(); });
      this.set('inflight', []);
      return YES;
      
    } else return NO ;
  },
  
  /**
    Checks the inflight queue.  If there is an open slot, this will move a 
    request from pending to inflight.
    
    @returns {Object} receiver
  */
  fireRequestIfNeeded: function() {
    var pending = this.get('pending'), 
        inflight = this.get('inflight'),
        max = this.get('maxRequests'),
        next ;
        
    if ((pending.length>0) && (inflight.length<max)) {
      next = pending.shiftObject();
      inflight.pushObject(next);
      next.fire();
    }
  },

  /**
    Called by a response/transport object when finishes running.  Removes 
    the transport from the queue and kicks off the next one.
  */
  transportDidClose: function(response) {
    this.get('inflight').removeObject(response);
    this.fireRequestIfNeeded();
  }
  
});

/* >>>>>>>>>> BEGIN source/system/routes.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/platform');

/**
  SC.routes manages the browser location. You can change the hash part of the
  current location. The following code
  
  {{{
    SC.routes.set('location', 'notes/edit/4');
  }}}
  
  will change the location to http://domain.tld/my_app#notes/edit/4. Adding
  routes will register a handler that will be called whenever the location
  changes and matches the route:
  
  {{{
    SC.routes.add(':controller/:action/:id', MyApp, MyApp.route);
  }}}
  
  You can pass additional parameters in the location hash that will be relayed
  to the route handler:
  
  {{{
    SC.routes.set('location', 'notes/show/4?format=xml&language=fr');
  }}}
  
  The syntax for the location hash is described in the location property
  documentation, and the syntax for adding handlers is described in the
  add method documentation.
  
  Browsers keep track of the locations in their history, so when the user
  presses the 'back' or 'forward' button, the location is changed, SC.route
  catches it and calls your handler. Except for Internet Explorer versions 7
  and earlier, which do not modify the history stack when the location hash
  changes.
  
  @since SproutCore 1.1
*/
SC.routes = SC.Object.create({
    
  /** @private
    A boolean value indicating whether or the ping method has been called
    to setup the SC.routes.
  
    @property
    @type {Boolean}
  */
  _didSetup: NO,
  
  
  /** @private
    Internal representation of the current location hash.
  
    @property
    @type {String}
  */
  _location: null,
  
  /** @private
    Routes are stored in a tree structure, this is the root node.
  
    @property
    @type {SC.routes._Route}
  */
  _firstRoute: null,
  
  /** @private
    Internal method used to extract and merge the parameters of a URL.
    
    @returns {Hash}
  */
  _extractParametersAndRoute: function(obj) {
    var params = {},
        route = obj.route || '',
        separator, parts, i, len, crumbs, key;
    
    separator = (route.indexOf('?') < 0 && route.indexOf('&') >= 0) ? '&' : '?';
    parts = route.split(separator);
    route = parts[0];
    if (parts.length === 1) {
      parts = [];
    } else if (parts.length === 2) {
      parts = parts[1].split('&');
    } else if (parts.length > 2) {
      parts.shift();
    }
    
    // extract the parameters from the route string
    len = parts.length;
    for (i = 0; i < len; ++i) {
      crumbs = parts[i].split('=');
      params[crumbs[0]] = crumbs[1];
    }
    
    // overlay any parameter passed in obj
    for (key in obj) {
      if (obj.hasOwnProperty(key) && key !== 'route') {
        params[key] = '' + obj[key];
      }
    }
    
    // build the route
    parts = [];
    for (key in params) {
      parts.push([key, params[key]].join('='));
    }
    params.params = separator + parts.join('&');
    params.route = route;
    
    return params;
  },
  
  /**
    The current location hash. It is the part in the browser's location after
    the '#' mark.
    
    The following code
    
    {{{
      SC.routes.set('location', 'notes/edit/4');
    }}}
    
    will change the location to http://domain.tld/my_app#notes/edit/4 and call
    the correct route handler if it has been registered with the add method.
    
    You can also pass additional parameters. They will be relayed to the route
    handler. For example, the following code
    
    {{{
      SC.routes.add(':controller/:action/:id', MyApp, MyApp.route);
      SC.routes.set('location', 'notes/show/4?format=xml&language=fr');
    }}}
    
    will change the location to 
    http://domain.tld/my_app#notes/show/4?format=xml&language=fr and call the
    MyApp.route method with the following argument:
    
    {{{
      { route: 'notes/show/4',
        params: '?format=xml&language=fr',
        controller: 'notes',
        action: 'show',
        id: '4',
        format: 'xml',
        language: 'fr' }
    }}}
    
    The location can also be set with a hash, the following code
    
    {{{
      SC.routes.set('location',
        { route: 'notes/edit/4', format: 'xml', language: 'fr' });
    }}}
    
    will change the location to
    http://domain.tld/my_app#notes/show/4?format=xml&language=fr.
    
    The 'notes/show/4&format=xml&language=fr' syntax for passing parameters,
    using a '&' instead of a '?', as used in SproutCore 1.0 is still supported.
    
    @property
    @type {String}
  */
  location: function(key, value) {
    var crumbs;
    
    if (value !== undefined) {
      if (value === null) {
        value = '';
      }
      
      if (typeof(value) === 'object') {
        crumbs = this._extractParametersAndRoute(value);
        value = crumbs.route + crumbs.params;
      }
      
      if(!SC.empty(value) || (this._location && this._location !== value)) {
        window.location.hash = encodeURI(value);
      }
      this._location = value;
      
      return this;
    }
    return this._location;
  }.property(),
  
  /**
    You usually don't need to call this method. It is done automatically after
    the application has been initialized.
    
    It registers for the hashchange event if available. If not, it creates a
    timer that looks for location changes every 150ms.
  */
  ping: function() {
    var that;
    
    if (!this._didSetup) {
      this._didSetup = YES;
      
      if (SC.platform.supportsHashChange) {
        this.hashChange();
        SC.Event.add(window, 'hashchange', this, this.hashChange);
      
      } else {
        // we don't use a SC.Timer because we don't want
        // a run loop to be triggered at each ping
        that = this;
        this._invokeHashChange = function() {
          that.hashChange();
          setTimeout(that._invokeHashChange, 100);
        };
        this._invokeHashChange();
      }
    }
  },
  
  /**
    Event handler for the hashchange event. Called automatically by the browser
    if it supports the hashchange event, or by our timer if not.
  */
  hashChange: function(event) {
    var loc = window.location.hash;
    
    loc = (loc && loc.length > 0) ? loc.slice(1, loc.length) : '';
    if (!SC.browser.isMozilla) {
      // because of bug https://bugzilla.mozilla.org/show_bug.cgi?id=483304
      loc = decodeURI(loc);
    }
    
    if (this.get('location') !== loc) {
      SC.run(function() {
        this.set('location', loc);        
      }, this);
    }
  },
  
  /**
    Adds a route handler. Routes have the following format:
      - 'users/show/5' is a static route and only matches this exact string,
      - ':action/:controller/:id' is a dynamic route and the handler will be
        called with the 'action', 'controller' and 'id' parameters passed in a
        hash,
      - '*url' is a wildcard route, it matches the whole route and the handler
        will be called with the 'url' parameter passed in a hash.
    
    Route types can be combined, the following are valid routes:
      - 'users/:action/:id'
      - ':controller/show/:id'
      - ':controller/ *url' (ignore the space, because of jslint)
    
    @param {String} route the route to be registered
    @param {Object} target the object on which the method will be called, or
      directly the function to be called to handle the route
    @param {Function} method the method to be called on target to handle the
      route, can be a function or a string
  */
  add: function(route, target, method) {
    if (!this._didSetup) {
      this.invokeLast(this.ping);
    }
    
    if (method === undefined && SC.typeOf(target) === SC.T_FUNCTION) {
      method = target;
      target = null;
    } else if (SC.typeOf(method) === SC.T_STRING) {
      method = target[method];
    }
    
    if (!this._firstRoute) this._firstRoute = this._Route.create();
    this._firstRoute.add(route.split('/'), target, method);
    
    return this;
  },
  
  /**
    Observer of the 'location' property that calls the correct route handler
    when the location changes.
  */
  locationDidChange: function() {
    this.trigger();
  }.observes('location'),
  
  /**
    Triggers a route even if already in that route (does change the location, if it
    is not already changed, as well).
    
    If the location is not the same as the supplied location, this simply lets "location"
    handle it (which ends up coming back to here).
  */
  trigger: function() {
    var firstRoute = this._firstRoute,
        location = this.get('location'),
        params, route;
    
    if (firstRoute) {
      params = this._extractParametersAndRoute({ route: location });
      location = params.route;
      delete params.route;
      delete params.params;
      route = firstRoute.routeForParts(location.split('/'), params);
      if (route && route.target && route.method) {
        route.method.call(route.target, params);
      }
    }
  },
  
  /**
    @private
    @class

    SC.routes._Route is a class used internally by SC.routes. The routes defined by your
    application are stored in a tree structure, and this is the class for the
    nodes.
  */
  _Route: SC.Object.extend(
  /** @scope SC.routes._Route.prototype */ {

    target: null,

    method: null,

    staticRoutes: null,

    dynamicRoutes: null,

    wildcardRoutes: null,

    add: function(parts, target, method) {
      var part, nextRoute;

      // clone the parts array because we are going to alter it
      parts = SC.clone(parts);

      if (!parts || parts.length === 0) {
        this.target = target;
        this.method = method;

      } else {
        part = parts.shift();

        // there are 3 types of routes
        switch (part.slice(0, 1)) {

        // 1. dynamic routes
        case ':':
          part = part.slice(1, part.length);
          if (!this.dynamicRoutes) this.dynamicRoutes = {};
          if (!this.dynamicRoutes[part]) this.dynamicRoutes[part] = this.constructor.create();
          nextRoute = this.dynamicRoutes[part];
          break;

        // 2. wildcard routes
        case '*':
          part = part.slice(1, part.length);
          if (!this.wildcardRoutes) this.wildcardRoutes = {};
          nextRoute = this.wildcardRoutes[part] = this.constructor.create();
          break;

        // 3. static routes
        default:
          if (!this.staticRoutes) this.staticRoutes = {};
          if (!this.staticRoutes[part]) this.staticRoutes[part] = this.constructor.create();
          nextRoute = this.staticRoutes[part];
        }

        // recursively add the rest of the route
        if (nextRoute) nextRoute.add(parts, target, method);
      }
    },

    routeForParts: function(parts, params) {
      var part, key, route;

      // clone the parts array because we are going to alter it
      parts = SC.clone(parts);

      // if parts is empty, we are done
      if (!parts || parts.length === 0) {
        return this.method ? this : null;

      } else {
        part = parts.shift();

        // try to match a static route
        if (this.staticRoutes && this.staticRoutes[part]) {
          return this.staticRoutes[part].routeForParts(parts, params);

        } else {

          // else, try to match a dynamic route
          for (key in this.dynamicRoutes) {
            route = this.dynamicRoutes[key].routeForParts(parts, params);
            if (route) {
              params[key] = part;
              return route;
            }
          }

          // else, try to match a wilcard route
          for (key in this.wildcardRoutes) {
            parts.unshift(part);
            params[key] = parts.join('/');
            return this.wildcardRoutes[key].routeForParts(null, params);
          }

          // if nothing was found, it means that there is no match
          return null;
        }
      }
    }

  })
  
});

/* >>>>>>>>>> BEGIN source/tasks/task.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Represents a single task which can be run by a task queue. Note that tasks
  are actually allowed to add themselves back onto the queue if they did not/
  might not finish.
*/
SC.Task = SC.Object.extend({
  run: function(queue) {
    // if needed, you could put the task back on the queue for later finishing.
  }
});

/* >>>>>>>>>> BEGIN source/system/task_queue.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("tasks/task");

/**
  Runs a set of tasks. Most importantly, has a runWhenIdle option that allows
  it to run when no user input is occurring. This allows, for instance, preloading
  bundles while not blocking user interaction.
*/
SC.TaskQueue = SC.Task.extend({
  /**
    If YES, the queue will automatically run in the background when the browser idles.
  */
  runWhenIdle: NO,
  
  /**
    A limit which, if exceeded, the task queue will wait until a later run
    to continue.
  */
  runLimit: 50,
  
  /**
    The duration between idle runs.
  */
  interval: 50,
  
  /**
    If running, YES.
  */
  isRunning: NO,
  
  /**
    The minimum elapsed time since the last event. As a rule of thumb, perhaps
    something equivalent to the expected duration of a task.
  */
  minimumIdleDuration: 500,
  
  _tasks: [],
  
  /**
    Returns YES if there are tasks in the queue.
  */
  hasTasks: function() {
    return this._tasks.length > 0;
  }.property('taskCount').cacheable(),
  
  /**
    Returns the number of tasks in the queue.
  */
  taskCount: function() {
    return this._tasks.length;
  }.property().cacheable(),
  
  /**
    Adds the task to the end of the queue.
  */
  push: function(task) {
    this._tasks.push(task);
    this.notifyPropertyChange('taskCount');
  },
  
  /**
    Removes and returns the first task in the queue.
  */
  next: function() {
    // null if there is no task
    if (this._tasks.length < 1) return null;
    
    // otherwise, return the first one in the queue
    var next = this._tasks.shift();
    this.notifyPropertyChange('taskCount');
    return next;
  },
  
  /**
    @private
    Sets up idling if needed when the task count changes.
  */
  _taskCountDidChange: function() {
    this._setupIdle();
  }.observes('taskCount'),
  
  /**
    Sets up the scheduled idling check if needed and applicable.
    @private
  */
  _setupIdle: function() {
    if (this.get('runWhenIdle') && !this._idleIsScheduled && this.get('taskCount') > 0) {
      var self = this;
      setTimeout(
        function(){
          self._idleEntry();
        }, 
        this.get('interval')
      );
      this._idleIsScheduled = YES;
    }
  },
  
  /**
    The entry point for the idle.
    @private
  */
  _idleEntry: function() {
    this._idleIsScheduled = NO;
    var last = SC.RunLoop.lastRunLoopEnd;
    if (Date.now() - last > this.get('minimumIdleDuration')) {
      // if no recent events (within < 1s)
      this.run();
    } else {
      SC.run(function() {
        this._setupIdle();        
      }, this);
      SC.RunLoop.lastRunLoopEnd = last; // we were never here
    }
  },
  
  /**
    Runs tasks until limit (TaskQueue.runLimit by default) is reached.
  */
  run: function(limit) {
    this.set("isRunning", YES);
    if (!limit) limit = this.get("runLimit");
    
    var task, start = Date.now();
    
    while (task = this.next()) {
      task.run(this);
      
      // check if the limit has been exceeded
      if (Date.now() - start > limit) break;
    }
    
    // set up idle timer if needed
    this._setupIdle();
    
    this.set("isRunning", NO);
  }
  
  
});

SC.backgroundTaskQueue = SC.TaskQueue.create({
  runWhenIdle: YES
});

/* >>>>>>>>>> BEGIN source/system/time.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  The time library provides a common way for working with time offsets.

  #1 - Fast, not-chained
  
  t = SC.time.month(123) ;
  
  #2 - Chained
  
  t = SC.time(123).month(3).day(12).year(2003).done();

  t = SC.time(123).month(3) ;
*/
SC.time = function(timeoffset) {
  var ret = SC.beget(fn) ;
  ret.value = timeOffset ;
  return ret ;
} ;

(function() {

  var date = new Date();
  
  SC.mixin(SC.time, /** @scope SC.time @static */ { 

    month: function(offset, newMonth) {
      date.setTime(offset) ;
      if (newMonth === undefined) return date.getMonth() ;
      date.setMonth(newMonth) ;
      return date.getTime() ;
    },
    
    /**
      Converts an offset in local time into an offset in UTC time.
      
      @param {Time} offset the local time offset
      @returns {Time} the new offset
    */
    utc: function(offset) {
      date.setTime(offset) ;
      return offset + (date.getTimezoneOffset()*60*1000);  
    },
    
    local: function(offset) {
      date.setTime(offset) ;
      return offset - (date.getTimezoneOffset()*60*1000);  
    },
    
    parse: function(string) {
      
    },
    
    format: function(offset) {
      
    }

  }) ;
  
})() ;

SC.time.fmt = SC.time.format ;

SC.time.fn = {
  
  done: function() { return this.value ; }
  
} ;

"month day year".split(' ').forEach(function(key) {
  SC.time.fn[key] = function(newTime) {
    if (newTime === undefined) {
      return SC.time[key](this.value);
    } else {
      this.value = SC.time[key](this.value, newTime) ;
      return this ;  
    }
  } ;
}) ;

//-----

// Test.context("test basic Date mapping functions", {
//   "month() should return month, month(value) should set month": function() {
//     //...
//   }
// }) ;
// 
// Test.context("test basic Date mapping functions", (function() {
//   var methods = "month day".split(' ') ;
//   var tests = {} ;
//   methods.forEach(function(name) {
//     var testName = "%@() should return %@, %@(value) should set %@".fmt(name,name,name,name) ;
//     
//     tests[testName] = function() {
//       var date = new Date() ;
//       var time = date.getTime() ;
// 
//       var value = date["get%@".fmt(name.capitalize())]() ;
//       equals(value, SC.time[name](), "get");
//       
//       var value = date["set%@".fmt(name.capitalize())](3).getTime() ;
//       equals(value, SC.time[name](3), "set");
//       
//     } ;
//   });
//   
//   return tests ;
// })()) ;


// Extensions to the Date object. Comes from JavaScript Toolbox at:
// http://www.mattkruse.com/javascript/date/source.html

// ------------------------------------------------------------------
// These functions use the same 'format' strings as the 
// java.text.SimpleDateFormat class, with minor exceptions.
// The format string consists of the following abbreviations:
// 
// Field        | Full Form          | Short Form
// -------------+--------------------+-----------------------
// Year         | yyyy (4 digits)    | yy (2 digits), y (2 or 4 digits)
// Month        | MMM (name or abbr.)| MM (2 digits), M (1 or 2 digits)
//              | NNN (abbr.)        |
// Day of Month | dd (2 digits)      | d (1 or 2 digits)
// Day of Week  | EE (name)          | E (abbr)
// Hour (1-12)  | hh (2 digits)      | h (1 or 2 digits)
// Hour (0-23)  | HH (2 digits)      | H (1 or 2 digits)
// Hour (0-11)  | KK (2 digits)      | K (1 or 2 digits)
// Hour (1-24)  | kk (2 digits)      | k (1 or 2 digits)
// Minute       | mm (2 digits)      | m (1 or 2 digits)
// Second       | ss (2 digits)      | s (1 or 2 digits)
// AM/PM        | a                  |
//
// NOTE THE DIFFERENCE BETWEEN MM and mm! Month=MM, not mm!
// Examples:
//  "MMM d, y" matches: January 01, 2000
//                      Dec 1, 1900
//                      Nov 20, 00
//  "M/d/yy"   matches: 01/20/00
//                      9/2/00
//  "MMM dd, yyyy hh:mm:ssa" matches: "January 01, 2000 12:30:45AM"
// ------------------------------------------------------------------

var MONTH_NAMES=new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');
function LZ(x) {return(x<0||x>9?"":"0")+x;}

SC.Locale.define('en', {
  longMonthNames: 'January February March April May'.split(' '),
  shortMonthNames: [],
  
  shortDateFormat: 'dd/mm/yy',
  longDateFormat: ''
}) ;

SC.mixin(Date,{
  
  // ------------------------------------------------------------------
  // isDate ( date_string, format_string )
  // Returns true if date string matches format of format string and
  // is a valid date. Else returns false.
  // It is recommended that you trim whitespace around the value before
  // passing it to this function, as whitespace is NOT ignored!
  // ------------------------------------------------------------------
  isDate: function(val,format) {
  	var date = Date.getDateFromFormat(val,format);
  	if (date==0) { return false; }
  	return true;
	},

  // -------------------------------------------------------------------
  // compareDates(date1,date1format,date2,date2format)
  //   Compare two date strings to see which is greater.
  //   Returns:
  //   1 if date1 is greater than date2
  //   0 if date2 is greater than date1 of if they are the same
  //  -1 if either of the dates is in an invalid format
  // -------------------------------------------------------------------
  compareDates: function(date1,dateformat1,date2,dateformat2) {
  	var d1= Date.getDateFromFormat(date1,dateformat1);
  	var d2= Date.getDateFromFormat(date2,dateformat2);
  	if (d1==0 || d2==0) {
  		return -1;
  		}
  	else if (d1 > d2) {
  		return 1;
  		}
  	return 0;
	},
	
  // ------------------------------------------------------------------
  // getDateFromFormat( date_string , format_string )
  //
  // This function takes a date string and a format string. It matches
  // If the date string matches the format string, it returns the 
  // getTime() of the date. If it does not match, it returns 0.
  // ------------------------------------------------------------------
  getDateFromFormat: function(val,format) {
  	val=val+"";
  	format=format+"";
  	var i_val=0;
  	var i_format=0;
  	var c="";
  	var token="";
  	var token2="";
  	var x,y;
  	var now=new Date();
  	var year=now.getFullYear();
  	var month=now.getMonth()+1;
  	var date=1;
  	var hh=now.getHours();
  	var mm=now.getMinutes();
  	var ss=now.getSeconds();
  	var ampm="";

    var locale = SC.Locale.currentLocale; 

  	while (i_format < format.length) {
  		// Get next token from format string
  		c=format.charAt(i_format);
  		token="";
  		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
  			token += format.charAt(i_format++);
  			}
  		// Extract contents of value based on format token
  		if (token=="yyyy" || token=="yy" || token=="y") {
  			if (token=="yyyy") { x=4;y=4; }
  			if (token=="yy")   { x=2;y=2; }
  			if (token=="y")    { x=2;y=4; }
  			year=Date._getInt(val,i_val,x,y);
  			if (year==null) { return 0; }
  			i_val += year.length;
  			if (year.length==2) {
  				if (year > 70) { year=1900+(year-0); }
  				else { year=2000+(year-0); }
  				}
  			}
  		else if (token=="MMM"||token=="NNN"){
  			month=0;
  			for (var i=0; i<MONTH_NAMES.length; i++) {
  				var month_name=MONTH_NAMES[i];
  				if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
  					if (token=="MMM"||(token=="NNN"&&i>11)) {
  						month=i+1;
  						if (month>12) { month -= 12; }
  						i_val += month_name.length;
  						break;
  						}
  					}
  				}
  			if ((month < 1)||(month>12)){return 0;}
  			}
  		else if (token=="EE"||token=="E"){
  			for (var i=0; i<DAY_NAMES.length; i++) {
  				var day_name=DAY_NAMES[i];
  				if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
  					i_val += day_name.length;
  					break;
  					}
  				}
  			}
  		else if (token=="MM"||token=="M") {
  			month=Date._getInt(val,i_val,token.length,2);
  			if(month==null||(month<1)||(month>12)){return 0;}
  			i_val+=month.length;}
  		else if (token=="dd"||token=="d") {
  			date=Date._getInt(val,i_val,token.length,2);
  			if(date==null||(date<1)||(date>31)){return 0;}
  			i_val+=date.length;}
  		else if (token=="hh"||token=="h") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<1)||(hh>12)){return 0;}
  			i_val+=hh.length;}
  		else if (token=="HH"||token=="H") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<0)||(hh>23)){return 0;}
  			i_val+=hh.length;}
  		else if (token=="KK"||token=="K") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<0)||(hh>11)){return 0;}
  			i_val+=hh.length;}
  		else if (token=="kk"||token=="k") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<1)||(hh>24)){return 0;}
  			i_val+=hh.length;hh--;}
  		else if (token=="mm"||token=="m") {
  			mm=Date._getInt(val,i_val,token.length,2);
  			if(mm==null||(mm<0)||(mm>59)){return 0;}
  			i_val+=mm.length;}
  		else if (token=="ss"||token=="s") {
  			ss=Date._getInt(val,i_val,token.length,2);
  			if(ss==null||(ss<0)||(ss>59)){return 0;}
  			i_val+=ss.length;}
  		else if (token=="a") {
  			if (val.substring(i_val,i_val+2).toLowerCase()=="am") {ampm="AM";}
  			else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {ampm="PM";}
  			else {return 0;}
  			i_val+=2;}
  		else {
  			if (val.substring(i_val,i_val+token.length)!=token) {return 0;}
  			else {i_val+=token.length;}
  			}
  		}
  	// If there are any trailing characters left in the value, it doesn't match
  	if (i_val != val.length) { return 0; }
  	// Is date valid for month?
  	if (month==2) {
  		// Check for leap year
  		if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
  			if (date > 29){ return 0; }
  			}
  		else { if (date > 28) { return 0; } }
  		}
  	if ((month==4)||(month==6)||(month==9)||(month==11)) {
  		if (date > 30) { return 0; }
  		}
  	// Correct hours value
  	if (hh<12 && ampm=="PM") { hh=hh-0+12; }
  	else if (hh>11 && ampm=="AM") { hh-=12; }
  	var newdate=new Date(year,month-1,date,hh,mm,ss);
  	return newdate.getTime();
  },

  // ------------------------------------------------------------------
  // parseDate( date_string [, prefer_euro_format] )
  //
  // This function takes a date string and tries to match it to a
  // number of possible date formats to get the value. It will try to
  // match against the following international formats, in this order:
  // y-M-d   MMM d, y   MMM d,y   y-MMM-d   d-MMM-y  MMM d
  // M/d/y   M-d-y      M.d.y     MMM-d     M/d      M-d
  // d/M/y   d-M-y      d.M.y     d-MMM     d/M      d-M
  // 
  // Also understands: 
  // 
  // yesterday, today, tomorrow, now
  //
  // A second argument may be passed to instruct the method to search
  // for formats like d/M/y (european format) before M/d/y (American).
  // Returns a Date object or null if no patterns match.
  // ------------------------------------------------------------------
  parseDate: function(val) {
  	var preferEuro=(arguments.length==2)?arguments[1]:false;
  	generalFormats=new Array('E NNN dd HH:mm:ss UTC yyyy','y-M-d','y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','d MMM y','d.MMM.y','y MMM d','y.MMM.d');
  	monthFirst=new Array('M/d/y','M-d-y','M.d.y','MMM-d','M/d','M-d');
  	dateFirst =new Array('d/M/y','d-M-y','d.M.y','d-MMM','d/M','d-M');
  	var checkList=new Array('generalFormats',preferEuro?'dateFirst':'monthFirst',preferEuro?'monthFirst':'dateFirst');
  	var d=null;
  	
  	// first look for natural language
  	d = 0 ; var now = new Date().getTime() ;
  	switch(val.toLowerCase()) {
  	  case 'yesterday'.loc():
  	    d = now - (24*60*60*1000) ;
  	    break ;
  	  case 'today'.loc():
  	  case 'now'.loc():
  	    d = now ;
  	    break ;
  	  case 'tomorrow'.loc():
  	    d = now + (24*60*60*1000) ;
  	    break;
  	}
  	if (d>0) return new Date(d) ;
  	
  	for (var i=0; i<checkList.length; i++) {
  		var l=window[checkList[i]];
  		for (var j=0; j<l.length; j++) {
  			d=Date.getDateFromFormat(val,l[j]);
  			if (d==0) d = Date.getDateFromFormat(val,l[j] + ' H:m:s') ;
  			if (d==0) d = Date.getDateFromFormat(val,l[j] + ' h:m:s a') ;
  			if (d!=0) return new Date(d); 
  		}
  	}
  	return null;
  },
  
  // ------------------------------------------------------------------
  // Utility functions for parsing in getDateFromFormat()
  // ------------------------------------------------------------------
  _isInteger: function(val) {
  	var digits="1234567890";
  	for (var i=0; i < val.length; i++) {
  		if (digits.indexOf(val.charAt(i))==-1) { return false; }
  	}
  	return true;
  },
  
  _getInt: function(str,i,minlength,maxlength) {
  	for (var x=maxlength; x>=minlength; x--) {
  		var token=str.substring(i,i+x);
  		if (token.length < minlength) { return null; }
  		if (Date._isInteger(token)) { return token; }
  	}
  	return null;
  }

}) ;

SC.mixin(Date.prototype, {
  
  // ------------------------------------------------------------------
  // formatDate (date_object, format)
  // Returns a date in the output format specified.
  // The format string uses the same abbreviations as in getDateFromFormat()
  // 
  // ------------------------------------------------------------------
  format: function(format) {
  	format=format+"";
    var date = this ;
  	var result="";
  	var i_format=0;
  	var c="";
  	var token="";
  	var y=date.getFullYear()+"";
  	var M=date.getMonth()+1;
  	var d=date.getDate();
  	var E=date.getDay();
  	var H=date.getHours();
  	var m=date.getMinutes();
  	var s=date.getSeconds();
  	var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
  	// Convert real date parts into formatted versions
  	var value=new Object();
  	if (y.length < 4) {y=""+(y-0+1900);}
  	value["y"]=""+y;
  	value["yyyy"]=y;
  	value["yy"]=y.substring(2,4);
  	value["M"]=M;
  	value["MM"]=LZ(M);
  	value["MMM"]=MONTH_NAMES[M-1];
  	value["NNN"]=MONTH_NAMES[M+11];
  	value["d"]=d;
  	value["dd"]=LZ(d);
  	value["E"]=DAY_NAMES[E+7];
  	value["EE"]=DAY_NAMES[E];
  	value["H"]=H;
  	value["HH"]=LZ(H);
  	if (H==0){value["h"]=12;}
  	else if (H>12){value["h"]=H-12;}
  	else {value["h"]=H;}
  	value["hh"]=LZ(value["h"]);
  	if (H>11){value["K"]=H-12;} else {value["K"]=H;}
  	value["k"]=H+1;
  	value["KK"]=LZ(value["K"]);
  	value["kk"]=LZ(value["k"]);
  	if (H > 11) { value["a"]="PM"; }
  	else { value["a"]="AM"; }
  	value["m"]=m;
  	value["mm"]=LZ(m);
  	value["s"]=s;
  	value["ss"]=LZ(s);
  	while (i_format < format.length) {
  		c=format.charAt(i_format);
  		token="";
  		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
  			token += format.charAt(i_format++);
  			}
  		if (value[token] != null) { result=result + value[token]; }
  		else { result=result + token; }
  		}
  	return result;
  },
  
  utcFormat: function() { return (new Date(this.getTime() + (this.getTimezoneOffset() * 60 * 1000))).format('E NNN dd HH:mm:ss UTC yyyy'); }

}) ;

/* >>>>>>>>>> BEGIN source/system/timer.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  @class

  A Timer executes a method after a defined period of time.  Timers are 
  significantly more efficient than using setTimeout() or setInterval() 
  because they are cooperatively scheduled using the run loop.  Timers are
  also gauranteed to fire at the same time, making it far easier to keep 
  multiple timers in sync.
  
  h2. Overview
  
  Timers were created for SproutCore as a way to efficiently defer execution
  of code fragments for use in Animations, event handling, and other tasks.
  
  Browsers are typically fairly inconsistant about when they will fire a 
  timeout or interval based on what the browser is currently doing.  Timeouts 
  and intervals are also fairly expensive for a browser to execute, which 
  means if you schedule a large number of them it can quickly slow down the 
  browser considerably.
  
  Timers, on the other handle, are scheduled cooperatively using the 
  SC.RunLoop, which uses exactly one timeout to fire itself when needed and 
  then executes by timers that need to fire on its own.  This approach can
  be many timers faster than using timers and gaurantees that timers scheduled
  to execute at the same time generally will do so, keeping animations and
  other operations in sync.
  
  h2. Scheduling a Timer

  To schedule a basic timer, you can simply call SC.Timer.schedule() with 
  a target and action you wish to have invoked:
  
  {{{
    var timer = SC.Timer.schedule({ 
      target: myObject, action: 'timerFired', interval: 100 
    });
  }}}

  When this timer fires, it will call the timerFired() method on myObject.
  
  In addition to calling a method on a particular object, you can also use
  a timer to execute a variety of other types of code:
  
  - If you include an action name, but not a target object, then the action will be passed down the responder chain.
  - If you include a property path for the action property (e.g. 'MyApp.someController.someMethod'), then the method you name will be executed.
  - If you include a function in the action property, then the function will be executed.  If you also include a target object, the function will be called with this set to the target object.

  In general these properties are read-only.  Changing an interval, target,
  or action after creating a timer will have an unknown effect.

  h2. Scheduling Repeating Timers
  
  In addition to scheduling one time timers, you can also schedule timers to
  execute periodically until some termination date.  You make a timer
  repeating by adding the repeats: YES property:
  
  {{{
    var timer = SC.Timer.schedule({
      target: myObject, 
      action: 'updateAnimation', 
      interval: 100,
      repeats: YES, 
      until: Time.now() + 1000
    }) ;
  }}}
  
  The above example will execute the myObject.updateAnimation() every 100msec
  for 1 second from the current time.  
  
  If you want a timer to repeat without expiration, you can simply omit the
  until: property.  The timer will then repeat until you invalidate it.
  
  h2. Pausing and Invalidating Timers
  
  If you have created a timer but you no longer want it to execute, you can
  call the invalidate() method on it.  This will remove the timer from the 
  run loop and clear certain properties so that it will not run again.
  
  You can use the invalidate() method on both repeating and one-time timers.
  
  If you do not want to invalidate a timer completely but you just want to
  stop the timer from execution temporarily, you can alternatively set the
  isPaused property to YES:
  
  {{{
    timer.set('isPaused', YES) ;
    // Perform some critical function; timer will not execute
    timer.set('isPaused', NO) ;
  }}}
  
  When a timer is paused, it will be scheduled and will fire like normal, 
  but it will not actually execute the action method when it fires.  For a 
  one time timer, this means that if you have the timer paused when it fires,
  it may never actually execute the action method.  For repeating timers, 
  this means the timer will remain scheduled but simply will not execute its
  action while the timer is paused.
  
  h2. Firing Timers
  
  If you need a timer to execute immediately, you can always call the fire()
  method yourself.  This will execute the timer action, if the timer is not
  paused.  For a one time timer, it will also invalidate the timer and remove
  it from the run loop.  Repeating timers can be fired anytime and it will
  not interrupt their regular scheduled times.

  
  @extends SC.Object
  @author Charles Jolley
  @version 1.0
  @since version 1.0
*/
SC.Timer = SC.Object.extend(
/** @scope SC.Timer.prototype */ {

  /**
    The target object whose method will be invoked when the time fires.
    
    You can set either a target/action property or you can pass a specific
    method.
    
    @type {Object}
    @field
  */
  target: null,
  
  /**
    The action to execute.
    
    The action can be a method name, a property path, or a function.  If you
    pass a method name, it will be invoked on the target object or it will 
    be called up the responder chain if target is null.  If you pass a 
    property path and it resolves to a function then the function will be 
    called.  If you pass a function instead, then the function will be 
    called in the context of the target object.
    
    @type {String, Function}
  */
  action: null,
  
  /**
    Set if the timer should be created from a memory pool.  Normally you will
    want to leave this set, but if you plan to use bindings or observers with
    this timer, then you must set isPooled to NO to avoid reusing your timer.
    
    @property {Boolean}
  */
  isPooled: NO,
  
  /**
    The time interval in milliseconds.
    
    You generally set this when you create the timer.  If you do not set it
    then the timer will fire as soon as possible in the next run loop.
    
    @type {Number}
  */
  interval: 0,
  
  /**
    Timer start date offset.
    
    The start date determines when the timer will be scheduled.  The first
    time the timer fires will be interval milliseconds after the start 
    date. 
    
    Generally you will not set this property yourself.  Instead it will be 
    set automatically to the current run loop start date when you schedule 
    the timer.  This ensures that all timers scheduled in the same run loop
    cycle will execute in the sync with one another.
    
    The value of this property is an offset like what you get if you call
    Date.now().
    
    @type {Number}
  */
  startTime: null,
  
  /**
    YES if you want the timer to execute repeatedly.
    
    @type {Boolean}
  */
  repeats: NO,
  
  /**
    Last date when the timer will execute.
    
    If you have set repeats to YES, then you can also set this property to
    have the timer automatically stop executing past a certain date.
    
    This property should contain an offset value like startOffset.  However if
    you set it to a Date object on create, it will be converted to an offset
    for you.
    
    If this property is null, then the timer will continue to repeat until you
    call invalidate().
    
    @type {Date, Number}
  */
  until: null,
  
  /**
    Set to YES to pause the timer.
    
    Pausing a timer does not remove it from the run loop, but it will 
    temporarily suspend it from firing.  You should use this property if
    you will want the timer to fire again the future, but you want to prevent
    it from firing temporarily.
    
    If you are done with a timer, you should call invalidate() instead of 
    setting this property.
    
    @type {Boolean}
  */
  isPaused: NO,

  /**
    YES onces the timer has been scheduled for the first time.
  */
  isScheduled: NO,
  
  /**
    YES if the timer can still execute.
    
    This read only property will return YES as long as the timer may possibly
    fire again in the future.  Once a timer has become invalid, it cannot 
    become valid again. 
    
    @field
    @type {Boolean}
  */
  isValid: YES,
  
  /**
    Set to the current time when the timer last fired.  Used to find the 
    next 'frame' to execute.
  */
  lastFireTime: 0,
  
  /**
    Computed property returns the next time the timer should fire.  This 
    property resets each time the timer fires.  Returns -1 if the timer 
    cannot fire again.
    
    @property {Time}
  */
  fireTime: function() {
    if (!this.get('isValid')) return -1 ;  // not valid - can't fire
    
    // can't fire w/o startTime (set when schedule() is called).
    var start = this.get('startTime');
    if (!start || start === 0) return -1; 

    // fire interval after start.
    var interval = this.get('interval'), last = this.get('lastFireTime');
    if (last < start) last = start; // first time to fire
    
    // find the next time to fire
    var next ;
    if (this.get('repeats')) {
      if (interval === 0) { // 0 means fire as fast as possible.
        next = last ; // time to fire immediately!
        
      // find the next full interval after start from last fire time.
      } else {
        next = start + (Math.floor((last - start) / interval)+1)*interval;
      }
      
    // otherwise, fire only once interval after start
    } else next = start + interval ;
    
    // can never have a fireTime after until
    var until = this.get('until');
    if (until && until>0 && next>until) next = until;
    
    return next ;
  }.property('interval', 'startTime', 'repeats', 'until', 'isValid', 'lastFireTime').cacheable(),
  
  /**
    Schedules the timer to execute in the runloop. 
    
    This method is called automatically if you create the timer using the
    schedule() class method.  If you create the timer manually, you will
    need to call this method yourself for the timer to execute.
    
    @returns {SC.Timer} The receiver
  */
  schedule: function() {
    if (!this.get('isValid')) return this; // nothing to do
    
    this.beginPropertyChanges();
    
    // if start time was not set explicitly when the timer was created, 
    // get it from the run loop.  This way timer scheduling will always
    // occur in sync.
    if (!this.startTime) this.set('startTime', SC.RunLoop.currentRunLoop.get('startTime')) ;

    // now schedule the timer if the last fire time was < the next valid 
    // fire time.  The first time lastFireTime is 0, so this will always go.
    var next = this.get('fireTime'), last = this.get('lastFireTime');
    if (next >= last) {
      this.set('isScheduled', YES);
      SC.RunLoop.currentRunLoop.scheduleTimer(this, next);
    }
    
    this.endPropertyChanges() ;
    
    return this ;
  },
  /**
    Invalidates the timer so that it will not execute again.  If a timer has
    been scheduled, it will be removed from the run loop immediately.
    
    @returns {SC.Timer} The receiver
  */
  invalidate: function() {
    this.beginPropertyChanges();
    this.set('isValid', NO);
    SC.RunLoop.currentRunLoop.cancelTimer(this);
    this.action = this.target = null ; // avoid memory leaks
    this.endPropertyChanges();
    
    // return to pool...
    if (this.get('isPooled')) SC.Timer.returnTimerToPool(this);
    return this ;
  },
  
  /**
    Immediately fires the timer.
    
    If the timer is not-repeating, it will be invalidated.  If it is repeating
    you can call this method without interrupting its normal schedule.
    
    @returns {void}
  */
  fire: function() {

    // this will cause the fireTime to recompute
    var last = Date.now();
    this.set('lastFireTime', last);

    var next = this.get('fireTime');

    // now perform the fire action unless paused.
    if (!this.get('isPaused')) this.performAction() ;
    
     // reschedule the timer if needed...
     if (next > last) {
       this.schedule();
     } else {
       this.invalidate();
     }
  },

  /**
    Actually fires the action. You can override this method if you need
    to change how the timer fires its action.
  */
  performAction: function() {
    var typeOfAction = SC.typeOf(this.action);
    
    // if the action is a function, just try to call it.
    if (typeOfAction == SC.T_FUNCTION) {
      this.action.call((this.target || this), this) ;

    // otherwise, action should be a string.  If it has a period, treat it
    // like a property path.
    } else if (typeOfAction === SC.T_STRING) {
      if (this.action.indexOf('.') >= 0) {
        var path = this.action.split('.') ;
        var property = path.pop() ;

        var target = SC.objectForPropertyPath(path, window) ;
        var action = target.get ? target.get(property) : target[property];
        if (action && SC.typeOf(action) == SC.T_FUNCTION) {
          action.call(target, this) ;
        } else {
          throw '%@: Timer could not find a function at %@'.fmt(this, this.action) ;
        }

      // otherwise, try to execute action direction on target or send down
      // responder chain.
      } else {
        SC.RootResponder.responder.sendAction(this.action, this.target, this);
      }
    }
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    // convert startTime and until to times if they are dates.
    if (this.startTime instanceof Date) {
      this.startTime = this.startTime.getTime() ;
    }
    
    if (this.until instanceof Date) {
      this.until = this.until.getTime() ;
    }
  },
  
  /** @private - Default values to reset reused timers to. */
  RESET_DEFAULTS: {
    target: null, action: null, 
    isPooled: NO, isPaused: NO, isScheduled: NO, isValid: YES,
    interval: 0, repeats: NO, until: null,
    startTime: null, lastFireTime: 0
  },
  
  /** 
    Resets the timer settings with the new settings.  This is the method 
    called by the Timer pool when a timer is reused.  You will not normally
    call this method yourself, though you could override it if you need to 
    reset additonal properties when a timer is reused.
    
    @params {Hash} props properties to copy over
    @returns {SC.Timer} receiver
  */
  reset: function(props) {
    if (!props) props = SC.EMPTY_HASH;
    
    // note: we copy these properties manually just to make them fast.  we 
    // don't expect you to use observers on a timer object if you are using 
    // pooling anyway so this won't matter.  Still notify of property change
    // on fireTime to clear its cache.
    this.propertyWillChange('fireTime');
    var defaults = this.RESET_DEFAULTS ;
    for(var key in defaults) {
      if (!defaults.hasOwnProperty(key)) continue ; 
      this[key] = SC.none(props[key]) ? defaults[key] : props[key];
    }
    this.propertyDidChange('fireTime');
    return this ;
  },
    
  // ..........................................................
  // TIMER QUEUE SUPPORT
  // 

  /** @private - removes the timer from its current timerQueue if needed. 
    return value is the new "root" timer.
  */
  removeFromTimerQueue: function(timerQueueRoot) {
    var prev = this._timerQueuePrevious, next = this._timerQueueNext ;

    if (!prev && !next && timerQueueRoot !== this) return timerQueueRoot ; // not in a queue...

    // else, patch up to remove...
    if (prev) prev._timerQueueNext = next ;
    if (next) next._timerQueuePrevious = prev ;
    this._timerQueuePrevious = this._timerQueueNext = null ;
    return (timerQueueRoot === this) ? next : timerQueueRoot ;
  },
  
  /** @private - schedules the timer in the queue based on the runtime. */
  scheduleInTimerQueue: function(timerQueueRoot, runTime) {
    this._timerQueueRunTime = runTime ;
    
    // find the place to begin
    var beforeNode = timerQueueRoot;
    var afterNode = null ;
    while(beforeNode && beforeNode._timerQueueRunTime < runTime) {
      afterNode = beforeNode ;
      beforeNode = beforeNode._timerQueueNext;
    }

    if (afterNode) {
      afterNode._timerQueueNext = this ;
      this._timerQueuePrevious = afterNode ;
    }
    
    if (beforeNode) {
      beforeNode._timerQueuePrevious = this ;
      this._timerQueueNext = beforeNode ;
    }
    
    // I am the new root if beforeNode === root
    return (beforeNode === timerQueueRoot) ? this : timerQueueRoot ;
  },
  
  /** @private 
    adds the receiver to the passed array of expired timers based on the 
    current time and then recursively calls the next timer.  Returns the
    first timer that is not expired.  This is faster than iterating through
    the timers because it does some faster cleanup of the nodes.
  */
  collectExpiredTimers: function(timers, now) {
    if (this._timerQueueRunTime > now) return this ; // not expired!
    timers.push(this);  // add to queue.. fixup next. assume we are root.
    var next = this._timerQueueNext ;
    this._timerQueueNext = null;
    if (next) next._timerQueuePrevious = null;
    return next ? next.collectExpiredTimers(timers, now) : null; 
  }
  
}) ;

/** @scope SC.Timer */

/*  
  Created a new timer with the passed properties and schedules it to 
  execute.  This is the same as calling SC.Time.create({ props }).schedule().
  
  Note that unless you explicitly set isPooled to NO, this timer will be 
  pulled from a shared memory pool of timers.  You cannot using bindings or
  observers on these timers as they may be reused for future timers at any
  time.
  
  @params {Hash} props Any properties you want to set on the timer.
  @returns {SC.Timer} new timer instance.
*/
SC.Timer.schedule = function(props) {
  // get the timer.
  var timer ;
  if (!props || SC.none(props.isPooled) || props.isPooled) {
    timer = this.timerFromPool(props);
  } else timer = this.create(props);
  return timer.schedule();
} ;

/**
  Returns a new timer from the timer pool, copying the passed properties onto
  the timer instance.  If the timer pool is currently empty, this will return
  a new instance.
*/
SC.Timer.timerFromPool = function(props) {
  var timers = this._timerPool;
  if (!timers) timers = this._timerPool = [] ;
  var timer = timers.pop();
  if (!timer) timer = this.create();
  return timer.reset(props) ;
};

/** 
  Returns a timer instance to the timer pool for later use.  This is done
  automatically when a timer is invalidated if isPooled is YES.
*/
SC.Timer.returnTimerToPool = function(timer) {
  if (!this._timerPool) this._timerPool = [];

  this._timerPool.push(timer);
  return this ;
};



/* >>>>>>>>>> BEGIN source/system/user_defaults.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals ie7userdata openDatabase*/
/**
  @class
  
  The UserDefaults object provides an easy way to store user preferences in
  your application on the local machine.  You use this by providing built-in
  defaults using the SC.userDefaults.defaults() method.  You can also
  implement the UserDefaultsDelegate interface to be notified whenever a
  default is required.  
  
  You should also set the userDomain property on the defaults on page load.
  This will allow the UserDefaults application to store/fetch keys from 
  localStorage for the correct user.
  
  You can also set an appDomain property if you want.  This will be 
  automatically prepended to key names with no slashes in them.
  
  SC.userDefaults.getPath("global:contactInfo.userName");
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.UserDefaults = SC.Object.extend(/** @scope SC.UserDefaults.prototype */ {
  
  ready: NO,
  
  /** 
    the default domain for the user.  This will be used to store keys in
    local storage.  If you do not set this property, the wrong values may be
    returned.
  */
  userDomain: null,
  
  /**
    The default app domain for the user.  Any keys that do not include a 
    slash will be prefixed with this app domain key when getting/setting.
  */
  appDomain: null,
  
  /** @private
    Defaults.  These will be used if not defined on localStorage.
  */
  _defaults: null,
  
  _safari3DB: null,
  
  /**
    Invoke this method to set the builtin defaults.  This will cause all
    properties to change.
  */
  defaults: function(newDefaults) {
    this._defaults = newDefaults ;
    this.allPropertiesDidChange();
  },
  
  /**
    Attempts to read a user default from local storage.  If not found on 
    localStorage, use the the local defaults, if defined.  If the key passed
    does not include a slash, then add the appDomain or use "app/".
    
    @param {String} keyName
    @returns {Object} read value
  */
  readDefault: function(keyName) {
    var ret= undefined, userKeyName, localStorage, key, del, storageSafari3;
    // namespace keyname
    keyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(keyName);

    // look into recently written values
    if (this._written) ret = this._written[userKeyName];
    
    // attempt to read from localStorage
    
    if(SC.browser.msie=="7.0"){
      localStorage=document.body;
      try{
        localStorage.load("SC.UserDefaults");
      }catch(e){
        console.err("Couldn't load userDefaults in IE7: "+e.description);
      }
    }else if(this.HTML5DB_noLocalStorage){
      storageSafari3 = this._safari3DB;
    }else{
      localStorage = window.localStorage ;
      if (!localStorage && window.globalStorage) {
        localStorage = window.globalStorage[window.location.hostname];
      }
    }
    if (localStorage || storageSafari3) {
      key=["SC.UserDefaults",userKeyName].join('-at-');
      if(SC.browser.msie=="7.0"){
        ret=localStorage.getAttribute(key.replace(/\W/gi, ''));        
      }else if(storageSafari3){
        ret = this.dataHash[key];
        
      }else{
        ret = localStorage[key];
      }
      if (!SC.none(ret)) {
        try {
          ret = SC.json.decode(ret);
        } 
        catch(ex) {
          ret = undefined;
        }
      } else ret = undefined;
    }
    
    // if not found in localStorage, try to notify delegate
    del =this.delegate ;
    if (del && del.userDefaultsNeedsDefault) {
      ret = del.userDefaultsNeedsDefault(this, keyName, userKeyName);
    }
    
    // if not found in localStorage or delegate, try to find in defaults
    if ((ret===undefined) && this._defaults) {
      ret = this._defaults[userKeyName] || this._defaults[keyName];
    }
    
    return ret ;
  },
  
  /**
    Attempts to write the user default to local storage or at least saves them
    for now.  Also notifies that the value has changed.
    
    @param {String} keyName
    @param {Object} value
    @returns {SC.UserDefault} receiver
  */
  writeDefault: function(keyName, value) {
    var userKeyName, written, localStorage, key, del, storageSafari3;
    
    keyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(keyName);
    
    // save to local hash
    written = this._written ;
    if (!written) written = this._written = {};
    written[userKeyName] = value ;
    
    // save to local storage
    
    if(SC.browser.msie=="7.0"){
      localStorage=document.body;
    }else if(this.HTML5DB_noLocalStorage){
      storageSafari3 = this._safari3DB;
    }else{
       localStorage = window.localStorage ;
       if (!localStorage && window.globalStorage) {
         localStorage = window.globalStorage[window.location.hostname];
       }
    }
    key=["SC.UserDefaults",userKeyName].join('-at-');
    if (localStorage || storageSafari3) {
      var encodedValue = SC.json.encode(value);
      if(SC.browser.msie=="7.0"){
        localStorage.setAttribute(key.replace(/\W/gi, ''), encodedValue);
        localStorage.save("SC.UserDefaults");
      }else if(storageSafari3){
        var obj = this;
        storageSafari3.transaction(
          function (t) {
            t.executeSql("delete from SCLocalStorage where key = ?", [key], 
              function (){
                t.executeSql("insert into SCLocalStorage(key, value)"+
                            " VALUES ('"+key+"', '"+encodedValue+"');", 
                            [], obj._nullDataHandler, obj.killTransaction
                );
              }
            );
          }
        );
        this.dataHash[key] = encodedValue;
      }else{
        try{
          localStorage[key] = encodedValue;
        }catch(e){
          console.error("Failed using localStorage. "+e);
        }
      }
    }
    
    // also notify delegate
    del = this.delegate;
    if (del && del.userDefaultsDidChange) {
      del.userDefaultsDidChange(this, keyName, value, userKeyName);
    }
    
    return this ;
  },
  
  /**
    Removed the passed keyName from the written hash and local storage.
    
    @param {String} keyName
    @returns {SC.UserDefaults} receiver
  */
  resetDefault: function(keyName) {  
    var fullKeyName, userKeyName, written, localStorage, key, storageSafari3;
    fullKeyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(fullKeyName);
    
    this.propertyWillChange(keyName);
    this.propertyWillChange(fullKeyName);
    
    written = this._written;
    if (written) delete written[userKeyName];
    
    if(SC.browser.msie=="7.0"){
       localStorage=document.body;
    }else if(this.HTML5DB_noLocalStorage){
         storageSafari3 = this._safari3DB;
    }else{
       localStorage = window.localStorage ;
       if (!localStorage && window.globalStorage) {
         localStorage = window.globalStorage[window.location.hostname];
       }
    }

    key=["SC.UserDefaults",userKeyName].join('-at-');

    if (localStorage) {
      if(SC.browser.msie=="7.0"){
        localStorage.setAttribute(key.replace(/\W/gi, ''), null);
        localStorage.save("SC.UserDefaults");
      } else if(storageSafari3){
        var obj = this;
        storageSafari3.transaction(
          function (t) {
            t.executeSql("delete from SCLocalStorage where key = ?", [key], null);
          }
        );
        delete this.dataHash[key];
      }else{
        delete localStorage[key];
      }
    }
    

    this.propertyDidChange(keyName);
    this.propertyDidChange(fullKeyName);
    return this ;
  },
  
  /**
    Is called whenever you .get() or .set() values on this object
    
    @param {Object} key
    @param {Object} value
    @returns {Object}
  */
  unknownProperty: function(key, value) {
    if (value === undefined) {
      return this.readDefault(key) ;
    } else {
      this.writeDefault(key, value);
      return value ;
    }
  },
  
  /**
    Normalize the passed key name.  Used by all accessors to automatically 
    insert an appName if needed.
  */
  _normalizeKeyName: function(keyName) {
    if (keyName.indexOf(':')<0) {
      var domain = this.get('appDomain') || 'app';
      keyName = [domain, keyName].join(':');
    } 
    return keyName;
  },
  
  /** 
    Builds a user key name from the passed key name
  */
  _userKeyName: function(keyName) {
    var user = this.get('userDomain') || '(anonymous)' ;
    return [user,keyName].join('-at-');
  },
  
  _domainDidChange: function() {
    var didChange = NO;
    if (this.get("userDomain") !== this._scud_userDomain) {
      this._scud_userDomain = this.get('userDomain');
      didChange = YES;
    }
    
    if (this.get('appDomain') !== this._scud_appDomain) {
      this._scud_appDomain = this.get('appDomain');
      didChange = YES;
    }
    
    if (didChange) this.allPropertiesDidChange();
  }.observes('userDomain', 'appDomain'),
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    if(SC.userDefaults && SC.userDefaults.get('dataHash')){
      var dh = SC.userDefaults.get('dataHash');
      if (dh) this.dataHash=SC.userDefaults.get('dataHash')
    }
    this._scud_userDomain = this.get('userDomain');
    this._scud_appDomain  = this.get('appDomain');
    if(SC.browser.msie=="7.0"){
      //Add user behavior userData. This works in all versions of IE.
      //Adding to the body as is the only element never removed.
      document.body.addBehavior('#default#userData');
    }
    this.HTML5DB_noLocalStorage = ((parseInt(SC.browser.safari, 0)>523) && (parseInt(SC.browser.safari, 0)<528));
    if(this.HTML5DB_noLocalStorage){
      var myDB;
      try {
        if (!window.openDatabase) {
          console.error("Trying to load a database with safari version 3.1 "+
                  "to get SC.UserDefaults to work. You are either in a"+
                  " previous version or there is a problem with your browser.");
          return;
        } else {
          var shortName = 'scdb',
              version = '1.0',
              displayName = 'SproutCore database',
              maxSize = 65536; // in bytes,
          myDB = openDatabase(shortName, version, displayName, maxSize);
    
          // You should have a database instance in myDB.
    
        }
      } catch(e) {
        console.error("Trying to load a database with safari version 3.1 "+
                "to get SC.UserDefaults to work. You are either in a"+
                " previous version or there is a problem with your browser.");
        return;
      }
    
      if(myDB){
        var obj = this;
        myDB.transaction(
          function (transaction) {
            transaction.executeSql('CREATE TABLE IF NOT EXISTS SCLocalStorage'+
              '(key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL);', 
              [], obj._nullDataHandler, obj.killTransaction);
          }
        );
        myDB.transaction(
          function (transaction) {
            
            transaction.parent = obj;
            transaction.executeSql('SELECT * from SCLocalStorage;', 
                [], function(transaction, results){
                  var hash={}, row;
                  for(var i=0, iLen=results.rows.length; i<iLen; i++){
                    row=results.rows.item(i);
                    hash[row['key']]=row['value'];
                  }
                  transaction.parent.dataHash = hash;
                  SC.run(function() { SC.userDefaults.set('ready', YES); });
                }, obj.killTransaction);
          }
        );
        this._safari3DB=myDB;
      }
    }else{
      this.set('ready', YES);
    }
  },


  //Private methods to use if user defaults uses the database in safari 3
  _killTransaction: function(transaction, error){
    return true; // fatal transaction error
  },

  _nullDataHandler: function(transaction, results){},
        
  readyCallback: function(ob, func){
    this.func = func;
    this.ob = ob;
  },
  
  readyChanged: function(){
    if(this.ready===YES){
      var f = this.func;
      if(f) f.apply(this.ob);
    }
  }.observes('ready')  
});

/** global user defaults. */
SC.userDefaults = SC.UserDefaults.create();

/* >>>>>>>>>> BEGIN source/system/utils.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// These are helpful utility functions for calculating range and rect values
sc_require('system/browser');

SC.mixin( /** @scope SC */ {

  _downloadFrames: 0, // count of download frames inserted into document
  
  _copy_computed_props: [
    "maxWidth", "maxHeight", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
    "fontFamily", "fontSize", "fontStyle", "fontWeight", "fontVariant", "lineHeight",
    "whiteSpace"
  ],
  
  /**
    Starts a download of the file at the named path.
    
    Use this method when you want to cause a file to be downloaded to a users
    desktop instead of having it display in the web browser.  Note that your
    server must return a header indicating that the file  is intended for 
    download also.
  */
  download: function(path) {
    var tempDLIFrame=document.createElement('iframe'),
        frameId = 'DownloadFrame_' + this._downloadFrames;
    SC.$(tempDLIFrame).attr('id',frameId);
    tempDLIFrame.style.border='10px';
    tempDLIFrame.style.width='0px';
    tempDLIFrame.style.height='0px';
    tempDLIFrame.style.position='absolute';
    tempDLIFrame.style.top='-10000px';
    tempDLIFrame.style.left='-10000px';    
    // Don't set the iFrame content yet if this is Safari
    if (!SC.browser.isSafari) {
      SC.$(tempDLIFrame).attr('src',path);
    }
    document.getElementsByTagName('body')[0].appendChild(tempDLIFrame);
    if (SC.browser.isSafari) {
      SC.$(tempDLIFrame).attr('src',path);    
    }
    this._downloadFrames = this._downloadFrames + 1;
    if (!SC.browser.isSafari) {
      var r = function() { 
        document.body.removeChild(document.getElementById(frameId)); 
        frameId = null;
      } ;
      r.invokeLater(null, 2000);
    }
    //remove possible IE7 leak
    tempDLIFrame = null;
  },

  /**
    Takes a URL of any type and normalizes it into a fully qualified URL with
    hostname.  For example:
    
    {{{
      "some/path" => "http://localhost:4020/some/path" 
      "/some/path" => "http://localhost:4020/some/path"
      "http://localhost:4020/some/path" => "http://localhost:4020/some/path"
    }}}
    
    @param url {String} the URL
    @returns {String} the normalized URL
  */
  normalizeURL: function(url) {
    if (url.slice(0,1) == '/') {
      url = window.location.protocol + '//' + window.location.host + url ;
    } else if ((url.slice(0,5) == 'http:') || (url.slice(0,6) == 'https:')) {
      // no change
    } else {
      url = window.location.href + '/' + url ;
    }
    return url ;
  },
  
  /** Return true if the number is between 0 and 1 */
  isPercentage: function(val){
    return (val<1 && val>0);
  },

  
  
  /** Return the left edge of the frame */
  minX: function(frame) { 
    return frame.x || 0; 
  },
  
  /** Return the right edge of the frame. */
  maxX: function(frame) { 
    return (frame.x || 0) + (frame.width || 0); 
  },
  
  /** Return the midpoint of the frame. */
  midX: function(frame) {
    return (frame.x || 0) + ((frame.width || 0) / 2) ;
  },
  
  /** Return the top edge of the frame */
  minY: function(frame) {
    return frame.y || 0 ;
  },
  
  /** Return the bottom edge of the frame */
  maxY: function(frame) {
    return (frame.y || 0) + (frame.height || 0) ;
  },
  
  /** Return the midpoint of the frame */
  midY: function(frame) {
    return (frame.y || 0) + ((frame.height || 0) / 2) ;
  },
  
  /** Returns the point that will center the frame X within the passed frame. */
  centerX: function(innerFrame, outerFrame) {
    return (outerFrame.width - innerFrame.width) / 2 ;
  },
  
  /** Return the point that will center the frame Y within the passed frame. */
  centerY: function(innerFrame, outerFrame) {
    return (outerFrame.height - innerFrame.height) /2  ;
  },
  
  /** Check if the given point is inside the rect. */
  pointInRect: function(point, f) {
    return  (point.x >= SC.minX(f)) &&
            (point.y >= SC.minY(f)) &&
            (point.x <= SC.maxX(f)) && 
            (point.y <= SC.maxY(f)) ;
  },
  
  /** Return true if the two frames match.  You can also pass only points or sizes.
  
    @param r1 {Rect} the first rect
    @param r2 {Rect} the second rect
    @param delta {Float} an optional delta that allows for rects that do not match exactly. Defaults to 0.1
    @returns {Boolean} true if rects match
   */
  rectsEqual: function(r1, r2, delta) {
    if (!r1 || !r2) return (r1 == r2) ;
    if (!delta && delta !== 0) delta = 0.1;
    if ((r1.y != r2.y) && (Math.abs(r1.y - r2.y) > delta)) return NO ; 
    if ((r1.x != r2.x) && (Math.abs(r1.x - r2.x) > delta)) return NO ; 
    if ((r1.width != r2.width) && (Math.abs(r1.width - r2.width) > delta)) return NO ; 
    if ((r1.height != r2.height) && (Math.abs(r1.height - r2.height) > delta)) return NO ; 
    return YES ;
  },
  
  /** Returns the insersection between two rectangles. 
  
    @param r1 {Rect} The first rect
    @param r2 {Rect} the second rect
    @returns {Rect} the intersection rect.  width || height will be 0 if they do not interset.
  */
  intersectRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.max(SC.minX(r1), SC.minX(r2)),
      y: Math.max(SC.minY(r1), SC.minY(r2)),
      width: Math.min(SC.maxX(r1), SC.maxX(r2)),
      height: Math.min(SC.maxY(r1), SC.maxY(r2))
    } ;
    
    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },
  
  /** Returns the union between two rectangles
  
    @param r1 {Rect} The first rect
    @param r2 {Rect} The second rect
    @returns {Rect} The union rect.
  */
  unionRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.min(SC.minX(r1), SC.minX(r2)),
      y: Math.min(SC.minY(r1), SC.minY(r2)),
      width: Math.max(SC.maxX(r1), SC.maxX(r2)),
      height: Math.max(SC.maxY(r1), SC.maxY(r2))
    } ;
    
    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },
  
  /** Duplicates the passed rect.  
  
    This is faster than Object.clone(). 
    
    @param r {Rect} The rect to clone.
    @returns {Rect} The cloned rect
  */
  cloneRect: function(r) {
    return { x: r.x, y: r.y, width: r.width, height: r.height } ;
  },
  
  /** Returns a string representation of the rect as {x, y, width, height}.  
    
    @param r {Rect} The rect to stringify.
    @returns {String} A string representation of the rect.
  */
  stringFromRect: function(r) {
    if (!r) {
      return "(null)";
    }
    else {
      return '{x:'+r.x+', y:'+r.y+', width:'+r.width+', height:'+r.height+'}';
    }
  },
  
  /**
    Returns a string representation of the layout hash.

    Layouts can contain the following keys:
      - left: the left edge
      - top: the top edge
      - right: the right edge
      - bottom: the bottom edge
      - height: the height
      - width: the width
      - centerX: an offset from center X 
      - centerY: an offset from center Y
      - minWidth: a minimum width
      - minHeight: a minimum height
      - maxWidth: a maximum width
      - maxHeight: a maximum height
    
    @param layout {Hash} The layout hash to stringify.
    @returns {String} A string representation of the layout hash.
  */
  stringFromLayout: function(layout) {
    // Put them in the reverse order that we want to display them, because
    // iterating in reverse is faster for CPUs that can compare against zero
    // quickly.
    var keys = ['maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'centerY',
                'centerX', 'width', 'height', 'bottom', 'right', 'top',
                'left'],
        keyValues = [], key,
        i = keys.length;
    while (--i >= 0) {
      key = keys[i];
      if (layout.hasOwnProperty(key)) {
        keyValues.push(key + ':' + layout[key]);
      }
    }
    
    return '{' + keyValues.join(', ') + '}';
  },
  
  /**
    Given a string and a fixed width, calculates the height of that
    block of text using a style string, a set of class names,
    or both.

    @param str {String} The text to calculate
    @param width {Number} The fixed width to assume the text will fill
    @param style {String} A CSS style declaration.  E.g., 'font-weight: bold'
    @param classNames {Array} An array of class names that may affect the style
    @param ignoreEscape {Boolean} To NOT html escape the string.
    @returns {Number} The height of the text given the passed parameters
  */
  heightForString: function(str, width, style, classNames, ignoreEscape) {
    var elem = this._heightCalcElement, classes, height;
    
    if(!ignoreEscape) str = SC.RenderContext.escapeHTML(str);
    
    // Coalesce the array of class names to one string, if the array exists
    classes = (classNames && SC.typeOf(classNames) === SC.T_ARRAY) ? classNames.join(' ') : '';
    
    if (!width) width = 100; // default to 100 pixels

    // Only create the offscreen element once, then cache it
    if (!elem) {
      elem = this._heightCalcElement = document.createElement('div');
      document.body.insertBefore(elem, null);
    }

    style = style+'; width: '+width+'px; left: '+(-1*width)+'px; position: absolute';
    var cqElem = SC.$(elem);
    cqElem.attr('style', style);

    if (classes !== '') {
      cqElem.attr('class', classes);
    }

    elem.innerHTML = str;
    height = elem.clientHeight;

    elem = null; // don't leak memory
    return height;
  },
  
  /**
    Sets up a string measuring environment.
  
    You may want to use this, in conjunction with teardownStringMeasurement and
    measureString, instead of metricsForString, if you will be measuring many 
    strings with the same settings. It would be a lot more efficient, as it 
    would only prepare and teardown once instead of several times.
  
    @param exampleElement The example element to grab styles from, or the style 
                          string to use.
    @param classNames {String} (Optional) Class names to add to the test element.
  */
  prepareStringMeasurement: function(exampleElement, classNames) {
    var element = this._metricsCalculationElement, classes, styles, style,
        cqElem;
    
    // collect the class names
    classes = SC.A(classNames).join(' ');
    
    // get the calculation element
    if (!element) {
      element = this._metricsCalculationElement = document.createElement("div");
      document.body.insertBefore(element, null);
    }

    cqElem = SC.$(element);    
    // two possibilities: example element or type string
    if (SC.typeOf(exampleElement) != SC.T_STRING) {
      var computed = null;
      if (document.defaultView && document.defaultView.getComputedStyle) {
        computed = document.defaultView.getComputedStyle(exampleElement, null);
      } else {
        computed = exampleElement.currentStyle;
      }
      
      // set (lovely cssText property here helps a lot—if it works. Unfortunately, only Safari supplies it.)
      style = computed.cssText;
      

      // if that didn't work (Safari-only?) go alternate route. This is SLOW code...
      if (!style || style.trim() === "") {
        // there is only one way to do it...
        var props = this._copy_computed_props;
        
        // firefox ONLY allows this method
        for (var i = 0; i < props.length; i++) {
          var prop = props[i], val = computed[prop];
          element.style[prop] = val;
        }
        
        // and why does firefox specifically need "font" set?
        var cs = element.style; // cached style
        if (cs.font === "") {
          var font = "";
          if (cs.fontStyle) font += cs.fontStyle + " ";
          if (cs.fontVariant) font += cs.fontVariant + " ";
          if (cs.fontWeight) font += cs.fontWeight + " ";
          if (cs.fontSize) font += cs.fontSize; else font += "10px"; //force a default
          if (cs.lineHeight) font += "/" + cs.lineHeight;
          font += " ";
          if (cs.fontFamily) font += cs.fontFamily; else cs += "sans-serif";
          
          element.style.font = font;
        }
        
        SC.mixin(element.style, {
          left: "0px", top: "0px", position: "absolute", bottom: "auto", right: "auto", width: "auto", height: "auto"
        });
      }
      else
      {
        // set style
        cqElem.attr("style", style + "; position:absolute; left: 0px; top: 0px; bottom: auto; right: auto; width: auto; height: auto;");
      }
      
      // clean up
      computed = null;
    } else {
      // it is a style string already
      style = exampleElement;
      
      // set style
      cqElem.attr("style", style + "; position:absolute; left: 0px; top: 0px; bottom: auto; right: auto; width: auto; height: auto;");
    }
    
    element.className = classes;
    element = null;
  },
  
  /**
    Tears down the string measurement environment. Usually, this doesn't _have_
    to be called, but there are too many what ifs: for example, what if the measurement
    environment has a bright green background and is over 10,000px wide? Guess what: it will
    become visible on the screen.
  
    So, generally, we tear the measurement environment down so that it doesn't cause issue.
    However, we keep the DOM element for efficiency.
  */
  teardownStringMeasurement: function() {
    var element = this._metricsCalculationElement;
    
    // clear element
    element.innerHTML = "";
    element.className = "";
    element.setAttribute("style", ""); // get rid of any junk from computed style.
    element = null;
  },
  
  /**
    Measures a string in the prepared environment.
  
    An easier and simpler alternative (but less efficient for bulk measuring) is metricsForString.
  
    @param string {String} The string to measure.
    @param ignoreEscape {Boolean} To NOT html escape the string.
  */
  measureString: function(string, ignoreEscape) {
    if(!ignoreEscape) string = SC.RenderContext.escapeHTML(string);
    
    var element = this._metricsCalculationElement;
    if (!element) {
      throw "measureString requires a string measurement environment to be set up. Did you mean metricsForString?";
    }
    
    // the conclusion of which to use (innerText or textContent) should be cached
    if (typeof element.innerText != "undefined") element.innerText = string;
    else element.textContent = string;
    
    // generate result
    var result = {
      width: element.clientWidth,
      height: element.clientHeight
    };
    
    element = null;
    return result;
  },
  
  /**
    Given a string and an example element or style string, and an optional
    set of class names, calculates the width and height of that block of text.
  
    To constrain the width, set max-width on the exampleElement or in the style string.
  
    @param string {String} The string to measure.
    @param exampleElement The example element to grab styles from, or the style string to use.
    @param classNames {String} (Optional) Class names to add to the test element.
    @param ignoreEscape {Boolean} To NOT html escape the string.
  */
  metricsForString: function(string, exampleElement, classNames, ignoreEscape) {
    if(!ignoreEscape) string = SC.RenderContext.escapeHTML(string);
    
    SC.prepareStringMeasurement(exampleElement, classNames);
    var result = SC.measureString(string);
    SC.teardownStringMeasurement();
    return result;
  },

  /** Finds the absolute viewportOffset for a given element.
    This method is more accurate than the version provided by prototype.
    
    If you pass NULL to this method, it will return a { x:0, y:0 }
    @param el The DOM element
    @returns {Point} A hash with x,y offsets.
  */
  viewportOffset: function(el) {
    // Some browsers natively implement getBoundingClientRect, so if it's
    // available we'll use it for speed.
    if (el.getBoundingClientRect) {
      var boundingRect = el.getBoundingClientRect();
      return { x:boundingRect.left, y:boundingRect.top };
    }
    
    var valueL = 0, valueT = 0, cqElement, overflow, left, top, offsetParent,
        element = el, isFirefox3 = SC.browser.mozilla >= 3 ;
    // add up all the offsets for the element.
   
    while (element) {
      cqElement = SC.$(element);
      valueT += (element.offsetTop  || 0);
      if (!isFirefox3 || (element !== el)) {
        valueT += (element.clientTop  || 0);
      }

      valueL += (element.offsetLeft || 0);
      if (!isFirefox3 || (element !== el)) {
        valueL += (element.clientLeft || 0);
      }

      // bizarely for FireFox if your offsetParent has a border, then it can 
      // impact the offset. 
      if (SC.browser.mozilla) {
        overflow = cqElement.attr('overflow') ;
        if (overflow !== 'visible') {
          left = parseInt(cqElement.attr('borderLeftWidth'),0) || 0 ;
          top = parseInt(cqElement.attr('borderTopWidth'),0) || 0 ;
          if (el !== element) {
            left *= 2; top *= 2 ;
          }
          valueL += left; valueT += top ;
        }
        
        // In FireFox 3 -- the offsetTop/offsetLeft subtracts the clientTop/
        // clientLeft of the offset parent.
        offsetParent = element.offsetParent ;
        if (SC.browser.mozilla.match(/1[.]9/) && offsetParent) {
          valueT -= offsetParent.clientTop ;
          valueL -= offsetParent.clientLeft;
        }
      }

      // Safari fix
      if (element.offsetParent == document.body &&
        cqElement.attr('position') === 'absolute') break;

      element = element.offsetParent ;

    }

    element = el;
    while (element) {
      if (!SC.browser.isOpera || element.tagName === 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
      
      element = element.parentNode ;
    }

    return { x: valueL, y: valueT } ;
  },
  
  /** A Point at {0,0} */
  ZERO_POINT: { x: 0, y: 0 },
  
  /** A zero length range at zero. */
  ZERO_RANGE: { start: 0, length: 0 },

  RANGE_NOT_FOUND: { start: 0, length: -1 },
  
  /** Returns true if the passed index is in the specified range */
  valueInRange: function(value, range) {
    return (value >= 0) && (value >= range.start) && (value < (range.start + range.length));  
  },
  
  /** Returns first value of the range. */
  minRange: function(range) { return range.start; },
  
  /** Returns the first value outside of the range. */
  maxRange: function(range) { return (range.length < 0) ? -1 : (range.start + range.length); },
  
  /** Returns the union of two ranges.  If one range is null, the other
   range will be returned.  */
  unionRanges: function(r1, r2) { 
    if ((r1 == null) || (r1.length < 0)) return r2 ;
    if ((r2 == null) || (r2.length < 0)) return r1 ;
    
    var min = Math.min(r1.start, r2.start),
        max = Math.max(SC.maxRange(r1), SC.maxRange(r2)) ;
    return { start: min, length: max - min } ;
  },
  
  /** Returns the intersection of the two ranges or SC.RANGE_NOT_FOUND */
  intersectRanges: function(r1, r2) {
    if ((r1 == null) || (r2 == null)) return SC.RANGE_NOT_FOUND ;
    if ((r1.length < 0) || (r2.length < 0)) return SC.RANGE_NOT_FOUND;
    var min = Math.max(SC.minRange(r1), SC.minRange(r2)),
        max = Math.min(SC.maxRange(r1), SC.maxRange(r2)) ;
    if (max < min) return SC.RANGE_NOT_FOUND ;
    return { start: min, length: max-min };
  },
  
  /** Returns the difference of the two ranges or SC.RANGE_NOT_FOUND */
  subtractRanges: function(r1, r2) {
    if ((r1 == null) || (r2 == null)) return SC.RANGE_NOT_FOUND ;
    if ((r1.length < 0) || (r2.length < 0)) return SC.RANGE_NOT_FOUND;
    var max = Math.max(SC.minRange(r1), SC.minRange(r2)),
        min = Math.min(SC.maxRange(r1), SC.maxRange(r2)) ;
    if (max < min) return SC.RANGE_NOT_FOUND ;
    return { start: min, length: max-min };
  },
  
  /** Returns a clone of the range. */
  cloneRange: function(r) { 
    return { start: r.start, length: r.length }; 
  },
  
  /** Returns true if the two passed ranges are equal.  A null value is
    treated like RANGE_NOT_FOUND.
  */
  rangesEqual: function(r1, r2) {
    if (r1===r2) return true ;
    if (r1 == null) return r2.length < 0 ;
    if (r2 == null) return r1.length < 0 ;
    return (r1.start == r2.start) && (r1.length == r2.length) ;
  },

  /** Returns hex color from hsv value */
  convertHsvToHex: function (h, s, v) {
    var r = 0, g = 0, b = 0;

    if (v > 0) {
      var i = (h == 1) ? 0 : Math.floor(h * 6),
          f = (h == 1) ? 0 : (h * 6) - i,
          p = v * (1 - s),
          q = v * (1 - (s * f)),
          t = v * (1 - (s * (1 - f))),
          rgb = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]];
      r = Math.round(255 * rgb[i][0]);
      g = Math.round(255 * rgb[i][1]);
      b = Math.round(255 * rgb[i][2]);
    }
    return this.parseColor('rgb(' + r + ',' + g + ',' + b + ')');
  },  

  /** Returns hsv color from hex value */
  convertHexToHsv: function (hex) {
    var rgb = this.expandColor(hex),
        max = Math.max(Math.max(rgb[0], rgb[1]), rgb[2]),
        min = Math.min(Math.min(rgb[0], rgb[1]), rgb[2]),
        s = (max === 0) ? 0 : (1 - min/max),
        v = max/255,
        h = (max == min) ? 0 : ((max == rgb[0]) ? ((rgb[1]-rgb[2])/(max-min)/6) : ((max == rgb[1]) ? ((rgb[2]-rgb[0])/(max-min)/6+1/3) : ((rgb[0]-rgb[1])/(max-min)/6+2/3)));
    h = (h < 0) ? (h + 1) : ((h > 1)  ? (h - 1) : h);
    return [h, s, v];
  },

  /** regular expression for parsing color: rgb, hex */
  PARSE_COLOR_RGBRE: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i,
  PARSE_COLOR_HEXRE: /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,

  // return an array of r,g,b colour
  expandColor: function(color) {
    var hexColor, red, green, blue;
    hexColor = this.parseColor(color);
    if (hexColor) {
      red = parseInt(hexColor.slice(1, 3), 16);
      green = parseInt(hexColor.slice(3, 5), 16);
      blue = parseInt(hexColor.slice(5, 7), 16);
      return [red,green,blue];
    }
  },

  // parse rgb color or 3-digit hex color to return a properly formatted 6-digit hex colour spec, or false
  parseColor: function(string) {
    var i=0, color = '#', match, part;
    if(match = this.PARSE_COLOR_RGBRE.exec(string)) {
      for (i=1; i<=3; i++) {
        part = Math.max(0, Math.min(255, parseInt(match[i],0)));
        color += this.toColorPart(part);
      }
      return color;
    }
    if (match = this.PARSE_COLOR_HEXRE.exec(string)) {
      if(match[1].length == 3) {
        for (i=0; i<3; i++) {
          color += match[1].charAt(i) + match[1].charAt(i);
        }
        return color;
      }
      return '#' + match[1];
    }
    return false;
  },

  // convert one r,g,b number to a 2 digit hex string
  toColorPart: function(number) {
    if (number > 255) number = 255;
    var digits = number.toString(16);
    if (number < 16) return '0' + digits;
    return digits;
  },
  
  
  // Get the computed style from specific element. Useful for cloning styles
  getStyle: function(oElm, strCssRule){
  	var strValue = "";
  	if(document.defaultView && document.defaultView.getComputedStyle){
  		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
  	}
  	else if(oElm.currentStyle){
  		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
  			return p1.toUpperCase();
  		});
  		strValue = oElm.currentStyle[strCssRule];
  	}
  	return strValue;
  },

  // Convert double byte characters to standard Unicode. Considers only
  // conversions from zenkaku to hankaky roomaji
  uniJapaneseConvert: function (str){ 
    var nChar, cString= '', j, jLen;
    //here we cycle through the characters in the current value 
    for (j=0, jLen = str.length; j<jLen; j++){ 
      nChar = str.charCodeAt(j);

      //here we do the unicode conversion from zenkaku to hankaku roomaji 
      nChar = ((nChar>=65281 && nChar<=65392)?nChar-65248:nChar);

      //MS IME seems to put this character in as the hyphen from keyboard but not numeric pad... 
      nChar = ( nChar===12540?45:nChar) ;
      cString = cString + String.fromCharCode(nChar); 
    }
    return cString; 
  }
}) ;

/* >>>>>>>>>> BEGIN source/tasks/preload_bundle.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require("tasks/task");

// default callback
SC.didPreloadBundle = function() {};

/**
  @private
  A task that preloads a bundle, supplying a target and action to be called
  on bundle load completion.
*/
SC.PreloadBundleTask = SC.Task.extend({
  /**
    The identifier of the bundle to load.
  */
  bundle: null,
  
  /**
    The target to supply to SC.loadBundle.
  */
  target: "SC",
  
  /**
    The action to supply to SC.loadBundle.
  */
  action: "preloaded",
  
  run: function(queue) {
    var bundle;
    if (bundle = this.get("bundle")) {
      var st = Date.now();
      SC.loadBundle(this.get("bundle"), this.get("target"), this.get("action"));
    }
  }
});

/* >>>>>>>>>> BEGIN source/validators/validator.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.VALIDATE_OK = YES;
SC.VALIDATE_NO_CHANGE = NO;

/**
  @class
  
  Validators provide a way for you to implement simple form field validation
  and transformation.  To use a validator, simply name the validator in the
  "validate" attribute in your text field.  For example, if you want to
  validate a field using the PhoneNumberValidator use this:

  <input value="1234567890" validate="phone-number" />

  Validators get notified at three points.  You can implement one or all
  of these methods to support validation.  All of the validate methods except
  for validateKeypress behave the same way.  You are passed a form, field,
  and possibly the oldValue.  You are expected to return Validator.OK or
  an error string.  Inside this method you typically do one of all of the
  following:

  1. You can simply validate the field value and return OK or an error str
  
  2. You can modify the field value (for example, you could format the
     string to match some predefined format).
     
  3. If you need to roundtrip the server first to perform validation, you can
     return Validator.OK, then save the form and field info until after the
     roundtrip.  On return, if there is a problem, first verify the field
     value has not changed and then call form.errorFor(field,str) ;

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Validator = SC.Object.extend(
/** @scope SC.Validator.prototype */ {

  // ..........................................
  // OBJECT VALUE CONVERSION
  //
  // The following methods are used to convert the string value of a field
  // to and from an object value.  The default implementations return
  // the string, but you can override this to provide specific behaviors. 
  // For example, you might add or remove a dollar sign or convert the 
  // value to a number.
  
/**
  Returns the value to set in the field for the passed object value.  
  
  The form and view to be set MAY (but will not always) be passed also.  You
  should override this method to help convert an input object into a value
  that can be displayed by the field.  For example, you might convert a 
  date to a property formatted string or a number to a properly formatted
  value.
  
  @param {Object} object The object to transform
  @param {SC.FormView} form The form this field belongs to. (optional)
  @param {SC.View} view The view the value is required for.
  @returns {Object} a value (usually a string) suitable for display
*/
  fieldValueForObject: function(object, form, view) { return object; },
  
  /**
    Returns the object value for the passed string.
    
    The form and view MAY (but wil not always) be passed also.  You should
    override this method to convert a field value, such as string, into an
    object value suitable for consumption by the rest of the app.  For example
    you may convert a string into a date or a number.
    
    @param {String} value the field value.  (Usually a String).
    @param {SC.FormView} form The form this field belongs to. (optional)
    @param {SC.View} view The view this value was pulled from.
    @returns {Object} an object suitable for consumption by the app.
  */
  objectForFieldValue: function(value, form, view) { return value; },
  
  // ..........................................
  // VALIDATION PRIMITIVES
  //

  /**
    Validate the field value.  
    
    You can implement standard behavior for your validator by using the validate()
    and validateError() methods.  validate() should return NO if the field is not
    valid, YES otherwise.  If you return NO from this method, then the validateError()
    method will be called so you can generate an error object describing the specific problem.

    @param {SC.FormView} form the form this view belongs to
    @param {SC.View} field the field to validate.  Responds to fieldValue.
    @returns {Boolean} YES if field is valid.
  */
  validate: function(form, field) { return true; },

  /**
    Returns an error object if the field is invalid.
  
    This is the other standard validator method that can be used to impement basic validation.
    Return an error object explaining why the field is not valid.  It will only be called if
    validate() returned NO.
    
    The default implementation of htis method returns a generic error message with the loc
    string "Invalid.Generate({fieldValue})".  You can simply define this loc string in
    strings.js if you prefer or you can override this method to provide a more specific error message.
  
    @param {SC.FormView} form the form this view belongs to
    @param {SC.View} field the field to validate.  Responds to fieldValue.
    @returns {SC.Error} an error object
  */
  validateError: function(form, field) { 
    return SC.$error(
      "Invalid.General(%@)".loc(field.get('fieldValue')),
      field.get('fieldKey')) ; 
  },

  // ..........................................
  // VALIDATION API
  //

  /**
    Invoked just before the user ends editing of the field.

    This is a primitive validation method.  You can implement the two higher-level
    methods (validate() and validateError()) if you prefer.
    
    The default implementation calls your validate() method and then validateError()
    if valiate() returns NO.  This method should return SC.VALIDATE_OK if validation
    succeeded or an error object if it fails.
  
    @param {SC.FormView} form the form for the field
    @param {SC.View} field the field to validate
    @param {Object} oldValue: the value of the field before the change

    @returns SC.VALIDATE_OK or an error object.
  
  */
  validateChange: function(form, field, oldValue) { 
    return this.validate(form,field) ? SC.VALIDATE_OK : this.validateError(form, field);
  },

  /**
    Invoked just before the form is submitted.
  
    This method gives your validators one last chance to perform validation
    on the form as a whole.  The default version does the same thing as the 
    validateChange() method.
  
    @param {SC.FormView} form the form for the field
    @param {SC.View} field the field to validate

    @returns SC.VALIDATE_OK or an error object.
  
  */  
  validateSubmit: function(form, field) { 
    return this.validate(form,field) ? SC.VALIDATE_OK : this.validateError(form, field);
  },

  /**
    Invoked 1ms after the user types a key (if a change is allowed).  
  
    You can use this validate the new partial string and return an error if 
    needed. The default will validate a partial only if there was already an 
    error. This allows the user to try to get it right before you bug them.
  
    Unlike the other methods, you should return SC.VALIDATE_NO_CHANGE if you
    did not actually validate the partial string.  If you return 
    SC.VALIDATE_OK then any showing errors will be hidden.
  
    @param {SC.FormView} form the form for the field
    @param {SC.View} field the field to validate

    @returns SC.VALIDATE_OK, SC.VALIDATE_NO_CHANGE or an error object.
  */  
  validatePartial: function(form, field) { 
    if (!field.get('isValid')) {
      return this.validate(form,field) ? SC.VALIDATE_OK : this.validateError(form, field);
    } else return SC.VALIDATE_NO_CHANGE ;
  },
  
  /**
    Invoked when the user presses a key.  
  
    This method is used to restrict the letters and numbers the user is 
    allowed to enter.  You should not use this method to perform full 
    validation on the field.  Instead use validatePartial().
  
    @param {SC.FormView} form the form for the field
    @param {SC.View} field the field to validate
    @param {String} char the characters being added
    
    @returns {Boolean} YES if allowed, NO otherwise
  */
  validateKeyDown: function(form, field,charStr) { return true; },

  // .....................................
  // OTHER METHODS

  /**
    Called on all validators when they are attached to a field.  
  
    You can use this to do any setup that you need.  The default does nothing.
    
    @param {SC.FormView} form the form for the field
    @param {SC.View} field the field to validate
  */
  attachTo: function(form,field) { },

  /**
    Called on a validator just before it is removed from a field.  You can 
    tear down any setup you did for the attachTo() method.
    
    @param {SC.FormView} form the form for the field
    @param {SC.View} field the field to validate
  */
  detachFrom: function(form, field) {}

}) ;

SC.Validator.mixin(/** @scope SC.Validator */ {

  /**
    Return value when validation was performed and value is OK.
  */
  OK: true, 
  
  /**
    Return value when validation was not performed.
  */
  NO_CHANGE: false,  

  /**
    Invoked by a field whenever a validator is attached to the field.
    
    The passed validatorKey can be a validator instance, a validator class
    or a string naming a validator. To make your validator
    visible, you should name your validator under the SC.Validator base.
    for example SC.Validator.Number would get used for the 'number' 
    validator key.
  
    This understands validatorKey strings in the following format:

    * 'key' or 'multiple_words' will find validators Key and MultipleWords

    * if you want to share a single validator among multiple fields (for
      example to validate that two passwords are the same) set a name inside
      brackets. i.e. 'password[pwd]'.

    @param {SC.FormView} form the form for the field
    @param {SC.View} field the field to validate
    @param {Object} validatorKey the key to validate
    
    @returns {SC.Validator} validator instance or null
  */  
  findFor: function(form,field, validatorKey) {
    
    // Convert the validator into a validator instance.
    var validator ;
    if (!validatorKey) return ; // nothing to do...
    
    if (validatorKey instanceof SC.Validator) {
      validator = validatorKey ;
    } else if (validatorKey.isClass) {
      validator = validatorKey.create() ;
      
    } else if (SC.typeOf(validatorKey) === SC.T_STRING) {

      // extract optional key name
      var name = null ;
      var m = validatorKey.match(/^(.+)\[(.*)\]/) ;
      if (m) {
        validatorKey = m[1] ; name = m[2]; 
      }
      
      // convert the validatorKey name into a class.
      validatorKey = validatorKey.classify() ;
      var validatorClass = SC.Validator[validatorKey] ;
      if (SC.none(validatorClass)) {
        throw "validator %@ not found for %@".fmt(validatorKey, field) ;
      } else if (name) {

        // if a key was also passed, then find the validator in the list of
        // validators for the form.  Otherwise, just create a new instance.
        if (!form) {
          throw "named validator (%@) could not be found for field %@ because the field does not belong to a form".fmt(name,field) ;
        }
        
        if (!form._validatorHash) form._validatorHash = {} ;
        validator = (name) ? form._validatorHash[name] : null ;
        if (!validator) validator = validatorClass.create() ;
        if (name) form._validatorHash[name] = validator ;
      } else validator = validatorClass.create() ;
    } 
    
    return validator ;
  },
  
  /**
    Convenience class method to call the fieldValueForObject() instance
    method you define in your subclass.
  */
  fieldValueForObject: function(object, form, field) {
    if (this.prototype && this.prototype.fieldValueForObject) {
      return this.prototype.fieldValueForObject(object,form,field) ;
    }
    else return null ;
  },
  
  /**
    Convenience class method to call the objectForFieldValue() instance
    method you define in your subclass.
  */
  objectForFieldValue: function(value, form, field) {
    if (this.prototype && this.prototype.objectForFieldValue) {
      return this.prototype.objectForFieldValue(value,form,field) ;
    }
    else return null ;
  }
  
});

/* >>>>>>>>>> BEGIN source/validators/credit_card.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/** @class
  Validate a field value as a credit card number. 
  
  This validator will perform a basic check to ensure the credit card number
  is mathematically valid.  It will also accept numbers with spaces, dashes
  or other punctuation.  
  
  Converted credit card numbers are broken into units of 4.
  
  Basic credit card validation courtesy David Leppek 
  (https://www.azcode.com/Mod10)

  @extends SC.Validator
  @since SproutCore 1.0
*/
SC.Validator.CreditCard = SC.Validator.extend(
/** @scope SC.Validator.CreditCard.prototype */ {

  /**
    Expects a string of 16 digits.  Will split into groups of 4 for display.
  */
  fieldValueForObject: function(object, form, field) {
    if (typeof(object) == "string" && object.length == 16) {
      object = [object.slice(0,4),object.slice(4,8),object.slice(8,12),object.slice(12,16)].join(' ') ;
    }
    return object ;
  },

  /**
    Removes all whitespace or dashes to make a single string.
  */
  objectForFieldValue: function(value, form, field) {
    return value.replace(/[\s-\.\:]/g,'') ;
  },
  
  validate: function(form, field) { 
    return this.checkNumber(field.get('fieldValue')) ; 
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return SC.$error("Invalid.CreditCard(%@)".loc(label), label);
  },
  
  /** 
    Allow only numbers, dashes, and spaces 
  */
  validateKeyDown: function(form, field, charStr) {
    return !!charStr.match(/[0-9\- ]/);
  },
  
  checkNumber: function(ccNumb) {
    
    if (!ccNumb || ccNumb.length===0) return YES; // do not validate empty
    
    // remove any spaces or dashes
    ccNumb = ccNumb.replace(/[^0-9]/g,'');
    
    var valid = "0123456789";  // Valid digits in a credit card number
    var len = ccNumb.length;  // The length of the submitted cc number
    var iCCN = parseInt(ccNumb,0);  // integer of ccNumb
    var sCCN = ccNumb.toString();  // string of ccNumb
    sCCN = sCCN.replace (/^\s+|\s+$/g,'');  // strip spaces
    var iTotal = 0;  // integer total set at zero
    var bNum = true;  // by default assume it is a number
    var bResult = false;  // by default assume it is NOT a valid cc
    var temp;  // temp variable for parsing string
    var calc;  // used for calculation of each digit

    // Determine if the ccNumb is in fact all numbers
    for (var j=0; j<len; j++) {
      temp = "" + sCCN.substring(j, j+1);
      if (valid.indexOf(temp) == "-1"){bNum = false;}
    }

    // if it is NOT a number, you can either alert to the fact, 
    // or just pass a failure
    if(!bNum) bResult = false;

    // Determine if it is the proper length 
    if((len === 0)&&(bResult)){  // nothing, field is blank AND passed above # check
      bResult = false;
    } else{  // ccNumb is a number and the proper length - let's see if it is a valid card number
      if(len >= 15){  // 15 or 16 for Amex or V/MC
        for(var i=len;i>0;i--){  // LOOP throught the digits of the card
          calc = parseInt(iCCN,0) % 10;  // right most digit
          calc = parseInt(calc,0);  // assure it is an integer
          iTotal += calc;  // running total of the card number as we loop - Do Nothing to first digit
          i--;  // decrement the count - move to the next digit in the card
          iCCN = iCCN / 10;                               // subtracts right most digit from ccNumb
          calc = parseInt(iCCN,0) % 10 ;    // NEXT right most digit
          calc = calc *2;                                 // multiply the digit by two
          // Instead of some screwy method of converting 16 to a string and then parsing 1 and 6 and then adding them to make 7,
          // I use a simple switch statement to change the value of calc2 to 7 if 16 is the multiple.
          switch(calc){
            case 10: calc = 1; break;       //5*2=10 & 1+0 = 1
            case 12: calc = 3; break;       //6*2=12 & 1+2 = 3
            case 14: calc = 5; break;       //7*2=14 & 1+4 = 5
            case 16: calc = 7; break;       //8*2=16 & 1+6 = 7
            case 18: calc = 9; break;       //9*2=18 & 1+8 = 9
            default: calc = calc;           //4*2= 8 &   8 = 8  -same for all lower numbers
          }                                               
        iCCN = iCCN / 10;  // subtracts right most digit from ccNum
        iTotal += calc;  // running total of the card number as we loop
      }  // END OF LOOP
      if ((iTotal%10)===0){  // check to see if the sum Mod 10 is zero
        bResult = true;  // This IS (or could be) a valid credit card number.
      } else {
        bResult = false;  // This could NOT be a valid credit card number
        }
      }
    }
    return bResult; // Return the results
  }
    
}) ;

/* >>>>>>>>>> BEGIN source/validators/date.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/**
  Handle parsing and display of dates.
  
  @class
  @extends SC.Validator
  @author Charles Jolley
  @version 1.0
*/
SC.Validator.Date = SC.Validator.extend(
/** @scope SC.Validator.Date.prototype */ {

  /**
    The standard format you want the validator to convert dates to.
  */
  format: 'NNN d, yyyy h:mm:ss a',
  
  /**
    if we have a number, then convert to a date object.
  */
  fieldValueForObject: function(object, form, field) {
    var date ;
    if (typeof(object) === "number") {
      date = new Date(object) ;
    } else if (object instanceof Date) { date = object; }
      
    if (date) object = date.format(this.get('format')) ;
    
    return object ;
  },

  /**
    Try to pase value as a date. convert into a number, or return null if
    it could not be parsed.
  */
  objectForFieldValue: function(value, form, field) {
    if (value) {
      var date = Date.parseDate(value) ;
      value = (date) ? date.getTime() : null ;
    }
    return value ;
  }
    
}) ;

/* >>>>>>>>>> BEGIN source/validators/date_time.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('validators/validator');

/**
  This validates a SC.DateTime, used in SC.DateFieldView.
  
  @class
  @extends SC.Validator
  @author Juan Pablo Goldfinger
  @version 1.0
*/
SC.Validator.DateTime = SC.Validator.extend({

  /**
    The standard format you want the validator to convert dates to.
  */
  format: '%d/%m/%Y',

  /**
    if we have a number, then convert to a date object.
  */
  fieldValueForObject: function(object, form, field) {
    if (SC.kindOf(object, SC.DateTime)) {
      object = object.toFormattedString(this.get('format'));
    } else {
      object = null;
    }
    return object;
  },

  /**
    Try to pase value as a date. convert into a number, or return null if
    it could not be parsed.
  */
  objectForFieldValue: function(value, form, field) {
    if (value) {
      value = SC.DateTime.parse(value, this.get('format'));
    }
    return value;
  }

});

/* >>>>>>>>>> BEGIN source/validators/email.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/**
  Requires a valid email format.
  
  @class
  @extends SC.Validator
  @version 1.0
*/
SC.Validator.Email = SC.Validator.extend(
/** @scope SC.Validator.Email.prototype */ {
  
  validate: function(form, field) { 
    return (field.get('fieldValue') || '').match(/.+@.+\...+/) ; 
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return SC.$error("Invalid.Email(%@)".loc(label), label) ;
  }  
    
}) ;

/**
  This variant allows an empty field as well as an email address.
  
  @class
  @extends SC.Validator.Email
  @author Charles Jolley
  @version 1.0
*/
SC.Validator.EmailOrEmpty = SC.Validator.Email.extend(
/** @scope SC.Validator.EmailOrEmpty.prototype */ {
  validate: function(form, field) {
    var value = field.get('fieldValue') ; 
    return (value && value.length > 0) ? value.match(/.+@.+\...+/) : true ;
  }
}) ;

/* >>>>>>>>>> BEGIN source/validators/not_empty.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/**
  Requires some content in field, but does not check the specific content.
  
  @class
  @extends SC.Validator
  @author Charles Jolley
  @version 1.0
*/
SC.Validator.NotEmpty = SC.Validator.extend(
/** @scope SC.Validator.NotEmpty.prototype */ {
  
  validate: function(form, field) {
    var value = field.get('fieldValue'); 
    if (SC.none(value))
      return NO;

    if (! SC.none(value.length))
      return value.length > 0;

    return YES;
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return SC.$error("Invalid.NotEmpty(%@)".loc(label.capitalize()), field.get('errorLabel'));
  }
    
}) ;

/* >>>>>>>>>> BEGIN source/validators/number.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/**
  Handles parsing and validating of numbers.
  
  @extends SC.Validator
  @author Charles Jolley
  @version 1.0
  @class
*/
SC.Validator.Number = SC.Validator.extend(
/** @scope SC.Validator.Number.prototype */ {

  /**
    Number of decimal places to show.  
    
    If 0, then numbers will be treated as integers.  Otherwise, numbers will
    show with a fixed number of decimals.
  */
  places: 0,
  
  fieldValueForObject: function(object, form, field) {
    switch(SC.typeOf(object)) {
      case SC.T_NUMBER:
        object = object.toFixed(this.get('places')) ;
        break ;
      case SC.T_NULL:
      case SC.T_UNDEFINED:
        object = '';
        break ;
    }
    return object ;
  },

  objectForFieldValue: function(value, form, field) {
    // strip out commas
    var result;
    value = value.replace(/,/g,'');
    switch(SC.typeOf(value)) {
      case SC.T_STRING:
        if (value.length === 0) {
          value = null ;
        } else if (this.get('places') > 0) {
          value = parseFloat(value) ;
        } else {
          if(value.length==1 && value.match(/-/)) value = null;
          else {
            result = parseInt(value,0) ;
            if(isNaN(result)){
              value = SC.uniJapaneseConvert(value);
              value = parseInt(value,0) ;
              if(isNaN(value)) value='';
            }else value = result;
          }
        }
        break ;
      case SC.T_NULL:
      case SC.T_UNDEFINED:
        value = null ;
        break ;
    }
    return value ;
  },
  
  validate: function(form, field) { 
    var value = field.get('fieldValue') ;
    return (value === '') || !(isNaN(value) || isNaN(parseFloat(value))) ; 
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return SC.$error("Invalid.Number(%@)".loc(label), label) ;
  },
  
  /** 
    Allow only numbers, dashes, period, and commas
  */
  validateKeyDown: function(form, field, charStr) {
    var text = field.$input().val();
    if (!text) text='';
    text+=charStr;
    if(this.get('places')===0){
      if(charStr.length===0) return true;
      else return text.match(/^[\-{0,1}]?[0-9,\0]*/)[0]===text;
    }else {
      if(charStr.length===0) return true;
      else return text.match(/^[\-{0,1}]?[0-9,\0]*\.?[0-9\0]+/)===text;
    }
  }
    
}) ;

/* >>>>>>>>>> BEGIN source/validators/password.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/**
  Ensures all fields with the Password validator attached in the same form
  contain the same value.
  
  @class
  @extends SC.Validator
  @author Charles Jolley
  @version 1.0
*/
SC.Validator.Password = SC.Validator.extend(
/** @scope SC.Validator.Password.prototype */ {

  attachTo: function(form,field) {
    arguments.callee.base.apply(this,arguments);
    if (!this.fields) this.fields = [] ;
    this.fields.push(field) ;
  },

  validate: function(force) {
    if (!this.fields || this.fields.length === 0) return true ;
    
    var empty = false ;
    var notEmpty = false ;
    var ret = true ;
    var value = this.fields[0].get('fieldValue') ;
    this.fields.forEach(function(field) {
      var curValue = field.get('fieldValue') ;
      if (curValue != value) ret= false ;
      if (!curValue || curValue.length === 0) empty = true ;
      if (curValue && curValue.length > 0) notEmpty = true ;
    }) ;

    // if forces, valid OK if there was an empty.  If not forced, valid OK 
    // only if all fields match AND they are not all empty.
    if (force) {
      return (notEmpty === false) ? false : ret ;
    } else {
      return (empty === true) ? true : ret ;
    }
  },
  
  // update field states
  updateFields: function(form,valid) {
    if (!this.fields || this.fields.length === 0) return true ;
    var err = "Invalid.Password".loc();
    var topField = this._field ;
    this.fields.forEach(function(f) {
      var msg = (valid) ? null : ((f == topField) ? err : '') ;
      form.setErrorFor(f,msg) ;
    }) ;
    return (valid) ? SC.VALIDATE_OK : err ;
  },
  
  validateChange: function(form, field, oldValue) { 
    return this.updateFields(form, this.validate(false)) ;
  },

  // this method is called just before the form is submitted.
  // field: the field toe validate.
  validateSubmit: function(form, field) { 
    return this.updateFields(form, this.validate(true)) ;
  },

  // this method gets called 1ms after the user types a key (if a change is
  // allowed).  You can use this validate the new partial string and return 
  // an error if needed.
  //
  // The default will validate a partial only if there was already an error.
  // this allows the user to try to get it right before you bug them.
  validatePartial: function(form, field) {
    var isInvalid = !this._field.get('isValid') ;
    if (isInvalid) {
      return this.updateFields(form, this.validate(false)) ;
    } else return SC.VALIDATE_NO_CHANGE ;
  }
    
}) ;

/* >>>>>>>>>> BEGIN source/validators/positive_integer.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/**
  Handles parsing and validating of positive integers.
  
  @extends SC.Validator
  @author Nirumal Thomas
  @version 1.0
  @class
*/
SC.Validator.PositiveInteger = SC.Validator.extend(
/** @scope SC.Validator.PositiveInteger.prototype */ {

  /**
    Default Value to be displayed. If the value in the text field is null,
    undefined or an empty string, it will be replaced by this value.

    @property
    @type Number
    @default null
  */
  defaultValue: null,

  fieldValueForObject: function(object, form, field) {
    switch(SC.typeOf(object)) {
      case SC.T_NUMBER:
        object = object.toFixed(0) ;
        break ;
      case SC.T_NULL:
      case SC.T_UNDEFINED:
        object = this.get('defaultValue') ;
        break ;
    }
    return object ;
  },

  objectForFieldValue: function(value, form, field) {
    // strip out commas
    value = value.replace(/,/g,'');
    switch(SC.typeOf(value)) {
      case SC.T_STRING:
        if (value.length === 0) {
          value = this.get('defaultValue') ;
        } else {
          value = parseInt(value, 0) ;
        }
        break ;
      case SC.T_NULL:
      case SC.T_UNDEFINED:
        value = this.get('defaultValue') ;
        break ;
    }
    return value ;
  },

  validate: function(form, field) {
    var value = field.get('fieldValue') ;
    return (value === '') || !isNaN(value) ;
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return SC.$error("Invalid.Number(%@)".loc(label), label) ;
  },
  
  /** 
    Allow only numbers
  */
  validateKeyDown: function(form, field, charStr) {
    var text = field.$input().val();
    if (!text) text='';
    text+=charStr;
    if(charStr.length===0) return true ;
    else return text.match(/^[0-9\0]*/)[0]===text;
  }
    
}) ;

/* >>>>>>>>>> BEGIN source/views/container.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;

/** 
  @class
  
  A container view will display its "content" view as its only child.  You can
  use a container view to easily swap out views on your page.  In addition to
  displaying the actual view in the content property, you can also set the 
  nowShowing property to the property path of a view in your page and the
  view will be found and swapped in for you.
  
  If you want to change the way the container view swaps in your new view, 
  override the replaceContent() method.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ContainerView = SC.View.extend(
/** @scope SC.ContainerView.prototype */ {

  classNames: ['sc-container-view'],
  
  /**
    Optional path name for the content view.  Set this to a property path 
    pointing to the view you want to display.  This will automatically change
    the content view for you.  If you pass a single property name (e.g.
    "myView") then the container view will look up the property on its own 
    page object.  If you pass a full property name 
    (e.g. "MyApp.anotherPage.anotherView"), then the path will be followed 
    from the top-level.
    
    @property {String, SC.View}
  */
  nowShowing: null,

  /** 
    The content view to display.  This will become the only child view of
    the view.  Note that if you set the nowShowing property to any value other
    than 'null', the container view will automatically change the contentView
    to reflect view indicated by the value.
    
    @property {SC.View}
  */
  contentView: null,
  
  /** @private */
  contentViewBindingDefault: SC.Binding.single(),
  
  /**
    Replaces any child views with the passed new content.  
    
    This method is automatically called whenever your contentView property 
    changes.  You can override it if you want to provide some behavior other
    than the default.
    
    @param {SC.View} newContent the new content view or null.
  */
  replaceContent: function(newContent) {
    this.removeAllChildren() ;
    if (newContent) this.appendChild(newContent) ;
  },

  /** @private */
  createChildViews: function() {
    // if contentView is defined, then create the content
    var view = this.get('contentView') ;
    if (view) {
      view = this.contentView = this.createChildView(view) ;
      this.childViews = [view] ;
    } 
  },
  
  /**
    When a container view awakes, it will try to find the nowShowing, if 
    there is one, and set it as content if necessary.
  */
  awake: function() {
    arguments.callee.base.apply(this,arguments);
    var nowShowing = this.get('nowShowing') ;
    if (nowShowing && nowShowing.length>0) this.nowShowingDidChange();
  },
  
  /**
    Invoked whenever the nowShowing property changes.  This will try to find
    the new content if possible and set it.  If you set nowShowing to an 
    empty string or null, then the current content will be cleared.
    
    If you set the content manually, the nowShowing property will be set to
    SC.CONTENT_SET_DIRECTLY
  */
  nowShowingDidChange: function() {
    // This code turns this.nowShowing into a view object by any means necessary.
    
    var content = this.get('nowShowing') ;
    
    // If nowShowing was changed because the content was set directly, then do nothing.
    if (content === SC.CONTENT_SET_DIRECTLY) return ;
    
    // If it's a string, try to turn it into the object it references...
    if (SC.typeOf(content) === SC.T_STRING && content.length > 0) {
      if (content.indexOf('.') > 0) {
        content = SC.objectForPropertyPath(content);
      } else {
        content = SC.objectForPropertyPath(content, this.get('page'));
      }
    }
    
    // If it's an uninstantiated view, then attempt to instantiate it.
    // (Uninstantiated views have a create() method; instantiated ones do not.)
    if (SC.typeOf(content) === SC.T_CLASS) {
      if (content.kindOf(SC.View)) content = content.create();
      else content = null;
    } 
    
    // If content has not been turned into a view by now, it's hopeless.
    if (content && !(content instanceof SC.View)) content = null;
    
    // Sets the content.
    this.set('contentView', content) ;
    
  }.observes('nowShowing'),
  
  /**
    Invoked whenever the content property changes.  This method will simply
    call replaceContent.  Override replaceContent to change how the view is
    swapped out.
  */
  contentViewDidChange: function() {
    this.replaceContent(this.get('contentView'));
  }.observes('contentView')
  
}) ;

/* >>>>>>>>>> BEGIN source/views/image.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;
sc_require('mixins/control') ;

SC.IMAGE_STATE_NONE = 'none';
SC.IMAGE_STATE_LOADING = 'loading';
SC.IMAGE_STATE_LOADED = 'loaded';
SC.IMAGE_STATE_FAILED = 'failed';
SC.IMAGE_STATE_SPRITE = 'sprite';

/**
  URL to a transparent GIF.  Used for spriting.
*/
SC.BLANK_IMAGE_DATAURL = "data:image/gif;base64,R0lGODlhAQABAJAAAP///wAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==";

SC.BLANK_IMAGE_URL = SC.browser.msie && SC.browser.msie<8 ? '/static/sproutcore/foundation/en/current/blank.gif?1291500743' : SC.BLANK_IMAGE_DATAURL;

/**
  @class

  Displays an image in the browser.  
  
  The ImageView can be used to efficiently display images in the browser.
  It includes a built in support for a number of features that can improve
  your page load time if you use a lot of images including a image loading
  queue and automatic support for CSS spriting.

  Note that there are actually many controls that will natively include 
  images using an icon property name.
  
  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.ImageView = SC.View.extend(SC.Control, 
/** @scope SC.ImageView.prototype */ {
  
  /** Image views contain an img tag. */
  classNames: 'sc-image-view',
  tagName: 'img',
  
  /**
    Current load status of the image.
    
    This status changes as an image is loaded from the server.  If spriting
    is used, this will always be loaded.  Must be one of the following
    constants: SC.IMAGE_STATE_NONE, SC.IMAGE_STATE_LOADING, 
    SC.IMAGE_STATE_LOADED, SC.IMAGE_STATE_FAILED, SC.IMAGE_STATE_SPRITE
    
    @property {String}
  */
  status: SC.IMAGE_STATE_NONE,
  
  /**
    A url or CSS class name.
    
    This is the image you want the view to display.  It should be either a
    url or css class name.  You can also set the content and 
    contentValueKey properties to have this value extracted 
    automatically.
    
    If you want to use CSS spriting, set this value to a CSS class name.  If
    you need to use multiple class names to set your icon, separate them by
    spaces.
    
    Note that if you provide a URL, it must contain at least one '/' as this
    is how we autodetect URLs.
    
    @property {String}
  */
  value: null,

  /**
    If YES, image view will use the imageCache to control loading.  This 
    setting is generally preferred.
    
    @property {String}
  */
  useImageCache: YES,
  
  /**
    If YES, this image can load in the background.  Otherwise, it is treated
    as a foreground image.  If the image is not visible on screen, it will
    always be treated as a background image.
  */
  canLoadInBackground: NO,
  
  /**
    If YES, any specified toolTip will be localized before display.
  */
  localize: YES,
  
  displayProperties: 'status toolTip'.w(),
  
  render: function(context, firstTime) {
    // the image source is the value if the status is LOADED or blank
    var status = this.get('status'), value = this.get('value') ;
    
    if (status === SC.IMAGE_STATE_NONE && value) this._image_valueDidChange() ; // setup initial state
    
    // query the status again, as calling this._image_valueDidChange() may
    // update status to SC.IMAGE_STATE_LOADED or SC.IMAGE_STATE_SPRITE
    status = this.get('status');

    var src = (status === SC.IMAGE_STATE_LOADED) ? value : SC.BLANK_IMAGE_URL ;
    if (status === SC.IMAGE_STATE_SPRITE) context.addClass(value) ;
    context.attr('src', src) ;
    
    // If there is a toolTip set, grab it and localize if necessary.
    var toolTip = this.get('toolTip') ;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc() ;
      context.attr('title', toolTip) ;
      context.attr('alt', toolTip) ;
    }
  },
  
  /** @private - 
    Whenever the value changes, update the image state and possibly schedule
    an image to load.
  */
  _image_valueDidChange: function() {
    var value = this.get('value'), isUrl;
    if(value && value.isEnumerable) value = value.firstObject();
    
    isUrl = SC.ImageView.valueIsUrl(value);

    // if the old image is still loading, cancel it
    // if (this._loadingUrl) SC.imageCache.abortImage(this._loadingUrl);
    
    // now update local state as needed....
    if (isUrl && this.get('useImageCache')) {
      var isBackground = this.get('isVisibleInWindow') || this.get('canLoadInBackground');
      
      this._loadingUrl = value ; // note that we're loading...
      SC.imageCache.loadImage(value, this, this.imageDidLoad, isBackground);
      
      // only mark us as loading if we are still loading...
      if (this._loadingUrl) this.set('status', SC.IMAGE_STATE_LOADING);
      
    // otherwise, just set state immediately
    } else {
      this._loadingUrl = null ; // not loading...
      this.set('status', (isUrl) ? SC.IMAGE_STATE_LOADED : SC.IMAGE_STATE_SPRITE);
      this.displayDidChange(); // call manually in case status did not change
      // (e.g value changes from one sprite to another)
    }
  }.observes('value'),
  
  /** 
    Called when the imageCache indicates that the image has loaded. 
    Changing the image state will update the display.
  */
  imageDidLoad: function(url, imageOrError) {
    if (url === this._loadingUrl) this._loadingUrl = null;

    // do nothing if we get this notification by the value of the image has 
    // since changed.
    if (this.get('value') === url) {
      this.set('status', SC.$ok(imageOrError) ? SC.IMAGE_STATE_LOADED : SC.IMAGE_STATE_FAILED);
      this.displayDidChange();
    }
  }
  
}) ;

/**
  Returns YES if the passed value looks like an URL and not a CSS class
  name.
*/
SC.ImageView.valueIsUrl = function(value) {
  return value ? value.indexOf('/') >= 0 : NO ;
} ;


/* >>>>>>>>>> BEGIN source/views/label.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;
sc_require('mixins/control') ;

SC.ALIGN_LEFT = 'left';
SC.ALIGN_RIGHT = 'right';
SC.ALIGN_CENTER = 'center';

SC.REGULAR_WEIGHT = 'normal';
SC.BOLD_WEIGHT = 'bold';

/**
  @class
  
  Displays a static string of text.
  
  You use a label view anytime you need to display a static string of text 
  or to display text that may need to be edited using only an inline control.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.InlineEditorDelegate
  @since SproutCore 1.0
*/
SC.LabelView = SC.View.extend(SC.Control,
/** @scope SC.LabelView.prototype */ {

  classNames: ['sc-label-view'],

  /**
    Specify the font weight for this.  You may pass SC.REGULAR_WEIGHT, or SC.BOLD_WEIGHT.
  */
  fontWeight: SC.REGULAR_WEIGHT,
  
  /**
    If true, value will be escaped to avoid scripting attacks.
    
    This is a default value that can be overridden by the
    settings on the owner view.
  */
  escapeHTML: true,
  escapeHTMLBindingDefault: SC.Binding.oneWay().bool(),

  /**
    If true, then the value will be localized.
    
    This is a default default that can be overidden by the
    settings in the owner view.
  */
  localize: false,
  localizeBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    Set this to a validator or to a function and the value
    will be passed through it before being set.
    
    This is a default default that can be overidden by the
    settings in the owner view.
  */
  formatter: null,

  /** 
    The value of the label.
    
    You may also set the value using a content object and a contentValueKey.
    
    @field {String}
  */
  value: '',
  
  /**
    The hint to display if no value is set.  Should be used only if isEditable
    is set to YES.
  */
  hint: null,

  /**
    The exampleInlineTextFieldView property is by default a 
    SC.InlineTextFieldView but it can be set to a customized inline text field
    view.
  
    @property
    @type {SC.View}
    @default {SC.InlineTextFieldView}
  */
  exampleInlineTextFieldView: SC.InlineTextFieldView,
  
  /**
    An optional icon to display to the left of the label.  Set this value
    to either a CSS class name (for spriting) or an image URL.
  */
  icon: null,
  
  /**
    Set the alignment of the label view.
  */
  textAlign: SC.ALIGN_LEFT,
  
  /**
    If you want the inline editor to be multiline set this property to YES.
  */
  isInlineEditorMultiline: NO,
  
  /**
    [RO] The value that will actually be displayed.
    
    This property is dynamically computed by applying localization, 
    string conversion and other normalization utilities.
    
    @field
  */
  displayValue: function() {
    var value, formatter;
    
    value = this.get('value') ;
    
    // 1. apply the formatter
    formatter = this.getDelegateProperty('formatter', this.displayDelegate) ;
    if (formatter) {
      var formattedValue = (SC.typeOf(formatter) === SC.T_FUNCTION) ? 
          formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (!SC.none(formattedValue)) value = formattedValue ;
    }
    
    // 2. If the returned value is an array, convert items to strings and 
    // join with commas.
    if (SC.typeOf(value) === SC.T_ARRAY) {
      var ary = [];
      for(var idx=0, idxLen = value.get('length'); idx< idxLen;idx++) {
        var x = value.objectAt(idx) ;
        if (!SC.none(x) && x.toString) x = x.toString() ;
        ary.push(x) ;
      }
      value = ary.join(',') ;
    }
    
    // 3. If value is not a string, convert to string. (handles 0)
    if (!SC.none(value) && value.toString) value = value.toString() ;
    
    // 4. Localize
    if (value && this.getDelegateProperty('localize', this.displayDelegate)) value = value.loc() ;

    // 5. escapeHTML if needed
    if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
    
    return value ;
  }.property('value', 'localize', 'formatter', 'escapeHTML').cacheable(),
  
  
  /**
    [RO] The hint value that will actually be displayed.
    
    This property is dynamically computed by applying localization 
    and other normalization utilities.
    
  */
  hintValue: function() {
    var hintVal = this.get('hint');
    if (this.get('escapeHTML')) hintVal = SC.RenderContext.escapeHTML(hintVal);
    return hintVal ;
  }.property('hint', 'escapeHTML').cacheable(),
  
  /**
    Enables editing using the inline editor.
  */
  isEditable: NO,
  isEditableBindingDefault: SC.Binding.bool(),

  /**
    YES if currently editing label view.
  */
  isEditing: NO,
  
  /**
    Validator to use during inline editing.
    
    If you have set isEditing to YES, then any validator you set on this
    property will be used when the label view is put into edit mode.
    
    @type {SC.Validator}
  */
  validator: null,

  /**
    Event dispatcher callback.
    If isEditable is set to true, opens the inline text editor view.

    @param {DOMMouseEvent} evt DOM event
    
  */
  doubleClick: function( evt ) { return this.beginEditing(); },
  
  
  /**
    Opens the inline text editor (closing it if it was already open for 
    another view).
    
    @return {Boolean} YES if did begin editing
  */
  beginEditing: function() {
    if (this.get('isEditing')) return YES ;
    if (!this.get('isEditable')) return NO ;

    var el = this.$(),
        value = this.get('value'),
        f = SC.viewportOffset(el[0]),
        frameTemp = this.convertFrameFromView(this.get('frame'), null) ;
    f.width=frameTemp.width;
    f.height=frameTemp.height;
    
    SC.InlineTextFieldView.beginEditing({
      frame: f,
      delegate: this,
      exampleElement: el,
      value: value, 
      multiline: this.get('isInlineEditorMultiline'), 
      isCollection: NO,
      validator: this.get('validator'),
      exampleInlineTextFieldView: this.get('exampleInlineTextFieldView')
    });
  },
  
  /**
    Cancels the current inline editor and then exits editor. 
    
    @return {Boolean} NO if the editor could not exit.
  */
  discardEditing: function() {
    if (!this.get('isEditing')) return YES ;
    return SC.InlineTextFieldView.discardEditing() ;
  },
  
  /**
    Commits current inline editor and then exits editor.
    
    @return {Boolean} NO if the editor could not exit
  */
  commitEditing: function() {
    if (!this.get('isEditing')) return YES ;
    return SC.InlineTextFieldView.commitEditing() ;
  },

  /** @private
    Set editing to true so edits will no longer be allowed.
  */
  inlineEditorWillBeginEditing: function(inlineEditor) {
    this.set('isEditing', YES);
  },

  /** @private 
    Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(inlineEditor) {
    var layer = this.$();
    this._oldOpacity = layer.css('opacity') ;
    layer.css('opacity', 0.0);
  },
  
  /** @private
    Delegate method defaults to the isEditable property
  */
  inlineEditorShouldBeginEditing: function(){
    return this.get('isEditable');
  },
  
  /** @private
    Could check with a validator someday...
  */
  inlineEditorShouldEndEditing: function(inlineEditor, finalValue) {
    return YES ;
  },

  /** @private
    Update the field value and make it visible again.
  */
  inlineEditorDidEndEditing: function(inlineEditor, finalValue) {
    this.setIfChanged('value', finalValue) ;
    this.$().css('opacity', this._oldOpacity);
    this._oldOpacity = null ;
    this.set('isEditing', NO) ;
  },

  displayProperties: 'displayValue textAlign fontWeight icon'.w(),
  
  _TEMPORARY_CLASS_HASH: {},
  
  render: function(context, firstTime) {
    var value = this.get('displayValue'),
        icon = this.get('icon'),
        hint = this.get('hintValue'),
        classes, stylesHash, text,
        iconChanged = false, textChanged = false;
    
    if (icon) {
      var url = (icon.indexOf('/')>=0) ? icon : SC.BLANK_IMAGE_URL,
          className = (url === icon) ? '' : icon ;
      icon = '<img src="'+url+'" alt="" class="icon '+className+'" />';
      if(icon!==this._iconCache) {
        this._iconCache=icon;
        iconChanged = true;
      }
    }
    
    if (hint && (!value || value === '')) {
      text = '<span class="sc-hint">'+hint+'</span>';
    }else{
      text = value;
    }
    if(text!==this._textCache) {
      this._textCache=text;
      textChanged = true;
    }
        
    if(firstTime || textChanged || iconChanged){
      context.push(icon, text);
    }
    
    // and setup alignment and font-weight on styles
    stylesHash = { 
      'text-align': this.get('textAlign'), 
      'font-weight': this.get('fontWeight')
    };
           
    // if we are editing, set the opacity to 0
    if (this.get('isEditing')) stylesHash['opacity']=0;
    context.addStyle(stylesHash);
    
    classes = this._TEMPORARY_CLASS_HASH;
    classes.icon = !!this.get('icon');
    context.setClass(classes);
  }
  
});

/* >>>>>>>>>> BEGIN source/panes/main.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('panes/pane');

/** @class

  Most SproutCore applications have a main pane, which dominates the 
  application page.  You can extend from this view to implement your own main 
  pane.  This class will automatically make itself main whenever you append it 
  to a document, removing any other main pane that might be currently in 
  place.  If you do have another already focused as the keyPane, this view 
  will also make itself key automatically.  The default way to use the main 
  pane is to simply add it to your page like this:
  
  {{{
    SC.MainPane.create().append();
  }}}
  
  This will cause your root view to display.  The default layout for a 
  MainPane is to cover the entire document window and to resize with the 
  window.

  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.MainPane = SC.Pane.extend({

  /** @private */
  layout: { top: 0, left: 0, bottom: 0, right: 0, minHeight:200, minWidth:200 },
  
  /** @private - extends SC.Pane's method */
  paneDidAttach: function() {
    var ret = arguments.callee.base.apply(this,arguments);
    var responder = this.rootResponder;
    responder.makeMainPane(this);
    if (!responder.get('keyRootView')) responder.makeKeyPane(this);
    return ret ;
  },
  
  /** @private */
  acceptsKeyPane: YES,

  /** @private */
  classNames: ['sc-main']
  
});

/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/foundation');
