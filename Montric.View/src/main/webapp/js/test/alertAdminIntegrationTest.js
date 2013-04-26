var alertAdminController;

module("EurekaJ.AdministrationAlertsController", {
    setup: function() {
        console.log('Admin Alerts Controller Module setup');
        EurekaJ.server.autoRespond = true;
        EurekaJ.server.respondWith("GET", "/alert_models",
                [200, { "Content-Type": "text/json" },
                 '{"alert_models":[]}'
                 ]);
       
        
        EurekaJ.server.respondWith("POST", "/alert_models",
                [200, { "Content-Type": "text/json" },
                 '{"alert_model":{"alert_source":"null","id":"New Alert","alert_delay":0,"alert_plugin_ids":[],"alert_notifications":"","alert_activated":false,"alert_type":"greater_than"}}'
                 ]);
        
        Ember.run(function() {
            alertAdminController = EurekaJ.__container__.lookup("controller:administrationAlerts");
            
        }); 
    },
    
    teardown: function() {
        EurekaJ.server.restore();
        delete EurekaJ.server.server;
    }
});

var testCallbacks = {
    verifyContentLength: function() {
        if (alertAdminController.get('content.length') > 0 ) {
            strictEqual(1, alertAdminController.get('content.length'), 
                    "Expecting one alert. Got: " + alertAdminController.get('content.length'));
            
            console.log('calling start()');
            QUnit.start();
        }
    }
};

asyncTest("Create a new Alert and verify that it is shown", 2, function() {
    ok(alertAdminController, "Exepcting a non-null AdministrationAlertsController");
    
    alertAdminController.get('content').addObserver('length', testCallbacks, 'verifyContentLength');
    alertAdminController.set('newAlertName', 'New Alert');
    alertAdminController.createNewAlert();
    
});