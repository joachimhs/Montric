Montric.AlertsAlertRoute = Ember.Route.extend({
    model: function(alert) {
        console.log('Montric.AlertRoute alert: ' + alert);
        this.store.find('alert', alert.alert_id);
    }

});