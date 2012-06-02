EurekaJ.ChartGridModel = DS.Model.extend({
	primaryKey: 'instrumentationNode',
    chart: DS.attr('string'),
    instrumentationNode: DS.attr('string'),
});

EurekaJ.ChartGridModel.reopenClass({
	url: '/chart',
	requestStringJson: {
            'getInstrumentationChartData': {
                'chartFrom': 1330435474564,
                'chartTo': 1330436674564,
                'chartResolution': 15,
                'chartOffsetMs': 2 * 60 * 60 * 1000
            }
        },
    getData: function(data) {
    	var chart = jQuery.parseJSON(data);
    	console.log(chart.instrumentationNode)
    	console.log(JSON.stringify(chart.chart));
    	
    	var chartRet = {};
    	chartRet.instrumentationNode = chart.instrumentationNode;
    	chartRet.chart = JSON.stringify(chart.chart);
 	   return chartRet;
    }
})

EurekaJ.InstrumentationTreeItem = DS.Model.extend({
	primaryKey: 'guiPath',
    guiPath: DS.attr('string'),
    name: DS.attr('string'),
    isSelected: DS.attr('boolean'),
    isExpanded: false,
    parentPath: DS.attr('string'),
    hasChildren: DS.attr('boolean'),
    childrenNodes: DS.hasMany('EurekaJ.InstrumentationTreeItem'),
	chartGrid: DS.hasMany('EurekaJ.ChartGridModel'),
    nodeType: DS.attr('string'),
    
    observesSelected: function() {
    	if (this.get('isSelected')) {
    		EurekaJ.selecedTreeNodesController.selectNode(this);
    	} else {
    		EurekaJ.selecedTreeNodesController.deselectNode(this);
    	}
    }.observes('isSelected'),
    
    guiPathTranslated: function() {
    	return this.get('guiPath').replace(/\:/g,'_').replace(/ /g, 'Ð');
    }.property('guiPath')
});

EurekaJ.InstrumentationTreeItem.reopenClass({
    url: '/instrumentationMenu',
    requestStringJson: {
            'getInstrumentationMenu': 'instrumentationMenu',
            'includeCharts': true
        },
   getData: function(data) {
	   return jQuery.parseJSON(data).instrumentationMenu;
   }
});