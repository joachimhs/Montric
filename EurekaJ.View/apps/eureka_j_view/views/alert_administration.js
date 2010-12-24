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
            contentValueKey: "alertName",
            selectionDelegate: EurekaJView.alertSelectionDelegate
        })
    }),

    alertContentView: SC.View.extend({
        childViews: 'activeLabelView activeCheckboxView errorLabelView errorTextfieldView warningLabelView warningTextfieldView alertTypeLabelView alertTypeSelectFieldView delayLabelView delayTextfieldView alertSourceLabelView saveAlertButtonView alertNotificationLabelView alertNotificationSelectFieldView alertChartSelectFieldView alertChartSelectScrollView'.w(),
        isVisibleBinding: 'EurekaJView.alertAdministrationController.showEditAlertView',
        layout: {top: 20, bottom: 0, right: 0, left: 215},

        /*instrumentationNodeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 200, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Instrumentation Source for alert:'
        }).classNames('blacklabel'),

        newAlertLabelView: SC.LabelView.extend({
            layout: {left: 210, width: 320, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: "alertName"
        }).classNames('blacklabel'),

        instrumentationNodeSelectFieldView: SC.SelectButtonView.extend({
            layout: {left: 10, right: 10, top: 20, height: 25},
            theme: 'square',
            nameKey: 'guiPath',
            valueKey: 'guiPath',
            objectsBinding: 'EurekaJView.administrationPaneController.instrumentationSourceNodes',
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: 'alertInstrumentationNode',
            acceptsFirstResponder: function() {
                return this.get('isEnabled');
            }.property('isEnabled')
        }),

        alertChartSelectFieldView: SC.ScrollView.design({
            layout: {left: 10, right: 10, top: 50, height: 90},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,


            contentView: SC.ListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                contentBinding: 'EurekaJView.alertChartController.arrangedObjects',

                selectionBinding: 'EurekaJView.alertChartController.selection',

                acceptsFirstResponder: function() {
                    return this.get('isEnabled');
                }.property('isEnabled')
            })
        }),              */

        activeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Activated:'
        }).classNames('blacklabel'),

        activeCheckboxView: SC.CheckboxView.extend({
            layout: {left: 90, width: 20, top: 0, height: 20},
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: "alertActivated"
        }),


        errorLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Error Value:'
        }).classNames('blacklabel'),

        errorTextfieldView: SC.TextFieldView.extend({
            layout: {left: 90, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: "alertErrorValue"
        }),

        warningLabelView: SC.LabelView.extend({
            layout: {left: 220, width: 100, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Warning Value:'
        }).classNames('blacklabel'),

        warningTextfieldView: SC.TextFieldView.extend({
            layout: {left: 330, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: "alertWarningValue"
        }),

        alertTypeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Type:'
        }).classNames('blacklabel'),

        alertTypeSelectFieldView: SC.SelectButtonView.extend({
            layout: {left: 90, width: 150, top: 50, height: 25},
            theme: 'square',
            nameKey: 'typeName',
            valueKey: 'alertType',

            objectsBinding: 'EurekaJView.administrationPaneController.alertTypes',
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: 'alertType',
            disableSort: YES,
            acceptsFirstResponder: function() {
                return this.get('isEnabled');
            }.property('isEnabled')
        }),

        delayLabelView: SC.LabelView.extend({
            layout: {left: 220, width: 100, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Delay:'
        }).classNames('blacklabel'),

        delayTextfieldView: SC.TextFieldView.extend({
            layout: {left: 330, width: 100, top: 50, height: 20},
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: "alertDelay"
        }),

        alertSourceLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 75, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Source:'
        }).classNames('blacklabel'),


        alertChartSelectFieldView: SC.SelectButtonView.extend({
            layout: {left: 10, right: 20, top: 90, height: 30},
            theme: 'square',
            nameKey: 'guiPath',
            valueKey: 'guiPath',
            objectsBinding: 'EurekaJView.alertChartController.arrangedObjects',
            contentBinding: 'EurekaJView.editAlertController.content',
            contentValueKey: 'alertInstrumentationNode',
            acceptsFirstResponder: function() {
                return this.get('isEnabled');
            }.property('isEnabled')
        }),


        alertChartSelectScrollView: SC.ScrollView.design({
            layout: {left: 10, right: 20, top: 120, height: 120},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,


            contentView: SC.ListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "guiPath",
                rowHeight: 18,
                contentBinding: 'EurekaJView.alertChartController.arrangedObjects',
                selectionBinding: 'EurekaJView.alertChartController.selection',
                selectionDelegate: EurekaJView.alertSelectionDelegate
            })
        }),

        alertNotificationLabelView: SC.LabelView.extend({
            layout: {left: 10, right: 20, top: 250, height: 25},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Notification:'
        }).classNames('blacklabel'),

        alertNotificationSelectFieldView: SC.ScrollView.design({
            layout: {left: 10, right: 20, top: 280, bottom: 40},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,


            contentView: SC.ListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                //contentBinding: 'EurekaJView.alertChartController.arrangedObjects',
                //selectionBinding: 'EurekaJView.alertChartController.selection',

                acceptsFirstResponder: function() {
                    return this.get('isEnabled');
                }.property('isEnabled')
            })
        }),

        saveAlertButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 150, bottom: 10, height: 25},
            title: "Save All Alert Changes",
            action: "saveAlert",
            target: "EurekaJView.alertAdministrationController"
        })

    })

});
