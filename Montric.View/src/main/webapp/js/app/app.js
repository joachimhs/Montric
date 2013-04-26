Ember.ENV.RAISE_ON_DEPRECATION = true;

var EurekaJ = Ember.Application.create({
    //rootElement: '#abc',
    
    log: function(message) {
        if (window.console) console.log(message);
    }
});

EurekaJ.store = DS.Store.create({
    adapter:  "EurekaJ.Adapter",
    revision: 12
});

/*Em.subscribe('*', {
    ts: null,
    before: function(name, timestamp, payload) {
        ts = timestamp;
        return ts;
    },
    after: function(name, timestamp, payload, beforeRet) {
        console.log('instrument: ' + name + 
                " " + JSON.stringify(payload) + 
                " took:" + (timestamp - ts));
    }
});*/