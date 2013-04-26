Montric.AdministrationMenuController = Ember.ArrayController.extend({
    isSelectedObserver: function() {
        if (this.get('content')) {
            var selectedNodes = this.get('content').filter(function(node) {
                if (node.get('isSelected')) { return true; }
            });

            this.set('selectedNodes', selectedNodes);
        }
    }.observes('content.@each.isSelected'),

    deselectAllNodes: function() {
        this.get('selectedNodes').forEach(function(node) {
            console.log('setting isSelected to false for: ' + node.get('id'));
            node.set('isSelected', false);
        });
    }
});