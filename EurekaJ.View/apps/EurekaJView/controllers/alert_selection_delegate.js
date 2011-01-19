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
            this.closeOpenTreeNodes(view);


            SC.Logger.log('Selected item is Alert Model!!');
            var instrumentationNodeForSelect = selectedItem.get('alertInstrumentationNode');
            SC.Logger.log('alertInstrumentationNode for select: ' + instrumentationNodeForSelect);


            var selectionSet = SC.SelectionSet.create();
            selectionSet.addObject(instrumentationNodeForSelect);
            selectionSet.forEach(function(adminTreeNode) {
                this.markNodeAndParentsAsExpanded(adminTreeNode, YES);
            }, this);

            EurekaJView.alertChartController.set('selection', selectionSet);
        }

        if (selectedItem.instanceOf(EurekaJView.InstrumentationTreeModel)) {
            this.setSelectedChartNodes(view, indexes);
        }

        return indexes;
    },

    setSelectedChartNodes: function(view, indexes) {
        var selectionArray = [];

        indexes.forEach(function(o) {
            var selectedItem = view.get('content').objectAt(o);
            if (selectedItem.instanceOf(EurekaJView.AdminstrationTreeModel)) {
                selectionArray.pushObject(selectedItem);
            }
        }, this);

        EurekaJView.editAlertController.set('instrumentationGroupPath', selectionArray);
    },

    markNodeAndParentsAsExpanded: function(treeModel, setExpanded) {
        parentNode = treeModel.get('parentPath');

        while (parentNode) {
            parentNode.set('treeItemIsExpanded', setExpanded);
            parentNode = parentNode.get('parentPath');
        }
    },

    closeOpenTreeNodes: function(view) {
        SC.Logger.log(view.get('content'));
        SC.Logger.log(view.get('content').get('content'));

        SC.Logger.log(EurekaJView.alertAdministrationController.get('content'));

        view.get('content').get('content').forEach(function(adminTreeNode) {
            SC.Logger.log('adminTreeNode: ' + adminTreeNode);
            this.markNodeAndParentsAsExpanded(adminTreeNode.get('alertInstrumentationNode'), NO);
        }, this);
    }

});
