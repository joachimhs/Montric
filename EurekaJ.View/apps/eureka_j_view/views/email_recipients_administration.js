// ==========================================================================
// Project:   EurekaJView.EmailRecipientsAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.EmailRecipientsAdministrationView = SC.View.extend(
/** @scope EurekaJView.EmailRecipientsAdministrationView.prototype */ {

  childViews: 'labelView'.w(),
    layout: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

    labelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            height: 40,
            top: 25,
            left: 10,
            width: 200
        },
        controlSize: SC.LARGE_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        value: 'EMAIL RECIPIENTS'
    })

});
