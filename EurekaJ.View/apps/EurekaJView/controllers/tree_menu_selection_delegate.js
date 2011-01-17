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
        SC.Logger.log('SELECTING: ' + view.get('selection').get('length'));

        this.showSelectedCharts(view, indexes);

        return indexes;
    },

    collectionViewShouldDeselectIndexes: function (view, indexes) {
        SC.Logger.log('DESELECTING: ' + view.get('selection').get('length'));

        if (view.get('selection').get('length') > 1) {
            //this.showSelectedCharts(view, indexes);
        } else {
            EurekaJView.chartGridController.set('content', SC.SelectionSet.create());
        }

        return indexes;

    },

    showSelectedCharts: function(view, indexes) {
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
    }


});
