/* >>>>>>>>>> BEGIN source/qunit/qunit.js */
/*
 * QUnit - A JavaScript Unit Testing Framework
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2011 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * or GPL (GPL-LICENSE.txt) licenses.
 */

(function(window) {

var defined = {
	setTimeout: typeof window.setTimeout !== "undefined",
	sessionStorage: (function() {
		try {
			return !!sessionStorage.getItem;
		} catch(e){
			return false;
		}
  })()
};

var testId = 0;

var Test = function(name, testName, expected, testEnvironmentArg, async, callback) {
	this.name = name;
	this.testName = testName;
	this.expected = expected;
	this.testEnvironmentArg = testEnvironmentArg;
	this.async = async;
	this.callback = callback;
	this.assertions = [];
};
Test.prototype = {
	init: function() {
		var tests = id("qunit-tests");
		if (tests) {
			var b = document.createElement("strong");
				b.innerHTML = "Running " + this.name;
			var li = document.createElement("li");
				li.appendChild( b );
				li.className = "running";
				li.id = this.id = "test-output" + testId++;
			tests.appendChild( li );
		}
	},
	setup: function() {
		if (this.module != config.previousModule) {
			if ( config.previousModule ) {
				QUnit.moduleDone( {
					name: config.previousModule,
					failed: config.moduleStats.bad,
					passed: config.moduleStats.all - config.moduleStats.bad,
					total: config.moduleStats.all
				} );
			}
			config.previousModule = this.module;
			config.moduleStats = { all: 0, bad: 0 };
			QUnit.moduleStart( {
				name: this.module
			} );
		}

		config.current = this;
		this.testEnvironment = extend({
			setup: function() {},
			teardown: function() {}
		}, this.moduleTestEnvironment);
		if (this.testEnvironmentArg) {
			extend(this.testEnvironment, this.testEnvironmentArg);
		}

		QUnit.testStart( {
			name: this.testName
		} );

		// allow utility functions to access the current test environment
		// TODO why??
		QUnit.current_testEnvironment = this.testEnvironment;
		
		try {
			if ( !config.pollution ) {
				saveGlobal();
			}

			this.testEnvironment.setup.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Setup failed on " + this.testName + ": " + e.message );
		}
	},
	run: function() {
		if ( this.async ) {
			QUnit.stop();
		}

		if ( config.notrycatch ) {
			this.callback.call(this.testEnvironment);
			return;
		}
		try {
			this.callback.call(this.testEnvironment);
		} catch(e) {
			fail("Test " + this.testName + " died, exception and test follows", e, this.callback);
			QUnit.ok( false, "Died on test #" + (this.assertions.length + 1) + ": " + e.message + " - " + QUnit.jsDump.parse(e) );
			// else next test will carry the responsibility
			saveGlobal();

			// Restart the tests if they're blocking
			if ( config.blocking ) {
				start();
			}
		}
	},
	teardown: function() {
		try {
			checkPollution();
			this.testEnvironment.teardown.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Teardown failed on " + this.testName + ": " + e.message );
		}
	},
	finish: function() {
		if ( this.expected && this.expected != this.assertions.length ) {
			QUnit.ok( false, "Expected " + this.expected + " assertions, but " + this.assertions.length + " were run" );
		}
		
		var good = 0, bad = 0,
			tests = id("qunit-tests");

		config.stats.all += this.assertions.length;
		config.moduleStats.all += this.assertions.length;

		if ( tests ) {
			var ol  = document.createElement("ol");

			for ( var i = 0; i < this.assertions.length; i++ ) {
				var assertion = this.assertions[i];

				var li = document.createElement("li");
				li.className = assertion.result ? "pass" : "fail";
				li.innerHTML = assertion.message || (assertion.result ? "okay" : "failed");
				ol.appendChild( li );

				if ( assertion.result ) {
					good++;
				} else {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}

			// store result when possible
			if ( QUnit.config.reorder && defined.sessionStorage ) {
				if (bad) {
					sessionStorage.setItem("qunit-" + this.module + "-" + this.testName, bad)
				} else {
					sessionStorage.removeItem("qunit-" + this.testName);
				}
			}

			if (bad == 0) {
				ol.style.display = "none";
			}

			var b = document.createElement("strong");
			b.innerHTML = this.name + " <b class='counts'>(<b class='failed'>" + bad + "</b>, <b class='passed'>" + good + "</b>, " + this.assertions.length + ")</b>";
			
			var a = document.createElement("a");
			a.innerHTML = "Rerun";
			a.href = QUnit.url({ filter: getText([b]).replace(/\([^)]+\)$/, "").replace(/(^\s*|\s*$)/g, "") });
			
			addEvent(b, "click", function() {
				var next = b.nextSibling.nextSibling,
					display = next.style.display;
				next.style.display = display === "none" ? "block" : "none";
			});
			
			addEvent(b, "dblclick", function(e) {
				var target = e && e.target ? e.target : window.event.srcElement;
				if ( target.nodeName.toLowerCase() == "span" || target.nodeName.toLowerCase() == "b" ) {
					target = target.parentNode;
				}
				if ( window.location && target.nodeName.toLowerCase() === "strong" ) {
					window.location = QUnit.url({ filter: getText([target]).replace(/\([^)]+\)$/, "").replace(/(^\s*|\s*$)/g, "") });
				}
			});

			var li = id(this.id);
			li.className = bad ? "fail" : "pass";
			li.removeChild( li.firstChild );
			li.appendChild( b );
			li.appendChild( a );
			li.appendChild( ol );

		} else {
			for ( var i = 0; i < this.assertions.length; i++ ) {
				if ( !this.assertions[i].result ) {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}
		}

		try {
			QUnit.reset();
		} catch(e) {
			fail("reset() failed, following Test " + this.testName + ", exception and reset fn follows", e, QUnit.reset);
		}

		QUnit.testDone( {
			name: this.testName,
			failed: bad,
			passed: this.assertions.length - bad,
			total: this.assertions.length
		} );
	},
	
	queue: function() {
		var test = this;
		synchronize(function() {
			test.init();
		});
		function run() {
			// each of these can by async
			synchronize(function() {
				test.setup();
			});
			synchronize(function() {
				test.run();
			});
			synchronize(function() {
				test.teardown();
			});
			synchronize(function() {
				test.finish();
			});
		}
		// defer when previous test run passed, if storage is available
		var bad = QUnit.config.reorder && defined.sessionStorage && +sessionStorage.getItem("qunit-" + this.module + "-" + this.testName);
		if (bad) {
			run();
		} else {
			synchronize(run);
		};
	}
	
};

var QUnit = {

	// call on start of module test to prepend name to all tests
	module: function(name, testEnvironment) {
		config.currentModule = name;
		config.currentModuleTestEnviroment = testEnvironment;
	},

	asyncTest: function(testName, expected, callback) {
		if ( arguments.length === 2 ) {
			callback = expected;
			expected = 0;
		}

		QUnit.test(testName, expected, callback, true);
	},
	
	test: function(testName, expected, callback, async) {
		var name = '<span class="test-name">' + testName + '</span>', testEnvironmentArg;

		if ( arguments.length === 2 ) {
			callback = expected;
			expected = null;
		}
		// is 2nd argument a testEnvironment?
		if ( expected && typeof expected === 'object') {
			testEnvironmentArg =  expected;
			expected = null;
		}

		if ( config.currentModule ) {
			name = '<span class="module-name">' + config.currentModule + "</span>: " + name;
		}

		if ( !validTest(config.currentModule + ": " + testName) ) {
			return;
		}
		
		var test = new Test(name, testName, expected, testEnvironmentArg, async, callback);
		test.module = config.currentModule;
		test.moduleTestEnvironment = config.currentModuleTestEnviroment;
		test.queue();
	},
	
	/**
	 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		config.current.expected = asserts;
	},

	/**
	 * Asserts true.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 */
	ok: function(a, msg) {
		a = !!a;
		var details = {
			result: a,
			message: msg
		};
		msg = escapeHtml(msg);
		QUnit.log(details);
		config.current.assertions.push({
			result: a,
			message: msg
		});
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equal: function(actual, expected, message) {
		QUnit.push(expected == actual, actual, expected, message);
	},

	notEqual: function(actual, expected, message) {
		QUnit.push(expected != actual, actual, expected, message);
	},
	
	deepEqual: function(actual, expected, message) {
		QUnit.push(QUnit.equiv(actual, expected), actual, expected, message);
	},

	notDeepEqual: function(actual, expected, message) {
		QUnit.push(!QUnit.equiv(actual, expected), actual, expected, message);
	},

	strictEqual: function(actual, expected, message) {
		QUnit.push(expected === actual, actual, expected, message);
	},

	notStrictEqual: function(actual, expected, message) {
		QUnit.push(expected !== actual, actual, expected, message);
	},

	raises: function(block, expected, message) {
		var actual, ok = false;
	
		if (typeof expected === 'string') {
			message = expected;
			expected = null;
		}
	
		try {
			block();
		} catch (e) {
			actual = e;
		}
	
		if (actual) {
			// we don't want to validate thrown error
			if (!expected) {
				ok = true;
			// expected is a regexp	
			} else if (QUnit.objectType(expected) === "regexp") {
				ok = expected.test(actual);
			// expected is a constructor	
			} else if (actual instanceof expected) {
				ok = true;
			// expected is a validation function which returns true is validation passed	
			} else if (expected.call({}, actual) === true) {
				ok = true;
			}
		}
			
		QUnit.ok(ok, message);
	},

	start: function() {
		config.semaphore--;
		if (config.semaphore > 0) {
			// don't start until equal number of stop-calls
			return;
		}
		if (config.semaphore < 0) {
			// ignore if start is called more often then stop
			config.semaphore = 0;
		}
		// A slight delay, to avoid any current callbacks
		if ( defined.setTimeout ) {
			window.setTimeout(function() {
				if ( config.timeout ) {
					clearTimeout(config.timeout);
				}

				config.blocking = false;
				process();
			}, 13);
		} else {
			config.blocking = false;
			process();
		}
	},
	
	stop: function(timeout) {
		config.semaphore++;
		config.blocking = true;

		if ( timeout && defined.setTimeout ) {
			clearTimeout(config.timeout);
			config.timeout = window.setTimeout(function() {
				QUnit.ok( false, "Test timed out" );
				QUnit.start();
			}, timeout);
		}
	}
};

// Backwards compatibility, deprecated
QUnit.equals = QUnit.equal;
QUnit.same = QUnit.deepEqual;

// Maintain internal state
var config = {
	// The queue of tests to run
	queue: [],

	// block until document ready
	blocking: true,
	
	// by default, run previously failed tests first
	// very useful in combination with "Hide passed tests" checked
	reorder: true,

	noglobals: false,
	notrycatch: false
};

// Load paramaters
(function() {
	var location = window.location || { search: "", protocol: "file:" },
		params = location.search.slice( 1 ).split( "&" ),
		length = params.length,
		urlParams = {},
		current;

	if ( params[ 0 ] ) {
		for ( var i = 0; i < length; i++ ) {
			current = params[ i ].split( "=" );
			current[ 0 ] = decodeURIComponent( current[ 0 ] );
			// allow just a key to turn on a flag, e.g., test.html?noglobals
			current[ 1 ] = current[ 1 ] ? decodeURIComponent( current[ 1 ] ) : true;
			urlParams[ current[ 0 ] ] = current[ 1 ];
			if ( current[ 0 ] in config ) {
				config[ current[ 0 ] ] = current[ 1 ];
			}
		}
	}

	QUnit.urlParams = urlParams;
	config.filter = urlParams.filter;

	// Figure out if we're running the tests from a server or not
	QUnit.isLocal = !!(location.protocol === 'file:');
})();

// Expose the API as global variables, unless an 'exports'
// object exists, in that case we assume we're in CommonJS
if ( typeof exports === "undefined" || typeof require === "undefined" ) {
	extend(window, QUnit);
	window.QUnit = QUnit;
} else {
	extend(exports, QUnit);
	exports.QUnit = QUnit;
}

// define these after exposing globals to keep them in these QUnit namespace only
extend(QUnit, {
	config: config,

	// Initialize the configuration options
	init: function() {
		extend(config, {
			stats: { all: 0, bad: 0 },
			moduleStats: { all: 0, bad: 0 },
			started: +new Date,
			updateRate: 1000,
			blocking: false,
			autostart: true,
			autorun: false,
			filter: "",
			queue: [],
			semaphore: 0
		});

		var tests = id( "qunit-tests" ),
			banner = id( "qunit-banner" ),
			result = id( "qunit-testresult" );

		if ( tests ) {
			tests.innerHTML = "";
		}

		if ( banner ) {
			banner.className = "";
		}

		if ( result ) {
			result.parentNode.removeChild( result );
		}
		
		if ( tests ) {
			result = document.createElement( "p" );
			result.id = "qunit-testresult";
			result.className = "result";
			tests.parentNode.insertBefore( result, tests );
			result.innerHTML = 'Running...<br/>&nbsp;';
		}
	},
	
	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 * 
	 * If jQuery is available, uses jQuery's html(), otherwise just innerHTML.
	 */
	reset: function() {
		if ( window.jQuery ) {
			jQuery( "#main, #qunit-fixture" ).html( config.fixture );
		} else {
			var main = id( 'main' ) || id( 'qunit-fixture' );
			if ( main ) {
				main.innerHTML = config.fixture;
			}
		}
	},
	
	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( document.createEvent ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );

		} else if ( elem.fireEvent ) {
			elem.fireEvent("on"+type);
		}
	},
	
	// Safe object type checking
	is: function( type, obj ) {
		return QUnit.objectType( obj ) == type;
	},
	
	objectType: function( obj ) {
		if (typeof obj === "undefined") {
				return "undefined";

		// consider: typeof null === object
		}
		if (obj === null) {
				return "null";
		}

		var type = Object.prototype.toString.call( obj )
			.match(/^\[object\s(.*)\]$/)[1] || '';

		switch (type) {
				case 'Number':
						if (isNaN(obj)) {
								return "nan";
						} else {
								return "number";
						}
				case 'String':
				case 'Boolean':
				case 'Array':
				case 'Date':
				case 'RegExp':
				case 'Function':
						return type.toLowerCase();
		}
		if (typeof obj === "object") {
				return "object";
		}
		return undefined;
	},
	
	push: function(result, actual, expected, message) {
		var details = {
			result: result,
			message: message,
			actual: actual,
			expected: expected
		};
		
		message = escapeHtml(message) || (result ? "okay" : "failed");
		message = '<span class="test-message">' + message + "</span>";
		expected = escapeHtml(QUnit.jsDump.parse(expected));
		actual = escapeHtml(QUnit.jsDump.parse(actual));
		var output = message + '<table><tr class="test-expected"><th>Expected: </th><td><pre>' + expected + '</pre></td></tr>';
		if (actual != expected) {
			output += '<tr class="test-actual"><th>Result: </th><td><pre>' + actual + '</pre></td></tr>';
			output += '<tr class="test-diff"><th>Diff: </th><td><pre>' + QUnit.diff(expected, actual) +'</pre></td></tr>';
		}
		if (!result) {
			var source = sourceFromStacktrace();
			if (source) {
				details.source = source;
				output += '<tr class="test-source"><th>Source: </th><td><pre>' + source +'</pre></td></tr>';
			}
		}
		output += "</table>";
		
		QUnit.log(details);
		
		config.current.assertions.push({
			result: !!result,
			message: output
		});
	},
	
	url: function( params ) {
		params = extend( extend( {}, QUnit.urlParams ), params );
		var querystring = "?",
			key;
		for ( key in params ) {
			querystring += encodeURIComponent( key ) + "=" +
				encodeURIComponent( params[ key ] ) + "&";
		}
		return window.location.pathname + querystring.slice( 0, -1 );
	},
	
	// Logging callbacks; all receive a single argument with the listed properties
	// run test/logs.html for any related changes
	begin: function() {},
	// done: { failed, passed, total, runtime }
	done: function() {},
	// log: { result, actual, expected, message }
	log: function() {},
	// testStart: { name }
	testStart: function() {},
	// testDone: { name, failed, passed, total }
	testDone: function() {},
	// moduleStart: { name }
	moduleStart: function() {},
	// moduleDone: { name, failed, passed, total }
	moduleDone: function() {}
});

if ( typeof document === "undefined" || document.readyState === "complete" ) {
	config.autorun = true;
}

addEvent(window, "load", function() {
	QUnit.begin({});
	
	// Initialize the config, saving the execution queue
	var oldconfig = extend({}, config);
	QUnit.init();
	extend(config, oldconfig);

	config.blocking = false;

	var userAgent = id("qunit-userAgent");
	if ( userAgent ) {
		userAgent.innerHTML = navigator.userAgent;
	}
	var banner = id("qunit-header");
	if ( banner ) {
		banner.innerHTML = '<a href="' + QUnit.url({ filter: undefined }) + '"> ' + banner.innerHTML + '</a> ' +
			'<label><input name="noglobals" type="checkbox"' + ( config.noglobals ? ' checked="checked"' : '' ) + '>noglobals</label>' +
			'<label><input name="notrycatch" type="checkbox"' + ( config.notrycatch ? ' checked="checked"' : '' ) + '>notrycatch</label>';
		addEvent( banner, "change", function( event ) {
			var params = {};
			params[ event.target.name ] = event.target.checked ? true : undefined;
			window.location = QUnit.url( params );
		});
	}
	
	var toolbar = id("qunit-testrunner-toolbar");
	if ( toolbar ) {
		var filter = document.createElement("input");
		filter.type = "checkbox";
		filter.id = "qunit-filter-pass";
		addEvent( filter, "click", function() {
			var ol = document.getElementById("qunit-tests");
			if ( filter.checked ) {
				ol.className = ol.className + " hidepass";
			} else {
				var tmp = " " + ol.className.replace( /[\n\t\r]/g, " " ) + " ";
				ol.className = tmp.replace(/ hidepass /, " ");
			}
			if ( defined.sessionStorage ) {
				if (filter.checked) {
					sessionStorage.setItem("qunit-filter-passed-tests",  "true");
				} else {
					sessionStorage.removeItem("qunit-filter-passed-tests");
				}
			}
		});
		if ( defined.sessionStorage && sessionStorage.getItem("qunit-filter-passed-tests") ) {
			filter.checked = true;
			var ol = document.getElementById("qunit-tests");
			ol.className = ol.className + " hidepass";
		}
		toolbar.appendChild( filter );

		var label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-pass");
		label.innerHTML = "Hide passed tests";
		toolbar.appendChild( label );
	}

	var main = id('main') || id('qunit-fixture');
	if ( main ) {
		config.fixture = main.innerHTML;
	}

	if (config.autostart) {
		QUnit.start();
	}
});

function done() {
	config.autorun = true;

	// Log the last module results
	if ( config.currentModule ) {
		QUnit.moduleDone( {
			name: config.currentModule,
			failed: config.moduleStats.bad,
			passed: config.moduleStats.all - config.moduleStats.bad,
			total: config.moduleStats.all
		} );
	}

	var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		runtime = +new Date - config.started,
		passed = config.stats.all - config.stats.bad,
		html = [
			'Tests completed in ',
			runtime,
			' milliseconds.<br/>',
			'<span class="passed">',
			passed,
			'</span> tests of <span class="total">',
			config.stats.all,
			'</span> passed, <span class="failed">',
			config.stats.bad,
			'</span> failed.'
		].join('');

	if ( banner ) {
		banner.className = (config.stats.bad ? "qunit-fail" : "qunit-pass");
	}

	if ( tests ) {	
		id( "qunit-testresult" ).innerHTML = html;
	}

	QUnit.done( {
		failed: config.stats.bad,
		passed: passed, 
		total: config.stats.all,
		runtime: runtime
	} );
}

function validTest( name ) {
	var filter = config.filter,
		run = false;

	if ( !filter ) {
		return true;
	}

	not = filter.charAt( 0 ) === "!";
	if ( not ) {
		filter = filter.slice( 1 );
	}

	if ( name.indexOf( filter ) !== -1 ) {
		return !not;
	}

	if ( not ) {
		run = true;
	}

	return run;
}

// so far supports only Firefox, Chrome and Opera (buggy)
// could be extended in the future to use something like https://github.com/csnover/TraceKit
function sourceFromStacktrace() {
	try {
		throw new Error();
	} catch ( e ) {
		if (e.stacktrace) {
			// Opera
			return e.stacktrace.split("\n")[6];
		} else if (e.stack) {
			// Firefox, Chrome
			return e.stack.split("\n")[4];
		}
	}
}

function escapeHtml(s) {
	if (!s) {
		return "";
	}
	s = s + "";
	return s.replace(/[\&"<>\\]/g, function(s) {
		switch(s) {
			case "&": return "&amp;";
			case "\\": return "\\\\";
			case '"': return '\"';
			case "<": return "&lt;";
			case ">": return "&gt;";
			default: return s;
		}
	});
}

function synchronize( callback ) {
	config.queue.push( callback );

	if ( config.autorun && !config.blocking ) {
		process();
	}
}

function process() {
	var start = (new Date()).getTime();

	while ( config.queue.length && !config.blocking ) {
		if ( config.updateRate <= 0 || (((new Date()).getTime() - start) < config.updateRate) ) {
			config.queue.shift()();
		} else {
			window.setTimeout( process, 13 );
			break;
		}
	}
  if (!config.blocking && !config.queue.length) {
    done();
  }
}

function saveGlobal() {
	config.pollution = [];
	
	if ( config.noglobals ) {
		for ( var key in window ) {
			config.pollution.push( key );
		}
	}
}

function checkPollution( name ) {
	var old = config.pollution;
	saveGlobal();
	
	var newGlobals = diff( config.pollution, old );
	if ( newGlobals.length > 0 ) {
		ok( false, "Introduced global variable(s): " + newGlobals.join(", ") );
	}

	var deletedGlobals = diff( old, config.pollution );
	if ( deletedGlobals.length > 0 ) {
		ok( false, "Deleted global variable(s): " + deletedGlobals.join(", ") );
	}
}

// returns a new Array with the elements that are in a but not in b
function diff( a, b ) {
	var result = a.slice();
	for ( var i = 0; i < result.length; i++ ) {
		for ( var j = 0; j < b.length; j++ ) {
			if ( result[i] === b[j] ) {
				result.splice(i, 1);
				i--;
				break;
			}
		}
	}
	return result;
}

function fail(message, exception, callback) {
	if ( typeof console !== "undefined" && console.error && console.warn ) {
		console.error(message);
		console.error(exception);
		console.warn(callback.toString());

	} else if ( window.opera && opera.postError ) {
		opera.postError(message, exception, callback.toString);
	}
}

function extend(a, b) {
	for ( var prop in b ) {
		if ( b[prop] === undefined ) {
			delete a[prop];
		} else {
			a[prop] = b[prop];
		}
	}

	return a;
}

function addEvent(elem, type, fn) {
	if ( elem.addEventListener ) {
		elem.addEventListener( type, fn, false );
	} else if ( elem.attachEvent ) {
		elem.attachEvent( "on" + type, fn );
	} else {
		fn();
	}
}

function id(name) {
	return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById( name );
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions
    var parents = []; // stack to avoiding loops from circular referencing

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = QUnit.objectType(o);
        if (prop) {
            if (QUnit.objectType(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }
    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return QUnit.objectType(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return QUnit.objectType(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i, j, loop;
                var len;

                // b could be an object literal here
                if ( ! (QUnit.objectType(b) === "array")) {
                    return false;
                }   
                
                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                
                //track reference to avoid circular references
                parents.push(a);
                for (i = 0; i < len; i++) {
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i]){
                            loop = true;//dont rewalk array
                        }
                    }
                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        parents.pop();
                        return false;
                    }
                }
                parents.pop();
                return true;
            },

            "object": function (b, a) {
                var i, j, loop;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);
                //track reference to avoid circular references
                parents.push(a);
                
                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i])
                            loop = true; //don't go down the same path twice
                    }
                    aProperties.push(i); // collect a's properties

                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        eq = false;
                        break;
                    }
                }

                callers.pop(); // unstack, we are done
                parents.pop();

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || QUnit.objectType(a) !== QUnit.objectType(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
QUnit.jsDump = (function() {
	function quote( str ) {
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ) {
		return o + '';	
	};
	function join( pre, arr, post ) {
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if ( arr.join )
			arr = arr.join( ',' + s + inner );
		if ( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ) {
		var i = arr.length,	ret = Array(i);					
		this.up();
		while ( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = {
		parse:function( obj, type ) { //type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ) {
			var type;
			if ( obj === null ) {
				type = "null";
			} else if (typeof obj === "undefined") {
				type = "undefined";
			} else if (QUnit.is("RegExp", obj)) {
				type = "regexp";
			} else if (QUnit.is("Date", obj)) {
				type = "date";
			} else if (QUnit.is("Function", obj)) {
				type = "function";
			} else if (typeof obj.setInterval !== undefined && typeof obj.document !== "undefined" && typeof obj.nodeType === "undefined") {
				type = "window";
			} else if (obj.nodeType === 9) {
				type = "document";
			} else if (obj.nodeType) {
				type = "node";
			} else if (typeof obj === "object" && typeof obj.length === "number" && obj.length >= 0) {
				type = "array";
			} else {
				type = typeof obj;
			}
			return type;
		},
		separator:function() {
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ) {// extra can be a number, shortcut for increasing-calling-decreasing
			if ( !this.multiline )
				return '';
			var chr = this.indentChar;
			if ( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ) {
			this._depth_ += a || 1;
		},
		down:function( a ) {
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ) {
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			'undefined':'undefined',
			'function':function( fn ) {
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if ( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, QUnit.jsDump.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, QUnit.jsDump.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ) {
				var ret = [ ];
				QUnit.jsDump.up();
				for ( var key in map )
					ret.push( QUnit.jsDump.parse(key,'key') + ': ' + QUnit.jsDump.parse(map[key]) );
				QUnit.jsDump.down();
				return join( '{', ret, '}' );
			},
			node:function( node ) {
				var open = QUnit.jsDump.HTML ? '&lt;' : '<',
					close = QUnit.jsDump.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for ( var a in QUnit.jsDump.DOMAttrs ) {
					var val = node[QUnit.jsDump.DOMAttrs[a]];
					if ( val )
						ret += ' ' + a + '=' + QUnit.jsDump.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ) {//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if ( !l ) return '';				
				
				var args = Array(l);
				while ( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:false,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'  ',//indentation unit
		multiline:true //if true, items in a collection, are separated by a \n, else just a space.
	};

	return jsDump;
})();

// from Sizzle.js
function getText( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += getText( elem.childNodes );
		}
	}

	return ret;
};

/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 *  
 * Usage: QUnit.diff(expected, actual)
 * 
 * QUnit.diff("the quick brown fox jumped over", "the quick fox jumps over") == "the  quick <del>brown </del> fox <del>jumped </del><ins>jumps </ins> over"
 */
QUnit.diff = (function() {
	function diff(o, n){
		var ns = new Object();
		var os = new Object();
		
		for (var i = 0; i < n.length; i++) {
			if (ns[n[i]] == null) 
				ns[n[i]] = {
					rows: new Array(),
					o: null
				};
			ns[n[i]].rows.push(i);
		}
		
		for (var i = 0; i < o.length; i++) {
			if (os[o[i]] == null) 
				os[o[i]] = {
					rows: new Array(),
					n: null
				};
			os[o[i]].rows.push(i);
		}
		
		for (var i in ns) {
			if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
				n[ns[i].rows[0]] = {
					text: n[ns[i].rows[0]],
					row: os[i].rows[0]
				};
				o[os[i].rows[0]] = {
					text: o[os[i].rows[0]],
					row: ns[i].rows[0]
				};
			}
		}
		
		for (var i = 0; i < n.length - 1; i++) {
			if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null &&
			n[i + 1] == o[n[i].row + 1]) {
				n[i + 1] = {
					text: n[i + 1],
					row: n[i].row + 1
				};
				o[n[i].row + 1] = {
					text: o[n[i].row + 1],
					row: i + 1
				};
			}
		}
		
		for (var i = n.length - 1; i > 0; i--) {
			if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
			n[i - 1] == o[n[i].row - 1]) {
				n[i - 1] = {
					text: n[i - 1],
					row: n[i].row - 1
				};
				o[n[i].row - 1] = {
					text: o[n[i].row - 1],
					row: i - 1
				};
			}
		}
		
		return {
			o: o,
			n: n
		};
	}
	
	return function(o, n){
		o = o.replace(/\s+$/, '');
		n = n.replace(/\s+$/, '');
		var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));

		var str = "";
		
		var oSpace = o.match(/\s+/g);
		if (oSpace == null) {
			oSpace = [" "];
		}
		else {
			oSpace.push(" ");
		}
		var nSpace = n.match(/\s+/g);
		if (nSpace == null) {
			nSpace = [" "];
		}
		else {
			nSpace.push(" ");
		}
		
		if (out.n.length == 0) {
			for (var i = 0; i < out.o.length; i++) {
				str += '<del>' + out.o[i] + oSpace[i] + "</del>";
			}
		}
		else {
			if (out.n[0].text == null) {
				for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
					str += '<del>' + out.o[n] + oSpace[n] + "</del>";
				}
			}
			
			for (var i = 0; i < out.n.length; i++) {
				if (out.n[i].text == null) {
					str += '<ins>' + out.n[i] + nSpace[i] + "</ins>";
				}
				else {
					var pre = "";
					
					for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
						pre += '<del>' + out.o[n] + oSpace[n] + "</del>";
					}
					str += " " + out.n[i].text + nSpace[i] + pre;
				}
			}
		}
		
		return str;
	};
})();

})(this);

/* >>>>>>>>>> BEGIN source/test/logs.js */
// TODO disable reordering for this suite!


var begin = 0,
	moduleStart = 0,
	moduleDone = 0,
	testStart = 0,
	testDone = 0,
	log = 0,
	moduleContext,
	moduleDoneContext,
	testContext,
	testDoneContext,
	logContext;

QUnit.begin = function() {
	begin++;
};
QUnit.done = function() {
};
QUnit.moduleStart = function(context) {
	moduleStart++;
	moduleContext = context;
};
QUnit.moduleDone = function(context) {
	moduleDone++;
	moduleDoneContext = context;
};
QUnit.testStart = function(context) {
	testStart++;
	testContext = context;
};
QUnit.testDone = function(context) {
	testDone++;
	testDoneContext = context;
};
QUnit.log = function(context) {
	log++;
	logContext = context;
};

var logs = ["begin", "testStart", "testDone", "log", "moduleStart", "moduleDone", "done"];
for (var i = 0; i < logs.length; i++) {
	(function() {
		var log = logs[i],
			logger = QUnit[log];
		QUnit[log] = function() {
			console.log(log, arguments);
			logger.apply(this, arguments);
		};
	})();
}

module("logs1");

test("test1", 13, function() {
	equal(begin, 1);
	equal(moduleStart, 1);
	equal(testStart, 1);
	equal(testDone, 0);
	equal(moduleDone, 0);

	deepEqual(logContext, {
		result: true,
		message: undefined,
		actual: 0,
		expected: 0
	});
	equal("foo", "foo", "msg");
	deepEqual(logContext, {
		result: true,
		message: "msg",
		actual: "foo",
		expected: "foo"
	});
	strictEqual(testDoneContext, undefined);
	deepEqual(testContext, {
		name: "test1"
	});
	strictEqual(moduleDoneContext, undefined);
	deepEqual(moduleContext, {
		name: "logs1"
	});

	equal(log, 12);
});
test("test2", 10, function() {
	equal(begin, 1);
	equal(moduleStart, 1);
	equal(testStart, 2);
	equal(testDone, 1);
	equal(moduleDone, 0);

	deepEqual(testDoneContext, {
		name: "test1",
		failed: 0,
		passed: 13,
		total: 13
	});
	deepEqual(testContext, {
		name: "test2"
	});
	strictEqual(moduleDoneContext, undefined);
	deepEqual(moduleContext, {
		name: "logs1"
	});

	equal(log, 22);
});

module("logs2");
	
test("test1", 9, function() {
	equal(begin, 1);
	equal(moduleStart, 2);
	equal(testStart, 3);
	equal(testDone, 2);
	equal(moduleDone, 1);

	deepEqual(testContext, {
		name: "test1"
	});
	deepEqual(moduleDoneContext, {
		name: "logs1",
		failed: 0,
		passed: 23,
		total: 23
	});
	deepEqual(moduleContext, {
		name: "logs2"
	});

	equal(log, 31);
});
test("test2", 8, function() {
	equal(begin, 1);
	equal(moduleStart, 2);
	equal(testStart, 4);
	equal(testDone, 3);
	equal(moduleDone, 1);

	deepEqual(testContext, {
		name: "test2"
	});
	deepEqual(moduleContext, {
		name: "logs2"
	});

	equal(log, 39);
});

/* >>>>>>>>>> BEGIN source/test/same.js */
module("equiv");


test("Primitive types and constants", function () {
    equals(QUnit.equiv(null, null), true, "null");
    equals(QUnit.equiv(null, {}), false, "null");
    equals(QUnit.equiv(null, undefined), false, "null");
    equals(QUnit.equiv(null, 0), false, "null");
    equals(QUnit.equiv(null, false), false, "null");
    equals(QUnit.equiv(null, ''), false, "null");
    equals(QUnit.equiv(null, []), false, "null");

    equals(QUnit.equiv(undefined, undefined), true, "undefined");
    equals(QUnit.equiv(undefined, null), false, "undefined");
    equals(QUnit.equiv(undefined, 0), false, "undefined");
    equals(QUnit.equiv(undefined, false), false, "undefined");
    equals(QUnit.equiv(undefined, {}), false, "undefined");
    equals(QUnit.equiv(undefined, []), false, "undefined");
    equals(QUnit.equiv(undefined, ""), false, "undefined");

    // Nan usually doest not equal to Nan using the '==' operator.
    // Only isNaN() is able to do it.
    equals(QUnit.equiv(0/0, 0/0), true, "NaN"); // NaN VS NaN
    equals(QUnit.equiv(1/0, 2/0), true, "Infinity"); // Infinity VS Infinity
    equals(QUnit.equiv(-1/0, 2/0), false, "-Infinity, Infinity"); // -Infinity VS Infinity
    equals(QUnit.equiv(-1/0, -2/0), true, "-Infinity, -Infinity"); // -Infinity VS -Infinity
    equals(QUnit.equiv(0/0, 1/0), false, "NaN, Infinity"); // Nan VS Infinity
    equals(QUnit.equiv(1/0, 0/0), false, "NaN, Infinity"); // Nan VS Infinity
    equals(QUnit.equiv(0/0, null), false, "NaN");
    equals(QUnit.equiv(0/0, undefined), false, "NaN");
    equals(QUnit.equiv(0/0, 0), false, "NaN");
    equals(QUnit.equiv(0/0, false), false, "NaN");
    equals(QUnit.equiv(0/0, function () {}), false, "NaN");
    equals(QUnit.equiv(1/0, null), false, "NaN, Infinity");
    equals(QUnit.equiv(1/0, undefined), false, "NaN, Infinity");
    equals(QUnit.equiv(1/0, 0), false, "NaN, Infinity");
    equals(QUnit.equiv(1/0, 1), false, "NaN, Infinity");
    equals(QUnit.equiv(1/0, false), false, "NaN, Infinity");
    equals(QUnit.equiv(1/0, true), false, "NaN, Infinity");
    equals(QUnit.equiv(1/0, function () {}), false, "NaN, Infinity");

    equals(QUnit.equiv(0, 0), true, "number");
    equals(QUnit.equiv(0, 1), false, "number");
    equals(QUnit.equiv(1, 0), false, "number");
    equals(QUnit.equiv(1, 1), true, "number");
    equals(QUnit.equiv(1.1, 1.1), true, "number");
    equals(QUnit.equiv(0.0000005, 0.0000005), true, "number");
    equals(QUnit.equiv(0, ''), false, "number");
    equals(QUnit.equiv(0, '0'), false, "number");
    equals(QUnit.equiv(1, '1'), false, "number");
    equals(QUnit.equiv(0, false), false, "number");
    equals(QUnit.equiv(1, true), false, "number");

    equals(QUnit.equiv(true, true), true, "boolean");
    equals(QUnit.equiv(true, false), false, "boolean");
    equals(QUnit.equiv(false, true), false, "boolean");
    equals(QUnit.equiv(false, 0), false, "boolean");
    equals(QUnit.equiv(false, null), false, "boolean");
    equals(QUnit.equiv(false, undefined), false, "boolean");
    equals(QUnit.equiv(true, 1), false, "boolean");
    equals(QUnit.equiv(true, null), false, "boolean");
    equals(QUnit.equiv(true, undefined), false, "boolean");

    equals(QUnit.equiv('', ''), true, "string");
    equals(QUnit.equiv('a', 'a'), true, "string");
    equals(QUnit.equiv("foobar", "foobar"), true, "string");
    equals(QUnit.equiv("foobar", "foo"), false, "string");
    equals(QUnit.equiv('', 0), false, "string");
    equals(QUnit.equiv('', false), false, "string");
    equals(QUnit.equiv('', null), false, "string");
    equals(QUnit.equiv('', undefined), false, "string");
    
    // Short annotation VS new annotation
    equals(QUnit.equiv(0, new Number()), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new Number(), 0), true, "short annotation VS new annotation");
    equals(QUnit.equiv(1, new Number(1)), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new Number(1), 1), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new Number(0), 1), false, "short annotation VS new annotation");
    equals(QUnit.equiv(0, new Number(1)), false, "short annotation VS new annotation");

    equals(QUnit.equiv(new String(), ""), true, "short annotation VS new annotation");
    equals(QUnit.equiv("", new String()), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new String("My String"), "My String"), true, "short annotation VS new annotation");
    equals(QUnit.equiv("My String", new String("My String")), true, "short annotation VS new annotation");
    equals(QUnit.equiv("Bad String", new String("My String")), false, "short annotation VS new annotation");
    equals(QUnit.equiv(new String("Bad String"), "My String"), false, "short annotation VS new annotation");

    equals(QUnit.equiv(false, new Boolean()), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new Boolean(), false), true, "short annotation VS new annotation");
    equals(QUnit.equiv(true, new Boolean(true)), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new Boolean(true), true), true, "short annotation VS new annotation");
    equals(QUnit.equiv(true, new Boolean(1)), true, "short annotation VS new annotation");
    equals(QUnit.equiv(false, new Boolean(false)), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new Boolean(false), false), true, "short annotation VS new annotation");
    equals(QUnit.equiv(false, new Boolean(0)), true, "short annotation VS new annotation");
    equals(QUnit.equiv(true, new Boolean(false)), false, "short annotation VS new annotation");
    equals(QUnit.equiv(new Boolean(false), true), false, "short annotation VS new annotation");

    equals(QUnit.equiv(new Object(), {}), true, "short annotation VS new annotation");
    equals(QUnit.equiv({}, new Object()), true, "short annotation VS new annotation");
    equals(QUnit.equiv(new Object(), {a:1}), false, "short annotation VS new annotation");
    equals(QUnit.equiv({a:1}, new Object()), false, "short annotation VS new annotation");
    equals(QUnit.equiv({a:undefined}, new Object()), false, "short annotation VS new annotation");
    equals(QUnit.equiv(new Object(), {a:undefined}), false, "short annotation VS new annotation");
});

test("Objects Basics.", function() {
    equals(QUnit.equiv({}, {}), true);
    equals(QUnit.equiv({}, null), false);
    equals(QUnit.equiv({}, undefined), false);
    equals(QUnit.equiv({}, 0), false);
    equals(QUnit.equiv({}, false), false);

    // This test is a hard one, it is very important
    // REASONS:
    //      1) They are of the same type "object"
    //      2) [] instanceof Object is true
    //      3) Their properties are the same (doesn't exists)
    equals(QUnit.equiv({}, []), false);

    equals(QUnit.equiv({a:1}, {a:1}), true);
    equals(QUnit.equiv({a:1}, {a:"1"}), false);
    equals(QUnit.equiv({a:[]}, {a:[]}), true);
    equals(QUnit.equiv({a:{}}, {a:null}), false);
    equals(QUnit.equiv({a:1}, {}), false);
    equals(QUnit.equiv({}, {a:1}), false);

    // Hard ones
    equals(QUnit.equiv({a:undefined}, {}), false);
    equals(QUnit.equiv({}, {a:undefined}), false);
    equals(QUnit.equiv(
        {
            a: [{ bar: undefined }]
        },
        {
            a: [{ bat: undefined }]
        }
    ), false);
});


test("Arrays Basics.", function() {

    equals(QUnit.equiv([], []), true);

    // May be a hard one, can invoke a crash at execution.
    // because their types are both "object" but null isn't
    // like a true object, it doesn't have any property at all.
    equals(QUnit.equiv([], null), false);

    equals(QUnit.equiv([], undefined), false);
    equals(QUnit.equiv([], false), false);
    equals(QUnit.equiv([], 0), false);
    equals(QUnit.equiv([], ""), false);

    // May be a hard one, but less hard
    // than {} with [] (note the order)
    equals(QUnit.equiv([], {}), false);

    equals(QUnit.equiv([null],[]), false);
    equals(QUnit.equiv([undefined],[]), false);
    equals(QUnit.equiv([],[null]), false);
    equals(QUnit.equiv([],[undefined]), false);
    equals(QUnit.equiv([null],[undefined]), false);
    equals(QUnit.equiv([[]],[[]]), true);
    equals(QUnit.equiv([[],[],[]],[[],[],[]]), true);
    equals(QUnit.equiv(
                            [[],[],[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
                            [[],[],[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]),
                            true);
    equals(QUnit.equiv(
                            [[],[],[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
                            [[],[],[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]), // shorter
                            false);
    equals(QUnit.equiv(
                            [[],[],[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[{}]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
                            [[],[],[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]), // deepest element not an array
                            false);

    // same multidimensional
    equals(QUnit.equiv(
                            [1,2,3,4,5,6,7,8,9, [
                                1,2,3,4,5,6,7,8,9, [
                                    1,2,3,4,5,[
                                        [6,7,8,9, [
                                            [
                                                1,2,3,4,[
                                                    2,3,4,[
                                                        1,2,[
                                                            1,2,3,4,[
                                                                1,2,3,4,5,6,7,8,9,[
                                                                    0
                                                                ],1,2,3,4,5,6,7,8,9
                                                            ],5,6,7,8,9
                                                        ],4,5,6,7,8,9
                                                    ],5,6,7,8,9
                                                ],5,6,7
                                            ]
                                        ]
                                    ]
                                ]
                            ]]],
                            [1,2,3,4,5,6,7,8,9, [
                                1,2,3,4,5,6,7,8,9, [
                                    1,2,3,4,5,[
                                        [6,7,8,9, [
                                            [
                                                1,2,3,4,[
                                                    2,3,4,[
                                                        1,2,[
                                                            1,2,3,4,[
                                                                1,2,3,4,5,6,7,8,9,[
                                                                    0
                                                                ],1,2,3,4,5,6,7,8,9
                                                            ],5,6,7,8,9
                                                        ],4,5,6,7,8,9
                                                    ],5,6,7,8,9
                                                ],5,6,7
                                            ]
                                        ]
                                    ]
                                ]
                            ]]]),
                            true, "Multidimensional");

    // different multidimensional
    equals(QUnit.equiv(
                            [1,2,3,4,5,6,7,8,9, [
                                1,2,3,4,5,6,7,8,9, [
                                    1,2,3,4,5,[
                                        [6,7,8,9, [
                                            [
                                                1,2,3,4,[
                                                    2,3,4,[
                                                        1,2,[
                                                            1,2,3,4,[
                                                                1,2,3,4,5,6,7,8,9,[
                                                                    0
                                                                ],1,2,3,4,5,6,7,8,9
                                                            ],5,6,7,8,9
                                                        ],4,5,6,7,8,9
                                                    ],5,6,7,8,9
                                                ],5,6,7
                                            ]
                                        ]
                                    ]
                                ]
                            ]]],
                            [1,2,3,4,5,6,7,8,9, [
                                1,2,3,4,5,6,7,8,9, [
                                    1,2,3,4,5,[
                                        [6,7,8,9, [
                                            [
                                                1,2,3,4,[
                                                    2,3,4,[
                                                        1,2,[
                                                            '1',2,3,4,[                 // string instead of number
                                                                1,2,3,4,5,6,7,8,9,[
                                                                    0
                                                                ],1,2,3,4,5,6,7,8,9
                                                            ],5,6,7,8,9
                                                        ],4,5,6,7,8,9
                                                    ],5,6,7,8,9
                                                ],5,6,7
                                            ]
                                        ]
                                    ]
                                ]
                            ]]]),
                            false, "Multidimensional");

    // different multidimensional
    equals(QUnit.equiv(
                            [1,2,3,4,5,6,7,8,9, [
                                1,2,3,4,5,6,7,8,9, [
                                    1,2,3,4,5,[
                                        [6,7,8,9, [
                                            [
                                                1,2,3,4,[
                                                    2,3,4,[
                                                        1,2,[
                                                            1,2,3,4,[
                                                                1,2,3,4,5,6,7,8,9,[
                                                                    0
                                                                ],1,2,3,4,5,6,7,8,9
                                                            ],5,6,7,8,9
                                                        ],4,5,6,7,8,9
                                                    ],5,6,7,8,9
                                                ],5,6,7
                                            ]
                                        ]
                                    ]
                                ]
                            ]]],
                            [1,2,3,4,5,6,7,8,9, [
                                1,2,3,4,5,6,7,8,9, [
                                    1,2,3,4,5,[
                                        [6,7,8,9, [
                                            [
                                                1,2,3,4,[
                                                    2,3,[                   // missing an element (4)
                                                        1,2,[
                                                            1,2,3,4,[
                                                                1,2,3,4,5,6,7,8,9,[
                                                                    0
                                                                ],1,2,3,4,5,6,7,8,9
                                                            ],5,6,7,8,9
                                                        ],4,5,6,7,8,9
                                                    ],5,6,7,8,9
                                                ],5,6,7
                                            ]
                                        ]
                                    ]
                                ]
                            ]]]),
                            false, "Multidimensional");
});

test("Functions.", function() {
    var f0 = function () {};
    var f1 = function () {};

    // f2 and f3 have the same code, formatted differently
    var f2 = function () {var i = 0;};
    var f3 = function () {
        var i = 0 // this comment and no semicoma as difference
    };

    equals(QUnit.equiv(function() {}, function() {}), false, "Anonymous functions"); // exact source code
    equals(QUnit.equiv(function() {}, function() {return true;}), false, "Anonymous functions");

    equals(QUnit.equiv(f0, f0), true, "Function references"); // same references
    equals(QUnit.equiv(f0, f1), false, "Function references"); // exact source code, different references
    equals(QUnit.equiv(f2, f3), false, "Function references"); // equivalent source code, different references
    equals(QUnit.equiv(f1, f2), false, "Function references"); // different source code, different references
    equals(QUnit.equiv(function() {}, true), false);
    equals(QUnit.equiv(function() {}, undefined), false);
    equals(QUnit.equiv(function() {}, null), false);
    equals(QUnit.equiv(function() {}, {}), false);
});


test("Date instances.", function() {
    // Date, we don't need to test Date.parse() because it returns a number.
    // Only test the Date instances by setting them a fix date.
    // The date use is midnight January 1, 1970
    
    var d1 = new Date();
    d1.setTime(0); // fix the date

    var d2 = new Date();
    d2.setTime(0); // fix the date

    var d3 = new Date(); // The very now

    // Anyway their types differs, just in case the code fails in the order in which it deals with date
    equals(QUnit.equiv(d1, 0), false); // d1.valueOf() returns 0, but d1 and 0 are different
    // test same values date and different instances equality
    equals(QUnit.equiv(d1, d2), true);
    // test different date and different instances difference
    equals(QUnit.equiv(d1, d3), false);
});


test("RegExp.", function() {
    // Must test cases that imply those traps:
    // var a = /./;
    // a instanceof Object;        // Oops
    // a instanceof RegExp;        // Oops
    // typeof a === "function";    // Oops, false in IE and Opera, true in FF and Safari ("object")

    // Tests same regex with same modifiers in different order
    var r = /foo/;
    var r5 = /foo/gim;
    var r6 = /foo/gmi;
    var r7 = /foo/igm;
    var r8 = /foo/img;
    var r9 = /foo/mig;
    var r10 = /foo/mgi;
    var ri1 = /foo/i;
    var ri2 = /foo/i;
    var rm1 = /foo/m;
    var rm2 = /foo/m;
    var rg1 = /foo/g;
    var rg2 = /foo/g;

    equals(QUnit.equiv(r5, r6), true, "Modifier order");
    equals(QUnit.equiv(r5, r7), true, "Modifier order");
    equals(QUnit.equiv(r5, r8), true, "Modifier order");
    equals(QUnit.equiv(r5, r9), true, "Modifier order");
    equals(QUnit.equiv(r5, r10), true, "Modifier order");
    equals(QUnit.equiv(r, r5), false, "Modifier");

    equals(QUnit.equiv(ri1, ri2), true, "Modifier");
    equals(QUnit.equiv(r, ri1), false, "Modifier");
    equals(QUnit.equiv(ri1, rm1), false, "Modifier");
    equals(QUnit.equiv(r, rm1), false, "Modifier");
    equals(QUnit.equiv(rm1, ri1), false, "Modifier");
    equals(QUnit.equiv(rm1, rm2), true, "Modifier");
    equals(QUnit.equiv(rg1, rm1), false, "Modifier");
    equals(QUnit.equiv(rm1, rg1), false, "Modifier");
    equals(QUnit.equiv(rg1, rg2), true, "Modifier");

    // Different regex, same modifiers
    var r11 = /[a-z]/gi;
    var r13 = /[0-9]/gi; // oops! different
    equals(QUnit.equiv(r11, r13), false, "Regex pattern");

    var r14 = /0/ig;
    var r15 = /"0"/ig; // oops! different
    equals(QUnit.equiv(r14, r15), false, "Regex pattern");

    var r1 = /[\n\r\u2028\u2029]/g;
    var r2 = /[\n\r\u2028\u2029]/g;
    var r3 = /[\n\r\u2028\u2028]/g; // differs from r1
    var r4 = /[\n\r\u2028\u2029]/;  // differs from r1

    equals(QUnit.equiv(r1, r2), true, "Regex pattern");
    equals(QUnit.equiv(r1, r3), false, "Regex pattern");
    equals(QUnit.equiv(r1, r4), false, "Regex pattern");

    // More complex regex
    var regex1 = "^[-_.a-z0-9]+@([-_a-z0-9]+\\.)+([A-Za-z][A-Za-z]|[A-Za-z][A-Za-z][A-Za-z])|(([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5]))$";
    var regex2 = "^[-_.a-z0-9]+@([-_a-z0-9]+\\.)+([A-Za-z][A-Za-z]|[A-Za-z][A-Za-z][A-Za-z])|(([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5]))$";
    // regex 3 is different: '.' not escaped
    var regex3 = "^[-_.a-z0-9]+@([-_a-z0-9]+.)+([A-Za-z][A-Za-z]|[A-Za-z][A-Za-z][A-Za-z])|(([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5]))$";

    var r21 = new RegExp(regex1);
    var r22 = new RegExp(regex2);
    var r23 = new RegExp(regex3); // diff from r21, not same pattern
    var r23a = new RegExp(regex3, "gi"); // diff from r23, not same modifier
    var r24a = new RegExp(regex3, "ig"); // same as r23a

    equals(QUnit.equiv(r21, r22), true, "Complex Regex");
    equals(QUnit.equiv(r21, r23), false, "Complex Regex");
    equals(QUnit.equiv(r23, r23a), false, "Complex Regex");
    equals(QUnit.equiv(r23a, r24a), true, "Complex Regex");

    // typeof r1 is "function" in some browsers and "object" in others so we must cover this test
    var re = / /;
    equals(QUnit.equiv(re, function () {}), false, "Regex internal");
    equals(QUnit.equiv(re, {}), false, "Regex internal");
});


test("Complex Objects.", function() {

    function fn1() {
        return "fn1";
    }
    function fn2() {
        return "fn2";
    }
    
    // Try to invert the order of some properties to make sure it is covered.
    // It can failed when properties are compared between unsorted arrays.
    equals(QUnit.equiv(
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                a: 3.14159,
                b: false,
                c: {
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    r: "r",
                                    s: [1,2,3],
                                    t: undefined,
                                    u: 0,
                                    v: {
                                        w: {
                                            x: {
                                                y: "Yahoo!",
                                                z: null
                                            }
                                        }
                                    }
                                },
                                q: [],
                                p: 1/0,
                                o: 99
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    d: 0,
                    i: true,
                    h: "false"
                }
            },
            e: undefined,
            g: "",
            h: "h",
            f: {},
            i: []
        },
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                b: false,
                a: 3.14159,
                c: {
                    d: 0,
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    r: "r",
                                    t: undefined,
                                    u: 0,
                                    s: [1,2,3],
                                    v: {
                                        w: {
                                            x: {
                                                z: null,
                                                y: "Yahoo!"
                                            }
                                        }
                                    }
                                },
                                o: 99,
                                p: 1/0,
                                q: []
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    i: true,
                    h: "false"
                }
            },
            e: undefined,
            g: "",
            f: {},
            h: "h",
            i: []
        }
    ), true);

    equals(QUnit.equiv(
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                a: 3.14159,
                b: false,
                c: {
                    d: 0,
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    //r: "r",   // different: missing a property
                                    s: [1,2,3],
                                    t: undefined,
                                    u: 0,
                                    v: {
                                        w: {
                                            x: {
                                                y: "Yahoo!",
                                                z: null
                                            }
                                        }
                                    }
                                },
                                o: 99,
                                p: 1/0,
                                q: []
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    h: "false",
                    i: true
                }
            },
            e: undefined,
            f: {},
            g: "",
            h: "h",
            i: []
        },
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                a: 3.14159,
                b: false,
                c: {
                    d: 0,
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    r: "r",
                                    s: [1,2,3],
                                    t: undefined,
                                    u: 0,
                                    v: {
                                        w: {
                                            x: {
                                                y: "Yahoo!",
                                                z: null
                                            }
                                        }
                                    }
                                },
                                o: 99,
                                p: 1/0,
                                q: []
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    h: "false",
                    i: true
                }
            },
            e: undefined,
            f: {},
            g: "",
            h: "h",
            i: []
        }
    ), false);

    equals(QUnit.equiv(
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                a: 3.14159,
                b: false,
                c: {
                    d: 0,
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    r: "r",
                                    s: [1,2,3],
                                    t: undefined,
                                    u: 0,
                                    v: {
                                        w: {
                                            x: {
                                                y: "Yahoo!",
                                                z: null
                                            }
                                        }
                                    }
                                },
                                o: 99,
                                p: 1/0,
                                q: []
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    h: "false",
                    i: true
                }
            },
            e: undefined,
            f: {},
            g: "",
            h: "h",
            i: []
        },
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                a: 3.14159,
                b: false,
                c: {
                    d: 0,
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    r: "r",
                                    s: [1,2,3],
                                    //t: undefined,                 // different: missing a property with an undefined value
                                    u: 0,
                                    v: {
                                        w: {
                                            x: {
                                                y: "Yahoo!",
                                                z: null
                                            }
                                        }
                                    }
                                },
                                o: 99,
                                p: 1/0,
                                q: []
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    h: "false",
                    i: true
                }
            },
            e: undefined,
            f: {},
            g: "",
            h: "h",
            i: []
        }
    ), false);

    equals(QUnit.equiv(
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                a: 3.14159,
                b: false,
                c: {
                    d: 0,
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    r: "r",
                                    s: [1,2,3],
                                    t: undefined,
                                    u: 0,
                                    v: {
                                        w: {
                                            x: {
                                                y: "Yahoo!",
                                                z: null
                                            }
                                        }
                                    }
                                },
                                o: 99,
                                p: 1/0,
                                q: []
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    h: "false",
                    i: true
                }
            },
            e: undefined,
            f: {},
            g: "",
            h: "h",
            i: []
        },
        {
            a: 1,
            b: null,
            c: [{}],
            d: {
                a: 3.14159,
                b: false,
                c: {
                    d: 0,
                    e: fn1,
                    f: [[[]]],
                    g: {
                        j: {
                            k: {
                                n: {
                                    r: "r",
                                    s: [1,2,3],
                                    t: undefined,
                                    u: 0,
                                    v: {
                                        w: {
                                            x: {
                                                y: "Yahoo!",
                                                z: null
                                            }
                                        }
                                    }
                                },
                                o: 99,
                                p: 1/0,
                                q: {}           // different was []
                            },
                            l: undefined,
                            m: null
                        }
                    },
                    h: "false",
                    i: true
                }
            },
            e: undefined,
            f: {},
            g: "",
            h: "h",
            i: []
        }
    ), false);

    var same1 = {
        a: [
            "string", null, 0, "1", 1, {
                prop: null,
                foo: [1,2,null,{}, [], [1,2,3]],
                bar: undefined
            }, 3, "Hey!", "Κάνε πάντα γνωρίζουμε ας των, μηχανής επιδιόρθωσης επιδιορθώσεις ώς μια. Κλπ ας"
        ],
        unicode: "老 汉语中存在 港澳和海外的华人圈中 贵州 我去了书店 现在尚有争",
        b: "b",
        c: fn1
    };

    var same2 = {
        a: [
            "string", null, 0, "1", 1, {
                prop: null,
                foo: [1,2,null,{}, [], [1,2,3]],
                bar: undefined
            }, 3, "Hey!", "Κάνε πάντα γνωρίζουμε ας των, μηχανής επιδιόρθωσης επιδιορθώσεις ώς μια. Κλπ ας"
        ],
        unicode: "老 汉语中存在 港澳和海外的华人圈中 贵州 我去了书店 现在尚有争",
        b: "b",
        c: fn1
    };

    var diff1 = {
        a: [
            "string", null, 0, "1", 1, {
                prop: null,
                foo: [1,2,null,{}, [], [1,2,3,4]], // different: 4 was add to the array
                bar: undefined
            }, 3, "Hey!", "Κάνε πάντα γνωρίζουμε ας των, μηχανής επιδιόρθωσης επιδιορθώσεις ώς μια. Κλπ ας"
        ],
        unicode: "老 汉语中存在 港澳和海外的华人圈中 贵州 我去了书店 现在尚有争",
        b: "b",
        c: fn1
    };

    var diff2 = {
        a: [
            "string", null, 0, "1", 1, {
                prop: null,
                foo: [1,2,null,{}, [], [1,2,3]],
                newprop: undefined, // different: newprop was added
                bar: undefined
            }, 3, "Hey!", "Κάνε πάντα γνωρίζουμε ας των, μηχανής επιδιόρθωσης επιδιορθώσεις ώς μια. Κλπ ας"
        ],
        unicode: "老 汉语中存在 港澳和海外的华人圈中 贵州 我去了书店 现在尚有争",
        b: "b",
        c: fn1
    };

    var diff3 = {
        a: [
            "string", null, 0, "1", 1, {
                prop: null,
                foo: [1,2,null,{}, [], [1,2,3]],
                bar: undefined
            }, 3, "Hey!", "Κάνε πάντα γνωρίζουμε ας των, μηχανής επιδιόρθωσης επιδιορθώσεις ώς μια. Κλπ α" // different: missing last char
        ],
        unicode: "老 汉语中存在 港澳和海外的华人圈中 贵州 我去了书店 现在尚有争",
        b: "b",
        c: fn1
    };

    var diff4 = {
        a: [
            "string", null, 0, "1", 1, {
                prop: null,
                foo: [1,2,undefined,{}, [], [1,2,3]], // different: undefined instead of null
                bar: undefined
            }, 3, "Hey!", "Κάνε πάντα γνωρίζουμε ας των, μηχανής επιδιόρθωσης επιδιορθώσεις ώς μια. Κλπ ας"
        ],
        unicode: "老 汉语中存在 港澳和海外的华人圈中 贵州 我去了书店 现在尚有争",
        b: "b",
        c: fn1
    };

    var diff5 = {
        a: [
            "string", null, 0, "1", 1, {
                prop: null,
                foo: [1,2,null,{}, [], [1,2,3]],
                bat: undefined // different: property name not "bar"
            }, 3, "Hey!", "Κάνε πάντα γνωρίζουμε ας των, μηχανής επιδιόρθωσης επιδιορθώσεις ώς μια. Κλπ ας"
        ],
        unicode: "老 汉语中存在 港澳和海外的华人圈中 贵州 我去了书店 现在尚有争",
        b: "b",
        c: fn1
    };

    equals(QUnit.equiv(same1, same2), true);
    equals(QUnit.equiv(same2, same1), true);
    equals(QUnit.equiv(same2, diff1), false);
    equals(QUnit.equiv(diff1, same2), false);

    equals(QUnit.equiv(same1, diff1), false);
    equals(QUnit.equiv(same1, diff2), false);
    equals(QUnit.equiv(same1, diff3), false);
    equals(QUnit.equiv(same1, diff3), false);
    equals(QUnit.equiv(same1, diff4), false);
    equals(QUnit.equiv(same1, diff5), false);
    equals(QUnit.equiv(diff5, diff1), false);
});


test("Complex Arrays.", function() {

    function fn() {
    }

    equals(QUnit.equiv(
                [1, 2, 3, true, {}, null, [
                    {
                        a: ["", '1', 0]
                    },
                    5, 6, 7
                ], "foo"],
                [1, 2, 3, true, {}, null, [
                    {
                        a: ["", '1', 0]
                    },
                    5, 6, 7
                ], "foo"]),
            true);

    equals(QUnit.equiv(
                [1, 2, 3, true, {}, null, [
                    {
                        a: ["", '1', 0]
                    },
                    5, 6, 7
                ], "foo"],
                [1, 2, 3, true, {}, null, [
                    {
                        b: ["", '1', 0]         // not same property name
                    },
                    5, 6, 7
                ], "foo"]),
            false);

    var a = [{
        b: fn,
        c: false,
        "do": "reserved word",
        "for": {
            ar: [3,5,9,"hey!", [], {
                ar: [1,[
                    3,4,6,9, null, [], []
                ]],
                e: fn,
                f: undefined
            }]
        },
        e: 0.43445
    }, 5, "string", 0, fn, false, null, undefined, 0, [
        4,5,6,7,8,9,11,22,33,44,55,"66", null, [], [[[[[3]]]], "3"], {}, 1/0
    ], [], [[[], "foo", null, {
        n: 1/0,
        z: {
            a: [3,4,5,6,"yep!", undefined, undefined],
            b: {}
        }
    }, {}]]];

    equals(QUnit.equiv(a,
            [{
                b: fn,
                c: false,
                "do": "reserved word",
                "for": {
                    ar: [3,5,9,"hey!", [], {
                        ar: [1,[
                            3,4,6,9, null, [], []
                        ]],
                        e: fn,
                        f: undefined
                    }]
                },
                e: 0.43445
            }, 5, "string", 0, fn, false, null, undefined, 0, [
                4,5,6,7,8,9,11,22,33,44,55,"66", null, [], [[[[[3]]]], "3"], {}, 1/0
            ], [], [[[], "foo", null, {
                n: 1/0,
                z: {
                    a: [3,4,5,6,"yep!", undefined, undefined],
                    b: {}
                }
            }, {}]]]), true);

    equals(QUnit.equiv(a,
            [{
                b: fn,
                c: false,
                "do": "reserved word",
                "for": {
                    ar: [3,5,9,"hey!", [], {
                        ar: [1,[
                            3,4,6,9, null, [], []
                        ]],
                        e: fn,
                        f: undefined
                    }]
                },
                e: 0.43445
            }, 5, "string", 0, fn, false, null, undefined, 0, [
                4,5,6,7,8,9,11,22,33,44,55,"66", null, [], [[[[[2]]]], "3"], {}, 1/0    // different: [[[[[2]]]]] instead of [[[[[3]]]]]
            ], [], [[[], "foo", null, {
                n: 1/0,
                z: {
                    a: [3,4,5,6,"yep!", undefined, undefined],
                    b: {}
                }
            }, {}]]]), false);

    equals(QUnit.equiv(a,
            [{
                b: fn,
                c: false,
                "do": "reserved word",
                "for": {
                    ar: [3,5,9,"hey!", [], {
                        ar: [1,[
                            3,4,6,9, null, [], []
                        ]],
                        e: fn,
                        f: undefined
                    }]
                },
                e: 0.43445
            }, 5, "string", 0, fn, false, null, undefined, 0, [
                4,5,6,7,8,9,11,22,33,44,55,"66", null, [], [[[[[3]]]], "3"], {}, 1/0
            ], [], [[[], "foo", null, {
                n: -1/0,                                                                // different, -Infinity instead of Infinity
                z: {
                    a: [3,4,5,6,"yep!", undefined, undefined],
                    b: {}
                }
            }, {}]]]), false);

    equals(QUnit.equiv(a,
            [{
                b: fn,
                c: false,
                "do": "reserved word",
                "for": {
                    ar: [3,5,9,"hey!", [], {
                        ar: [1,[
                            3,4,6,9, null, [], []
                        ]],
                        e: fn,
                        f: undefined
                    }]
                },
                e: 0.43445
            }, 5, "string", 0, fn, false, null, undefined, 0, [
                4,5,6,7,8,9,11,22,33,44,55,"66", null, [], [[[[[3]]]], "3"], {}, 1/0
            ], [], [[[], "foo", {                                                       // different: null is missing
                n: 1/0,
                z: {
                    a: [3,4,5,6,"yep!", undefined, undefined],
                    b: {}
                }
            }, {}]]]), false);

    equals(QUnit.equiv(a,
            [{
                b: fn,
                c: false,
                "do": "reserved word",
                "for": {
                    ar: [3,5,9,"hey!", [], {
                        ar: [1,[
                            3,4,6,9, null, [], []
                        ]],
                        e: fn
                                                                                // different: missing property f: undefined
                    }]
                },
                e: 0.43445
            }, 5, "string", 0, fn, false, null, undefined, 0, [
                4,5,6,7,8,9,11,22,33,44,55,"66", null, [], [[[[[3]]]], "3"], {}, 1/0
            ], [], [[[], "foo", null, {
                n: 1/0,
                z: {
                    a: [3,4,5,6,"yep!", undefined, undefined],
                    b: {}
                }
            }, {}]]]), false);
});


test("Prototypal inheritance", function() {
    function Gizmo(id) {
        this.id = id;
    }

    function Hoozit(id) {
        this.id = id;
    }
    Hoozit.prototype = new Gizmo();

    var gizmo = new Gizmo("ok");
    var hoozit = new Hoozit("ok");

    // Try this test many times after test on instances that hold function
    // to make sure that our code does not mess with last object constructor memoization.
    equals(QUnit.equiv(function () {}, function () {}), false);

    // Hoozit inherit from Gizmo
    // hoozit instanceof Hoozit; // true
    // hoozit instanceof Gizmo; // true
    equals(QUnit.equiv(hoozit, gizmo), true);

    Gizmo.prototype.bar = true; // not a function just in case we skip them

    // Hoozit inherit from Gizmo
    // They are equivalent
    equals(QUnit.equiv(hoozit, gizmo), true);

    // Make sure this is still true !important
    // The reason for this is that I forgot to reset the last
    // caller to where it were called from.
    equals(QUnit.equiv(function () {}, function () {}), false);

    // Make sure this is still true !important
    equals(QUnit.equiv(hoozit, gizmo), true);

    Hoozit.prototype.foo = true; // not a function just in case we skip them

    // Gizmo does not inherit from Hoozit
    // gizmo instanceof Gizmo; // true
    // gizmo instanceof Hoozit; // false
    // They are not equivalent
    equals(QUnit.equiv(hoozit, gizmo), false);

    // Make sure this is still true !important
    equals(QUnit.equiv(function () {}, function () {}), false);
});


test("Instances", function() {
    function A() {} 
    var a1 = new A(); 
    var a2 = new A(); 

    function B() {
        this.fn = function () {};
    } 
    var b1 = new B(); 
    var b2 = new B(); 

    equals(QUnit.equiv(a1, a2), true, "Same property, same constructor");

    // b1.fn and b2.fn are functions but they are different references
    // But we decided to skip function for instances.
    equals(QUnit.equiv(b1, b2), true, "Same property, same constructor");
    equals(QUnit.equiv(a1, b1), false, "Same properties but different constructor"); // failed

    function Car(year) {
        var privateVar = 0;
        this.year = year;
        this.isOld = function() {
            return year > 10;
        };
    }

    function Human(year) {
        var privateVar = 1;
        this.year = year;
        this.isOld = function() {
            return year > 80;
        };
    }

    var car = new Car(30);
    var carSame = new Car(30);
    var carDiff = new Car(10);
    var human = new Human(30);

    var diff = {
        year: 30
    };

    var same = {
        year: 30,
        isOld: function () {}
    };

    equals(QUnit.equiv(car, car), true);
    equals(QUnit.equiv(car, carDiff), false);
    equals(QUnit.equiv(car, carSame), true);
    equals(QUnit.equiv(car, human), false);
});


test("Complex Instances Nesting (with function value in literals and/or in nested instances)", function() {
    function A(fn) {
        this.a = {};
        this.fn = fn;
        this.b = {a: []};
        this.o = {};
        this.fn1 = fn;
    }
    function B(fn) {
        this.fn = fn;
        this.fn1 = function () {};
        this.a = new A(function () {});
    }

    function fnOutside() {
    }

    function C(fn) {
        function fnInside() {
        }
        this.x = 10;
        this.fn = fn;
        this.fn1 = function () {};
        this.fn2 = fnInside;
        this.fn3 = {
            a: true,
            b: fnOutside // ok make reference to a function in all instances scope
        };
        this.o1 = {};

        // This function will be ignored.
        // Even if it is not visible for all instances (e.g. locked in a closures),
        // it is from a  property that makes part of an instance (e.g. from the C constructor)
        this.b1 = new B(function () {});
        this.b2 = new B({
            x: {
                b2: new B(function() {})
            }
        });
    }

    function D(fn) {
        function fnInside() {
        }
        this.x = 10;
        this.fn = fn;
        this.fn1 = function () {};
        this.fn2 = fnInside;
        this.fn3 = {
            a: true,
            b: fnOutside, // ok make reference to a function in all instances scope

            // This function won't be ingored.
            // It isn't visible for all C insances
            // and it is not in a property of an instance. (in an Object instances e.g. the object literal)
            c: fnInside
        };
        this.o1 = {};

        // This function will be ignored.
        // Even if it is not visible for all instances (e.g. locked in a closures),
        // it is from a  property that makes part of an instance (e.g. from the C constructor)
        this.b1 = new B(function () {});
        this.b2 = new B({
            x: {
                b2: new B(function() {})
            }
        });
    }

    function E(fn) {
        function fnInside() {
        }
        this.x = 10;
        this.fn = fn;
        this.fn1 = function () {};
        this.fn2 = fnInside;
        this.fn3 = {
            a: true,
            b: fnOutside // ok make reference to a function in all instances scope
        };
        this.o1 = {};

        // This function will be ignored.
        // Even if it is not visible for all instances (e.g. locked in a closures),
        // it is from a  property that makes part of an instance (e.g. from the C constructor)
        this.b1 = new B(function () {});
        this.b2 = new B({
            x: {
                b1: new B({a: function() {}}),
                b2: new B(function() {})
            }
        });
    }


    var a1 = new A(function () {});
    var a2 = new A(function () {});
    equals(QUnit.equiv(a1, a2), true);

    equals(QUnit.equiv(a1, a2), true); // different instances

    var b1 = new B(function () {});
    var b2 = new B(function () {});
    equals(QUnit.equiv(b1, b2), true);

    var c1 = new C(function () {});
    var c2 = new C(function () {});
    equals(QUnit.equiv(c1, c2), true);

    var d1 = new D(function () {});
    var d2 = new D(function () {});
    equals(QUnit.equiv(d1, d2), false);

    var e1 = new E(function () {});
    var e2 = new E(function () {});
    equals(QUnit.equiv(e1, e2), false);

});


test('object with references to self wont loop', function(){
    var circularA = {
        abc:null
    }, circularB = {
        abc:null
    };
    circularA.abc = circularA;
    circularB.abc = circularB;
    equals(QUnit.equiv(circularA, circularB), true, "Should not repeat test on object (ambigous test)");
    
    circularA.def = 1;
    circularB.def = 1;
    equals(QUnit.equiv(circularA, circularB), true, "Should not repeat test on object (ambigous test)");
    
    circularA.def = 1;
    circularB.def = 0;
    equals(QUnit.equiv(circularA, circularB), false, "Should not repeat test on object (unambigous test)");
});

test('array with references to self wont loop', function(){
    var circularA = [], 
        circularB = [];
    circularA.push(circularA);
    circularB.push(circularB);
    equals(QUnit.equiv(circularA, circularB), true, "Should not repeat test on array (ambigous test)");
    
    circularA.push( 'abc' );
    circularB.push( 'abc' );
    equals(QUnit.equiv(circularA, circularB), true, "Should not repeat test on array (ambigous test)");
    
    circularA.push( 'hello' );
    circularB.push( 'goodbye' );
    equals(QUnit.equiv(circularA, circularB), false, "Should not repeat test on array (unambigous test)");
});

test('mixed object/array with references to self wont loop', function(){
    var circularA = [{abc:null}], 
        circularB = [{abc:null}];
    circularA[0].abc = circularA;
    circularB[0].abc = circularB;
    
    circularA.push(circularA);
    circularB.push(circularB);
    equals(QUnit.equiv(circularA, circularB), true, "Should not repeat test on object/array (ambigous test)");
    
    circularA[0].def = 1;
    circularB[0].def = 1;
    equals(QUnit.equiv(circularA, circularB), true, "Should not repeat test on object/array (ambigous test)");
    
    circularA[0].def = 1;
    circularB[0].def = 0;
    equals(QUnit.equiv(circularA, circularB), false, "Should not repeat test on object/array (unambigous test)");
});

test("Test that must be done at the end because they extend some primitive's prototype", function() {
    // Try that a function looks like our regular expression.
    // This tests if we check that a and b are really both instance of RegExp
    Function.prototype.global = true;
    Function.prototype.multiline = true;
    Function.prototype.ignoreCase = false;
    Function.prototype.source = "my regex";
    var re = /my regex/gm;
    equals(QUnit.equiv(re, function () {}), false, "A function that looks that a regex isn't a regex");
    // This test will ensures it works in both ways, and ALSO especially that we can make differences
    // between RegExp and Function constructor because typeof on a RegExpt instance is "function"
    equals(QUnit.equiv(function () {}, re), false, "Same conversely, but ensures that function and regexp are distinct because their constructor are different");
});

/* >>>>>>>>>> BEGIN source/test/test.js */
test("module without setup/teardown (default)", function() {
	expect(1);
	ok(true);
});

test("expect in test", 3, function() {
	ok(true);
	ok(true);
	ok(true);
});

test("expect in test", 1, function() {
	ok(true);
});

module("setup test", {
	setup: function() {
		ok(true);
	}
});

test("module with setup", function() {
	expect(2);
	ok(true);
});

test("module with setup, expect in test call", 2, function() {
	ok(true);
});

var state;

module("setup/teardown test", {
	setup: function() {
		state = true;
		ok(true);
	},
	teardown: function() {
		ok(true);
	}
});

test("module with setup/teardown", function() {
	expect(3);
	ok(true);
});

module("setup/teardown test 2");

test("module without setup/teardown", function() {
	expect(1);
	ok(true);
});

if (typeof setTimeout !== 'undefined') {
state = 'fail';

module("teardown and stop", {
	teardown: function() {
		equal(state, "done", "Test teardown.");
	}
});

test("teardown must be called after test ended", function() {
	expect(1);
	stop();
	setTimeout(function() {
		state = "done";
		start();
	}, 13);
});

module("async setup test", {
	setup: function() {
		stop();
		setTimeout(function(){
			ok(true);
			start();
		}, 500);
	}
});

asyncTest("module with async setup", function() {
	expect(2);
	ok(true);
	start();
});

module("async teardown test", {
	teardown: function() {
		stop();
		setTimeout(function(){
			ok(true);
			start();
		}, 500);
	}
});

asyncTest("module with async teardown", function() {
	expect(2);
	ok(true);
	start();
});

module("asyncTest");

asyncTest("asyncTest", function() {
	expect(2);
	ok(true);
	setTimeout(function() {
		state = "done";
		ok(true);
		start();
	}, 13);
});

asyncTest("asyncTest", 2, function() {
	ok(true);
	setTimeout(function() {
		state = "done";
		ok(true);
		start();
	}, 13);
});

test("sync", 2, function() {
	stop();
	setTimeout(function() {
		ok(true);
		start();
	}, 13);
	stop();
	setTimeout(function() {
		ok(true);
		start();
	}, 125);
});
}

module("save scope", {
	setup: function() {
		this.foo = "bar";
	},
	teardown: function() {
		deepEqual(this.foo, "bar");
	}
});
test("scope check", function() {
	expect(2);
	deepEqual(this.foo, "bar");
});

module("simple testEnvironment setup", {
	foo: "bar",
	bugid: "#5311" // example of meta-data
});
test("scope check", function() {
	deepEqual(this.foo, "bar");
});
test("modify testEnvironment",function() {
	this.foo="hamster";
});
test("testEnvironment reset for next test",function() {
	deepEqual(this.foo, "bar");
});

module("testEnvironment with object", {
	options:{
		recipe:"soup",
		ingredients:["hamster","onions"]
	}
});
test("scope check", function() {
	deepEqual(this.options, {recipe:"soup",ingredients:["hamster","onions"]}) ;
});
test("modify testEnvironment",function() {
	// since we do a shallow copy, the testEnvironment can be modified
	this.options.ingredients.push("carrots");
});
test("testEnvironment reset for next test",function() {
	deepEqual(this.options, {recipe:"soup",ingredients:["hamster","onions","carrots"]}, "Is this a bug or a feature? Could do a deep copy") ;
});


module("testEnvironment tests");

function makeurl() {
	var testEnv = QUnit.current_testEnvironment;
	var url = testEnv.url || 'http://example.com/search';
	var q   = testEnv.q   || 'a search test';
	return url + '?q='+encodeURIComponent(q);
}

test("makeurl working",function() {
	equal( QUnit.current_testEnvironment, this, 'The current testEnvironment is global');
	equal( makeurl(), 'http://example.com/search?q=a%20search%20test', 'makeurl returns a default url if nothing specified in the testEnvironment');
});

module("testEnvironment with makeurl settings", {
	url: 'http://google.com/',
	q: 'another_search_test'
});
test("makeurl working with settings from testEnvironment", function() {
	equal( makeurl(), 'http://google.com/?q=another_search_test', 'rather than passing arguments, we use test metadata to form the url');
});
test("each test can extend the module testEnvironment", {
	q:'hamstersoup'
}, function() {
	equal( makeurl(), 'http://google.com/?q=hamstersoup', 'url from module, q from test');	
});

module("jsDump");
test("jsDump output", function() {
	equals( QUnit.jsDump.parse([1, 2]), "[\n  1,\n  2\n]" );
	equals( QUnit.jsDump.parse({top: 5, left: 0}), "{\n  \"top\": 5,\n  \"left\": 0\n}" );
	if (typeof document !== 'undefined' && document.getElementById("qunit-header")) {
		equals( QUnit.jsDump.parse(document.getElementById("qunit-header")), "<h1 id=\"qunit-header\"></h1>" );
		equals( QUnit.jsDump.parse(document.getElementsByTagName("h1")), "[\n  <h1 id=\"qunit-header\"></h1>\n]" );
	}
});

module("assertions");
test("raises",function() {
	function CustomError( message ) {
		this.message = message;
	}
	
	CustomError.prototype.toString = function() {
		return this.message;	
	};
	
	raises(
		function() {
			throw "error"
		}
	);
	
	raises(
		function() {
			throw "error"
		},
		'raises with just a message, no expected'
	);
	
	raises(
		function() {
			throw new CustomError();
		},
		CustomError,
		'raised error is an instance of CustomError'
	);
	
	raises(
		function() {
			throw new CustomError("some error description");
		},
		/description/,
		"raised error message contains 'description'"
	);
	
	raises(
		function() {
			throw new CustomError("some error description");
		},
		function( err ) {
			if ( (err instanceof CustomError) && /description/.test(err) ) {
				return true;
			}
		},
		"custom validation function"		
	);	
		
});

if (typeof document !== "undefined") {

module("fixture");
test("setup", function() {
	document.getElementById("qunit-fixture").innerHTML = "foobar";
});
test("basics", function() {
	equal( document.getElementById("qunit-fixture").innerHTML, "test markup", "automatically reset" );
});

}

module("custom assertions");
(function() {
	function mod2(value, expected, message) {
		var actual = value % 2;
		QUnit.push(actual == expected, actual, expected, message);
	}
	test("mod2", function() {
		mod2(2, 0, "2 % 2 == 0");
		mod2(3, 1, "3 % 2 == 1");
	})
})();

(function() {
	var reset = QUnit.reset;
	function afterTest() {
		ok( false, "reset should not modify test status" );
	}
	module("reset");
	test("reset runs assertions", function() {
		QUnit.reset = function() {
			afterTest();
			reset.apply( this, arguments );
		};
	});
	test("reset runs assertions2", function() {
		QUnit.reset = reset;
	});
})();

