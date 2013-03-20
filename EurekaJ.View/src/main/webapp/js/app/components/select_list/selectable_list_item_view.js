EurekaJ.SelectableListItemView = Ember.View.extend({
    tagName: 'div',
    classNameBindings: 'isSelected',
    deleteAction: null,
    selectedItem: null,
    labelPropertyName: null,

    liShortLabel: function() {
        var numCharacters = this.get('maxCharacters') - 10;

        if (this.get('item.id.length') > numCharacters) {
            return this.get('item.id').substr(0, numCharacters) + '...';
        }

        return this.get('item.id');
    }.property('item.id'),

    liLongLabel: function() {
        var numCharacters = this.get('maxCharacters');
        if (this.get('item') != null && this.get('item.id.length') > numCharacters)
            return this.get('item.id').substr(0, numCharacters) + '...';

        return this.get('item.id');
    }.property('item.id'),

    isSelected: function() {
        return this.get('selectedItem.id') === this.get('item').get('id');
    }.property('selectedItem'),

    click: function() {
        this.set('selectedItem', this.get('item'));
    },

    template: Ember.Handlebars.compile('' +
        '{{#if view.isSelected}}' +
            '{{view.liShortLabel}}' +
            '{{#if view.deleteAction}}' +
                '{{#view EurekaJ.BootstrapButton ' +
                    'actionBinding="view.deleteAction" ' +
                    'target="controller" ' +
                    'classNames="btn btn-danger btn-mini floatRight"}}' +
                        'Delete' +
                '{{/view}}' +
            '{{/if}}' +
        '{{else}}' +
            '{{view.liLongLabel}}' +
        '{{/if}}'
    )
});