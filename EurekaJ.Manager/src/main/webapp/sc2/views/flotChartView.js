var set = SC.set, get = SC.get;

EurekaJView.FlotChartView = SC.View.extend(
		/** @scope EurekaJView.FlotChartView */{
	options: {
            "xaxis": {
                "mode": "time",
                "timeformat": "%d/%m/%y %h:%M",
                "twelveHourClock": false
            },
            "yaxis": {
                "min": 0,
                tickFormatter: this.yaxisConverter
            },
            "series": {
                "lines": {
                    "show": true
                },
                "points": {
                    "show": true
                }
            },
            /*"lines": {
                fill: true
            },*/
            "grid": {
                "hoverable": true,
                "clickable": true
            },
            "crosshair": {
                "mode": "x"
            },
            "legend" : {
                "show": true,
                "position": "sw"
            }
        },
    data: null,
    chartid: null,
    
    classNames: ['flot-chart'],
        
	//defaultTemplate: SC.Handlebars.compile('<div {{bindAttr id="chartid"}} style="width:600px;height:300px;"></div>'),
	
	observesData: function() {
		var chartid = "#"  +this.get('elementId')
		if (this.get('data')) {
			SC.Logger.log('Setting new Data for chart: ' + this.get('data') + " for id: " + chartid);
			Flot.plot($(chartid), this.get('data'), this.get('options'));
		}
	}.observes('data')

});