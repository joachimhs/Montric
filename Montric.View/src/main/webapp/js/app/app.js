Ember.ENV.RAISE_ON_DEPRECATION = true;

var Montric = Ember.Application.create({
    //rootElement: '#abc',

    log: function(message) {
        if (window.console) console.log(message);
    }
});

console.log('deferring readiness');
Montric.deferReadiness();
Montric.set('appInitialized', false);

console.log('Asking for User');
$.getJSON("/user", function(data) {
    if (data["user"] && data["user"].userRole != null) {
        var cookieUser = Montric.User.create();
        cookieUser.setProperties(data["user"]);
        Montric.set('cookieUser', cookieUser);
    } else {
        Montric.set('cookieUser', null);
    }

    Montric.advanceReadiness();
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