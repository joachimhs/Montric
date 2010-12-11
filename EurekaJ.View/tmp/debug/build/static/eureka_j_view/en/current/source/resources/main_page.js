// ==========================================================================
// Project:   EurekaJView - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

// This page describes the main user interface for your application.  
EurekaJView.mainPage = SC.Page.design({

    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page 
    // load.
    mainPane: SC.MainPane.design({
        childViews: 'middleView topView bottomView instrumentationTreeView instrumentationTreeScrollView chartSelectorView'.w(),

        topView: SC.ToolbarView.design({
            childViews: 'logoView'.w(),
            layout: {
                top: 0,
                left: 0,
                right: 0,
                height: 40
            },
            anchorLocation: SC.ANCHOR_TOP,

            logoView: SC.LabelView.design({
                layout: {
                    centerY: 0,
                    height: 40,
                    top: 5,
                    left: 10,
                    width: 200
                },
                controlSize: SC.LARGE_CONTROL_SIZE,
                fontWeight: SC.BOLD_WEIGHT,
                value: 'EurekaJ Profiler'
            }),
        }),

        middleView: SC.View.design({
            childViews: 'flotChartGrid chartOptionsView timePeriodView'.w(),
            hasHorizontalScroller: NO,
            layout: {
                top: 39,
                bottom: 39,
                left: 306,
                right: 0
            },
            backgroundColor: 'white',

            chartOptionsView: SC.View.design({
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
                    //				action: 'showPanelPane',
                    //	            target: 'EurekaJView.instrumentationGroupController'
                })
            }).classNames('thickBlackBorderTopAndBottom blackRightborder'),

            timePeriodView: SC.View.design({
                layout: {
                    top: 0,
                    height: 94,
                    left: 200,
                    right: 0
                },
                childViews: 'chartOptionsLabelView chartTimespanFieldView chartResolutionLabelView chartResolutionFieldView'.w(),
                backgroundColor: '#F0F8FF',

                chartOptionsLabelView: SC.LabelView.design({
                    layout: {
                        left: 5,
                        height: 17,
                        bottom: 35,
                        width: 100
                    },
                    controlSize: SC.NORMAL_CONTROL_SIZE,
                    //				fontWeight: SC.NORMAL_WEIGHT,
                    textAlign: SC.ALIGN_LEFT,
                    value: 'Chart Timespan: '
                }).classNames('blacklabel'),

                chartTimespanFieldView: SC.SelectFieldView.design({
                    layout: {
                        bottom: 35,
                        height: 30,
                        left: 110,
                        width: 200,
                    },
					disableSort: YES,

                    objects: [{
                        'timespanName': '10 minutes',
                        'timespanValue': 10
                    },
                    {
                        'timespanName': '20 minutes',
                        'timespanValue': 20
                    },
                    {
                        'timespanName': '30 minutes',
                        'timespanValue': 30
                    },
                    {
                        'timespanName': '1 hour',
                        'timespanValue': 60
                    },
                    {
                        'timespanName': '2 hours',
                        'timespanValue': 120
                    },
                    {
                        'timespanName': '6 hours',
                        'timespanValue': 360
                    },
                    {
                        'timespanName': '12 hours',
                        'timespanValue': 720
                    },
                    {
                        'timespanName': '24 hours',
                        'timespanValue': 1440
                    }],
                    nameKey: 'timespanName',
                    valueKey: 'timespanValue',

                    acceptsFirstResponder: function() {
                        return this.get('isEnabled');
                    }.property('isEnabled'),

                    valueBinding: 'EurekaJView.chartGridController.selectedChartTimespan',
                }),

                chartResolutionLabelView: SC.LabelView.design({
                    layout: {
                        left: 5,
                        height: 17,
                        bottom: 5,
                        width: 100
                    },
                    controlSize: SC.NORMAL_CONTROL_SIZE,
                    //				fontWeight: SC.NORMAL_WEIGHT,
                    textAlign: SC.ALIGN_LEFT,
                    value: 'Chart Resolution: '
                }).classNames('blacklabel'),

				chartResolutionFieldView: SC.SelectFieldView.design({
                    layout: {
                        bottom: 5,
                        height: 30,
                        left: 110,
                        width: 200,
                    },
					disableSort: YES,
					
                    objects: [{
                        'chartResolutionName': '15 seconds',
                        'chartResolutionValue': 15
                    },
                    {
                        'chartResolutionName': '30 seconds',
                        'chartResolutionValue': 30
                    },
                    {
                        'chartResolutionName': '45 seconds',
                        'chartResolutionValue': 45
                    },
                    {
                        'chartResolutionName': '1 minute',
                        'chartResolutionValue': 60
                    },
                    {
                        'chartResolutionName': '3 minutes',
                        'chartResolutionValue': 180
                    },
                    {
                        'chartResolutionName': '10 minutes',
                        'chartResolutionValue': 600
                    },
                    {
                        'chartResolutionName': '20 minutes',
                        'chartResolutionValue': 1200
                    },
                    {
                        'chartResolutionName': '40 minutes',
                        'chartResolutionValue': 2400
                    }],
                    nameKey: 'chartResolutionName',
                    valueKey: 'chartResolutionValue',

                    acceptsFirstResponder: function() {
                        return this.get('isEnabled');
                    }.property('isEnabled'),

                    valueBinding: 'EurekaJView.chartGridController.selectedChartResolution',
                }),

            }).classNames('thickBlackBorderTopAndBottom'),

            flotChartGrid: SC.GridView.extend({
                layout: {
                    top: 100,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                contentBinding: 'EurekaJView.chartGridController.arrangedObjects',
                selectOnMouseDown: NO,
                exampleView: EurekaJView.ChartView,
                recordType: EurekaJView.ChartGridModel,
                itemsPerRow: 1,
                isSelectable: NO,

                //extending Grid View to enable dynamic grid-height
                layoutForContentIndex: function(contentIndex) {
                    var frameHeight = this.get('clippingFrame').height;
                    var rowHeight = (frameHeight / this.get('content').get('length'));
                    SC.Logger.log('frameHeight: ' + frameHeight + ' content.length: ' + this.get('content').get('length') + ' rowHeight: ' + rowHeight);
                    var frameWidth = this.get('clippingFrame').width;
                    var itemsPerRow = this.get('itemsPerRow');
                    var columnWidth = Math.floor(frameWidth / itemsPerRow);

                    var row = Math.floor(contentIndex / itemsPerRow);
                    var col = contentIndex - (itemsPerRow * row);
                    return {
                        left: col * columnWidth,
                        top: row * rowHeight,
                        height: rowHeight,
                        width: columnWidth
                    };
                },
            }),

            /*testFlotChart: Flot.GraphView.design({
            layout: { top: 60, right: 20, bottom: 20, left: 20 },
			//data: [SC.Object.create({label: 'set1', data:[[0,0]]})],
            dataBinding: 'EurekaJView.chartGridController.arrangedObjects',
//            optionsBinding: 'EurekaJView.chartController.options',
//			options: SC.Object.create({}),
            debugInConsole: YES,
			showTooltip: YES,
        }),*/

            /*middleToolbarView: SC.ToolbarView.design({
			childViews: 'alertButtonView groupButtonView'.w(),
			layout: {top: 0, left: 0, right: 0, height: 40 },
			anchorLocation: SC.ANCHOR_TOP,
			
			alertButtonView: SC.ButtonView.design({
				layout: { centerY: 0, height: 30, left: 10, width: 150},
				title: "Alerts",
				action: 'showPanelPane',
	            target: 'EurekaJView.alertController'
			}),
			
			groupButtonView: SC.ButtonView.design({
				layout: { centerY: 0, height: 30, left: 165, width: 180},
				title: "Instrumentation Groups",
//				theme: "capsule",
				action: 'showPanelPane',
	            target: 'EurekaJView.instrumentationGroupController'
			})
		}),*/

            /*flotChartGrid: SC.GridView.design({
			//contentBinding: 'EurekaJView.chartController',
			//contentBinding: 'EurekaJView.instrumentationChartController.selectedInstrumentationTypePaths',
			isSelectable: NO,
			//exampleView: EurekaJView.GraphView,
			//contentValueKey: 'guiPath',
		}),
		
		testFlotChart: Flot.GraphView.design({
            layout: { top: 60, right: 20, bottom: 20, left: 20 },
			//data: [SC.Object.create({label: 'set1', data:[[0,0]]})],
            dataBinding: 'EurekaJView.chartController.chartSeries',
//            optionsBinding: 'EurekaJView.chartController.options',
//			options: SC.Object.create({}),
            debugInConsole: YES,
			showTooltip: YES,
        }),*/

        }),

        instrumentationTreeView: SC.View.design({
            childViews: 'instrumentationTreeLabelView'.w(),
            layout: {
                top: 41,
                bottom: 241,
                left: 0,
                width: 306
            },
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#000000",

            instrumentationTreeLabelView: SC.LabelView.design({
                layout: {
                    centerY: 0,
                    height: 30,
                    top: 5,
                    left: 10
                },
                controlSize: SC.LARGE_CONTROL_SIZE,
                fontWeight: SC.REGULAR_WEIGHT,
                textAlign: SC.ALIGN_CENTER,
                value: 'Instrumentation Menu'
            }),
        }),

        instrumentationTreeScrollView: SC.ScrollView.design({
            layout: {
                top: 71,
                bottom: 243,
                left: 2,
                width: 299
            },
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,

            contentView: SC.SourceListView.design({
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                rowHeight: 18,
                contentBinding: 'EurekaJView.InstrumentationTreeController.arrangedObjects',
                selectionBinding: 'EurekaJView.InstrumentationTreeController.selection'

            }),
        }),

        chartSelectorView: SC.View.design({
            layout: {
                height: 200,
                bottom: 41,
                left: 0,
                width: 306
            },
            childViews: 'chartSelectorLabelView chartSelectorScrollView'.w(),
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#000000",

            chartSelectorLabelView: SC.LabelView.design({
                layout: {
                    centerY: 0,
                    height: 30,
                    top: 5,
                    left: 10
                },
                controlSize: SC.LARGE_CONTROL_SIZE,
                fontWeight: SC.REGULAR_WEIGHT,
                textAlign: SC.ALIGN_CENTER,
                value: 'Available Charts'
            }),

            chartSelectorScrollView: SC.ScrollView.design({
                layout: {
                    height: 166,
                    bottom: 2,
                    left: 2,
                    width: 299
                },
                hasHorizontalScroller: YES,
                hasVerticalScroller: YES,

                contentView: SC.ListView.design({
                    backgroundColor: '#F0F8FF',
                    contentValueKey: "name",
                    contentBinding: 'EurekaJView.chartSelectorController.arrangedObjects',
                    selectionBinding: 'EurekaJView.chartSelectorController.selection',
                    //				contentCheckboxKey: "isSelected",
                }),
            }),
        }),

        bottomView: SC.ToolbarView.design({
            //childViews: 'selectedInstrumentationPathViewT'.w(),
            layout: {
                bottom: 0,
                left: 0,
                right: 0,
                height: 40
            },
            anchorLocation: SC.ANCHOR_BOTTOM,
        })
    })

});
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('eureka_j_view');