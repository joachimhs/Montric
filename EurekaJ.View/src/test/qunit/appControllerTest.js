var appController; 

module("EurekaJ.AppController", {
	setup: function() {
		Ember.run(function() {
			var application;
		    Ember.run(function() {
		      application = Ember.Application.create({ router: null });
		    });
			appController = application.__container__.lookup("controller:application");
		    
		});	
	},
	
	teardown: function() {
		
	}
});

test("Testing Generate Chart Strings", function() {
	ok( 1 == "1", "Passed!" );
	
	ok (appController, "Expecting non-null appController");
	ok ("27.03.2013" === appController.generateChartString(new Date()), "Date Chart String generation OK");
})
