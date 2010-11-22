// ==========================================================================
// Project:   EurekaJView.instrumentationGroupController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.instrumentationGroupController = SC.ObjectController.create(
/** @scope EurekaJView.instrumentationGroupController.prototype */ {

  	pane: null,

    showPanelPane: function() {
        var pane = SC.PanelPane.create({
            layout: {
                left: 75,
				right: 75,
				top: 75,
				bottom: 75,
            },
            contentView: SC.View.extend({
                layout: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                },
                childViews: 'groupToolbarView mainContentView'.w(),
				
				groupToolbarView: SC.ToolbarView.extend({
					childViews: 'labelView'.w(),
					layout: {top: 0, left: 0, right: 0, height: 40 },
					anchorLocation: SC.ANCHOR_TOP,
					
					labelView: SC.LabelView.extend({
	                    layout: {centerY: 0, height: 40, top: 10, left: 10, width: 400 },
						controlSize: SC.REGULAR_CONTROL_SIZE,
						fontWeight: SC.BOLD_WEIGHT,
	                    valueBinding: 'EurekaJView.instrumentationChartController.selectedInstrumentationTypePath'
	                }).classNames('whitelabel'),
				}),
				
				mainContentView: SC.View.extend({
					childViews: 'instrumentationGroupLeft instrumentationGroupLeftScrollView hideInstrumentationGroupButtonView'.w(),
					layout: {top: 40, bottom: 0, right: 0, left: 0},
					
					instrumentationGroupLeft: SC.View.design({
						childViews: 'instrumentationGroupLabelView'.w(),
						layout: {top: 0, bottom: 43, left: 0, width: 306 },
						anchorLocation: SC.ANCHOR_TOP,
						backgroundColor: "#000000",

						instrumentationGroupLabelView: SC.LabelView.design({
							layout: {centerY: 0, height: 30, top: 8, left: 0 },
							controlSize: SC.LARGE_CONTROL_SIZE,
							fontWeight: SC.REGULAR_WEIGHT,
							textAlign: SC.ALIGN_CENTER,
							value: 'Instrumentation Groups'
						}).classNames('whitelabel'),
					}),
					
					instrumentationGroupLeftScrollView: SC.ScrollView.design({
						layout: {top: 40, bottom: 45, left: 2, width: 300 },
						hasHorizontalScroller: YES,
						hasVerticalScroller: YES,
						
						contentView: SC.ListView.extend({
							backgroundColor: '#F0F8FF'
						}),
					}),
					
					hideInstrumentationGroupButtonView: SC.ButtonView.extend({
	                    layout: {
	                        width: 80,
	                        bottom: 20,
	                        height: 24,
	                        centerX: 0
	                    },
	                    title: "Close",
	                    action: "remove",
	                    target: "EurekaJView.instrumentationGroupController.pane"
	                }),
				}),
                
            })
        });
        pane.append();
        this.set('pane', pane);
    }

}) ;
