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
    }.observes('selection'),

    newEmailRecipientIsValid: function() {
        var newNameIsValid = (this.get('newEmailGroupName') && this.get('newEmailGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(emailRecipient) {
            if (emailRecipient.get('emailGroupName') == this.get('newEmailGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },
    
    alertPaneDidDismiss: function(pane, status) {
        switch(status) {
          case SC.BUTTON1_STATUS:
            EurekaJView.deleteSelectedEmailGroupApprovedAction();
            break;

          case SC.BUTTON2_STATUS:
            //Cancel... Noting to do really
            break;
        }
    }
});
