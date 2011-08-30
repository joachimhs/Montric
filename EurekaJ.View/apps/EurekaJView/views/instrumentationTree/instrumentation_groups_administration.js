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

    childViews: 'newInstrumentationGroupView instrumentationGroupSelectionScrollView deleteAlertButtonView instrumentationGroupContentView'.w(),
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
            valueBinding: 'EurekaJView.chartGroupsAdminController.newInstrumentationGroupName'
        }),

        newInstrumentationGroupButtonView: SC.ButtonView.extend({
            layout: {left: 125, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
            title: "Add",
            action: 'EurekaJView.addnewInstrumentationGroupAction'
        })
    }).classNames('thinBlackBorder'),

    instrumentationGroupSelectionScrollView: SC.ScrollView.design({
        layout: {top: 50, bottom: 25, left: 0, width: 200 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
            backgroundColor: '#F0F8FF',
            contentBinding: 'EurekaJView.chartGroupsAdminController.arrangedObjects',
            selectionBinding: 'EurekaJView.chartGroupsAdminController.selection',
            contentValueKey: "instrumentaionGroupName",
            selectionDelegate: EurekaJView.chartGroupSelectionDelegate,
        })
    }),
    
    deleteAlertButtonView: SC.ButtonView.extend({
        layout: {left: 0, width: 200, height: 25, centerX: 0, bottom: 0, centerY: 0},
        title: "Delete Selected Chart Group",
        action: 'EurekaJView.deleteSelectedChartGroupAction'
    }),

    instrumentationGroupContentView: SC.View.extend({
        childViews: ['instrumentationGroupChartSelectScrollView', 'addSelectedChartsButtonView', 'chartGroupSelectionScrollView', 'saveInstrumentationGroupButtonView'],
        isVisibleBinding: 'EurekaJView.chartGroupsAdminController.showEditInstrumentationGroupView',

        layout: {top: 20, bottom: 0, right: 0, left: 215},

        instrumentationGroupChartSelectScrollView: SC.ScrollView.design({
            layout: {left: 10, right: 20, top: 0, height: 180},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,

            contentView: SC.ListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                rowHeight: 18,
                isSelectable: YES,

                contentBinding: 'EurekaJView.chartGroupChartsTreeController.arrangedObjects',
                exampleView: EurekaJView.InstrumentationGroupListItem,
                recordType: EurekaJView.AdminstrationTreeModel,
                action: 'EurekaJView.addSelectedChartsToChartGroup'
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
               contentBinding: 'EurekaJView.selectedChartGroupChartsController.arrangedObjects',
               selectionBinding: 'EurekaJView.selectedChartGroupChartsController.selection'
           })
       }),

        saveInstrumentationGroupButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 300, bottom: 10, height: 25},
            title: "Save Changes to all Chart Groups",
            action: "EurekaJView.saveInformationGroupsAction"
        })
    })

});
