Ember.ENV.RAISE_ON_DEPRECATION = true;

var EurekaJ = Ember.Application.create({
    log: function(message) {
        if (window.console) console.log(message);
    }
});

EurekaJ.store = DS.Store.create({
    adapter:  "EurekaJ.Adapter",
    revision: 11
});