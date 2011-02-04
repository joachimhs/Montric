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

EurekaJView.TimePeriodPaneView = SC.View.extend(
    /** @scope EurekaJView.TimePeriodPaneView.prototype */ {

    defaultResponder: EurekaJView,
    childViews: 'timePeriodContainerView'.w(),
    backgroundColor: '#FFFFFF',

    timePeriodContainerView: EurekaJView.ChartOptionsView.design({
        layout: { top: 0, left: 0, height: 90, right: 0 }
    }).classNames('thinBlackBorderBottom')

});
