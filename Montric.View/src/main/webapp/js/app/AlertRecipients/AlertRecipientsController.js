Montric.AlertRecipientsController = Ember.ArrayController.extend({
    newAlertRecipientName: null,

    actions: {
        createNewAlertRecipient: function() {
            this.doCreateNewAlertRecipient();
        }
    },

    newAlertRecipientIsValid: function () {
        var newNameIsValid = (this.get('newAlertRecipientName') && this.get('newAlertRecipientName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (alertRecipient) {
            if (alertRecipient === this.get('newAlertRecipientName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    doCreateNewAlertRecipient: function () {
        if (this.newAlertRecipientIsValid()) {
            console.log(this.get('newAlertRecipientName'));
            var newAlertRecipient = this.store.createRecord('alertRecipient', {id: this.get('newAlertRecipientName')});
            newAlertRecipient.save();
            this.set('newAlertRecipientName', '');
        } else {
            Montric.log('New Alert Recipient Name Not Valid!');
        }

    }
});