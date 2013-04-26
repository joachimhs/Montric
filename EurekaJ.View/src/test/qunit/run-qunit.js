var interval = null;
var start = null; 
var args = phantom.args;
if (args.length < 1 || args.length > 2) {
    console.log("Usage: " + phantom.scriptName + " <URL>");
    phantom.exit(1);
}

var page = require('webpage').create();
page.open(args[0], function(status) {
    if (status !== 'success') {
        console.error("Unable to access network");
        phantom.exit(1);
    } else {
        page.evaluate(logQUnit);
        start = Date.now();
        interval = setInterval(qunitTimeout, 500);
    }
});

page.onConsoleMessage = function(msg) {
    if (msg.slice(0, 8) === 'WARNING:') {
        return;
    }
    if (msg.slice(0, 6) === 'DEBUG:') {
        return;
    }
    if (msg.slice(0, 6) === 'PRINT:') {
        print(msg.slice(7));
        return;
    }

    console.log(msg);
};

function qunitTimeout() {
    var timeout = 60000;
    if (Date.now() > start + timeout) {
        console.error("Tests timed out");
        phantom.exit(124);
    } else {
        var qunitDone = page.evaluate(function() {
            return window.qunitDone;
        });

        if (qunitDone) {
            clearInterval(interval);
            if (qunitDone.failed > 0) {
                phantom.exit(1);
            } else {
                phantom.exit();
            }
        }
    }
}

function logQUnit() {
    var moduleErrors = [];
    var testErrors = [];
    var assertionErrors = [];

    QUnit.moduleDone(function(context) {
        if (context.failed) {
            var msg = "Module Failed: " + context.name + "\n" + testErrors.join("\n");
            moduleErrors.push(msg);
            testErrors = [];
            
        }

        console.log("Module " + context.name + " Finished. Failed: " + context.failed + ", Passed: " + context.passed + ", Total: " + context.total);
    });

    QUnit.testDone(function(context) {
        if (context.failed) {
            var msg = "  Test Failed: " + context.name + assertionErrors.join("    ");
            testErrors.push(msg);
            assertionErrors = [];
        }
    });

    QUnit.log(function(context) {
        if (context.result) {
            return;
        }

        var msg = "\n    Assertion Failed:";
        if (context.message) {
            msg += " " + context.message;
        }

        if (context.expected) {
            msg += "\n      Expected: " + context.expected + ", Actual: " + context.actual;
        }

        assertionErrors.push(msg);
    });

    QUnit.done(function(context) {
        console.log('\n');

        if (moduleErrors.length > 0) {
            for (var idx = 0; idx < moduleErrors.length; idx++) {
                console.error(moduleErrors[idx] + "\n");
            }
        }

        if (testErrors.length > 0) {
            for (var idx = 0; idx < testErrors.length; idx++) {
                console.error(testErrors[idx] + "\n");
            }
        }

        var stats = ["Time: " + context.runtime + "ms", "Total: " + context.total, "Passed: " + context.passed, "Failed: " + context.failed];
        console.log(stats.join(", "));
        window.qunitDone = context;
    });
}
