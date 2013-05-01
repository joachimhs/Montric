/*Montric.User = DS.Model.extend({
    firstName: DS.attr('string'),
    lastName: DS.attr('string'),
    company: DS.attr('string'),
    country: DS.attr('string'),
    usage: DS.attr('string'),
    userRole: DS.attr('string'),
    accountName: DS.attr('string')
});*/

Montric.User = Montric.Model.extend({
    isUser: function() {
        return this.get('userRole') === 'user' || this.get('userRole') === 'admin';
    }.property('userRole'),

    isAdmin: function() {
        return this.get('userRole') === 'admin';
    }.property('userRole')
});

Montric.User.reopenClass({
    collection: Ember.A(),

    find: function(id) {
        return Montric.Model.find('/user', id, Montric.User, "user");
    },

    findAll: function() {
        return Montric.Model.findAll('/user', Montric.User, "users");
    },

    createRecord: function(model) {
        Montric.Model.createRecord('/user', Montric.User, model);
    },

    updateRecord: function(model) {
        Montric.Model.updateRecord("/user", Montric.User, model);
    },

    delete: function(id) {
        Montric.Model.delete('/user', Montric.User, id);
    },

    refresh: function(id) {
        return Montric.Model.refresh('/user', Montric.User.find(id).get('id'), Montric.User, "user");
    }
});