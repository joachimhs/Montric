Montric.AlertsController = Ember.ArrayController.extend({
    sortProperties: ['id'],
    sortAscending: true,

    actions: {
        createNewAlert: function() {
            console.log('Creating alert with ID: ' + this.get('newAlertName'));
            this.doCreateNewAlert();
        }
    },

    newAlertIsValid: function () {
        var newNameIsValid = (this.get('newAlertName') && this.get('newAlertName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (alert) {
            if (alert.get('alertName') === this.get('newAlertName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    doCreateNewAlert: function () {
        if (this.newAlertIsValid()) {
            var newAlert = this.store.createRecord('alert', {id: this.get('newAlertName')});
            this.set('newAlert', newAlert);
            newAlert.save();
            this.set('newAlertName', '');
        } else {
            Montric.log('New Alert Name Not Valid!');
        }

        console.log(this.get('content.length'));
    }
});