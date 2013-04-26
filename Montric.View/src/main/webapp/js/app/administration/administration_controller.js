Montric.AdministrationController = Ember.ArrayController.extend({
    resetSelectedTab: function () {
        this.set('selectedTab', this.get('content').objectAt(0));
    },

    selectTabWithId: function(tabId) {
        var selectedIndex = 0;
        var index = 0;
        if (this.get('content')) {
            this.get('content').forEach(function (tab) {
                if (tab.get('tabId') === tabId) {
                    selectedIndex = index;
                }
                index++;
            })
        }
        this.set('selectedTab', this.get('content').objectAt(selectedIndex));
    }
});