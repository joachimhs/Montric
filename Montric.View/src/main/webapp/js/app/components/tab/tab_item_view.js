EurekaJ.TabItemView = Ember.View.extend(Ember.TargetActionSupport, {
    tagName : 'li',

    classNameBindings : "isSelected",

    isSelected : function() {
        return this.get('controller').get('selectedTab').get('tabId') == this.get('tab').get('tabId');
    }.property('controller.selectedTab'),

    click : function() {
        this.triggerAction();

        this.get('controller').set('selectedTab', this.get('tab'));
    },

    template : Ember.Handlebars.compile('<div class="featureTabTop"></div>{{tab.tabName}}')
});