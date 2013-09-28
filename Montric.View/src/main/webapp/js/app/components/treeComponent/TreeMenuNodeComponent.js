Montric.TreeMenuNodeComponent = Ember.Component.extend({
    classNames: ['pointer'],

    actions: {
        toggleExpanded: function() {
            this.toggleProperty('node.isExpanded');
        },

        toggleSelected: function() {
            this.toggleProperty('node.isSelected');
        },

        selectNode: function(node) {
            console.log('selectedNode: ' + node);
            this.sendAction('action', node);
        }
    },

    isSelected: function() {
        console.log("'" + this.get('selectedNode') + "' :: '" + this.get('node.id') + "'");
        return this.get('selectedNode') === this.get('node.id');
    }.property('selectedNode', 'node.id')
});