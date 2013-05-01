Montric.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'button',
    classNames: ['btn', 'btn-primary'],
    disabled: false,

    click: function() {
        if (!this.get('disabled')) {
            this.triggerAction();
        }
    },

    template: Ember.Handlebars.compile('' + 
        '{{#if view.iconName}}' + 
            '<i {{bindAttr class="view.iconName"}}></i>' + 
        '{{/if}}' + 
        '{{view.content}}'
    )
});