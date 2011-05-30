EurekaJView.showingChartPanel = SC.State.extend({
	enterState: function() {
		EurekaJView.mainPage.get('flotChartGrid').set('isVisible', YES);
	    EurekaJView.chartGridController.init();
	},
	
	exitState: function() {
		EurekaJView.mainPage.get('flotChartGrid').set('isVisible', NO);
	}
});