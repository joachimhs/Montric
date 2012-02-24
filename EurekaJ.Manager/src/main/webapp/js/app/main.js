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
    	console.log(evt.currentTarget);
    	this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
    }
});
