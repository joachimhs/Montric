EurekaJ.SelectableLeafTreeView = Ember.View.extend({
    tagName: 'div',
    classNames: ['selectableList'],
    selectedItem: null,

    template: Ember.Handlebars.compile('{{#each view.items}}{{view EurekaJ.SelectableLeafItemView itemBinding="this" selectedItemBinding="view.selectedItem"}}{{/each}}')
});