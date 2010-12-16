// ==========================================================================
// Project:   EurekaJView.AlertAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.AlertAdministrationView = SC.View.extend(
    /** @scope EurekaJView.AlertAdministrationView.prototype */ {

    childViews: 'newAlertView alertSelectionScrollView alertContentView'.w(),
    layout: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

    newAlertView : SC.View.design({
        childViews: 'newAlertTextFieldView newAlertButtonView'.w(),
        layout: {top: 20, height: 30, left: 0, width: 200 },
        backgroundColor: "#ffffff",

        newAlertTextFieldView : SC.TextFieldView.design({
            layout: {top: 2, height: 24, centerY:0, width: 120, left: 2 },
            valueBinding: 'EurekaJView.alertAdministrationController.newAlertName'
        }),

        newAlertButtonView: SC.ButtonView.extend({
            layout: {left: 125, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
            title: "Add",
            action: 'addnewAlert',
            target: 'EurekaJView.alertAdministrationController'
        })
    }).classNames('thinBlackBorder'),

    alertSelectionScrollView: SC.ScrollView.design({
        layout: {top: 50, bottom: 0, left: 0, width: 200 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
            backgroundColor: '#F0F8FF',
            contentBinding: 'EurekaJView.alertAdministrationController.arrangedObjects',
            selectionBinding: 'EurekaJView.alertAdministrationController.selection',
            contentValueKey: "alertName"
        })
    }),

    alertContentView: SC.View.extend({
        childViews: 'instrumentationNodeLabelView newAlertLabelView instrumentationNodeSelectFieldView activeLabelView activeCheckboxView errorLabelView errorTextfieldView warningLabelView warningTextfieldView alertTypeLabelView alertTypeSelectFieldView delayLabelView delayTextfieldView saveAlertButtonView'.w(),
        isVisibleBinding: 'EurekaJView.alertAdministrationController.showEditAlertView',
        layout: {top: 20, bottom: 0, right: 0, left: 215},

        instrumentationNodeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 200, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Instrumentation Source for alert:'
        }).classNames('blacklabel'),

        newAlertLabelView: SC.LabelView.extend({
            layout: {left: 210, width: 320, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            contentBinding: 'EurekaJView.alertAdministrationController.selectedAlert',
            contentValueKey: "alertName"
        }).classNames('blacklabel'),

        instrumentationNodeSelectFieldView: SC.SelectButtonView.extend({
            layout: {left: 10, right: 10, top: 20, height: 25},
            theme: 'square',
            nameKey: 'guiPath',
            valueKey: 'guiPath',
            objectsBinding: 'EurekaJView.administrationPaneController.instrumentationSourceNodes',
            contentBinding: 'EurekaJView.alertAdministrationController.selectedAlert',
            contentValueKey: 'alertInstrumentationNode',
            acceptsFirstResponder: function() {
                return this.get('isEnabled');
            }.property('isEnabled')
        }),

        activeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Activated:'
        }).classNames('blacklabel'),

        activeCheckboxView: SC.CheckboxView.extend({
            layout: {left: 90, width: 20, top: 50, height: 20},
            contentBinding: 'EurekaJView.alertAdministrationController.selectedAlert',
            contentValueKey: "alertActivated"
        }),


        errorLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 75, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Error Value:'
        }).classNames('blacklabel'),

        errorTextfieldView: SC.TextFieldView.extend({
            layout: {left: 90, width: 100, top: 75, height: 20},
            contentBinding: 'EurekaJView.alertAdministrationController.selectedAlert',
            contentValueKey: "alertErrorValue"
        }),

        warningLabelView: SC.LabelView.extend({
            layout: {left: 220, width: 100, top: 75, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Warning Value:'
        }).classNames('blacklabel'),

        warningTextfieldView: SC.TextFieldView.extend({
            layout: {left: 330, width: 100, top: 75, height: 20},
            contentBinding: 'EurekaJView.alertAdministrationController.selectedAlert',
            contentValueKey: "alertWarningValue"
        }),

        alertTypeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 100, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Type:'
        }).classNames('blacklabel'),

        alertTypeSelectFieldView: SC.SelectButtonView.extend({
            layout: {left: 90, width: 150, top: 100, height: 25},
            theme: 'square',
            nameKey: 'typeName',
            valueKey: 'alertType',

            objectsBinding: 'EurekaJView.administrationPaneController.alertTypes',
            contentBinding: 'EurekaJView.alertAdministrationController.selectedAlert',
            contentValueKey: 'alertType',
            disableSort: YES,
            acceptsFirstResponder: function() {
                return this.get('isEnabled');
            }.property('isEnabled')
        }),

        delayLabelView: SC.LabelView.extend({
            layout: {left: 220, width: 100, top: 100, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Delay:'
        }).classNames('blacklabel'),

        delayTextfieldView: SC.TextFieldView.extend({
            layout: {left: 330, width: 100, top: 100, height: 20},
            contentBinding: 'EurekaJView.alertAdministrationController.selectedAlert',
            contentValueKey: "alertDelay"
        }),

        saveAlertButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 150, bottom: 10, height: 25},
            title: "Save All Alert Changes",
            action: "saveAlert",
            target: "EurekaJView.alertAdministrationController"
        })

    })

});
