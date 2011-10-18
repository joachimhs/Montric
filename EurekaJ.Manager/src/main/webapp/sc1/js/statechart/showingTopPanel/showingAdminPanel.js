EurekaJView.showingAdminPanel = SC.State.extend({
	hideAdministrationPaneAction: function() {
        this.gotoState('ready');
    },

	enterState: function() {
        EurekaJView.mainPage.get('adminPanelView').append();
    },

    exitState: function() {
        EurekaJView.mainPage.get('adminPanelView').remove();
    }
});