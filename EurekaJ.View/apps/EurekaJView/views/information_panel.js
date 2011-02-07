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
    childViews: 'informationPanelTabView dateSelector timeSelector'.w(),

    informationPanelTabView: SC.TabView.design({
        layout: {
            top: 0,
            height: 120,
            left: 5,
            right: 5
        },
        nowShowing: 'EurekaJView.LiveStatisticsOptionsView',
        itemTitleKey: 'title',
        itemValueKey: 'value',
        items: [
            {title: 'Live', value: 'EurekaJView.LiveStatisticsOptionsView'},
            {title: 'Historical', value: 'EurekaJView.HistoricalStatisticsOptionsView'}
        ]

    }),

    timeSelector: SCUI.TimeSelectorFieldView.design({
        layout: {
            top: 130,
            height: 20,
            left: 100,
            width: 90
        }
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
