var chartsController; 

module("EurekaJ.ChartsController", {
    setup: function() {
        Ember.run(function() {
            chartsController = EurekaJ.__container__.lookup("controller:charts");
        }); 
    },
    
    teardown: function() {
        
    }
});

test("Testing the Charts Controller timer", function() {
    ok(chartsController != null, "Expecting a non-null EurekaJ.ChartsController")
    ok(chartsController != null, "Expecting a non-null EurekaJ.ChartsController")
})
