Montric.User = DS.Model.extend({
    userName: DS.attr('string'),
    accountName: DS.attr('string'),
    userRole: DS.attr('string'),
    firstname: DS.attr('string'),
    lastname: DS.attr('string'),
    company: DS.attr('string'),
    country: DS.attr('string'),
    usage: DS.attr('string'),

    isUser: function() {
        return this.get('userRole') === 'user' || this.get('userRole') === 'beta' || this.get('isAdmin') || this.get('isRoot');
    }.property('userRole'),

    isAdmin: function() {
        return this.get('userRole') === 'admin' || this.get('isRoot');
    }.property('userRole'),

    isRoot: function() {
        return this.get('userRole') === 'root';
    }.property('userRole'),

    isUnregistered: function() {
        return this.get('userRole') === 'unregistered';
    }.property('userRole')
});