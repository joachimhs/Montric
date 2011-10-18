// ==========================================================================
// Project:   EurekaJView.InstrumentationTreeListItem
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.InstrumentationTreeListItem = SC.ListItemView.extend(
    /** @scope EurekaJView.InstrumentationTreeListItem.prototype */ {

    iconBinding: '.content.itemIcon',
    contentCheckboxKeyBinding: '.content.checkboxKey',
    selectedNodes: [],

    observeIsSelected: function() {
        var contentHasChanged = NO;

        if (this.get('content').get('isSelected') && this.get('selectedNodes').indexOf(this.get('content')) == -1) {
            this.get('selectedNodes').pushObject(this.get('content'));
            contentHasChanged = YES;
        } else if (!this.get('content').get('isSelected') && this.get('selectedNodes').indexOf(this.get('content')) != -1) {
            this.get('selectedNodes').removeObject(this.get('content'));
            contentHasChanged = YES;
        }

        if (contentHasChanged) {
            this.showSelectedCharts();
        }
    }.observes('.content.isSelected'),


    showSelectedCharts: function() {
        var selectionSet = SC.SelectionSet.create();

        this.get('selectedNodes').forEach(function(currentTreeNode) {
            var chartGridForSelect = currentTreeNode.get('chartGrid');
            if (chartGridForSelect) {
                selectionSet.addObjects(chartGridForSelect);
            }
        }, this);

        EurekaJView.chartGridController.set('content', selectionSet);
    }

});
