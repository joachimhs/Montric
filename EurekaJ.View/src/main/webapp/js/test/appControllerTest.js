var appController; 
var inputDate = new Date(2013,2,27,11,15,00);

module("EurekaJ.AppController", {
    setup: function() {
        Ember.run(function() {
            appController = EurekaJ.__container__.lookup("controller:application");
            
        }); 
    },
    
    teardown: function() {
        
    }
});

test("Verify appController", function() {
    EurekaJ.reset();
    ok(appController, "Expecting non-null appController");
});

test("Testing the default dateFormat", function() {
    EurekaJ.reset();    
    strictEqual("27 March 2013 11:15", appController.generateChartString(inputDate), "Default Chart String Generation OK");
});

test("Testing custom dateFormat", function() {
    EurekaJ.reset();
    appController.set('dateFormat', 'dd.mm.yyyy');
    strictEqual("27.03.2013", appController.generateChartString(inputDate), "Custom Chart String Generation OK");
});

test("Testing null dateFormat", function() {
    EurekaJ.reset();
    appController.set('dateFormat', null);
    strictEqual("27.03.13", appController.generateChartString(inputDate), "Null Chart String Generation OK");
});

test("Testing null date", function() {
    EurekaJ.reset();
    strictEqual("", appController.generateChartString(null), "Null Date OK");
});