/*globals EurekaJView */

EurekaJView.statechart = Ki.Statechart.create({
    rootState: Ki.State.design({

        //initialSubstate: 'showInstrumentationMenu',
        substatesAreConcurrent: YES,

        showInstrumentationMenu: Ki.State.design({
            enterState: function() {
                EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', YES);
                EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', YES);
                EurekaJView.InstrumentationTreeController.triggerTimer();
                EurekaJView.InstrumentationTreeController.timer.set('isPaused', NO) ;
                SC.Logger.log('entered showInstrumentationMenu');
            },

            exitState: function() {
                EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', NO);
                EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', NO);
                EurekaJView.InstrumentationTreeController.timer.set('isPaused', YES) ;
                SC.Logger.log('exited showInstrumentationMenu');
            }
        }),

        showTopMenu: Ki.State.design({

            initialSubstate: 'hideTimePeriodPanel',

            /* ACTIONS */
            showTimeperiodPaneAction: function() {
                this.gotoState('showTimePeriodPanel');
            },

            hideTimeperiodPaneAction: function() {
                this.gotoState('hideTimePeriodPanel');
            },

            showAdministrationPaneAction: function() {
                EurekaJView.EurekaJStore.find(EurekaJView.ALERTS_QUERY);
                EurekaJView.EurekaJStore.find(EurekaJView.ADMINISTRATION_TREE_QUERY);

                EurekaJView.updateAlertsAction();
                EurekaJView.updateInstrumentationGroupsAction();
                this.gotoState('showAdminPanel');

            },

            hideAdministrationPaneAction: function() {
                this.gotoState('hideAdminPanel');
            },

            /* //ACTIONS */

            enterState: function() {
                EurekaJView.mainPage.get('topView').set('isVisible', YES);
                SC.Logger.log('entered showTopMenu');
            },

            exitState: function() {
                EurekaJView.mainPage.get('topView').set('isVisible', NO);
                SC.Logger.log('exited showTopMenu');
            },

            hideTimePeriodPanel: Ki.State.design({
                enterState: function() {
                    SC.Logger.log("Entering hideTimePeriodPanel State");
                    EurekaJView.mainPage.get('timePeriodView').remove();
                },

                exitState: function() {
                    SC.Logger.log("Exiting hideTimePeriodPanel State");
                }
            }),

            showTimePeriodPanel: Ki.State.design({
                enterState: function() {
                    SC.Logger.log("Entering showTimePeriodPanel State");
                    EurekaJView.mainPage.get('timePeriodView').append();
                },

                exitState: function() {
                    SC.Logger.log("Exiting showTimePeriodPanel State");
                    EurekaJView.mainPage.get('timePeriodView').remove();
                }
            }),

            hideAdminPanel: Ki.State.design({
                enterState: function() {
                    SC.Logger.log("Entering hideAdminPanel State");
                    EurekaJView.mainPage.get('adminPanelView').remove();
                },

                exitState: function() {
                    SC.Logger.log("Exiting hideAdminPanel State");
                }
            }),

            showAdminPanel: Ki.State.design({
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