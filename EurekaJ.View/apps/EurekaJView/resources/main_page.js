// ==========================================================================
// Project:   EurekaJView - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

// This page describes the main user interface for your application.
sc_require('views/time_period_pane');
sc_require('views/chart_options');
sc_require('views/chart_view');
sc_require('views/administration_pane');

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
        childViews: 'flotChartGrid topView instrumentationTreeView instrumentationTreeScrollView'.w(),

        topView: SC.View.design({
            childViews: 'logoView timePeriodButtonView timePeriodLabelView administrationButtonView administrationLabelView'.w(),
            isVisible: NO,
            layout: {
                top: 0,
                left: 0,
                right: 0,
                height: 75
            },
            anchorLocation: SC.ANCHOR_TOP,

            logoView: SC.LabelView.design({
                layout: {
                    top: 25,
                    height: 40,
                    left: 10,
                    width: 200
                },
                controlSize: SC.LARGE_CONTROL_SIZE,
                fontWeight: SC.BOLD_WEIGHT,
                value: 'EurekaJ Profiler'
            }),


            timePeriodButtonView: SC.ImageView.design(SCUI.SimpleButton, {
                layout: {right: 130, width: 49, height: 49, top: 5},
                value: static_url('images/ej_timeperiod_49.png'),
                toolTip: 'Time Period Administration',
                //title: 'Administration',
                action: 'showTimeperiodPaneAction'
            }),

            timePeriodLabelView: SC.LabelView.design(SCUI.SimpleButton, {
                layout: {right: 120, width: 100, height: 25, top: 55},
                value: 'Time Period',
                textAlign: SC.ALIGN_RIGHT,
                action: 'showTimeperiodPaneAction'

            }),

            administrationButtonView: SC.ImageView.design(SCUI.SimpleButton, {
                layout: {right: 25, width: 49, height: 49, top: 5},
                value: static_url('images/ej_tools_49.png'),
                toolTip: 'Administration',
                //title: 'Administration',
                action: 'showAdministrationPaneAction'
            }),

            administrationLabelView: SC.LabelView.design(SCUI.SimpleButton, {
                layout: {right: 10, width: 100, height: 25, top: 55},
                value: 'Administration',
                textAlign: SC.ALIGN_RIGHT,
                action: 'showAdministrationPaneAction'

            })
        }).classNames('toolbarGradient'),



        chartOptionsContainerView: SC.ContainerView.design({
            layout: {
                top: 75,
                height: 100,
                left: 306,
                right: 0
            },
            nowShowing: 'EurekaJView.ChartOptionsView'
        }),

        flotChartGrid: SC.GridView.extend({
            layout: {
                top: 77,
                right: 0,
                bottom: 0,
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
                top: 77,
                bottom: 0,
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
                top: 101,
                bottom: 0,
                left: 2,
                width: 299
            },
            canScrollHorizontally: YES,
            hasHorizontalScroller: YES,

            contentView: SC.SourceListView.extend({
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                rowHeight: 18,
                borderStyle: SC.BORDER_NONE,

                contentBinding: 'EurekaJView.InstrumentationTreeController.arrangedObjects',
                selectionBinding: 'EurekaJView.InstrumentationTreeController.selection',
                selectionDelegate: EurekaJView.treeMenuSelectionDelegate
            }),

            borderStyle: SC.BORDER_NONE
        })

    }),

    timePeriodView: EurekaJView.TimePeriodPaneView.design({
        layout: { width: 400, centerX: 0, height: 130 }
    }),

    adminPanelView: EurekaJView.AdministrationPaneView.design({
        layout: { width: 700, centerX: 0, height: 500 }
    })

});
