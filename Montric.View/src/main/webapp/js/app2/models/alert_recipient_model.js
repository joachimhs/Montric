Montric.AlertRecipient = Montric.Model.extend({

});

Montric.AlertRecipient.reopenClass({
    collection: Ember.A(),

    find: function(id) {
        return Montric.Model.find('/alert_recipients', id, Montric.AlertRecipient, "alert_recipient");
    },

    findAll: function() {
        return Montric.Model.findAll('/alert_recipients', Montric.AlertRecipient, "alert_recipients");
    },

    createRecord: function(model) {
        Montric.Model.createRecord('/alert_recipients', Montric.AlertRecipient, model);
    },

    updateRecord: function(model) {
        Montric.Model.updateRecord("/alert_recipients", Montric.AlertRecipient, model);
    },

    delete: function(id) {
        Montric.Model.delete('/alert_recipients', Montric.AlertRecipient, id);
    },

    refresh: function(id) {
        return Montric.Model.refresh('/alert_recipients', Montric.User.find(id).get('id'), Montric.AlertRecipient, "alert_recipients");
    }
});