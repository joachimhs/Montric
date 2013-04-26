Montric.NodeTextView = Ember.View.extend({
    template: Ember.Handlebars.compile('{{view.item.name}}'),
    tagName: 'span',

    click: function(evt) {
        if(this.get('item.hasChildren')) {
            this.get('item').set('isExpanded', !this.get('item.isExpanded'));
        } else {
            this.get('item').set('isSelected', !this.get('item.isSelected'));
        }
    }
});