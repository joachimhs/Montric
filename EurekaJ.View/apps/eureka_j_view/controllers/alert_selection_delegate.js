// ==========================================================================
// Project:   EurekaJView.alertSelectionDelegateController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertSelectionDelegate = SC.Object.create(SC.CollectionViewDelegate,
    /** @scope EurekaJView.alertSelectionDelegate.prototype */ {

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        var getObjectAt = indexes.firstObject();
        var selectedItem = view.get('content').objectAt(getObjectAt);
        SC.Logger.log('EurekaJView.alertSelectionDelegate collectionViewShouldSelectIndexes selectedItem: ' + selectedItem);

        if (selectedItem.instanceOf(EurekaJView.AlertModel)) {
            SC.Logger.log('Selected item is Alert Model!!');
            var instrumentationNodeForSelect = selectedItem.get('alertInstrumentationNode');
            SC.Logger.log('alertInstrumentationNode for select: ' + instrumentationNodeForSelect);

            var selectionSet = SC.SelectionSet.create();
            selectionSet.addObject(instrumentationNodeForSelect);

            EurekaJView.alertChartController.set('selection', selectionSet);
        }

        if (selectedItem.instanceOf(EurekaJView.InstrumentationTreeModel)) {
            SC.Logger.log('selected item is Instrumentation Tree is: ' + selectedItem);
            EurekaJView.editAlertController.set('alertInstrumentationNode', selectedItem);
            SC.Logger.log('alertInstrumentationNode set to: ' + EurekaJView.editAlertController.get('alertInstrumentationNode'));
        }

        return indexes;
    }

});
