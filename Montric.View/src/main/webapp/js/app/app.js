Ember.ENV.RAISE_ON_DEPRECATION = true;

var Montric = Ember.Application.create({
    //rootElement: '#abc',

    log: function(message) {
        if (window.console) console.log(message);
    }
});

//Montric.deferReadiness();

Montric.store = DS.Store.create({
    adapter:  "Montric.Adapter",
    revision: 12
});

Montric.LoginIndexController = Ember.Controller.extend({
    needs: ['user']
});

Montric.HeaderController = Ember.Controller.extend({
    needs: ['user']
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