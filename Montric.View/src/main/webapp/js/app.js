var Montric = Ember.Application.create({
});

console.log('deferring readiness');
Montric.deferReadiness();
Montric.set('appInitialized', false);

console.log('Asking for User');
$.getJSON("/user", function(data) {
    /*if (data["user"] && data["user"].userRole != null) {
        var cookieUser = Montric.User.create();
        cookieUser.setProperties(data["user"]);
        Montric.set('cookieUser', cookieUser);
    } else {
        Montric.set('cookieUser', null);
    }*/

    console.log('advancing readiness');
    Montric.advanceReadiness();
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