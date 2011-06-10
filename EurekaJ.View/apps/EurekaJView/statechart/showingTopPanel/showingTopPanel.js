EurekaJView.showingTopPanel = SC.State.extend({
    initialSubstate: 'ready',

    enterState: function() {
        EurekaJView.mainPage.get('topView').set('isVisible', YES);
        SC.Logger.log('entered showTopMenu');
    },

    exitState: function() {
        EurekaJView.mainPage.get('topView').set('isVisible', NO);
        SC.Logger.log('exited showTopMenu');
    },

    ready: SC.State.design({
        showAdministrationPaneAction: function() {
            EurekaJView.EurekaJStore.find(EurekaJView.ALERTS_QUERY);
            EurekaJView.EurekaJStore.find(EurekaJView.ADMINISTRATION_TREE_QUERY);
            EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_GROUPS_QUERY);
            EurekaJView.EurekaJStore.find(EurekaJView.EMAIL_GROUPS_QUERY);

            EurekaJView.updateAlertsAction();
            EurekaJView.updateInstrumentationGroupsAction();
            EurekaJView.updateEmailGroupsAction();
            this.gotoState('showingAdminPanel');
        }
    }),

    showingAdminPanel: SC.State.plugin('EurekaJView.showingAdminPanel')
});