// ==========================================================================
// Project:   EurekaJView.ChartViewTwo
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.InstrumentationTreeView = SC.View.extend(
/** @scope EurekaJView.ChartViewTwo.prototype */
{
	childViews: 'instrumentationTreeLabelView instrumentationTreeScrollView'.w(),
    instrumentationTreeLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            height: 30,
            top: 5,
            left: 10
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'INSTRUMENTATION MENU'
    }).classNames(['greylabel', 'underlined']),

	instrumentationTreeScrollView: SC.ScrollView.extend({
        layout: {
            top: 25,
            bottom: 0,
            left: 2,
            width: 299
        },
        canScrollHorizontally: YES,
        hasHorizontalScroller: YES,

        contentView: SC.ListView.extend({
            layout: {
                width: 450
            },
            backgroundColor: '#F0F8FF',
            contentValueKey: "name",
            rowHeight: 18,
            borderStyle: SC.BORDER_NONE,
            isSelectable: NO,

            contentBinding: 'EurekaJView.InstrumentationTreeController.arrangedObjects',
            exampleView: EurekaJView.InstrumentationTreeListItem,
            recordType: EurekaJView.InstrumentationTreeModel
        })
    })
}).classNames(['thinBlackRightborder']);