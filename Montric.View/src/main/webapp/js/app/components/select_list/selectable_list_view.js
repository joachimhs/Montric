EurekaJ.SelectableListView = Ember.View.extend({
    tagName: 'div',
    classNames: ['selectableList'],
    maxCharacters: 28,
    selectedItem: null,
    listItems: null,
    labelPropertyName: null,
    

    template: Ember.Handlebars.compile('' +
        '{{#each view.listItems}}' +
            '{{view EurekaJ.SelectableListItemView ' +
                'itemBinding="this" ' +
                'deleteActionBinding="view.deleteAction" ' +
                'maxCharactersBinding="view.maxCharacters" ' +
                'selectedItemBinding="view.selectedItem"' +
                'labelPropertyNameBinding="view.labelPropertyName"' +
            '}}' +
        '{{/each}}')
});