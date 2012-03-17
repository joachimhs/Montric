EurekaJ.InstrumentationTreeController = Em.ArrayProxy.create({
	content: [],
	rootElement: null,
	
	initializeWithServerContent: function() {
		var root = EurekaJ.store.filter(EurekaJ.InstrumentationTreeItem, function(data) {
        	if (data.parentPath === null) { 
        		return true; 
        	}
        });
		
		this.set('rootElement', root);
	},
	
	rootElementObserver: Ember.observer(function() {
		var root = this.get('rootElement');
		
		if (root.get('length') > 0) {
			var content = [];

			for (index = 0; index < root.get('length'); index++) {
				console.log('pushing object: ' + root.objectAt(index).get('name'));
				content.pushObject(root.objectAt(index));
			}
			
			this.set('content', content);
		}
		
		
	}, 'rootElement.length')
});

EurekaJ.selecedTreeNodesController = Em.ArrayProxy.create({
	content: [],
	
	selectNode: function(node) {
		if (this.findSelectedNodeIndex(node) == 0) {
			this.get('content').pushObject(node);
			this.get('content').get('chartGrid');
		}
		
		this.resizeSelectedCharts()
	},
	
	deselectNode: function(node) {
		this.get('content').removeObject(node);
		this.resizeSelectedCharts();
	},
	
	findSelectedNodeIndex: function(node) {
        var content = this.get('content');

        for (index = 0; index < content.get('length'); index++) {
            if (node === content.objectAt(index)) {
                return index;
            }
        }

        return 0;
    },
    
    resizeSelectedCharts: function() {
    	var height = $("#chartView").height();
		if (EurekaJ.selecedTreeNodesController.get('content').get('length') > 0) {
			height = height / EurekaJ.selecedTreeNodesController.get('content').get('length');
		}
		
    	for (eIndex = 0; eIndex < this.get('content').get('length'); eIndex++) {
    		var element = this.get('content').objectAt(eIndex);
    		$("#" + element.get('guiPathTranslated')).css('height', height + 'px');    		
    	}
    	
    }
});

EurekaJ.nodeView = Ember.View.extend({
    templateName: 'tree-node',
    tagName: 'div'
    
});

EurekaJ.nodeContentView = Ember.View.extend({
	templateName: 'tree-node-content',
	tagName: 'span'
});

EurekaJ.nodeTextView = Ember.View.extend({
	templateName: 'tree-node-text',
	tagName: 'span',
	click: function(evt) {
    	this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
    }
});

EurekaJ.nodeArrowView = Ember.View.extend({
	templateName: 'tree-node-arrow',
	tagName: 'span',
	click: function(evt) {
    	this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
    }
});

EurekaJ.ChartView = Ember.View.extend({
	templateName: 'chart-view',
	
	didInsertElement: function() {
		this._super();
		console.log('chart content: ' + this.get('content').get('chartGrid').objectAt(0).get('chart'));
		//console.log('chart content: ' + this.get('content').get('chartGrid').objectAt(0).get('chart'));
		EurekaJ.selecedTreeNodesController.resizeSelectedCharts();
		$.plot($("#" + this.get('elementId')), jQuery.parseJSON(this.get('content').get('chartGrid').objectAt(0).get('chart')) , { yaxis: { min: 0 } });
	}
});
