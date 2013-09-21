Montric.AdministrationMenuAdminController = Ember.ArrayController.extend({
    needs: ['administrationMenu'],

    doCommitMenu: function(router) {
        $("#menuAdminConfirmDialog").modal({show: true});
    },

    doCancelDeletion: function(router) {
        $("#menuAdminConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(router) {
        var selectedNodes = this.get('controllers.administrationMenu.selectedNodes');
        selectedNodes.forEach(function(node) {
            node.deleteRecord();
        });
        this.get('controllers.administrationMenu').deselectAllNodes();
        this.get('store').commit();
        $("#menuAdminConfirmDialog").modal('hide');
    }
});