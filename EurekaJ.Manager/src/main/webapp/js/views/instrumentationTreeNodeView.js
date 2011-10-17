EurekaJView.InstrumentationTreeNodeView = SC.View.extend(
/** @scope EurekaJView.ChartViewTwo.prototype */
{
	//iconBinding: '.content.itemIcon',
    //contentCheckboxKeyBinding: '.content.checkboxKey',
    selectedNodes: [],

    observeIsSelected: function() {
    	SC.Logger.log('observeIsSelected');
        var contentHasChanged = false;

        if (this.get('content').get('isSelected') && this.get('selectedNodes').indexOf(this.get('content')) == -1) {
            this.get('selectedNodes').pushObject(this.get('content'));
            contentHasChanged = true;
        } else if (!this.get('content').get('isSelected') && this.get('selectedNodes').indexOf(this.get('content')) != -1) {
            this.get('selectedNodes').removeObject(this.get('content'));
            contentHasChanged = true;
        }

        if (contentHasChanged) {
            this.showSelectedCharts();
        }
    }.observes('.content.isSelected'),


    showSelectedCharts: function() {
    	SC.Logger.log('showSelectedCharts');
        var selectionSet = SC.Set.create();

        this.get('selectedNodes').forEach(function(currentTreeNode) {
            var chartGridForSelect = currentTreeNode.get('chartGrid');
            if (chartGridForSelect) {
                selectionSet.addObjects(chartGridForSelect);
            }
        }, this);

        //EurekaJView.chartGridController.set('content', selectionSet);*/
    }
});