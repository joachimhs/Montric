Montric.AlertRecipientsAlertRecipientRoute = Ember.Route.extend({
    model: function(alertRecpient) {
        console.log('Montric.AlertRoute alert: ' + alertRecpient);
        this.store.find('alertRecipient', alertRecpient.alert_recipient_id);
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        controller.set('alertPlugins', this.store.find('alertPlugin'));
    }
});