/*globals EurekaJView */

EurekaJView.statechart = SC.Statechart.create({

    rootState: SC.State.design({
        substatesAreConcurrent: YES,

        showingTreePanel: SC.State.plugin('EurekaJView.showingTreePanel'),

		showingChartPanel: SC.State.plugin('EurekaJView.showingChartPanel'),

        showingInformationPanel: SC.State.plugin('EurekaJView.showingInformationPanel'),

        showingTopPanel: SC.State.plugin('EurekaJView.showingTopPanel')
    })
});