// ==========================================================================
// Project:   EurekaJView.InstrumentationGroupsAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.InstrumentationGroupsAdministrationView = SC.View.extend(
/** @scope EurekaJView.InstrumentationGroupsAdministrationView.prototype */ {

    childViews: 'newInstrumentationGroupView instrumentationGroupSelectionScrollView instrumentationGroupContentView'.w(),
    layout: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },

    newInstrumentationGroupView : SC.View.design({
        childViews: 'newInstrumentationGroupTextFieldView newInstrumentationGroupButtonView'.w(),
        layout: {top: 20, height: 30, left: 0, width: 200 },
        backgroundColor: "#ffffff",

        newInstrumentationGroupTextFieldView : SC.TextFieldView.design({
            layout: {top: 2, height: 24, centerY:0, width: 120, left: 2 },
            valueBinding: 'EurekaJView.instrumentationGroupAdminController.newInstrumentationGroupName'
        }),

        newInstrumentationGroupButtonView: SC.ButtonView.extend({
            layout: {left: 125, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
            title: "Add",
            action: 'EurekaJView.addnewInstrumentationGroupAction'
        })
    }).classNames('thinBlackBorder'),

    instrumentationGroupSelectionScrollView: SC.ScrollView.design({
        layout: {top: 50, bottom: 0, left: 0, width: 200 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
            backgroundColor: '#F0F8FF',
           contentBinding: 'EurekaJView.instrumentationGroupAdminController.arrangedObjects',
            selectionBinding: 'EurekaJView.instrumentationGroupAdminController.selection',
            contentValueKey: "instrumentaionGroupName",
            selectionDelegate: EurekaJView.instrumentationGroupSelectionDelegate
        })
    }),

    instrumentationGroupContentView: SC.View.extend({
        childViews: ['instrumentationGroupChartSelectScrollView', 'addSelectedChartsButtonView', 'chartGroupSelectionScrollView', 'saveInstrumentationGroupButtonView'],
        isVisibleBinding: 'EurekaJView.instrumentationGroupAdminController.showEditInstrumentationGroupView',

        layout: {top: 20, bottom: 0, right: 0, left: 215},

        /*instrumentationGroupSourceLabelView: SC.LabelView.extend({
            layout: {left: 10, right: 20, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Select multiple charts to group:'
        }).classNames('blacklabel'),*/

        instrumentationGroupChartSelectScrollView: SC.ScrollView.design({
            layout: {left: 10, right: 20, top: 0, height: 180},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,


            contentView: SC.ListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                rowHeight: 18,
                isSelectable: NO,

                contentBinding: 'EurekaJView.instumentationGroupChartController.arrangedObjects',
                //selectionBinding: 'EurekaJView.instumentationGroupChartController.selection'
                //selectionDelegate: EurekaJView.instrumentationGroupSelectionDelegate

                exampleView: EurekaJView.InstrumentationGroupListItem,
                recordType: EurekaJView.AdminstrationTreeModel
            })
        }),

        addSelectedChartsButtonView: SC.ButtonView.design({
            layout: {left: 10, width: 200, top: 190, height: 25},
            title: "Add selected charts to group",
            action: "EurekaJView.addSelectedChartsToChartGroup"
        }),

        chartGroupSelectionScrollView: SC.ScrollView.design({
           layout: {left: 10, right: 20, top: 220, bottom: 40},
           hasHorizontalScroller: YES,
           hasVerticalScroller: YES,


           contentView: SC.ListView.extend({
               allowsMultipleSelection: NO,
               backgroundColor: '#F0F8FF',
               contentValueKey: "guiPath",
               rowHeight: 18,
               canDeleteContent: YES,
               contentBinding: 'EurekaJView.selectedInstrumentationGroupController.arrangedObjects',
               selectionBinding: 'EurekaJView.instumentationGroupChartController.selection'
           })
       }),

        saveInstrumentationGroupButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 300, bottom: 10, height: 25},
            title: "Save All Instrumentation Group Changes",
            action: "EurekaJView.saveInformationGroupsAction"
        })
    })

});
