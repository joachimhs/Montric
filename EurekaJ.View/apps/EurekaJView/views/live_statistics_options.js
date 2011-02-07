// ==========================================================================
// Project:   EurekaJView.TimePeriodPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.LiveStatisticsOptionsView = SC.View.extend(
    /** @scope EurekaJView.TimePeriodPaneView.prototype */ {

    defaultResponder: EurekaJView,
    childViews: 'timePeriodContainerView'.w(),

    childViews: 'chartOptionsHeadlineLabelView chartOptionsLabelView chartTimespanFieldView chartResolutionLabelView chartResolutionFieldView'.w(),

    chartOptionsHeadlineLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            centerX: 0,
            height: 30,
            top: 15,
            left: 10,
            right: 10
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'LIVE CHART'
    }).classNames(['greylabel', 'underlined']),

    chartOptionsLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 35,
            width: 65
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Timespan: '
    }).classNames('blacklabel'),

    chartTimespanFieldView: SC.SelectFieldView.design({
        layout: {
            bottom: 35,
            height: 30,
            left: 70,
            right: 5
        },
        disableSort: YES,

        objects: [
            {
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
            }
        ],
        nameKey: 'timespanName',
        valueKey: 'timespanValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedChartTimespan'
    }),

    chartResolutionLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 5,
            width: 65
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Resolution: '
    }).classNames('blacklabel'),

    chartResolutionFieldView: SC.SelectFieldView.design({
        layout: {
            bottom: 5,
            height: 30,
            left: 70,
            right: 5
        },
        disableSort: YES,

        objects: [
            {
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
            }
        ],
        nameKey: 'chartResolutionName',
        valueKey: 'chartResolutionValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedChartResolution'
    })


});
