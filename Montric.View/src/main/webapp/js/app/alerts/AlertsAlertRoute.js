Montric.AlertsAlertRoute = Ember.Route.extend({
    model: function(alert) {
        console.log('Montric.AlertRoute alert: ' + alert);
        this.store.find('alert', alert.alert_id);
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        controller.set('alertRecipients', this.store.find('alertRecipient'));
    }

});