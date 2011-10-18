EurekaJView.showingInformationPanel = SC.State.extend({
	enterState: function() {
		//Below: Ugly gode for observing tab changes. 
	    EurekaJView.mainPage.get('informationPanelView').get('informationPanelTabView').addObserver('nowShowing', function(tabView) {
	        EurekaJView.chartGridController.set('nowShowingTab', tabView.get('nowShowing'));
	    });
	
        EurekaJView.mainPage.get('informationPanelView').set('isVisible', YES);
        EurekaJView.triggeredAlertListController.triggerTimer();
        EurekaJView.triggeredAlertListController.timer.set('isPaused', NO);
    },

    exitState: function() {
        EurekaJView.mainPage.get('informationPanelView').set('isVisible', NO);
        EurekaJView.triggeredAlertListController.timer.set('isPaused', YES);
    }
});