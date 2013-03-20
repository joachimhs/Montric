EurekaJ.AdministrationEmailRecipientsController = Ember.ArrayController.extend({
    needs: ['administrationMenu'],
    newEmailGroupName: '',
    newEmailRecipient: '',
    adminMenuController: null,

    newEmailGroupIsValid: function () {
        var newNameIsValid = (this.get('newEmailGroupName') && this.get('newEmailGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (chartGroup) {
            if (chartGroup.get('id') === this.get('newEmailGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewEmailGroup: function () {
        if (this.newEmailGroupIsValid()) {
            EurekaJ.store.createRecord(EurekaJ.EmailGroupModel, {
                "id": this.get('newEmailGroupName'),
                "smtpHost": "",
                "smtpUsername": "",
                "smtpPassword": "",
                "smtpPort": 465,
                "smtpUseSSL": true,
                "emailAddresses": "[]"});
            this.set('newEmailGroupName', '');
        } else {
            EurekaJ.log('New Email Group Not Valid!');
        }
        //EurekaJ.store.commit();
    },

    doAddEmailRecipient: function () {
        console.log('doAddEmailRecipient');
        var emailRecipient = this.get('newEmailRecipient');
        var selectedEmailGroup = this.get('selectedItem');

        var oldEmailAddresses = selectedEmailGroup.get('emailRecipients');
        oldEmailAddresses.pushObject(Ember.Object.create({id: emailRecipient}));

        var newAddresses = [];

        oldEmailAddresses.forEach(function (address) {
            newAddresses.pushObject(address.get('id'));
        });

        selectedEmailGroup.set('emailAddresses', '["' + newAddresses.join('","') + '"]');

        console.log(newAddresses);

        this.set('newEmailRecipient', '');
    },

    deleteSelectedEmailGroup: function() {
        $("#emailGroupConfirmDialog").modal({show: true});
    },

    doCancelDeletion: function(router) {
        $("#emailGroupConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(router) {
        var selectedEmailGroup = this.get('selectedItem');
        if (selectedEmailGroup) {
            selectedEmailGroup.deleteRecord();
        }
        EurekaJ.store.commit();
        this.set('selectedItem', null);
    },

    deleteSelectedEmailRecipient: function() {
        $("#emailAddressConfirmDialog").modal({show: true});
    },

    doCancelAddressDeletion: function(router) {
        $("#emailAddressConfirmDialog").modal('hide');
    },

    doConfirmAddressDeletion: function(router) {
        var newAddresses = [];

        var selectedEmailRecipient = this.get('selectedEmailRecipient');
        if (selectedEmailRecipient) {
            this.get('selectedItem.emailRecipients').forEach(function (emailRecipient) {
                if (emailRecipient.get('id') !== selectedEmailRecipient.get('id')) {
                    newAddresses.pushObject(emailRecipient.get('id'));
                }
            });
        }

        this.get('selectedItem').set('emailAddresses', '["' + newAddresses.join('","') + '"]');
        $("#emailAddressConfirmDialog").modal('hide');
    },

    doCommitEmailGroup: function() {
        EurekaJ.store.commit();
    }
});