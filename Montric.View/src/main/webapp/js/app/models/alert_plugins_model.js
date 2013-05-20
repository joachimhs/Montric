Montric.AlertPlugin = Montric.Model.extend({

});

Montric.AlertPlugin.reopenClass({
    collection: Ember.A(),

    find: function(id) {
        return Montric.Model.find('/alert_plugins', id, Montric.AlertPlugin, "alert_plugin");
    },

    findAll: function() {
        return Montric.Model.findAll('/alert_plugins', Montric.AlertPlugin, "alert_plugins");
    },

    createRecord: function(model) {
        Montric.Model.createRecord('/alert_plugin', Montric.AlertPlugin, model);
    },

    updateRecord: function(model) {
        Montric.Model.updateRecord("/alert_plugin", Montric.AlertPlugin, model);
    },

    delete: function(id) {
        Montric.Model.delete('/alert_plugin', Montric.AlertPlugin, id);
    },

    refresh: function(id) {
        return Montric.Model.refresh('/alert_plugin', Montric.User.find(id).get('id'), Montric.AlertPlugin, "alert_plugin");
    }
});