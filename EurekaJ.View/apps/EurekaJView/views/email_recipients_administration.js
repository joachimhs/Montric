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

    childViews: 'newEmailGroupView emailGroupSelectionScrollView emailContentView'.w(),
    layout: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

    newEmailGroupView : SC.View.design({
        childViews: 'newEmailGroupTextFieldView newEmailGroupButtonView'.w(),
        layout: {top: 20, height: 30, left: 0, width: 200 },
        backgroundColor: "#ffffff",

        newEmailGroupTextFieldView : SC.TextFieldView.design({
            layout: {top: 2, height: 24, centerY:0, width: 120, left: 2 },
            valueBinding: 'EurekaJView.emailAdministrationController.newEmailGroupName'
        }),

        newEmailGroupButtonView: SC.ButtonView.extend({
            layout: {left: 125, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
            title: "Add",
            action: 'EurekaJView.addNewEmailGroupAction'
        })
    }).classNames('thinBlackBorder'),

    emailGroupSelectionScrollView: SC.ScrollView.design({
        layout: {top: 50, bottom: 0, left: 0, width: 200 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
            backgroundColor: '#F0F8FF',
            contentBinding: 'EurekaJView.emailAdministrationController.arrangedObjects',
            selectionBinding: 'EurekaJView.emailAdministrationController.selection',
            contentValueKey: 'emailGroupName'
            //selectionDelegate: EurekaJView.alertSelectionDelegate
        })
    }),

    emailContentView: SC.View.extend({
        childViews: 'smtpHostLabelView smtpHostTextfieldView smtpUsernameLabelView smtpUsernameTextfieldView smtpPasswordLabelView smtpPasswordTextfieldView smtpPortLabelView smtpPortTextfieldView smtpSSLLabelView smtpSSLTextfieldView emailRecipieltsHeadlineLabelView emailRecipientsView saveEmailButtonView'.w(),
        isVisibleBinding: 'EurekaJView.emailAdministrationController.showEditAlertView',
        layout: {top: 20, bottom: 0, right: 0, left: 215},


        smtpHostLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Host:'
        }).classNames('blacklabel'),

        smtpHostTextfieldView: SC.TextFieldView.extend({
            layout: {left: 110, right: 10, top: 0, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpHost"
        }),

        smtpUsernameLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Username:'
        }).classNames('blacklabel'),

        smtpUsernameTextfieldView: SC.TextFieldView.extend({
            layout: {left: 110, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpUsername"
        }),

        smtpPasswordLabelView: SC.LabelView.extend({
            layout: {left: 230, width: 100, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Password:'
        }).classNames('blacklabel'),

        smtpPasswordTextfieldView: SC.TextFieldView.extend({
            layout: {left: 350, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpPassword"
        }),

        smtpPortLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Port:'
        }).classNames('blacklabel'),

        smtpPortTextfieldView: SC.TextFieldView.extend({
            layout: {left: 110, width: 100, top: 50, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpPort"
        }),

        smtpSSLLabelView: SC.LabelView.extend({
            layout: {left: 230, width: 100, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Use SSL ?:'
        }).classNames('blacklabel'),

        smtpSSLTextfieldView: SC.TextFieldView.extend({
            layout: {left: 350, width: 100, top: 50, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpUseSSL"
        }),

        emailRecipieltsHeadlineLabelView: SC.LabelView.design({
            layout: {left: 10, width: 200, top: 75, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Email Recipients:'
        }).classNames('blacklabel'),

        emailRecipientsView: SC.View.design({
            childViews: 'newEmailRecipientGroupView emailRecipientsScrollView'.w(),
            layout: {left: 10, right: 20, top: 100, bottom: 40},
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#F0F8FF",


            newEmailRecipientGroupView : SC.View.design({
                childViews: 'newEmailRecipeintTextFieldView newEmailRecipeintButtonView'.w(),
                layout: {top: 0, height: 30, left: 0, right: 0 },
                backgroundColor: "#ffffff",

                newEmailRecipeintTextFieldView : SC.TextFieldView.design({
                    layout: {top: 2, height: 24, centerY:0, right: 100, left: 2 },
                    valueBinding: 'EurekaJView.emailRecipientsController.newEmailRecipent'
                }),

                newEmailRecipeintButtonView: SC.ButtonView.extend({
                    layout: {width: 90, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
                    title: "Add",
                    action: 'EurekaJView.addNewEmailRecipientAction'
                })
            }).classNames('thinBlackBorder'),

            emailRecipientsScrollView: SC.ScrollView.design({
                layout: {top: 35, bottom: 0, left: 0, right: 0 },
                hasHorizontalScroller: YES,
                hasVerticalScroller: YES,

                contentView: SC.ListView.extend({
                    backgroundColor: '#F0F8FF',
                    contentBinding: 'EurekaJView.emailRecipientsController.arrangedObjects',
                    selectionBinding: 'EurekaJView.emailRecipientsController.selection',
                    contentValueKey: 'emailAddress'
                    //selectionDelegate: EurekaJView.alertSelectionDelegate
                })
            })
        }),

        saveEmailButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 300, bottom: 10, height: 25},
            title: "Save All Email Group Changes",
            action: "EurekaJView.saveEmailAction"
        })
    })

});
