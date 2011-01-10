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

    instrumentationTreeView: SC.outlet('mainPane.instrumentationTreeView'),
    instrumentationTreeScrollView: SC.outlet('mainPane.instrumentationTreeScrollView'),
    topView: SC.outlet('mainPane.topView'),
    flotChartGrid: SC.outlet('mainPane.flotChartGrid'),

    mainPane: SC.MainPane.design({
        defaultResponder: EurekaJView,
        childViews: 'flotChartGrid topView bottomView instrumentationTreeView instrumentationTreeScrollView'.w(),

        topView: SC.ToolbarView.design({
            childViews: 'logoView timePeriodButtonView administrationButtonView'.w(),
            isVisible: NO,
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


            timePeriodButtonView: SC.ButtonView.design({
                layout: {
                    right: 170,
                    width: 150,
                    height: 30,
                    centerY: 0
                },
                icon: 'sc-icon-options-16',
                title: 'TimePeriod',
                action: 'showTimeperiodPaneAction'
            }),

            administrationButtonView: SC.ButtonView.design({
                layout: {
                    right: 15,
                    width: 150,
                    height: 30,
                    centerY: 0
                },
                icon: 'sc-icon-tools-24',
                title: 'Administration',
                action: 'showAdministrationPaneAction'
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
                top: 41,
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
        }).classNames('thinBlackBorderTop'),

        instrumentationTreeView: SC.View.design({
            childViews: 'instrumentationTreeLabelView'.w(),
            isVisible: NO,
            layout: {
                top: 41,
                bottom: 41,
                left: 0,
                width: 306
            },
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#F0F8FF",


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
            }).classNames(['greylabel', 'underlined'])
        }).classNames(['thinBlackBorderTop', 'thinBlackRightborder']),

        instrumentationTreeScrollView: SC.ScrollView.extend({
            isVisible: NO,
            layout: {
                top: 71,
                bottom: 41,
                left: 2,
                width: 299
            },
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,

            contentView: SC.ListView.extend({
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                rowHeight: 18,
                borderStyle: SC.BORDER_NONE,

                contentBinding: 'EurekaJView.InstrumentationTreeController.arrangedObjects',
                selectionBinding: 'EurekaJView.InstrumentationTreeController.selection',
                selectionDelegate: EurekaJView.treeMenuSelectionDelegate
            }),

            borderStyle: SC.BORDER_NONE
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

    }),

    timePeriodView: EurekaJView.TimePeriodPaneView.design({
        layout: { width: 400, centerX: 0, height: 130 }
    }),

    adminPanelView: EurekaJView.AdministrationPaneView.design({
        layout: { width: 700, centerX: 0, height: 500 }
    })

});
