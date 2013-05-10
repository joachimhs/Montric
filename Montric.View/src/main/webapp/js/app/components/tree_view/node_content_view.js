Montric.NodeContentView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{#if controller._allowSelectionOfNonLeafNodes}}' +
            '{{#unless view.item.hasChildren}}<span style="margin-left: 12px;">&nbsp;</span>{{/unless}}' +
            '{{view Ember.Checkbox checkedBinding="view.item.isSelected"}}' +
        '{{else}}' +
            '{{#unless view.item.hasChildren}} ' +
                '<span style="margin-right: 7px;">&nbsp;</span>' +
                '{{view Ember.Checkbox checkedBinding="view.item.isSelected"}}' +
    '{{/unless}}' +
        '{{/if}}' +

        '{{view Montric.NodeArrowView itemBinding="view.item"}}' +
        '{{view Montric.NodeTextView itemBinding="view.item" classNames="treeMenuText"}}'),
    tagName: 'span',
    classNames: ['pointer']
});