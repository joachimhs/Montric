Montric.AlertRecipientsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('alertRecipient');
    }
})