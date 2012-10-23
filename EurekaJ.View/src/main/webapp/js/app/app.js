Ember.ENV.RAISE_ON_DEPRECATION = true;

var EurekaJ = Ember.Application.create({
    log: function(message) {
        if (window.console) console.log(message);
    }
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
});

EurekaJ.Serializer = DS.Serializer.extend({
    addBelongsTo: function(hash, record, key, relationship) {
        hash[key] = record.get(key + ".id");
    },

    addHasMany: function(hash, record, key, relationship) {
        hash[key] = record.get(key).getEach('id');
    }
}),

EurekaJ.Adapter = DS.Adapter.create({
    serializer: EurekaJ.Serializer.create(),

    findAll: function(store, type) {
        var url = type.url;

        EurekaJ.log('finding all: type: ' + type + ' url: ' + url);

        $.ajax({
        	  type: 'GET',
        	  url: url,
        	  contentType: 'application/json',
        	  success: function(data) { EurekaJ.store.loadMany(type, data); }
        	});
    },
    
    find: function(store, type, id) {
    	var url = type.url;

        var requestStringJson = {};
        requestStringJson.id = id;

        EurekaJ.log('finding: type: ' + type + ' id: ' + id + ' url: ' + url);

        $.ajax({
      	  type: 'GET',
      	  url: url,
      	  data: JSON.stringify(requestStringJson, null, '\t').replace(/\%/g,'%25'),
      	  contentType: 'application/json',
      	  success: function(data) { EurekaJ.store.load(type, data); }
      	});
    },

    findQuery: function(store, type, query, modelArray) {
        EurekaJ.log('FINDQUERY');
        EurekaJ.log(query);
        EurekaJ.log(modelArray);
    },

    updateRecord: function(store, type, model) {
        var url = type.url;

        EurekaJ.log('updating record: type: ' + type + ' id: ' + model.get('id') + ' url: ' + url);
        EurekaJ.log('json: ' + JSON.stringify(model.toJSON({ includeId: true })));

        jQuery.ajax({
            url: url,
            data: JSON.stringify(model.toJSON({ includeId: true })),
            dataType: 'json',
            type: 'PUT',

            success: function(data) {
                // data is a hash of key/value pairs representing the record
                // in its current state on the server.
                store.didSaveRecord(model, data);
            }
        });
    },

    createRecord: function(store, type, model) {
        var url = type.url;

        EurekaJ.log('updating record: type: ' + type + ' id: ' + model.get('id') + ' url: ' + url);
        EurekaJ.log('json: ' + JSON.stringify(model.toJSON({ includeId: true })));

        jQuery.ajax({
            url: url,
            data: JSON.stringify(model.toJSON({ includeId: true })),
            dataType: 'json',
            type: 'POST',

            success: function(data) {
                // data is a hash of key/value pairs representing the record.
                // In general, this hash will contain a new id, which the
                // store will now use to index the record. Future calls to
                // store.find(type, id) will find this record.
                store.didCreateRecord(model, data);
            }
        });
    },

    deleteRecord: function(store, type, model) {
        var url = type.url;

        jQuery.ajax({
            url: url,
            dataType: 'json',
            data: JSON.stringify(model.toJSON({ includeId: true })),
            type: 'DELETE',

            success: function() {
                store.didDeleteRecord(model);
            }
        });
    }
});

//EurekaJ.Adapter.map('EurekaJ.AlertModel', { primaryKey: 'alertName' });
//EurekaJ.Adapter.map('EurekaJ.ChartGroupModel', {primaryKey: 'chartGroupName'});


EurekaJ.ajaxSuccess = function(data) {
	EurekaJ.Store.loadMany(type, data);
}

EurekaJ.store = DS.Store.create({
    adapter: EurekaJ.Adapter,
    //adapter:  DS.RESTAdapter.create({ bulkCommit: false }),
    revision: 6
});