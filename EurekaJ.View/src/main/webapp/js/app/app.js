Ember.ENV.RAISE_ON_DEPRECATION = true;

var EurekaJ = Ember.Application.create({
});

//Removing the Camelcase-to-dash convention from Ember Data
DS.Model.reopen({
    namingConvention: {
        keyToJSONKey: function(key) {
            return key;
        },

        foreignKey: function(key) {
            return key;
        }
    }
});

DS.Model.reopen({
    reload: function() {
        if (!this.get('isDirty') && this.get('isLoaded')) {
            var store = this.get('store'),
                adapter = store.get('adapter');

            adapter.find(store, this.constructor, this.get('id'));
        }
    }
})

EurekaJ.Adapter = DS.Adapter.create({
    findAll: function(store, type) {
        var url = type.url;

        $.ajax({
        	  type: 'GET',
        	  url: url,
        	  contentType: 'application/json',
        	  success: function(data) {  EurekaJ.store.loadMany(type, data); }
        	});
    },
    
    find: function(store, type, id) {
    	var url = type.url;

        var requestStringJson = {};
        requestStringJson.id = id;
        
        console.log('finding: type: ' + type + ' id: ' + id + ' url: ' + url);
        
        $.ajax({
      	  type: 'GET',
      	  url: url,
      	  data: JSON.stringify(requestStringJson, null, '\t'),
      	  contentType: 'application/json',
      	  success: function(data) { EurekaJ.store.load(type, data); }
      	});
    },

    findQuery: function(store, type, query, modelArray) {
        console.log('FINDQUERY');
        console.log(query);
        console.log(modelArray);
    }
});

EurekaJ.ajaxSuccess = function(data) {
	EurekaJ.Store.loadMany(type, data);
}

EurekaJ.store = DS.Store.create({
    adapter: EurekaJ.Adapter,
    //adapter:  DS.RESTAdapter.create({ bulkCommit: false }),
    revision: 4
});