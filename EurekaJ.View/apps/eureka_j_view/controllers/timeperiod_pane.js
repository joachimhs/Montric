// ==========================================================================
// Project:   EurekaJView.timeperiodPaneController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.timeperiodPaneController = SC.ObjectController.create(
    /** @scope EurekaJView.timeperiodPaneController.prototype */ {

    timePeriodPane : null,

    showTimeperiodPane:  function(view) {
        var pane = SC.SheetPane.create({
            layout: { width: 400, centerX: 0, height: 130 },

            contentView: SC.View.design({
                childViews: 'timePeriodContainerView hideTimeperiodPanelButtonView'.w(),
                backgroundColor: '#FFFFFF',

                timePeriodContainerView: EurekaJView.ChartOptionsView.design({
                    layout: { top: 0, left: 0, bottom: 45, right: 0 }
                }),

                hideTimeperiodPanelButtonView: SC.ButtonView.extend({
                    layout: {width: 80,bottom: 20,height: 24,centerX: 0},
                    title: "Close",
                    action: "remove",
                    target: "EurekaJView.timeperiodPaneController.timePeriodPane"
                })
            })
        })
        pane.append();
        this.set('timePeriodPane', pane);
    }

});
