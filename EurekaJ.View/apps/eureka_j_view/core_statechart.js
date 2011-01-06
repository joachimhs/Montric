/*globals EurekaJView */

SC.mixin(EurekaJView, {
    statechart: Ki.Statechart.create({
        rootState: Ki.State.design({

            initialSubstate: 'showInstrumentationMenu',
            substatesAreConcurrent: YES,

            showInstrumentationMenu: Ki.State.design({
                enterState: function() {
                    SC.Logger.log('entered showInstrumentationMenu');
                },

                exitState: function() {
                    SC.Logger.log('exited showInstrumentationMenu');
                }
            }),

            showTopMenu: Ki.State.design({
                enterState: function() {
                    SC.Logger.log('entered showTopMenu');
                },

                exitState: function() {
                    SC.Logger.log('exited showTopMenu');
                }
            })
        })
    })
});