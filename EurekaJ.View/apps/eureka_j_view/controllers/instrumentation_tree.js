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

    selectedInstrumentationTypePath: null,
    treeItemIsGrouped: YES,
    allowsMultipleSelection: NO,

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
        }
    }.observes('selection')
});
