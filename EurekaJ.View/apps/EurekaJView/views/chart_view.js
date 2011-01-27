// ==========================================================================
// Project:   EurekaJView.ChartViewTwo
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.ChartView = SC.View.extend(
/** @scope EurekaJView.ChartViewTwo.prototype */
{
	contentDisplayProperties: 'content'.w(),
    childViews: 'chartLabel chart'.w(),

    chartLabel: SC.LabelView.design({
        layout: {
			centerX: 0,
			left: 5,
			top: 5,
			right: 5,
			height: 30
        },
        controlSize: SC.LARGE_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
		textAlign: SC.ALIGN_CENTER,
        valueBinding: '.parentView.content.instrumentationNode'
    }),

	chart: Flot.GraphView.design({
        layout: { top: 30, right: 5, bottom: 5, left: 5 },
		seriesBinding: '.parentView.content',
		//data: [SC.Object.create({label: 'set1', data:[[1,1], [2,2]]})],
		debugInConsole: YES,
		showTooltip: YES
	})

});
