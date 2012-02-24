setTimeout(function() {

    EurekaJ.stateManager = Ember.StateManager.create({
        rootElement: '#mainArea',
        initialState: 'showMainArea',

        showMainArea: Ember.ViewState.create({
            enter: function(stateManager) {
                this._super(stateManager);
                
                EurekaJ.store.findAll(EurekaJ.InstrumentationTreeItem);
                
                var tree = EurekaJ.Tree.create();
    			tree.set('name', 'INSTRUMENTATION MENU');
    			EurekaJ.InstrumentationTreeController.set('content', tree);
                EurekaJ.InstrumentationTreeController.initializeWithServerContent();
                
                console.log('entering showMainArea');
            },

            view: Em.ContainerView.create({
                childViews: ['eurekajTopView', 'eurkajTreeMenuView', 'eurkajMainView', 'eurkajConfigView'],
                
                eurekajTopView: Em.View.extend({
                	templateName: 'eurekaJTopTemplate'
                }), 
                
                eurkajTreeMenuView: Em.View.extend({
                	templateName: 'eurekaJTreeTemplate',
                	contentBinding: 'EurekaJ.InstrumentationTreeController.content'	
                }),
                
                eurkajMainView: Em.View.extend({
                	templateName: 'eurekaJMainView'
                }),
                
                eurkajConfigView: Em.View.extend({
                	templateName: 'eurekaJConfigView'
                })
            })
        })
    });

}, 50);