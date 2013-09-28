Montric.TreeMenuComponent = Ember.Component.extend({
    classNames: ['selectableList'],

    actions: {
        selectNode: function(node) {
            console.log('TreeMenuComponent node: ' + node);
            this.set('selectedNode', node.get('id'));
        }
    }
});