/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.instrumentationTreeAdminTreeController = SC.TreeController.create(
    /** @scope EurekaJView.instrumentationTreeAdminTreeController.prototype */ {

    allowsMultipleSelection: NO,

    populate: function() {
    	SC.Logger.log('instrumentationTreeAdminTreeController populate');
        var rootNode = SC.Object.create({
            treeItemIsExpanded: YES,
            name: "Instrumentations",
            treeItemChildren: function() {
                var query = SC.Query.local(EurekaJView.AdminstrationTreeModel, 'parentPath = {parentPath}', {parentPath: null});
                return EurekaJView.EurekaJStore.find(query);
            }.property()
        });

        this.set('content', rootNode)
    },
    
    getSelectedNodes: function() {
    	return EurekaJView.EurekaJStore.find(SC.Query.local(EurekaJView.AdminstrationTreeModel, 'isSelected = {isSelected}', {isSelected: YES}));
    },
    
    alertPaneDidDismiss: function(pane, status) {
        switch(status) {
          case SC.BUTTON1_STATUS:
            //EurekaJView.deleteSelectedEmailGroupApprovedAction();
        	  SC.Logger.log('Deleting nodes!!');
        	  EurekaJView.confirmDeleteSelectedInstrumentationNodes();
            break;

          case SC.BUTTON2_STATUS:
            //Cancel... Noting to do really
            break;
        }
    }

});
