Montric.SelectableLeafItemContentView = Ember.View.extend({
    tagName: 'div',
    classNames: ['fullWidth'],
    selectedItem: null,

    template: Ember.Handlebars.compile('' +
        '{{#if hasChildren}}' +
        '{{#if isExpanded}}' +
        '<span class="downarrow"></span>' +
        '{{else}}' +
        '<span class="rightarrow"></span>' +
        '{{/if}}' +
        '{{/if}}' +
        '{{name}}'
    ),

    click: function() {
        if (this.get('item.children.length') && this.get('item.children.length') > 0) {
            //item has children
            this.get('item').set('isExpanded', !this.get('item.isExpanded'));
        } else {
            //leaf node
            console.log(this.get('selectedItem'));
            console.log(this.get('item'));
            if (this.get('item.id')) {
                this.set('selectedItem', this.get('item.id'));
            } else {
                this.set('selectedItem', this.get('item'));
            }
        }
    }
});