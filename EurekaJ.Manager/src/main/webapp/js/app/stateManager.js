setTimeout(function() {

    EurekaJ.stateManager = Ember.StateManager.create({
        rootElement: '#mainArea',
        initialState: 'showMainArea',

        showMainArea: Ember.ViewState.create({
            enter: function(stateManager) {
                this._super(stateManager);
                //EME.PhotoListController.set('content', EME.store.findAll(EME.Photo));
                EurekaJ.store.findAll(EurekaJ.InstrumentationTreeItem);
                console.log('entering showMainArea');
            },

            view: Em.ContainerView.create({
                childViews: ['eurekajTopView', 'eurkajTreeMenuView', 'eurkajMainView', 'eurkajConfigView'],
                
                eurekajTopView: Em.View.extend({
                	templateName: 'eurekaJTopTemplate'
                }), 
                
                eurkajTreeMenuView: Em.View.extend({
                	templateName: 'eurekaJTreeTemplate'
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