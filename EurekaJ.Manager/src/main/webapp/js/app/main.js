EurekaJ.InstrumentationTreeController = Em.Object.create({
	content: null,
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
			var tree = this.get('content');

			var children = [];
			
			for (index = 0; index < root.get('length'); index++) {
				var elem = root.objectAt(index);
				console.log('elem name: ' + elem.get('name'));
				
				children.pushObject(EurekaJ.Node.create({nodeIsExpanded: true, name: elem.get('name'), children: []}));
			}
			
			tree.set('children', children);
		}
		
		
	}, 'rootElement.length')
});

EurekaJ.nodeView = Ember.View.extend({
    templateName: 'tree-node'
});
