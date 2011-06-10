// ==========================================================================
// Project:   EurekaJView - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

// This page describes the main user interface for your application.
sc_require('views/informationPanel/information_panel');
sc_require('views/chart/chart_view');
sc_require('views/administration/administration_pane');
sc_require('views/instrumentationTree/instrumentation_tree_list_item');

EurekaJView.mainPage = SC.Page.design({

    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page 
    // load.

    instrumentationTreeView: SC.outlet('mainPane.instrumentationTreeView'),
    instrumentationTreeScrollView: SC.outlet('mainPane.instrumentationTreeView'),
    topView: SC.outlet('mainPane.topView'),
    flotChartGrid: SC.outlet('mainPane.flotChartGrid'),
    informationPanelView: SC.outlet('mainPane.informationPanelView'),

    mainPane: SC.MainPane.design({
        defaultResponder: EurekaJView,
        childViews: 'flotChartGrid topView instrumentationTreeView informationPanelView'.w(),

        topView: EurekaJView.TopView.design({
            isVisible: NO,
            layout: {top: 0, left: 0, right: 0, height: 75 },
            anchorLocation: SC.ANCHOR_TOP
        }).classNames('toolbarGradient'),

        flotChartGrid: EurekaJView.ChartGrid.design({
            layout: { top: 77, right: 200, bottom: 0, left: 306 }
        }).classNames(['whiteBackground']),

        informationPanelView: EurekaJView.InformationPanelView.design({
            layout: {top: 77, bottom: 0, right: 0, width: 199 },
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#F0F8FF"
        }).classNames(['thinBlackLeftborder']),

        instrumentationTreeView: EurekaJView.InstrumentationTreeView.design({
            isVisible: NO,
            layout: {top: 77, bottom: 0, left: 0, width: 305 },
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#F0F8FF"
    	}).classNames('thinBlackRightborder')
	}),

	adminPanelView: EurekaJView.AdministrationPaneView.design({
    	layout: { width: 700, centerX: 0, height: 500 }
	})
});
