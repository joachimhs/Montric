Montric.AlertsAlertController = Ember.ObjectController.extend({
    needs: ['admin'],

    actions: {
        doCommitAlert: function() {
            console.log('doCommitAlert: ' + this.get('model'));
            if (this.get('model')) this.get('model').save();
        }
    },

    alertTypes: [
        {"key": "greater_than", "value": "Greater than"},
        {"key": "less_than", "value": "Less than"},
        {"key": "equals", "value": "Equal to"}
    ]
});