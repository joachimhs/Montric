EurekaJ = Ember.Application.create({
    ready: function() {
        this._super();
    }
});

EurekaJ.Adapter = DS.Adapter.create({
    findAll: function(store, type) {
        var url = type.url;
        var requestStringJson = type.requestStringJson;
        
        $.ajax({
        	  type: 'POST',
        	  url: url,
        	  data: JSON.stringify(requestStringJson, null, '\t'),
        	  contentType: 'application/json',
        	  success: function(data) { var nodes = type.getData(data); EurekaJ.store.loadMany(type, nodes); }
        	});
    },
    
    find: function(store, type, id) {
    	var url = type.url;
    	
        var requestStringJson = type.requestStringJson;
        requestStringJson.getInstrumentationChartData.id = id;
        requestStringJson.getInstrumentationChartData.path = id;
        
        console.log('finding: type: ' + type + ' id: ' + id + ' url: ' + url);
        
        $.ajax({
      	  type: 'POST',
      	  url: url,
      	  data: JSON.stringify(requestStringJson, null, '\t'),
      	  contentType: 'application/json',
      	  success: function(data) { EurekaJ.store.load(type, id, type.getData(data)); }
      	});
    }
});

EurekaJ.ajaxSuccess = function(data) {
	EurekaJ.store.loadMany(type, data);
}

EurekaJ.store = DS.Store.create({
    adapter: EurekaJ.Adapter
});