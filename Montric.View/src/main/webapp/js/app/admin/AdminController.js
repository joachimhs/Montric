Montric.AdminController = Ember.Controller.extend({
    actions: {

    },

    contentIsLoadedObserver: function() {
        console.log('Main Menu Content isLoaded: ' + this.get('content.isLoaded'));

        var rootNodes = Ember.A();
        console.log('Starting iteration over menu nodes');
        this.get('content').forEach(function(node) {
            if (node.get('parent') === null) {
                rootNodes.pushObject(node);
            }
        });

        console.log('Finished iterating over admin menu nodes. found ' + rootNodes.get('length') + " root nodes");
        this.set('rootNodes', rootNodes);
    }.observes('content.isLoaded'),

    isSelectedObserver: function() {
        if (this.get('content')) {
            var selectedNodes = this.get('content').filter(function(node) {
                if (node.get('isSelected')) { return true; }
            });

            this.set('selectedNodes', selectedNodes);
        }
    }.observes('content.@each.isSelected'),

    resetSelectedNodes: function() {
        console.log('resetSelectedNodes!!');
        this.get('selectedNodes').forEach(function(node) {
            node.set('isSelected', false);
        });
    }
});