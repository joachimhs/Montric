// ==========================================================================
// Project:   EurekaJView.instrumentationTreeController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.InstrumentationTreeController = SC.TreeController.create(
/** @scope EurekaJView.instrumentationTreeController.prototype */
{

    timer: null,
    selectedInstrumentationTypePath: null,
    treeItemIsGrouped: YES,
    allowsMultipleSelection: YES,

    populate: function() {
        var rootNode = SC.Object.create({
            treeItemIsExpanded: YES,
            name: "Instrumentations",
            treeItemChildren: function() {
                var query = SC.Query.local(EurekaJView.InstrumentationTreeModel, 'parentPath = {parentPath}', {parentPath: null});
                return EurekaJView.EurekaJStore.find(query);
            }.property()
        });

        this.set('content', rootNode)
    },

    observesSelection: function() {
        if (this.didChangeFor('selectionDidChange', 'selection') && this.getPath('selection.firstObject.guiPath')) {
            this.set('selectedInstrumentationTypePath', this.getPath('selection.firstObject.guiPath'));
            SC.Logger.log('InstrumentationTreeController observesSelection: ' + this.getPath('selection.firstObject.guiPath'));
			SC.Logger.log('Availble Charts: ' + this.getPath('selection.firstObject.availableCharts'));
			EurekaJView.chartSelectorController.set('content', this.getPath('selection.firstObject.availableCharts'));
            EurekaJView.chartGridController.set('content', this.getPath('selection').getEach('chartGrid'));
        }
    }.observes('selection'),

    refreshData: function() {
        SC.Logger.log('Refreshing Instrumentation Menu');
        EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_TREE_QUERY).refresh();
    },

    triggerTimer: function() {
        SC.Logger.log('Triggering timer');
        if (this.get('timer')) {
            SC.Logger.log('Timer already started');
        } else {
            SC.Logger.log('Starting Timer');
            var timer = SC.Timer.schedule({
                target: EurekaJView.InstrumentationTreeController,
                action: 'refreshData',
                interval: 60000,
                repeats: YES
            });
            this.set('timer', timer)
        }
    }
});
