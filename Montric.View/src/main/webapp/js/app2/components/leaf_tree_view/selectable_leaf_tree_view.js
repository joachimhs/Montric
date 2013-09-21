Montric.SelectableLeafTreeView = Ember.View.extend({
    tagName: 'div',
    classNames: ['selectableList'],
    selectedItem: null,

    template: Ember.Handlebars.compile('{{#each view.items}}{{view Montric.SelectableLeafItemView itemBinding="this" selectedItemBinding="view.selectedItem"}}{{/each}}')
});