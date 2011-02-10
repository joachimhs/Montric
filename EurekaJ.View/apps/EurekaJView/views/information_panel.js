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
    childViews: 'informationPanelTabView'.w(),

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

    dateSelector: EurekaJView.Calendar.design({
        layout: {
            top: 160,
            height: 220,
            left: 0,
            right: 0
        }
    })

});
