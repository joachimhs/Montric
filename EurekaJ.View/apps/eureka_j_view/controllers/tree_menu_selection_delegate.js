// ==========================================================================
// Project:   EurekaJView.treeMenuSelectionDelegate
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.treeMenuSelectionDelegate = SC.Object.create(SC.CollectionViewDelegate,
    /** @scope EurekaJView.treeMenuSelectionDelegate.prototype */ {

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        var selectionSet = SC.SelectionSet.create();

        indexes.forEach(function(o) {
            SC.Logger.log('forEach: ' + o);
            var selectedItem = view.get('content').objectAt(o);
            if (selectedItem.instanceOf(EurekaJView.InstrumentationTreeModel)) {
                var chartGridForSelect = selectedItem.get('chartGrid');
                if (chartGridForSelect) {
                    selectionSet.addObjects(chartGridForSelect);
                }
            }
        }, this);

        EurekaJView.chartGridController.set('content', selectionSet);

        return indexes;
    }


});
