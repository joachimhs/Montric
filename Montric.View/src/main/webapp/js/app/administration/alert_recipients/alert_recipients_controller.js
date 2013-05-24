Montric.AdministrationAlertRecipientsController = Ember.ArrayController.extend({
    needs: ['alertPlugins'],
    newAdminRecipientName: null,
    newRecipient: null,
    selectedItem: null,

    newAlertRecipientNameIsValid: function () {
        var newNameIsValid = (this.get('newAdminRecipientName') && this.get('newAdminRecipientName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (alertRecipient) {
            if (alertRecipient.get('id') === this.get('newAdminRecipientName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewAlertRecipient: function () {
        if (this.newAlertRecipientNameIsValid()) {
            var createdAlertRecipient = Montric.AlertRecipient.create({
                id: this.get('newAdminRecipientName')
            });

            Montric.AlertRecipient.createRecord(createdAlertRecipient);
        } else {
            Montric.log('New Access Token Name Not Valid!');
        }

        console.log(this.get('content.length'));
    },

    newRecipientIsValid: function () {
        var newRecipientIsValid = (this.get('newRecipient') && this.get('newRecipient').length >= 1);

        var unique = true;
        this.get('content').forEach(function (alertRecipient) {
            if (alertRecipient.get('id') === this.get('newRecipient')) {
                unique = false;
            }
        }, this);

        return unique && newRecipientIsValid;
    },

    doAddRecipient: function () {
        if (this.newRecipientIsValid()) {
            var recipient = this.get('newRecipient');
            var selectedAlertRecipient = this.get('selectedItem');
            var oldRecipients = selectedAlertRecipient.get('recipients');
            if (!oldRecipients) {
                oldRecipients = [];
                selectedAlertRecipient.set('recipients', oldRecipients);
            }
            oldRecipients.pushObject(Ember.Object.create({id: recipient}));

            this.set('newRecipient', '');
        } else {
            Montric.log('New Access Token Name Not Valid!');
        }

        console.log(this.get('content.length'));
    },

    deleteSelectedRecipient: function() {
        var recipients = this.get('selectedItem.recipients');

        var selectedRecipient = this.get('selectedRecipient');
        console.log(selectedRecipient);
        console.log(recipients);
        if (selectedRecipient && recipients) {
            recipients.removeObject(selectedRecipient);
        }

        console.log(this.get('selectedItem.recipients'));
    },

    doCommitAlertRecipient: function() {
        Montric.AlertRecipient.updateRecord(this.get('selectedItem'));
    },

    deleteSelectedAlertRecipient: function() {
        $("#adminAlertRecipientConfirmDialog").modal({show: true});
    },

    doCancelAlertRecipientDeletion: function(router) {
        $("#adminAlertRecipientConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(router) {
        console.log('doConfirmDeletion');
        var selectedAlertRecipient = this.get('selectedItem');
        if (selectedAlertRecipient) {
            Montric.AlertRecipient.delete(selectedAlertRecipient.get('id'));
        }
        this.set('selectedItem', null);
        $("#adminAlertRecipientConfirmDialog").modal('hide');
    }
});
