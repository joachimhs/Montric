Montric.SelectableListComponent = Ember.Component.extend({
    nodeForDelete: null,

    deleteModalId: function() {
        return this.get('elementId') + "deleteAlertModal";
    }.property('elementId'),

    actions: {
        showDeleteModal: function(node) {
            console.log('Showing delete modal for node: ' + node);
            console.log(this.get('deleteModalId'));
            $('#' + this.get('deleteModalId')).modal('show');

            if (node) {
                this.set('nodeForDelete', node);
            }
        }
    }
});