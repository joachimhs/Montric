// ==========================================================================
// Project:   EurekaJView.alertAdministrationController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.emailRecipientsController = SC.ArrayController.create(
    /** @scope EurekaJView.alertAdministrationController.prototype */ {

    newEmailRecipent: null,

    contentBinding: 'EurekaJView.editEmailGroupController.emailAddresses',
    
    newEmailRecipientIsValid: function() {
        var newEmailIsValid = (this.get('newEmailRecipent') && this.get('newEmailRecipent').length >= 5);

        var unique = true;
        this.get('content').forEach(function(emailAddress) {
            if (emailAddress.get('emailAddress') == this.get('newEmailRecipent')) {
                unique = false;
            }
        }, this);

        return unique && newEmailIsValid;
    }
})
;
