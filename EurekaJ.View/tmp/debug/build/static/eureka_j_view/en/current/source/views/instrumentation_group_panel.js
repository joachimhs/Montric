// ==========================================================================
// Project:   EurekaJView.InstrumentationGroupPanelView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.InstrumentationGroupPanelView = SC.View.extend(
    /** @scope EurekaJView.InstrumentationGroupPanelView.prototype */ {
    childViews: 'groupToolbarView mainContentView'.w(),
    layout: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },

    groupToolbarView: SC.ToolbarView.extend({
        childViews: 'labelView'.w(),
        layout: {top: 0, left: 0, right: 0, height: 40 },
        anchorLocation: SC.ANCHOR_TOP,

        labelView: SC.LabelView.extend({
            layout: {centerY: 0, centerX:0, height: 40, top: 10, width: 250 },
            controlSize: SC.LARGE_CONTROL_SIZE,
            fontWeight: SC.BOLD_WEIGHT,
            value: 'Instrumentation Groups'
        }).classNames('whitelabel')
    }),

    mainContentView: SC.View.extend({
        childViews: ['hideInstrumentationGroupButtonView'],
        layout: {top: 40, bottom: 0, right: 0, left: 0},


        hideInstrumentationGroupButtonView: SC.ButtonView.extend({
            layout: {
                width: 80,
                bottom: 20,
                height: 24,
                centerX: 0
            },
            title: "Close",
            action: "remove",
            target: "EurekaJView.chartGridController.instrumentationGroupPanel"
        })
    })
});
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('eureka_j_view');