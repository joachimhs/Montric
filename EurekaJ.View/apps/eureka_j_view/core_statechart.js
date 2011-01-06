/*globals EurekaJView */

SC.mixin(EurekaJView, {
    statechart: Ki.Statechart.create({
        rootState: Ki.State.design({

            initialSubstate: 'showInstrumentationMenu',
            substatesAreConcurrent: YES,

            showInstrumentationMenu: Ki.State.design({
                enterState: function() {
                    EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', YES);
                    EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', YES);
                    SC.Logger.log('entered showInstrumentationMenu');
                },

                exitState: function() {
                    EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', NO);
                    EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', NO);
                    SC.Logger.log('exited showInstrumentationMenu');
                }
            }),

            showTopMenu: Ki.State.design({
                enterState: function() {
                    EurekaJView.mainPage.get('topView').set('isVisible', YES);
                    SC.Logger.log('entered showTopMenu');
                },

                exitState: function() {
                    EurekaJView.mainPage.get('topView').set('isVisible', NO);
                    SC.Logger.log('exited showTopMenu');
                }
            })
        })
    })
});