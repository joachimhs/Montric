// ==========================================================================
// Project:   EurekaJView.ChartOptionsView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.ChartOptionsView = SC.View.extend(
/** @scope EurekaJView.ChartOptionsView.prototype */
{

    layout: {
        top: 0,
        height: 94,
        left: 0,
        width: 198
    },
    childViews: 'chartOptionsLabelView alertButtonView groupButtonView'.w(),
    backgroundColor: '#F0F8FF',

    chartOptionsLabelView: SC.LabelView.design({
        layout: {
            centerX: 0,
            height: 30,
            left: 2,
            top: 5,
            right: 2
        },
        controlSize: SC.LARGE_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'Chart Options'
    }).classNames('blacklabel'),

    alertButtonView: SC.ButtonView.design({
        layout: {
            centerX: 0,
            height: 30,
            left: 2,
            bottom: 35,
            right: 2
        },
        title: "Alerts",
        //				action: 'showPanelPane',
        //	            target: 'EurekaJView.alertController'
    }),

    groupButtonView: SC.ButtonView.design({
        layout: {
            centerX: 0,
            height: 30,
            left: 2,
            bottom: 5,
            right: 2
        },
        title: "Instrumentation Groups",
        //				theme: "capsule",
        //				action: 'showPanelPane',
        //	            target: 'EurekaJView.instrumentationGroupController'
    })

});
