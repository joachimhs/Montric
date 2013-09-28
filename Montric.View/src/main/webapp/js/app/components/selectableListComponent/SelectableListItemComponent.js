Montric.SelectableListItemComponent = Ember.Component.extend({


    actions: {
        showDeleteModal: function() {
            console.log('node: ' + this.get('node'));
            this.sendAction('action', this.get('node'));
        }
    }
});