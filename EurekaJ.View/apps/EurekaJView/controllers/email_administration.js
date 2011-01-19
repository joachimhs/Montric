// ==========================================================================
// Project:   EurekaJView.alertAdministrationController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.emailAdministrationController = SC.ArrayController.create(
    /** @scope EurekaJView.alertAdministrationController.prototype */ {

    newEmailGroupName: null,
    showEditAlertView: NO,
    allowsMultipleSelection: NO,

    observesSelection: function(){
        if (this.getPath('selection.firstObject.emailGroupName')  != undefined) {
            this.set('showEditAlertView', YES);
       } else {
            this.set('showEditAlertView', NO);
        }
    }.observes('selection')
});
