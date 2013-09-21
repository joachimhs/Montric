Montric.TabView = Ember.View.extend({
    selectedTabObserver : function() {
        this.rerender();
    }.observes('controller.selectedTab'),

    template : Ember.Handlebars.compile('' + 
        '<ul class="tabrow">{{#each tab in content}}' + 
            '{{view Montric.TabItemView ' +
                'tabBinding="tab" ' + 
                'targetBinding="tab.target" ' + 
                'actionBinding="tab.action"' + 
            '}}' + 
        '{{/each}}</ul>' +

        '{{#if controller.selectedTab.hasView}}' + 
            '{{view controller.selectedTab.tabView}}' + 
        '{{/if}}'
    )
});