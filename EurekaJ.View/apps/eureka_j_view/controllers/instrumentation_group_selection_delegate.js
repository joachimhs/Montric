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
        SC.Logger.log('EurekaJView.instrumentationGroupSelectionDelegate collectionViewShouldSelectIndexes selectedItem: ' + selectedItem);

        if (selectedItem.instanceOf(EurekaJView.InstrumentationGroupModel)) {
            SC.Logger.log('Selected item is InstrumentationGroupModel!!');
            var instrumentationNodeForSelect = selectedItem.get('instrumentationGroupPath');
            SC.Logger.log('InstrumentationGroupNode for select: ' + instrumentationNodeForSelect.getEach('guiPath'));

            var selectionSet = SC.SelectionSet.create();
            selectionSet.addObjects(instrumentationNodeForSelect);
            selectionSet.forEach(function(adminTreeNode) {
                this.markNodeAndParentsAsExpanded(adminTreeNode);
            }, this);


            EurekaJView.instumentationGroupChartController.set('selection', selectionSet);
        }

        if (selectedItem.instanceOf(EurekaJView.AdminstrationTreeModel)) {
            SC.Logger.log('selected item is Administration Tree is: ' + selectedItem);
            this.setSelectedChartNodes(view, indexes);
            SC.Logger.log('instrumentationGroupNode set to: ' + EurekaJView.editInstrumentationGroupController.get('instrumentationGroupPath').getEach('guiPath'));
        }

        return indexes;
    },

    setSelectedChartNodes: function(view, indexes) {
        var selectionArray = [];

            indexes.forEach(function(o) {
                SC.Logger.log('forEach: ' + o);
                var selectedItem = view.get('content').objectAt(o);
                SC.Logger.log('selectedItem: ' + o);
                if (selectedItem.instanceOf(EurekaJView.AdminstrationTreeModel)) {
                    selectionArray.pushObject(selectedItem);
                }
            }, this);

        EurekaJView.editInstrumentationGroupController.set('instrumentationGroupPath', selectionArray);
    },

    markNodeAndParentsAsExpanded: function(treeModel) {
        SC.Logger.log('Expanding treeModel: ' + treeModel.get('guiPath'));


        parentNode = treeModel.get('parentPath');
        SC.Logger.log('Attempting to expand parents starting with: ' + treeModel.get('parentPath'));

        while (parentNode) {
            SC.Logger.log('Expanding parent: ' + parentNode.get('guiPath'));
            parentNode.set('treeItemIsExpanded', YES);
            parentNode = parentNode.get('parentPath');
        }
    }


});
