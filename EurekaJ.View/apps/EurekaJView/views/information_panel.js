// ==========================================================================
// Project:   EurekaJView.AdministrationPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
sc_require('views/calendar')
EurekaJView.InformationPanelView = SC.View.extend(
/** @scope EurekaJView.AdministrationPaneView.prototype */ {
    defaultResponder: EurekaJView,
    childViews: 'informationPanelTabView triggeredAlertHeadlineLabelView triggeredAlertScrollView'.w(),
    isVisible: NO,

    informationPanelTabView: SC.TabView.design({
        layout: {
            top: 0,
            height: 150,
            left: 5,
            right: 5
        },
        nowShowing: 'EurekaJView.LiveStatisticsOptionsView',
        itemTitleKey: 'title',
        itemValueKey: 'value',
        // itemActionKey: 'action',
        items: [
            {action: 'testAction', title: 'Live', value: 'EurekaJView.LiveStatisticsOptionsView'},
            {action: 'testAction', title: 'Historical', value: 'EurekaJView.HistoricalStatisticsOptionsView'}
        ]

    }),

    triggeredAlertHeadlineLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            centerX: 0,
            height: 30,
            top: 160,
            left: 5,
            right: 5
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'TRIGGERED ALERTS'
    }).classNames(['greylabel', 'underlined']),

    triggeredAlertScrollView: SC.ScrollView.design({
        layout: {
            top: 180,
            bottom: 25,
            left: 5,
            right: 5
        },

        contentView: SC.ListView.extend({
            layout: {
                width: 450
            },
            backgroundColor: '#F0F8FF',
            contentValueKey: "summaryContent",
            rowHeight: 18,
            borderStyle: SC.BORDER_NONE,
            isSelectable: NO,

            contentBinding: 'EurekaJView.triggeredAlertListController.arrangedObjects'
        })


    })

});
