// ==========================================================================
// Project:   EurekaJView.alertChartController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertChartController = SC.ArrayController.create(SC.SelectionSupport,
    /** @scope EurekaJView.alertChartController.prototype */ {

    treeItemIsGrouped: YES,
    allowsMultipleSelection: NO,

    populate: function() {
        var query = SC.Query.local(EurekaJView.InstrumentationTreeModel, 'hasChildren = {hasChildren}', {hasChildren: false});
        this.set('content', EurekaJView.EurekaJStore.find(query));
    },

    observesSelection: function() {
        SC.Logger.log('alertChartController observesSelection: ' + this.get('selection'));
        if (this.didChangeFor('selectionDidChange', 'selection') && this.getPath('selection.firstObject') && EurekaJView.editAlertController.get('content')) {
            SC.Logger.log('alertChartController observesSelection selected Alert Chart: ' + this.getPath('selection.firstObject'));
            //EurekaJView.editAlertController.get('content').set('alertInstrumentationNode', this.getPath('selection.firstObject'));
        }
        //
    }.observes('selection'),

    //Delegate methods
    collectionViewSelectionForProposedSelection: function(view, sel) {
        SC.Logger.log('alertChartController Delegate: collectionViewSelectionForProposedSelection: ' + sel);
        //EurekaJView.alertChartController.set('selection', sel);
        return sel;
    },

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        SC.Logger.log('alertChartController Delegate: collectionViewShouldSelectIndexes: ' + indexes);
        return indexes;
    },

    collectionViewShouldDeselectIndexes: function (view, indexes) {
        SC.Logger.log('alertChartController Delegate: collectionViewShouldDeselectIndexes: ' + indexes);
        return indexes;
    },

    collectionViewShouldDeleteIndexes: function(view, indexes) {
        SC.Logger.log('alertChartController Delegate: collectionViewShouldDeleteIndexes: ' + indexes);
        return indexes;
    },

    collectionViewDeleteContent: function(view, content, indexes) {
        SC.Logger.log('alertChartController Delegate: collectionViewDeleteContent: ' + content);
        if (!content) return NO;

        if (SC.typeOf(content.destroyAt) === SC.T_FUNCTION) {
            content.destroyAt(indexes);
            view.selectPreviousItem(NO, 1);
            return YES;

        } else if (SC.typeOf(content.removeAt) === SC.T_FUNCTION) {
            content.removeAt(indexes);
            view.selectPreviousItem(NO, 1);
            return YES;

        } else return NO;
    }

});
