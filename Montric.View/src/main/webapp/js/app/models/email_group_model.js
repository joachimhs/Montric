EurekaJ.EmailGroupModel = DS.Model.extend({
    emailGroupName: DS.attr('string'),
    smtpHost: DS.attr('string'),
    smtpUsername: DS.attr('string'),
    smtpPassword: DS.attr('string'),
    smtpPort: DS.attr('number'),
    smtpUseSSL: DS.attr('boolean'),
    emailAddresses: DS.attr('string'),

    emailRecipients: function(key, value) {
        var addresses = [];
        var returnAddresses = [];

        if (this.get('emailAddresses').length >= 2) {
            addresses = jQuery.parseJSON(this.get('emailAddresses'));
        }

        addresses.forEach(function(address) {
            returnAddresses.pushObject(Ember.Object.create({id: address}));
        });

        return returnAddresses;
    }.property('emailAddresses').cacheable()
});