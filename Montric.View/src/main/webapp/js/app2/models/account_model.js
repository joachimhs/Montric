Montric.Account = Montric.Model.extend();

Montric.Account.reopenClass({
    collection: Ember.A(),

    find: function(id) {
        return Montric.Model.find('/account', id, Montric.Account, "account");
    },

    findAll: function() {
        return Montric.Model.findAll('/account', Montric.Account, "accounts");
    },

    createRecord: function(model) {
        Montric.Model.createRecord('/account', Montric.Account, model);
    },

    updateRecord: function(model) {
        Montric.Model.updateRecord("/account", Montric.Account, model);
    },

    delete: function(id) {
        Montric.Model.delete('/account', Montric.Account, id);
    },

    refresh: function(id) {
        return Montric.Model.refresh('/account', Montric.Account.find(id).get('id'), Montric.Account, "accounts");
    }
});