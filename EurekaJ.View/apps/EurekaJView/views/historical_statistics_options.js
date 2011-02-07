// ==========================================================================
// Project:   EurekaJView.TimePeriodPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.HistoricalStatisticsOptionsView = SC.View.extend(
    /** @scope EurekaJView.TimePeriodPaneView.prototype */ {

    defaultResponder: EurekaJView,
    childViews: 'historicalPeriodContainerView'.w(),

    childViews: 'chartOptionsHeadlineLabelView chartOptionsLabelView chartResolutionLabelView'.w(),

    chartOptionsHeadlineLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            centerX: 0,
            height: 30,
            top: 15,
            left: 10,
            right: 10
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'HISTORICAL CHART'
    }).classNames(['greylabel', 'underlined']),

    chartOptionsLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 35,
            width: 40
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'From: '
    }).classNames('blacklabel'),

    chartResolutionLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 5,
            width: 40
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'To: '
    }).classNames('blacklabel')




});
