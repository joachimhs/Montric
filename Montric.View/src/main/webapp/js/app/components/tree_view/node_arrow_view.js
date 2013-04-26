Montric.NodeArrowView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{#if view.item.hasChildren}}' +
            '{{#if view.item.isExpanded}}' +
                '<span class="downarrow"></span>' +
            '{{else}}' +
                '<span class="rightarrow"></span>' +
            '{{/if}}' +
        '{{/if}}'),

    tagName: 'span',

    click: function(evt) {
        this.get('item').set('isExpanded', !this.get('item').get('isExpanded'));
    }
});