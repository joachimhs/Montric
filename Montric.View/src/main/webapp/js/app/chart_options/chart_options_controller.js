Montric.ChartOptionsModalController = Ember.ArrayController.extend({
    applicationController : null,

    init : function() {
        this._super();
        var content = [];
        content.pushObject(Montric.TabModel.create({
            tabId : 'live',
            tabName : 'Live',
            tabState : null,
            tabView : Montric.LiveChartOptionsView,
            target : "controller",
            action : "liveChartsSelected"
        }));
        content.pushObject(Montric.TabModel.create({
            tabId : 'historical',
            tabName : 'Historical',
            tabView : Montric.HistoricalChartOptionsView,
            target : "controller",
            action : "historicalChartsSelected"
        }));
        this.set('content', content);
        this.resetSelectedTab();
    },

    resetSelectedTab : function() {
        this.set('selectedTab', this.get('content').objectAt(0));
    }
});