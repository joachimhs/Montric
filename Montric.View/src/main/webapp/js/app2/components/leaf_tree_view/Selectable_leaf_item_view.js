Montric.SelectableLeafItemView = Ember.View.extend({
    tagName: 'div',
    classNameBindings: 'isSelected',
    classNames: ['treeItemMarginLeft', 'pointer'],
    selectedItem: null,

    isSelected: function() {
        if (this.get('item.id')) {
            return this.get('selectedItem') === this.get('item.id');
        } else {
            return this.get('selectedItem') === this.get('item');
        }
    }.property('selectedItem').cacheable(),

    template: Ember.Handlebars.compile('' +
        '{{view Montric.SelectableLeafItemContentView itemBinding="this" selectedItemBinding="view.selectedItem"}}' +
        '{{#if isExpanded}}' +
        '{{#each children}}' +
        '{{view Montric.SelectableLeafItemView itemBinding="this" selectedItemBinding="view.selectedItem"}}' +
        '{{/each}}' +
        '{{/if}}'
    )
});