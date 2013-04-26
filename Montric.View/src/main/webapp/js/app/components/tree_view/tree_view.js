EurekaJ.TreeView = Ember.View.extend({
    items : null,
    allowSelectionOfNonLeafNodes: false,
    allowMultipleSelections: true,
    controller : Ember.Controller.create(),

    init : function() {
        this._super();
        this.set('controller._allowSelectionOfNonLeafNodes', this.get('allowSelectionOfNonLeafNodes'))
        this.set('controller._allowMultipleSelections', this.get('allowMultipleSelections'))
    },

    nonLeafSelectionObserver : function() {
        this.set('controller._allowSelectionOfNonLeafNodes', this.get('allowSelectionOfNonLeafNodes'))
    }.observes('allowSelectionOfNonLeafNodes'),

    multipleSelectionObserver : function() {
        this.set('controller._allowMultipleSelections', this.get('allowMultipleSelections'))
    }.observes('allowMultipleSelections'),

    template : Ember.Handlebars.compile('' +
        '{{#each view.items}}{{#if name}}' +
            '{{view EurekaJ.NodeView itemBinding="this"}}' + 
        '{{/if}}{{/each}}')
});