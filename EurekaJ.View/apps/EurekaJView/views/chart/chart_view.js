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
    childViews: 'chartLabel chart table'.w(),

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
        isVisibleBinding: '.parentView.content.isChart',
        layout: { top: 30, right: 5, bottom: 5, left: 5 },
		seriesBinding: '.parentView.content',
		//data: [SC.Object.create({label: 'set1', data:[[1,1], [2,2]]})],
		debugInConsole: NO,
		showTooltip: YES
	}),

    /*table: SC.TableView.design({
        isVisible: '.parentView.content.isTable',
        layout: { top: 30, right: 5, bottom: 5, left: 5 },

        columns: [
            SC.TableColumn.design({
                key: 'name',
                title: 'value',
                width: 200
            })
        ],

        contentBinding: '.parentView.content.table'

    })*/

    /*table: SC.ListView.design({
        isVisibleBinding: '.parentView.content.isTable',
        layout: { top: 30, right: 5, bottom: 5, left: 5 },
        backgroundColor: '#F0F8FF',
        contentValueKey: "listValue",
        rowHeight: 18,
        borderStyle: SC.BORDER_NONE,
        isSelectable: YES,

        contentBinding: '.parentView.content.table'
    }),   */

    table: SCTable.TableView.design({
      isVisibleBinding: '.parentView.content.isTable',
      layout: { top: 30, right: 5, bottom: 5, left: 5 },

      contentBinding: '.parentView.content.table',

      columnsBinding: 'EurekaJView.chartGridController.tableDataColumns'
    })

});
