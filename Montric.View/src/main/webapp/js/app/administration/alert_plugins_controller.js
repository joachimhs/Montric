Montric.AlertPluginsController = Ember.ArrayController.extend({
    init: function() {
        this._super();
        this.set('content', Montric.AlertPlugin.findAll());
    }
});