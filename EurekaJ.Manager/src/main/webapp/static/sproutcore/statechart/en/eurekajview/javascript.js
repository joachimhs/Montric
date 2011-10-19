/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/* >>>>>>>>>> BEGIN source/ext/function.js */
// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

/**
  Extends the JS Function object with the handleEvents method that
  will provide more advanced event handling capabilities when constructing
  your statechart's states.
  
  By default, when you add a method to a state, the state will react to 
  events that matches a method's name, like so:
  
  {{{
  
    state = SC.State.extend({
    
      // Will be invoked when a event named "foo" is sent to this state
      foo: function(event, sender, context) { ... }
    
    })
  
  }}}
  
  In some situations, it may be advantageous to use one method that can react to 
  multiple events instead of having multiple methods that essentially all do the
  same thing. In order to set a method to handle more than one event you use
  the handleEvents method which can be supplied a list of string and/or regular
  expressions. The following example demonstrates the use of handleEvents:
  
  {{{
  
    state = SC.State.extend({
    
      eventHandlerA: function(event, sender, context) {
      
      }.handleEvents('foo', 'bar'),
      
      eventHandlerB: function(event, sender, context) {
      
      }.handleEvents(/num\d/, 'decimal')
    
    })
  
  }}}
  
  Whenever events 'foo' and 'bar' are sent to the state, the method eventHandlerA
  will be invoked. When there is an event that matches the regular expression
  /num\d/ or the event is 'decimal' then eventHandlerB is invoked. In both 
  cases, the name of the event will be supplied to the event handler. 
  
  It should be noted that the use of regular expressions may impact performance
  since that statechart will not be able to fully optimize the event handling logic based
  on its use. Therefore the use of regular expression should be used sparingly. 
  
  @param {(String|RegExp)...} args
*/
Function.prototype.handleEvents = function() {
  this.isEventHandler = YES;
  this.events = arguments;
  return this;
};

/**
  Extends the JS Function object with the stateObserves method that will
  create a state observe handler on a given state object. 
  
  Use a stateObserves() instead of the common observes() method when you want a 
  state to observer changes to some property on the state itself or some other 
  object. 
  
  Any method on the state that has stateObserves is considered a state observe
  handler and behaves just like when you use observes() on a method, but with an
  important difference. When you apply stateObserves to a method on a state, those
  methods will be active *only* when the state is entered, otherwise those methods
  will be inactive. This removes the need for you having to explicitly call
  addObserver and removeObserver. As an example:
  
  {{{
  
    state = SC.State.extend({
    
      foo: null,
      
      user: null,
    
      observeHandlerA: function(target, key) {
        
      }.stateObserves('MyApp.someController.status'),
      
      observeHandlerB: function(target, key) {
      
      }.stateObserves('foo'),
      
      observeHandlerC: function(target, key) {
      
      }.stateObserves('.user.name', '.user.salary')
    
    })
  
  }}}
  
  Above, state has three state observe handlers: observeHandlerA, observeHandlerB, and
  observeHandlerC. When state is entered, the state will automatically add itself as
  an observer for all of its registered state observe handlers. Therefore when
  foo changes, observeHandlerB will be invoked, and when MyApp.someController's status
  changes then observeHandlerA will be invoked. The moment that state is exited then
  the state will automatically remove itself as an observer for all of its registered
  state observe handlers. Therefore none of the state observe handlers will be
  invoked until the next time the state is entered. 
  
  @param {String...} args
*/
Function.prototype.stateObserves = function() {
  this.isStateObserveHandler = YES;
  this.args = SC.A(arguments);
  return this;
};
/* >>>>>>>>>> BEGIN source/system/async.js */
// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

/**
  @class

  Represents a call that is intended to be asynchronous. This is
  used during a state transition process when either entering or
  exiting a state.

  @extends SC.Object
  @author Michael Cohen
*/
SC.Async = SC.Object.extend(
  /** @scope SC.Async.prototype */{
  
  func: null,
  
  arg1: null,
  
  arg2: null,
  
  /** @private
    Called by the statechart
  */
  tryToPerform: function(state) {
    var func = this.get('func'),
        arg1 = this.get('arg1'),
        arg2 = this.get('arg2'),
        funcType = SC.typeOf(func);
      
    if (funcType === SC.T_STRING) {
      state.tryToPerform(func, arg1, arg2);
    } 
    else if (funcType === SC.T_FUNCTION) {
      func.apply(state, [arg1, arg2]);
    }
  }
  
});

/**
  Singleton
*/
SC.Async.mixin(/** @scope SC.Async */{
  
  /**
    Call in either a state's enterState or exitState method when you
    want a state to perform an asynchronous action, such as an animation.
    
    Examples:
    
    {{
    
      SC.State.extend({
    
        enterState: function() {
          return SC.Async.perform('foo');
        },
      
        exitState: function() {
          return SC.Async.perform('bar', 100);
        }
      
        foo: function() { ... },
      
        bar: function(arg) { ... }
    
      });
    
    }}
    
    @param func {String|Function} the functio to be invoked on a state
    @param arg1 Optional. An argument to pass to the given function
    @param arg2 Optional. An argument to pass to the given function
    @return {SC.Async} a new instance of a SC.Async
  */
  perform: function(func, arg1, arg2) {
    return SC.Async.create({ func: func, arg1: arg1, arg2: arg2 });
  }
  
});

/* >>>>>>>>>> BEGIN source/system/state.js */
// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

/**
  @class

  Represents a state within a statechart. 
  
  The statechart actively manages all states belonging to it. When a state is created, 
  it immediately registers itself with it parent states. 
  
  You do not create an instance of a state itself. The statechart manager will go through its 
  state heirarchy and create the states itself.

  For more information on using statecharts, see SC.StatechartManager.

  @author Michael Cohen
  @extends SC.Object
*/
SC.State = SC.Object.extend(
  /** @lends SC.State.prototype */ {

  /**
    The name of the state
    
    @property {String}
  */
  name: null,
   
  /**
    This state's parent state. Managed by the statechart
    
    @property {State}
  */
  parentState: null,
  
  /**
    This state's history state. Can be null. Managed by the statechart.
    
    @property {State}
  */
  historyState: null,
  
  /**
    Used to indicate the initial substate of this state to enter into. 
    
    You assign the value with the name of the state. Upon creation of 
    the state, the statechart will automatically change the property 
    to be a corresponding state object
    
    The substate is only to be this state's immediate substates. If
    no initial substate is assigned then this states initial substate
    will be an instance of an empty state (SC.EmptyState).
    
    Note that a statechart's root state must always have an explicity
    initial substate value assigned else an error will be thrown.
    
    @property {String|State}
  */
  initialSubstate: null,
  
  /**
    Used to indicates if this state's immediate substates are to be
    concurrent (orthogonal) to each other. 
    
    @property {Boolean}
  */
  substatesAreConcurrent: NO,
  
  /**
    The immediate substates of this state. Managed by the statechart.
    
    @property {Array}
  */
  substates: null,
  
  /**
    The statechart that this state belongs to. Assigned by the owning
    statechart.
  
    @property {Statechart}
  */
  statechart: null,
  
  /**
    Indicates if this state has been initialized by the statechart
    
    @propety {Boolean}
  */
  stateIsInitialized: NO,
  
  /**
    An array of this state's current substates. Managed by the statechart
    
    @propety {Array}
  */
  currentSubstates: null,
  
  /** 
    An array of this state's substates that are currently entered. Managed by
    the statechart.
    
    @property {Array}
  */
  enteredSubstates: null,
  
  /** 
    Indicates if this state should trace actions. Useful for debugging
    purposes. Managed by the statechart.
  
    @see SC.StatechartManager#trace
  
    @property {Boolean}
  */
  trace: function() {
    var key = this.getPath('statechart.statechartTraceKey');
    return this.getPath('statechart.%@'.fmt(key));
  }.property().cacheable(),
  
  /** 
    Indicates who the owner is of this state. If not set on the statechart
    then the owner is the statechart, otherwise it is the assigned
    object. Managed by the statechart.
    
    @see SC.StatechartManager#owner
  
    @property {SC.Object}
  */
  owner: function() {
    var sc = this.get('statechart'),
        key = sc ? sc.get('statechartOwnerKey') : null,
        owner = sc ? sc.get(key) : null;
    return owner ? owner : sc;
  }.property().cacheable(),
  
  init: function() {
    arguments.callee.base.apply(this,arguments);

    this._registeredEventHandlers = {};
    this._registeredStringEventHandlers = {};
    this._registeredRegExpEventHandlers = [];
    this._registeredStateObserveHandlers = {};

    // Setting up observes this way is faster then using .observes,
    // which adds a noticable increase in initialization time.
    var sc = this.get('statechart'),
        ownerKey = sc ? sc.get('statechartOwnerKey') : null,
        traceKey = sc ? sc.get('statechartTraceKey') : null;

    if (sc) {
      sc.addObserver(ownerKey, this, '_statechartOwnerDidChange');
      sc.addObserver(traceKey, this, '_statechartTraceDidChange');
    }
  },
  
  destroy: function() {
    var sc = this.get('statechart'),
        ownerKey = sc ? sc.get('statechartOwnerKey') : null,
        traceKey = sc ? sc.get('statechartTraceKey') : null;

    if (sc) {
      sc.removeObserver(ownerKey, this, '_statechartOwnerDidChange');
      sc.removeObserver(traceKey, this, '_statechartTraceDidChange');
    }

    var substates = this.get('substates');
    if (substates) {
      substates.forEach(function(state) {
        state.destroy();
      });
    }
    
    this._teardownAllStateObserveHandlers();

    this.set('substates', null);
    this.set('currentSubstates', null);
    this.set('enteredSubstates', null);
    this.set('parentState', null);
    this.set('historyState', null);
    this.set('initialSubstate', null);
    this.set('statechart', null);

    this.notifyPropertyChange('trace');
    this.notifyPropertyChange('owner');
    
    this._registeredEventHandlers = null;
    this._registeredStringEventHandlers = null;
    this._registeredRegExpEventHandlers = null;
    this._registeredStateObserveHandlers = null;

    arguments.callee.base.apply(this,arguments);
  },

  /**
    Used to initialize this state. To only be called by the owning statechart.
  */
  initState: function() {
    if (this.get('stateIsInitialized')) return;
    
    this._registerWithParentStates();
    
    var key = null, 
        value = null,
        state = null,
        substates = [],
        matchedInitialSubstate = NO,
        initialSubstate = this.get('initialSubstate'),
        substatesAreConcurrent = this.get('substatesAreConcurrent'),
        statechart = this.get('statechart'),
        i = 0,
        len = 0,
        valueIsFunc = NO,
        historyState = null;
            
    if (SC.kindOf(initialSubstate, SC.HistoryState) && initialSubstate.isClass) {
      historyState = this.createHistoryState(initialSubstate, { parentState: this, statechart: statechart });
      this.set('initialSubstate', historyState);
      
      if (SC.none(historyState.get('defaultState'))) {
        this.stateLogError("Initial substate is invalid. History state requires the name of a default state to be set");
        this.set('initialSubstate', null);
        historyState = null;
      }
    }
    
    // Iterate through all this state's substates, if any, create them, and then initialize
    // them. This causes a recursive process.
    for (key in this) {
      value = this[key];
      valueIsFunc = SC.typeOf(value) === SC.T_FUNCTION;
      
      if (valueIsFunc && value.isEventHandler) {
        this._registerEventHandler(key, value);
        continue;
      }
      
      if (valueIsFunc && value.isStateObserveHandler) {
        this._registerStateObserveHandler(key, value);
        continue;
      }
      
      if (valueIsFunc && value.statePlugin) {
        value = value.apply(this);
      }
      
      if (SC.kindOf(value, SC.State) && value.isClass && this[key] !== this.constructor) {
        state = this.createSubstate(value, { name: key, parentState: this, statechart: statechart });
        substates.push(state);
        this[key] = state;
        state.initState();
        if (key === initialSubstate) {
          this.set('initialSubstate', state);
          matchedInitialSubstate = YES;
        } else if (historyState && historyState.get('defaultState') === key) {
          historyState.set('defaultState', state);
          matchedInitialSubstate = YES;
        }
      }
    }
    
    if (!SC.none(initialSubstate) && !matchedInitialSubstate) {
      this.stateLogError("Unable to set initial substate %@ since it did not match any of state's %@ substates".fmt(initialSubstate, this));
    }
    
    if (substates.length === 0) {
      if (!SC.none(initialSubstate)) {
        this.stateLogWarning("Unable to make %@ an initial substate since state %@ has no substates".fmt(initialSubstate, this));
      }
    } 
    else if (substates.length > 0) {
      if (SC.none(initialSubstate) && !substatesAreConcurrent) {
        state = this.createEmptyState({ parentState: this, statechart: statechart });
        this.set('initialSubstate', state);
        substates.push(state);
        this[state.get('name')] = state;
        state.initState();
        this.stateLogWarning("state %@ has no initial substate defined. Will default to using an empty state as initial substate".fmt(this));
      } 
      else if (!SC.none(initialSubstate) && substatesAreConcurrent) {
        this.set('initialSubstate', null);
        this.stateLogWarning("Can not use %@ as initial substate since substates are all concurrent for state %@".fmt(initialSubstate, this));
      }
    }
    
    this.set('substates', substates);
    this.set('currentSubstates', []);
    this.set('enteredSubstates', []);
    this.set('stateIsInitialized', YES);
  },
  
  /**
    creates a substate for this state
  */
  createSubstate: function(state, attrs) {
    return state.create(attrs);
  },
  
  /**
    Create a history state for this state
  */
  createHistoryState: function(state, attrs) {
    return state.create(attrs);
  },
  
  /**
    Create an empty state for this state's initial substate
  */
  createEmptyState: function(attrs) {
    return SC.EmptyState.create(attrs);
  },
  
  /** @private 
  
    Registers event handlers with this state. Event handlers are special
    functions on the state that are intended to handle more than one event. This
    compared to basic functions that only respond to a single event that reflects
    the name of the method.
  */
  _registerEventHandler: function(name, handler) {
    var events = handler.events,
        event = null,
        len = events.length,
        i = 0;
        
    this._registeredEventHandlers[name] = handler;
    
    for (; i < len; i += 1) {
      event = events[i];
      
      if (SC.typeOf(event) === SC.T_STRING) {
        this._registeredStringEventHandlers[event] = {
          name: name,
          handler: handler
        };
        continue;
      }
      
      if (event instanceof RegExp) {
        this._registeredRegExpEventHandlers.push({
          name: name,
          handler: handler,
          regexp: event
        });
        continue;
      }
      
      this.stateLogError("Invalid event %@ for event handler %@ in state %@".fmt(event, name, this));
    }
  },
  
  /** @private 
  
    Registers state observe handlers with this state. State observe handlers behave just like
    when you apply observes() on a method but will only be active when the state is currently 
    entered, otherwise the handlers are inactive until the next time the state is entered
  */
  _registerStateObserveHandler: function(name, handler) {
    var i = 0, 
        args = handler.args, 
        len = args.length, 
        arg, validHandlers = YES;
    
    for (; i < len; i += 1) {
      arg = args[i];
      if (SC.typeOf(arg) !== SC.T_STRING || SC.empty(arg)) { 
        this.stateLogError("Invalid argument %@ for state observe handler %@ in state %@".fmt(arg, name, this));
        validHandlers = NO;
      }
    }
    
    if (!validHandlers) return;
    
    this._registeredStateObserveHandlers[name] = handler.args;
  },
  
  /** @private
    Will traverse up through this state's parent states to register
    this state with them.
  */
  _registerWithParentStates: function() {
    this._registerSubstate(this);
    var parent = this.get('parentState');
    while (!SC.none(parent)) {
      parent._registerSubstate(this);
      parent = parent.get('parentState');
    }
  },
  
  /** @private
    Will register a given state as a substate of this state
  */
  _registerSubstate: function(state) {
    var path = state.pathRelativeTo(this);
    if (SC.none(path)) return; 
    
    // Create special private member variables to help
    // keep track of substates and access them.
    if (SC.none(this._registeredSubstatePaths)) {
      this._registeredSubstatePaths = {};
      this._registeredSubstates = [];
    }
    
    this._registeredSubstates.push(state);
    
    // Keep track of states based on their relative path
    // to this state. 
    var regPaths = this._registeredSubstatePaths;
    if (regPaths[state.get('name')] === undefined) {
      regPaths[state.get('name')] = { __ki_paths__: [] };
    }
    
    var paths = regPaths[state.get('name')];
    paths[path] = state;
    paths.__ki_paths__.push(path);
  },
  
  /**
    Will generate path for a given state that is relative to this state. It is
    required that the given state is a substate of this state.
    
    If the heirarchy of the given state to this state is the following:
    A > B > C, where A is this state and C is the given state, then the 
    relative path generated will be "B.C"
  */
  pathRelativeTo: function(state) {
    var path = this.get('name'),
        parent = this.get('parentState');
    
    while (!SC.none(parent) && parent !== state) {
      path = "%@.%@".fmt(parent.get('name'), path);
      parent = parent.get('parentState');
    }
    
    if (parent !== state && state !== this) {
      this.stateLogError('Can not generate relative path from %@ since it not a parent state of %@'.fmt(state, this));
      return null;
    }
    
    return path;
  },
  
  /**
    Used to get a substate of this state that matches a given value. 
    
    If the value is a state object, then the value will be returned if it is indeed 
    a substate of this state, otherwise null is returned. 
    
    If the given value is a string, then the string is assumed to be a path to a substate. 
    The value is then parsed to find the closes match. If there is no match then null 
    is returned. If there is more than one match then null is return and an error 
    is generated indicating ambiguity of the given value. 
    
    Note that when the value is a string, it is assumed to be a path relative to this 
    state; not the root state of the statechart.
  */
  getSubstate: function(value) {
    var valueType = SC.typeOf(value);
    
    // If the value is an object then just check if the value is 
    // a registered substate of this state, and if so return it. 
    if (valueType === SC.T_OBJECT) {
      return this._registeredSubstates.indexOf(value) > -1 ? value : null;
    }
    
    if (valueType !== SC.T_STRING) {
      this.stateLogError("Can not find matching subtype. value must be an object or string: %@".fmt(value));
      return null;
    }
    
    // The value is a string. Therefore treat the value as a relative path to 
    // a substate of this state.
    
    // Extract that last part of the string. Ex. 'foo' => 'foo', 'foo.bar' => 'bar'
    var matches = value.match(/(^|\.)(\w+)$/);
    if (!matches) return null;

    // Get all the paths related to the matched value. If no paths then return null.
    var paths = this._registeredSubstatePaths[matches[2]];
    if (SC.none(paths)) return null;
    
    // Do a quick check to see if there is a path that exactly matches the given
    // value, and if so return the corresponding state
    var state = paths[value];
    if (!SC.none(state)) return state;
    
    // No exact match found. If the value given is a basic string with no ".", then check
    // if there is only one path containing that string. If so, return it. If there is
    // more than one path then it is ambiguous as to what state is trying to be reached.
    if (matches[1] === "") {
      if (paths.__ki_paths__.length === 1) return paths[paths.__ki_paths__[0]];
      if (paths.__ki_paths__.length > 1) {
        var msg = 'Can not find substate matching %@ in state %@. Ambiguous with the following: %@';
        this.stateLogError(msg.fmt(value, this, paths.__ki_paths__));
      }
    } 
    
    return null;
  },
  
  /**
    Used to go to a state in the statechart either directly from this state if it is a current state,
    or from one of this state's current substates.
    
    Note that if the value given is a string, it will be assumed to be a path to a state. The path
    will be relative to the statechart's root state; not relative to this state.
    
    Method can be called in the following ways: 
    
        // With one argument
        gotoState(<state>)
      
        // With two arguments
        gotoState(<state>, <hash>)
    
    Where <state> is either a string or a SC.State object and <hash> is a regular JS hash object.
    
    @param state {SC.State|String} the state to go to
    @param context {Hash} Optional. context object that will be supplied to all states that are
           exited and entered during the state transition process
  */
  gotoState: function(state, context) {
    var fromState = null;
    
    if (this.get('isCurrentState')) {
      fromState = this;
    } else if (this.get('hasCurrentSubstates')) {
      fromState = this.get('currentSubstates')[0];
    }
    
    this.get('statechart').gotoState(state, fromState, context);
  },
  
  /**
    Used to go to a given state's history state in the statechart either directly from this state if it
    is a current state or from one of this state's current substates. 
    
    Note that if the value given is a string, it will be assumed to be a path to a state. The path
    will be relative to the statechart's root state; not relative to this state.
    
    Method can be called in the following ways:
    
        // With one argument
        gotoHistoryState(<state>)
    
        // With two arguments
        gotoHistoryState(<state>, <boolean | hash>)
    
        // With three arguments
        gotoHistoryState(<state>, <boolean>, <hash>)
    
    Where <state> is either a string or a SC.State object and <hash> is a regular JS hash object.
    
    @param state {SC.State|String} the state whose history state to go to
    @param recusive {Boolean} Optional. Indicates whether to follow history states recusively starting
           from the given state
    @param context {Hash} Optional. context object that will be supplied to all states that are exited
           entered during the state transition process
  */
  gotoHistoryState: function(state, recursive, context) {
    var fromState = null;
    
    if (this.get('isCurrentState')) {
      fromState = this;
    } else if (this.get('hasCurrentSubstates')) {
      fromState = this.get('currentSubstates')[0];
    }
    
    this.get('statechart').gotoHistoryState(state, fromState, recursive, context);
  },
  
  /**
    Resumes an active goto state transition process that has been suspended.
  */
  resumeGotoState: function() {
    this.get('statechart').resumeGotoState();
  },
  
  /**
    Used to check if a given state is a current substate of this state. Mainly used in cases
    when this state is a concurrent state.
    
    @param state {State|String} either a state object or the name of a state
    @returns {Boolean} true is the given state is a current substate, otherwise false is returned
  */
  stateIsCurrentSubstate: function(state) {
    if (SC.typeOf(state) === SC.T_STRING) state = this.get('statechart').getState(state);
    var current = this.get('currentSubstates');
    return !!current && current.indexOf(state) >= 0;
  }, 
  
  /**
    Used to check if a given state is a substate of this state that is currently entered. 
    
    @param state {State|String} either a state object of the name of a state
    @returns {Boolean} true if the given state is a entered substate, otherwise false is returned
  */
  stateIsEnteredSubstate: function(state) {
    if (SC.typeOf(state) === SC.T_STRING) state = this.get('statechart').getState(state);
    var entered = this.get('enteredSubstates');
    return !!entered && entered.indexOf(state) >= 0;
  },
  
  /**
    Indicates if this state is the root state of the statechart.
    
    @property {Boolean}
  */
  isRootState: function() {
    return this.getPath('statechart.rootState') === this;
  }.property(),
  
  /**
    Indicates if this state is a current state of the statechart.
    
    @property {Boolean} 
  */
  isCurrentState: function() {
    return this.stateIsCurrentSubstate(this);
  }.property('currentSubstates').cacheable(),
  
  /**
    Indicates if this state is a concurrent state
    
    @property {Boolean}
  */
  isConcurrentState: function() {
    return this.getPath('parentState.substatesAreConcurrent');
  }.property(),
  
  /**
    Indicates if this state is a currently entered state. 
    
    A state is currently entered if during a state transition process the
    state's enterState method was invoked, but only after its exitState method 
    was called, if at all.
  */
  isEnteredState: function() {
    return this.stateIsEnteredSubstate(this);
  }.property('enteredSubstates').cacheable(),
  
  /**
    Indicate if this state has any substates
    
    @propety {Boolean}
  */
  hasSubstates: function() {
    return this.getPath('substates.length') > 0;
  }.property('substates'),
  
  /**
    Indicates if this state has any current substates
  */
  hasCurrentSubstates: function() {
    var current = this.get('currentSubstates');
    return !!current && current.get('length') > 0;
  }.property('currentSubstates').cacheable(),
  
  /**
    Indicates if this state has any currently entered substates
  */
  hasEnteredSubstates: function() {
    var entered = this.get('enteredSubstates');
    return !!entered  && entered.get('length') > 0;
  }.property('enteredSubstates').cacheable(),
  
  /**
    Used to re-enter this state. Call this only when the state a current state of
    the statechart.  
  */
  reenter: function() {
    var statechart = this.get('statechart');
    if (this.get('isCurrentState')) {
      statechart.gotoState(this);
    } else {
       SC.Logger.error('Can not re-enter state %@ since it is not a current state in the statechart'.fmt(this));
    }
  },
  
  /**
    Called by the statechart to allow a state to try and handle the given event. If the
    event is handled by the state then YES is returned, otherwise NO.
    
    There is a particular order in how an event is handled by a state:
    
     1. Basic function whose name matches the event
     2. Registered event handler that is associated with an event represented as a string
     3. Registered event handler that is associated with events matching a regular expression
     4. The unknownEvent function
      
    Use of event handlers that are associated with events matching a regular expression may
    incur a performance hit, so they should be used sparingly.
    
    The unknownEvent function is only invoked if the state has it, otherwise it is skipped. Note that
    you should be careful when using unknownEvent since it can be either abused or cause unexpected
    behavior.
    
    Example of a state using all four event handling techniques:
    
        SC.State.extend({
      
          // Basic function handling event 'foo'
          foo: function(arg1, arg2) { ... },
        
          // event handler that handles 'frozen' and 'canuck'
          eventHandlerA: function(event, arg1, arg2) {
            ...
          }.handleEvent('frozen', 'canuck'),
        
          // event handler that handles events matching the regular expression /num\d/
          //   ex. num1, num2
          eventHandlerB: function(event, arg1, arg2) {
            ...
          }.handleEvent(/num\d/),
        
          // Handle any event that was not handled by some other
          // method on the state
          unknownEvent: function(event, arg1, arg2) {
        
          }
      
        });
  */
  tryToHandleEvent: function(event, arg1, arg2) {

    var trace = this.get('trace');

    // First check if the name of the event is the same as a registered event handler. If so,
    // then do not handle the event.
    if (this._registeredEventHandlers[event]) {
      this.stateLogWarning("state %@ can not handle event %@ since it is a registered event handler".fmt(this, event));
      return NO;
    }    
    
    if (this._registeredStateObserveHandlers[event]) {
      this.stateLogWarning("state %@ can not handle event %@ since it is a registered state observe handler".fmt(this, event));
      return NO;
    }
    
    // Now begin by trying a basic method on the state to respond to the event
    if (SC.typeOf(this[event]) === SC.T_FUNCTION) {
      if (trace) this.stateLogTrace("will handle event %@".fmt(event));
      return (this[event](arg1, arg2) !== NO);
    }
    
    // Try an event handler that is associated with an event represented as a string
    var handler = this._registeredStringEventHandlers[event];
    if (handler) {
      if (trace) this.stateLogTrace("%@ will handle event %@".fmt(handler.name, event));
      return (handler.handler.call(this, event, arg1, arg2) !== NO);
    }
    
    // Try an event handler that is associated with events matching a regular expression
    
    var len = this._registeredRegExpEventHandlers.length,
        i = 0;
        
    for (; i < len; i += 1) {
      handler = this._registeredRegExpEventHandlers[i];
      if (event.match(handler.regexp)) {
        if (trace) this.stateLogTrace("%@ will handle event %@".fmt(handler.name, event));
        return (handler.handler.call(this, event, arg1, arg2) !== NO);
      }
    }
    
    // Final attempt. If the state has an unknownEvent function then invoke it to 
    // handle the event
    if (SC.typeOf(this['unknownEvent']) === SC.T_FUNCTION) {
      if (trace) this.stateLogTrace("unknownEvent will handle event %@".fmt(event));
      return (this.unknownEvent(event, arg1, arg2) !== NO);
    }
    
    // Nothing was able to handle the given event for this state
    return NO;
  },
  
  /**
    Called whenever this state is to be entered during a state transition process. This 
    is useful when you want the state to perform some initial set up procedures. 
    
    If when entering the state you want to perform some kind of asynchronous action, such
    as an animation or fetching remote data, then you need to return an asynchronous 
    action, which is done like so:
    
        enterState: function() {
          return this.performAsync('foo');
        }
    
    After returning an action to be performed asynchronously, the statechart will suspend
    the active state transition process. In order to resume the process, you must call
    this state's resumeGotoState method or the statechart's resumeGotoState. If no asynchronous 
    action is to be perform, then nothing needs to be returned.
    
    When the enterState method is called, an optional context value may be supplied if
    one was provided to the gotoState method.
    
    @param context {Hash} Optional value if one was supplied to gotoState when invoked
  */
  enterState: function(context) { },
  
  /**
    Notification called just before enterState is invoked. 
    
    Note: This is intended to be used by the owning statechart but it can be overridden if 
    you need to do something special.
    
    @see #enterState
  */
  stateWillBecomeEntered: function() { },
  
  /**
    Notification called just after enterState is invoked. 
    
    Note: This is intended to be used by the owning statechart but it can be overridden if 
    you need to do something special.
    
    @see #enterState
  */
  stateDidBecomeEntered: function() { 
    this._setupAllStateObserveHandlers();
  },
  
  /**
    Called whenever this state is to be exited during a state transition process. This is 
    useful when you want the state to peform some clean up procedures.
    
    If when exiting the state you want to perform some kind of asynchronous action, such
    as an animation or fetching remote data, then you need to return an asynchronous 
    action, which is done like so:
    
        exitState: function() {
          return this.performAsync('foo');
        }
    
    After returning an action to be performed asynchronously, the statechart will suspend
    the active state transition process. In order to resume the process, you must call
    this state's resumeGotoState method or the statechart's resumeGotoState. If no asynchronous 
    action is to be perform, then nothing needs to be returned.
    
    When the exitState method is called, an optional context value may be supplied if
    one was provided to the gotoState method.
    
    @param context {Hash} Optional value if one was supplied to gotoState when invoked
  */
  exitState: function(context) { },
  
  /**
    Notification called just before exitState is invoked. 
    
    Note: This is intended to be used by the owning statechart but it can be overridden 
    if you need to do something special.
    
    @see #exitState
  */
  stateWillBecomeExited: function() { 
    this._teardownAllStateObserveHandlers();
  },
  
  /**
    Notification called just after exitState is invoked. 
    
    Note: This is intended to be used by the owning statechart but it can be overridden 
    if you need to do something special.
    
    @see #exitState
  */
  stateDidBecomeExited: function() { },
  
  /** @private 
  
    Used to setup all the state observer handlers. Should be done when
    the state has been entered.
  */
  _setupAllStateObserveHandlers: function() {
    this._configureAllStateObserveHandlers('addObserver');
  },
  
  /** @private 
  
    Used to teardown all the state observer handlers. Should be done when
    the state is being exited.
  */
  _teardownAllStateObserveHandlers: function() {
    this._configureAllStateObserveHandlers('removeObserver');
  },
  
  /** @private 
  
    Primary method used to either add or remove this state as an observer
    based on all the state observe handlers that have been registered with
    this state.
    
    Note: The code to add and remove the state as an observer has been
    taken from the observerable mixin and made slightly more generic. However,
    having this code in two different places is not ideal, but for now this
    will have to do. In the future the code should be refactored so that
    there is one common function that both the observerable mixin and the 
    statechart framework use.  
  */
  _configureAllStateObserveHandlers: function(action) {
    var key, values, value, dotIndex, path, observer, i, root;

    for (key in this._registeredStateObserveHandlers) {
      values = this._registeredStateObserveHandlers[key];
      for (i = 0; i < values.length; i += 1) {
        path = values[i]; observer = key;
  
        // Use the dot index in the path to determine how the state
        // should add itself as an observer.
  
        dotIndex = path.indexOf('.');

        if (dotIndex < 0) {
          this[action](path, this, observer);
        } else if (path.indexOf('*') === 0) {
          this[action](path.slice(1), this, observer);
        } else {
          root = null;

          if (dotIndex === 0) {
            root = this; path = path.slice(1);
          } else if (dotIndex === 4 && path.slice(0, 5) === 'this.') {
            root = this; path = path.slice(5);
          } else if (dotIndex < 0 && path.length === 4 && path === 'this') {
            root = this; path = '';
          }

          SC.Observers[action](path, this, observer, root);
        }
      }
    }
  },
  
  /**
    Call when an asynchronous action need to be performed when either entering or exiting
    a state.
    
    @see enterState
    @see exitState
  */
  performAsync: function(func, arg1, arg2) {
    return SC.Async.perform(func, arg1, arg2);
  },
  
  /** @override
  
    Returns YES if this state can respond to the given event, otherwise
    NO is returned
  
    @param event {String} the value to check
    @returns {Boolean}
  */
  respondsToEvent: function(event) {
    if (this._registeredEventHandlers[event]) return false;
    if (SC.typeOf(this[event]) === SC.T_FUNCTION) return true;
    if (this._registeredStringEventHandlers[event]) return true;
    if (this._registeredStateObserveHandlers[event]) return false;
    
    var len = this._registeredRegExpEventHandlers.length,
        i = 0,
        handler;
        
    for (; i < len; i += 1) {
      handler = this._registeredRegExpEventHandlers[i];
      if (event.match(handler.regexp)) return true;
    }
    
    return SC.typeOf(this['unknownEvent']) === SC.T_FUNCTION;
  },
  
  /**
    Returns the path for this state relative to the statechart's
    root state. 
    
    The path is a dot-notation string representing the path from
    this state to the statechart's root state, but without including
    the root state in the path. For instance, if the name of this
    state if "foo" and the parent state's name is "bar" where bar's
    parent state is the root state, then the full path is "bar.foo"
  
    @property {String}
  */
  fullPath: function() {
    var root = this.getPath('statechart.rootState');
    if (!root) return this.get('name');
    return this.pathRelativeTo(root);
  }.property('name', 'parentState').cacheable(),
  
  toString: function() {
    var className = SC._object_className(this.constructor);
    return "%@<%@, %@>".fmt(className, this.get('fullPath'), SC.guidFor(this));
  },
  
  /** @private */
  _statechartTraceDidChange: function() {
    this.notifyPropertyChange('trace');
  },
  
  /** @private */
  _statechartOwnerDidChange: function() {
    this.notifyPropertyChange('owner');
  },
  
  /** 
    Used to log a state trace message
  */
  stateLogTrace: function(msg) {
    var sc = this.get('statechart');
    sc.statechartLogTrace("%@: %@".fmt(this, msg));
  },

  /** 
    Used to log a state warning message
  */
  stateLogWarning: function(msg) {
    var sc = this.get('statechart');
    sc.statechartLogWarning(msg);
  },
  
  /** 
    Used to log a state error message
  */
  stateLogError: function(msg) {
    var sc = this.get('statechart');
    sc.statechartLogError(msg);
  }

});

/**
  Use this when you want to plug-in a state into a statechart. This is beneficial
  in cases where you split your statechart's states up into multiple files and
  don't want to fuss with the sc_require construct.
  
  Example:
  
      MyApp.statechart = SC.Statechart.create({
        rootState: SC.State.design({
          initialSubstate: 'a',
          a: SC.State.plugin('path.to.a.state.class'),
          b: SC.State.plugin('path.to.another.state.class')
        })
      });
    
  You can also supply hashes the plugin feature in order to enhance a state or
  implement required functionality:

      SomeMixin = { ... };

      stateA: SC.State.plugin('path.to.state', SomeMixin, { ... })

  @param value {String} property path to a state class
  @param args {Hash,...} Optional. Hash objects to be added to the created state
*/
SC.State.plugin = function(value) {
  var args = SC.A(arguments); args.shift();
  var func = function() {
    var klass = SC.objectForPropertyPath(value);
    if (!klass) {
      console.error('SC.State.plugin: Unable to determine path %@'.fmt(value));
      return undefined;
    }
    if (!klass.isClass || !klass.kindOf(SC.State)) {
      console.error('SC.State.plugin: Unable to extend. %@ must be a class extending from SC.State'.fmt(value));
      return undefined;
    }
    return klass.extend.apply(klass, args);
  };
  func.statePlugin = YES;
  return func;
};

SC.State.design = SC.State.extend;

/* >>>>>>>>>> BEGIN source/system/empty_state.js */
// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

sc_require('system/state');

/** 
  The default name given to an empty state
*/
SC.EMPTY_STATE_NAME = "__EMPTY_STATE__";

/**
  @class
  
  Represents an empty state that gets assigned as a state's initial substate 
  if the state does not have an initial substate defined.

  @extends SC.State
*/
SC.EmptyState = SC.State.extend(/** @scope SC.EmptyState.prototype */{
  
  name: SC.EMPTY_STATE_NAME,
  
  enterState: function() {
    var msg = "No initial substate was defined for state %@. Entering default empty state";
    this.stateLogWarning(msg.fmt(this.get('parentState')));
  }
  
});

/* >>>>>>>>>> BEGIN source/system/history_state.js */
// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

sc_require('system/state');

/**
  @class

  Represents a history state that can be assigned to a SC.State object's
  initialSubstate property. 
  
  If a SC.HistoryState object is assigned to a state's initial substate, 
  then after a state is entered the statechart will refer to the history 
  state object to determine the next course of action. If the state has 
  its historyState property assigned then the that state will be entered, 
  otherwise the default state assigned to history state object will be entered.
  
  An example of how to use:
  
    stateA: SC.State.design({
    
      initialSubstate: SC.HistoryState({
        defaultState: 'stateB'
      }),
      
      stateB: SC.State.design({ ... }),
      
      stateC: SC.State.design({ ... })
    
    })
  
  @author Michael Cohen
  @extends SC.Object
*/
SC.HistoryState = SC.Object.extend(
  /** @scope SC.HistoryState.prototype */{

  /**
    Used to indicate if the statechart should recurse the 
    history states after entering the this object's parent state
    
    @property {Boolean}
  */
  isRecursive: NO,
  
  /**
    The default state to enter if the parent state does not
    yet have its historyState property assigned to something 
    other than null.
    
    The value assigned to this property must be the name of an
    immediate substate that belongs to the parent state. The
    statechart will manage the property upon initialization.
    
    @property {String}
  */
  defaultState: null,
  
  /** @private
    Managed by the statechart 
    
    The statechart that owns this object.
  */
  statechart: null,
  
  /** @private
    Managed by the statechart 
  
    The state that owns this object
  */
  parentState: null,
  
  /**
    Used by the statechart during a state transition process. 
    
    Returns a state to enter based on whether the parent state has
    its historyState property assigned. If not then this object's
    assigned default state is returned.
  */
  state: function() {
    var defaultState = this.get('defaultState'),
        historyState = this.getPath('parentState.historyState');
    return !!historyState ? historyState : defaultState;
  }.property().cacheable(),
  
  /** @private */
  parentHistoryStateDidChange: function() {
    this.notifyPropertyChange('state');
  }.observes('*parentState.historyState')
  
});

/* >>>>>>>>>> BEGIN source/system/statechart.js */
// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

sc_require('system/state');

/**
  @class

  The startchart manager mixin allows an object to be a statechart. By becoming a statechart, the
  object can then be manage a set of its own states.
  
  This implemention of the statechart manager closely follows the concepts stated in D. Harel's 
  original paper "Statecharts: A Visual Formalism For Complex Systems" 
  (www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf). 
  
  The statechart allows for complex state heircharies by nesting states within states, and 
  allows for state orthogonality based on the use of concurrent states.
  
  At minimum, a statechart must have one state: The root state. All other states in the statechart
  are a decendents (substates) of the root state.
  
  The following example shows how states are nested within a statechart:
  
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        rootState: SC.State.design({
          initialSubstate: 'stateA',

          stateA: SC.State.design({
            // ... can continue to nest further states
          }),
        
          stateB: SC.State.design({
            // ... can continue to nest further states
          })
        })
      });
  
  Note how in the example above, the root state as an explicit initial substate to enter into. If no
  initial substate is provided, then the statechart will default to the the state's first substate.
  
  You can also defined states without explicitly defining the root state. To do so, simply create properties
  on your object that represents states. Upon initialization, a root state will be constructed automatically
  by the mixin and make the states on the object substates of the root state. As an example:
  
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        initialState: 'stateA',

        stateA: SC.State.design({
          // ... can continue to nest further states
        }),
      
        stateB: SC.State.design({
          // ... can continue to nest further states
        })
      });
  
  If you liked to specify a class that should be used as the root state but using the above method to defined
  states, you can set the rootStateExample property with a class that extends from SC.State. If the 
  rootStateExample property is not explicitly assigned the then default class used will be SC.State.
  
  To provide your statechart with orthogonality, you use concurrent states. If you use concurrent states,
  then your statechart will have multiple current states. That is because each concurrent state represents an
  independent state structure from other concurrent states. The following example shows how to provide your
  statechart with concurrent states:
  
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        rootState: SC.State.design({
          substatesAreConcurrent: YES,

          stateA: SC.State.design({
            // ... can continue to nest further states
          }),
        
          stateB: SC.State.design({
            // ... can continue to nest further states
          })
        })
      });
  
  Above, to indicate that a state's substates are concurrent, you just have to set the substatesAreConcurrent to 
  YES. Once done, then stateA and stateB will be independent of each other and each will manage their
  own current substates. The root state will then have more then one current substate.
  
  To define concurrent states directly on the object without explicitly defining a root, you can do the 
  following:
  
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        statesAreConcurrent: YES,

        stateA: SC.State.design({
          // ... can continue to nest further states
        }),
    
        stateB: SC.State.design({
          // ... can continue to nest further states
        })
      });
  
  Remember that a startchart can have a mixture of nested and concurrent states in order for you to 
  create as complex of statecharts that suite your needs. Here is an example of a mixed state structure:
  
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        rootState: SC.State.design({
          initialSubstate: 'stateA',

          stateA: SC.State.design({
            substatesAreConcurrent: YES,

            stateM: SC.State.design({ ... })
            stateN: SC.State.design({ ... })
            stateO: SC.State.design({ ... })
          }),
        
          stateB: SC.State.design({
            initialSubstate: 'stateX',

            stateX: SC.State.design({ ... })
            stateY: SC.State.desgin({ ... })
          })
        })
      });
  
  Depending on your needs, a statechart can have lots of states, which can become hard to manage all within
  one file. To modularize your states and make them easier to manage and maintain, you can plug-in states
  into other states. Let's say we are using the statechart in the last example above, and all the code is 
  within one file. We could update the code and split the logic across two or more files like so:

      // state_a.js

      MyApp.StateA = SC.State.extend({
        substatesAreConcurrent: YES,

        stateM: SC.State.design({ ... })
        stateN: SC.State.design({ ... })
        stateO: SC.State.design({ ... })
      });

      // state_b.js

      MyApp.StateB = SC.State.extend({
        substatesAreConcurrent: YES,

        stateM: SC.State.design({ ... })
        stateN: SC.State.design({ ... })
        stateO: SC.State.design({ ... })
      });

      // statechart.js

      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        rootState: SC.State.design({
          initialSubstate: 'stateA',
          stateA: SC.State.plugin('MyApp.StateA'),
          stateB: SC.State.plugin('MyApp.StateB')
        })
      });

  Using state plug-in functionality is optional. If you use the plug-in feature you can break up your statechart
  into as many files as you see fit.

  @author Michael Cohen
*/

SC.StatechartManager = /** @scope SC.StatechartManager.prototype */{
  
  // Walk like a duck
  isResponderContext: YES,
  
  // Walk like a duck
  isStatechart: YES,
  
  /**
    Indicates if this statechart has been initialized

    @property {Boolean}
  */
  statechartIsInitialized: NO,
  
  /**
    The root state of this statechart. All statecharts must have a root state.
    
    If this property is left unassigned then when the statechart is initialized
    it will used the rootStateExample, initialState, and statesAreConcurrent
    properties to construct a root state.
    
    @see #rootStateExample
    @see #initialState
    @see #statesAreConcurrent
    
    @property {SC.State}
  */
  rootState: null,
  
  /** 
    Represents the class used to construct a class that will be the root state for
    this statechart. The class assigned must derive from SC.State. 
    
    This property will only be used if the rootState property is not assigned.
  
    @see #rootState
  
    @property {SC.State}
  */
  rootStateExample: SC.State,
  
  /** 
    Indicates what state should be the intiail state of this statechart. The value
    assigned must be the name of a property on this object that represents a state.
    As well, the statesAreConcurrent must be set to NO.
    
    This property will only be used if the rootState property is not assigned.
  
    @see #rootState
  
    @property {String} 
  */
  initialState: null,
  
  /** 
    Indicates if properties on this object representing states are concurrent to each other.
    If YES then they are concurrent, otherwise they are not. If the YES, then the
    initialState property must not be assigned.
    
    This property will only be used if the rootState property is not assigned.
  
    @see #rootState
  
    @property {Boolean}
  */
  statesAreConcurrent: NO,
  
  /** 
    Indicates whether to use a monitor to monitor that statechart's activities. If true then
    the monitor will be active, otherwise the monitor will not be used. Useful for debugging
    purposes.
    
    @property {Boolean}
  */
  monitorIsActive: NO,
  
  /**
    A statechart monitor that can be used to monitor this statechart. Useful for debugging purposes.
    A monitor will only be used if monitorIsActive is true.
    
    @property {SC.StatechartMonitor}
  */
  monitor: null,
  
  /**
    Used to specify what property (key) on the statechart should be used as the trace property. By
    default the property is 'trace'.

    @property {String}
  */
  statechartTraceKey: 'trace',

  /**
    Indicates whether to trace the statecharts activities. If true then the statechart will output
    its activites to the browser's JS console. Useful for debugging purposes.

    @see #statechartTraceKey

    @property {Boolean}
  */
  trace: NO,
  
  /**
    Used to specify what property (key) on the statechart should be used as the owner property. By
    default the property is 'owner'.

    @property {String}
  */
  statechartOwnerKey: 'owner',

  /**
    Sets who the owner is of this statechart. If null then the owner is this object otherwise
    the owner is the assigned object. 

    @see #statechartOwnerKey

    @property {SC.Object}
  */
  owner: null,

  /** 
    Indicates if the statechart should be automatically initialized by this
    object after it has been created. If YES then initStatechart will be
    called automatically, otherwise it will not.
  
    @property {Boolean}
  */
  autoInitStatechart: YES,
  
  /**
    If yes, any warning messages produced by the statechart or any of its states will
    not be logged, otherwise all warning messages will be logged. 
    
    While designing and debugging your statechart, it's best to keep this value false.
    In production you can then suppress the warning messages.
    
    @property {Boolean}
  */
  suppressStatechartWarnings: NO,
  
  initMixin: function() {
    if (this.get('autoInitStatechart')) {
      this.initStatechart();
    }
  },
  
  destroyMixin: function() {
    var root = this.get('rootState'),
        traceKey = this.get('statechartTraceKey');

    this.removeObserver(traceKey, this, '_statechartTraceDidChange');

    root.destroy();
    this.set('rootState', null);
  },

  /**
    Initializes the statechart. By initializing the statechart, it will create all the states and register
    them with the statechart. Once complete, the statechart can be used to go to states and send events to.
  */
  initStatechart: function() {
    if (this.get('statechartIsInitialized')) return;
    
    this._gotoStateLocked = NO;
    this._sendEventLocked = NO;
    this._pendingStateTransitions = [];
    this._pendingSentEvents = [];
    
    this.sendAction = this.sendEvent;
    
    if (this.get('monitorIsActive')) {
      this.set('monitor', SC.StatechartMonitor.create({ statechart: this }));
    }

    var traceKey = this.get('statechartTraceKey');

    this.addObserver(traceKey, this, '_statechartTraceDidChange');
    this._statechartTraceDidChange();

    var trace = this.get('allowStatechartTracing'),
        rootState = this.get('rootState'),
        msg;
    
    if (trace) this.statechartLogTrace("BEGIN initialize statechart");
    
    // If no root state was explicitly defined then try to construct
    // a root state class
    if (!rootState) {
      rootState = this._constructRootStateClass();
    }
    else if (SC.typeOf(rootState) === SC.T_FUNCTION && rootState.statePlugin) {
      rootState = rootState.apply(this);
    }
    
    if (!(SC.kindOf(rootState, SC.State) && rootState.isClass)) {
      msg = "Unable to initialize statechart. Root state must be a state class";
      this.statechartLogError(msg);
      throw msg;
    }
    
    rootState = this.createRootState(rootState, { 
      statechart: this, 
      name: SC.ROOT_STATE_NAME 
    });
    
    this.set('rootState', rootState);
    rootState.initState();
    
    if (SC.kindOf(rootState.get('initialSubstate'), SC.EmptyState)) {
      msg = "Unable to initialize statechart. Root state must have an initial substate explicilty defined";
      this.statechartLogError(msg);
      throw msg;
    }
    
    if (!SC.empty(this.get('initialState'))) {
      var key = 'initialState';
      this.set(key, rootState.get(this.get(key)));
    } 
    
    this.set('statechartIsInitialized', YES);
    this.gotoState(rootState);
    
    if (trace) this.statechartLogTrace("END initialize statechart");
  },
  
  /**
    Will create a root state for the statechart
  */
  createRootState: function(state, attrs) {
    if (!attrs) attrs = {};
    state = state.create(attrs);
    return state;
  },
  
  /**
    Returns an array of all the current states for this statechart
    
    @returns {Array} the current states
  */
  currentStates: function() {
    return this.getPath('rootState.currentSubstates');
  }.property().cacheable(),
  
  /**
    Returns the first current state for this statechart. 
    
    @return {SC.State}
  */
  firstCurrentState: function() {
    var cs = this.get('currentStates');
    return cs ? cs.objectAt(0) : null;
  }.property('currentStates').cacheable(),
  
  /**
    Returns the count of the current states for this statechart
    
    @returns {Number} the count 
  */
  currentStateCount: function() {
    return this.getPath('currentStates.length');
  }.property('currentStates').cacheable(),
  
  /**
    Checks if a given state is a current state of this statechart. 
    
    @param state {State|String} the state to check
    @returns {Boolean} true if the state is a current state, otherwise fals is returned
  */
  stateIsCurrentState: function(state) {
    return this.get('rootState').stateIsCurrentSubstate(state);
  },
  
  /**
    Returns an array of all the states that are currently entered for
    this statechart.
    
    @returns {Array} the currently entered states
  */
  enteredStates: function() {
    return this.getPath('rootState.enteredSubstates');
  }.property().cacheable(),
  
  /**
    Checks if a given state is a currently entered state of this statechart.
    
    @param state {State|String} the state to check
    @returns {Boolean} true if the state is a currently entered state, otherwise false is returned
  */
  stateIsEntered: function(state) {
    return this.get('rootState').stateIsEnteredSubstate(state);
  },
  
  /**
    Checks if the given value represents a state is this statechart
    
    @param value {State|String} either a state object or the name of a state
    @returns {Boolean} true if the state does belong ot the statechart, otherwise false is returned
  */
  doesContainState: function(value) {
    return !SC.none(this.getState(value));
  },
  
  /**
    Gets a state from the statechart that matches the given value
    
    @param value {State|String} either a state object of the name of a state
    @returns {State} if a match then the matching state is returned, otherwise null is returned 
  */
  getState: function(value) {
    return this.get('rootState').getSubstate(value);
  },
  
  /**
    When called, the statechart will proceed with making state transitions in the statechart starting from 
    a current state that meet the statechart conditions. When complete, some or all of the statechart's 
    current states will be changed, and all states that were part of the transition process will either 
    be exited or entered in a specific order.
    
    The state that is given to go to will not necessarily be a current state when the state transition process
    is complete. The final state or states are dependent on factors such an initial substates, concurrent 
    states, and history states.
    
    Because the statechart can have one or more current states, it may be necessary to indicate what current state
    to start from. If no current state to start from is provided, then the statechart will default to using
    the first current state that it has; depending of the make up of the statechart (no concurrent state vs.
    with concurrent states), the outcome may be unexpected. For a statechart with concurrent states, it is best
    to provide a current state in which to start from.
    
    When using history states, the statechart will first make transitions to the given state and then use that
    state's history state and recursively follow each history state's history state until there are no 
    more history states to follow. If the given state does not have a history state, then the statechart
    will continue following state transition procedures.
    
    Method can be called in the following ways:
    
        // With one argument. 
        gotoState(<state>)
      
        // With two argument.
        gotoState(<state>, <state | boolean | hash>)
      
        // With three argument.
        gotoState(<state>, <state>, <boolean | hash>)
        gotoState(<state>, <boolean>, <hash>)
      
        // With four argument.
        gotoState(<state>, <state>, <boolean>, <hash>)
    
    where <state> is either a SC.State object or a string and <hash> is a regular JS hash object.
    
    @param state {SC.State|String} the state to go to (may not be the final state in the transition process)
    @param fromCurrentState {SC.State|String} Optional. The current state to start the transition process from.
    @param useHistory {Boolean} Optional. Indicates whether to include using history states in the transition process
    @param context {Hash} Optional. A context object that will be passed to all exited and entered states
  */
  gotoState: function(state, fromCurrentState, useHistory, context) {
    
    if (!this.get('statechartIsInitialized')) {
      this.statechartLogError("can not go to state %@. statechart has not yet been initialized".fmt(state));
      return;
    }
    
    if (this.get('isDestroyed')) {
      this.statechartLogError("can not go to state %@. statechart is destroyed".fmt(this));
      return;
    }
    
    var args = this._processGotoStateArgs(arguments);

    state = args.state;
    fromCurrentState = args.fromCurrentState;
    useHistory = args.useHistory;
    context = args.context;
    
    var pivotState = null,
        exitStates = [],
        enterStates = [],
        trace = this.get('allowStatechartTracing'),
        rootState = this.get('rootState'),
        paramState = state,
        paramFromCurrentState = fromCurrentState,
        msg;
    
    state = rootState.getSubstate(state);
    
    if (SC.none(state)) {
      this.statechartLogError("Can not to goto state %@. Not a recognized state in statechart".fmt(paramState));
      return;
    }
    
    if (this._gotoStateLocked) {
      // There is a state transition currently happening. Add this requested state
      // transition to the queue of pending state transitions. The request will
      // be invoked after the current state transition is finished.
      this._pendingStateTransitions.push({
        state: state,
        fromCurrentState: fromCurrentState,
        useHistory: useHistory,
        context: context
      });
      
      return;
    }
    
    // Lock the current state transition so that no other requested state transition 
    // interferes. 
    this._gotoStateLocked = YES;
    
    if (!SC.none(fromCurrentState)) {
      // Check to make sure the current state given is actually a current state of this statechart
      fromCurrentState = rootState.getSubstate(fromCurrentState);
      if (SC.none(fromCurrentState) || !fromCurrentState.get('isCurrentState')) {
        msg = "Can not to goto state %@. %@ is not a recognized current state in statechart";
        this.statechartLogError(msg.fmt(paramState, paramFromCurrentState));
        this._gotoStateLocked = NO;
        return;
      }
    } 
    else if (this.getPath('currentStates.length') > 0) {
      // No explicit current state to start from; therefore, just use the first current state as 
      // a default, if there is a current state.
      fromCurrentState = this.get('currentStates')[0];
      msg = "gotoState: fromCurrentState not explicitly provided. Using a default current state to transition from: %@";
      this.statechartLogWarning(msg.fmt(fromCurrentState));
    }
        
    if (trace) {
      this.statechartLogTrace("BEGIN gotoState: %@".fmt(state));
      msg = "starting from current state: %@";
      msg = msg.fmt(fromCurrentState ? fromCurrentState : '---');
      this.statechartLogTrace(msg);
      msg = "current states before: %@";
      msg = msg.fmt(this.getPath('currentStates.length') > 0 ? this.get('currentStates') : '---');
      this.statechartLogTrace(msg);
    }

    // If there is a current state to start the transition process from, then determine what
    // states are to be exited
    if (!SC.none(fromCurrentState)) {
      exitStates = this._createStateChain(fromCurrentState);
    }
    
    // Now determine the initial states to be entered
    enterStates = this._createStateChain(state);
    
    // Get the pivot state to indicate when to go from exiting states to entering states
    pivotState = this._findPivotState(exitStates, enterStates);

    if (pivotState) {
      if (trace) this.statechartLogTrace("pivot state = %@".fmt(pivotState));
      if (pivotState.get('substatesAreConcurrent')) {
        this.statechartLogError("Can not go to state %@ from %@. Pivot state %@ has concurrent substates.".fmt(state, fromCurrentState, pivotState));
        this._gotoStateLocked = NO;
        return;
      }
    }
    
    // Collect what actions to perform for the state transition process
    var gotoStateActions = [];
    
    // Go ahead and find states that are to be exited
    this._traverseStatesToExit(exitStates.shift(), exitStates, pivotState, gotoStateActions);
    
    // Now go find states that are to entered
    if (pivotState !== state) {
      this._traverseStatesToEnter(enterStates.pop(), enterStates, pivotState, useHistory, gotoStateActions);
    } else {
      this._traverseStatesToExit(pivotState, [], null, gotoStateActions);
      this._traverseStatesToEnter(pivotState, null, null, useHistory, gotoStateActions);
    }
    
    // Collected all the state transition actions to be performed. Now execute them.
    this._executeGotoStateActions(state, gotoStateActions, null, context);
  },
  
  /**
    Indicates if the statechart is in an active goto state process
  */
  gotoStateActive: function() {
    return this._gotoStateLocked;
  }.property(),
  
  /**
    Indicates if the statechart is in an active goto state process
    that has been suspended
  */
  gotoStateSuspended: function() {
    return this._gotoStateLocked && !!this._gotoStateSuspendedPoint;
  }.property(),
  
  /**
    Resumes an active goto state transition process that has been suspended.
  */
  resumeGotoState: function() {
    if (!this.get('gotoStateSuspended')) {
      this.statechartLogError("Can not resume goto state since it has not been suspended");
      return;
    }
    
    var point = this._gotoStateSuspendedPoint;
    this._executeGotoStateActions(point.gotoState, point.actions, point.marker, point.context);
  },
  
  /** @private */
  _executeGotoStateActions: function(gotoState, actions, marker, context) {
    var action = null,
        len = actions.length,
        actionResult = null;
      
    marker = SC.none(marker) ? 0 : marker;
    
    for (; marker < len; marker += 1) {
      action = actions[marker];
      switch (action.action) {
        case SC.EXIT_STATE:
          actionResult = this._exitState(action.state, context);
          break;
          
        case SC.ENTER_STATE:
          actionResult = this._enterState(action.state, action.currentState, context);
          break;
      }
      
      //
      // Check if the state wants to perform an asynchronous action during
      // the state transition process. If so, then we need to first
      // suspend the state transition process and then invoke the 
      // asynchronous action. Once called, it is then up to the state or something 
      // else to resume this statechart's state transition process by calling the
      // statechart's resumeGotoState method.
      //
      if (SC.kindOf(actionResult, SC.Async)) {
        this._gotoStateSuspendedPoint = {
          gotoState: gotoState,
          actions: actions,
          marker: marker + 1,
          context: context
        }; 
        
        actionResult.tryToPerform(action.state);
        return;
      }
    }
    
    this.beginPropertyChanges();
    this.notifyPropertyChange('currentStates');
    this.notifyPropertyChange('enteredStates');
    this.endPropertyChanges();
    
    if (this.get('allowStatechartTracing')) {
      this.statechartLogTrace("current states after: %@".fmt(this.get('currentStates')));
      this.statechartLogTrace("END gotoState: %@".fmt(gotoState));
    }
    
    // Okay. We're done with the current state transition. Make sure to unlock the
    // gotoState and let other pending state transitions execute.
    this._gotoStateSuspendedPoint = null;
    this._gotoStateLocked = NO;
    this._flushPendingStateTransition();
  },
  
  /** @private */
  _exitState: function(state, context) {
    var parentState;
    
    if (state.get('currentSubstates').indexOf(state) >= 0) {  
      parentState = state.get('parentState');
      while (parentState) {
        parentState.get('currentSubstates').removeObject(state);
        parentState = parentState.get('parentState');
      }
    }
    
    parentState = state;
    while (parentState) {
      parentState.get('enteredSubstates').removeObject(state);
      parentState = parentState.get('parentState');
    }
      
    if (this.get('allowStatechartTracing')) this.statechartLogTrace("<-- exiting state: %@".fmt(state));
    
    state.set('currentSubstates', []);
    state.notifyPropertyChange('isCurrentState');
    
    state.stateWillBecomeExited();
    var result = this.exitState(state, context);
    state.stateDidBecomeExited();
    
    if (this.get('monitorIsActive')) this.get('monitor').pushExitedState(state);
    
    state._traverseStatesToExit_skipState = NO;
    
    return result;
  },
  
  /**
    What will actually invoke a state's exitState method.
  
    Called during the state transition process whenever the gotoState method is
    invoked.
    
    @param state {SC.State} the state whose enterState method is to be invoked
    @param context {Hash} a context hash object to provide the enterState method
  */
  exitState: function(state, context) {
    return state.exitState(context);
  },
  
  /** @private */
  _enterState: function(state, current, context) {
    var parentState = state.get('parentState');
    if (parentState && !state.get('isConcurrentState')) parentState.set('historyState', state);
    
    if (current) {
      parentState = state;
      while (parentState) {
        parentState.get('currentSubstates').pushObject(state);
        parentState = parentState.get('parentState');
      }
    }
    
    parentState = state;
    while (parentState) {
      parentState.get('enteredSubstates').pushObject(state);
      parentState = parentState.get('parentState');
    }
    
    if (this.get('allowStatechartTracing')) this.statechartLogTrace("--> entering state: %@".fmt(state));
    
    state.notifyPropertyChange('isCurrentState');
  
    state.stateWillBecomeEntered();
    var result = this.enterState(state, context);
    state.stateDidBecomeEntered();
    
    if (this.get('monitorIsActive')) this.get('monitor').pushEnteredState(state);
    
    return result;
  },
  
  /**
    What will actually invoke a state's enterState method.
  
    Called during the state transition process whenever the gotoState method is
    invoked.
    
    @param state {SC.State} the state whose enterState method is to be invoked
    @param context {Hash} a context hash object to provide the enterState method
  */
  enterState: function(state, context) {
    return state.enterState(context);
  },
  
  /**
    When called, the statechart will proceed to make transitions to the given state then follow that
    state's history state. 
    
    You can either go to a given state's history recursively or non-recursively. To go to a state's history
    recursively means to following each history state's history state until no more history states can be
    followed. Non-recursively means to just to the given state's history state but do not recusively follow
    history states. If the given state does not have a history state, then the statechart will just follow
    normal procedures when making state transitions.
    
    Because a statechart can have one or more current states, depending on if the statechart has any concurrent
    states, it is optional to provided current state in which to start the state transition process from. If no
    current state is provided, then the statechart will default to the first current state that it has; which, 
    depending on the make up of that statechart, can lead to unexpected outcomes. For a statechart with concurrent
    states, it is best to explicitly supply a current state.
    
    Method can be called in the following ways:
    
        // With one arguments. 
        gotoHistorytate(<state>)
      
        // With two arguments. 
        gotoHistorytate(<state>, <state | boolean | hash>)
      
        // With three arguments.
        gotoHistorytate(<state>, <state>, <boolean | hash>)
        gotoHistorytate(<state>, <boolean>, <hash>)
      
        // With four argumetns
        gotoHistorytate(<state>, <state>, <boolean>, <hash>)
    
    where <state> is either a SC.State object or a string and <hash> is a regular JS hash object.
    
    @param state {SC.State|String} the state to go to and follow it's history state
    @param fromCurrentState {SC.State|String} Optional. the current state to start the state transition process from
    @param recursive {Boolean} Optional. whether to follow history states recursively.
  */
  gotoHistoryState: function(state, fromCurrentState, recursive, context) {
    if (!this.get('statechartIsInitialized')) {
      this.statechartLogError("can not go to state %@'s history state. Statechart has not yet been initialized".fmt(state));
      return;
    }
    
    var args = this._processGotoStateArgs(arguments);
    
    state = args.state;
    fromCurrentState = args.fromCurrentState;
    recursive = args.useHistory;
    context = args.context;
    
    state = this.getState(state);
  
    if (!state) {
      this.statechartLogError("Can not to goto state %@'s history state. Not a recognized state in statechart".fmt(state));
      return;
    }
    
    var historyState = state.get('historyState');
    
    if (!recursive) { 
      if (historyState) {
        this.gotoState(historyState, fromCurrentState, context);
      } else {
        this.gotoState(state, fromCurrentState, context);
      }
    } else {
      this.gotoState(state, fromCurrentState, YES, context);
    }
  },
  
  /**
    Sends a given event to all the statechart's current states.
    
    If a current state does can not respond to the sent event, then the current state's parent state
    will be tried. This process is recursively done until no more parent state can be tried.
    
    @param event {String} name of the event
    @param arg1 {Object} optional argument
    @param arg2 {Object} optional argument
    @returns {SC.Responder} the responder that handled it or null
  */
  sendEvent: function(event, arg1, arg2) {
    
    if (this.get('isDestroyed')) {
      this.statechartLogError("can send event %@. statechart is destroyed".fmt(event));
      return;
    }
    
    var statechartHandledEvent = NO,
        eventHandled = NO,
        currentStates = this.get('currentStates').slice(),
        len = 0,
        i = 0,
        state = null,
        trace = this.get('allowStatechartTracing');
    
    if (this._sendEventLocked || this._goStateLocked) {
      // Want to prevent any actions from being processed by the states until 
      // they have had a chance to handle the most immediate action or completed 
      // a state transition
      this._pendingSentEvents.push({
        event: event,
        arg1: arg1,
        arg2: arg2
      });

      return;
    }
    
    this._sendEventLocked = YES;
    
    if (trace) {
      this.statechartLogTrace("BEGIN sendEvent: event<%@>".fmt(event));
    }
    
    len = currentStates.get('length');
    for (; i < len; i += 1) {
      eventHandled = NO;
      state = currentStates[i];
      if (!state.get('isCurrentState')) continue;
      while (!eventHandled && state) {
        eventHandled = state.tryToHandleEvent(event, arg1, arg2);
        if (!eventHandled) state = state.get('parentState');
        else statechartHandledEvent = YES;
      }
    }
    
    // Now that all the states have had a chance to process the 
    // first event, we can go ahead and flush any pending sent events.
    this._sendEventLocked = NO;
    
    if (trace) {
      if (!statechartHandledEvent) this.statechartLogTrace("No state was able handle event %@".fmt(event));
      this.statechartLogTrace("END sendEvent: event<%@>".fmt(event));
    }
    
    var result = this._flushPendingSentEvents();
    
    return statechartHandledEvent ? this : (result ? this : null);
  },

  /** @private
  
    Creates a chain of states from the given state to the greatest ancestor state (the root state). Used
    when perform state transitions.
  */
  _createStateChain: function(state) {
    var chain = [];
    
    while (state) {
      chain.push(state);
      state = state.get('parentState');
    }
    
    return chain;
  },
  
  /** @private
  
    Finds a pivot state from two given state chains. The pivot state is the state indicating when states
    go from being exited to states being entered during the state transition process. The value 
    returned is the fist matching state between the two given state chains. 
  */
  _findPivotState: function(stateChain1, stateChain2) {
    if (stateChain1.length === 0 || stateChain2.length === 0) return null;
    
    var pivot = stateChain1.find(function(state, index) {
      if (stateChain2.indexOf(state) >= 0) return YES;
    });
    
    return pivot;
  },
  
  /** @private
    
    Recursively follow states that are to be exited during a state transition process. The exit
    process is to start from the given state and work its way up to when either all exit
    states have been reached based on a given exit path or when a stop state has been reached.
    
    @param state {State} the state to be exited
    @param exitStatePath {Array} an array representing a path of states that are to be exited
    @param stopState {State} an explicit state in which to stop the exiting process
  */
  _traverseStatesToExit: function(state, exitStatePath, stopState, gotoStateActions) {    
    if (!state || state === stopState) return;
    
    var trace = this.get('allowStatechartTracing');
    
    // This state has concurrent substates. Therefore we have to make sure we
    // exit them up to this state before we can go any further up the exit chain.
    if (state.get('substatesAreConcurrent')) {
      var i = 0,
          currentSubstates = state.get('currentSubstates'),
          len = currentSubstates.length,
          currentState = null;
      
      for (; i < len; i += 1) {
        currentState = currentSubstates[i];
        if (currentState._traverseStatesToExit_skipState === YES) continue;
        var chain = this._createStateChain(currentState);
        this._traverseStatesToExit(chain.shift(), chain, state, gotoStateActions);
      }
    }
    
    gotoStateActions.push({ action: SC.EXIT_STATE, state: state });
    if (state.get('isCurrentState')) state._traverseStatesToExit_skipState = YES;
    this._traverseStatesToExit(exitStatePath.shift(), exitStatePath, stopState, gotoStateActions);
  },
  
  /** @private
  
    Recursively follow states that are to be entred during the state transition process. The
    enter process is to start from the given state and work its way down a given enter path. When
    the end of enter path has been reached, then continue entering states based on whether 
    an initial substate is defined, there are concurrent substates or history states are to be
    followed; when none of those condition are met then the enter process is done.
    
    @param state {State} the sate to be entered
    @param enterStatePath {Array} an array representing an initial path of states that are to be entered
    @param pivotState {State} The state pivoting when to go from exiting states to entering states
    @param useHistory {Boolean} indicates whether to recursively follow history states 
  */
  _traverseStatesToEnter: function(state, enterStatePath, pivotState, useHistory, gotoStateActions) {
    if (!state) return;
    
    var trace = this.get('allowStatechartTracing');
    
    // We do not want to enter states in the enter path until the pivot state has been reached. After
    // the pivot state has been reached, then we can go ahead and actually enter states.
    if (pivotState) {
      if (state !== pivotState) {
        this._traverseStatesToEnter(enterStatePath.pop(), enterStatePath, pivotState, useHistory, gotoStateActions);
      } else {
        this._traverseStatesToEnter(enterStatePath.pop(), enterStatePath, null, useHistory, gotoStateActions);
      }
    }
    
    // If no more explicit enter path instructions, then default to enter states based on 
    // other criteria
    else if (!enterStatePath || enterStatePath.length === 0) {
      var gotoStateAction = { action: SC.ENTER_STATE, state: state, currentState: NO };
      gotoStateActions.push(gotoStateAction);
      
      var initialSubstate = state.get('initialSubstate'),
          historyState = state.get('historyState');
      
      // State has concurrent substates. Need to enter all of the substates
      if (state.get('substatesAreConcurrent')) {
        this._traverseConcurrentStatesToEnter(state.get('substates'), null, useHistory, gotoStateActions);
      }
      
      // State has substates and we are instructed to recursively follow the state's
      // history state if it has one.
      else if (state.get('hasSubstates') && historyState && useHistory) {
        this._traverseStatesToEnter(historyState, null, null, useHistory, gotoStateActions);
      }
      
      // State has an initial substate to enter
      else if (initialSubstate) {
        if (SC.kindOf(initialSubstate, SC.HistoryState)) {
          if (!useHistory) useHistory = initialSubstate.get('isRecursive');
          initialSubstate = initialSubstate.get('state');
        }
        this._traverseStatesToEnter(initialSubstate, null, null, useHistory, gotoStateActions);  
      } 
      
      // Looks like we hit the end of the road. Therefore the state has now become
      // a current state of the statechart.
      else {
        gotoStateAction.currentState = YES;
      }
    }
    
    // Still have an explicit enter path to follow, so keep moving through the path.
    else if (enterStatePath.length > 0) {
      gotoStateActions.push({ action: SC.ENTER_STATE, state: state });
      var nextState = enterStatePath.pop();
      this._traverseStatesToEnter(nextState, enterStatePath, null, useHistory, gotoStateActions); 
      
      // We hit a state that has concurrent substates. Must go through each of the substates
      // and enter them
      if (state.get('substatesAreConcurrent')) {
        this._traverseConcurrentStatesToEnter(state.get('substates'), nextState, useHistory, gotoStateActions);
      }
    }
  },
  
  /** @override
  
    Returns YES if the named value translates into an executable function on
    any of the statechart's current states or the statechart itself.
    
    @param event {String} the property name to check
    @returns {Boolean}
  */
  respondsTo: function(event) {
    var currentStates = this.get('currentStates'),
        len = currentStates.get('length'), 
        i = 0, state = null;
        
    for (; i < len; i += 1) {
      state = currentStates.objectAt(i);
      while (state) {
        if (state.respondsToEvent(event)) return true;
        state = state.get('parentState');
      }
    }
    
    // None of the current states can respond. Now check the statechart itself
    return SC.typeOf(this[event]) === SC.T_FUNCTION;   
  },
  
  /** @override
  
    Attemps to handle a given event against any of the statechart's current states and the
    statechart itself. If any current state can handle the event or the statechart itself can
    handle the event then YES is returned, otherwise NO is returned.
  
    @param event {String} what to perform
    @param arg1 {Object} Optional
    @param arg2 {Object} Optional
    @returns {Boolean} YES if handled, NO if not handled
  */
  tryToPerform: function(event, arg1, arg2) {
    if (this.respondsTo(event)) {
      if (SC.typeOf(this[event]) === SC.T_FUNCTION) return (this[event](arg1, arg2) !== NO);
      else return !!this.sendEvent(event, arg1, arg2);
    } return NO;
  },
  
  /**
    Used to invoke a method on current states. If the method can not be executed
    on a current state, then the state's parent states will be tried in order
    of closest ancestry.
    
    A few notes: 
    
     1. Calling this is not the same as calling sendEvent or sendAction.
        Rather, this should be seen as calling normal methods on a state that 
        will *not* call gotoState or gotoHistoryState.
     2. A state will only ever be invoked once per call. So if there are two 
        or more current states that have the same parent state, then that parent 
        state will only be invoked once if none of the current states are able
        to invoke the given method.
    
    When calling this method, you are able to supply zero ore more arguments
    that can be pass onto the method called on the states. As an example
    
        invokeStateMethod('render', context, firstTime);
    
    The above call will invoke the render method on the current states
    and supply the context and firstTime arguments to the method. 
    
    Because a statechart can have more than one current state and the method 
    invoked may return a value, the addition of a callback function may be provided 
    in order to handle the returned value for each state. As an example, let's say
    we want to call a calculate method on the current states where the method
    will return a value when invoked. We can handle the returned values like so:
    
        invokeStateMethod('calculate', value, function(state, result) {
          // .. handle the result returned from calculate that was invoked
          //    on the given state
        })
    
    If the method invoked does not return a value and a callback function is
    supplied, then result value will simply be undefined. In all cases, if
    a callback function is given, it must be the last value supplied to this
    method.
    
    invokeStateMethod will return a value if only one state was able to have 
    the given method invoked on it, otherwise no value is returned. 
    
    @param methodName {String} methodName a method name
    @param args {Object...} Optional. any additional arguments
    @param func {Function} Optional. a callback function. Must be the last
           value supplied if provided.
           
    @returns a value if the number of current states is one, otherwise undefined
             is returned. The value is the result of the method that got invoked
             on a state.
  */
  invokeStateMethod: function(methodName, args, func) {
    if (methodName === 'unknownEvent') {
      this.statechartLogError("can not invoke method unkownEvent");
      return;
    }
    
    args = SC.A(arguments); args.shift();
    
    var len = args.length, 
        arg = len > 0 ? args[len - 1] : null,
        callback = SC.typeOf(arg) === SC.T_FUNCTION ? args.pop() : null,
        currentStates = this.get('currentStates'), 
        i = 0, state = null, checkedStates = {},
        method, result = undefined, calledStates = 0;
        
    len = currentStates.get('length');
    
    for (; i < len; i += 1) {
      state = currentStates.objectAt(i);
      while (state) {
        if (checkedStates[state.get('fullPath')]) break;
        checkedStates[state.get('fullPath')] = YES;
        method = state[methodName];
        if (SC.typeOf(method) === SC.T_FUNCTION && !method.isEventHandler) {
          result = method.apply(state, args);
          if (callback) callback.call(this, state, result);
          calledStates += 1;  
          break;
        }
        state = state.get('parentState');
      }
    }
    
    return calledStates === 1 ? result : undefined;
  },
  
  /** @private
  
    Iterate over all the given concurrent states and enter them
  */
  _traverseConcurrentStatesToEnter: function(states, exclude, useHistory, gotoStateActions) {
    var i = 0,
        len = states.length,
        state = null;
    
    for (; i < len; i += 1) {
      state = states[i];
      if (state !== exclude) this._traverseStatesToEnter(state, null, null, useHistory, gotoStateActions);
    }
  },
  
  /** @private
  
    Called by gotoState to flush a pending state transition at the front of the 
    pending queue.
  */
  _flushPendingStateTransition: function() {
    if (!this._pendingStateTransitions) {
      this.statechartLogError("Unable to flush pending state transition. _pendingStateTransitions is invalid");
      return;
    }
    var pending = this._pendingStateTransitions.shift();
    if (!pending) return;
    this.gotoState(pending.state, pending.fromCurrentState, pending.useHistory, pending.context);
  },
  
  /** @private

     Called by sendEvent to flush a pending actions at the front of the pending
     queue
   */
  _flushPendingSentEvents: function() {
    var pending = this._pendingSentEvents.shift();
    if (!pending) return null;
    return this.sendEvent(pending.event, pending.arg1, pending.arg2);
  },
  
  /** @private */
  _monitorIsActiveDidChange: function() {
    if (this.get('monitorIsActive') && SC.none(this.get('monitor'))) {
      this.set('monitor', SC.StatechartMonitor.create());
    }
  }.observes('monitorIsActive'),
  
  /** @private 
    Will process the arguments supplied to the gotoState method.
    
    TODO: Come back to this and refactor the code. It works, but it
          could certainly be improved
  */
  _processGotoStateArgs: function(args) {
    var processedArgs = { 
          state: null, 
          fromCurrentState: null, 
          useHistory: false, 
          context: null 
        },
        len = null,
        value = null;
        
    args = SC.$A(args);
    args = args.filter(function(item) {
      return !(item === undefined); 
    });
    len = args.length;
    
    if (len < 1) return processedArgs;
    
    processedArgs.state = args[0];
    
    if (len === 2) {
      value = args[1];
      switch (SC.typeOf(value)) {
      case SC.T_BOOL: 
        processedArgs.useHistory = value;
        break;
      case SC.T_HASH:
        processedArgs.context = value;
        break;
      default:
        processedArgs.fromCurrentState = value;
      }
    }
    else if (len === 3) {
      value = args[1];
      if (SC.typeOf(value) === SC.T_BOOL) {
        processedArgs.useHistory = value;
        processedArgs.context = args[2];
      } else {
        processedArgs.fromCurrentState = value;
        value = args[2];
        if (SC.typeOf(value) === SC.T_BOOL) {
          processedArgs.useHistory = value;
        } else {
          processedArgs.context = value;
        }
      }
    }
    else {
      processedArgs.fromCurrentState = args[1];
      processedArgs.useHistory = args[2];
      processedArgs.context = args[3];
    }
    
    return processedArgs;
  },
  
  /** @private 
  
    Will return a newly constructed root state class. The root state will have substates added to
    it based on properties found on this state that derive from a SC.State class. For the
    root state to be successfully built, the following much be met:
    
     - The rootStateExample property must be defined with a class that derives from SC.State
     - Either the initialState or statesAreConcurrent property must be set, but not both
     - There must be one or more states that can be added to the root state
      
  */
  _constructRootStateClass: function() {
    var rsExampleKey = 'rootStateExample',
        rsExample = this.get(rsExampleKey),
        initialState = this.get('initialState'),
        statesAreConcurrent = this.get('statesAreConcurrent'),
        stateCount = 0,
        key, value, valueIsFunc, attrs = {};
    
    if (SC.typeOf(rsExample) === SC.T_FUNCTION && rsExample.statePlugin) {
      rsExample = rsExample.apply(this);
    }

    if (!(SC.kindOf(rsExample, SC.State) && rsExample.isClass)) {
      this._logStatechartCreationError("Invalid root state example");
      return null;
    }
    
    if (statesAreConcurrent && !SC.empty(initialState)) {
      this._logStatechartCreationError("Can not assign an initial state when states are concurrent");
    } else if (statesAreConcurrent) {
      attrs.substatesAreConcurrent = YES;
    } else if (SC.typeOf(initialState) === SC.T_STRING) {
      attrs.initialSubstate = initialState;
    } else {
      this._logStatechartCreationError("Must either define initial state or assign states as concurrent");
      return null;
    }
    
    for (key in this) {
      if (key === rsExampleKey) continue;
      
      value = this[key];
      valueIsFunc = SC.typeOf(value) === SC.T_FUNCTION;
      
      if (valueIsFunc && value.statePlugin) {
        value = value.apply(this);
      }
      
      if (SC.kindOf(value, SC.State) && value.isClass && this[key] !== this.constructor) {
        attrs[key] = value;
        stateCount += 1;
      }
    }
    
    if (stateCount === 0) {
      this._logStatechartCreationError("Must define one or more states");
      return null;
    }
    
    return rsExample.extend(attrs);
  },
  
  /** @private */
  _logStatechartCreationError: function(msg) {
    SC.Logger.error("Unable to create statechart for %@: %@.".fmt(this, msg));
  },
  
  /** 
    Used to log a statechart trace message
  */
  statechartLogTrace: function(msg) {
    SC.Logger.info("%@: %@".fmt(this.get('statechartLogPrefix'), msg));
  },
  
  /**
    Used to log a statechart error message
  */
  statechartLogError: function(msg) {
    SC.Logger.error("ERROR %@: %@".fmt(this.get('statechartLogPrefix'), msg));
  },
  
  /** 
    Used to log a statechart warning message
  */
  statechartLogWarning: function(msg) {
    if (this.get('suppressStatechartWarnings')) return;
    SC.Logger.warn("WARN %@: %@".fmt(this.get('statechartLogPrefix'), msg));
  },
  
  /** @property */
  statechartLogPrefix: function() {
    var className = SC._object_className(this.constructor),
        name = this.get('name'), prefix;
        
    if (SC.empty(name)) prefix = "%@<%@>".fmt(className, SC.guidFor(this));
    else prefix = "%@<%@, %@>".fmt(className, name, SC.guidFor(this));
    
    return prefix;
  }.property().cacheable(),

  /** @private @property */
  allowStatechartTracing: function() {
    var key = this.get('statechartTraceKey');
    return this.get(key);
  }.property().cacheable(),

  /** @private */
  _statechartTraceDidChange: function() {
    this.notifyPropertyChange('allowStatechartTracing');
  }
  
};

/** 
  The default name given to a statechart's root state
*/
SC.ROOT_STATE_NAME = "__ROOT_STATE__";

/**
  Constants used during the state transition process
*/
SC.EXIT_STATE = 0;
SC.ENTER_STATE = 1;

/**
  A Startchart class. 
*/
SC.Statechart = SC.Object.extend(SC.StatechartManager, {
  autoInitStatechart: NO
});

SC.Statechart.design = SC.Statechart.extend;

