//Montric.Adapter = DS.FixtureAdapter.extend();

DS.RESTAdapter.registerTransform('raw', {
    deserialize: function(serialized) {
        return serialized;
    },
    serialize: function(deserialized) {
        return deserialized;
    }
});

Montric.Adapter = DS.RESTAdapter.extend({
    find: function(store, type, id) {
        var root = this.rootForType(type);
        var queryString = "";

        if (type === Montric.ChartModel){
            queryString = "?tz=" + Montric.get('selectedTimezone');
            if (Montric.get('showLiveCharts')) {
                queryString += "&ts=" + Montric.get('selectedChartTimespan');
            } else {
                queryString += "&chartFrom=" + Montric.get('selectedChartFromMs');
                queryString += "&chartTo=" + Montric.get('selectedChartToMs');
            }
            queryString += "&rs=" + Montric.get('selectedChartResolution');
        }

        this.ajax(this.buildURL(root, id) + queryString, "GET", {
            success: function(json) {
                Ember.run(this, function(){
                    console.log('got back: ' + json);
                    this.didFindRecord(store, type, json, id);
                });
            }
        });
    },

    findAll: function(store, type, since) {
        var root = this.rootForType(type);

        this.ajax(this.buildURL(root), "GET", {
            data: this.sinceQuery(since),
            success: function(json) {
                Ember.run(this, function(){
                    this.didFindAll(store, type, json);
                });
            }
        });
    }
});

Montric.Adapter.map(Montric.ChartSeriesModel, {
    seriesValues: { embedded: 'always' }
});

Montric.Adapter.map(Montric.ChartModel, {
    series: { embedded: 'always'}
});