Montric.MultiSelectableListView = Ember.View.extend({
    classNames: ['selectableList'],
    listItems: null,
    selectedItems: null,
    
    template: Ember.Handlebars.compile('' + 
        '{{#each listItem in view.listItems}}' +
            '{{view Montric.MultiSelectableListItemView listItemBinding="listItem"}}' +
        '{{/each}}'
    )
});