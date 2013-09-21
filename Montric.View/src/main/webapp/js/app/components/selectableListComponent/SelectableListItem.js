Montric.SelectableListItemComponent = Ember.Component.extend({
    actions: {
        showDeleteModal: function() {
            console.log('param: ' + this.get('param'));
            $('#deleteAlertModal').modal('show');
            this.sendAction('action', this.get('param'));
        }
    }
});