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
        SC.Logger.log('EurekaJView.instrumentationGroupSelectionDelegate collectionViewShouldSelectIndexes');
        var getObjectAt = indexes.firstObject();
        var selectedItem = view.get('content').objectAt(getObjectAt);

        //Select an Instrumentation Group
        if (selectedItem.instanceOf(EurekaJView.InstrumentationGroupModel)) {
            this.closeOpenTreeNodes(view);

            var selectedChartsContentArray = [];
            var instrumentationNodeForSelect = selectedItem.get('instrumentationGroupPath');
            instrumentationNodeForSelect.forEach(function(adminTreeNode) {
                this.markNodeAndParentsAsExpanded(adminTreeNode, YES);
                selectedChartsContentArray.pushObject(adminTreeNode);
            }, this);

            EurekaJView.selectedInstrumentationGroupController.set('content', selectedChartsContentArray);
        }

        return indexes;
    },

    markNodeAndParentsAsExpanded: function(treeModel, setExpanded) {
        parentNode = treeModel.get('parentPath');

        while (parentNode) {
            parentNode.set('treeItemIsExpanded', setExpanded);
            parentNode = parentNode.get('parentPath');
        }
    },

    closeOpenTreeNodes: function(view) {
        //Deselecting all selected nodes and closing parent nodes
        view.get('content').forEach(function(node) {
            selectedNodes = node.get('instrumentationGroupPath');
            selectedNodes.forEach(function(adminTreeNode) {
                SC.Logger.log('Deselecting: ' + adminTreeNode.get('guiPath'));
                //adminTreeNode.set('isSelected', NO);
                this.markNodeAndParentsAsExpanded(adminTreeNode, NO);
            }, this);
        }, this);
    }


});
