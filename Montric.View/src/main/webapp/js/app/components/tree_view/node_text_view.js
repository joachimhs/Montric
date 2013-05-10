Montric.NodeTextView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{#if view.item.isAlert}}' +
            '<i class="icon-bell"></i>' +
            //'{{view Montric.LiviconView dataName="bell" dataSize="16"}}' +
        '{{/if}}' +
        '{{view.item.name}}'
    ),
    tagName: 'span',

    click: function(evt) {
        if(this.get('item.hasChildren')) {
            this.get('item').set('isExpanded', !this.get('item.isExpanded'));
        } else {
            this.get('item').set('isSelected', !this.get('item.isSelected'));
        }
    }
});