EurekaJ.ChartOptionsModalController = Ember.ArrayController.extend({
    applicationController : null,

    init : function() {
        this._super();
        var content = [];
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'live',
            tabName : 'Live',
            tabState : null,
            tabView : EurekaJ.LiveChartOptionsView,
            target : "controller",
            action : "liveChartsSelected"
        }));
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'historical',
            tabName : 'Historical',
            tabView : EurekaJ.HistoricalChartOptionsView,
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