// ==========================================================================
// Project:   EurekaJView.TimePeriodPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.HistoricalStatisticsOptionsView = SC.View.extend(
/** @scope EurekaJView.TimePeriodPaneView.prototype */ {

    defaultResponder: EurekaJView,
    childViews: 'chartOptionsHeadlineLabelView fromLabelView chartTimezoneLabelView chartTimezoneFieldView fromTextFieldView selectFromButtonView toLabelView toTextFieldView selectToButtonView chartResolutionLabelView chartResolutionFieldView applyHistoricalChangesButtonView '.w(),

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
        value: 'HISTORICAL CHART'
    }).classNames(['greylabel', 'underlined']),

	chartTimezoneLabelView: SC.LabelView.design({
		layout: {left: 5, height: 30, top: 45, width: 60},
		controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Timezone: '
	}).classNames('blacklabel'),
	
	chartTimezoneFieldView: SC.SelectFieldView.design({
        layout: {left: 70, height: 30, top: 45, right: 10},
        disableSort: YES,
		
        objectsBinding: 'EurekaJView.chartGridController.timezones',
        nameKey: 'timezoneName',
        valueKey: 'timezoneValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedTimeZoneOffset'
    }),

    fromLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 100,
            width: 40
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'From: '
    }).classNames('blacklabel'),

    fromTextFieldView : SC.TextFieldView.design({
        layout: {bottom: 100, height: 17, centerY:0, right: 30, left: 50 },
        valueBinding: 'EurekaJView.chartGridController.selectedChartFromString'
    }).classNames('smallTextfield'),

    selectFromButtonView: SC.ImageView.design(SCUI.SimpleButton, {
        layout: {bottom: 101, height: 16, centerY:0, right: 10, width: 16 },
        value: static_url('images/ej_select_calenar_icon_16.png'),
        toolTip: 'Select From Date'
        //title: 'Administration',
        //action: 'showAdministrationPaneAction'
    }),

    toLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 70,
            width: 40
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        textAlign: SC.ALIGN_LEFT,
        value: 'To: '
    }).classNames('blacklabel'),

    toTextFieldView : SC.TextFieldView.design({
        layout: {bottom: 70, height: 17, centerY:0, right: 30, left: 50 },
        valueBinding: 'EurekaJView.chartGridController.selectedChartToString'
    }).classNames('smallTextfield'),

    selectToButtonView: SC.ImageView.design(SCUI.SimpleButton, {
        layout: {bottom: 70, height: 16, centerY:0, right: 10, width: 16 },
        value: static_url('images/ej_select_calenar_icon_16.png'),
        toolTip: 'Select From Date'
        //title: 'Administration',
        //action: 'showAdministrationPaneAction'
    }),

    chartResolutionLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 35,
            width: 65
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Resolution: '
    }).classNames('blacklabel'),

    chartResolutionFieldView: SC.SelectFieldView.design({
        layout: {
            bottom: 35,
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
    }),

    applyHistoricalChangesButtonView: SC.ButtonView.extend({
        layout: {
            bottom: 5,
            height: 30,
            left: 70,
            right: 5
        },
        title: "Apply Changes",
        action: "EurekaJView.applyHistoricalChanges"
    })




});
