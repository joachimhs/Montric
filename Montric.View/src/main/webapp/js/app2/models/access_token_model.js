Montric.AccessToken = Montric.Model.extend();

Montric.AccessToken.reopenClass({
    collection: Ember.A(),

    find: function(id) {
        return Montric.Model.find('/access_token', id, Montric.AccessToken, "access_token");
    },

    findAll: function() {
        return Montric.Model.findAll('/access_token', Montric.AccessToken, "access_tokens");
    },

    createRecord: function(model) {
        return Montric.Model.createRecord('/access_token', Montric.AccessToken, model);
    },

    updateRecord: function(model) {
        Montric.Model.updateRecord("/access_token", Montric.AccessToken, model);
    },

    delete: function(id) {
        Montric.Model.delete('/access_token', Montric.AccessToken, id);
    },

    refresh: function(id) {
        return Montric.Model.refresh('/access_token', Montric.User.find(id).get('id'), Montric.AccessToken, "access_token");
    }
});