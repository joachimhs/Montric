/*globals EurekaJView */

EurekaJView.statechart = SC.Statechart.create({

    rootState: SC.State.design({
        substatesAreConcurrent: YES,

        enterState: function() {
            EurekaJView.EurekaJStore.find(EurekaJView.LOGGED_IN_USER_QUERY);
        },

        showingTreePanel: SC.State.plugin('EurekaJView.showingTreePanel'),

		showingChartPanel: SC.State.plugin('EurekaJView.showingChartPanel'),

        showingInformationPanel: SC.State.plugin('EurekaJView.showingInformationPanel'),

        showingTopPanel: SC.State.plugin('EurekaJView.showingTopPanel')
    })
});