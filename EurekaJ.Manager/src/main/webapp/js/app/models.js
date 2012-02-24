EurekaJ.InstrumentationTreeItem = DS.Model.extend({
	
});

EurekaJ.InstrumentationTreeItem.reopen({
	primaryKey: 'guiPath',
    guiPath: DS.attr('string'),
    name: DS.attr('string'),
    isSelected: DS.attr('boolean'),
    parentPath: DS.attr('string'),
    hasChildren: DS.attr('boolean'),
    childrenNodes: DS.hasMany(EurekaJ.InstrumentationTreeItem),
	//chartGrid: DS.Record.toMany('EurekaJView.ChartGridModel'),
    nodeType: DS.attr('string')
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

EurekaJ.Node = Ember.Object.extend({
    name: null,
    children: [],
    nodeIsExpanded: true
  });

EurekaJ.Tree = EurekaJ.Node.extend({
    name: "",
    children: []
  });