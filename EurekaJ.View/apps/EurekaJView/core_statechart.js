/*globals EurekaJView */

EurekaJView.statechart = SC.State.design({


    initialSubstate: 'loggedIn',

    loggedIn: SC.State.design({


        substatesAreConcurrent: YES,

        showingLeftMenu: SC.State.design({
            enterState: function() {
                EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', YES);
                EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', YES);
                EurekaJView.InstrumentationTreeController.triggerTimer();
                EurekaJView.InstrumentationTreeController.timer.set('isPaused', NO);
                SC.Logger.log('entered showInstrumentationMenu');
            },

            exitState: function() {
                EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', NO);
                EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', NO);
                EurekaJView.InstrumentationTreeController.timer.set('isPaused', YES);
                SC.Logger.log('exited showInstrumentationMenu');
            }
        }),

        showingTopMenu: SC.State.design({
            enterState: function() {
                EurekaJView.mainPage.get('topView').set('isVisible', YES);
                SC.Logger.log('entered showTopMenu');
            },

            exitState: function() {
                EurekaJView.mainPage.get('topView').set('isVisible', NO);
                SC.Logger.log('exited showTopMenu');
            },

            initialSubstate: 'ready',


            ready: SC.State.design({

            }),

            /* ACTIONS */
            showTimeperiodPaneAction: function() {
                this.gotoState('showingTimePeriodPanel');
            },

            hideTimeperiodPaneAction: function() {
                this.gotoState('ready');
            },

            showAdministrationPaneAction: function() {
                EurekaJView.EurekaJStore.find(EurekaJView.ALERTS_QUERY);
                EurekaJView.EurekaJStore.find(EurekaJView.ADMINISTRATION_TREE_QUERY);
                EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_GROUPS_QUERY);
                EurekaJView.EurekaJStore.find(EurekaJView.EMAIL_GROUPS_QUERY);

                EurekaJView.updateAlertsAction();
                EurekaJView.updateInstrumentationGroupsAction();
                EurekaJView.updateEmailGroupsAction();

                this.gotoState('showingAdminPanel');

            },

            hideAdministrationPaneAction: function() {
                this.gotoState('ready');
            },

            /* //ACTIONS */

            hideTimePeriodPanel: SC.State.design({
                enterState: function() {
                    SC.Logger.log("Entering hideTimePeriodPanel State");
                    EurekaJView.mainPage.get('timePeriodView').remove();
                },

                exitState: function() {
                    SC.Logger.log("Exiting hideTimePeriodPanel State");
                }
            }),

            showingTimePeriodPanel: SC.State.design({
                enterState: function() {
                    SC.Logger.log("Entering showTimePeriodPanel State");
                    EurekaJView.mainPage.get('timePeriodView').append();
                },

                exitState: function() {
                    SC.Logger.log("Exiting showTimePeriodPanel State");
                    EurekaJView.mainPage.get('timePeriodView').remove();
                }
            }),

            showingAdminPanel: SC.State.design({
                enterState: function() {
                    SC.Logger.log("Entering showAdminPanel State");
                    EurekaJView.mainPage.get('adminPanelView').append();
                },

                exitState: function() {
                    SC.Logger.log("Exiting showAdminPanel State");
                    EurekaJView.mainPage.get('adminPanelView').remove();
                }
            })

        })

    })
});