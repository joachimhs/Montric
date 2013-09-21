Montric.AdministrationController = Ember.ArrayController.extend({
    needs: ['user'],

    addRootTabs: function() {
        console.log('isRoot: ' + (this.get('controllers.user.content.isRoot')));

        if (this.get('controllers.user.content.isRoot')) {
            this.get('content').pushObject(Montric.TabModel.create({
                tabId : 'accounts',
                tabName : 'Accounts',
                tabState : 'administration.accounts',
                target : "controller",
                action : "accountsSelected"
            }));
        }
    },

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