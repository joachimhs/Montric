Montric.AdminMainMenuAdminController = Ember.Controller.extend({
    needs: 'admin',

    actions: {
        doDeleteSelectedNodes: function() {
            var selectedNodes = this.get('controllers.admin.selectedNodes');
            if (selectedNodes) {
                selectedNodes.forEach(function(node) {
                    node.deleteRecord();
                    node.save();
                });
            }
        }
    }
});