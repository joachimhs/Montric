EurekaJ.AdministrationAlertsController = Ember.ArrayController.extend({
    needs: ['administrationMenu', 'administrationEmailRecipients'],

    newAlertName: null,
    selectedItem: null,
    alertTypes: [
        {"key": "greater_than", "value": "Greater than"},
        {"key": "less_than", "value": "Less than"},
        {"key": "equals", "value": "Equal to"}
    ],

    sortAscending: true,
    sortProperties: ['alertName'],

    selectedItemsEmailGroupObserver: function() {
        var selectedGroups = this.get('emailGroups').filter(function(emailGroup) {
            if (emailGroup.get('isSelected')) return true;
        });
        
        console.log('selectedItemsEmailGroupObserver: ' + this.get('selectedItem.alertNotifications') + " :: " + selectedGroups.get('length'));
        if (this.get('selectedItem.alertNotifications')) {
           // this.get('selectedItem.alertNotifications').pushObjects(selectedGroups);
            console.log('selectedItemsEmailGroupObserver: ' + this.get('selectedItem.alertNotifications.length'));
        }
    }.observes('emailGroups.@each.isSelected'), 
    
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

    createNewAlert: function () {
        if (this.newAlertIsValid()) {
            EurekaJ.AlertModel.createRecord({id: this.get('newAlertName')});
            EurekaJ.store.commit();
        } else {
            EurekaJ.log('New Alert Name Not Valid!');
        }
    },

    deleteSelectedAlert: function() {
        $("#adminAlertConfirmDialog").modal({show: true});
    },

    doCancelAlertDeletion: function() {
        $("#adminAlertConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(item) {
        console.log('doConfirmDeletion');
        var selectedItem = this.get('selectedItem');
        if (selectedItem) {
            selectedItem.deleteRecord();
        }
        EurekaJ.store.commit();
        $("#adminAlertConfirmDialog").modal('hide');
    },

    doCommitAlert: function() {
        var selectedItem = this.get('selectedItem');
        if (selectedItem.get('alertNotificationArray.length') > 0) {
            selectedItem.set('alertNotifications', JSON.stringify(selectedItem.get('alertNotificationArray')))
        } else {
            selectedItem.set('alertNotifications', "[]");
        }
        
        EurekaJ.store.commit();
    }
});