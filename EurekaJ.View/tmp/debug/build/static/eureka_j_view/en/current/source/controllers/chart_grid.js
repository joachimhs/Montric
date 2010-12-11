// ==========================================================================
// Project:   EurekaJView.chartGridController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.chartGridController = SC.ArrayController.create(
    /** @scope EurekaJView.chartGridController.prototype */
{

    timer: null,
    selectedChartTimespan: 10,
    selectedChartResolution: 15,
    instrumentationGroupPanel: null,

    refreshData: function() {
        for (var i = 0; i < this.get('content').length; i++) {
            this.get('content').objectAt(i).refresh();
        }
    },

    triggerTimer: function() {
        SC.Logger.log('Triggering timer');
        if (this.get('timer')) {
            SC.Logger.log('Timer already started');
        } else {
            SC.Logger.log('Starting Timer');
            var timer = SC.Timer.schedule({
                target: EurekaJView.chartGridController,
                action: 'refreshData',
                interval: 15000,
                repeats: YES
            });
            this.set('timer', timer)
        }
    },

    observesChartTimespan: function() {
        this.refreshData();
    }.observes('selectedChartTimespan'),

    observesChartResolution: function() {
        this.refreshData();
    }.observes('selectedChartResolution'),

    showInstrumentationGroupsPanel: function() {
        SC.Logger.log('showing InstrumentationGroup Panel');
        var pane = SC.PanelPane.create({
            layout: {
                centerX: 0,
                width: 870,
                top: 175,
                bottom: 175
            },
            contentView: SC.View.design({
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
            })
        });
        pane.append();
        this.set('instrumentationGroupPanel', pane);
    }
});
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('eureka_j_view');