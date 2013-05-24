Montric.AlertPlugin = Montric.Model.extend({

});

Montric.AlertPlugin.reopenClass({
    collection: Ember.A(),

    find: function(id) {
        return Montric.Model.find('/alert_plugins', id, Montric.AlertPlugin, "alert_plugin");
    },

    findAll: function() {
        return Montric.Model.findAll('/alert_plugins', Montric.AlertPlugin, "alert_plugins");
    }
});