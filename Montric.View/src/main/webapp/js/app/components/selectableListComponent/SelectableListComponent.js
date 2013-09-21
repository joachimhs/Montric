Montric.SelectableListComponent = Ember.Component.extend({
    nodeForDelete: null,

    actions: {
        showDeleteModal: function(node) {
            console.log('Showing delete modal for node: ' + node);
            if (node) {
                this.set('nodeForDelete', node);
            }
        }
    }
});