EurekaJView.statechart =  SC.Statechart.create({

    rootState: SC.State.extend({
        substatesAreConcurrent: YES,

        enterState: function() {
        	SC.Logger.log('ENTERED STATE')
            //EurekaJView.EurekaJStore.find(EurekaJView.LOGGED_IN_USER_QUERY);
        	//
        	//
        	
        	EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_TREE_QUERY);
        	
        	EurekaJView.InstrumentationTreeController.set('content', EurekaJView.EurekaJStore.find(SC.Query.local(EurekaJView.InstrumentationTreeModel, 'name = {name}', {name: '% Used'})));
        }
    })

});

EurekaJView.statechart.initStatechart();