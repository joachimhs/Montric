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
        childViews: 'chartOptionsContainerView flotChartGrid topView bottomView instrumentationTreeView instrumentationTreeScrollView chartSelectorView'.w(),

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
            })
        }),

        chartOptionsContainerView: SC.ContainerView.design({
            layout: {
                top: 39,
                height: 100,
                left: 306,
                right: 0
            },
            nowShowing: 'EurekaJView.ChartOptionsView'
        }),

        flotChartGrid: SC.GridView.extend({
            layout: {
                top: 140,
                right: 0,
                bottom: 40,
                left: 306
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
            }
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
            })
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

            })
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
                    selectionBinding: 'EurekaJView.chartSelectorController.selection'
                    //				contentCheckboxKey: "isSelected",
                })
            })
        }),

        bottomView: SC.ToolbarView.design({
            //childViews: 'selectedInstrumentationPathViewT'.w(),
            layout: {
                bottom: 0,
                left: 0,
                right: 0,
                height: 40
            },
            anchorLocation: SC.ANCHOR_BOTTOM
        })
    })

});
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('eureka_j_view');