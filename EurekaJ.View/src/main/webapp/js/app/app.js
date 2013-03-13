Ember.ENV.RAISE_ON_DEPRECATION = true;

var EurekaJ = Ember.Application.create({
    log: function(message) {
        if (window.console) console.log(message);
    }
});

EurekaJ.Adapter = DS.RESTAdapter.extend({
    find: function(store, type, id) {
        var root = this.rootForType(type);
        var queryString = "";

        if (type === EurekaJ.ChartModel){
            queryString = "?tz=" + EurekaJ.get('selectedTimezone');
            if (EurekaJ.get('showLiveCharts')) {
                queryString += "&ts=" + EurekaJ.get('selectedChartTimespan');
            } else {
                queryString += "&chartFrom=" + EurekaJ.get('selectedChartFromMs');
                queryString += "&chartTo=" + EurekaJ.get('selectedChartToMs');
            }
            queryString += "&rs=" + EurekaJ.get('selectedChartResolution');
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



EurekaJ.Adapter.map(EurekaJ.ChartSeriesModel, {
    seriesValues: { embedded: 'always' }
});

EurekaJ.Adapter.map(EurekaJ.ChartModel, {
    series: { embedded: 'always'}
});

EurekaJ.store = DS.Store.create({
    adapter:  EurekaJ.Adapter.create({ bulkCommit: false }),
    revision: 11
});