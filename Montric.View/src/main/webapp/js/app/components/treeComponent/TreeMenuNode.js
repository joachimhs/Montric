Montric.TreeMenuNodeComponent = Ember.Component.extend({
    classNames: ['pointer'],

    actions: {
        toggleExpanded: function() {
            this.toggleProperty('node.isExpanded');
        },

        toggleSelected: function() {
            this.toggleProperty('node.isSelected');
        }
    }
});