EurekaJ.MultiSelectableListView = Ember.View.extend({
    classNames: ['selectableList'],
    listItems: null,
    selectedItems: null,
    
    template: Ember.Handlebars.compile('' + 
        '{{#each listItem in view.listItems}}' +
            '{{view EurekaJ.MultiSelectableListItemView listItemBinding="listItem"}}' +
        '{{/each}}'
    )
});