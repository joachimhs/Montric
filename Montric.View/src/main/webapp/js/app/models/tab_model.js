Montric.TabModel = Ember.Object.extend({
    tabId: null,
    tabName: null,
    tabState: null,
    tabView: null,
    tabClickedAction: null,

    hasView: function() {
        return this.get('tabView') != null;
    }.property('tabView').cacheable(),
});