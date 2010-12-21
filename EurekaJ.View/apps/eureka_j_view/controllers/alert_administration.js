// ==========================================================================
// Project:   EurekaJView.alertAdministrationController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertAdministrationController = SC.ArrayController.create(SC.CollectionViewDelegate,
    /** @scope EurekaJView.alertAdministrationController.prototype */ {

    newAlertName: null,
    showEditAlertView: NO,
    allowsMultipleSelection: NO,

    addnewAlert: function() {
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.AlertModel, {alertName: this.get('newAlertName')});
        this.set('newAlertName', '');


    },

    updateAlerts: function() {
        this.set('content', EurekaJView.EurekaJStore.find(EurekaJView.AlertModel));
    },

    observesSelection: function(){
        if (this.getPath('selection.firstObject.alertName')  != undefined) {
            this.set('showEditAlertView', YES);
            EurekaJView.alertChartController.populate();
       } else {
            this.set('showEditAlertView', NO);
        }
    }.observes('selection'),

    saveAlert: function() {
        EurekaJView.EurekaJStore.commitRecords();
    },

    //Delegate methods
    collectionViewSelectionForProposedSelection: function(view, sel) {
        SC.Logger.log('alertAdministrationController Delegate: collectionViewSelectionForProposedSelection: ' + sel);
        //EurekaJView.alertChartController.set('selection', sel);
      return sel ;
    },

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        SC.Logger.log('alertAdministrationController Delegate: collectionViewShouldSelectIndexes: ' + indexes);
      return indexes;
    },

    collectionViewShouldDeselectIndexes: function (view, indexes) {
        SC.Logger.log('alertAdministrationController Delegate: collectionViewShouldDeselectIndexes: ' + indexes);
      return indexes;
    },

    collectionViewShouldDeleteIndexes: function(view, indexes) {
        SC.Logger.log('alertAdministrationController Delegate: collectionViewShouldDeleteIndexes: ' + indexes);
     return indexes;
   },

    collectionViewDeleteContent: function(view, content, indexes) {
        SC.Logger.log('alertAdministrationController Delegate: collectionViewDeleteContent: ' + content);
     if (!content) return NO ;

     if (SC.typeOf(content.destroyAt) === SC.T_FUNCTION) {
       content.destroyAt(indexes);
       view.selectPreviousItem(NO, 1) ;
       return YES ;

     } else if (SC.typeOf(content.removeAt) === SC.T_FUNCTION) {
       content.removeAt(indexes);
       view.selectPreviousItem(NO, 1) ;
       return YES;

     } else return NO ;
   }
});
