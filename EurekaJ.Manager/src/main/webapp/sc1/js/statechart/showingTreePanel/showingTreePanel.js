EurekaJView.showingTreePanel = SC.State.extend({
	enterState: function() {
        EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_TREE_QUERY);
        EurekaJView.InstrumentationTreeController.populate();

        EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', YES);
        EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', YES);
        EurekaJView.InstrumentationTreeController.triggerTimer();
        EurekaJView.InstrumentationTreeController.timer.set('isPaused', NO);
    },

    exitState: function() {
        EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', NO);
        EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', NO);
        EurekaJView.InstrumentationTreeController.timer.set('isPaused', YES);
    }
});