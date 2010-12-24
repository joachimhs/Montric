// ==========================================================================
// Project:   EurekaJView.ChartOptionsView
// Copyright: �2010 My Company, Inc.
// =======================================================================99===
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.ChartOptionsView = SC.View.extend(
    /** @scope EurekaJView.ChartOptionsView.prototype */
{
    childViews: 'timePeriodView'.w(),
    layout: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

    timePeriodView: SC.View.design({
        layout: {
            top: 0,
            height: 75,
            left: 0,
            right: 0
        },
        childViews: 'chartOptionsLabelView chartTimespanFieldView chartResolutionLabelView chartResolutionFieldView'.w(),
        backgroundColor: '#FFFFFF',

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
                width: 200
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
                width: 200
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

    })

});
