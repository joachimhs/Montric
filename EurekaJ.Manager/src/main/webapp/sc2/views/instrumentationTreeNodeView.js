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
    	SC.Logger.log('showSelectedCharts: ' + this.get('selectedNodes'));

    	var charts = [];

        this.get('selectedNodes').forEach(function(currentTreeNode) {
            var chartGridForSelect = currentTreeNode.get('chartGrid');
            if (chartGridForSelect) {
            	chartGridForSelect.forEach(function(chart) {
            		SC.Logger.log('pushing chartGrid: ' + chart);
            		charts.push(chart);
            	}, this);
            }
        }, this);
        
        charts.forEach(function(chart) {
        	SC.Logger.log('outgoing chart: ' + chart);
        }, this);
        EurekaJView.chartGridArrayController.set('content', charts);
    }
});