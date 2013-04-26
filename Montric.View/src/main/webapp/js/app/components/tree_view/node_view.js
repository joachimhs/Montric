EurekaJ.NodeView = Ember.View.extend({
    item: null,
    
    template: Ember.Handlebars.compile('' +
        '{{view EurekaJ.NodeContentView itemBinding="view.item"}}' +

        '{{#if view.item.isExpanded}}' +
            '<div style="width: 500px;">' +
            '{{#each view.item.children}}' +
                '<div style="margin-left: 22px;">{{view EurekaJ.NodeView itemBinding="this"}}</div>' +
            '{{/each}}' +
            '</div>' +
        '{{/if}}'),
    tagName: 'div',

    isSelectedObserver: function() {
        console.log('isSelectedObserver: ' + this.get('controller'));
        this.get('controller').updateSelectedNodes();
    }.observes('content.children.@each.isSelected')
});