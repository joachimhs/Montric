/*globals EurekaJView */

EurekaJView.statechart = SC.Statechart.create({

    rootState: SC.State.design({
        substatesAreConcurrent: YES,

        showingTreePanel: SC.State.design({
            enterState: function() {
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
        }),

        showingInformationPanel: SC.State.design({
            enterState: function() {
                EurekaJView.mainPage.get('informationPanelView').set('isVisible', YES);
                EurekaJView.triggeredAlertListController.triggerTimer();
                EurekaJView.triggeredAlertListController.timer.set('isPaused', NO);
            },

            exitState: function() {
                EurekaJView.mainPage.get('informationPanelView').set('isVisible', NO);
                EurekaJView.triggeredAlertListController.timer.set('isPaused', YES);
            }
        }),

        showingTopPanel: SC.State.design({
            enterState: function() {
                EurekaJView.mainPage.get('topView').set('isVisible', YES);
                SC.Logger.log('entered showTopMenu');
            },

            exitState: function() {
                EurekaJView.mainPage.get('topView').set('isVisible', NO);
                SC.Logger.log('exited showTopMenu');
            },

            initialSubstate: 'ready',

			ready: SC.State.design({}),

			/* ACTIONS */
            showAdministrationPaneAction: function() {
                this.gotoState('showingAdminPanel');
            },

            hideAdministrationPaneAction: function() {
                this.gotoState('ready');
            },
            /* //ACTIONS */

            showingAdminPanel: SC.State.design({
                enterState: function() {
                    EurekaJView.mainPage.get('adminPanelView').append();
                },

                exitState: function() {
                    EurekaJView.mainPage.get('adminPanelView').remove();
                }
            })

        })

    })
});