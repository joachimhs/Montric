// ==========================================================================
// Project:   EurekaJView.EmailRecipientsAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
sc_require('views/chart/chart_view');
EurekaJView.ChartGrid = SC.GridView.extend(
{
	contentBinding: 'EurekaJView.chartGridController.arrangedObjects',
    selectOnMouseDown: NO,
    exampleView: EurekaJView.ChartView,
    recordType: EurekaJView.ChartGridModel,
    itemsPerRow: 1,
    isSelectable: NO,

    //extending Grid View to enable dynamic grid-height
    layoutForContentIndex: function(contentIndex) {
        var frameHeight = this.get('clippingFrame').height;
        var rowHeight = (frameHeight / this.get('content').get('length'));
        SC.Logger.log('frameHeight: ' + frameHeight + ' content.length: ' + this.get('content').get('length') + ' rowHeight: ' + rowHeight);
        var frameWidth = this.get('clippingFrame').width;
        var itemsPerRow = this.get('itemsPerRow');
        var columnWidth = Math.floor(frameWidth / itemsPerRow);

        var row = Math.floor(contentIndex / itemsPerRow);
        var col = contentIndex - (itemsPerRow * row);
        return {
            left: col * columnWidth,
            top: row * rowHeight,
            height: rowHeight,
            width: columnWidth
        };
    }
});
