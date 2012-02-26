EurekaJ.InstrumentationTreeItem = DS.Model.extend({
	
});

EurekaJ.InstrumentationTreeItem.reopen({
	primaryKey: 'guiPath',
    guiPath: DS.attr('string'),
    name: DS.attr('string'),
    isSelected: DS.attr('boolean'),
    isExpanded: false,
    parentPath: DS.attr('string'),
    hasChildren: DS.attr('boolean'),
    childrenNodes: DS.hasMany(EurekaJ.InstrumentationTreeItem),
	//chartGrid: DS.Record.toMany('EurekaJView.ChartGridModel'),
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