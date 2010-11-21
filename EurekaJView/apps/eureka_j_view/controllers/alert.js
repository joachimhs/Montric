// ==========================================================================
// Project:   EurekaJView.alertController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.alertController = SC.ObjectController.create(
/** @scope EurekaJView.alertController.prototype */
 {
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
                childViews: 'alertToolbarView mainContentView'.w(),
				
				alertToolbarView: SC.ToolbarView.extend({
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
					childViews: 'activeLabelView activeCheckboxView errorLabelView errorTextfieldView warningLabelView warningTextfieldView buttonView'.w(),
					layout: {top: 40, bottom: 0, right: 0, left: 0},
					
					activeLabelView: SC.LabelView.extend({
	                    layout: {left: 10, width: 150, top: 10, height: 30},
						controlSize: SC.REGULAR_CONTROL_SIZE,
	                    value: 'Activated',
	                }).classNames('blacklabel'),
					
					activeCheckboxView: SC.CheckboxView.extend({
						layout: {left: 160, width: 20, top: 10, height: 20},
					}),
					
					errorLabelView: SC.LabelView.extend({
	                    layout: {left: 10, width: 150, top: 35, height: 30},
						controlSize: SC.REGULAR_CONTROL_SIZE,
	                    value: 'Error Value',
	                }).classNames('blacklabel'),
	
					errorTextfieldView: SC.TextFieldView.extend({
						layout: {left: 160, width: 100, top: 35, height: 20},
					}),
					
					warningLabelView: SC.LabelView.extend({
	                    layout: {left: 300, width: 150, top: 35, height: 30},
						controlSize: SC.REGULAR_CONTROL_SIZE,
	                    value: 'Warning Value',
	                }).classNames('blacklabel'),
	
					warningTextfieldView: SC.TextFieldView.extend({
						layout: {left: 460, width: 100, top: 35, height: 20},
					}),
					
					alertTypeLabelView: SC.LabelView.extend({
	                    layout: {left: 10, width: 150, top: 60, height: 30},
						controlSize: SC.REGULAR_CONTROL_SIZE,
	                    value: 'Alert Type',
	                }).classNames('blacklabel'),
	
					errorTextfieldView: SC.TextFieldView.extend({
						layout: {left: 160, width: 100, top: 35, height: 20},
					}),
					
					buttonView: SC.ButtonView.extend({
	                    layout: {
	                        width: 80,
	                        bottom: 20,
	                        height: 24,
	                        centerX: 0
	                    },
	                    title: "Close",
	                    action: "remove",
	                    target: "EurekaJView.alertController.pane"
	                }),
				}),
                
            })
        });
        pane.append();
        this.set('pane', pane);
    }

});
