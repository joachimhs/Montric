Montric.AlertRecipientsAlertRecipientController = Ember.ObjectController.extend({
    newRecipient: null,

    actions: {
        doAddRecipient: function() {
            if (this.newRecipientIsValid()) {
                this.get('content.recipients').pushObject(this.get('newRecipient'))
            }
        },

        doCommitAlertRecipient: function() {
            this.get('content').save();
        },

        doDeleteSelectedRecipients: function() {
            var selectedRecipients = this.get('model.selectedRecipients');
            var recipients = this.get('model.recipients');

            if (selectedRecipients) {
                selectedRecipients.forEach(function(selectedRecipient) {
                    recipients.removeObject(selectedRecipient);
                });
            }
        }
    },

    newRecipientIsValid: function () {
        var newNameIsValid = (this.get('newRecipient') && this.get('newRecipient').length >= 1);

        var unique = true;
        this.get('content.recipients').forEach(function (recipient) {
            if (recipient === this.get('newRecipient')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    doCreateNew: function () {
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