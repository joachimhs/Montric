// ==========================================================================
// Project:   EurekaJView.TimePeriodPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */

sc_require('views/chart_options');

EurekaJView.TimePeriodPaneView = SC.SheetPane.extend(
    /** @scope EurekaJView.TimePeriodPaneView.prototype */ {
    defaultResponder: EurekaJView,

    contentView: SC.View.design({
        childViews: 'timePeriodContainerView hideTimeperiodPanelButtonView'.w(),
        backgroundColor: '#FFFFFF',

        timePeriodContainerView: EurekaJView.ChartOptionsView.design({
            layout: { top: 0, left: 0, bottom: 45, right: 0 }
        }),

        hideTimeperiodPanelButtonView: SC.ButtonView.extend({
            layout: {width: 80,bottom: 20,height: 24,centerX: 0},
            title: "Close",
            action: "hideTimeperiodPaneAction"
        })
    })

});
