// ==========================================================================
// Project:   EurekaJView.alertSelectionDelegateController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.instrumentationGroupSelectionDelegate = SC.Object.create(SC.CollectionViewDelegate,
    /** @scope EurekaJView.alertSelectionDelegate.prototype */ {

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        var getObjectAt = indexes.firstObject();
        var selectedItem = view.get('content').objectAt(getObjectAt);

        //Select an Instrumentation Group
        if (selectedItem.instanceOf(EurekaJView.InstrumentationGroupModel)) {
            this.closeOpenTreeNodes(view);

            var instrumentationNodeForSelect = selectedItem.get('instrumentationGroupPath');

            var selectionSet = SC.SelectionSet.create();
            selectionSet.addObjects(instrumentationNodeForSelect);
            selectionSet.forEach(function(adminTreeNode) {
                this.markNodeAndParentsAsExpanded(adminTreeNode, YES);
            }, this);

            EurekaJView.instumentationGroupChartController.set('selection', selectionSet);
        }

        //Select one or more tree nodes
        if (selectedItem.instanceOf(EurekaJView.AdminstrationTreeModel)) {
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

        EurekaJView.editInstrumentationGroupController.set('instrumentationGroupPath', selectionArray);
    },

    markNodeAndParentsAsExpanded: function(treeModel, setExpanded) {
        parentNode = treeModel.get('parentPath');

        while (parentNode) {
            parentNode.set('treeItemIsExpanded', setExpanded);
            parentNode = parentNode.get('parentPath');
        }
    },

    closeOpenTreeNodes: function(view) {

        view.get('content').forEach(function(node) {
            selectedNodes = node.get('instrumentationGroupPath');
            selectedNodes.forEach(function(adminTreeNode) {
                this.markNodeAndParentsAsExpanded(adminTreeNode, NO);
            }, this);
        }, this);
    }


});
